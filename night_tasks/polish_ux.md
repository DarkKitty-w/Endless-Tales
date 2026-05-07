# Endless Tales: Polish & UX Audit Report
*Generated: 2026-05-07*

## Summary
Audit of the Endless Tales project for polish and UX inconsistencies, focusing on unreachable features, visual issues, missing feedback, design inconsistencies, accessibility gaps, and multiplayer UI problems. All findings are listed below with severity ratings and fix suggestions.

## Detailed Findings

### POLISH-1: Placeholder Icon for Wisdom Stat
**Severity:** Medium  
**Description:** The Wisdom stat in CharacterStatsAllocator uses `HandDrawnAgilityIcon` as a placeholder, as noted in the code comment. No dedicated Wisdom icon exists in the icon set.  
**Location:** `src/components/character/CharacterStatsAllocator.tsx`, line 70  
**Current Behaviour:** Wisdom stat displays the Agility icon (running figure) instead of an appropriate Wisdom icon (e.g., book, brain, star).  
**Expected:** Wisdom stat should have a unique, context-appropriate icon matching other stat icons (Strength, Stamina).  
**Fix:** Create a `HandDrawnWisdomIcon` component in `src/components/icons/HandDrawnIcons.tsx` (e.g., a book or brain icon) and update the import/usage in CharacterStatsAllocator.tsx.

---

### POLISH-2: Missing ARIA Label on Trade Request Button (PartySidebar)
**Severity:** Medium  
**Description:** The trade request button in PartySidebar uses a `title` attribute but no `aria-label`, making it inaccessible to screen readers. 
**Location:** `src/components/gameplay/PartySidebar.tsx`, lines 136-144   
**Current Behaviour:** Screen readers announce the button as "Button" with no context about its purpose or target. 
**Expected:** Button should have an `aria-label` that includes the target player's name for accessibility. 
**Fix:** Add `aria-label={`Request trade with ${displayName}`}` to the trade button element.

---

### POLISH-3: Missing ARIA Label on Chat Send Button
**Severity:** Medium  
**Description:** The chat send button in ChatPanel only has an icon (Send) with no `aria-label`. 
**Location:** `src/components/gameplay/ChatPanel.tsx`, lines 117-119   
**Current Behaviour:** Screen readers do not announce the button's purpose, creating accessibility barriers. 
**Expected:** Button should have a clear `aria-label` describing its function. 
**Fix:** Add `aria-label="Send message"` to the send button element.

---

### POLISH-4: No API Key Input Fields for Cloud AI Providers in SettingsPanel
**Severity:** High  
**Description:** The README states "API keys are stored only in sessionStorage and cleared when the browser tab is closed." The SettingsPanel has state for API keys (lines 106-110) and a `handleSaveProviderKey` function (line 174), but the UI only shows configuration for WebLLM. For cloud providers (Gemini, OpenAI, Claude, DeepSeek, OpenRouter), it displays "AI provider is configured server-side. Contact administrator for API key configuration." 
**Location:** `src/components/screens/SettingsPanel.tsx`, lines 443-453   
**Current Behaviour:** Users cannot enter or save API keys for cloud providers via the UI, despite the state management supporting it. 
**Expected:** Each cloud provider should have an input field to enter/save the API key, matching the existing state logic. 
**Fix:** Add conditional API key input fields for each cloud provider (shown when the provider is selected) in the SettingsPanel, using the existing `handleSaveProviderKey` function.
---

### POLISH-5: No Visual Loading State for Action Submission
**Severity:** Medium  
**Description:** When a user submits an action, the `submittingRef` lock prevents duplicate submissions, but no visual loading state is shown. The send button only shows a `Loader2` spinner when `isWaitingForHost` is true, not during action processing.  
**Location:** `src/components/gameplay/ActionInput.tsx`, lines 106-132  
**Current Behaviour:** Users may not know the action is being processed, leading to multiple submissions or confusion.  
**Expected:** Show a loading spinner on the send button and disable the input while the AI is generating a response.  
**Fix:** Add a `isLoading` prop to ActionInput that triggers a spinner in the send button and disables the input.

---

### POLISH-6: Duplicate Player Stats Display in PartySidebar
**Severity:** Low  
**Description:** Player stats (currentHealth/maxHealth, currentStamina/maxStamina, currentMana/maxMana) are displayed twice for each player: once in the turn order list and again in the "Connected Players" section below.  
**Location:** `src/components/gameplay/PartySidebar.tsx`, lines 122-129 (SortableTurnOrderItem) and lines 389-395 (Connected Players section)  
**Current Behaviour:** Redundant stats display takes up unnecessary space and creates visual clutter.  
**Expected:** Stats should only be displayed once per player, preferably in the turn order list.  
**Fix:** Remove the stats display from the "Connected Players" section (lines 389-395 and 413-417) to avoid duplication.

---

### POLISH-7: SettingsPanel Provider Options Missing WebLLM During Availability Check
**Severity:** Low  
**Description:** The `providerOptions` array only includes WebLLM if `webllmSupported` is true. During the WebLLM availability check (`webllmChecking` is true), WebLLM is not shown at all in the provider dropdown, leaving users unaware it is a pending option.  
**Location:** `src/components/screens/SettingsPanel.tsx`, lines 241-253  
**Current Behaviour:** While checking for WebLLM support, the provider dropdown does not show WebLLM at all, with only a small text note "Checking for local AI support...".  
**Expected:** WebLLM should be shown in the dropdown as an option with a "(Checking...)" suffix while availability is being verified.  
**Fix:** Update the providerOptions logic to include WebLLM with a "(Checking...)" label while `webllmChecking` is true, and update the label when support is confirmed or denied.

---

### POLISH-8: Quick Action Buttons Use Emojis Instead of Lucide Icons
**Severity:** Low  
**Description:** The quick action buttons in ActionInput use emojis (👀, 🎒, 😴, etc.) instead of consistent Lucide React icons used elsewhere in the app.  
**Location:** `src/components/gameplay/ActionInput.tsx`, lines 23-30 (QUICK_ACTIONS array)  
**Current Behaviour:** Inconsistent icon style with the rest of the UI (which uses Lucide icons like Sword, Users, etc.).  
**Expected:** Quick action buttons should use Lucide icons matching the app's design language.  
**Fix:** Replace emojis in QUICK_ACTIONS with corresponding Lucide icons (e.g., `Eye` for Look, `Backpack` for Inventory, `Moon` for Rest, `User` for Status, `Map` for Map, `Zap` for Skills).

---

## Verification Against README Features
All features listed in the README were verified for UI reachability:
- ✅ Adventure Modes (Randomized, Custom, Immersed, Co-op): All reachable from MainMenu dropdown
- ✅ 6 AI Providers: Listed in SettingsPanel (though cloud provider key input is missing per POLISH-5)
- ✅ Dynamic Character System: Reachable via CharacterCreation screen
- ✅ AI-Driven Gameplay: Functional in Gameplay screen
- ✅ Progression Systems (Crafting, Skill Trees, etc.): Reachable from LeftPanel tabs
- ✅ Save/Load System: Functional via Gameplay save button and SavedAdventuresList (AdventureSummary save button missing per POLISH-2)
- ✅ Customization (Themes, Settings): Functional in SettingsPanel
- ✅ Multiplayer Features: All features (chat, trading, turn indicator, party management) are present and functional in PartySidebar/ChatPanel
