## Polish & UX

### POLISH-1: Inconsistent Font Usage in MainMenu
**Severity:** Medium  
**Description:** The CardTitle in MainMenu.tsx uses `font-['Comic_Sans_MS',_'Chalkboard_SE',_'Marker_Felt',_sans-serif']` with underscores instead of spaces, which is inconsistent with the global CSS in `globals.css` that uses proper spaces (`'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', sans-serif`). This can cause the font fallback to not work correctly.
**Location:** `src/components/screens/MainMenu.tsx`, line 69
**Root Cause:** Incorrect Tailwind arbitrary value syntax - underscores are used instead of spaces in font-family names
**Reproduction Steps:**
1. Open the Main Menu
2. Inspect the "Endless Tales" title font
3. The font may not render as intended because of the syntax error

**Fix:** Change the font class to use proper CSS font-family syntax:
```tsx
// Remove the incorrect arbitrary value and rely on global CSS, or fix the syntax:
className="text-4xl font-bold text-foreground mb-4"
// The global CSS already sets the body font to the hand-drawn style
```

---

### POLISH-2: Hardcoded Color Classes in CoopLobby (Not Theme-Aware)
**Severity:** Medium  
**Description:** The CoopLobby component uses hardcoded color classes like `text-green-500`, `bg-green-600 hover:bg-green-700` that don't adapt when users switch themes. The app supports multiple themes via `src/lib/themes.ts`, but these classes bypass the theme system.
**Location:** `src/components/screens/CoopLobby.tsx`, lines 148, 157, 207, 232, 269, 311
**Root Cause:** Using Tailwind's default color classes instead of theme-aware classes like `text-primary`, `bg-accent`, etc.
**Reproduction Steps:**
1. Go to Settings and change the theme
2. Open Co-op Lobby
3. The green colors for success states and buttons don't match the selected theme

**Fix:** Replace hardcoded colors with theme-aware classes:
- `text-green-500` → `text-green-500 dark:text-green-400` (or use semantic colors like `text-success`)
- `bg-green-600 hover:bg-green-700` → `bg-primary hover:bg-primary/90`
```

---

### POLISH-3: PartySidebar Doesn't Show Player Stats (Health/Stamina/Mana)
**Severity:** High  
**Description:** The "Connected Players" section in PartySidebar only displays player name, level, and class. It doesn't show health, stamina, or mana bars/values even though the `PlayerSummary` type likely contains this data (based on the `partyState` structure with `currentHealth`, `maxHealth`, etc.).
**Location:** `src/components/gameplay/PartySidebar.tsx`, lines 185-226
**Root Cause:** The UI was not implemented to display the stats that are already being tracked in the state
**Reproduction Steps:**
1. Start a multiplayer game
2. Open the PartySidebar
3. Notice only name, level, and class are shown
4. No health/stamina/mana info is visible for other players

**Fix:** Add stat display to the "Connected Players" section:
```tsx
<div className="flex items-center gap-2">
  <div className="h-2 w-2 rounded-full bg-green-500" />
  <span className="text-sm">{playerSummary.name}</span>
  <span className="text-xs text-muted-foreground">
    (Lvl {playerSummary.level} {playerSummary.class})
  </span>
  {/* ADD THIS: */}
  <div className="ml-auto flex gap-2 text-xs">
    <span className="text-red-500">{playerSummary.currentHealth}/{playerSummary.maxHealth}</span>
    <span className="text-blue-500">{playerSummary.currentStamina}/{playerSummary.maxStamina}</span>
    <span className="text-purple-500">{playerSummary.currentMana}/{playerSummary.maxMana}</span>
  </div>
</div>
```

---

### POLISH-4: Unused Connection Step in CoopLobby
**Severity:** Low  
**Description:** The `connectionStep` state in CoopLobby includes `'guest-input'` (line 25), and there's UI code for it (lines 298-315), but this step is never set in the component logic. The guest flow goes from `'idle'` → `'guest-waiting'` directly.
**Location:** `src/components/screens/CoopLobby.tsx`, lines 25, 298-315
**Root Cause:** Dead code from a previous UI flow design that was changed but not cleaned up
**Reproduction Steps:**
1. Review the code
2. Notice `'guest-input'` is never set as `connectionStep`
3. The UI block at lines 298-315 never renders

**Fix:** Either implement the `'guest-input'` flow properly or remove the dead code:
- Remove `'guest-input'` from the union type on line 25
- Remove the UI block at lines 298-315
- Or implement a separate screen for re-entering the offer code if needed

---

### POLISH-5: ChatPanel Close Button Uses Text Instead of Icon
**Severity:** Low  
**Description:** The ChatPanel close button uses the text character "✕" instead of a proper icon from lucide-react (like `X` icon). This is inconsistent with the rest of the app that uses lucide-react icons.
**Location:** `src/components/gameplay/ChatPanel.tsx`, line 60
**Root Cause:** Using a Unicode character instead of a proper icon component
**Reproduction Steps:**
1. Open the ChatPanel in multiplayer
2. Observe the close button shows "✕" instead of a proper icon
3. The styling and hover effects may not match other buttons

**Fix:** Replace with lucide-react X icon:
```tsx
import { Send, X } from "lucide-react";
// ...
<Button variant="ghost" size="sm" onClick={onClose} aria-label="Close chat">
  <X className="h-4 w-4" />
