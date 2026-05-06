## Features Not Completely Implemented

### F-001: Player Trading UI Missing
**Severity:** High
**Description:** README claims "player trading" as a core multiplayer feature. The `multiplayerReducer` includes `PROCESS_TRADE` logic, and `PartySidebar` has `onSendTradeRequest` props, but no `TradeDialog` component exists to handle trade confirmation/execution. Trades only update party state inventory summaries, not actual player inventories.
**Location:**
- `src/context/reducers/multiplayerReducer.ts` (lines 231-265: `PROCESS_TRADE`)
- `src/components/gameplay/PartySidebar.tsx` (lines 163-173: trade request button)
- Missing: `src/components/gameplay/TradeDialog.tsx`
**Current Behaviour:** Trade requests can be sent, but no UI to complete trades; actual inventory not updated.
**Expected:** A dialog to select items for trade, with proper inventory synchronization between players.
**Suggestion:** Create `TradeDialog`, connect to `PROCESS_TRADE` action, add inventory update logic for both players.

### F-002: Adventure Summary Unreachable
**Severity:** Medium
**Description:** `AdventureSummary.tsx` exists but there's no navigation link to it from Gameplay or MainMenu. Players cannot view summary of completed adventures.
**Location:** `src/components/screens/AdventureSummary.tsx`, `src/components/screens/Gameplay.tsx`, `src/components/screens/MainMenu.tsx`
**Current Behaviour:** Summary feature is useless if players can't access it.
**Expected:** Players should be able to view adventure summaries after completing or during review.
**Suggestion:** Add "View Summary" button after adventure ends, or link from SavedAdventuresList.

### F-003: Skill Tree Frontend Missing
**Severity:** High
**Description:** README claims "skill trees" as implemented. AI flow `generate-skill-tree.ts` exists, but there is no frontend component to display or interact with the skill tree. Players cannot see or choose skills.
**Location:** `src/ai/flows/generate-skill-tree.ts`, missing `src/components/game/SkillTreeDisplay.tsx` integration
**Current Behaviour:** Progression system is invisible to players, reducing engagement.
**Expected:** Players should see their skill tree, allocate points, and see skill unlocks.
**Suggestion:** Implement `SkillTreeDisplay` component that shows generated skill tree, allows interaction.

### F-004: Action Difficulty Assessment Not Integrated
**Severity:** High
**Description:** README lists "action difficulty assessment" as implemented. The AI flow `assess-action-difficulty.ts` exists but is never called in gameplay components. No UI feedback for difficulty is shown.
**Location:** `src/ai/flows/assess-action-difficulty.ts`, `src/components/gameplay/ActionInput.tsx`, `src/components/screens/Gameplay.tsx`
**Current Behaviour:** Breaks README feature promise, removes strategic depth.
**Expected:** Players should see difficulty ratings for actions, affecting game outcomes.
**Suggestion:** Call `assess-action-difficulty` flow when player submits actions, display difficulty in UI.

### F-005: Crafting System Not Integrated
**Severity:** High
**Description:** README lists "Crafting" as a feature, and there is `attempt-crafting.ts` AI flow, but no crafting UI or integration with gameplay. Players cannot craft items.
**Location:** `src/ai/flows/attempt-crafting.ts`, missing `src/components/gameplay/CraftingDialog.tsx` integration
**Current Behaviour:** Players expect crafting but find nothing.
**Expected:** Functional crafting system with UI, material requirements, and AI validation.
**Suggestion:** Implement crafting UI, integrate with inventory, call `attempt-crafting` flow.

### F-006: Character Creation Loading State Missing
**Severity:** Medium
**Description:** When generating AI character description, the submit button shows no loading indicator. Players may click multiple times or think app froze.
**Location:** `src/components/screens/CharacterCreation.tsx`
**Current Behaviour:** Confusing UX, may lead to duplicate actions.
**Expected:** Clear loading state during AI generation.
**Suggestion:** Show spinner or disable button with "Generating..." text.

### F-007: Co-op Lobby Screen Unreachable
**Severity:** Medium
**Description:** `CoopLobby.tsx` exists but there's no clear navigation to it from MainMenu in some flows. Players may not know how to access co-op mode.
**Location:** `src/components/screens/CoopLobby.tsx`, `src/components/screens/MainMenu.tsx`
**Current Behaviour:** Feature exists but may be hard to find.
**Expected:** Clear path to co-op mode from main menu.
**Suggestion:** Ensure Co-op button in MainMenu clearly leads to CoopLobby.

