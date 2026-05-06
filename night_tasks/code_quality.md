## Detailed Findings

CODE‑1: VALID_ASSESSMENT_DIFFICULTY_LEVELS unused constant
Severity: Medium
Description: Exported constant VALID_ASSESSMENT_DIFFICULTY_LEVELS is defined in constants.ts but never imported or used anywhere in the codebase.
Location: src/lib/constants.ts (line 21)
Refactoring Suggestion: Remove the export and constant if not needed, or implement its usage if it was intended for validation.

CODE‑2: devLog function unused in logger.ts
Severity: Low
Description: The devLog function is exported from logger.ts but has zero usages across the codebase.
Location: src/lib/logger.ts (line 58)
Refactoring Suggestion: Remove the function or integrate it if debug logging is desired.

CODE‑3: dice-roller.ts entire file unused
Severity: Medium
Description: The entire dice-roller.ts service file is unused. No imports found anywhere in the codebase.
Location: src/services/dice-roller.ts (entire file)
Refactoring Suggestion: Delete the file if not needed, or integrate it into gameplay if dice rolling functionality is planned.

CODE‑4: firebase.ts dead file in lib/
Severity: Medium
Description: The firebase.ts file exists in lib/ but is not imported or used anywhere. It appears to be a leftover from a previous implementation.
Location: src/lib/firebase.ts (entire file)
Refactoring Suggestion: Delete the file if Firebase is no longer used, or properly integrate it if needed.

CODE‑5: Unused imports across multiple files
Severity: Medium
Description: Multiple files contain unused imports (e.g., React imports that are not needed, unused utility imports, unused type imports).
Location: Various .tsx and .ts files across the codebase
Refactoring Suggestion: Run a linter (eslint) to identify and remove unused imports. Use tools like ts-prune for TypeScript-specific dead exports.

CODE‑6: Duplicated Stream Processing Logic in AI Providers
Severity: High
Description: Five AI provider classes (Gemini, OpenAI, Claude, DeepSeek, OpenRouter) each contain nearly identical SSE stream processing logic with while loops, buffer management, line splitting, and chunk processing. The only difference is the JSON path for extracting content.
Location: src/ai/ai-router.ts - GeminiProvider (lines 159-250), OpenAIProvider (lines 299-389), ClaudeProvider (lines 438-530), DeepSeekProvider (lines 579-669), OpenRouterProvider (lines 718-808)
Refactoring Suggestion: Extract a shared `processSSEStream(response, contentExtractor)` utility function that accepts a provider-specific content extraction callback.

CODE‑7: handlePlayerAction in Gameplay.tsx too large
Severity: High
Description: The handlePlayerAction function in Gameplay.tsx is overly complex with mixed concerns (AI calls, state updates, error handling, turn management) all in one function.
Location: src/components/screens/Gameplay.tsx (handlePlayerAction function)
Refactoring Suggestion: Split into smaller functions: validateAction(), processAIResponse(), updateGameState(), handleTurnTransition().

CODE‑8: WebRTC signalling functions overly complex
Severity: Medium
Description: Functions in webrtc-signalling.ts have high cyclomatic complexity with many branches, long functions over 100 lines, and mixed concerns (encoding, decoding, connection management).
Location: src/lib/webrtc-signalling.ts (multiple functions)
Refactoring Suggestion: Split into smaller modules: signalling-encoding.ts, signalling-connection.ts, signalling-queue.ts. Extract complex functions into smaller, focused helpers.

CODE‑9: CharacterCreation.tsx has mixed concerns
Severity: Medium
Description: CharacterCreation.tsx is a large component with mixed concerns (form handling, AI generation, validation, UI rendering all in one file).
Location: src/components/screens/CharacterCreation.tsx (entire file)
Refactoring Suggestion: Extract custom hooks: useCharacterForm(), useAIGeneration(), useClassSelection(). Split into smaller sub-components.

CODE‑10: Inconsistent React import style
Severity: Low
Description: Some files use `import * as React from "react"` while others use `import React from 'react'`. Also inconsistent quote usage (double vs single quotes).
Location: Various .tsx files (CardboardCard.tsx uses `* as React` with double quotes, BasicCharacterForm.tsx uses `React` with single quotes)
Refactoring Suggestion: Standardize on `import * as React from "react"` with double quotes for consistency across all files.

CODE‑11: Inconsistent forwardRef usage
Severity: Low
Description: Some components use `React.forwardRef` while others don't, even when they accept ref props. Inconsistent pattern across UI components.
Location: src/components/ui/ (various components)
Refactoring Suggestion: Standardize forwardRef usage. Either all UI components use forwardRef, or none do (use ref prop directly if needed).

CODE‑12: Inconsistent component patterns
Severity: Medium
Description: Some components use React.memo, some use useCallback/useMemo, others don't. No consistent pattern for performance optimizations.
Location: src/components/ (various components)
Refactoring Suggestion: Define clear guidelines: all components that receive stable props should use React.memo. All event handlers in render should use useCallback.

CODE‑13: Inconsistent prop naming across similar components
Severity: Medium
Description: Similar components use different prop names for the same concept (e.g., onSubmit vs onSave vs onComplete across forms).
Location: src/components/character/ (BasicCharacterForm, TextCharacterForm, CharacterStatsAllocator)
Refactoring Suggestion: Standardize prop names across similar components. Create a shared types file for common prop interfaces.

CODE‑14: Mixed quote usage in imports
Severity: Low
Description: Some files use double quotes for imports (`"react"`), others use single quotes (`'react'`). Inconsistent across the codebase.
Location: Various .ts and .tsx files
Refactoring Suggestion: Standardize on double quotes for all imports. Configure ESLint rule `quotes` to enforce consistency.

