# Rapport de revue QA — branche `night-fixes`

**Date :** 2026-08-26 · **Base de comparaison :** `origin/master` (~13 000 insertions, 113 fichiers)
**Périmètre :** 13 catégories de corrections nocturnes (bugs, polish_ux, performance, security, code_quality, error_handling, architecture, persistence, multiplayer, ai_coherence, observability, game_design, feature_gaps).

## Verdict global

✅ **Fusionnable après rotation de la clé API (F1).**
Aucune régression introduite par la branche n'a été détectée. Un défaut fonctionnel préexistant mais incomplet (NET-14) a été corrigé dans cette revue (F2), ainsi qu'un point d'hygiène de sécurité (F1, à traiter par l'utilisateur).

## Constats

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

## Vérifications effectuées

| Domaine | Résultat |
|---|---|
| Routage des actions (`ADVENTURE_ACTIONS` / `MULTIPLAYER_ACTIONS`) | ✅ Cohérent, handlers présents (`LOAD_SAVED_ADVENTURES`, `PEER_CONNECTED/DISCONNECTED`, `RECONNECT_SYNC`) |
| Resync multijoueur (NET-14) | ✅ Chaîne complète vérifiée hôte→invité ; dead-end corrigé (F2) |
| Persistance (`SAVE-9`, sauvegarde/restauration) | ✅ Pas de régression constatée |
| Sécurité (sanitization clés provider, garde-fous prompts IA) | ✅ OK côté code ; voir F1 pour l'hygiène de la clé locale |
| Économie XP / clamps de ressources / bornes BALANCE | ✅ Pas de régression constatée |
| `npm run typecheck` (tsc --noEmit) | ✅ 0 erreur sur l'ensemble de la branche |
| Hygiène du dépôt | ✅ `config.toml` ignoré et jamais commité ; `tsconfig.tsbuildinfo` modifié (artefact de build, non commité) ; `.pkg_hash` non tracké (à ne pas commiter) |

## Limites de la revue

- Pas de suite de tests automatisés dans le dépôt (aucun runner configuré) : validation statique uniquement + lecture approfondie des chemins critiques.
- Le chemin multijoueur WebRTC n'a pas pu être testé bout-en-bout (nécessite deux pairs) ; le correctif F2 est validé par analyse de flux et typage.
- Lint non exécutable dans cet environnement (Node 18 < 20.9 requis par Next.js).

## Actions recommandées avant/après fusion

1. **(Bloquant)** Révoquer et régénérer la clé OpenRouter exposée (F1).
2. Supprimer `.pkg_hash` s'il s'agit d'un artefact local ; envisager de l'ajouter à `.gitignore`.
3. Ajouter un runner de tests (Vitest/Jest) — la taille de la branche justifie une couverture minimale sur les reducers et le hook multijoueur.
