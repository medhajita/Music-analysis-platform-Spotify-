import requests
import re
import csv
import time
from bs4 import BeautifulSoup

BASE_URL = "https://chartmasters.org"
PAGE_URL = f"{BASE_URL}/spotify-most-streamed-albums/"
AJAX_URL = f"{BASE_URL}/wp-admin/admin-ajax.php?action=get_wdtable&table_id=7"
TABLE_ID = "7"
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
    ("artist_album", True,  True),   # 3 artist+album plain
    ("gender",       True,  False),  # 4 type
    ("album_artist", True,  True),   # 5 album+artist block
    ("streams",      False, True),   # 6 total streams
    ("weekly",       False, True),   # 7 weekly gain
    ("monthly",      False, True),   # 8 monthly gain
    ("genre",        True,  False),  # 9
    ("language",     True,  False),  # 10
    ("year",         False, True),   # 11 release year
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
    artist_spotify_id = ""
    album_spotify_id = ""

    for i, cell in enumerate(raw_row):
        cell = str(cell)
        if "<" in cell:
            soup = BeautifulSoup(cell, "html.parser")
            if i == 2:
                img = soup.find("img")
                cleaned.append(img["src"] if img and img.get("src") else "")
            elif i == 5:
                b = soup.find("b")
                album_title = b.get_text(strip=True) if b else ""
                artist_name = ""
                for a in soup.find_all("a"):
                    href = a.get("href", "")
                    m = re.search(r'artist_spotify_id=([A-Za-z0-9]+)', href)
                    if m:
                        artist_spotify_id = m.group(1)
                        artist_name = a.get_text(strip=True)
                    m2 = re.search(r'album_id=([A-Za-z0-9]+)', href)
                    if m2:
                        album_spotify_id = m2.group(1)
                cleaned.append(album_title)
                cleaned.append(artist_name)
                cleaned.append(artist_spotify_id)
                cleaned.append(album_spotify_id)
                continue
            else:
                a = soup.find("a")
                cleaned.append(a.get_text(strip=True) if a else soup.get_text(strip=True))
        else:
            cleaned.append(cell.strip())

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
    empty_streak = 0  # consecutive empty responses

    while True:
        print(f"Fetching rows {start}-{start + PAGE_SIZE - 1}...", end=" ", flush=True)

        # Re-fetch nonce every 500 rows to prevent expiry
        if start > 0 and start % 500 == 0:
            print("\nRefreshing nonce...")
            nonce = get_nonce(session)
            print(f"New nonce: {nonce}")

        payload = build_payload(nonce, start, draw)
        r = session.post(AJAX_URL, data=payload, headers=HEADERS)
        r.raise_for_status()

        if not r.text.strip():
            empty_streak += 1
            print(f"Empty response (streak: {empty_streak})")
            if empty_streak >= 3:
                print("3 consecutive empty responses, stopping.")
                break
            time.sleep(2)
            continue

        empty_streak = 0
        data = r.json()

        if total is None:
            total = int(data.get("recordsTotal", 0))
            print(f"(Total: {total} records)")
        else:
            print()

        rows = data.get("data", [])
        if not rows:
            empty_streak += 1
            print(f"No rows in response (streak: {empty_streak})")
            if empty_streak >= 3:
                print("3 consecutive empty responses, stopping.")
                break
            time.sleep(2)
            continue

        empty_streak = 0
        for row in rows:
            all_rows.append(parse_row(row))

        start += PAGE_SIZE
        draw += 1

        if start >= total:
            break

        time.sleep(0.3)  # be polite to the server

    return all_rows, total


def save_csv(rows, filename="chartmasters_most_streamed_albums.csv"):
    keep    = [1,      2,           5,             6,        7,                   8,                  4,      9,         10,            11,             12,      13,         14    ]
    headers = ["rank", "image_url", "album_title", "artist", "artist_spotify_id", "album_spotify_id", "type", "streams", "weekly_gain", "monthly_gain", "genre", "language", "year"]

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