
import re
import time
from urllib.parse import urljoin

import pandas as pd
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# ─── CONFIG ───────────────────────────────────────────────────────────────────
BASE         = "https://www.musicmetricsvault.com"
COUNTRIES_URL = f"{BASE}/countries"
OUTPUT_CSV   = "musicmetricsvaults_most_streamed_artists.csv"

LOAD_MORE_BTN_XPATH   = "//button[contains(., 'Load More Artists')]"
ARTIST_CARD_SELECTOR  = "a[href*='/artists/']"
MAX_CLICKS_PER_COUNTRY = 400      # 400 × 25 = 10 000 artistes max par pays
PAGE_LOAD_WAIT         = 2.5      # secondes après driver.get()
LOAD_MORE_TIMEOUT      = 7        # secondes max pour attendre l'apparition de nouvelles cards
# ──────────────────────────────────────────────────────────────────────────────


def build_driver(headless: bool = True) -> webdriver.Chrome:
    opts = Options()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1280,900")
    return webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opts,
    )


def extract_spotify_id(href: str | None) -> str | None:
    m = re.search(r"/artists/[^/]+/([A-Za-z0-9]+)", href or "")
    return m.group(1) if m else None


# ───  récupérer tous les liens pays ────────────────────────────────────
def get_country_links(driver: webdriver.Chrome) -> list[dict]:

    driver.get(COUNTRIES_URL)
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, "html.parser")

    links = []
    seen  = set()

    for a in soup.select('a[href*="/countries/"]'):
        href = a.get("href", "")
        # Garder seulement les liens /countries/{slug}/{id}
        if not re.search(r"/countries/[^/]+/\d+", href):
            continue
        full = urljoin(BASE, href)
        if full in seen:
            continue
        seen.add(full)
        name = a.get_text(strip=True)
        links.append({"name": name, "url": full})

    return links


# ─── charger tout le contenu d'une page pays ─────────────────────────
def click_load_more_until_end(driver: webdriver.Chrome, country_name: str) -> None:

    for click_n in range(1, MAX_CLICKS_PER_COUNTRY + 1):
        try:
            btn = driver.find_element(By.XPATH, LOAD_MORE_BTN_XPATH)
        except Exception:
            # Bouton introuvable → tout est chargé
            break

        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", btn)
        time.sleep(0.15)

        before = len(driver.find_elements(By.CSS_SELECTOR, ARTIST_CARD_SELECTOR))
        driver.execute_script("arguments[0].click();", btn)

        # Attendre que la liste s'allonge
        t0    = time.time()
        grew  = False
        while time.time() - t0 < LOAD_MORE_TIMEOUT:
            after = len(driver.find_elements(By.CSS_SELECTOR, ARTIST_CARD_SELECTOR))
            if after > before:
                grew = True
                break
            time.sleep(0.25)

        if not grew:
            # Le clic n'a rien produit → fin
            break

        if click_n % 20 == 0:
            print(f"    [{country_name}] {click_n} clics — {after} artistes chargés…")


# ─── parser les cards artiste ────────────────────────────────────────
def parse_artist_cards(html: str, page_url: str, country_name: str) -> list[dict]:
    soup  = BeautifulSoup(html, "html.parser")
    rows  = []

    artist_anchors = soup.select('a[href*="/artists/"]')

    seen_ids = set()

    for a in artist_anchors:
        href       = a.get("href", "")
        spotify_id = extract_spotify_id(href)

        # Déduplique (un artiste peut avoir plusieurs <a> dans la card)
        if spotify_id in seen_ids:
            continue
        seen_ids.add(spotify_id)

        # Remonter au conteneur parent (card)
        card = a.parent
        # Remonter si nécessaire jusqu'au div contenant rank + img + métriques
        for _ in range(4):
            if card and card.find("h3"):
                break
            card = card.parent if card else None

        if not card:
            continue

        # Rank
        rank_el = card.select_one("div.w-8 span") or card.select_one("span")
        rank    = rank_el.get_text(strip=True) if rank_el else None

        # Nom
        h3   = card.select_one("h3")
        name = h3.get_text(strip=True) if h3 else a.get_text(strip=True)

        # Image
        img     = card.select_one("img")
        img_url = img["src"] if img and img.has_attr("src") else None

        # Listeners / Followers
        listeners = followers = None
        for mdiv in card.select("div.text-right"):
            val_el = mdiv.select_one("p.text-sm.font-semibold")
            lab_el = mdiv.select_one("p.text-xs.text-gray-500")
            if not (val_el and lab_el):
                continue
            val_txt = val_el.get_text(strip=True)
            label   = lab_el.get_text(strip=True).lower()
            if "listener" in label:
                listeners = val_txt
            elif "follower" in label:
                followers = val_txt

        if name:
            rows.append({
                "country":    country_name,
                "page_url":   page_url,
                "rank":       rank,
                "name":       name,
                "spotify_id": spotify_id,
                "img_url":    img_url,
                "listeners":  listeners,
                "followers":  followers,
            })

    return rows


# ─── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    driver = build_driver(headless=True)

    try:
        # 1. Récupérer les liens pays
        print(" Récupération des liens pays…")
        country_links = get_country_links(driver)
        print(f"{len(country_links)} pays trouvés\n")

        all_rows = []

        for i, country in enumerate(country_links, start=1):
            name = country["name"]
            url  = country["url"]
            print(f"[{i:>3}/{len(country_links)}] {name}  →  {url}")

            # 2. Charger la page pays
            driver.get(url)
            time.sleep(PAGE_LOAD_WAIT)

            # 3. Cliquer "Load More Artists" jusqu'à la fin
            click_load_more_until_end(driver, name)

            # 4. Parser les cards
            rows = parse_artist_cards(driver.page_source, url, name)
            all_rows.extend(rows)
            print(f"         → {len(rows)} artistes extraits")

            time.sleep(0.4)

        # 5. Sauvegarder
        df = (
            pd.DataFrame(all_rows)
            .drop_duplicates(subset=["spotify_id", "country"])
            .reset_index(drop=True)
        )

        df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
        print(f"\n CSV enregistré : {OUTPUT_CSV}")
        print(f"   {len(df)} lignes  ·  {df['country'].nunique()} pays")

    finally:
        driver.quit()


if __name__ == "__main__":
    main()