CODE‑15: Untyped 'any' in migrateSavedAdventure
Severity: Medium
Description: The adventure parameter in migrateSavedAdventure is typed as `any`, bypassing TypeScript type checking for saved adventure migration logic.
Location: src/context/GameContext.tsx (line 30)
Refactoring Suggestion: Define a migration input type (e.g., `type MigrationAdventureInput = Partial<SavedAdventure> & { version?: number }`) and use it instead of `any`. Add runtime validation for required fields.

CODE‑16: Untyped 'any[]' for parsed localStorage data
Severity: Medium
Description: The result of `JSON.parse(savedData)` is typed as `any[]`, skipping type checking for loaded saved adventures.
Location: src/context/GameContext.tsx (line 89)
Refactoring Suggestion: Define a type for the parsed data and validate with a runtime schema (e.g., Zod) before using the data.

CODE‑17: Multiple 'any' types in ai-router.ts
Severity: Medium
Description: The ai-router.ts file contains multiple uses of `any` type, particularly in provider classes, stream processing, and message handling.
Location: src/ai/ai-router.ts (multiple locations)
Refactoring Suggestion: Replace `any` with proper types: define provider config interfaces, message types, stream response types. Use generics where appropriate.

CODE‑18: ErrorBoundary not integrated in component tree
Severity: High
Description: ErrorBoundary.tsx exists but is not integrated into the component tree. If any component throws, the entire app crashes without a fallback UI.
Location: src/components/ErrorBoundary.tsx (not used in app/layout.tsx or app/page.tsx)
Refactoring Suggestion: Wrap the main app content in ErrorBoundary in layout.tsx or page.tsx to catch and display errors gracefully.

CODE‑19: Missing error boundaries in gameplay screens
Severity: High
Description: Gameplay screens and components don't have error boundaries. A crash in AI processing, state management, or rendering will crash the entire game.
Location: src/components/screens/Gameplay.tsx, src/components/gameplay/ (various components)
Refactoring Suggestion: Add ErrorBoundary wrappers around major gameplay sections. Consider per-section boundaries so one section crashing doesn't affect others.

CODE‑20: 'any' type in webrtc-signalling.ts
Severity: Medium
Description: The webrtc-signalling.ts file uses `any` type for signalling data, peer info, and message queue items.
Location: src/lib/webrtc-signalling.ts (multiple locations)
Refactoring Suggestion: Define proper types for SignallingPackage, PeerInfo, and queue items. Replace `any` with specific interfaces.

CODE‑21: Duplicated Skill Tree Validation in characterReducer
Severity: Medium
Description: Skill tree validation code (checking MAX_SKILL_TREE_STAGES, mapping stages/skills with defaults) is duplicated in SET_SKILL_TREE and CHANGE_CLASS_AND_RESET_SKILLS cases.
Location: src/context/reducers/characterReducer.ts (lines 175-191 and 199-213)
Refactoring Suggestion: Extract a `validateSkillTree(stages: any[], className: string): SkillTree` helper function to consolidate validation logic.

CODE‑22: Duplicated Inventory Item Validation in inventoryReducer
Severity: Medium
Description: Item validation logic (defaulting name, description, quality, weight, durability, magicalEffect) is duplicated in ADD_ITEM, UPDATE_INVENTORY, and LOAD_ADVENTURE cases.
Location: src/context/reducers/inventoryReducer.ts (lines 9-16, 50-57, 91-98)
Refactoring Suggestion: Extract a `validateInventoryItem(item: Partial<InventoryItem>): InventoryItem` helper function.

CODE‑23: Complex algorithms without comments
Severity: Medium
Description: Skill tree rendering and validation algorithms lack comments, making the logic non-obvious to new developers.
Location: src/components/game/SkillTreeDisplay.tsx; src/context/reducers/characterReducer.ts
Refactoring Suggestion: Add comments explaining complex algorithms: O(n*m) lookups, skill tree traversal, validation rules.

CODE‑24: Duplicated SDP processing in WebRTC
Severity: Medium
Description: SDP offer/answer processing logic is duplicated across connection initiation and response handling in webrtc-signalling.ts.
Location: src/lib/webrtc-signalling.ts (multiple functions)
Refactoring Suggestion: Extract shared SDP processing helpers: createOffer(), createAnswer(), processIceCandidates().

CODE‑25: Missing comments in game-reducer.ts
Severity: Low
Description: The main game-reducer.ts file lacks comments explaining the reducer structure, action handling, and state transitions.
Location: src/context/game-reducer.ts (entire file)
Refactoring Suggestion: Add header comments explaining the reducer structure, inline comments for complex state transitions, and JSDoc for helper functions.

### Overall Maintainability Rating: C+

The project has decent structure with clear separation of concerns (context, components, AI, lib), but needs refactoring in key areas: duplicated logic in AI providers and reducers, missing TypeScript types, inconsistent patterns, and lack of error boundaries.

### Top 10 Worst Offenders:
1. **src/ai/ai-router.ts** - Duplicated stream logic, many 'any' types, overly complex provider classes
2. **src/context/GameContext.tsx** - Too large, mixed concerns, missing TypeScript types
3. **src/lib/webrtc-signalling.ts** - Complex, duplicated logic, many 'any' types
4. **src/context/reducers/characterReducer.ts** - Duplicated validation logic, missing comments
5. **src/components/screens/CharacterCreation.tsx** - Too large, mixed concerns
6. **src/components/screens/Gameplay.tsx** - handlePlayerAction too complex
7. **src/context/reducers/inventoryReducer.ts** - Duplicated validation logic
8. **src/components/gameplay/NarrationDisplay.tsx** - Complex rendering logic
9. **src/app/api/ai-proxy/route.ts** - Long functions, missing validation
10. **src/lib/utils.ts** - Missing type definitions, weak sanitization
