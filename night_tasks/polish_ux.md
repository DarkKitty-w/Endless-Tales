## Detailed Findings

POLISH‑1: Inline styles on Ko-fi donation image
Severity: Low
Description: The Ko-fi donation image in MainMenu uses inline styles instead of Tailwind classes, violating project styling conventions and making future style updates harder.
Location: src/components/screens/MainMenu.tsx, lines 112-118
Current Behaviour: Image uses inline style={{ border: '0px', height: '36px', width: 'auto' }} which bypasses Tailwind class system.
Expected: Use Tailwind utility classes (e.g., h-9 w-auto border-0) for consistent styling across the project.
Fix: Replace inline styles with Tailwind CSS classes.

POLISH‑2: CharacterCreation submit button missing loading state for non-AI submissions
Severity: Medium
Description: The submit button in CharacterCreation only shows loading indicators for AI generation steps, not for standard form submissions, leaving users without feedback.
Location: src/components/screens/CharacterCreation.tsx, lines 577-586
Current Behaviour: Button displays loading state only when isGenerating or isRandomizing is true; no feedback for standard form submission.
Expected: Show loading state for all form submission actions to indicate processing to the user.
Fix: Add a general isSubmitting state and display loading spinner/text when the form is being submitted.

POLISH‑3: Invalid <br/> inside <p> tag in Immersed mode
Severity: Low
Description: Immersed mode context text uses a <br/> element inside a <p> tag, which is semantically incorrect and may cause rendering inconsistencies.
Location: src/components/screens/CharacterCreation.tsx, line 466
Current Behaviour: <br/> is nested inside a <p> tag for line breaks, which violates HTML semantic rules.
Expected: Use flex column layout or separate <p> tags to achieve line breaks.
Fix: Replace the <br/> inside <p> with a flex flex-col container or split into multiple <p> elements.

POLISH‑4: ChatPanel onSendMessage is empty function (broken chat)
Severity: High
Description: The ChatPanel's onSendMessage prop is set to an empty arrow function, making chat functionality completely non-functional for users.
Location: src/components/gameplay/GameplayLayout.tsx, line ~256
Current Behaviour: onSendMessage={() => {}} means no messages are sent when users submit chat input.
Expected: Chat messages should be sent to the appropriate handler (multiplayer chat or local log).
Fix: Connect onSendMessage to the actual chat submission logic in the gameplay context or multiplayer hook.

POLISH‑5: PartySidebar missing player stats in turn order
Severity: Medium
Description: The turn order section in PartySidebar only shows player names and turn badges, omitting health/stamina/mana stats needed for gameplay decisions.
Location: src/components/gameplay/PartySidebar.tsx, lines ~90-180
Current Behaviour: Turn order list displays names and badges only, no stats are shown for each player.
Expected: Show key player stats (health, stamina, mana) alongside each player in the turn order list.
Fix: Add stat display elements for each player in the turn order list.

POLISH‑6: PartySidebar missing self stats display
Severity: Medium
Description: The "You" entry in the Connected Players section of PartySidebar shows only a status dot and Host badge, with no health/stamina/mana stats.
Location: src/components/gameplay/PartySidebar.tsx, lines ~190-196
Current Behaviour: Self entry has no stat display, unlike other peer entries which show stats.
Expected: Display self stats (health, stamina, mana) in the Connected Players section for consistency.
Fix: Add stat display for the local player entry in the Connected Players list.

POLISH‑7: CoopLobby screen unreachable from UI
Severity: High
Description: The CoopLobby screen is fully coded but no navigation path sets the game status to CoopLobby, making it inaccessible to users.
Location: src/components/screens/MainMenu.tsx (lines 99-101), src/app/page.tsx (lines 45-46)
Current Behaviour: Selecting "Co-op Adventure" sets status to AdventureSetup instead of CoopLobby.
Expected: Co-op option should navigate to CoopLobby screen for hosting/joining sessions.
Fix: Update MainMenu's handleNewGameFlow for "Coop" to set status to CoopLobby, or add a dedicated Co-op button that sets the correct status.

POLISH‑8: AdventureSummary screen unreachable
Severity: Medium
Description: AdventureSummary screen renders only when status is AdventureSummary, but no action dispatches END_ADVENTURE to set this status, making it unreachable.
Location: src/context/reducers/adventureReducer.ts (lines 121-177), src/app/page.tsx (lines 59-60)
Current Behaviour: No code path triggers END_ADVENTURE action to display AdventureSummary.
Expected: AdventureSummary should be accessible when an adventure concludes (e.g., character death, manual end).
Fix: Dispatch END_ADVENTURE action in adventure completion logic (e.g., in character death handler or end adventure button).

POLISH‑9: Badge.tsx focus styles on non-interactive element
Severity: Low
Description: Badge component applies focus classes to a non-interactive <div>, which is misleading as badges are not focusable by default.
Location: src/components/ui/badge.tsx, line 8
Current Behaviour: Focus styles (focus:outline-none focus:ring-2) are applied to a <div> badge element.
Expected: Remove focus styles from non-interactive badges, or use a button/a element with proper role if interactive.
Fix: Remove focus classes from Badge's root div, or add role="status" and conditional interactivity.

POLISH‑10: CardTitle uses <div> instead of heading element
Severity: Medium
Description: CardTitle component uses a <div> instead of a semantic heading element (h2-h6), breaking document outline and accessibility.
Location: src/components/ui/card.tsx, lines 36-44
Current Behaviour: CardTitle renders a <div> for title text, which is not semantically correct for headings.
Expected: Use a proper heading element (e.g., h3) or accept an as prop to specify heading level.
Fix: Update CardTitle to render a heading element by default, or add an as prop for semantic HTML.

POLISH‑11: CardDescription uses <div> instead of <p>
Severity: Low
Description: CardDescription component uses a <div> instead of a <p> tag, which is semantically incorrect for descriptive text.
Location: src/components/ui/card.tsx, lines 52-57
Current Behaviour: CardDescription renders a <div> for description text.
Expected: Use a <p> tag for descriptive text to follow semantic HTML standards.
Fix: Replace the <div> in CardDescription with a <p> element.

POLISH‑12: GameContext missing loading state during initialization
Severity: Medium
Description: GameProvider renders children immediately without a loading state while initializing from localStorage, causing potential flash of wrong theme or unstyled content.
Location: src/context/GameContext.tsx, lines 49-252
Current Behaviour: No loading indicator during state initialization from localStorage.
Expected: Show a loading spinner or placeholder while initializing state and applying theme.
Fix: Add an isInitializing state, set to true during init, and render a loading state until complete.

POLISH‑13: GameContext silent error handling without user toasts
Severity: High
Description: Errors during saved adventure loading or API key loading are only logged to console, with no user-facing toast notifications.
Location: src/context/GameContext.tsx, lines 98-101, 136-138
Current Behaviour: Errors are logged via console.error only, no toast shown to user.
Expected: Display toast notifications for errors that affect user data (saved adventures, API keys).
Fix: Use the use-toast hook to show error toasts when initialization fails.