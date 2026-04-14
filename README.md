# 🎮 Endless Tales — Aventure Textuelle IA 🧙‍♂️

**Endless Tales** est un jeu d’aventure textuel nouvelle génération où chaque histoire est narrée, façonnée et gérée par un **Game Master IA** 🤖.
Basé sur le **SDK Google GenAI** et **Gemini**, ce système va bien plus loin qu’une simple suite de prompts : il s’agit d’un véritable **moteur de jeu narratif**, doté de logique interne, d’évolution de personnage, d’événements dynamiques et d’un monde réactif.

---

## 🌟 Caractéristiques principales

### 🛠️ Personnalisation Totale du Monde

En mode **Custom**, vous définissez entièrement votre univers :

* 🏰 Genre (Fantasy, Sci-Fi, Horreur…)
* ✨ Système de magie (Haute magie, basse magie, aucune)
* ⚙️ Niveau technologique (Primitif → Futuriste)
* 🎭 Ton dominant (Sérieux, Ironique, Comique)
* ⚔️ Fréquences des combats, énigmes et interactions sociales

L’IA s’en sert comme base pour générer une histoire **totalement cohérente**.

---

### 🤖 Un Maître du Jeu IA

L’IA joue le rôle de **MJ actif**, capable de :

* 📝 Gérer la fiche de personnage
* 📈 Faire progresser vos compétences (`progressedToStage`)
* 🛡️ Suivre la réputation auprès des factions
* 💬 Gérer les relations avec les PNJ
* ⭐ Attribuer l’XP (`xpGained`)
* 🎲 Déclencher des événements dynamiques selon vos choix

---

### 👥 Multijoueur Coopératif *(désactivé temporairement)*

Le jeu est conçu pour fonctionner en **FP2P** pour des sessions coopératives.
La fonctionnalité est actuellement en maintenance mais pleinement architecturée.


## 🎯 Utilisation

### 🏠 Menu Principal

* 🎲 **Randomized** : aventure entièrement aléatoire
* 🛠️ **Custom** : paramètres d’univers personnalisés
* 📖 **Immersed** : aventures dans des univers existants (Harry Potter, Star Wars…)
* ⚙️ **Paramètres** : entrée de la clé API Google

### ⚙️ Configuration de l’Aventure

* Genre / Thème
* Système de magie
* Niveau technologique
* Ton narratif
* Fréquences : combats / énigmes / interactions sociales
* Difficulté & Permadeath ☠️

### 🧝‍♂️ Création de Personnage

Deux modes :

* Formulaire simple
* Description textuelle (génération IA complète)

### 🎮 Pendant la Partie

* Narration évolutive générée par l'IA
* Choix prédéfinis **ou actions libres**
* Mise à jour automatique : santé, XP, compétences, réputation…

### 🏁 Fin d’Aventure

* Résumé généré par l’IA
* Journal sauvegardé dans le navigateur

---

## ⚔️ Fonctionnalités

### 🤖 IA Maître du Jeu

* Gestion narrative complète via **Gemini 2.0 Flash**
* Cohérence dynamique du monde et des événements

### 🧙‍♂️ Mécaniques JDR

* **Stats :** STR, STA, WIS
* **Lancers de dés :** d6, d10, d20 (calculés côté code)
* **Compétences :** arbre dynamique généré par l’IA
* **Barres :** Santé / Stamina / Mana

### 🖥️ Technique

* Next.js 15+ / React 18
* State management complexe via `useReducer`
* UI moderne : Tailwind + Shadcn + Lucide
* Persistance via `localStorage`
* Architecture “Client-First”

---


## 📜 Licence

Publié sous licence **MIT**.

