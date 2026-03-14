import requests
import re
import csv
from bs4 import BeautifulSoup

BASE_URL = "https://chartmasters.org"
PAGE_URL = f"{BASE_URL}/fr/artistes-auditeurs-mensuels-spotify/"
AJAX_URL = f"{BASE_URL}/wp-admin/admin-ajax.php?action=get_wdtable&table_id=79"
TABLE_ID = "79"
PAGE_SIZE = 25

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": PAGE_URL,
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
}

# Columns: 0=blank, 1=rank, 2=artist, 3=value, 4=date,
#          5=spotify_id, 6=type, 7=country, 8=genre, 9=language
COLUMNS = [
    ("",                  False, False),  # 0 blank
    ("",                  False, True),   # 1 rank
    ("artist",            True,  True),   # 2 artist
    ("streams",           False, True),   # 3 number
    ("date",              False, False),  # 4 date
    ("artist_spotify_id", False, False),  # 5 spotify_id
    ("gender",            True,  False),  # 6 type
    ("country",           True,  False),  # 7 country
    ("genre",             True,  False),  # 8 genre
    ("language",          True,  False),  # 9 language
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
    for cell in raw_row:
        cell = str(cell)
        if "<" in cell:
            soup = BeautifulSoup(cell, "html.parser")
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


def save_csv(rows, filename="chartmasters_peak_listeners_artists.csv"):
    # 0=blank, 1=rank, 2=artist, 3=value, 4=date,
    # 5=spotify_id, 6=type, 7=country, 8=genre, 9=language
    keep    = [1,      2,        3,       4,      5,            6,      7,          8,       9         ]
    headers = ["rank", "artist", "peak", "date", "spotify_id", "type", "country",  "genre", "language"]

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