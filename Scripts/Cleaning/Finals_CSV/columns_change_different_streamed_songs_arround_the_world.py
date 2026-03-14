import pandas as pd


df = pd.read_csv(r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\different_streamed_songs_arround_the_world.csv")

print("Colonnes actuelles :", list(df.columns))

df = df.rename(columns={
    "country": "streamed_country",
    "pk_streams": "peak_streams",
    "total": "total_streams_track_per_country",
})

new_order = ["artist_spotify_id", "artist", "title", "track_id", "streamed_country", "peak_streams", "total_streams_track_per_country",]

df = df[new_order]

df.to_csv(r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\different_streamed_songs_arround_the_world.csv", index=False)
print("Fichier sauvegardé")
print("Nouvel ordre :", list(df.columns))

