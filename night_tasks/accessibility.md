## Accessibility

### Overall Accessibility Rating: **C-**

**Rationale:**
- SVG elements with onClick handlers not keyboard accessible (WCAG 2.1.1)
- Missing aria-live regions for dynamic content updates (WCAG 4.1.3)
- Some icon-only buttons missing aria-label (WCAG 4.1.2)
- No skip navigation link (WCAG 2.4.1)
- Color contrast issues in some themes
- No reduced-motion option for animations (WCAG 2.3.3)

---

### A11Y-1: SVG Circle Elements Not Keyboard Accessible
**Severity:** High  
**Description:** SVG `<circle>` elements in WorldMapDisplay.tsx have `onClick` handlers for selecting locations but are not reachable via Tab key. SVG elements without proper roles and tabindex cannot receive keyboard focus.
**Location:** `src/components/game/WorldMapDisplay.tsx`, lines 102-111, 195-200
**WCAG Criterion:** 2.1.1 Keyboard (Level A), 4.1.2 Name, Role, Value (Level A)
**Root Cause:** SVG elements missing `role="button"`, `tabindex="0"`, and keyboard event handlers (onKeyDown)
**Reproduction Steps:**
1. Navigate to Gameplay screen with World Map
2. Try to tab to location circles on the map
3. Circles are not focusable
4. Cannot activate with Enter or Space key

**Fix:** Add proper ARIA attributes and keyboard handlers:
```tsx
<circle
  cx={`${loc.x}%`}
  cy={`${loc.y}%`}
  r={nodeSize}
  fill={nodeColor}
  stroke="hsl(var(--background))"
  strokeWidth="2"
  className="cursor-pointer transition-all hover:scale-125"
  role="button"
  tabIndex={0}
  aria-label={`Select location: ${loc.name}`}
  onClick={() => setSelectedLocationId(loc.id)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedLocationId(loc.id);
    }
  }}
/>
```

---

### A11Y-2: Missing aria-live Regions for Dynamic Updates
**Severity:** High  
**Description:** Dynamic content updates (new narration entries, chat messages) are not announced to screen readers because the containers lack `aria-live` regions.
**Location:**
- `src/components/gameplay/NarrationDisplay.tsx` - story log updates
- `src/components/gameplay/ChatPanel.tsx` - new chat messages
**WCAG Criterion:** 4.1.3 Status Messages (Level AA)
**Root Cause:** No `aria-live="polite"` or `aria-live="assertive"` on containers that update dynamically
**Reproduction Steps:**
1. Use a screen reader
2. New narration entry appears
3. Screen reader does not announce the new content
4. User must manually navigate to find new content

**Fix:** Add aria-live regions:
```tsx
// In NarrationDisplay.tsx:
<ScrollArea
  ref={scrollAreaRef}
  className="..."
  aria-live="polite"
  aria-atomic="false"
>
  {/* story log entries */}
</ScrollArea>

// In ChatPanel.tsx:
<div
  className="flex-1 overflow-y-auto p-2 space-y-2"
  aria-live="polite"
  aria-atomic="false"
>
  {/* chat messages */}
</div>
```

---

### A11Y-3: Icon-Only Buttons Missing aria-label
**Severity:** High  
**Description:** Several icon-only buttons (buttons with only an icon, no text) are missing `aria-label` attribute, making them unintelligible to screen readers.
**Location:**
- `src/components/gameplay/ChatPanel.tsx` line 60 - Close button with "✕" text
- `src/components/screens/Gameplay.tsx` - PartySidebar toggle button (lines 1193-1201)
- Various icon buttons throughout the app
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)
**Root Cause:** Icon-only buttons don't have descriptive labels for assistive technology
**Reproduction Steps:**
1. Use a screen reader
2. Navigate to icon-only buttons
3. Screen reader announces "button" without context
4. User doesn't know what the button does

**Fix:** Add aria-label to all icon-only buttons:
```tsx
// ChatPanel close button:
<Button
  variant="ghost"
  size="sm"
  onClick={onClose}
  aria-label="Close chat"
>
  <X className="h-4 w-4" />
</Button>

// PartySidebar toggle button:
<Button
  variant="ghost"
  size="icon"
  onClick={() => setIsPartySidebarOpen(!isPartySidebarOpen)}
  aria-label={isPartySidebarOpen ? "Close party sidebar" : "Open party sidebar"}
  aria-expanded={isPartySidebarOpen}
>
  <Users className="h-4 w-4" />
</Button>
```

---

### A11Y-4: No Skip Navigation Link
**Severity:** Medium  
**Description:** The MainMenu.tsx and other screens lack a skip-to-content or skip-navigation link that allows keyboard and screen reader users to bypass repetitive navigation and jump directly to main content.
**Location:** `src/components/screens/MainMenu.tsx`, lines 55-117 (entire component)
**WCAG Criterion:** 2.4.1 Bypass Blocks (Level A)
**Root Cause:** No skip link at the top of the page
**Reproduction Steps:**
1. Navigate to Main Menu
2. Use Tab key to navigate
3. Must tab through all elements to reach main content
4. No way to skip to main card

