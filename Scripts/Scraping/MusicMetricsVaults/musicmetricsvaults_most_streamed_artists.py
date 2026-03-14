
import argparse
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urljoin

import pandas as pd
from bs4 import BeautifulSoup, Tag
from tqdm import tqdm

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException, StaleElementReferenceException
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

BASE          = "https://www.musicmetricsvault.com"
COUNTRIES_URL = f"{BASE}/countries"
OUTPUT_CSV    = "musicmetricsvaults_artists_per_country.csv"

BTN_XPATH  = "//button[.//span[normalize-space(.)='Load More Artists']]"

ARTIST_CSS = "a[href*='/artists/'] h3"

WAIT_GROW  = 8
POLL       = 0.25
PAGE_SLEEP = 3.0

@dataclass
class Artist:
    country:    str
    rank:       str | None
    name:       str
    spotify_id: str | None
    listeners:  str | None
    followers:  str | None
    artist_url: str | None

    def to_dict(self):
        return self.__dict__


def build_driver(headless: bool = True) -> webdriver.Chrome:
    opts = Options()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--window-size=1280,900")
    opts.add_argument("--log-level=3")
    return webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opts,
    )

def scrape_country_links(driver: webdriver.Chrome) -> list[dict]:
    driver.get(COUNTRIES_URL)
    time.sleep(2)
    soup    = BeautifulSoup(driver.page_source, "html.parser")
    pattern = re.compile(r"/countries/([^/]+)/(\d+)$")
    result, seen = [], set()

    for a in soup.select('a[href*="/countries/"]'):
        href = a.get("href", "")
        m    = pattern.search(href)
        if not m:
            continue
        full = urljoin(BASE, href)
        if full in seen:
            continue
        seen.add(full)
        result.append({"name": a.get_text(strip=True), "url": full})

    return result


def get_total(driver: webdriver.Chrome) -> int | None:

    try:
        el = driver.find_element(
            By.XPATH,
            "//*[contains(text(),'Showing') and contains(text(),'artists')]"
        )
        m = re.search(r"of\s+([\d,]+)\s+artists", el.text)
        if m:
            return int(m.group(1).replace(",", ""))
    except NoSuchElementException:
        pass
    return None


def load_all(driver: webdriver.Chrome, pbar: tqdm) -> None:

    total = get_total(driver)
    pbar.set_postfix_str(f"cible={total or '?'}")

    while True:
        current = len(driver.find_elements(By.CSS_SELECTOR, ARTIST_CSS))

        if total and current >= total:
            break

        try:
            btn = driver.find_element(By.XPATH, BTN_XPATH)
        except NoSuchElementException:
            break

        # Vérifier que le bouton n'est pas désactivé
        if not btn.is_enabled():
            time.sleep(1)
            continue

        driver.execute_script("arguments[0].scrollIntoView({block:'center'});", btn)
        time.sleep(0.2)
        try:
            driver.execute_script("arguments[0].click();", btn)
        except StaleElementReferenceException:
            break

        # Attendre que de nouveaux artistes apparaissent
        deadline = time.time() + WAIT_GROW
        grew = False
        while time.time() < deadline:
            after = len(driver.find_elements(By.CSS_SELECTOR, ARTIST_CSS))
            if after > current:
                grew = True
                pbar.set_postfix_str(f"chargés={after}/{total or '?'}")
                break
            time.sleep(POLL)

        if not grew:
            # Attendre un peu plus et réessayer une fois (réseau lent)
            time.sleep(2)
            after = len(driver.find_elements(By.CSS_SELECTOR, ARTIST_CSS))
            if after <= current:
                break


def _spotify_id(href: str | None) -> str | None:
    m = re.search(r"/artists/[^/]+/([A-Za-z0-9]{10,25})", href or "")
    return m.group(1) if m else None


def _find_card_root(el: Tag) -> Tag | None:
    node = el
    for _ in range(10):
        if not node or not isinstance(node, Tag):
            return None
        if (node.select_one("h3")
                and node.select_one("img")
                and node.select_one("div.text-right")):
            return node
        node = node.parent
    return None


def _metric(card: Tag, keyword: str) -> str | None:
    for mdiv in card.select("div.text-right"):
        val = mdiv.select_one("p.text-sm.font-semibold")
        lab = mdiv.select_one("p.text-xs.text-gray-500")
        if val and lab and keyword in lab.get_text(strip=True).lower():
            return val.get_text(strip=True)
    return None


def parse_artists(html: str, country: str) -> list[Artist]:

    soup = BeautifulSoup(html, "html.parser")

    name_anchors = [
        a for a in soup.select('a[href*="/artists/"]')
        if a.select_one("h3")
    ]

    artists = []
    for a in name_anchors:
        href       = a.get("href", "")
        spotify_id = _spotify_id(href)
        name       = a.select_one("h3").get_text(strip=True)
        card       = _find_card_root(a)

        rank = listeners = followers = None
        if card:
            rank_el   = card.find("span", string=re.compile(r"^\d{1,4}$"))
            rank      = rank_el.get_text(strip=True) if rank_el else None
            listeners = _metric(card, "listener")
            followers = _metric(card, "follower")

        artists.append(Artist(
            country    = country,
            rank       = rank,
            name       = name,
            spotify_id = spotify_id,
            listeners  = listeners,
            followers  = followers,
            artist_url = urljoin(BASE, href),
        ))

    return artists


def run(headless: bool = True, filter_countries: list[str] | None = None) -> None:
    driver = build_driver(headless)

    try:
        print("Récupération des pays…")
        countries = scrape_country_links(driver)

        if filter_countries:
            fc = {c.lower() for c in filter_countries}
            countries = [c for c in countries if c["name"].lower() in fc]

        print(f" {len(countries)} pays à traiter\n")

        all_artists: list[Artist] = []

        for idx, country in enumerate(countries, 1):
            name = country["name"]
            url  = country["url"]

            with tqdm(
                desc=f"[{idx:>3}/{len(countries)}] {name:<28}",
                unit=" clics",
                leave=True,
                file=sys.stdout,
            ) as pbar:
                driver.get(url)
                time.sleep(PAGE_SLEEP)
                load_all(driver, pbar)
                artists = parse_artists(driver.page_source, name)
                pbar.set_postfix_str(f"✓ {len(artists)} artistes")

            all_artists.extend(artists)
            time.sleep(0.4)

        # ── Sauvegarde ──────────────────────────────────────────
        df = (
            pd.DataFrame([a.to_dict() for a in all_artists])
            .drop_duplicates(subset=["spotify_id", "country"])
            .reset_index(drop=True)
        )

        out = Path(OUTPUT_CSV)
        df.to_csv(out, index=False, encoding="utf-8-sig")

        print(f"\n{'═'*55}")
        print(f"  CSV            →  {out.resolve()}")
        print(f"  Artistes total →  {len(df):,}")
        print(f"  Pays couverts  →  {df['country'].nunique()}")
        print(f"{'═'*55}")

    finally:
        driver.quit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scraper MusicMetricsVault v3")
    parser.add_argument("--headless", default="true", choices=["true", "false"])
    parser.add_argument("--countries", default=None,
                        help="Ex: France,Canada,Brazil")
    args = parser.parse_args()

    run(
        headless         = args.headless == "true",
        filter_countries = [c.strip() for c in args.countries.split(",")] if args.countries else None,
    )