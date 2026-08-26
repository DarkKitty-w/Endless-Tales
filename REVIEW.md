# Rapport de revue QA — branche `night-fixes`

**Date :** 2026-08-26 · **Base de comparaison :** `origin/master` (~13 000 insertions, 113 fichiers)
**Périmètre :** 13 catégories de corrections nocturnes (bugs, polish_ux, performance, security, code_quality, error_handling, architecture, persistence, multiplayer, ai_coherence, observability, game_design, feature_gaps).

## Verdict global

✅ **Fusionnable après rotation de la clé API (F1).**
Revue en cinq passes : la première passe avait corrigé le chemin mort NET-14 (F2) ; la **seconde passe (QA indépendante)** a détecté et corrigé deux défauts résiduels dans ce même correctif (F3, commit `ec614cf`, poussé sur `origin/night-fixes`) ; la **troisième passe** a détecté et corrigé un défaut grave introduit par l'activation du chemin `RECONNECT_SYNC` en F3 (F4, commit `ef28864`) ; la **quatrième passe** a détecté un crash résiduel du garde-fou ajouté en F4 (F5) ; la **cinquième passe** a constaté que le correctif F5 **n'était pas présent dans le code poussé** (`ef28864` déstructurait toujours le payload avant tout garde) et l'a **réappliqué, validé et poussé** (`29fcf1e`). La **sixième passe (cette revue)** confirme F5 dans le code poussé, mais détecte et corrige **quatre écarts supplémentaires (F6–F9)** — dont une perte silencieuse de sauvegardes (F6) et deux régressions fonctionnelles par rapport à `master` (F7, F8). Typecheck et build passent après correction. Un point d'hygiène de sécurité reste à traiter par l'utilisateur (F1).

## Constats

### F5 — MAJEUR (crash réseau, corrigé en cinquième passe, cette revue)
**Le garde « payload malformé » du cas `RECONNECT_SYNC` plantait sur un payload `null` — et le correctif annoncé en quatrième passe n'était en réalité pas dans le code poussé.**
Le cas `RECONNECT_SYNC` (`src/context/reducers/multiplayerReducer.ts`) déstructurait `const { gameState, ... } = action.payload` **avant** tout garde : un payload `null`/non-objet levait `TypeError: Cannot destructure property 'gameState' of 'action.payload' as it is null`. Le commit `ef28864` (F4) et l'état de `origin/night-fixes` au démarrage de cette passe contenaient tous deux ce défaut, malgré la mention d'un correctif dans la version antérieure de ce rapport — le correctif F5 a donc été **réappliqué dans cette passe**.
Ce réducteur est alimenté par des messages WebRTC d'origine réseau : une exception dans un réducteur React est fatale au rendu plutôt que dégradée proprement.
→ *Correctif appliqué (cette passe) :* payload lu sans déstructuration préalable, garde `if (!payload || typeof payload !== 'object' || !payload.gameState || typeof payload.gameState !== 'object') return state;` placé **avant** toute extraction des champs.
→ *Validation :* harnais sur le **réducteur réel compilé** (`tsc` → CommonJS) — 16/16 assertions PASS post-fix : payloads malformés (`null`, `undefined`, `{}`, `gameState: null`, `gameState: "garbage"`) ignorés sans lever ni muter l'état ; contrat fonctionnel intact (champs de gameplay adoptés depuis l'hôte, identité de transport invité préservée, `currentTurnIndex: 0` honoré, `isMyTurn` recalculé côté pair, fallbacks partiels). Le même harnais exécuté sur le code pré-fix **reproduit la TypeError** sur payload `null`, prouvant que le test détecte bien le défaut. `npm run typecheck` : 0 erreur.

### F6 — MAJEUR (perte de données, corrigé en sixième passe, cette revue)
**Les sauvegardes échouant au schéma strict étaient supprimées silencieusement du disque.**
`persistNow` (`src/context/GameContext.tsx`) filtrait les `savedAdventures` sur `validateSavedAdventure` (zod strict) : toute partie non conforme était retirée de la liste **persistée**, donc effacée du localStorage au prochain cycle d'écriture atomique. Master persistait chaque partie — la branche a donc introduit une perte de données durable pour tout save légèrement hors schéma (ex. champ optionnel absent d'une ancienne version). La notification toast signalant ces exclusions a de surcroît été supprimée par un correctif nocturne, rendant la perte totalement muette.
→ *Correctif :* les saves invalides passent désormais par `repairSaveData` (même chemin que le chargement, SAVE-15) ; si la réparation échoue, ils sont conservés tels quels afin de retenter au prochain chargement. Plus aucune suppression silencieuse.

