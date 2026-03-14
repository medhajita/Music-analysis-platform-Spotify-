import pandas as pd


df = pd.read_csv(r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\most_streamed_songs.csv")

print("Colonnes actuelles :", list(df.columns))

df = df.drop(columns=["rank"])

df = df.rename(columns={
    "image_url": "song_image_url",
    "song": "song_title",
    "spotify_id": "artist_spotify_id",
    "year_songs": "release_year_songs",
})

new_order = ["artist_spotify_id", "artist", "song_title", "song_image_url",
             "release_year_songs","genre", "language",
             "streams_songs", "weekly_gain_songs"]
df = df[new_order]

df.to_csv(r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\most_streamed_songs.csv", index=False)
print("Fichier sauvegardé")
print("Nouvel ordre :", list(df.columns))