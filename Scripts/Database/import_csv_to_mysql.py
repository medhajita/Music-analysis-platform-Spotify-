import pandas as pd
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

USER     = "root"
PASSWORD = quote_plus("Dirdaw51@2019")
HOST     = "localhost"
PORT     = 3306
DATABASE = "music_analysis_platform_for_spotify"

engine = create_engine(f"mysql+pymysql://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE}")

BASE_PATH = r"D:\ECE_WORK\Music-analysis-platform-Spotify-\Data\Finals_CSV"

files = {
    "artists":                                      f"{BASE_PATH}\\Artists.csv",
    "most_streamed_albums":                         f"{BASE_PATH}\\most_streamed_albums.csv",
    "most_streamed_songs":                          f"{BASE_PATH}\\most_streamed_songs.csv",
    "different_streamed_songs_around_the_world":    f"{BASE_PATH}\\different_streamed_songs_around_the_world.csv",
}

LARGE_FILES = {"different_streamed_songs_around_the_world"}
CHUNK_SIZE  = 10_000

RENAME_MAPS = {
    "artists": {
        "1B":   "streams_1B",
        "100M": "streams_100M",
        "10M":  "streams_10M",
        "1M":   "streams_1M",
    },
}


with engine.connect() as conn:
    conn.execute(text("SET FOREIGN_KEY_CHECKS = 0"))

    for table_name, filepath in files.items():
        rename_map = RENAME_MAPS.get(table_name, {})

        if table_name in LARGE_FILES:
            total = 0
            for chunk in pd.read_csv(filepath, chunksize=CHUNK_SIZE):
                if rename_map:
                    chunk = chunk.rename(columns=rename_map)
                chunk.to_sql(name=table_name, con=conn, if_exists="append", index=False)
                total += len(chunk)
                print(f"  {table_name} — chunk importé... ({total} lignes)", end="\r")
            print(f"\n{table_name} importé ({total} lignes total)")
        else:
            df = pd.read_csv(filepath)
            if rename_map:
                df = df.rename(columns=rename_map)
            df.to_sql(name=table_name, con=conn, if_exists="append", index=False)
            print(f"{table_name} importé ({len(df)} lignes)")

    conn.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
    conn.commit()

print("\nTous les CSV ont été importés avec succès !")