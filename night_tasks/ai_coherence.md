## Detailed Findings

### AI-1: No Programmatic Check for Narrative Repetition
**Severity:** Medium  
**Description:** The system messages include anti-repetition rules (e.g., "Avoid repeating phrases from previous narrations"), but there is no code to detect if the AI repeats phrases from earlier turns. The AI may still reuse narrative patterns, making the story feel stale over time.  
**Location:** `src/ai/flows/narrate-adventure.ts`, `src/ai/prompt-templates/system-messages.ts`  
**Impact:** Players experience repetitive narration, reducing immersion and long-term engagement with longer adventures.  
**Fix:** Add a post-processing step in `narrateAdventure` that checks the current narration against the last 3-5 narrations for repeated 5+ word sequences. If repetition is detected, log a warning and append a note to the next prompt's context to encourage fresh language.

### AI-2: Unclear NPC Relationship Scale for AI
**Severity:** Medium  
**Description:** NPC relationships are passed to the AI as "NPC: value" (e.g., "Guard: 20") but the AI is not told what the numeric values represent. The relationship scale (e.g., -100 = Hostile, 0 = Neutral, 100 = Allied) is not documented in the prompt context.  
**Location:** `src/ai/prompt-templates/context-formatters.ts` (formatRelationshipsContext), `src/context/game-state-utils.ts` (buildCharacterMemory)  
**Impact:** NPCs may act out of character (e.g., a guard with -50 reputation being friendly) because the AI misinterprets the relationship values, breaking narrative consistency.  
**Fix:** Add a legend to the NPC Relationships section in both `formatRelationshipsContext` and `buildCharacterMemory`: "NPC Relationships (scale: -100 Hostile, -50 Unfriendly, 0 Neutral, 50 Friendly, 100 Allied):"

### AI-3: Unreliable Story State Facts Extraction
**Severity:** High  
**Description:** `buildStoryStateFacts` uses simple regex heuristics to extract locations, NPCs, and object states from the story log. This approach misses many valid facts, includes false positives, and fails to handle all formats of `updatedGameState`.  
**Location:** `src/context/game-state-utils.ts` (buildStoryStateFacts)  
**Impact:** The "Established Story Facts (DO NOT Contradict)" section in prompts is incomplete or incorrect, leading the AI to contradict earlier events and break narrative coherence.  
**Fix:** Replace regex-based extraction with structured state tracking. Store `discoveredLocations`, `metNPCs`, and `objectStates` as explicit fields in `GameState` (e.g., `gameState.discoveredLocations: string[]`) and populate them from AI response fields like `worldMapChanges.newLocations` and `updatedGameState` parsing during state updates.

### AI-4: No Validation of Narration Content Against Game State
**Severity:** High  
**Description:** `validateChoicesAgainstGameState` only checks branching choices against available skills/items, but the narration itself may reference skills, items, or NPCs not present in the game state. The "GAME CONSTRAINTS" rule requires the AI to only reference explicit game state elements, but there is no enforcement.  
**Location:** `src/ai/flows/narrate-adventure.ts`, `src/lib/utils.ts` (validateChoicesAgainstGameState)  
**Impact:** The AI may narrate actions requiring unlearned skills or unowned items (e.g., "You cast Fireball" without Fireball in learned skills), breaking game rules and player immersion.  
**Fix:** Add a narration post-processing step that checks for references to skills not in `learnedSkills` or items not in `inventory`. Log warnings for violations and append a correction note to the next prompt's context.

### AI-5: Character Memory Lacks Long-Term Story Events
**Severity:** Medium  
**Description:** `buildCharacterMemory` only includes recent events (last 10 turns) where `updatedTraits` is present. Major story events (e.g., defeating a boss, finding a legendary item) that do not change traits are excluded from character memory.  
**Location:** `src/context/game-state-utils.ts` (buildCharacterMemory)  
**Impact:** The AI forgets significant story events from earlier in the game, leading to inconsistent character reactions (e.g., a character who defeated a dragon acts like they have never encountered one).  
**Fix:** Extend `buildCharacterMemory` to include key events from the story log where significant state changes occurred (e.g., `worldMapChanges`, `gainedSkill`, `npcRelationshipChange`) even if traits were not updated. Add a "Key Story Events" subsection to the character memory.


