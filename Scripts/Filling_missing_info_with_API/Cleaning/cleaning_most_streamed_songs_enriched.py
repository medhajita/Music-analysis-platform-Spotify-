import pandas as pd
import pycountry

# Chargement
df = pd.read_csv("D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/new_csv/most_streamed_songs_enriched.csv")

# Suppression des lignes où country == 'TBD'
before = len(df)
df = df[df['country'] != 'TBD'].reset_index(drop=True)
print(f"Lignes supprimées (country TBD) : {before - len(df)}")

# Suppression des colonnes language et type
df = df.drop(columns=['language', 'type'])
print("Colonnes supprimées : language, type")

def get_country_code(country_name):
    if pd.isna(country_name) or country_name == 'TBD':
        return 'TBD'
    try:
        result = pycountry.countries.get(name=country_name)
        if result:
            return result.alpha_2
        results = pycountry.countries.search_fuzzy(country_name)
        if results:
            return results[0].alpha_2
    except LookupError:
        return 'TBD'
    return 'TBD'

# Remplissage country_code depuis country
mask = df['country_code'] == 'TBD'

changed = []
for idx, row in df[mask].iterrows():
    new_code = get_country_code(row['country'])
    if new_code != 'TBD':
        changed.append({
            'artist': row['artist'],
            'song_title': row['song_title'],
            'country': row['country'],
            'country_code_avant': 'TBD',
            'country_code_après': new_code,
        })
        df.at[idx, 'country_code'] = new_code

# Affichage des changements
print(f"\nLignes country_code modifiées : {len(changed)}")
if changed:
    print(pd.DataFrame(changed).to_string(index=False))

# Réorganisation des colonnes
df = df[['artist_spotify_id', 'artist', 'song_title', 'song_image_url', 'release_year_songs', 'country', 'country_code', 'genre', 'streams_songs', 'weekly_gain_songs']]

print(f"\nOrdre des colonnes : {list(df.columns)}")

# Sauvegarde
df.to_csv("D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/NEW_API_CSV/most_streamed_songs.csv", index=False)
print("\nFichier sauvegardé.")