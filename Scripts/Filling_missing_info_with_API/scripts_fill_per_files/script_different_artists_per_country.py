import pandas as pd


# ── Chargement des fichiers ──────────────────────────────────────────────────
artists_country   = pd.read_csv(r"D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/original_csv/different_artists_per_country.csv")
artists = pd.read_csv(r"D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/original_csv/Artists.csv")


# ── Sélection des colonnes utiles depuis Artists.csv ─────────────────────────
artists_map = artists[["artist_spotify_id", "type", "genre"]].copy()

# ── Merge (LEFT JOIN) sur artist_spotify_id ───────────────────────────────────
artists_country = artists_country.merge(artists_map, on="artist_spotify_id", how="left")

# ── Remplacement des valeurs manquantes par "TBD" pour type et genre ─────────
for col in ["type", "genre"]:
    artists_country[col] = artists_country[col].fillna("TBD")

# ── Réorganisation : type, genre placés à la FIN ─────────────────────────────
other_cols = [c for c in artists_country.columns if c not in ["type", "genre"]]
artists_country = artists_country[other_cols + ["type", "genre"]]

# ── Export ───────────────────────────────────────────────────────────────────
output_path = "D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/new_csv/different_artists_per_country_enriched.csv"
artists_country.to_csv(output_path, index=False)

print(f"Fichier généré : {output_path}")
print(f"   Lignes         : {len(artists_country)}")
print(f"   Colonnes finales : {list(artists_country.columns)}")
print(f"\n   TBD par colonne :")
for col in ["type", "genre"]:
    tbd_count = (artists_country[col] == "TBD").sum()
    print(f"     - {col}: {tbd_count} valeur(s) TBD")