**Fix:** Add a skip link at the top of the page:
```tsx
// In MainMenu.tsx, at the very top:
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-2 focus:rounded"
>
  Skip to main content
</a>

// Add id to main content:
<Card id="main-content" className="...">
  {/* card content */}
</Card>
```

---

### A11Y-5: Missing aria-expanded on PartySidebar Toggle
**Severity:** Medium  
**Description:** The button that toggles the PartySidebar open/closed has no `aria-expanded` attribute to indicate its state to assistive technology. It only contains an icon with no text or aria-label.
**Location:** `src/components/screens/Gameplay.tsx`, lines 1193-1201
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)
**Root Cause:** Toggle button state not communicated to assistive technology
**Reproduction Steps:**
1. Use a screen reader
2. Navigate to PartySidebar toggle button
3. Screen reader doesn't announce whether sidebar is open or closed

**Fix:** Add aria-expanded and aria-label:
```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={() => setIsPartySidebarOpen(!isPartySidebarOpen)}
  aria-label={isPartySidebarOpen ? "Close party sidebar" : "Open party sidebar"}
  aria-expanded={isPartySidebarOpen}
>
  <Users className="h-4 w-4" />
</Button>
```

---

### A11Y-6: Form Inputs Missing Proper Labels in AdventureSetup
**Severity:** Medium  
**Description:** While some form inputs in AdventureSetup.tsx have associated `<label>` elements, error messages are shown via toast rather than inline with `aria-describedby`. Also, required fields are not marked with `aria-required` or text indication.
**Location:** `src/components/screens/AdventureSetup.tsx`, various form fields
**WCAG Criterion:** 3.3.3 Error Suggestion (Level AA), 3.3.1 Error Identification (Level A)
**Root Cause:** Form validation errors not properly linked to inputs for screen readers
**Reproduction Steps:**
1. Use a screen reader
2. Submit form with missing required fields
3. Error toast appears but is not announced properly
4. Focus is not moved to the invalid field

**Fix:** Add proper ARIA attributes and inline error messages:
```tsx
<Label htmlFor="worldType">World Type *</Label>
<Input
  id="worldType"
  value={worldType}
  onChange={(e) => setWorldType(e.target.value)}
  aria-required="true"
  aria-invalid={customError && !worldType.trim()}
  aria-describedby={customError && !worldType.trim() ? "worldType-error" : undefined}
/>
{customError && !worldType.trim() && (
  <p id="worldType-error" className="text-sm text-destructive">
    World Type is required.
  </p>
)}
```

---

### A11Y-7: Color-Only Information in Stat Allocation
**Severity:** Medium  
**Description:** StatAllocationInput.tsx uses `text-destructive` (red) for Strength, `text-green-600` for Stamina, `text-purple-500` for Wisdom without additional text differentiation. Users who cannot perceive color may not distinguish between stats.
**Location:** `src/components/character/StatAllocationInput.tsx`
**WCAG Criterion:** 1.4.1 Use of Color (Level A)
**Root Cause:** Color is primary differentiator without text labels
**Reproduction Steps:**
1. Use a screen reader or color-blind simulation
2. View stat allocation inputs
3. Cannot distinguish which stat is which based on color alone

**Fix:** Add text labels or icons to differentiate stats:
```tsx
<div className="flex items-center gap-2">
  <span className="text-destructive font-semibold">STR</span>
  <Input ... />
</div>
<div className="flex items-center gap-2">
  <span className="text-green-600 font-semibold">STA</span>
  <Input ... />
</div>
```

---

### A11Y-8: Decorative Icons Not Hidden from Screen Readers
**Severity:** Low  
**Description:** Some decorative icons (lucide-react icons used purely for visual enhancement) may not be hidden with `aria-hidden="true"`, causing screen readers to announce them unnecessarily.
**Location:** Multiple components using lucide-react icons
**WCAG Criterion:** 4.1.2 Name, Role, Value (Level A)
**Root Cause:** Decorative icons not marked as aria-hidden
**Reproduction Steps:**
1. Use a screen reader
2. Navigate to elements with decorative icons
3. Screen reader announces "icon" or similar for decorative elements

**Fix:** Add aria-hidden="true" to decorative icons:
```tsx
// For decorative icons:
<Dice5 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />

// For informative icons (with aria-label on parent):
<Button aria-label="Roll dice">
  <Dice5 className="h-4 w-4" />
</Button>
```

---

### A11Y-9: No Reduced Motion Option in Settings
**Severity:** Medium  
**Description:** The app uses animations (accordion expansions, loading spinners, etc.) but doesn't respect `prefers-reduced-motion` media query or provide a user toggle in Settings. Users with motion sensitivity may experience discomfort.
**Location:** `tailwind.config.ts` (animations), `src/lib/themes.ts`, `src/components/screens/SettingsPanel.tsx`
**WCAG Criterion:** 2.3.3 Animation from Interactions (Level AAA), 2.3.1 Three Flashes (Level A)
**Root Cause:** No reduced-motion support in the app
**Reproduction Steps:**
1. Enable "Reduce motion" in OS settings
2. Open the app
3. Animations still play at full speed