### F-008: Permanent Death Mode Not Exposed
**Severity:** Medium
**Description:** Code hints at permanent death (`permanentDeath` in game state), but there's no clear UI toggle or explanation to players. README mentions it as a setting but it's not prominent.
**Location:** `src/types/game-types.ts`, `src/components/screens/AdventureSetup.tsx`
**Current Behaviour:** Players may not know this feature exists or how to enable it.
**Expected:** Clear toggle for permanent death with explanation of consequences.
**Suggestion:** Add prominent permanent death toggle in AdventureSetup with warning dialog.

## Refinements

### R-001: Skill Tree Unlearn/Respec Functionality
**Severity:** Medium
**Description:** Players can spend skill points but cannot reset or reallocate them. This can lead to regret and discouragement.
**Location:** `src/components/game/SkillTreeDisplay.tsx`
**Current Behaviour:** Points are permanently assigned, no way to unlearn skills.
**Expected:** Offer a "Respec" button (maybe with a cost) that allows the player to refund all points and re-assign them.
**Suggestion:** Add an "Unlearn" button next to each learned skill, and "Respec All" button. Requires adding `onUnlearnSkill` and `onRespecAll` props.

### R-002: Crafting Material Feedback
**Severity:** Medium
**Description:** Crafting uses materials but there's no visual feedback when materials are insufficient. Players see no indication of what's missing.
**Location:** `src/components/gameplay/CraftingDialog.tsx`
**Current Behaviour:** Attempting to craft without materials silently fails or shows generic error.
**Expected:** Clear visual indication of missing materials, showing "Need 3 Iron Ore" with red highlighting.
**Suggestion:** Add material requirement display with checkmarks for available, X for missing.

### R-003: World Map Discovered vs Undiscovered
**Severity:** Medium
**Description:** The world map has locations but no visual indication of which ones are discovered vs undiscovered. Players don't know what they've explored.
**Location:** `src/components/game/WorldMapDisplay.tsx`
**Current Behaviour:** All locations look the same regardless of discovery status.
**Expected:** Discovered locations should be highlighted, undiscovered shown as "?" or grayed out.
**Suggestion:** Add discovery state to locations, use different styles for discovered/undiscovered.

### R-004: Multiplayer Turn Order Customization
**Severity:** Medium
**Description:** Turn order is displayed but cannot be customized (drag to reorder). Players may want to change turn sequence.
**Location:** `src/components/gameplay/PartySidebar.tsx`
**Current Behaviour:** Turn order is fixed based on join order.
**Expected:** Players should be able to drag and drop to reorder turn sequence.
**Suggestion:** Add drag-and-drop functionality to turn order display using a library like dnd-kit.

## Tweaks

### T-001: Kick Player Confirmation
**Severity:** High
**Location:** `src/components/gameplay/PartySidebar.tsx` (lines 174-183, 244-253)
**Current Behaviour:** Clicking "Kick" immediately removes the player with no confirmation.
**Expected:** Show an alert dialog confirming the kick action since it's disruptive and irreversible for the guest.
**Suggestion:** Wrap Kick buttons in `<AlertDialog>` similar to SavedAdventuresList delete pattern.

### T-002: End Adventure Confirmation
**Severity:** High
**Location:** `src/components/gameplay/GameplayActions.tsx` (lines 79-81)
**Current Behaviour:** "End Adventure" button immediately calls `onEnd` with no confirmation.
**Expected:** Show confirmation dialog explaining this permanently ends the adventure (unlike Abandon which returns to menu).
**Suggestion:** Wrap in `<AlertDialog>` with warning about permanent ending vs abandoning.

### T-003: Delete Save Confirmation
**Severity:** High
**Location:** `src/components/screens/SavedAdventuresList.tsx`
**Current Behaviour:** Some delete actions may not have confirmation (check pattern).
**Expected:** All irreversible delete actions should have confirmation dialogs.
**Suggestion:** Ensure all delete buttons use AlertDialog pattern.

