# Architecture Quality & Data Flow Audit

**Project:** Endless Tales  
**Date:** 2026-05-07  
**Audit Type:** High-level structural audit (architecture, data flow, separation of concerns)

---

## Executive Summary

The Endless Tales project is a Next.js application with a centralized state management approach using React Context and useReducer. While the project has good separation in terms of folder structure (types, components, AI, lib, hooks), several critical architectural issues exist:

- **God files** that are doing too much (ai-router.ts at 66KB, GameContext.tsx at 29KB, Gameplay.tsx at 1400+ lines)
- **Tight coupling** between UI components and business/AI logic
- **Hidden global state** in module-level variables
- **Mixed concerns** in components that handle rendering, AI calls, and multiplayer logic simultaneously

---

## Detailed Findings

### ARCH-1: God File - ai-router.ts (66KB)
**Severity:** High  
**Description:** The `ai-router.ts` file is 66KB and contains multiple AI provider implementations (GeminiProvider, OpenAIProvider, ClaudeProvider, DeepSeekProvider, OpenRouterProvider, WebLLMProvider, WebLLMStubProvider), plus the GenAIClient class, module-level state, and numerous helper functions.  
**Location:** `src/ai/ai-router.ts`  
**Problem:** This file violates the Single Responsibility Principle. It's difficult to maintain, test, and navigate. A change to one provider can accidentally break others.  
**Recommendation:** 
- Split each provider into its own file (e.g., `src/ai/providers/gemini-provider.ts`, `src/ai/providers/webllm-provider.ts`)
- Extract common interfaces and types to `src/ai/providers/types.ts`
- Move helper functions to `src/ai/providers/utils.ts`
- Keep `ai-router.ts` as a thin factory/registry that imports and exports providers

---

### ARCH-2: God File - GameContext.tsx (29KB)
**Severity:** High  
**Description:** The `GameContext.tsx` file is 29KB and contains: context creation for multiple domains, the GameProvider component, save migration logic, localStorage persistence with debouncing, theme application logic, and more.  
**Location:** `src/context/GameContext.tsx`  
**Problem:** The file mixes context definition, provider implementation, persistence logic, and migration logic. This makes it difficult to test and maintain.  
**Recommendation:**
- Extract migration logic to `src/context/migration-manager.ts`
- Extract persistence logic to `src/context/persistence-manager.ts`
- Extract theme logic to `src/context/theme-manager.ts`
- Keep `GameContext.tsx` focused on context definition and provider component only

---

### ARCH-3: God Component - Gameplay.tsx (1400+ lines)
**Severity:** High  
**Description:** The `Gameplay.tsx` component is over 1400 lines and handles: UI rendering, AI narration calls, crafting logic, skill management, multiplayer interaction handling, keyboard shortcuts, and more.  
**Location:** `src/components/screens/Gameplay.tsx`  
**Problem:** This component violates the Single Responsibility Principle. It mixes presentation logic with business logic and AI orchestration. The component is difficult to test, reuse, or refactor.  
**Recommendation:**
- Extract AI orchestration logic into custom hooks (e.g., `useNarration`, `useCrafting`, `useSkillManagement`)
- Extract multiplayer handling to `src/hooks/use-multiplayer-handlers.ts`
- Split the rendering into smaller sub-components
- Move keyboard shortcut logic to a separate hook (`useGameplayShortcuts`)

---

### ARCH-4: Tight Coupling Between Context and AI
**Severity:** Medium  
**Description:** `GameContext.tsx` imports `configureAIRouter` from `src/ai/ai-router.ts`, creating a direct dependency from the state management layer to the AI layer.  
**Location:** `src/context/GameContext.tsx` (line 18)  
**Problem:** This coupling means the context layer cannot function without the AI layer. It also creates potential circular dependency issues and makes testing more difficult.  
**Recommendation:**
- Remove direct AI dependency from GameContext
- Configure AI router at the application level (in `src/app/layout.tsx` or `src/app/page.tsx`)
- Use dependency injection or context to provide AI configuration if needed

---

### ARCH-5: Hidden Global State in ai-router.ts
**Severity:** Medium  
**Description:** The `ai-router.ts` file maintains module-level state with variables like `webllmModule`, `webllmAvailable`, `currentWebLLMEngine`, `currentWebLLMModel`, `webllmProgressCallback`, `requestId`, `traceId`.  
**Location:** `src/ai/ai-router.ts` (module-level scope)  
**Problem:** These hidden global variables create implicit state that persists across the module's lifetime. This can cause issues with:  
- Testing (state leaks between tests)  
- Multiple instances (if the module is ever loaded multiple times)  
- Unexpected behavior when state isn't properly reset  
**Recommendation:**  
- Encapsulate all state within the GenAIClient or provider instances  
- Use instance properties instead of module-level variables  
- For request/trace IDs, use a context-aware approach or generate fresh IDs per request  

