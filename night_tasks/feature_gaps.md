# Endless Tales Feature Gaps Audit Report

## Features Not Completely Implemented

### F-001: KICK_PLAYER Action Missing UI Trigger
**Severity:** High  
**Description:** The `KICK_PLAYER` action is fully defined in `game-actions.ts` and handled in `multiplayerReducer.ts`, but no UI element exists in the Coop Lobby or Gameplay screens to allow the host to remove unwanted players.  
**Location:**  
- `src/context/game-actions.ts` (line 70)  
- `src/context/reducers/multiplayerReducer.ts`  
- `src/components/screens/CoopLobby.tsx`  
- `src/components/screens/Gameplay.tsx`  
**Current Behaviour:** Action exists in the reducer but cannot be triggered by the user.  
**Expected:** Host should see a "Kick" button next to each player in the party list to remove disruptive players.  
**Suggestion:** Add a small kick button (X icon) next to player names in the multiplayer party sidebar. Use the existing `AlertDialog` component to show a confirmation before dispatching `KICK_PLAYER` with the target peer ID.

### F-002: PAUSE_GAME/RESUME_GAME Actions Missing UI
**Severity:** Medium  
**Description:** Pause and resume actions for multiplayer sessions are defined and handled in the reducer, but no UI controls exist to trigger them.  
**Location:**  
- `src/context/game-actions.ts` (lines 71-72)  
- `src/context/reducers/multiplayerReducer.ts`  
- `src/components/screens/Gameplay.tsx`  
**Current Behaviour:** Actions are available in code but not accessible to players.  
**Expected:** Host can pause the game for all connected players (e.g., for breaks or rule discussions) and resume when ready.  
**Suggestion:** Add a pause/resume toggle button in the multiplayer gameplay header, visible only to the host. Dispatch `PAUSE_GAME` or `RESUME_GAME` on click, and show a global notification to all players when the game is paused.

### F-003: Turn Order Customization UI Missing
**Severity:** Medium  
**Description:** The `SET_TURN_ORDER` action exists and is called once when a multiplayer game starts, but there is no UI to let the host reorder the turn order (e.g., drag-and-drop or up/down buttons).  
**Location:**  
- `src/context/game-actions.ts` (line 60)  
- `src/components/screens/CoopLobby.tsx` (line 134)  
**Current Behaviour:** Turn order is set once on game start with no way to modify it.  
**Expected:** Host can adjust turn order before or during the game to accommodate player preferences.  
**Suggestion:** Add a simple ordered list in the Coop Lobby or Gameplay settings showing current turn order, with up/down arrows next to each player name to reorder. Dispatch `SET_TURN_ORDER` with the new order when changes are made.

### F-004: Adventure Summary Save Logic Incomplete
**Severity:** Low  
**Description:** `AdventureSummary.tsx` contains a TODO comment: `// TODO: Implement saving/loading logic if required later`. While the core save/load system works, the summary screen does not auto-save or provide a clear save button for completed adventures.  
**Location:** `src/components/screens/AdventureSummary.tsx` (line 1)  
**Current Behaviour:** Completed adventures may not be saved automatically, and the summary screen lacks a save action.  
**Expected:** Completed adventures should either auto-save or provide a prominent "Save Adventure" button in the summary screen.  
**Suggestion:** Dispatch `SAVE_CURRENT_ADVENTURE` when the adventure ends and the summary is generated. Add a save button to the summary screen for manual saves.

---

## Refinements

### R-001: Skill Tree Respec Lacks Confirmation Dialog
**Severity:** Medium  
**Description:** The "Respec All" button in `SkillTreeDisplay` immediately resets all learned skills without confirmation, leading to accidental respecs that cost player progress.  
**Location:** `src/components/game/SkillTreeDisplay.tsx` (lines 153-163)  
**Current Behaviour:** No confirmation before permanently resetting all skill points.  
**Expected:** A confirmation dialog should appear to prevent accidental respecs.  
**Suggestion:** Wrap the `onRespecAll` call in an `AlertDialog` (already used elsewhere in the project) that asks "Are you sure you want to respec all skills? This cannot be undone."

