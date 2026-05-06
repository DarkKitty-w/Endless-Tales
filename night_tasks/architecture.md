## Detailed Findings

### ARCH-1: Monolithic GameState Interface
**Severity:** Medium  
**Description:** The GameState interface in src/types/game-types.ts contains 25+ fields spanning multiple domains: character, inventory, adventure, multiplayer, settings, and UI-adjacent state (like isGeneratingSkillTree). This makes the state object difficult to reason about and creates tight coupling.
**Location:** `src/types/game-types.ts` (lines 38-75), `src/context/game-initial-state.ts`  
**Problem:** Large interfaces violate Single Responsibility Principle; changes in one domain affect the entire state structure.  
**Recommendation:** Split GameState into domain-specific interfaces (CharacterState, AdventureState, MultiplayerState, etc.) and compose them. Alternatively, use separate contexts for each domain.

### ARCH-2: Module-level State in AI Router
**Severity:** High  
**Description:** The AI router (ai-router.ts) uses module-level variables (webllmModule, webllmAvailable, etc.) for state management, which persists across requests and can cause issues in SSR or multiple instances.  
**Location:** `src/ai/ai-router.ts` (lines 60-70, module-level declarations)  
**Problem:** Module-level state is a form of hidden global state that can cause unexpected behavior and is hard to test.  
**Recommendation:** Move state into class instances or a proper state management solution. Pass configuration as parameters instead of relying on module-level variables.

### ARCH-3: Local State That Should Be in Global Context
**Severity:** Medium  
**Description:** Some components maintain local state that should be part of the global game state for consistency and persistence (e.g., UI state like selected tabs, form drafts).  
**Location:** Various components in `src/components/`  
**Problem:** Local state can become out of sync with global state; not persisted across sessions.  
**Recommendation:** Evaluate which local state should be promoted to global context. Keep only truly ephemeral UI state (hover, focus) local.

### ARCH-4: Excessive Prop Drilling from Gameplay to GameplayLayout
**Severity:** Medium  
**Description:** Gameplay.tsx passes 30+ individual props to GameplayLayout, which then distributes them to child components (PartySidebar, ChatPanel, NarrationDisplay, etc.). This creates a maintenance burden and makes data flow hard to trace.  
**Location:** `src/components/screens/Gameplay.tsx` (lines 1088-1152), `src/components/gameplay/GameplayLayout.tsx` (lines 30-86, props interface)  
**Problem:** Excessive prop drilling makes components tightly coupled and refactoring difficult.  
**Recommendation:** Use React Context or a state management library to provide shared state directly to child components instead of prop drilling.

### ARCH-5: Circular Dependencies Broken by Refs
**Severity:** Medium  
**Description:** There are potential circular dependency patterns between parent-child components that are "solved" by using refs, which breaks the natural React data flow and makes the code harder to understand.  
**Location:** `src/components/screens/Gameplay.tsx`, `src/components/gameplay/`  
**Problem:** Refs bypass React's declarative data flow, making it harder to trace how data moves through the app.  
**Recommendation:** Refactor to use proper lifting state up or context. Avoid refs for data flow; use them only for imperative DOM access.

### ARCH-6: Complex State Update Chains After AI Responses
**Severity:** Medium  
**Description:** When AI responses arrive, they trigger complex chains of state updates (world map updates, character state changes, skill tree progression) that are hard to trace and can cause race conditions.  
**Location:** `src/components/screens/Gameplay.tsx` (handlePlayerAction function)  
**Problem:** Multiple state updates in sequence can cause inconsistent UI states and make debugging difficult.  
**Recommendation:** Batch related state updates using a single dispatch with multiple changes, or use a state machine pattern for complex transitions.

### ARCH-7: Monolithic Gameplay Component
**Severity:** High  
**Description:** Gameplay.tsx is a massive 1207-line component that directly imports and calls AI flow functions, contains business logic for processing AI responses, manages multiple UI states, and includes multiplayer networking logic.  
**Location:** `src/components/screens/Gameplay.tsx` (entire file, 1207 lines)  
**Problem:** Violates Single Responsibility Principle; mixes UI rendering, business logic, and AI integration in one component.  
**Recommendation:** Split into custom hooks: useAIAction(), useGameStateUpdates(), useMultiplayerSync(). Extract sub-components for different sections.

### ARCH-8: AI Logic Mixed with UI in Components
**Severity:** High  
**Description:** Components like Gameplay.tsx directly call AI flow functions (narrateAdventure, summarizeAdventure, assessActionDifficulty, generateSkillTree, attemptCrafting) and process responses, mixing AI logic with UI rendering.  
**Location:** `src/components/screens/Gameplay.tsx`, `src/components/gameplay/NarrationDisplay.tsx`  
**Problem:** Tight coupling between UI and AI logic makes it impossible to replace AI providers or test business logic in isolation.  
**Recommendation:** Create a service layer or custom hooks that abstract AI calls. Components should only receive processed data, not raw AI responses.

