import pandas as pd


# ── Chargement des fichiers ──────────────────────────────────────────────────
albums   = pd.read_csv(r"D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/original_csv/most_streamed_albums.csv")
artists = pd.read_csv(r"D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/original_csv/Artists.csv")


# ── Sélection des colonnes utiles depuis Artists.csv ─────────────────────────
artists_map = artists[["artist_spotify_id", "country", "genre"]].copy()

# ── Merge (LEFT JOIN) sur artist_spotify_id ───────────────────────────────────
albums = albums.merge(artists_map, on="artist_spotify_id", how="left", suffixes=("", "_new"))

# ── Mise à jour de genre : on prend la valeur d'Artists.csv si disponible,
#    sinon on garde la valeur existante dans albums ───────────────────────────
albums["genre"] = albums["genre_new"].fillna(albums["genre"])
albums = albums.drop(columns=["genre_new"])

# ── Remplacement des valeurs manquantes par "TBD" pour country ───────────────
albums["country"] = albums["country"].fillna("TBD")

# ── Réorganisation : country placé à la FIN ───────────────────────────────────
other_cols = [c for c in albums.columns if c != "country"]
albums = albums[other_cols + ["country"]]

# ── Export ───────────────────────────────────────────────────────────────────
output_path = "D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/new_csv/most_streamed_albums_enriched.csv"
albums.to_csv(output_path, index=False)

print(f"Fichier généré : {output_path}")
print(f"   Lignes         : {len(albums)}")
print(f"   Colonnes finales : {list(albums.columns)}")
tbd_count = (albums["country"] == "TBD").sum()
print(f"\n   TBD par colonne :")
print(f"     - country: {tbd_count} valeur(s) TBD")