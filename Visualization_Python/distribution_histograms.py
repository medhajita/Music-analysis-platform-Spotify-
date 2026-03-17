import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

ARTISTS_DATA = r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\artists.csv"
SONGS_DATA = r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV\most_streamed_songs.csv"

plt.style.use('dark_background')
SPOTIFY_GREEN = "#1DB954"

# --- Graphique 1 : Distribution des Followers ---
df_artists = pd.read_csv(ARTISTS_DATA)

plt.figure(figsize=(12, 7))
sns.histplot(df_artists['followers'], bins=30, kde=True, color=SPOTIFY_GREEN)
plt.title('Distribution of Artist Followers', fontsize=16, fontweight='bold', color=SPOTIFY_GREEN)
plt.xlabel('Followers', fontsize=12)
plt.ylabel('Number of Artists', fontsize=12)
plt.tight_layout()
plt.savefig("followers_distribution.png")
plt.show()

# --- Graphique 2 : Distribution des Années de Sortie ---
df_songs = pd.read_csv(SONGS_DATA)

valid_years = df_songs[df_songs['release_year_songs'] > 1900]['release_year_songs']

plt.figure(figsize=(12, 7))
sns.histplot(valid_years, bins=20, color="#EC4899")
plt.title('Release Year Distribution (Top Songs)', fontsize=16, fontweight='bold', color=SPOTIFY_GREEN)
plt.xlabel('Year', fontsize=12)
plt.ylabel('Count', fontsize=12)
plt.tight_layout()
plt.savefig("release_year_distribution.png")
plt.show()