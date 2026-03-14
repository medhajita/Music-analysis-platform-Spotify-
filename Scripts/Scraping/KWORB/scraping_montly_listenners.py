import requests
import re
import csv
from bs4 import BeautifulSoup

BASE_URL = "https://kworb.net/spotify"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def scrape_page(url):
    r = requests.get(url, headers=HEADERS)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")

    rows = []
    for tr in soup.select("table tbody tr"):
        cols = tr.find_all("td")
        if len(cols) < 5:
            continue

        rank       = cols[0].get_text(strip=True)
        artist_tag = cols[1].find("a")
        artist     = artist_tag.get_text(strip=True) if artist_tag else cols[1].get_text(strip=True)

        # Extract spotify_id from href: artist/SPOTIFY_ID_songs.html
        spotify_id = ""
        if artist_tag:
            href = artist_tag.get("href", "")
            m = re.search(r'artist/([A-Za-z0-9]+)_songs\.html', href)
            if m:
                spotify_id = m.group(1)

        listeners    = cols[2].get_text(strip=True)
        daily_change = cols[3].get_text(strip=True)

        # Page 1 has 6 cols (with Peak rank): peak_listeners is col[5]
        # Pages 2+ have 5 cols (no Peak rank): peak_listeners is col[4]
        if len(cols) >= 6:
            peak_listeners = cols[5].get_text(strip=True)
        else:
            peak_listeners = cols[4].get_text(strip=True)

        rows.append([rank, artist, spotify_id, listeners, daily_change, peak_listeners])

    # Follow >>> next page link
    next_page = None
    for a in soup.find_all("a"):
        if ">>>" in a.get_text():
            href = a.get("href", "")
            next_page = f"{BASE_URL}/{href}"
            break

    return rows, next_page


def scrape_all():
    all_rows = []
    url = f"{BASE_URL}/listeners.html"
    page = 1

    while url:
        print(f"Scraping page {page}: {url}...", flush=True)
        rows, next_url = scrape_page(url)
        all_rows.extend(rows)
        print(f"  Got {len(rows)} artists (total: {len(all_rows)})")
        url = next_url
        page += 1

    return all_rows


def save_csv(rows, filename="kworb_spotify_listeners.csv"):
    headers = ["rank", "artist", "spotify_id", "monthly_listeners", "daily_change", "peak_listeners"]

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"\nSaved {len(rows)} rows -> {filename}")


if __name__ == "__main__":
    rows = scrape_all()
    save_csv(rows)