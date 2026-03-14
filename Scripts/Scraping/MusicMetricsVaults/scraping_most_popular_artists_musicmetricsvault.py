from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import re
from bs4 import BeautifulSoup
import pandas as pd


URL = "https://www.musicmetricsvault.com/most-popular-artists-spotify"

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
driver.get(URL)
time.sleep(5)

# Clique sur "Load more" jusqu’à la fin
max_clicks = 300
for i in range(max_clicks):
    try:
        btn = driver.find_element(By.XPATH, "//button[contains(., 'Load')]")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
        time.sleep(0.3)
        driver.execute_script("arguments[0].click();", btn)
        print(f"Click {i+1}")
        time.sleep(1.5)  # laisse le temps au tableau de se mettre à jour
    except:
        print("Plus de bouton Load more -> stop")
        break

# Récupérer le HTML final
html = driver.page_source
driver.quit()

# Parser comme tu fais
soup = BeautifulSoup(html, "html.parser")

cards = soup.find_all(
    "div",
    class_="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
)

rows = []
for card in cards:
    # rank
    rank_span = card.select_one("div.w-8 span")
    rank = rank_span.get_text(strip=True) if rank_span else None

    # name
    name_h3 = card.select_one("h3")
    name = name_h3.get_text(strip=True) if name_h3 else None

    # country (le <p> qui est dans le bloc info et qui contient "Canada")
    country_p = card.select_one("div.flex-1 p.text-xs.text-gray-500")
    country = country_p.get_text(strip=True) if country_p else None

    # image url
    img = card.select_one("img")
    image_url = img["src"] if img and img.has_attr("src") else None

    # streams (ex: "125.8 billion")
    listeners_p = card.select_one("div.flex-shrink-0.text-right p.text-sm.font-semibold")
    listeners_p = listeners_p.get_text(strip=True) if listeners_p else None

    # BONUS: spotify_id depuis le href /artists/<slug>/<spotify_id>
    a = card.select_one('a[href*="/artists/"]')
    spotify_id = None
    if a and a.has_attr("href"):
        m = re.search(r"/artists/[^/]+/([A-Za-z0-9]+)", a["href"])
        if m:
            spotify_id = m.group(1)

    if name:  # filtre sécurité
        rows.append({
            "rank": rank,
            "name": name,
            "country": country,
            "listeners": listeners_p,
            "image_url": image_url,
            "spotify_id": spotify_id,
        })

df = pd.DataFrame(rows).drop_duplicates()
print(df.head(10))
df.to_csv("musicmetricsvaults_most_popular_artists.csv", index=False, encoding="utf-8-sig")
print("CSV créé : musicmetricsvaults_most_popular_artists.csv")