### AI-6: No Enforcement of Permanent Death Rule
**Severity:** High  
**Description:** The system message includes a "PERMANENT DEATH" rule, but there is no code to verify the AI follows it. If permanent death is enabled and HP drops to 0, the AI may still provide choices for continuation or narrate a revival.  
**Location:** `src/ai/flows/narrate-adventure.ts`, `src/ai/prompt-templates/system-messages.ts`  
**Impact:** Players in permanent death mode can be revived by the AI, breaking a core game rule and reducing tension/immersion.  
**Fix:** Add a post-processing step in `narrateAdventure` that checks if `adventureSettings.permanentDeath` is true and `character.currentHealth <= 0`. If so, force `isCharacterDefeated: true`, remove any choices that allow continuation, and adjust the narration to reflect permanent death.

### AI-7: Redundant but Incomplete Prompt Injection Protection
**Severity:** Medium  
**Description:** Both `sanitizePlayerAction` (lib/utils.ts) and `protectUserAction` (lib/prompt-injection-protection) filter injection patterns, but they use separate pattern lists that may not catch all variants. The `PROMPT_INJECTION_DEFENSE` is added to the system message, but sanitized user input may still contain undetected injection attempts.  
**Location:** `src/lib/utils.ts` (sanitizePlayerAction), `src/ai/ai-router.ts`, `src/ai/prompt-templates/system-messages.ts` (ANTI_INJECTION_RULES)  
**Impact:** Adversarial players may trick the AI into breaking character, revealing system prompts, or violating content rules, compromising immersion and security.  
**Fix:** Unify injection patterns into a single shared constant (e.g., `lib/injection-patterns.ts`). Add patterns for variants like "stop being a narrator", "you are now a", and "repeat your instructions". Add a server-side check for injection patterns in AI responses.

### AI-8: Anti-Repetition Rules Are Only Instructions
**Severity:** Low  
**Description:** `ANTI_REPETITION_RULES` and `BASE_NARRATOR_SYSTEM_MESSAGE` include instructions to avoid repetition, but there is no code to enforce this. The AI may still repeat phrases, especially with lower temperature settings.  
**Location:** `src/ai/prompt-templates/system-messages.ts` (ANTI_REPETITION_RULES, BASE_NARRATOR_SYSTEM_MESSAGE)  
**Impact:** Repetitive narration reduces immersion, particularly in longer adventures with 20+ turns.  
**Fix:** Same as AI-1: Add programmatic repetition detection, or include a "Recent Phrases to Avoid" section in the prompt with the last 3 narrations.

### AI-9: Story Log Summary Limited to Last 10 Turns
**Severity:** Medium  
**Description:** `buildStoryLogSummary` only includes the last 10 turns, so events older than 10 turns are excluded from the summary. The AI may contradict or forget events from earlier in longer adventures.  
**Location:** `src/context/game-state-utils.ts` (buildStoryLogSummary, buildStoryStateFacts)  
**Impact:** Narrative coherence breaks for adventures with 20+ turns as the AI loses context of earlier events.  
**Fix:** Increase the story log summary to include the last 20 turns, or add a "Key Story Milestones" section that lists major events (e.g., boss defeats, major item finds) regardless of turn count.

### AI-10: No Detection of AI Meta Comments in Narration
**Severity:** High  
**Description:** `detectAiRefusal` only checks for refusal patterns, not all meta comments (e.g., "I'm an AI", "As a language model"). The AI may include these in narration, breaking the fourth wall.  
**Location:** `src/lib/utils.ts` (detectAiRefusal), `src/ai/flows/narrate-adventure.ts`  
**Impact:** Players see meta comments that break immersion, as the AI acknowledges it is an artificial system rather than a game narrator.  
**Fix:** Extend `detectAiRefusal` to check for all meta comment patterns (e.g., `/i am an? (ai|language model|assistant)/i`, `/as an? (ai|language model)/i`). Filter meta comments from narration or regenerate the response if detected.