### F7 — MODÉRÉ (régression vs master, corrigé en sixième passe, cette revue)
**Dépendances manquantes dans l'effet de diffusion de l'état du groupe (`Gameplay.tsx`).**
L'effet qui diffuse `partyState` aux invités n'avait plus `state.character` ni `state.inventory` dans ses deps (présents sur master). Conséquence : fermetures obsolètes — PV/XP modifiés ou objets fabriqués ne sont plus propagés aux pairs tant qu'un autre changement (longueur du journal, connexion) ne redéclenche pas l'effet.
→ *Correctif :* deps restaurées (`[state.storyLog.length, state.character, state.inventory, isConnected]`).

### F8 — MODÉRÉ (migration manquante, corrigé en sixième passe, cette revue)
**Clé Gemini legacy orpheline après mise à niveau depuis master.**
Master stockait la clé Gemini dans `sessionStorage["userGoogleAiApiKey"]`. La branche lit toujours cette valeur comme fallback mais n'a aucune migration : un utilisateur sans clé BYOK perdait sa clé fonctionnelle.
→ *Correctif :* au cycle de persistance, la clé legacy est lue, injectée via `SET_USER_API_KEY`, puis purgée du `sessionStorage` (no-op si absente/inexistante).

### F9 — MINEUR (hygiène données, corrigé en sixième passe, cette revue)
**Sauvegardes de secours épargnées par « Réinitialiser les données ».**
Les backups `_savebackup_*` créés par SAVE-14 (`createSaveBackup`) n'étaient pas couverts par le périmètre de `resetAllLocalData` (`src/lib/data-reset.ts`) : « Réinitialiser » laissait des copies potentiellement obsolètes des parties sur l'origine.
→ *Correctif :* `SAVE_BACKUP_PREFIX` exporté depuis `storage-utils.ts` et ajouté aux préfixes nettoyés.

### F1 — CRITIQUE (sécurité, action utilisateur requise)
**Exposition d'une clé API OpenRouter active** dans `config.toml` (non suivi par git).
- La branche a correctement ajouté `config.toml` à `.gitignore` et le fichier n'a jamais été commité — aucune fuite dans l'historique git.
- ⚠️ **La clé doit être révoquée/rotée dans le tableau de bord OpenRouter** : elle est stockée en clair sur disque et a transité dans des sorties de terminal locaux. Recommandation : rotation immédiate, puis chargement via variables d'environnement uniquement.

### F2 — MAJEUR (fonctionnel, corrigé dans cette revue)
**NET-14 incomplet : la resynchronisation d'état invité n'était jamais appliquée.**
Le flux complet existait : `request-sync` (invité) → `sync-response` avec snapshot complet (hôte) → callback `onControlMessage('sync-complete')`. Mais :
1. `Gameplay.tsx` se contentait de *logger* le message `sync-complete` — aucun `dispatch`.
2. L'action `RECONNECT_SYNC` (cas présent dans `multiplayerReducer.ts`) était absente de l'ensemble de routage `MULTIPLAYER_ACTIONS` de `game-reducer.ts` : même un dispatch aurait été ignoré.

Conséquence : un invité reconnecté (ou en désaccord de checksum) ne convergeait jamais vers l'état autoritaire de l'hôte — divergence d'état persistante. Comportement identique sur `master` (défaut latent, donc **pas une régression**), mais la promesse du fix NET-14 n'était pas tenue.

**Correctif appliqué :**
- `src/context/game-reducer.ts` : ajout de `"RECONNECT_SYNC"` à `MULTIPLAYER_ACTIONS`.
- `src/components/screens/Gameplay.tsx` : dispatch de `RECONNECT_SYNC` (payload `{gameState, partyState, turnOrder, currentTurnIndex}`) à la réception de `sync-complete`.