**Fix:** Add reduced-motion support:
```typescript
// In tailwind.config.ts, add:
const config: Config = {
  // ...
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        '@media (prefers-reduced-motion: reduce)': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      });
    }),
  ],
};

// Or add a setting in SettingsPanel:
<div className="flex items-center justify-between">
  <Label>Reduce motion</Label>
  <Switch
    checked={reducedMotion}
    onCheckedChange={setReducedMotion}
  />
</div>
```

---

### A11Y-10: Improper Heading Structure
**Severity:** Medium  
**Description:** The app may not have proper heading structure (h1, h2, h3) for screen reader navigation. Some screens use CardTitle or other elements instead of semantic heading tags.
**Location:** `src/components/screens/MainMenu.tsx`, `src/components/screens/Gameplay.tsx`, and other screens
**WCAG Criterion:** 1.3.1 Info and Relationships (Level A)
**Root Cause:** Heading hierarchy not properly implemented
**Reproduction Steps:**
1. Use a screen reader
2. Navigate by headings
3. Headings may be missing or out of order

**Fix:** Use proper heading tags:
```tsx
// In MainMenu.tsx:
<h1 className="text-4xl font-bold text-foreground">Endless Tales</h1>

// In Gameplay.tsx:
<h2 className="text-2xl font-semibold">Gameplay</h2>

// Or use CardTitle with aria-level:
<CardTitle asChild>
  <h2>Card Title</h2>
</CardTitle>
```

---

### A11Y-11: ChatPanel Messages Not Announced
**Severity:** High  
**Description:** New chat messages are added to ChatPanel but the container lacks an `aria-live` region. Screen readers will not announce new messages as they arrive.
**Location:** `src/components/gameplay/ChatPanel.tsx`
**WCAG Criterion:** 4.1.3 Status Messages (Level AA)
**Root Cause:** No aria-live on message container
**Reproduction Steps:**
1. Use a screen reader
2. Receive a new chat message
3. Screen reader does not announce the new message

**Fix:** Add aria-live region to message container:
```tsx
<div
  className="flex-1 overflow-y-auto p-2 space-y-2"
  aria-live="polite"
  aria-atomic="false"
  role="log"
>
  {messages.map((msg) => (
    <div key={msg.id}>/* message content */</div>
  ))}
</div>
```

---

### A11Y-12: Error Toasts Missing role="alert"
**Severity:** Medium  
**Description:** Error toasts (from `use-toast.ts`) may not have `role="alert"` or `aria-live="assertive"`, causing them to not be announced immediately to screen readers.
**Location:** `src/hooks/use-toast.ts`, toast rendering in `src/components/ui/toaster.tsx`
**WCAG Criterion:** 4.1.3 Status Messages (Level AA)
**Root Cause:** Error toasts not properly marked for immediate announcement
**Reproduction Steps:**
1. Use a screen reader
2. Trigger an error (e.g., form validation)
3. Toast appears but may not be announced immediately

**Fix:** Add role="alert" to error toasts:
```tsx
// In toaster.tsx, for error toasts:
{toast.variant === 'destructive' && (
  <Toast role="alert" className={cn(toastClass)}>
    {/* toast content */}
  </Toast>
)}
```

---

### A11Y-13: Character Creation Form Accessibility Issues
**Severity:** Medium  
**Description:** CharacterCreation.tsx has form inputs that may not have proper `<label>` elements or `aria-describedby` for error messages. The form also uses radio buttons and other inputs that need proper labeling.
**Location:** `src/components/screens/CharacterCreation.tsx`
**WCAG Criterion:** 3.3.2 Labels or Instructions (Level A), 4.1.2 Name, Role, Value (Level A)
**Root Cause:** Form accessibility not fully implemented
**Reproduction Steps:**
1. Use a screen reader
2. Navigate through Character Creation form
3. Some inputs may not have proper labels

**Fix:** Ensure all inputs have proper labels:
```tsx
<Label htmlFor="characterName">Character Name *</Label>
<Input
  id="characterName"
  value={name}
  onChange={(e) => setName(e.target.value)}
  aria-required="true"
  aria-invalid={nameError ? "true" : "false"}
  aria-describedby={nameError ? "name-error" : undefined}
/>
```

---

### Top 10 Worst Offenders for Accessibility

1. **`src/components/game/WorldMapDisplay.tsx`** (SVG circles not keyboard accessible)
2. **`src/components/gameplay/NarrationDisplay.tsx`** (no aria-live region)
3. **`src/components/gameplay/ChatPanel.tsx`** (no aria-live, icon buttons not labeled)
4. **`src/components/screens/Gameplay.tsx`** (PartySidebar toggle missing aria-expanded)
5. **`src/components/screens/MainMenu.tsx`** (no skip navigation link)
6. **`src/components/screens/AdventureSetup.tsx`** (form errors not linked to inputs)
7. **`src/components/character/StatAllocationInput.tsx`** (color-only information)
8. **`src/components/screens/CharacterCreation.tsx`** (form accessibility issues)
9. **`src/components/ui/toaster.tsx`** (error toasts missing role="alert")
10. **`tailwind.config.ts`** (no reduced-motion support)
