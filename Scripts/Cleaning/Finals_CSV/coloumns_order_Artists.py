import pandas as pd


df = pd.read_csv(r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\Artists.csv")

print("Colonnes actuelles :", list(df.columns))

df = df.rename(columns={
    "spotify_id": "artist_spotify_id",
    "image_url" : "artist_image_url"
})

new_order = ["artist_spotify_id", "artist", "artist_image_url", "country", "language", "type", "genre",
             "followers",  "daily_gain_followers", "weekly_gain_followers",
             "listeners", "daily_gain_listeners", "monthly_gain_listeners", "peak_listeners", "date_peak_listeners",
             "total_streams", "solo_streams" , "feat_streams",
             "tracks", "1B", "100M", "10M", "1M"]

df = df[new_order]

df.to_csv(r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\Artists.csv", index=False)
print("Fichier sauvegardé")
print("Nouvel ordre :", list(df.columns))