---

### ARCH-6: Fragmented Yet Monolithic State Management
**Severity:** Medium  
**Description:** The project uses multiple contexts (AdventureContext, CharacterContext, InventoryContext, SettingsContext, MultiplayerContext) created in `GameContext.tsx`, but still uses a monolithic `gameReducer` that routes to sub-reducers. The contexts are created but the deprecated `GameContext` is still imported by components.  
**Location:** `src/context/GameContext.tsx`, `src/context/game-reducer.ts`  
**Problem:** The split contexts add complexity without fully realizing the benefits. Components still import from the monolithic `GameContext` in many places (e.g., `Gameplay.tsx` line 8: `import { useGame } from "../../context/GameContext"`).  
**Recommendation:**  
- Complete the migration to domain-specific contexts  
- Create proper hooks for each context (e.g., `useAdventure`, `useCharacter`, `useMultiplayer`)  
- Deprecate and eventually remove the monolithic `GameContext`  
- Update all components to use domain-specific hooks  

---

### ARCH-7: Business Logic Embedded in UI Components
**Severity:** High  
**Description:** The `Gameplay.tsx` component directly calls AI flows (`narrateAdventure`, `summarizeAdventure`, `assessActionDifficulty`, `generateSkillTree`, `attemptCrafting`) and contains complex business logic for handling responses.  
**Location:** `src/components/screens/Gameplay.tsx` (lines 18-22, 500-800)  
**Problem:** Embedding business logic in UI components makes it impossible to reuse the logic, difficult to test, and breaks the separation of concerns.  
**Recommendation:**  
- Create service modules for AI orchestration (e.g., `src/services/narration-service.ts`)  
- Create custom hooks that wrap these services (e.g., `useNarrationService`)  
- Keep UI components focused on rendering and user interaction only  

---

### ARCH-8: Circular Dependencies and Excessive Ref Usage
**Severity:** Medium  
**Description:** `Gameplay.tsx` uses numerous refs (`multiplayerStateRef`, `gameStateRef`, `isMultiplayerHostRef`, `sendGameActionRef`, `broadcastStoryUpdateRef`, `broadcastPartyStateRef`, `handlePlayerActionRef`) to break circular dependencies between callbacks.  
**Location:** `src/components/screens/Gameplay.tsx` (lines 142-148)  
**Problem:** The excessive use of refs to manage circular dependencies is a code smell indicating tightly coupled logic. It makes the code difficult to understand and prone to bugs where refs aren't properly updated.  
**Recommendation:**  
- Redesign the callback structure to eliminate circular dependencies  
- Consider using an event emitter or pub/sub pattern for decoupled communication  
- Extract the multiplayer orchestration logic into a dedicated hook or service  

---

### ARCH-9: Legacy and Modern Approaches Coexisting
**Severity:** Low  
**Description:** `game-state-utils.ts` contains both legacy string-based methods (`updateGameStateString` using regex) and modern structured approaches (`buildGameStateContext` + `formatGameStateContextForPrompt`).  
**Location:** `src/context/game-state-utils.ts`  
**Problem:** Maintaining two approaches adds cognitive load and can lead to inconsistencies. The legacy `updateGameStateString` uses fragile regex parsing.  
**Recommendation:**  
- Fully migrate to the structured `GameStateContext` approach  
- Deprecate and eventually remove `updateGameStateString`  
- Ensure all AI flows use the structured context  

---

### ARCH-10: Multiplayer Logic Tightly Coupled to Game State
**Severity:** Medium  
**Description:** Multiplayer state (sessionId, players, peerId, connectionStatus, turnOrder, etc.) is mixed into the main `GameState` interface and handled by `multiplayerReducer`. The `use-multiplayer.ts` hook is separate, but the state lives in the main context.  
**Location:** `src/types/game-types.ts`, `src/context/reducers/multiplayerReducer.ts`, `src/hooks/use-multiplayer.ts`  
**Problem:** Multiplayer is a cross-cutting concern that adds significant complexity to the main game state. This coupling makes it harder to:  
- Test multiplayer logic independently  
- Add new multiplayer features without affecting single-player  
- Potentially support different multiplayer backends  
**Recommendation:**  
- Consider a more decoupled multiplayer architecture using the facade pattern  
- Use a separate context for multiplayer state that interacts with the game context via actions  
- Or use a pub/sub approach where multiplayer broadcasts state changes  

