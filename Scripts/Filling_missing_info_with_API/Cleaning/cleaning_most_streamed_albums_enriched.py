import pandas as pd
import pycountry

df = pd.read_csv("D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/new_csv/most_streamed_albums_enriched.csv")

# Changement country -> Morocco pour Maghrebi Arabic sauf Algeria
mask = (df['language'] == 'Maghrebi Arabic') & (df['country'] != 'Algeria')
print("Artistes modifiés (country -> Morocco) :")
print(df[mask][['artist', 'country']].drop_duplicates().to_string(index=False))
df.loc[mask, 'country'] = 'Morocco'
print(f"Total lignes modifiées : {mask.sum()}")

# Suppression des lignes Various Artists
before = len(df)
df = df[~df['artist'].isin(['Various Artists', 'Various artists'])]
print(f"\nLignes Various Artists supprimées : {before - len(df)}")

# Suppression des lignes country == TBD
before = len(df)
df = df[df['country'] != 'TBD']
print(f"Lignes country TBD supprimées : {before - len(df)}")

# Suppression des colonnes type et language
df = df.drop(columns=['type', 'language'])
print("Colonnes supprimées : type, language")

# Remplissage country_code depuis country via pycountry
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

mask = df['country_code'] == 'TBD'
changed = []
for idx, row in df[mask].iterrows():
    new_code = get_country_code(row['country'])
    if new_code != 'TBD':
        changed.append({
            'artist': row['artist'],
            'country': row['country'],
            'country_code_avant': 'TBD',
            'country_code_après': new_code,
        })
        df.at[idx, 'country_code'] = new_code

print(f"\nLignes country_code modifiées : {len(changed)}")
if changed:
    print(pd.DataFrame(changed).to_string(index=False))

df = df[['artist_spotify_id', 'artist', 'album_title', 'album_spotify_id', 'album_image_url',
         'release_year_albums', 'genre', 'country', 'country_code',
         'streams_albums', 'weekly_gain_streams_albums', 'monthly_gain_streams_albums']]

df.to_csv("D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/NEW_API_CSV/most_streamed_albums.csv", index=False)
print("\nFichier sauvegardé.")