import requests
import re
import csv
from bs4 import BeautifulSoup

BASE_URL = "https://chartmasters.org"
PAGE_URL = f"{BASE_URL}/most-streamed-artists-ever-on-spotify/"
AJAX_URL = f"{BASE_URL}/wp-admin/admin-ajax.php?action=get_wdtable&table_id=1"
TABLE_ID = "1"
PAGE_SIZE = 25

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": PAGE_URL,
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
}

COLUMNS = [
    ("",             False, False),  # 0 blank
    ("",             False, True),   # 1 rank
    ("pic",          False, False),  # 2 image
    ("artist",       True,  True),   # 3 artist plain
    ("artist",       True,  True),   # 4 artist link (contains spotify_id in href)
    ("solo_streams", False, True),   # 5
    ("Tracks",       False, True),   # 6
    ("1B",           False, True),   # 7
    ("100M",         False, True),   # 8
    ("10M",          False, True),   # 9
    ("1M",           False, True),   # 10
    ("feat_streams", False, True),   # 11
    ("gender",       True,  False),  # 12 type
    ("language",     True,  False),  # 13
    ("genre",        True,  False),  # 14
    ("country",      True,  False),  # 15
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

    for i, cell in enumerate(raw_row):
        cell = str(cell)
        if "<" in cell:
            soup = BeautifulSoup(cell, "html.parser")
            if i == 2:
                img = soup.find("img")
                cleaned.append(img["src"] if img and img.get("src") else "")
            elif i == 4:
                a = soup.find("a")
                if a:
                    href = a.get("href", "")
                    m = re.search(r'artist_spotify_id=([A-Za-z0-9]+)', href)
                    if m:
                        spotify_id = m.group(1)
                    cleaned.append(a.get_text(strip=True))
                else:
                    cleaned.append(soup.get_text(strip=True))
            else:
                a = soup.find("a")
                cleaned.append(a.get_text(strip=True) if a else soup.get_text(strip=True))
        else:
            cleaned.append(cell.strip())

    cleaned.insert(5, spotify_id)
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


def save_csv(rows, filename="chartmasters_most_streamed_artists_stats.csv"):
    # 0=blank, 1=rank, 2=image_url, 3=artist_plain, 4=artist, 5=spotify_id,
    # 6=solo_streams, 7=tracks, 8=1B, 9=100M, 10=10M, 11=1M, 12=feat_streams,
    # 13=type, 14=language, 15=genre, 16=country
    keep    = [1,      2,           4,        5,            6,              7,        8,    9,      10,    11,   12,             13,     14,         15,      16       ]
    headers = ["rank", "image_url", "artist", "spotify_id", "solo_streams", "tracks", "1B", "100M", "10M", "1M", "feat_streams", "type", "language", "genre", "country"]

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