---

### ARCH-11: Large Utility File - game-state-utils.ts (15KB)
**Severity:** Low  
**Description:** `game-state-utils.ts` is 15KB and contains functions for building game state context, formatting for prompts, building story summaries, character memory, and story state facts.  
**Location:** `src/context/game-state-utils.ts`  
**Problem:** While not as critical as the god files, this utility file is doing multiple things and could be better organized.  
**Recommendation:**
- Split into `src/context/story-summary-builder.ts`, `src/context/character-memory-builder.ts`, `src/context/story-facts-builder.ts`
- Keep `game-state-utils.ts` as a re-export barrel file

---

### ARCH-12: AI Flow Files Not Fully Utilized
**Severity:** Low  
**Description:** The project has AI flow files in `src/ai/flows/` (e.g., `narrate-adventure.ts`, `summarize-adventure.ts`), but `Gameplay.tsx` imports and calls these directly rather than going through a service layer.  
**Location:** `src/ai/flows/*.ts`, `src/components/screens/Gameplay.tsx`  
**Problem:** Direct imports of flow files in UI components create tight coupling. If the AI flow signature changes, all importing components must be updated.  
**Recommendation:**
- Create a service layer that wraps AI flows
- Export clean interfaces from the service layer
- Have components depend on the service layer, not the flow files directly

---

## Summary Table

| ID | Issue | Severity | File(s) |
|----|-------|----------|---------|
| ARCH-1 | God File - ai-router.ts | High | `src/ai/ai-router.ts` |
| ARCH-2 | God File - GameContext.tsx | High | `src/context/GameContext.tsx` |
| ARCH-3 | God Component - Gameplay.tsx | High | `src/components/screens/Gameplay.tsx` |
| ARCH-4 | Tight Coupling Context ↔ AI | Medium | `src/context/GameContext.tsx` |
| ARCH-5 | Hidden Global State | Medium | `src/ai/ai-router.ts` |
| ARCH-6 | Fragmented State Management | Medium | `src/context/*` |
| ARCH-7 | Business Logic in UI | High | `src/components/screens/Gameplay.tsx` |
| ARCH-8 | Circular Dependencies/Refs | Medium | `src/components/screens/Gameplay.tsx` |
| ARCH-9 | Legacy + Modern Coexistence | Low | `src/context/game-state-utils.ts` |
| ARCH-10 | Multiplayer Coupling | Medium | `src/types/game-types.ts`, `src/context/reducers/multiplayerReducer.ts` |
| ARCH-11 | Large Utility File | Low | `src/context/game-state-utils.ts` |
| ARCH-12 | AI Flows Directly Imported | Low | `src/ai/flows/*.ts` |

---

## Priority Recommendations

### Immediate (High Severity)
1. **Split ai-router.ts** into separate provider files to improve maintainability
2. **Refactor Gameplay.tsx** to extract business logic into hooks/services
3. **Break down GameContext.tsx** to separate concerns (migration, persistence, theme)

### Short-term (Medium Severity)
4. **Decouple context from AI** - remove direct AI imports from context
5. **Eliminate hidden global state** in ai-router.ts
6. **Complete the migration** to domain-specific contexts
7. **Redesign circular dependencies** in Gameplay.tsx

### Long-term (Low/Medium Severity)
8. **Extract multiplayer into a more decoupled architecture**
9. **Deprecate legacy approaches** in game-state-utils.ts
10. **Create service layer** for AI flows
11. **Split large utility files** into focused modules

---

## Architectural Strengths

Despite the issues identified, the project has several good architectural practices:

1. **Good folder structure** - Clear separation of types, components, AI, contexts, hooks, lib
2. **Sub-reducers** - The game-reducer.ts properly routes to domain-specific reducers
3. **Type safety** - Comprehensive TypeScript types in dedicated type files
4. **AI abstraction** - AI flows are separated into individual files
5. **Component organization** - UI components are well-organized by domain (game, gameplay, character, screens, ui)
6. **Custom hooks** - Some logic is properly extracted into hooks (use-mobile, use-toast, use-multiplayer)

---

## Conclusion

The Endless Tales project has a solid foundation with good folder structure and type safety. However, the presence of several "god files" (ai-router.ts, GameContext.tsx, Gameplay.tsx) and tight coupling between layers poses maintainability risks. Addressing the High and Medium severity issues will significantly improve code quality, testability, and developer experience.

Priority should be given to:
1. Splitting large files (ARCH-1, ARCH-2, ARCH-3)
2. Decoupling business logic from UI components (ARCH-7)
3. Eliminating hidden global state (ARCH-5)

---

*End of Architecture Audit Report*