### T-004: Empty Party Panel State
**Severity:** Medium
**Location:** `src/components/gameplay/PartySidebar.tsx`
**Current Behaviour:** When no party members, panel may show blank or confusing state.
**Expected:** Show "No party members yet" with helpful text about inviting players.
**Suggestion:** Add proper empty state component with icon and helpful message.

### T-005: Empty Inventory State
**Severity:** Medium
**Location:** `src/components/game/InventoryDisplay.tsx`
**Current Behaviour:** Empty inventory shows nothing or default empty array rendering.
**Expected:** Show "Inventory is empty" with icon and maybe tips about finding items.
**Suggestion:** Add empty state component with visual feedback.

### T-006: Tooltips on Action Buttons
**Severity:** Medium
**Location:** `src/components/gameplay/GameplayActions.tsx`, all icon buttons
**Current Behaviour:** Many icon buttons have no tooltips, users don't know what they do.
**Expected:** Hovering shows tooltip explaining the action.
**Suggestion:** Add `title` attribute or use Radix Tooltip component for all icon buttons.

### T-007: Keyboard Shortcuts for Common Actions
**Severity:** Medium
**Location:** `src/components/gameplay/ActionInput.tsx`, `src/components/screens/Gameplay.tsx`
**Current Behaviour:** All actions require mouse clicking, no keyboard support.
**Expected:** Common actions should have keyboard shortcuts (e.g., Enter to submit, Escape to close dialogs).
**Suggestion:** Add `onKeyDown` handlers, display shortcut hints on buttons.

### T-008: Smooth Transitions/Animations
**Severity:** Medium
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, `src/components/game/`
**Current Behaviour:** State changes snap instantly without smooth transitions.
**Expected:** Smooth fade-in for new narration, slide animations for panels.
**Suggestion:** Add CSS transitions or use Framer Motion for key UI elements.

### T-009: Focus Rings on Interactive Elements
**Severity:** Medium
**Location:** All interactive components
**Current Behaviour:** Some interactive elements may not show focus rings for keyboard navigation.
**Expected:** Clear focus indicators for accessibility and keyboard users.
**Suggestion:** Ensure Tailwind `focus-visible:ring` styles are applied consistently.

### T-010: Skeleton Loaders for Key Areas
**Severity:** Medium
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, `src/components/game/SkillTreeDisplay.tsx`
**Current Behaviour:** Loading states may show generic spinners or nothing.
**Expected:** Proper skeleton loaders that match the shape of content being loaded.
**Suggestion:** Implement skeleton components for narration, skill tree, inventory.

### T-011: Better Error Messages for Irreversible Actions
**Severity:** High
**Location:** All error handling in gameplay
**Current Behaviour:** Error messages may be cryptic or generic.
**Expected:** Clear, actionable error messages that explain what went wrong and how to fix it.
**Suggestion:** Review all error messages, make them user-friendly with next steps.

### T-012: Hover Effects on Interactive Cards
**Severity:** Low
**Location:** `src/components/game/CardboardCard.tsx`, inventory items
**Current Behaviour:** Cards may not have hover effects indicating they're interactive.
**Expected:** Subtle scale, shadow, or border color change on hover.
**Suggestion:** Add Tailwind hover: classes for interactive cards.

### T-013: Visual Feedback for Gained Items/Skills
**Severity:** Medium
**Location:** `src/components/gameplay/NarrationDisplay.tsx`, `src/context/GameContext.tsx`
**Current Behaviour:** When player gains items or skills, there's no visual celebration.
**Expected:** Toast notification or animation when receiving rewards.
**Suggestion:** Trigger toast or animation when `gainedItem` or `gainedSkill` detected in narration.

### T-014: Improved Mobile Experience
**Severity:** Medium
**Location:** `src/hooks/use-mobile.tsx`, all gameplay components
**Current Behaviour:** Mobile layout may be functional but not optimized.
**Expected:** Touch-friendly targets, proper spacing, mobile-specific layouts.
**Suggestion:** Review all interactive elements for 44px minimum touch targets, test on mobile viewports.

### T-015: Contextual Help/Instructions
**Severity:** Medium
**Location:** `src/components/screens/Gameplay.tsx`, first-time user experience
**Current Behaviour:** New players may not understand all features available.
**Expected:** Optional tutorial tooltips or "?" icons explaining features.
**Suggestion:** Add dismissable help bubbles for first-time users.

