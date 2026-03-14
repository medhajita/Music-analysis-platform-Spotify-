import pandas as pd

# Charger le fichier CSV
df = pd.read_csv(r"/Data/Scraping_Data/MusicMetricsVaults/musicmetricsvaults_most_streamed_artists.csv")

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

# convert 12.4 million to number
df["streams"] = df["streams"].str.replace(" billion", "")
df["streams"] = df["streams"].astype(float) * 1_000_000_000
df["streams"] = df["streams"].astype(int)

print(df["streams"].head())


#Sauvegarder le nouveau CSV propre
df.to_csv(r"D:\ECE_WORK\ProjetEnglobant\Data\Clean_Data\MusicMetricsVaults\musicmetricsvaults_most_streamed_artists_clean.csv", index=False)

print(" \n Nettoyage terminé.")