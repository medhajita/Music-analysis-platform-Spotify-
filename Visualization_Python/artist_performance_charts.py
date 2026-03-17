import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

DATA_PATH = r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\artists.csv"

SPOTIFY_GREEN = "#1DB954"
plt.style.use('dark_background')
sns.set_theme(style="dark", palette="viridis")

df = pd.read_csv(DATA_PATH)

# --- Graphique 1 : Top 15 Most Listened Artists ---
top_15_listeners = df.sort_values(by='listeners', ascending=False).head(15)

plt.figure(figsize=(12, 8))
sns.barplot(x='listeners', y='artist', data=top_15_listeners, palette="magma")
plt.title('Top 15 Most Listened Artists', fontsize=16, fontweight='bold', color=SPOTIFY_GREEN)
plt.xlabel('Monthly Listeners', fontsize=12)
plt.ylabel('Artist', fontsize=12)
plt.tight_layout()
plt.savefig("top_listeners.png")
plt.show()

# --- Graphique 2 : Top 15 Most Streamed Artists ---
top_15_streams = df.sort_values(by='total_streams', ascending=False).head(15)

plt.figure(figsize=(12, 8))
sns.barplot(x='total_streams', y='artist', data=top_15_streams, palette="viridis")
plt.title('Top 15 Most Streamed Artists (Total)', fontsize=16, fontweight='bold', color=SPOTIFY_GREEN)
plt.xlabel('Total Streams', fontsize=12)
plt.ylabel('Artist', fontsize=12)
plt.tight_layout()
plt.savefig("top_streams.png")
plt.show()