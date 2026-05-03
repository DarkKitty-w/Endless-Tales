# 🎮 Endless Tales — Aventure Textuelle IA 🧙‍♂️

**Endless Tales** est un jeu d’aventure textuel nouvelle génération où chaque histoire est narrée, façonnée et gérée par un **Game Master IA** 🤖.  
Le système va bien au‑delà d’une simple suite de prompts : il s’agit d’un véritable **moteur de jeu narratif**, doté de logique interne, d’évolution de personnage, d’événements dynamiques et d’un monde réactif.

---

## 🌟 Caractéristiques principales

### 🛠️ Personnalisation Totale du Monde

En mode **Custom**, vous définissez entièrement votre univers :

* 🏰 Genre (Fantasy, Sci‑Fi, Horreur…)
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

### 🌐 **Multi‑Provider AI** – Choisissez votre moteur d’IA

Endless Tales prend désormais en charge plusieurs fournisseurs d’IA, vous permettant de choisir celui qui correspond le mieux à vos besoins :

| Fournisseur | Modèle par défaut | Connexion | Coût |
|------------|------------------|-----------|------|
| **Google Gemini** | `gemini-2.5-flash` | API Cloud | Gratuit / Payant selon quota |
| **OpenAI** | `gpt-4o` | API Cloud | Payant |
| **Anthropic Claude** | `claude-3-5-sonnet` | API Cloud | Payant |
| **DeepSeek** | `deepseek-chat` | API Cloud | Payant |
| **🖥️ WebLLM (Local)** | *Choix utilisateur* | 100 % local (WebGPU) | **Gratuit** |

* **WebLLM** exécute des modèles d’IA directement dans votre navigateur (via `@mlc-ai/web-llm`).  
  Aucune clé API, aucune donnée ne quitte votre machine.  
  Modèles disponibles : TinyLlama, Qwen 2.5, Llama 3.2, Phi‑3, Mistral 7B, etc.

---

### 🧙‍♂️ Mécaniques JDR

* **Stats :** FOR (STR), END (STA), SAG (WIS)
* **Lancers de dés :** d6, d10, d20 (calculés côté code)
* **Compétences :** arbre dynamique généré par l’IA
* **Barres :** Santé / Endurance / Mana
* **Effets de statut :** buffs et débuffs temporaires (ex : “Affaibli” après une résurrection)
* **Carte du monde** mise à jour dynamiquement par l’IA

---

### 🖥️ Technique

* **Next.js 16** / React 19
* **State management** complexe via `useReducer`
* **UI moderne :** Tailwind CSS + shadcn/ui + Lucide icons
* **Persistance** locale (`localStorage` / `sessionStorage`) avec migration de schéma
* **Architecture “Client‑First”**
* **Sécurité :** les clés API sont stockées uniquement en `sessionStorage` (effacées à la fermeture de l’onglet)

---

## 🚀 Installation

### 🛠️ Prérequis

* Node.js 18+
* npm ou yarn
* Une clé API pour le fournisseur de votre choix (sauf WebLLM)

### 📦 Étapes

```bash
git clone https://github.com/votre-utilisateur/votre-repo.git
cd votre-repo
npm install
```

**Optionnel – Support WebLLM (IA locale) :**

```bash
npm install @mlc-ai/web-llm
```

Lancez le serveur de développement :

```bash
npm run dev
```

