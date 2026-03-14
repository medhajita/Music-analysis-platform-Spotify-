import requests
import re
import csv
import time
from bs4 import BeautifulSoup

BASE_URL = "https://kworb.net/spotify/country"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

COUNTRIES = {
    "us": "United States",
    "gb": "United Kingdom",
    "ad": "Andorra",
    "ar": "Argentina",
    "au": "Australia",
    "at": "Austria",
    "by": "Belarus",
    "be": "Belgium",
    "bo": "Bolivia",
    "br": "Brazil",
    "bg": "Bulgaria",
    "ca": "Canada",
    "cl": "Chile",
    "co": "Colombia",
    "cr": "Costa Rica",
    "cy": "Cyprus",
    "cz": "Czech Republic",
    "dk": "Denmark",
    "do": "Dominican Republic",
    "ec": "Ecuador",
    "eg": "Egypt",
    "sv": "El Salvador",
    "ee": "Estonia",
    "fi": "Finland",
    "fr": "France",
    "de": "Germany",
    "gr": "Greece",
    "gt": "Guatemala",
    "hn": "Honduras",
    "hk": "Hong Kong",
    "hu": "Hungary",
    "is": "Iceland",
    "in": "India",
    "id": "Indonesia",
    "ie": "Ireland",
    "il": "Israel",
    "it": "Italy",
    "jp": "Japan",
    "kz": "Kazakhstan",
    "lv": "Latvia",
    "lt": "Lithuania",
    "lu": "Luxembourg",
    "my": "Malaysia",
    "mt": "Malta",
    "mx": "Mexico",
    "ma": "Morocco",
    "nl": "Netherlands",
    "nz": "New Zealand",
    "ni": "Nicaragua",
    "ng": "Nigeria",
    "no": "Norway",
    "pk": "Pakistan",
    "pa": "Panama",
    "py": "Paraguay",
    "pe": "Peru",
    "ph": "Philippines",
    "pl": "Poland",
    "pt": "Portugal",
    "ro": "Romania",
    "ru": "Russia",
    "sa": "Saudi Arabia",
    "sg": "Singapore",
    "sk": "Slovakia",
    "za": "South Africa",
    "kr": "South Korea",
    "es": "Spain",
    "se": "Sweden",
    "ch": "Switzerland",
    "tw": "Taiwan",
    "th": "Thailand",
    "tr": "Turkey",
    "ua": "Ukraine",
    "ae": "United Arab Emirates",
    "uy": "Uruguay",
    "ve": "Venezuela",
    "vn": "Vietnam",
}


def scrape_country(code, country_name):
    url = f"{BASE_URL}/{code}_weekly_totals.html"
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.raise_for_status()
    except Exception as e:
        print(f"  ERROR: {e}")
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    rows = []

    for tr in soup.select("table tbody tr"):
        cols = tr.find_all("td")
        if len(cols) < 6:
            continue

        # First cell contains "Artist - Title" with two separate links
        first_cell = cols[0]
        links = first_cell.find_all("a")

        artist = ""
        artist_spotify_id = ""
        title = ""
        track_id = ""

        for a in links:
            href = a.get("href", "")
            text = a.get_text(strip=True)
            # Artist link: ../artist/ID.html
            m_artist = re.search(r'artist/([A-Za-z0-9]+)\.html', href)
            # Track link: ../track/ID.html
            m_track = re.search(r'track/([A-Za-z0-9]+)\.html', href)
            if m_artist:
                artist = text
                artist_spotify_id = m_artist.group(1)
            elif m_track:
                title = text
                track_id = m_track.group(1)

        # cols: 0=Artist-Title, 1=Wks, 2=T10, 3=Pk, 4=(x?), 5=PkStreams, 6=Total
        pk_streams = cols[5].get_text(strip=True)
        total      = cols[6].get_text(strip=True)

        rows.append([country_name, artist, artist_spotify_id, title, track_id, pk_streams, total])

    return rows


def scrape_all():
    all_rows = []
    total_countries = len(COUNTRIES)

    for i, (code, name) in enumerate(COUNTRIES.items(), 1):
        print(f"[{i}/{total_countries}] Scraping {name} ({code})...", end=" ", flush=True)
        rows = scrape_country(code, name)
        all_rows.extend(rows)
        print(f"{len(rows)} rows")
        time.sleep(0.5)  # polite delay

    return all_rows


def save_csv(rows, filename="kworb_weekly_totals_by_country.csv"):
    headers = ["country", "artist", "artist_spotify_id", "title", "track_id", "pk_streams", "total"]

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)

    print(f"\nSaved {len(rows)} rows -> {filename}")


if __name__ == "__main__":
    print(f"Scraping {len(COUNTRIES)} countries...\n")
    rows = scrape_all()
    print(f"\nTotal rows scraped: {len(rows)}")
    save_csv(rows)