# 🌦️ Application Météo React

Une application météo moderne et responsive développée avec React, Vite, TailwindCSS et DaisyUI.

## 📋 Fonctionnalités

- ✅ **Recherche de ville** : Recherchez la météo de n'importe quelle ville dans le monde
- ✅ **Autocomplétion des villes** : Suggestions en direct via l'API Adresse data.gouv.fr
- ✅ **Informations détaillées** : Température, humidité, vent, pression atmosphérique
- ✅ **Prévisions sur 5 jours** : Aperçu rapide avec mini graphique de température
- ✅ **Choix Celsius/Fahrenheit** : Bascule °C / °F depuis la navbar
- ✅ **Géolocalisation** : Bouton "Ma position" pour récupérer la météo autour de vous
- ✅ **Mode hors ligne** : Message dédié si l'utilisateur n'est pas connecté à Internet
- ✅ **Partage** : Boutons de partage (X/Twitter, Facebook, copie de lien)
- ✅ **Favoris** : Sauvegardez vos villes favorites
- ✅ **Historique** : Les 5 dernières recherches sont conservées
- ✅ **Thèmes multiples** : 4 thèmes disponibles (light, dark, cupcake, winter)
- ✅ **Design responsive** : Optimisé pour mobile, tablette et desktop
- ✅ **Notifications élégantes** : Gestion des erreurs avec SweetAlert2
- ✅ **localStorage** : Persistance des données (favoris, historique, thème)

## 🚀 Technologies utilisées

- **React 19** : Bibliothèque JavaScript pour créer des interfaces utilisateur
- **Vite** : Build tool ultra-rapide
- **TailwindCSS** : Framework CSS utility-first
- **DaisyUI** : Composants UI pour TailwindCSS
- **SweetAlert2** : Alertes et modales élégantes
- **Material Symbols** : Icônes Google
- **OpenWeather API** : Données météorologiques en temps réel
- **API Adresse (data.gouv.fr)** : Autocomplétion des villes françaises

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-nom/runtrackReact.git
cd runtrackReact/meteo-app
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'API OpenWeather

1. Créez un compte sur [OpenWeather](https://openweathermap.org/api)
2. Récupérez votre clé API dans la section "API Keys"
3. Copiez le fichier `.env.example` en `.env`
4. Remplacez `votre_cle_api_ici` par votre clé API

```bash
# .env
VITE_WEATHER_API_KEY=votre_vraie_cle_api
```

⚠️ **Important** : Attendez quelques minutes après l'inscription pour que la clé API soit activée.

### 4. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173)

## 🏗️ Structure du projet

```
meteo-app/
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx      # Barre de recherche
│   │   ├── Weather.jsx         # Affichage météo
│   │   ├── Favorites.jsx       # Gestion des favoris
│   │   ├── History.jsx         # Historique des recherches
│   │   └── ThemeToggle.jsx     # Changement de thème
│   ├── App.jsx                 # Composant principal
│   ├── main.jsx                # Point d'entrée
│   └── index.css               # Styles globaux
├── .env                        # Variables d'environnement (à créer)
├── .env.example                # Exemple de configuration
├── package.json
└── README.md
```

## 🎯 Utilisation

### Rechercher une ville

1. Entrez le nom d'une ville dans la barre de recherche
2. Cliquez sur "Rechercher" ou appuyez sur Entrée
3. Les informations météo s'affichent instantanément

### Gérer les favoris

- Cliquez sur l'étoile ⭐ pour ajouter une ville aux favoris
- Cliquez sur une ville favorite pour afficher sa météo
- Supprimez un favori avec le bouton ❌

### Utiliser l'historique

- Les 5 dernières recherches sont automatiquement sauvegardées
- Cliquez sur une ville de l'historique pour la rechercher à nouveau

### Autocomplétion des villes

- Commencez à taper le nom d'une ville (au moins 3 lettres)
- Une liste de suggestions apparaît sous la barre de recherche
- Cliquez sur une suggestion pour lancer directement la recherche

### Changer de thème

- Cliquez sur le bouton en haut à droite
- 4 thèmes disponibles : Light, Dark, Cupcake, Winter

## 📱 Responsive Design

L'application est entièrement responsive et s'adapte à tous les écrans :

- 📱 **Mobile** : < 640px
- 📱 **Tablette** : 640px - 1024px
- 💻 **Desktop** : > 1024px

## 🛠️ Commandes disponibles

```bash
# Lancer en mode développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint
```

## 🧪 Hooks React utilisés

### useState

Gestion des états locaux (ville recherchée, données météo, favoris, historique)

### useEffect

- Chargement des données au montage du composant
- Appels API lors du changement de ville
- Chargement des données depuis localStorage

### useCallback

- Mémorisation des handlers (recherche, favoris, historique, unité, géolocalisation)
- Évite les appels API répétés et les re-rendus inutiles

## 💾 localStorage

L'application utilise localStorage pour persister :

- **favorites** : Liste des villes favorites
- **searchHistory** : Historique des 5 dernières recherches
- **theme** : Thème sélectionné par l'utilisateur

## ⚠️ Gestion des erreurs

- Ville introuvable (404)
- Clé API invalide ou non activée (401)
- Problèmes réseau
- Erreurs de parsing JSON

Toutes les erreurs sont affichées avec SweetAlert2 pour une meilleure UX.

## 🎨 Personnalisation

### Ajouter un thème DaisyUI

Modifiez `tailwind.config.js` :

```javascript
daisyui: {
  themes: ["light", "dark", "cupcake", "winter", "forest", "aqua"],
}
```

### Changer les couleurs

Les couleurs sont gérées par DaisyUI et TailwindCSS. Consultez la [documentation DaisyUI](https://daisyui.com/docs/themes/).

## 🚧 Améliorations futures (Bonus)

- [x] Prévisions sur 5 jours
- [x] Géolocalisation automatique
- [x] Graphiques de température
- [x] Animations météo
- [x] Choix Celsius/Fahrenheit
- [x] Mode hors ligne
- [x] Partage sur les réseaux sociaux

## 📄 Licence

Ce projet est développé dans un cadre pédagogique.

## 👨‍💻 Auteur

Développé avec ❤️ pour apprendre React, useEffect, localStorage et les appels API.

---

**OpenWeather API** : [https://openweathermap.org/api](https://openweathermap.org/api)