</Button>
```

---

### POLISH-6: Duplicate Logic for Randomized Adventure in AdventureSetup
**Severity:** Medium  
**Description:** The `handleProceed` function has duplicate logic for handling "Randomized" adventure type. Lines 182-184 handle it by starting gameplay if character exists, but lines 242-244 repeat a similar check with different behavior (going to CharacterCreation instead). This creates confusion and potential bugs.
**Location:** `src/components/screens/AdventureSetup.tsx`, lines 182-184 and 242-244
**Root Cause:** Logic was added twice during development, likely due to refactoring
**Reproduction Steps:**
1. Select "Randomized" adventure type
2. If character exists: goes to Gameplay (line 182-184)
3. If character doesn't exist: the flow reaches line 242-244 which sends to CharacterCreation
4. But line 243-244 is actually dead code because line 182-184 already handles the Randomized case

**Fix:** Remove the duplicate logic at lines 242-244 since the case is already handled above:
```tsx
// REMOVE this block (lines 242-244):
} else if (adventureTypeFromContext === "Randomized") {
    dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
    toast({ title: "Adventure Setup Complete!", description: "Now, create your adventurer." });
}
```

---

### POLISH-7: Typo in Variable Name "startingSituation"
**Severity:** Low  
**Description:** The variable `startingSituation` in AdventureSetup.tsx contains a typo - it should be `startingSituation` (with double 'u' in "Situation"). This appears in state declarations, useEffect, and the input field.
**Location:** `src/components/screens/AdventureSetup.tsx`, lines 48, 85, 105, 280, 340
**Root Cause:** Typo in variable naming - "Situation" is misspelled as "Situation" (missing a 'u')
**Reproduction Steps:**
1. Review the code
2. Notice `startingSituation` is used instead of `startingSituation`

**Fix:** Rename all occurrences of `startingSituation` to `startingSituation` (correct spelling)

---

### POLISH-8: Missing Loading Spinner on ActionInput During Guest Action Wait
**Severity:** Medium  
**Description:** When a guest player submits an action in multiplayer, the `pendingGuestAction` state shows a loading indicator in `NarrationDisplay`, but the `ActionInput` submit button only gets disabled without showing a spinner. This provides poor feedback to the guest player.
**Location:** `src/components/gameplay/ActionInput.tsx` (referenced in subagent report)
**Root Cause:** The button disabled state doesn't include a loading spinner
**Reproduction Steps:**
1. Join a multiplayer game as guest
2. Submit an action
3. The button disables but shows no visual loading indicator
4. User may think the UI is frozen

**Fix:** Add a loading spinner to the ActionInput submit button when waiting for host:
```tsx
<Button 
  onClick={handleSubmit} 
  disabled={isWaitingForHost || !inputValue.trim()}
>
  {isWaitingForHost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Submit
</Button>
```

---

### POLISH-9: Inconsistent Icon Imports Across Components
**Severity:** Low  
**Description:** Some components import icons with aliases (e.g., `Users as UsersIcon` in AdventureSetup.tsx line 12) while others import directly. This creates inconsistency in the codebase.
**Location:** `src/components/screens/AdventureSetup.tsx`, line 12
**Root Cause:** Inconsistent coding style across components
**Reproduction Steps:**
1. Compare icon imports across components
2. Notice some use aliases, others don't

**Fix:** Standardize icon imports - either always use aliases or never use them. Recommended: import directly without aliases for consistency:
```tsx
// Instead of:
import { Users as UsersIcon, ... } from "lucide-react";
// Use:
import { Users, ... } from "lucide-react";
// And use <Users /> directly
```

---

### POLISH-10: Missing ARIA Labels on Form Elements in AdventureSetup
**Severity:** Medium  
**Description:** Several form elements in AdventureSetup.tsx have `htmlFor` attributes on Labels but the associated inputs may not have proper `aria-describedby` or error states for screen readers. Also, the validation errors are shown via toast rather than inline with ARIA attributes.
**Location:** `src/components/screens/AdventureSetup.tsx`, various form fields
**Root Cause:** Accessibility was not fully implemented for form validation feedback
**Reproduction Steps:**
1. Use a screen reader
2. Try to submit the form with missing required fields
3. The error toast is not announced properly to screen readers
4. Focus is not moved to the invalid fields

**Fix:** Add proper ARIA attributes and inline error messages:
```tsx
<Input 
  id="worldType" 
  value={worldType} 
  onChange={(e) => setWorldType(e.target.value)}
  aria-invalid={customError && !worldType.trim()}
  aria-describedby={customError && !worldType.trim() ? "worldType-error" : undefined}
/>
{customError && !worldType.trim() && (
  <p id="worldType-error" className="text-sm text-destructive">
    World Type is required.
  </p>
)}
```
