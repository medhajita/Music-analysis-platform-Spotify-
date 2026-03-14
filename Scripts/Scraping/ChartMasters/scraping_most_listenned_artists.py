import requests
import re
import csv
from bs4 import BeautifulSoup

BASE_URL = "https://chartmasters.org"
PAGE_URL = f"{BASE_URL}/fr/artistes-auditeurs-mensuels-spotify/"
AJAX_URL = f"{BASE_URL}/wp-admin/admin-ajax.php?action=get_wdtable&table_id=74"
TABLE_ID = "74"
PAGE_SIZE = 25

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Referer": PAGE_URL,
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
}


def get_nonce(session):
    r = session.get(PAGE_URL, headers={"User-Agent": HEADERS["User-Agent"]})
    r.raise_for_status()
    match = re.search(rf'id="wdtNonceFrontendServerSide_{TABLE_ID}"[^>]*value="([^"]+)"', r.text)
    if match:
        return match.group(1)
    match = re.search(rf'value="([^"]+)"[^>]*id="wdtNonceFrontendServerSide_{TABLE_ID}"', r.text)
    if match:
        return match.group(1)
    raise ValueError(f"Could not find wdtNonce for table {TABLE_ID}. Check the page source.")


def build_payload(nonce, start, draw):
    columns = [
        ("",                  False, False),  # 0 blank
        ("",                  False, True),   # 1 rank
        ("pic",               False, False),  # 2 image
        ("artist",            True,  True),   # 3 artist name
        ("monthly_listeners", False, True),   # 4
        ("daily",             True,  True),   # 5
        ("monthly",           False, True),   # 6
        ("artist_spotify_id", False, False),  # 7
        ("country",           True,  False),  # 8
        ("genre",             True,  False),  # 9
        ("language",          True,  False),  # 10
        ("gender",            True,  False),  # 11
    ]

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

    for i, (name, searchable, orderable) in enumerate(columns):
        data[f"columns[{i}][data]"] = str(i)
        data[f"columns[{i}][name]"] = name
        data[f"columns[{i}][searchable]"] = "true" if searchable else "false"
        data[f"columns[{i}][orderable]"] = "true" if orderable else "false"
        data[f"columns[{i}][search][value]"] = ""
        data[f"columns[{i}][search][regex]"] = "false"

    return data


def parse_row(raw_row):
    cleaned = []
    for i, cell in enumerate(raw_row):
        cell = str(cell)
        if "<" in cell:
            soup = BeautifulSoup(cell, "html.parser")
            if i == 2:
                # Extract image URL from <img src="...">
                img = soup.find("img")
                cleaned.append(img["src"] if img and img.get("src") else "")
            else:
                a = soup.find("a")
                cleaned.append(a.get_text(strip=True) if a else soup.get_text(strip=True))
        else:
            cleaned.append(cell.strip())
    return cleaned


def fetch_page(session, nonce, start, draw):
    payload = build_payload(nonce, start, draw)
    r = session.post(AJAX_URL, data=payload, headers=HEADERS)
    r.raise_for_status()

    if not r.text.strip():
        raise ValueError(f"Empty response at start={start}. Status: {r.status_code}")

    return r.json()


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
        data = fetch_page(session, nonce, start, draw)

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


def save_csv(rows, filename="chartmasters_monthly_listeners.csv"):
    # 0=blank, 1=rank, 2=image_url, 3=artist, 4=monthly_listeners,
    # 5=daily_gain, 6=monthly_gain, 7=spotify_id,
    # 8=country, 9=genre, 10=language, 11=type
    keep    = [1,      2,           3,        4,                   5,            6,             7,            8,         9,       10,         11    ]
    headers = ["rank", "image_url", "artist", "monthly_listeners", "daily_gain", "monthly_gain","spotify_id", "country", "genre", "language", "type"]

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