### R-002: World Map Undiscovered Locations Need Clearer Visual Cues
**Severity:** Low  
**Description:** Undiscovered locations are shown as "???" with 40% opacity, but there is no lock icon or explicit tooltip indicating they are undiscovered, making it unclear why they are unclickable.  
**Location:** `src/components/game/WorldMapDisplay.tsx` (lines 141-160)  
**Current Behaviour:** Undiscovered locations are faded with a "???" label, no lock indicator.  
**Expected:** Clear visual distinction between discovered and undiscovered locations.  
**Suggestion:** Add a `Lock` icon from `lucide-react` next to undiscovered location names. Update the tooltip for undiscovered locations to say "Undiscovered - Explore connected locations to reveal this area".

### R-003: Crafting Insufficient Materials Feedback Missing
**Severity:** Medium  
**Description:** The crafting system works, but when a player attempts to craft without required materials, there is no visual feedback in the inventory (e.g., greyed out ingredients, explicit error message in the crafting dialog).  
**Location:**  
- `src/components/screens/Gameplay.tsx` (lines 1151-1165)  
- `src/components/game/InventoryDisplay.tsx`  
**Current Behaviour:** Crafting success/failure is shown via a toast notification, but no in-inventory feedback for missing materials.  
**Expected:** Players should see which materials they are missing before attempting to craft.  
**Suggestion:** When opening the crafting dialog, check the inventory for required materials and show a warning message if any are missing. Grey out unavailable ingredients in the crafting ingredient list.



---

## Tweaks

### T-001: Leave Game/Disconnect Confirmation Missing
**Severity:** Medium  
**Description:** Clicking "Disconnect" in the Coop Lobby or "Leave Game" in Gameplay immediately disconnects the player without confirmation, which is irreversible and easy to trigger accidentally.  
**Location:**  
- `src/components/screens/CoopLobby.tsx` (line 139)  
- `src/components/screens/Gameplay.tsx`  
**Current Behaviour:** No confirmation dialog before leaving a game or disconnecting from a session.  
**Expected:** Confirmation dialog to prevent accidental session leaves.  
**Suggestion:** Add an `AlertDialog` confirmation for all disconnect/leave buttons, with text like "Are you sure you want to leave the game? Progress may be lost."

### T-002: Keyboard Shortcuts for Common Actions Missing
**Severity:** Low  
**Description:** No keyboard shortcuts exist for common actions like "Enter" to submit inputs, "Esc" to close dialogs, or "Ctrl+S" to save progress.  
**Location:** All screens with inputs, dialogs, or save functionality.  
**Current Behaviour:** Players must use mouse/touch for all interactions.  
**Expected:** Basic keyboard shortcuts to improve power user experience.  
**Suggestion:** Add `keydown` event handlers to key screens:  
- `Esc` to close open dialogs/drawers  
- `Ctrl+S` (or `Cmd+S`) to dispatch `SAVE_CURRENT_ADVENTURE`  
- `Enter` to submit forms (already partially implemented in some components)

### T-003: Crafting Button Lacks Tooltip
**Severity:** Low  
**Description:** The crafting button in the Gameplay screen has no tooltip explaining its function, making it unclear to new players.  
**Location:** `src/components/screens/Gameplay.tsx`  
**Current Behaviour:** Button has no accessible label or tooltip.  
**Expected:** Tooltip explaining "Open Crafting Dialog" on hover/focus.  
**Suggestion:** Add a `title` attribute or wrap the button in a `Tooltip` component with the text "Open Crafting Dialog".

