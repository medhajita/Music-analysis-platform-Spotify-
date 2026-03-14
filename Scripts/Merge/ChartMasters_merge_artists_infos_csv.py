import pandas as pd

SRC = "D:/ECE_WORK/ProjetEnglobant/Data/Clean_Data/ChartMasters"
OUT = "D:/ECE_WORK/ProjetEnglobant/Data/Finals_CSV"

# 1. chartmasters_followed_artists
fol = pd.read_csv(f"{SRC}/chartmasters_followed_artists_clean.csv", usecols=[
    "spotify_id", "artist", "image_url", "followers",
    "daily_gain_followers", "weekly_gain_followers",
    "type", "genre", "country", "language"
])

# 2. chartmasters_monthly_listeners
lis = pd.read_csv(f"{SRC}/chartmasters_monthly_listeners_clean.csv", usecols=[
    "spotify_id", "listeners", "daily_gain_listeners", "monthly_gain_listeners"
])

# 3. chartmasters_peak_listeners_artists
pea_lis = pd.read_csv(f"{SRC}/chartmasters_peak_listeners_artists_clean.csv", usecols=[
    "spotify_id", "peak_listeners", "date_peak_listeners"
])

# 4. chartmasters_solo_feat_streams
solo_feat = pd.read_csv(f"{SRC}/chartmasters_solo_feat_streams_clean.csv", usecols=[
    "spotify_id", "solo_streams", "feat_streams", "total_streams"
])

# 5. chartmasters_most_streamed_artists_stats
stats = pd.read_csv(f"{SRC}/chartmasters_most_streamed_artists_stats_clean.csv", usecols=[
    "spotify_id", "tracks", "1B", "100M", "10M", "1M"
])

# Merge sur spotify_id
artists = fol \
    .merge(lis, on="spotify_id", how="left") \
    .merge(pea_lis, on="spotify_id", how="left") \
    .merge(solo_feat,  on="spotify_id", how="left") \
    .merge(stats, on="spotify_id", how="left")

# Export
artists.to_csv(f"{OUT}/Artists.csv", index=False, encoding="utf-8-sig")
print(f"Artists.csv : {len(artists)} lignes, {len(artists.columns)} colonnes")