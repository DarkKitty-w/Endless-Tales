# Rapport de revue QA — branche `night-fixes`

**Date :** 2026-08-26 · **Base de comparaison :** `origin/master` (~13 000 insertions, 113 fichiers)
**Périmètre :** 13 catégories de corrections nocturnes (bugs, polish_ux, performance, security, code_quality, error_handling, architecture, persistence, multiplayer, ai_coherence, observability, game_design, feature_gaps).

## Verdict global

✅ **Fusionnable après rotation de la clé API (F1).**
Revue en quatre passes : la première passe avait corrigé le chemin mort NET-14 (F2) ; la **seconde passe (QA indépendante)** a détecté et corrigé deux défauts résiduels dans ce même correctif (F3, commit `ec614cf`, poussé sur `origin/night-fixes`) ; la **troisième passe** a détecté et corrigé un défaut grave introduit par l'activation du chemin `RECONNECT_SYNC` en F3 (F4, commit `ef28864`) ; la **quatrième passe (cette revue)** a détecté et corrigé un crash résiduel du garde-fou ajouté en F4 (F5, corrigé et poussé dans cette revue). Aucune autre régression introduite par la branche n'a été détectée. Un point d'hygiène de sécurité reste à traiter par l'utilisateur (F1).

## Constats

### F5 — MAJEUR (crash réseau, corrigé en quatrième passe, cette revue)
**Le garde « payload malformé » de F4 rejetait les payloads incomplets mais plantait sur un payload `null`.**
Dans le cas `RECONNECT_SYNC`, la déstructuration `const { gameState, ... } = action.payload` s'exécutait **avant** le garde `if (!gameState ...)`. Un payload `null`/non-objet levait donc `TypeError: Cannot destructure property 'gameState' of 'action.payload' as it is null` — exactement l'inverse du contrat annoncé (« reject malformed payloads », « payload `null` sans effet »). Or ce réducteur est alimenté par des messages WebRTC d'origine réseau : une exception dans un réducteur React est fatale au rendu plutôt que dégradée proprement.
→ *Correctif appliqué :* garde `if (!action.payload || typeof action.payload !== 'object') return state;` placé avant la déstructuration.
→ *Validation :* harnais sur le **réducteur réel compilé** — 26/26 assertions PASS post-fix, dont 5 cas malformés (`null`, `{}`, `gameState: null`, `gameState: "garbage"`, fallbacks optionnels) ; le même harnais **échoue (TypeError)** sur le code pré-fix. `APPLY_REMOTE_STATE` (contrat SAVE-11) revérifié non régressé (A19–A21) ; `npm run typecheck` : 0 erreur.

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
| Resync multijoueur (NET-14) | ✅ Chaîne complète vérifiée hôte→invité ; dead-end corrigé (F2), défauts résiduels corrigés en seconde passe (F3), identité de transport préservée en troisième passe (F4), garde payload `null` ajouté en quatrième passe (F5) |
| Harnais réducteur (réel compilé, cas `RECONNECT_SYNC`) | ✅ 26/26 assertions PASS post-fix (F5), dont 5 cas malformés et le contrat F4 (identité invité) ; le même harnais échoue sur le code pré-fix (TypeError sur payload `null`) |
| Persistance (`SAVE-9`, sauvegarde/restauration) | ✅ Pas de régression constatée |
| Sécurité (sanitization clés provider, garde-fous prompts IA) | ✅ OK côté code ; voir F1 pour l'hygiène de la clé locale |
| Économie XP / clamps de ressources / bornes BALANCE | ✅ Pas de régression constatée |
| `npm run typecheck` (tsc --noEmit) | ✅ 0 erreur sur l'ensemble de la branche |
| `npm run typecheck` après F3/F4/F5 | ✅ 0 erreur (`tsc --noEmit`) |
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