### T-016: Party Member Online/Offline Indicators
**Severity:** Medium
**Location:** `src/components/gameplay/PartySidebar.tsx`
**Current Behaviour:** No indication of which party members are online/active.
**Expected:** Green dot for online, gray for offline/away.
**Suggestion:** Add presence indicators based on WebRTC connection state.

### T-017: Chat Message Timestamps
**Severity:** Low
**Location:** `src/components/gameplay/ChatPanel.tsx`
**Current Behaviour:** Chat messages may not show timestamps.
**Expected:** Relative timestamps ("2 min ago") for chat messages.
**Suggestion:** Add timestamp display with relative time formatting.

### T-018: Inventory Item Categorization
**Severity:** Medium
**Location:** `src/components/game/InventoryDisplay.tsx`
**Current Behaviour:** All items listed together regardless of type.
**Expected:** Tabs or sections for Weapons, Armor, Consumables, Materials, etc.
**Suggestion:** Add category tabs to inventory display.

### T-019: Skill Tree Progress Indicators
**Severity:** Medium
**Location:** `src/components/game/SkillTreeDisplay.tsx`
**Current Behaviour:** No visual progress towards next skill tier.
**Expected:** Progress bars showing XP towards next skill unlocks.
**Suggestion:** Add progress indicators for each skill category.

### T-020: Quick Action Buttons for Common Tasks
**Severity:** Medium
**Location:** `src/components/gameplay/ActionInput.tsx`
**Current Behaviour:** Players must type everything manually.
**Expected:** Quick-action buttons for "Look around", "Check inventory", "Rest" etc.
**Suggestion:** Add configurable quick-action button bar.

### T-021: Narrative Text Formatting
**Severity:** Low
**Location:** `src/components/gameplay/NarrationDisplay.tsx`
**Current Behaviour:** AI text is displayed as plain paragraph.
**Expected:** Support for bold, italic, maybe simple formatting in AI responses.
**Suggestion:** Parse and render basic Markdown formatting from AI responses.

### T-022: Character Portrait/Customization Display
**Severity:** Medium
**Location:** `src/components/game/CharacterDisplay.tsx`
**Current Behaviour:** Character stats shown but no visual portrait or customization.
**Expected:** Visual character representation, maybe ASCII art or simple avatar.
**Suggestion:** Add character portrait section, allow simple customization options.

### T-023: World Map Zoom/Pan
**Severity:** Low
**Location:** `src/components/game/WorldMapDisplay.tsx`
**Current Behaviour:** Static map display, no interaction beyond clicking locations.
**Expected:** Zoom and pan functionality for larger maps.
**Suggestion:** Add pan/zoom using CSS transform or a library.

### T-024: Notification Center for Game Events
**Severity:** Medium
**Location:** New component needed
**Current Behaviour:** Game events (level up, reputation change) may only appear in narration.
**Expected:** Dedicated notification area or toast system for important events.
**Suggestion:** Create NotificationCenter component, integrate with game state changes.

### T-025: Difficulty Indicator for Actions
**Severity:** Medium
**Location:** `src/components/gameplay/ActionInput.tsx`
**Current Behaviour:** No indication of how difficult an action might be.
**Expected:** Show difficulty rating (Easy/Medium/Hard) for player actions.
**Suggestion:** Integrate with `assess-action-difficulty` flow, display rating.

### T-026: Reputation Change Visual Feedback
**Severity:** Medium
**Location:** `src/components/game/NpcRelationshipsDisplay.tsx`
**Current Behaviour:** Reputation changes happen silently.
**Expected:** Visual indicator (+10 Reputation with Faction) when changes occur.
**Suggestion:** Add toast or inline animation for reputation changes.

### T-027: Quick Save/Load Keyboard Shortcuts
**Severity:** Low
**Location:** `src/components/screens/Gameplay.tsx`
**Current Behaviour:** Save/Load requires menu navigation.
**Expected:** Ctrl+S to quick save, Ctrl+L to quick load.
**Suggestion:** Add keyboard shortcut handlers for save/load.

