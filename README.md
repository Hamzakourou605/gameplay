# La Disparition — Chapitre 1, Mission 1 : « Le message »

Jeu narratif construit avec **React** (front), **Flask** (API) et **MongoDB Atlas** (sauvegarde de la progression).

## Structure

```
mission1-game/
├── backend/          # API Flask + connexion MongoDB Atlas
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/         # Jeu React (chambre d'Adam, objets interactifs, téléphone)
    └── src/
        ├── App.jsx
        ├── App.css
        ├── api.js
        ├── assets/            ← tes images (chambre + portraits d'émotions)
        └── components/
```

## 1. Lancer le backend (Flask + MongoDB Atlas)

```bash
cd backend
python -m venv venv
source venv/bin/activate      # (Windows: venv\Scripts\activate)
pip install -r requirements.txt

cp .env.example .env
# → ouvre .env et colle ta vraie connection string MongoDB Atlas dans MONGODB_URI
#   (Atlas > Database > Connect > Drivers > Python)

python app.py
```

L'API tourne sur `http://localhost:5000`. Vérifie que tout est connecté :

```bash
curl http://localhost:5000/health
```

> Si MongoDB n'est pas encore configuré, le jeu fonctionne quand même : il joue simplement "hors-ligne" (la progression n'est pas sauvegardée), le HUD l'indique en haut à droite.

## 2. Lancer le frontend (React)

Dans un autre terminal :

```bash
cd frontend
npm install
npm start
```

Le jeu s'ouvre sur `http://localhost:3000`.

## 3. Comment jouer

- **Flèches directionnelles** (ou ZQSD) : déplacer Yanis dans la chambre.
- **Entrée** : interagir avec l'objet le plus proche quand le prompt `[Entrée] ...` apparaît.
- Ordre suggéré : **laptop → radio → feuille**, puis continue d'explorer : le **téléphone** d'Adam se révèle (halo rouge pulsant) une fois ces trois objets examinés.
- Prendre le téléphone déclenche : le message d'Adam (effet machine à écrire) → les réactions émotionnelles de Yanis (Surprise → Choc → Inquiétude → Détermination, avec les portraits que tu as fournis) → l'indice de localisation (**Café Nova, 21:30**) → l'écran **MISSION TERMINÉE**.
- La photo et le carnet sont aussi examinables (petites observations d'ambiance), comme dans le script.

## 4. Ajuster les positions des objets

Les coordonnées des objets interactifs (en % de l'image de la chambre) sont dans
`frontend/src/App.jsx`, tout en haut, dans l'objet `OBJECTS`. Modifie `x` et `y`
pour les faire correspondre pile à ton image `roomm1.png` si besoin :

```js
const OBJECTS = {
  laptop:  { x: 79, y: 60, label: "Interagir (Laptop)" },
  radio:   { x: 67, y: 56, label: "Écouter la radio" },
  feuille: { x: 61, y: 61, label: "Examiner la feuille" },
  photo:   { x: 14, y: 21, label: "Regarder la photo" },
  carnet:  { x: 40, y: 23, label: "Examiner le carnet" },
  phone:   { x: 17, y: 85, label: "Prendre le téléphone" },
};
```

## 5. Images utilisées

| Fichier fourni                        | Utilisé pour                                   |
|----------------------------------------|-------------------------------------------------|
| `roomm1.png`                           | Décor de la chambre d'Adam                      |
| `alert_.png`                           | Émotion **Surprise**                            |
| `fear.png`                             | Émotion **Choc / Peur**                         |
| `paramoid_whisperimg.png`              | Émotion **Inquiétude / méfiance**               |
| `desperate_urgemt.png`                 | Émotion **Détermination**                       |
| `exhausted_relieved.png`               | Émotion **Calme / neutre**                      |
| `static_glitch_imterferemce.png`       | Émotion **Interférence** (dispo pour la radio)  |

## 6. API disponible (backend)

| Méthode | Route          | Description                                    |
|--------|-----------------|-------------------------------------------------|
| GET    | `/health`       | Statut du serveur + connexion MongoDB           |
| GET    | `/api/state`    | Récupère la progression du joueur               |
| POST   | `/api/state`    | Sauvegarde la progression (objets, mission...)  |
| POST   | `/api/clue`     | Ajoute un indice (ex: la localisation)          |
| POST   | `/api/reset`    | Réinitialise la progression du joueur           |

## 7. Suite (Mission 2)

Le code prévoit déjà le déblocage de **« Mission 2 — Le carnet »** à la fin (sauvegardé
dans `next_mission_unlocked`). Il ne reste qu'à créer la scène suivante en suivant le même
modèle (nouveau composant + nouveaux hotspots).
