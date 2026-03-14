import requests
import re
import csv
from bs4 import BeautifulSoup

BASE_URL = "https://chartmasters.org"
PAGE_URL = f"{BASE_URL}/most-streamed-songs-spotify/"
AJAX_URL = f"{BASE_URL}/wp-admin/admin-ajax.php?action=get_wdtable&table_id=46"
TABLE_ID = "46"
PAGE_SIZE = 25

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": PAGE_URL,
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
}

# 0=blank, 1=rank, 2=song_name(plain), 3=artist_name(plain), 4=image,
# 5=song+artist block (contains artist spotify_id in href), 6=streams,
# 7=weekly_gain, 8=year, 9=genre, 10=language
COLUMNS = [
    ("",             False, False),  # 0 blank
    ("",             False, True),   # 1 rank
    ("song",         True,  True),   # 2 song name plain
    ("artist",       True,  True),   # 3 artist name plain
    ("pic",          False, False),  # 4 image
    ("song_artist",  True,  True),   # 5 song+artist block (href has spotify_id)
    ("streams",      False, True),   # 6 total streams
    ("weekly",       False, True),   # 7 weekly gain
    ("year",         False, True),   # 8 release year
    ("genre",        True,  False),  # 9
    ("language",     True,  False),  # 10
]


def get_nonce(session):
    r = session.get(PAGE_URL, headers={"User-Agent": HEADERS["User-Agent"]})
    r.raise_for_status()
    match = re.search(rf'id="wdtNonceFrontendServerSide_{TABLE_ID}"[^>]*value="([^"]+)"', r.text)
    if match:
        return match.group(1)
    match = re.search(rf'value="([^"]+)"[^>]*id="wdtNonceFrontendServerSide_{TABLE_ID}"', r.text)
    if match:
        return match.group(1)
    raise ValueError(f"Could not find nonce for table {TABLE_ID}.")


def build_payload(nonce, start, draw):
    data = {
        "draw": str(draw),
        "order[0][column]": "0",
        "order[0][dir]": "asc",
        "start": str(start),
        "length": str(PAGE_SIZE),
        "search[value]": "",
        "search[regex]": "false",
        "wdtNonce": nonce,
        "sRangeSeparator": "|",
    }
    for i, (name, searchable, orderable) in enumerate(COLUMNS):
        data[f"columns[{i}][data]"] = str(i)
        data[f"columns[{i}][name]"] = name
        data[f"columns[{i}][searchable]"] = "true" if searchable else "false"
        data[f"columns[{i}][orderable]"] = "true" if orderable else "false"
        data[f"columns[{i}][search][value]"] = ""
        data[f"columns[{i}][search][regex]"] = "false"
    return data


def parse_row(raw_row):
    cleaned = []
    spotify_id = ""
    image_url = ""

    for i, cell in enumerate(raw_row):
        cell = str(cell)
        if "<" in cell:
            soup = BeautifulSoup(cell, "html.parser")
            if i == 4:
                # Extract image URL from <img src="...">
                img = soup.find("img")
                image_url = img["src"] if img and img.get("src") else ""
                cleaned.append(image_url)
            elif i == 5:
                # Extract spotify_id from href
                a = soup.find("a")
                if a:
                    href = a.get("href", "")
                    m = re.search(r'artist_spotify_id=([A-Za-z0-9]+)', href)
                    if m:
                        spotify_id = m.group(1)
                # Extract song title from <b> tag
                b = soup.find("b")
                cleaned.append(b.get_text(strip=True) if b else soup.get_text(strip=True))
            else:
                a = soup.find("a")
                cleaned.append(a.get_text(strip=True) if a else soup.get_text(strip=True))
        else:
            cleaned.append(cell.strip())

    # Insert spotify_id after cell 5 (index 6)
    cleaned.insert(6, spotify_id)
    return cleaned


def scrape_all():
    session = requests.Session()

    print("Fetching nonce...")
    nonce = get_nonce(session)
    print(f"Nonce: {nonce}")

    all_rows = []
    start = 0
    draw = 1
    total = None

    while True:
        print(f"Fetching rows {start}-{start + PAGE_SIZE - 1}...", end=" ", flush=True)

        payload = build_payload(nonce, start, draw)
        r = session.post(AJAX_URL, data=payload, headers=HEADERS)
        r.raise_for_status()

        if not r.text.strip():
            raise ValueError(f"Empty response at start={start}")

        data = r.json()

        if total is None:
            total = int(data.get("recordsTotal", 0))
            print(f"(Total: {total} records)")
        else:
            print()

        rows = data.get("data", [])
        if not rows:
            break

        for row in rows:
            all_rows.append(parse_row(row))

        start += PAGE_SIZE
        draw += 1

        if start >= total:
            break

    return all_rows, total


def save_csv(rows, filename="chartmasters_most_streamed_songs.csv"):
    # After parse_row, spotify_id inserted at index 6:
    # 0=blank, 1=rank, 2=song(plain), 3=artist(plain), 4=image_url, 5=song_title,
    # 6=spotify_id, 7=streams, 8=weekly_gain, 9=year, 10=genre, 11=language
    keep    = [1,      2,      3,        4,           6,            7,         8,             9,      10,      11        ]
    headers = ["rank", "song", "artist", "image_url", "spotify_id", "streams", "weekly_gain", "year", "genre", "language"]

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for row in rows:
            writer.writerow([row[i] if i < len(row) else "" for i in keep])

    print(f"\nSaved {len(rows)} rows -> {filename}")


if __name__ == "__main__":
    rows, total = scrape_all()
    print(f"\nScraped {len(rows)} / {total} records.")
    save_csv(rows)