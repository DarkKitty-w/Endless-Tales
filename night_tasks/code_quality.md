# Code Quality Report

## Overview
- **Overall Maintainability Rating: C** (Significant issues with large "god files" and widespread `any` type usage, but good structural patterns, TypeScript strict mode enabled, and React error boundaries present)
- **Total Issues Identified: 12**
- **High Severity: 3**
- **Medium Severity: 5**
- **Low Severity: 4**

## Detailed Findings

### CODE-1: God File - ai-router.ts (2072 lines)
**Severity:** High  
**Description:** The `ai-router.ts` file contains 2072 lines of code, handling AI provider configuration, multiple provider implementations (Gemini, OpenAI, Claude, DeepSeek, WebLLM, OpenRouter), request routing, streaming logic, error handling, prompt injection protection, observability logging, timeout handling, and WebLLM engine management in a single file. This violates the single responsibility principle, makes code difficult to maintain, test, and modify individual provider implementations.  
**Location:** `src/ai/ai-router.ts`, lines 1-2072  
**Refactoring Suggestion:** Split into modular components (proposed files - do not exist yet):
- `src/ai/providers/base-provider.ts` (AIProvider interface) - **proposed, not yet created**
- `src/ai/providers/gemini-provider.ts`, `openai-provider.ts`, etc. (individual provider implementations) - **proposed, not yet created**
- `src/ai/ai-router.ts` (lean routing logic only) - **existing file to be refactored**
- `src/ai/ai-utils.ts` (shared utilities: timeout, logging, prompt protection) - **proposed, not yet created**
- `src/ai/webllm-manager.ts` (WebLLM engine lifecycle management) - **proposed, not yet created**

### CODE-2: God File - Gameplay.tsx (1471 lines)
**Severity:** High  
**Description:** `Gameplay.tsx` contains 1471 lines of code mixing game state management, UI rendering, and gameplay logic. This makes the component hard to test, maintain, and extend.  
**Location:** `src/components/screens/Gameplay.tsx`, lines 1-1471  
**Refactoring Suggestion:** Split into smaller components (e.g., `GameplayHeader.tsx`, `GameplayStatsPanel.tsx`), extract gameplay logic into custom hooks (`useGameplayState`, `useGameplayActions`), and move AI interaction logic to a separate service layer (proposed: `src/services/ai-service.ts` - **not yet created**).

### CODE-3: Widespread `any` Type Usage
**Severity:** High  
**Description:** Over 50 instances of `any` type usage were found across AI flows, API routes, and React components. This bypasses TypeScript's type safety, increases runtime error risk, and makes code harder to understand and refactor.  
**Location:** Multiple files including `src/ai/flows/*.ts`, `src/app/api/ai-proxy/route.ts`, `src/components/screens/CharacterCreation.tsx`  
**Refactoring Suggestion:** Replace `any` with properly defined TypeScript interfaces (e.g., `AIResponse`, `NarrateAdventureOutput`), use Zod schema inference for AI response validation, and avoid `as any` casts by using type guards.

### CODE-4: Duplicate AI Flow Normalizer & Error Handling Logic
**Severity:** Medium  
**Description:** All AI flow files (`assess-action-difficulty.ts`, `attempt-crafting.ts`, `narrate-adventure.ts`, etc.) contain duplicated normalizer functions and error handling patterns (catch blocks checking for `AbortError`). This violates the DRY principle.  
**Location:** `src/ai/flows/*.ts`  
**Refactoring Suggestion:** Extract a shared `createAIFlowNormalizer` utility that accepts fallback values and field mappers, and create a `handleAIFlowError` utility for consistent error logging and AbortError handling.

### CODE-5: God File - use-multiplayer.ts (853 lines)
**Severity:** Medium  
**Description:** The `use-multiplayer.ts` hook contains 853 lines of code handling WebRTC signaling, peer connections, and multiplayer state management in a single hook. This makes it difficult to maintain, test, and debug.  
**Location:** `src/hooks/use-multiplayer.ts`, lines 1-853  
**Refactoring Suggestion:** Split into smaller hooks (`useWebRTC`, `usePeerConnection`, `useMultiplayerState`), extract message type definitions and handlers into `src/types/multiplayer-types.ts`.

