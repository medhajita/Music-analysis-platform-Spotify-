import pandas as pd


df = pd.read_csv(r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\diffrent_artists_per_country.csv")

print("Colonnes actuelles :", list(df.columns))

df = df.drop(columns=["rank", "artist_url"])

df = df.rename(columns={
    "spotify_id": "artist_spotify_id",
    "name": "artist",
})

new_order = ["artist_spotify_id", "artist", "country", "followers", "listeners"]

df = df[new_order]

df.to_csv(r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\diffrent_artists_per_country.csv", index=False)
print("Fichier sauvegardé")
print("Nouvel ordre :", list(df.columns))