### F3 — MAJEUR (fonctionnel, corrigé en seconde passe, commit `ec614cf`)
**Le correctif NET-14 (F2) restait incomplet : deux défauts résiduels dans la chaîne de resync.**

1. **Snapshot hôte non branché.** `useMultiplayer` expose un callback `getGameStateSnapshot` précisément pour répondre aux demandes `request-sync` des invités ; aucun appelant ne le fournissait (`Gameplay.tsx` comme `CoopLobby.tsx`). L'hôte répondait donc avec son propre `MultiplayerState` interne au hook — or le réducteur fait `...gameState` : les champs de transport du hook (`peerId`, `sessionId`, `connectionStatus`, `isHost`, `peers`…) écrasaient ceux de l'invité, et tous les champs de gameplay (`character`, `storyLog`, `inventory`, `worldMap`…) restaient ceux d'avant déconnexion. La resync convergeait en apparence tout en corrompant l'état.
   → *Correctif :* `Gameplay.tsx` fournit désormais `getGameStateSnapshot` retournant le `GameState` autoritaire (via `gameStateRef`) avec `partyState`/`turnOrder`/`currentTurnIndex`.

2. `isMyTurn` recalculé sur l'état déjà fusionné et index `0` traité comme absent. Dans le cas `RECONNECT_SYNC` du réducteur : `turnOrder[currentTurnIndex || 0] === state.peerId` s'exécute **après** `...state, ...gameState` — `state.peerId` y vaut celui de l'hôte (le snapshot étant complet, cf. point 1), donc `isMyTurn` était faux pour tout invité. Par ailleurs `currentTurnIndex || state.currentTurnIndex` remplace un index légitime `0` par l'ancien index local. → *Correctif :* valeurs résolues une fois (`??`), puis `isMyTurn = nextTurnOrder.length > 0 && nextTurnOrder[nextTurnIndex] === state.peerId` calculé sur l'état pré-fusion (convention identique à `SET_TURN_ORDER`/`ADVANCE_TURN`).

### F4 — MAJEUR (fonctionnel, corrigé en troisième passe, cette revue)
**Le spread `...gameState` dans le cas `RECONNECT_SYNC` écrasait l'identité de transport de l'invité.**
L'activation du chemin en F3 a rendu effectif un défaut latent : le snapshot hôte produit par `getGameStateSnapshot()` est un **`GameState` complet**, incluant les champs de transport de l'**hôte** (`peerId: 'host-…'`, `sessionId`, `isHost: true`, `connectionStatus`). Or le cas `RECONNECT_SYNC` faisait `{...state, ...gameState}` **sans** restaurer les champs locaux, contrairement au contrat déjà établi par `APPLY_REMOTE_STATE` (fix SAVE-11, qui préserve précisément `peerId`/`sessionId`/`isHost`/`connectionStatus`). Conséquences dès la première resync d'un invité :
- `peerId` de l'invité remplacé par celui de l'hôte → tous ses envois suivants portent un mauvais `senderId` (messages ignorés par correspondance de pairs) et `isMyTurn` est calculé contre le mauvais identifiant ;
- `isHost: true` adopté par l'invité → franchissement des gardes `PAUSE_GAME`/`KICK_PLAYER`, risque de boucles de resync ;
- `sessionId`/`connectionStatus`/`players` écrasés → une sauvegarde effectuée ensuite par l'invité persiste l'identité de l'hôte dans son localStorage.
Sur `master` ce chemin était mort (défaut non observable) ; la branche l'a activé, constituant donc bien une **régression introduite par la branche**.

**Correctif appliqué** (`src/context/reducers/multiplayerReducer.ts`, cas `RECONNECT_SYNC`) :
- restauration explicite après spread de `peerId`, `sessionId`, `isHost`, `connectionStatus` (même contrat que `APPLY_REMOTE_STATE`) ; la liste autoritaire des `players` reste fournie par l'hôte ;
- garde contre payload malformé (`gameState` absent/non-objet → état inchangé, plus de corruption sur message incomplet) ;
- résolution défensive des optionnels : `turnOrder` retombe sur la valeur locale si vide/non-tableau, `currentTurnIndex` si négatif/non-nombre.