### CODE-6: Repeated `catch (error: any)` Pattern
**Severity:** Medium  
**Description:** The `catch (error: any)` pattern is repeated across 20+ files, followed by a check for `error.name === 'AbortError'`. Using `any` for caught errors loses type safety, and the AbortError check is duplicated.  
**Location:** Multiple files including `src/ai/flows/*.ts`, `src/components/screens/CoopLobby.tsx`  
**Refactoring Suggestion:** Use `catch (error: unknown)` instead of `any`, create an `isAbortError` type guard function, and extract a `handleCommonError` utility for consistent logging and error handling.

### CODE-7: Overly Complex narrate-adventure.ts Normalizer Function
**Severity:** Medium  
**Description:** The normalizer function in `narrate-adventure.ts` spans 100+ lines, handling parsing of narration, game state, stats, traits, knowledge, and branching choices in a single function. This is overly complex and hard to test.  
**Location:** `src/ai/flows/narrate-adventure.ts`, lines 342-500+  
**Refactoring Suggestion:** Split the normalizer into smaller helper functions (`parseNarration`, `parseUpdatedGameState`, `validateBranchingChoices`), and use a builder pattern to construct the output object.

### CODE-8: Untyped API Proxy Route Parameters
**Severity:** Medium  
**Description:** The AI proxy route handlers (`handleGemini`, `handleOpenAI`, etc.) use `any` type for `contents` and `config` parameters, losing type safety for request parameters.  
**Location:** `src/app/api/ai-proxy/route.ts`, lines 248-616  
**Refactoring Suggestion:** Define proper interfaces for AI provider request parameters (e.g., `GeminiRequest`, `OpenAIRequest`), and use these types for handler parameters instead of `any`.

### CODE-9: Unused PropIcon in StatAllocationInput.tsx
**Severity:** Low  
**Description:** The `Icon` prop (renamed to `PropIcon`) in `StatAllocationInput.tsx` is only used as a fallback when `statKey` doesn't match strength/stamina/wisdom, but `statKey` is strictly typed to `keyof CharacterStats` (which only includes strength/stamina/wisdom), making `PropIcon` dead code.  
**Location:** `src/components/character/StatAllocationInput.tsx`, lines 20-41  
**Refactoring Suggestion:** Remove the `Icon` prop and `PropIcon` fallback, since the component already maps `statKey` to specific icons.

### CODE-10: Inconsistent Error Boundary Coverage
**Severity:** Low  
**Description:** Error boundaries are only applied at the screen level (`page.tsx`) and around some gameplay components (`GameplayLayout.tsx`), but not for all critical UI sections. A crash in a single component could still take down an entire screen.  
**Location:** `src/app/page.tsx`, `src/components/gameplay/GameplayLayout.tsx`  
**Refactoring Suggestion:** Add error boundaries around individual high-risk components (e.g., `NarrationDisplay`, `ActionInput`), and consider adding a global error boundary fallback that preserves app state.

### CODE-11: CharacterCreation.tsx Form Any Casts
**Severity:** Low  
**Description:** `CharacterCreation.tsx` uses `as any` casts for react-hook-form's `register` and `errors` props when passing to child components, bypassing type safety.  
**Location:** `src/components/screens/CharacterCreation.tsx`, lines 531-537  
**Refactoring Suggestion:** Properly type the form data interface, and use `UseFormRegister<FormData>` and `FieldErrors<FormData>` instead of casting to `any`.

### CODE-12: Missing Comments in Complex AI Logic
**Severity:** Low  
**Description:** Complex AI flow logic (e.g., normalizer functions, response parsing) lacks comments explaining non-obvious behavior, such as fallback logic and field mapping.  
**Location:** `src/ai/flows/narrate-adventure.ts`, `src/ai/ai-router.ts`  
**Refactoring Suggestion:** Add JSDoc comments to complex functions, explain fallback logic, and document AI response field mappings.