### ARCH-9: Business Logic in UI Components
**Severity:** Medium  
**Description:** Gameplay.tsx processes AI responses (world map updates, character state changes, skill tree progression) directly in the component, rather than in reducers or a business logic layer.  
**Location:** `src/components/screens/Gameplay.tsx` (handlePlayerAction and related functions)  
**Problem:** Business logic mixed with UI makes it hard to reuse, test, and maintain.  
**Recommendation:** Move business logic into reducers or a dedicated business logic layer. Components should dispatch actions with the AI response, and reducers should handle the state transformations.

### ARCH-10: AI Router God File
**Severity:** High  
**Description:** The AI router file (ai-router.ts) is 1343 lines and contains everything related to AI provider management: type definitions, 6 provider implementations, WebLLM-specific helpers, module-level state, factory functions, and the GenAIClient class.  
**Location:** `src/ai/ai-router.ts` (1343 lines)  
**Problem:** God file that violates Single Responsibility Principle; changes to one provider can affect others; hard to navigate and maintain.  
**Recommendation:** Split into modular files:
```
src/ai/
  ai-router.ts          (main router & factory)
  providers/
    base-provider.ts
    gemini-provider.ts
    openai-provider.ts
    claude-provider.ts
    deepseek-provider.ts
    openrouter-provider.ts
    webllm-provider.ts
  webllm-helpers.ts
```

### ARCH-11: Gameplay.tsx God Component
**Severity:** High  
**Description:** Gameplay.tsx is 1207 lines and acts as a god component doing UI rendering, AI calls, business logic, state management, and multiplayer networking.  
**Location:** `src/components/screens/Gameplay.tsx`  
**Problem:** Impossible to maintain, test, or reuse; any change can have widespread effects.  
**Recommendation:** Extract custom hooks for each concern: useAIProcessing(), useGameState(), useMultiplayer(). Split into smaller sub-components for each UI section.

### ARCH-12: CharacterCreation.tsx Does Too Much
**Severity:** Medium  
**Description:** CharacterCreation.tsx handles form rendering, AI generation (character description, skill tree), validation, and multiple UI states in a single component.  
**Location:** `src/components/screens/CharacterCreation.tsx`  
**Problem:** Large component with mixed concerns; hard to test individual features.  
**Recommendation:** Extract hooks: useCharacterForm(), useAIGeneration(), useClassSelection(). Split form sections into sub-components.

### ARCH-13: Tight Coupling Between AI and UI Systems
**Severity:** Medium  
**Description:** UI components directly depend on AI provider details (provider names, API key handling) rather than through a proper abstraction. The AI system cannot be replaced without touching UI code.  
**Location:** `src/components/screens/Gameplay.tsx` (lines 63-69, API key selection logic), `src/ai/ai-router.ts`  
**Problem:** Tight coupling makes it hard to swap AI providers or change the AI integration.  
**Recommendation:** Create a proper AI service abstraction. UI should only know about a generic "generate" function, not provider details. Use dependency injection or a factory pattern.

### ARCH-14: Mixed Concerns in utils.ts
**Severity:** Medium  
**Description:** The utils.ts file mixes unrelated concerns: UI utilities (cn, getQualityColor), security functions (sanitizePlayerAction), AI processing (processAiResponse, extractJsonFromResponse), and JSON repair logic.  
**Location:** `src/lib/utils.ts`  
**Problem:** Violates Single Responsibility Principle; makes the module difficult to reuse in different contexts.  
**Recommendation:** Split into domain-specific modules:
- `src/lib/utils.ts` → Keep only `cn()` for Tailwind class merging
- `src/lib/security.ts` → Move `sanitizePlayerAction()`
- `src/lib/ai/response-parser.ts` → Move `extractJsonFromResponse()` and `processAiResponse()`
- `src/lib/game/ui-helpers.ts` → Move `getQualityColor()`

### ARCH-15: Global Module-Level State in use-toast
**Severity:** High  
**Description:** The toast system uses module-level variables (toasts array, listeners) that act as hidden global state, making it hard to test and potentially causing issues with multiple instances.  
**Location:** `src/hooks/use-toast.ts` (module-level variables)  
**Problem:** Hidden global state that bypasses React's state management; can cause unexpected behavior.  
**Recommendation:** Use React state within a ToastProvider context. Move the toast logic into a proper context that can be tested and doesn't rely on module-level variables.

### ARCH-16: Components Relying on Implicit Global State
**Severity:** Medium  
**Description:** Some components rely on implicit global state (through context or module-level variables) without explicit dependencies, making it hard to understand what data a component needs.  
**Location:** Various components using GameContext  
**Problem:** Hidden dependencies make components hard to reuse in different contexts or test in isolation.  
**Recommendation:** Make dependencies explicit. Use dependency injection or clearly document what context a component expects. Consider using custom hooks that wrap context access with clear return types.

### ARCH-17: Hardcoded Dependencies in AI Router
**Severity:** Medium  
**Description:** The AI router has hardcoded dependencies (provider configurations, WebLLM model lists) that make it hard to add new providers or change configurations.  
**Location:** `src/ai/ai-router.ts` (provider configs, model lists)  
**Problem:** Adding a new AI provider requires modifying the main router file; configuration is scattered.  
**Recommendation:** Use a configuration file or registry pattern. Allow providers to register themselves. Move provider-specific configs to their own files or a config module.