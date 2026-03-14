import pandas as pd

# Charger le fichier CSV
df = pd.read_csv(r"D:\ECE_WORK\ProjetEnglobant\Data\Scraping_Data\MusicMetricsVaults\musicmetricsvaults_artists_per_country.csv")

# Afficher les dimensions
print(" Dimensions du dataset :", df.shape)

#Valeurs manquantes
print("\n Valeurs manquantes par colonne :")
print(df.isnull().sum())

#Nombre total de valeurs manquantes
print("\n Total valeurs manquantes :")
print(df.isnull().sum().sum())

#Lignes doublons
print("\n Nombre de lignes doublons :")
print(df.duplicated().sum())

#Afficher les lignes doublons
print("\n Lignes doublons :")
print(df[df.duplicated()])

print("\n Nombre de lignes avant nettoyage :", len(df))

#Supprimer les lignes avec valeurs manquantes
df = df.dropna()

#Supprimer les doublons (garde une seule occurrence)
df = df.drop_duplicates()

print("\n Nombre de lignes apres nettoyage :", len(df))

df["followers"] = df["followers"].astype(str)
df["followers"] = (
    df["followers"]
    .str.replace(",", "")
    .str.replace(" billion", "e9")
    .str.replace(" million", "e6")
    .replace("-", None)
)

df["followers"] = pd.to_numeric(df["followers"], errors="coerce")
print(df["followers"].head())


df["listeners"] = df["listeners"].astype(str)
df["listeners"] = (
    df["listeners"]
    .str.replace(",", "")
    .str.replace(" billion", "e9")
    .str.replace(" million", "e6")
    .replace("-", None)
)

df["listeners"] = pd.to_numeric(df["listeners"], errors="coerce")
print(df["listeners"].head())


# supprimer les lignes avec "-"
df = df[df["followers"] != "-"]
print((df["followers"] == "-").sum())

df = df[df["listeners"] != "-"]
print((df["listeners"] == "-").sum())

# supprimer les lignes avec NaN
df = df.dropna(subset=["followers"])
df = df.dropna(subset=["listeners"])

df["followers"] = df["followers"].astype(int)
df["listeners"] = df["listeners"].astype(int)


#Sauvegarder le nouveau CSV propre
df.to_csv(r"D:\ECE_WORK\ProjetEnglobant\Data\Clean_Data\MusicMetricsVaults\musicmetricsvaults_artists_per_country_clean.csv", index=False)

print(" \n Nettoyage terminé.")