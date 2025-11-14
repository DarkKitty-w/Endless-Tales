# Endless Tales : Une Aventure Textuelle IA

Bienvenue dans **Endless Tales**, un jeu d'aventure textuel (text-based RPG) nouvelle génération où vos choix façonnent une histoire unique, narrée et gérée par un **Game Master IA**. Construit avec **Genkit** et **Google Gemini**, ce projet utilise une IA pour contrôler dynamiquement non seulement l'histoire, mais aussi la progression de votre personnage, vos relations et le monde qui vous entoure.

Ce projet ne se contente pas d'enchaîner des prompts ; il s'agit d'un **système de jeu complet** où l'IA agit comme un maître du jeu conscient des règles, grâce à des flux de logique complexes.

## Piliers du projet

### Personnalisation Extrême

Avant de commencer, vous ne choisissez pas seulement un scénario ; vous construisez le vôtre. En mode **Custom**, vous définissez :

* Genre (Fantasy, Sci-Fi, Horreur)
* Système de magie (Haut, Bas, Aucun)
* Niveau technologique (Primitif, Futuriste)
* Ton dominant (Sérieux, Comique)
* Fréquence des combats, énigmes et interactions sociales

L'IA utilise ensuite ces paramètres comme sa "bible" pour générer l'aventure.

### IA en tant que Maître du Jeu

L'IA n'est pas un simple narrateur passif. C'est un **MJ actif**. Le flux de narration principal renvoie un objet JSON structuré qui peut modifier l'état du jeu :

* Gestion de la fiche de personnage
* Progression des compétences (`progressedToStage`)
* Réputation auprès des factions
* Relations PNJ
* Attribution d'XP (`xpGained`)
* Déclenchement d'événements dynamiques

### Multijoueur Coopératif

Construit sur **Firebase** (Authentification Anonyme et Firestore), le jeu prend en charge des sessions multijoueur en temps réel. Les joueurs peuvent rejoindre un lobby et l'état du jeu est synchronisé entre tous les participants.

---

## 2. Installation

### Prérequis

* Node.js (v18+)
* npm ou yarn
* Un compte Firebase
* Une clé d'API Google AI

### Instructions

Clonez le dépôt :

```bash
git clone https://github.com/votre-utilisateur/votre-repo.git
cd votre-repo
```

Installez les dépendances :

```bash
npm install
# ou
yarn install
```

Créez un fichier `.env.local` et ajoutez vos clés :

```env
# Clé pour l'IA (défini dans src/ai/ai-instance.ts)
GOOGLE_GENAI_API_KEY=VOTRE_CLE_API_GOOGLE_AI

# Clés pour Firebase (src/lib/firebase.ts)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Lancez l'application (serveur de développement et Genkit) :

**Terminal 1 (Next.js) :**

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:9002](http://localhost:9002).

**Terminal 2 (Serveur IA Genkit) :**

```bash
npm run genkit:dev
```

Cela démarre l'API locale que le client Next.js interroge pour tous les flux d'IA.

---

## 3. Usage

### Menu Principal

* **Randomized** : aventure rapide générée aléatoirement
* **Custom** : personnalisation complète
* **Immersed** : aventure dans un univers narratif existant
* **Co-op** : rejoindre ou héberger une session multijoueur

### Configuration de l'Aventure

Si vous choisissez **Custom**, configurez :

* Genre/Thème
* Système de Magie
* Niveau Technologique
* Ton Dominant
* Fréquence des combats / énigmes / interactions sociales
* Niveau de difficulté et option de mort permanente

### Création de Personnage

* **Formulaire Simple** : nom, classe, traits, connaissances
* **Description Textuelle** : l'IA génère la fiche complète à partir de votre description

### Phase de Jeu

* Recevez une narration et 4 choix de l'IA
* Sélectionnez un choix ou tapez une action personnalisée
* L'IA renvoie un objet JSON avec les changements d'état (santé, XP, compétences, réputation)

### Fin d'Aventure

* Résumé généré par l'IA
* Journal complet sauvegardé dans `localStorage`

---

## 4. Fonctionnalités

* **IA Maître du Jeu** : gestion complète du jeu via Genkit & Gemini
* **Personnalisation Poussée** : IA briefée avec les choix du joueur
* **Génération de Personnage par IA**
* **Logique de Jeu Pilotée par l'IA**

### Mécaniques de JDR

* Statistiques : STR, STA, WIS
* Lancers de dés serveur pour équité
* Compétences de départ selon la classe
* Gestion d'état avec plus de 40 actions possibles

### Client & Multijoueur

* Architecture `useReducer` modulaire
* Multijoueur coopératif synchronisé via Firebase
* Thématisation dynamique et mode sombre
* Persistance locale (préférences et aventures terminées)

---

## 5. Structure des Dossiers

```
src/
├── ai/                 # Cœur de l'IA (Genkit)
│   ├── flows/          # Logique (narrate-adventure.ts, attempt-crafting.ts)
│   ├── schemas/        # Structures Zod
│   └── ai-instance.ts
├── app/                # Pages Next.js
├── components/
│   ├── screens/        # Pages complètes (MainMenu, Gameplay...)
│   ├── game/           # UI spécifique au jeu (Carte, Inventaire...)
│   ├── gameplay/       # Éléments interactifs
│   └── ui/             # Composants génériques
├── context/            # Gestion de l'état global
│   ├── reducers/       
│   ├── GameContext.tsx
│   ├── game-reducer.ts
│   ├── game-actions.ts
│   └── game-initial-state.ts
├── lib/                # Utilitaires (firebase.ts, themes.ts...)
├── services/           # Logique métier
└── types/              # Types TypeScript
```

---

## 6. Tech Stack

* **Framework** : Next.js v15+
* **Langage** : TypeScript
* **IA** : Genkit + Google Gemini 2.0 Flash
* **UI** : React 18 + shadcn/ui + Tailwind CSS
* **Backend** : Firebase Auth + Firestore
* **État** : React Context API + useReducer
* **Validation** : Zod

---

## 7. Bugs / Problèmes Connus

* `gameState` en chaîne de caractères (fragile)
* Pas de sauvegarde en cours
* Dérive de l'IA sur aventures très longues

---

## 8. TODO / Roadmap

* Refactoriser `gameState` en JSON
* Sauvegarde de l'aventure en cours
* Chat multijoueur
* Améliorer la mémoire de l'IA
* Développer les flux d'artisanat et de compétences

---

## 9. Licence

Le projet est actuellement **privé** (`"private": true` dans package.json). Pour le rendre open-source, ajouter un fichier LICENSE (ex: MIT, Apache 2.0).
