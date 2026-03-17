import os
import time
import pandas as pd
import requests
import pycountry
import musicbrainzngs

INPUT_CSV = "D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/new_csv/most_streamed_songs_enriched.csv"
PROGRESS_CSV = "D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/NEW_API_CSV/progress_most_streamed_songs.csv"
SAVE_EVERY = 25
MUSICBRAINZ_SLEEP = 1.2
MAX_MB_RETRIES = 3

musicbrainzngs.set_useragent("ProjetSpotify", "1.0", "ton_email@example.com")

def get_artist_info_from_musicbrainz(artist_name, max_retries=MAX_MB_RETRIES):
    if not artist_name or pd.isna(artist_name):
        return "", "", "", ""

    for attempt in range(1, max_retries + 1):
        try:
            result = musicbrainzngs.search_artists(artist=artist_name, limit=5)
            artists = result.get("artist-list", [])
            if not artists:
                return "", "", "", ""

            artist = None
            artist_name_clean = artist_name.strip().lower()
            for candidate in artists:
                if str(candidate.get("name", "")).strip().lower() == artist_name_clean:
                    artist = candidate
                    break
            if artist is None:
                artist = artists[0]

            country_code = (artist.get("country") or "").strip().upper()
            country_name = ""
            if country_code:
                c = pycountry.countries.get(alpha_2=country_code)
                country_name = c.name if c else ""
            if not country_name:
                area = artist.get("area")
                if isinstance(area, dict):
                    country_name = (area.get("name") or "").strip()

            artist_type = artist.get("type", "TBD")

            tags = artist.get("tag-list", [])
            tags_positive = [t for t in tags if int(t.get("count", 0)) > 0]
            tags_sorted = sorted(tags_positive, key=lambda x: int(x["count"]), reverse=True)
            genre = tags_sorted[0]["name"].capitalize() if tags_sorted else "TBD"

            return country_code, country_name, artist_type, genre

        except Exception as e:
            print(f"[MusicBrainz] tentative {attempt}/{max_retries} échouée pour '{artist_name}': {e}")
            time.sleep(2)

    return "", "", "", ""

def load_progress(progress_csv):
    if os.path.exists(progress_csv):
        return pd.read_csv(progress_csv, dtype=str).fillna("")
    return pd.DataFrame(columns=["artist", "country_code", "country", "type", "genre"])

def save_progress(progress_dict, progress_csv):
    df = pd.DataFrame.from_dict(progress_dict, orient="index").reset_index()
    df.columns = ["artist", "country_code", "country", "type", "genre"]
    df.to_csv(progress_csv, index=False, encoding="utf-8-sig")
    print(f"Progression sauvegardée : {progress_csv}")

def enrich_csv():
    df = pd.read_csv(INPUT_CSV, dtype=str).fillna("")

    # Ajout de country_code si absent
    if "country_code" not in df.columns:
        df.insert(df.columns.get_loc("country") + 1, "country_code", "TBD")

    # Initialise les colonnes manquantes si besoin
    for col in ["type", "genre"]:
        if col not in df.columns:
            df[col] = "TBD"

    # On traite les lignes où country OU type OU genre est encore TBD ou vide
    mask_todo = (
        (df["country"].isin(["TBD", ""])) |
        (df["type"].isin(["TBD", ""])) |
        (df["genre"].isin(["TBD", ""]))
    )
    unique_artists = df[mask_todo]["artist"].unique().tolist()
    print(f"Artistes à traiter : {len(unique_artists)}")

    progress_df = load_progress(PROGRESS_CSV)
    progress_dict = {row["artist"]: {
        "country_code": row["country_code"],
        "country": row["country"],
        "type": row["type"],
        "genre": row["genre"]
    } for _, row in progress_df.iterrows()}

    remaining = [a for a in unique_artists if a not in progress_dict]
    print(f"Déjà traités : {len(progress_dict)} | Restants : {len(remaining)}")

    for i, artist_name in enumerate(remaining, start=1):
        country_code, country_name, artist_type, genre = get_artist_info_from_musicbrainz(artist_name)
        progress_dict[artist_name] = {
            "country_code": country_code or "TBD",
            "country": country_name or "TBD",
            "type": artist_type or "TBD",
            "genre": genre or "TBD"
        }
        print(f"[{i}/{len(remaining)}] {artist_name} → {country_name} ({country_code}) | {artist_type} | {genre}")
        time.sleep(MUSICBRAINZ_SLEEP)

        if i % SAVE_EVERY == 0:
            save_progress(progress_dict, PROGRESS_CSV)

    save_progress(progress_dict, PROGRESS_CSV)

    # Applique les résultats au DataFrame
    for index, row in df.iterrows():
        artist = row["artist"]
        info = progress_dict.get(artist)
        if info:
            if row["country"] in ["TBD", ""]:
                df.at[index, "country"] = info["country"]
                df.at[index, "country_code"] = info["country_code"]
            if row["type"] in ["TBD", ""]:
                df.at[index, "type"] = info["type"]
            if row["genre"] in ["TBD", ""]:
                df.at[index, "genre"] = info["genre"]

    df.to_csv(INPUT_CSV, index=False, encoding="utf-8-sig")
    print(f"Terminé : {INPUT_CSV}")

if __name__ == "__main__":
    enrich_csv()