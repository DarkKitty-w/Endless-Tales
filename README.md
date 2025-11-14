# 🎮 Endless Tales : Une Aventure Textuelle IA 🧙‍♂️

Bienvenue dans **Endless Tales**, un jeu d'aventure textuel nouvelle génération où vos choix façonnent une histoire unique, narrée et gérée par un **Game Master IA** 🤖. Construit avec **Genkit** et **Google Gemini**, ce projet utilise une IA pour contrôler dynamiquement l'histoire, la progression de votre personnage, vos relations et le monde qui vous entoure.

Ce projet ne se contente pas d'enchaîner des prompts ; il s'agit d'un **système de jeu complet** où l'IA agit comme un maître du jeu conscient des règles, grâce à des flux de logique complexes.

---

## 🌟 Piliers du projet

### 🛠️ Personnalisation Extrême

Avant de commencer, vous ne choisissez pas seulement un scénario ; vous construisez le vôtre. En mode **Custom**, vous définissez :

* 🏰 Genre (Fantasy, Sci-Fi, Horreur)
* ✨ Système de magie (Haut, Bas, Aucun)
* ⚙️ Niveau technologique (Primitif, Futuriste)
* 🎭 Ton dominant (Sérieux, Comique)
* ⚔️ Fréquence des combats, énigmes et interactions sociales

L'IA utilise ces paramètres comme sa "bible" pour générer l'aventure.

### 🤖 IA en tant que Maître du Jeu

L'IA n'est pas un simple narrateur. C'est un **MJ actif** :

* 📝 Gestion de la fiche de personnage
* 📈 Progression des compétences (`progressedToStage`)
* 🛡️ Réputation auprès des factions
* 💬 Relations PNJ
* ⭐ Attribution d'XP (`xpGained`)
* 🎲 Déclenchement d'événements dynamiques

### 👥 Multijoueur Coopératif

Construit sur **Firebase**, le jeu supporte des sessions multijoueur en temps réel. Les actions de chaque joueur impactent le monde partagé 🌍.

---

## 🚀 2. Installation

### 🛠️ Prérequis

* Node.js (v18+)
* npm ou yarn
* Compte Firebase
* Clé d'API Google AI

### 📦 Instructions

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
GOOGLE_GENAI_API_KEY=VOTRE_CLE_API_GOOGLE_AI
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

Lancez l'application :

**Terminal 1 (Next.js) :**

```bash
npm run dev
```

Disponible sur [http://localhost:9002](http://localhost:9002) 🌐

**Terminal 2 (Serveur IA Genkit) :**

```bash
npm run genkit:dev
```

Démarre l'API locale pour tous les flux d'IA.

---

## 🎯 3. Usage

### 🏠 Menu Principal

* 🎲 **Randomized** : aventure rapide générée aléatoirement
* 🛠️ **Custom** : personnalisation complète
* 📖 **Immersed** : aventure dans un univers narratif existant
* 👥 **Co-op** : rejoindre ou héberger une session multijoueur

### ⚙️ Configuration de l'Aventure

* Genre/Thème
* Système de Magie
* Niveau Technologique
* Ton Dominant
* Fréquence des combats / énigmes / interactions sociales
* Niveau de difficulté & Permadeath ☠️

### 🧝‍♂️ Création de Personnage

* Formulaire Simple 📝
* Description Textuelle ✍️ (IA génère la fiche complète)

### 🎮 Phase de Jeu

* Recevez narration & choix de l'IA
* Sélection d'action ou action personnalisée
* L'IA renvoie un objet JSON avec changements d'état (santé, XP, compétences, réputation)

### 🏁 Fin d'Aventure

* Résumé généré par l'IA
* Journal sauvegardé dans `localStorage` 📚

---

## ⚔️ 4. Fonctionnalités

* 🤖 IA Maître du Jeu (Genkit & Gemini)
* 🎨 Personnalisation poussée
* 🧙‍♂️ Génération de personnage par IA
* 🔧 Logique de jeu pilotée par IA

### 🏹 Mécaniques de JDR

* STR, STA, WIS 📊
* Lancers de dés côté serveur 🎲
* Compétences de départ selon classe
* Gestion d'état avec +40 actions possibles

### 🖥️ Client & Multijoueur

* `useReducer` modulaire
* Multijoueur coopératif en temps réel 🌐
* Thématisation dynamique & mode sombre 🌙
* Persistance locale des préférences et aventures terminées

---

## 🗂️ 5. Structure des Dossiers

```
src/
├── ai/                 # Cœur de l'IA (Genkit)
│   ├── flows/          # Logique (narrate-adventure.ts, attempt-crafting.ts)
│   ├── schemas/        # Structures Zod
│   └── ai-instance.ts
├── app/                # Pages Next.js
├── components/
│   ├── screens/        # Pages complètes (MainMenu, Gameplay...)
│   ├── game/           # UI spécifique au jeu
│   ├── gameplay/       # Éléments interactifs
│   └── ui/             # Composants génériques
├── context/            # Gestion de l'état global
│   ├── reducers/       
│   ├── GameContext.tsx
│   ├── game-reducer.ts
│   ├── game-actions.ts
│   └── game-initial-state.ts
├── lib/                # Utilitaires
├── services/           # Logique métier
└── types/              # Types TypeScript
```

---

## 🛠️ 6. Tech Stack

* Next.js v15+ 🌐
* TypeScript 🔒
* Genkit + Google Gemini 2.0 Flash 🤖
* React 18 + shadcn/ui + Tailwind CSS 🎨
* Firebase Auth + Firestore 💾
* React Context API + useReducer 📦
* Zod pour validation 🔍

---

## ⚠️ 7. Bugs / Problèmes Connus

* `gameState` en chaîne de caractères (fragile)
* Pas de sauvegarde en cours 🕒
* Dérive IA sur longues aventures 🧠

---

## 🚧 8. TODO / Roadmap

* 🔄 Refactoriser `gameState` en JSON
* 💾 Sauvegarde de l'aventure en cours
* 💬 Chat multijoueur
* 🧠 Améliorer mémoire IA
* ⚡ Développer flux artisanat & compétences

---

## 📜 9. Licence

Le projet est actuellement **privé** (`"private": true`). Pour le rendre open-source, ajouter un fichier LICENSE (ex: MIT, Apache 2.0).