**Validation (nouveau — réduit la « limite » notée précédemment) :** harnais exécutant le **réducteur réel compilé** (`tsc` → CommonJS, dépendances du dépôt incluses). 14 assertions couvrant : préservation de l'identité invité + adoption correcte des champs de gameplay, `currentTurnIndex: 0` honoré, `isMyTurn` vrai/faux selon le tour, payload `null` sans effet, fallbacks partiels. Résultat : **14/14 PASS sur le code corrigé** ; le même harnais échoue sur le code pré-fix (échoue sur `peerId`/`isHost`/`sessionId` et payload nul), prouvant que le test détecte bien la régression. `npm run typecheck` : 0 erreur.

## Vérifications effectuées

| Domaine | Résultat |
|---|---|
| Routage des actions (`ADVENTURE_ACTIONS` / `MULTIPLAYER_ACTIONS`) | ✅ Cohérent, handlers présents (`LOAD_SAVED_ADVENTURES`, `PEER_CONNECTED/DISCONNECTED`, `RECONNECT_SYNC`) |
| Resync multijoueur (NET-14) | ✅ Chaîne complète vérifiée hôte→invité ; dead-end corrigé (F2), défauts résiduels corrigés en seconde passe (F3), identité de transport préservée en troisième passe (F4), garde payload malformé réappliqué et validé en cinquième passe (F5) |
| Harnais réducteur (réel compilé, cas `RECONNECT_SYNC`) | ✅ 16/16 assertions PASS post-fix (F5, cinquième passe), dont 5 cas malformés et le contrat F4 (identité invité) ; le même harnais reproduit la TypeError sur le code pré-fix |
| Persistance (`SAVE-9`, sauvegarde/restauration) | ⚠️ Régression détectée et corrigée en sixième passe : perte silencieuse des saves hors schéma (F6) ; migration clé Gemini legacy ajoutée (F8) ; périmètre « Réinitialiser » complété (F9) |
| Diffusion d'état multijoueur (`partyState`) | ⚠️ Dépendances d'effet manquantes détectées et restaurées en sixième passe (F7) |
| Sécurité (sanitization clés provider, garde-fous prompts IA) | ✅ OK côté code ; voir F1 pour l'hygiène de la clé locale |
| Économie XP / clamps de ressources / bornes BALANCE | ✅ Pas de régression constatée |
| `npm run typecheck` (tsc --noEmit) | ✅ 0 erreur sur l'ensemble de la branche |
| `npm run typecheck` après F3/F4/F5 | ✅ 0 erreur (`tsc --noEmit`, revérifié en cinquième passe) |
| Chemins réducteur alimentés par le réseau | ✅ Seul `RECONNECT_SYNC` reçoit des messages WebRTC en direct (`APPLY_REMOTE_STATE` n'a plus de site de dispatch actif) ; durci en F5 |
| Sanitization clés provider (`sanitizeProviderApiKeys`) sur les 3 chemins localStorage | ✅ Vérifié en seconde passe (lecture seule des providers supportés, trim, rejet des non-chaînes) |
| Hygiène du dépôt | ✅ `config.toml` ignoré et jamais commité ; `tsconfig.tsbuildinfo` modifié (artefact de build, non commité) ; `.pkg_hash` non tracké (à ne pas commiter) |

## Limites de la revue

- Pas de suite de tests automatisés dans le dépôt (aucun runner configuré) : validation statique + lecture approfondie des chemins critiques. Le cas `RECONNECT_SYNC` a toutefois été validé par harnais sur le code réel compilé (voir F4) — ce harnais est jetable et devrait être porté vers Vitest/Jest (action 3).
- Le chemin multijoueur WebRTC n'a pas pu être testé bout-en-bout (nécessite deux pairs) ; les correctifs F2/F3/F4 sont validés par analyse de flux, typage et harnais unitaire sur le réducteur.
- Lint non exécutable dans cet environnement (Node 18 < 20.9 requis par Next.js).

## Actions recommandées avant/après fusion

1. **(Bloquant)** Révoquer et régénérer la clé OpenRouter exposée (F1).
2. Supprimer `.pkg_hash` s'il s'agit d'un artefact local ; envisager de l'ajouter à `.gitignore`.
3. Ajouter un runner de tests (Vitest/Jest) — la taille de la branche justifie une couverture minimale sur les reducers et le hook multijoueur.
