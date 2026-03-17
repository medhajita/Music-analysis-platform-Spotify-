import pandas as pd

# ── Chargement des fichiers ──────────────────────────────────────────────────
songs   = pd.read_csv(r"D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/original_csv/different_streamed_songs_around_the_world.csv")
artists = pd.read_csv(r"D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/original_csv/Artists.csv")

# ── Sélection des colonnes utiles depuis Artists.csv ─────────────────────────
artists_map = artists[["artist_spotify_id", "country", "type", "genre"]].copy()

# ── Merge (LEFT JOIN) sur artist_spotify_id ───────────────────────────────────
songs = songs.merge(artists_map, on="artist_spotify_id", how="left")

# ── Remplacement des valeurs manquantes par "TBD" pour country, type, genre ──
for col in ["country", "type", "genre"]:
    songs[col] = songs[col].fillna("TBD")

# ── Réorganisation : country, type, genre placés à la FIN ────────────────────
other_cols = [c for c in songs.columns if c not in ["country", "type", "genre"]]
songs = songs[other_cols + ["country", "type", "genre"]]

# ── Export ───────────────────────────────────────────────────────────────────
output_path = "D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/new_csv/different_streamed_songs_around_the_world_enriched.csv"
songs.to_csv(output_path, index=False)

print(f"Fichier généré : {output_path}")
print(f"   Lignes         : {len(songs)}")
print(f"   Colonnes finales : {list(songs.columns)}")
print(f"\n   TBD par colonne :")
for col in ["country", "type", "genre"]:
    tbd_count = (songs[col] == "TBD").sum()
    print(f"     - {col}: {tbd_count} valeur(s) TBD")