### T-004: Empty State for Multiplayer Party List
**Severity:** Low  
**Description:** When the host is alone in a multiplayer session (no other players joined yet), the party list shows a blank area with no indication of why it's empty.  
**Location:** `src/components/screens/Gameplay.tsx` (party sidebar)  
**Current Behaviour:** Empty party list displays nothing.  
**Expected:** Helpful empty state message for clarity.  
**Suggestion:** Add a conditional empty state in the party sidebar: "No other players yet - share your invite code to add friends!"


---

## Enrichment Ideas

### E-001: Client-Side Achievement System
**Severity:** Low  
**Description:** The game tracks many milestones (first level up, first crafted item, first death, etc.) but has no system to reward players with visible achievements.  
**Location:**  
- `src/context/game-reducer.ts`  
- `src/context/game-actions.ts` (new `UNLOCK_ACHIEVEMENT` action)  
**Current Behaviour:** Milestones are tracked in state but not surfaced to the player.  
**Expected:** Players earn achievements for reaching milestones, displayed in a new UI tab.  
**Suggestion:**  
1. Add an `achievements: string[]` field to `GameState`  
2. Create an `UNLOCK_ACHIEVEMENT` action that pushes achievement IDs to the array  
3. Dispatch this action when milestones are met (e.g., first level up, first craft)  
4. Add an "Achievements" tab to `LeftPanel.tsx` to display unlocked achievements with icons and descriptions

### E-002: Auto-Journal for Story Events
**Severity:** Medium  
**Description:** The game has a flat story log, but no structured journal that automatically records key events like quest progress, major decisions, NPC interactions, and location discoveries.  
**Location:**  
- `src/context/game-reducer.ts` (new `ADD_JOURNAL_ENTRY` action)  
- `src/components/game/` (new `JournalDisplay.tsx` component)  
**Current Behaviour:** Story events are only available in a chronological list of narration entries.  
**Expected:** A categorized journal that organizes key events for easy reference.  
**Suggestion:**  
1. Add a `journal: JournalEntry[]` field to `GameState`  
2. Define journal entry types: `quest`, `npc`, `location`, `combat`, `discovery`  
3. Dispatch `ADD_JOURNAL_ENTRY` when key events occur (location discovered, NPC met, quest updated)  
4. Add a "Journal" tab to `LeftPanel.tsx` with categories and search functionality

### E-003: Ambient Sound Toggle
**Severity:** Low  
**Description:** No sound effects or ambient music exist, which would significantly enhance immersion. A simple toggle to enable/disable sound would be easy to add with the Web Audio API.  
**Location:**  
- `src/components/screens/SettingsPanel.tsx`  
- New `src/lib/audio-utils.ts`  
**Current Behaviour:** Completely silent gameplay.  
**Expected:** Toggle for ambient music and SFX (dice rolls, crafting, combat) in settings.  
**Suggestion:**  
1. Add a "Sound Effects" toggle in `SettingsPanel.tsx` using the existing `Switch` component  
2. Create a simple audio utility using the Web Audio API to play short SFX for common actions  
3. Add optional background music (royalty-free tracks) that plays during gameplay when enabled

### E-004: Loot Drops from Location Exploration
**Severity:** Medium  
**Description:** The world map has discoverable locations, but no loot or items are granted when exploring new areas. Adding random loot drops would greatly enrich the exploration loop.  
**Location:**  
- `src/context/reducers/adventureReducer.ts` (DISCOVER_LOCATION case)  
- `src/components/game/WorldMapDisplay.tsx`  
**Current Behaviour:** Discovering a new location only marks it as discovered on the map.  
**Expected:** Discovering new locations grants random crafting materials or consumable items.  
**Suggestion:**  
1. When `DISCOVER_LOCATION` is dispatched, generate 1-3 random items based on location type:  
   - Forest: Herbs, berries, wood  
   - Dungeon: Ores, gems, old coins  
   - Town: Food, basic gear  
2. Dispatch `ADD_ITEM` for each generated item  
3. Show a toast notification: "You found [item names] while exploring [location name]!"
