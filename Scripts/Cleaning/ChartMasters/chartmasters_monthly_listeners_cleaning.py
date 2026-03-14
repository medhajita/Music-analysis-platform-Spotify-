import pandas as pd

# Charger le fichier CSV
df = pd.read_csv(r"D:\ECE_WORK\ProjetEnglobant\Data\Scraping_Data\ChartMasters\chartmasters_monthly_listeners.csv")

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

# supprimer les virgules et convertir en nombre
df["monthly_listeners"] = df["monthly_listeners"].str.replace(",", "").astype(int)
print("\n",df["monthly_listeners"].head())

df["daily_gain_listeners"] = df["daily_gain_listeners"].str.replace(",", "").astype(int)
print("\n",df["daily_gain_listeners"].head())

df["monthly_gain_listeners"] = df["monthly_gain_listeners"].str.replace(",", "").astype(int)
print("\n",df["monthly_gain_listeners"].head())

#Sauvegarder le nouveau CSV propre
df.to_csv(r"D:\ECE_WORK\ProjetEnglobant\Data\Clean_Data\ChartMasters\chartmasters_monthly_listeners_clean.csv", index=False)

print(" \n Nettoyage terminé.")