### T-028: Ambient Sound Toggle in Settings
**Severity:** Low
**Location:** `src/components/screens/SettingsPanel.tsx`
**Current Behaviour:** No sound options in settings.
**Expected:** Toggle for ambient sounds or music if implemented.
**Suggestion:** Add sound toggle in settings (for future audio implementation).

### T-029: High Contrast Mode for Accessibility
**Severity:** Medium
**Location:** `src/lib/themes.ts`, `src/app/globals.css`
**Current Behaviour:** Themes may not meet WCAG contrast requirements.
**Expected:** High contrast theme option for visually impaired users.
**Suggestion:** Add high contrast theme to theme options.

### T-030: Party Experience Sharing Display
**Severity:** Low
**Location:** `src/components/gameplay/PartySidebar.tsx`
**Current Behaviour:** No indication of total party XP or individual contributions.
**Expected:** Show party XP progress, maybe individual contributions.
**Suggestion:** Add XP summary to party panel.

## Enrichment Ideas

### E-001: Loot System for Crafting Materials
**Severity:** High
**Description:** Implement a system to drop crafting materials during adventures for use in existing crafting systems.
**Location:** `src/types/item.ts`, `src/context/InventoryContext.tsx`, `src/ai/flows/adventureRewards.ts`
**Current Behaviour:** No loot tables or `CraftingMaterial` type exists; adventure rewards are generic.
**Expected:** Crafting materials drop from enemies/chests, creating gameplay loop between adventures and crafting.
**Suggestion:** Define `LootTable` type, add material drops to AI adventure flow, integrate with inventory.

### E-002: Ambient Music/Sound Effects Toggle
**Severity:** Medium
**Description:** Add optional ambient music and sound effects to enhance immersion. Simple to add using HTML5 Audio API.
**Location:** `src/components/screens/SettingsPanel.tsx`, new `src/lib/audio.ts`
**Current Behaviour:** No audio, completely silent experience.
**Expected:** Optional background music, sound effects for actions (dice rolls, item pickup).
**Suggestion:** Add audio toggle in settings, use Web Audio API for simple sound effects.

### E-003: NPC Companion System
**Severity:** Medium
**Description:** Since NPC relationships are already tracked, implement a companion system where NPCs can join your party temporarily.
**Location:** `src/types/character-types.ts`, `src/context/GameContext.tsx`
**Current Behaviour:** NPCs are only in narration, never join as companions.
**Expected:** Ability to have NPCs join your adventure with their own skills/stats.
**Suggestion:** Add companion state to game, AI flow for companion recruitment, UI in PartySidebar.

### E-004: Journal for Story Events
**Severity:** Medium
**Description:** A "journal" that automatically records key story events, quests, and discoveries.
**Location:** `src/types/game-types.ts`, `src/components/game/JournalDisplay.tsx`
**Current Behaviour:** Story events are only in narration history, no structured journal.
**Expected:** Searchable journal with categories (Quests, Discoveries, NPC Encounters).
**Suggestion:** Create Journal type, auto-populate from AI narration, add JournalDisplay component.

### E-005: Achievement Badges for Milestones
**Severity:** Medium
**Description:** Achievement badges for milestones (first crafted item, first death, 10 adventures completed, etc.) - purely client-side, no backend needed.
**Location:** `src/types/game-types.ts`, `src/context/GameContext.tsx`
**Current Behaviour:** No achievement system, milestones go unnoticed.
**Expected:** Popup notifications for achievements, badge collection screen.
**Suggestion:** Define Achievement type, track milestones in game state, show badges in character screen.

### E-006: Hardcore Mode Toggle
**Severity:** Medium
**Description:** A simple "hardcore" mode with permanent death toggle - the code already hints at perma-death, maybe it's just not exposed.
**Location:** `src/types/game-types.ts`, `src/components/screens/AdventureSetup.tsx`
**Current Behaviour:** Permanent death exists in state but may not be fully exposed to UI.
**Expected:** Hardcore mode with permanent death, maybe additional challenges (no respec, limited saves).
**Suggestion:** Expose permanent death toggle prominently, add "Hardcore Mode" badge to character.

