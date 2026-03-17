import pandas as pd
import pycountry

df = pd.read_csv("D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/new_csv/different_streamed_songs_around_the_world_enriched.csv")

moroccan_artists = [
    'ElGrandeToto', 'Stormy', 'Draganov', 'Inkonnu', 'Kouz1', 'LFERDA',
    'Snor', 'Tagne', "L'morphine", 'Shaw', 'Pause', 'Mons', 'DYSTINCT',
    '7ari', 'Madd', 'Lbenj', 'Mocci', 'Don Bigg', 'Figoshin', 'Bo9al',
    'Raste', '7liwa', 'Duke', 'Anys', 'Saad Lamjarred', 'Dizzy DROS',
    'Manal', '7-Toun', 'Tawsen', 'Najm', 'Dollypran', 'Zouhair Bahaoui',
    'Baby Gang', 'Lazaro', 'Mounim Slimani', 'Valerieblud', 'Dada',
    'Moha K', 'Douaa Lahyaoui', 'OUENZA', 'Ayoub Anbaoui', 'RYM',
    'Smallx', 'Muslim', 'MA3IZ', 'Shobee', 'Vargas', 'Hassa1', 'Furelise',
    'Oualid Moro', 'Hatim Ammor', 'Nouamane Belaiachi', 'Tchubi',
    'Demon324', 'Mehdi Mozayine', 'Amine Farsi', 'Maestro', 'KALIL',
    'Salim Cravata', 'L7or', 'Kira7', 'Mok Saib', 'ISSAM', 'Shinigami',
    'Abdeelgha4', 'Jaylann', 'Diib', 'Gustavo 51', 'Tiiwtiiw', 'Kawtar',
    'JamShow', 'Tflow', 'Chaos333', 'Klass-A', 'Nessyou', 'Shayfeen',
    '21 Tach', 'Fetah', 'Douzi', 'Salma Rachid', 'RedOne', 'Aminux',
    'Laylow', 'Soul A', 'Skaymen', 'Mobydick', 'Mr. Crazy', 'Ali Ssamid',
    'Drizzy', 'Leil', 'Profit', 'Za3im', 'DJ Hamida', 'Khtek',
    'Lembawe9', 'Asma Lmnawar', 'Dolly Pran', 'Nora Fatehi', 'DOLLYPRAN',
    'Youness Zamdane'
]

# Corrections pour les noms non-ISO
name_fixes = {
    'United States of America': 'US',
    'England': 'GB',
    'Scotland': 'GB',
    'Wales': 'GB',
    'Northern Ireland': 'GB',
    'South Korea': 'KR',
    'Korea, Republic of': 'KR',
    'Russia': 'RU',
    'Russian Federation': 'RU',
    'Venezuela, Bolivarian Republic of': 'VE',
    'Virgin Islands, British': 'VG',
    'Taiwan': 'TW',
    'Iran': 'IR',
    'Syria': 'SY',
    'Bolivia': 'BO',
    'Tanzania': 'TZ',
    'Vietnam': 'VN',
}


def get_code(name):
    if pd.isna(name) or name == 'TBD':
        return 'TBD'
    if name in name_fixes:
        return name_fixes[name]
    try:
        result = pycountry.countries.get(name=name)
        return result.alpha_2 if result else 'TBD'
    except:
        return 'TBD'


df.loc[df['artist'].isin(moroccan_artists), 'country'] = 'Morocco'
df = df[df['country'] != 'TBD']
df['streamed_country'] = df['streamed_country'].replace('United States', 'United States of America')
df = df.drop(columns=['type'])

df['country_code'] = df['country'].apply(get_code)
df['streamed_country_code'] = df['streamed_country'].apply(get_code)

df = df[df['country_code'] != 'TBD']

df = df[['artist_spotify_id', 'artist', 'song_title', 'song_id',
         'streamed_country', 'streamed_country_code', 'peak_streams',
         'total_streams_song_per_country', 'country', 'country_code', 'genre']]

df.to_csv("D:/ECE_WORK/Music-analysis-platform-Spotify-/Scripts/Filling_missing_info_with_API/NEW_API_CSV/different_streamed_songs_around_the_world.csv", index=False)
print("Fichier sauvegardé.")