L’application est disponible sur **[http://localhost:9002](http://localhost:9002)**.

> **Note :** Aucune clé API n’est nécessaire pour utiliser WebLLM. Les modèles sont téléchargés et exécutés localement dans votre navigateur.

---

## 🎯 Utilisation

### 🏠 Menu Principal

* 🎲 **Randomized** : aventure entièrement aléatoire
* 🛠️ **Custom** : paramètres d’univers personnalisés
* 📖 **Immersed** : aventures dans des univers existants (Harry Potter, Star Wars…)
* ⚙️ **Paramètres** : choix du fournisseur d’IA et entrée des clés API

### ⚙️ Configuration de l’Aventure

* Genre / Thème
* Système de magie
* Niveau technologique
* Ton narratif
* Fréquences : combats / énigmes / interactions sociales
* Difficulté & Permadeath ☠️

### 🧝‍♂️ Création de Personnage

Deux modes :

* **Formulaire simple** (nom, classe, traits, etc.)
* **Description textuelle** (génération IA complète du profil)

### 🎮 Pendant la Partie

* Narration évolutive générée par l’IA
* Choix prédéfinis **ou actions libres**
* Mise à jour automatique : santé, XP, compétences, réputation…
* Carte du monde qui s’enrichit au fil de l’histoire
* Indicateur en temps réel du fournisseur d’IA utilisé

### 🏁 Fin d’Aventure

* Résumé généré par l’IA
* Journal sauvegardé dans le navigateur

---

## 🌍 WebLLM – IA Locale (Détails)

* **Fonctionne entièrement hors‑ligne** une fois le modèle téléchargé
* **Choix du modèle** dans les paramètres (taille, performance, recommandations automatiques selon votre mémoire)
* **Progression du téléchargement** affichée en temps réel
* **Cache persistant** : option pour conserver le modèle entre deux sessions (IndexedDB)
* **Nettoyage facile** : bouton pour supprimer les modèles téléchargés et libérer de l’espace
* **Détection matérielle** : WebGPU et mémoire estimée

---

## 👥 Multijoueur Coopératif

Le jeu supporte des sessions **P2P** via WebRTC.  
Fonctionnalités disponibles :
* 🎮 **Lobby de création/rejoindre** une partie (via offer/answer QR code ou copier-coller)
* 💬 **Chat en temps réel** entre joueurs
* 🤝 **Interactions entre joueurs** : trade, gift, duel (avec dialogue d'acceptation)
* 📊 **Gestion de la partie** : tour par tour, pause, ordre des tours, expulsion (kick)
* 🔄 **Synchronisation de l'état** : personnages, inventaire, carte du monde
* 🔃 **Reconnexion automatique** en cas de déconnexion

> **Note :** Nécessite un navigateur compatible WebRTC (Chrome, Firefox, Edge récent).

---

## 🗂️ Structure du Projet

```
src/
├── ai/                 # Logique IA (multi‑providers)
│   ├── flows/          # Flux narratifs et systèmes
│   ├── schemas/        # Schémas des réponses JSON
│   └── ai-router.ts    # Routeur multi‑fournisseurs
├── app/                # Pages Next.js
├── components/
│   ├── screens/        # Pages complètes
│   ├── game/           # UI du gameplay
│   ├── gameplay/       # Actions, narration…
│   └── ui/             # Composants génériques Shadcn
├── context/            # State global (reducers)
├── lib/                # Utilitaires
├── services/           # Services (dés, futur networking)
└── types/              # TypeScript types
```

---

## ⚠️ Limitations actuelles

* **WebLLM** nécessite un navigateur compatible WebGPU (Chrome 113+, Edge 113+)
* Les modèles locaux (>2 Go) peuvent approcher les limites de stockage IndexedDB
* Le multijoueur P2P n’est pas encore actif
* Pas de support mobile natif (PWA possible mais non optimisé)

---

## 🚧 Roadmap

### 🚀 Priorité 1 – Stabilité

* ✅ Correction de tous les bugs critiques (V4)
* ✅ Support multi‑providers (Gemini, OpenAI, Claude, DeepSeek, WebLLM)
* 🔜 Finalisation des tâches HIGH (gestion asynchrone, recalcul des ressources, confirmation changement de classe)

### ✨ Priorité 2 – Gameplay & Expérience

* 🔜 Multijoueur P2P (WebRTC)
* 🔜 Améliorations UX (streaming pour toutes les actions, validation des clés API)
* 💡 Génération d’illustrations (portraits, cartes)
* 💡 Système de commerce / équipement

### 🔮 Priorité 3 – Architecture & Communauté

* Compression des sauvegardes (lz‑string)
* Headers de sécurité (CSP)
* Mode “Maître du Jeu Humain”
* Narration vocale (TTS)

---

## 📜 Licence

Publié sous licence **MIT**.