### E-007: Random Narrative Events
**Severity:** Medium
**Description:** Random narrative events that trigger during adventures, environmental interactions (e.g., inspecting objects) add depth.
**Location:** `src/ai/flows/narrate-adventure.ts`, `src/types/game-types.ts`
**Current Behaviour:** Basic exploration and limited hardcoded narrative triggers exist; no random narrative events.
**Expected:** Random events (weather changes, random encounters, discoverable locations) trigger during gameplay.
**Suggestion:** Define `NarrativeEvent` type, add event generation to AI flows, integrate event triggers into game loop.

## API Key Management

### KEY-1: API Key Management UI for Users to Input Their Own Keys
**Severity:** High
**Description:** Users need a UI to input and manage their own API keys for each AI provider (Gemini, OpenAI, Claude, DeepSeek, OpenRouter). Currently keys are stored in sessionStorage but there's no proper UI for users to input them.
**Location:** `src/components/screens/SettingsPanel.tsx`, `src/context/settingsReducer.ts`, `src/lib/constants.ts`
**Current Behaviour:** Users must manually set environment variables or use sessionStorage directly; no in-app UI exists.
**Expected:** A dedicated settings section where users can input, validate, and save their API keys per provider.
**Suggestion:** Create `ApiKeyManager` component with input fields for each provider, show validation status (valid/invalid), save to sessionStorage with proper encryption.

### KEY-2: Provider-Specific Key Switcher in Settings Panel
**Severity:** High
**Description:** When a user selects an AI provider in settings, they should be able to input/switch the API key for that specific provider. The UI should show which providers have keys configured.
**Location:** `src/components/screens/SettingsPanel.tsx`, `src/context/GameContext.tsx`
**Current Behaviour:** Provider selection exists but no key input UI is shown when switching providers.
**Expected:** When user selects "Gemini" provider, show Gemini API key input field; same for OpenAI, Claude, etc.
**Suggestion:** Add dynamic key input fields in SettingsPanel that change based on selected provider, with visual indicators for configured vs unconfigured providers.

### KEY-3: API Key Validation on Input
**Severity:** Medium
**Description:** When users input API keys, there should be format validation before saving (e.g., Gemini keys start with "AIza", OpenAI keys start with "sk-").
**Location:** `src/components/screens/SettingsPanel.tsx`, new `src/lib/key-validation.ts`
**Current Behaviour:** Keys are saved without validation, leading to confusing errors later when the API call fails.
**Expected:** Show "Invalid API key format" message immediately when user inputs a malformed key.
**Suggestion:** Create validation functions for each provider's key format, show inline validation messages with green checkmark or red X.

### KEY-4: "Bring Your Own Key" Tutorial/Help Text
**Severity:** Medium
**Description:** New users may not understand that they need to provide their own API keys for cloud AI providers. WebLLM works without keys, but others require setup.
**Location:** `src/components/screens/SettingsPanel.tsx`, `src/components/screens/MainMenu.tsx`
**Current Behaviour:** No help text or tutorial explaining the "bring your own key" concept.
**Expected:** Clear instructions on how to get API keys, links to provider websites, explanation that WebLLM works without keys.
**Suggestion:** Add dismissable help bubble in SettingsPanel, include links to: Google AI Studio, OpenAI Platform, Anthropic Console, etc.

### KEY-5: Encrypt API Keys in sessionStorage
**Severity:** High
**Description:** API keys are currently stored in sessionStorage without encryption. If the sessionStorage is accessible via XSS, keys could be exposed.
**Location:** `src/context/GameContext.tsx`, `src/lib/utils.ts`
**Current Behaviour:** Keys stored as plain text in sessionStorage.
**Expected:** Keys should be encrypted before storing, decrypted when retrieved.
**Suggestion:** Use a simple encryption library or implement basic obfuscation (not true encryption but better than plaintext). Note: true encryption in browser requires server-side key exchange.

### KEY-6: Clear/Remove API Key Option
**Severity:** Low
**Description:** Users need a way to clear/remove API keys from the UI (e.g., if they want to switch to WebLLM or entered wrong key).
**Location:** `src/components/screens/SettingsPanel.tsx`
**Current Behaviour:** No UI to remove a saved key; users must manually clear sessionStorage.
**Expected:** A "Clear" or "Remove" button next to each key input field.
**Suggestion:** Add trash icon button next to each key input, show confirmation dialog before clearing.
