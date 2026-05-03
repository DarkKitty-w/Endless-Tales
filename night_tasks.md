# Travail de nuit – Endless Tales

Tu es un développeur senior. Travaille dans cet ordre, sans boucle infinie.
Arrête-toi dès que la dernière tâche est terminée.

## 1. Bug Detection & Logical Errors
- Parcours les reducers (src/context/reducers/) et corrige toute incohérence logique (conditions impossibles, variables non utilisées, mutations incorrectes de l’état).
- Vérifie les appels aux AI flows (src/ai/flows/) : les schémas Zod correspondent-ils bien aux réponses attendues ?
- Corrige les erreurs évidentes sans casser le flux de jeu.
- **Commit** avec "fix: bugs logiques détectés"

## 2. Polish & UX Consistency
- Dans les composants de gameplay (src/components/gameplay/), assure-toi que les labels, messages d'erreur et textes d'info sont cohérents et sans fautes.
- Vérifie que les thèmes (src/lib/themes.ts) sont bien appliqués partout, sans classes manquantes.
- Harmonise la terminologie (ex : "aventure" vs "partie", "compétence" vs "skill"…).
- **Commit** avec "polish: cohérence UX"

## 3. Performance & Efficiency
- Identifie les boucles ou appels inutiles dans les hooks (src/hooks/) et les services.
- Vérifie que l’état n’est pas recalculé inutilement dans les composants.
- Optimise les appels à l’AI proxy s’ils sont trop fréquents.
- **Commit** avec "perf: optimisations légères"

## 4. Security & Data Exposure
- Vérifie qu’aucune clé API n’est exposée en dur dans le code (regarde src/app/api/ai-proxy/route.ts).
- Vérifie que les données sensibles envoyées au client sont limitées (par ex. ne pas exposer l’état complet du serveur).
- Assure-toi que les validations Zod sont robustes contre les données malveillantes.
- **Commit** avec "security: vérification exposition données"

## 5. Code Quality & Maintainability
- Ajoute des commentaires là où le code est complexe (notamment dans le multi-player WebRTC, src/lib/webrtc-signalling.ts).
- Réfactorise les fonctions trop longues (si une fonction dépasse 50 lignes, découpe-la).
- Renomme les variables ambiguës.
- **Commit** avec "quality: lisibilité du code"

## 6. Error Handling & Diagnostics
- Ajoute ou améliore les blocs try/catch autour des appels à l’IA, des actions multiplayer, et des sauvegardes locales.
- Assure-toi que les erreurs sont remontées proprement (toasts, affichage dans l’interface).
- Dans les reducers, gère les cas d’erreur (action invalide, etc.).
- **Commit** avec "error-handling: meilleure gestion des erreurs"

## 7. Accessibility & Inclusivity
- Si le projet a une interface, vérifie que les éléments interactifs ont des labels aria, que les images ont des alt, que les contrastes sont suffisants.
- Assure-toi que le texte est lisible avec une taille de police minimum.
- Ajoute les attributs `role` et `tabIndex` manquants.
- **Commit** avec "a11y: accessibilité améliorée"

Une fois les 7 étapes terminées, tu t’arrêtes. Pas de recommencement.