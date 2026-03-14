import pandas as pd


df = pd.read_csv(r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\most_streamed_albums.csv")

print("Colonnes actuelles :", list(df.columns))

df = df.drop(columns=["rank"])

df = df.rename(columns={
    "image_url": "album_image_url",
    "year_albums": "release_year_albums",
})

new_order = ["artist_spotify_id", "artist", "album_title", "album_spotify_id", "album_image_url",
             "type", "genre", "language", "release_year_albums",
             "streams_albums", "weekly_gain_streams_albums", "monthly_gain_streams_albums"]

df = df[new_order]

df.to_csv(r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\most_streamed_albums.csv", index=False)
print("Fichier sauvegardé")
print("Nouvel ordre :", list(df.columns))