import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

DATA_PATH = r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\artists.csv"
SPOTIFY_GREEN = "#1DB954"

df = pd.read_csv(DATA_PATH)

plt.style.use('dark_background')

# --- Graphique 1 : Genre Distribution (Pie Chart) ---
genre_counts = df['genre'].value_counts().head(10)

plt.figure(figsize=(10, 10))
plt.pie(genre_counts, labels=genre_counts.index, autopct='%1.1f%%',
        colors=sns.color_palette("plasma", len(genre_counts)),
        startangle=140, textprops={'color': "w"})
plt.title('Top 10 Genres Distribution', fontsize=16, fontweight='bold', color=SPOTIFY_GREEN)
plt.tight_layout()
plt.savefig("genre_distribution.png")
plt.show()

# --- Graphique 2 : Top Genres by Streams (Bar Chart) ---
genre_streams = df.groupby('genre')['total_streams'].sum().sort_values(ascending=False).head(10).reset_index()

plt.figure(figsize=(12, 8))
sns.barplot(x='total_streams', y='genre', data=genre_streams, palette="rocket")
plt.title('Top 10 Genres by Total Streams', fontsize=16, fontweight='bold', color=SPOTIFY_GREEN)
plt.xlabel('Total Streams', fontsize=12)
plt.ylabel('Genre', fontsize=12)
plt.tight_layout()
plt.savefig("top_genres_streams.png")
plt.show()