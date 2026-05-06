## Detailed Findings

### SAVE-1: SavedAdventure Type Lacks Version Field
**Severity:** High  
**Description:** The SavedAdventure interface does not include a `version` property, but the migrateSavedAdventure function relies on checking `adventure.version` to determine migration steps. Since saves never persist a version number, all loaded saves are treated as version 0, making it impossible to properly version and migrate saves for future schema changes.  
**Location:** `src/types/adventure-types.ts` (lines 67-80, SavedAdventure interface), `src/context/GameContext.tsx` (lines 30-47, migrateSavedAdventure function), `src/context/game-initial-state.ts` (line 17, CURRENT_STATE_VERSION)  
**Risk:** Future schema changes cannot be properly versioned. Migrations cannot distinguish between different save versions, leading to potential data corruption when loading old saves after updates.  
**Fix:** Add a `version: number` field to the SavedAdventure interface. Persist the current state version when saving. Update migrateSavedAdventure to properly handle version-based migrations.

### SAVE-2: migrateSavedAdventure Doesn't Handle Missing Required Fields
**Severity:** High  
**Description:** The migrateSavedAdventure function accepts `any` type and performs no validation that required fields exist. It simply spreads the object and adds missing fields like `worldMap`, but doesn't verify critical fields like `id`, `characterName`, `character`, `adventureSettings`, `storyLog`, `currentGameStateString`, or `inventory`.  
**Location:** `src/context/GameContext.tsx` lines 30-47 (migrateSavedAdventure function)  
**Risk:** If localStorage data is corrupted or manually edited, the app will attempt to load invalid data. This can cause crashes when the code tries to access properties that don't exist.  
**Fix:** Add validation for required fields in migrateSavedAdventure. Check that critical fields exist and have valid types. Return a default/empty state if validation fails, with a clear error message.

### SAVE-3: No Schema Validation for Saved Adventures
**Severity:** High  
**Description:** There is no schema validation (e.g., using Zod or similar) for saved adventure data. The code assumes the data matches the expected structure but never validates it against a schema.  
**Location:** `src/context/GameContext.tsx` (loadAdventure, loadSavedAdventures), `src/types/adventure-types.ts`  
**Risk:** Invalid save data can cause runtime errors, crashes, or undefined behavior when the app tries to use missing or malformed fields.  
**Fix:** Implement schema validation using Zod or a similar library. Validate save data against the SavedAdventure schema before loading. Provide clear error messages for validation failures.

### SAVE-4: Old Saves May Not Load Correctly After Updates
**Severity:** Medium  
**Description:** While there is a migrateSavedAdventure function, it only handles version 0 → 1 migration (adding worldMap). There is no comprehensive migration system for handling multiple schema versions or complex structural changes.  
**Location:** `src/context/GameContext.tsx` (migrateSavedAdventure function), `src/context/game-initial-state.ts` (CURRENT_STATE_VERSION)  
**Risk:** After updates that change the save schema, old saves may fail to load or load with missing/corrupted data. Users may lose progress.  
**Fix:** Implement a proper migration system with versioned migrations. Create a migration map (version → migration function). Run all necessary migrations in sequence when loading old saves.

### SAVE-5: No Schema Validation for Loaded Save Data
**Severity:** High  
**Description:** The migrateSavedAdventure function accepts `any` type and performs no validation that required fields exist. It spreads the object and adds missing fields, but doesn't verify the data structure is valid.  
**Location:** `src/context/GameContext.tsx` lines 30-47 (migrateSavedAdventure function)  
**Risk:** Corrupted or invalid save data is loaded without validation, potentially causing crashes or undefined behavior.  
**Fix:** Add runtime validation using a schema library. Validate the structure of loaded data before using it. Provide fallback/error UI when validation fails.

### SAVE-6: Partial Writes to localStorage (No Atomicity)
**Severity:** High  
**Description:** Saves are written to localStorage using `JSON.stringify()` directly. If the browser crashes or loses power during the write, the save data may be partially written, resulting in corrupted JSON that cannot be parsed on next load. There is no atomic write mechanism.  
**Location:** `src/context/GameContext.tsx` (persistence effect, line 176), `src/context/reducers/adventureReducer.ts` (lines 200-202)  
**Risk:** Partial writes can corrupt save data permanently. Users can lose all saved progress due to a failed write operation.  
**Fix:** Implement atomic writes: (1) Write to a temporary key, (2) Validate the write succeeded, (3) Rename to the final key, (4) Remove temp key. Use a write-and-verify pattern.

### SAVE-7: Corrupted Save Data Is Deleted Without Backup
**Severity:** High  
**Description:** When loading saved adventures from localStorage, if JSON parsing fails or data is corrupted, the error is only logged to console and the corrupted data is removed. The user receives no explanation and the data is permanently lost.  
**Location:** `src/context/GameContext.tsx` lines 86-101  
**Risk:** Users lose saved progress with no way to recover. Corrupted data is silently deleted without offering recovery options.  
**Fix:** Before removing corrupted data, save it to a backup key (e.g., `endlessTalesCorruptedBackup`). Show a recovery UI that allows users to attempt manual repair or restore from backup.

### SAVE-8: No Quota Error Handling for localStorage
**Severity:** High  
**Description:** The code writes to localStorage in the persistence effect without handling quota exceeded errors. If localStorage is full, the write will fail silently or throw an unhandled exception.  
**Location:** `src/context/GameContext.tsx` (lines 162-191, persistence effect)  
**Risk:** When localStorage quota is exceeded, saves fail silently. Users think their progress is saved when it isn't. No notification is shown.  
**Fix:** Wrap localStorage writes in try-catch. Handle `QuotaExceededError` specifically. Show a toast notification to the user: "Storage full - please delete old saves or export your data." Offer options to free up space.

### SAVE-9: Stale Data Between localStorage and sessionStorage
**Severity:** Medium  
**Description:** The app uses both localStorage (saved adventures, theme) and sessionStorage (API keys). There is a risk of stale or conflicting data between these storage mechanisms, especially if the user has multiple tabs open or clears one storage but not the other.  
**Location:** `src/context/GameContext.tsx` (API key storage in sessionStorage), `src/lib/constants.ts` (storage keys)  
**Risk:** Stale API keys in sessionStorage may conflict with updated settings. Multiple tabs may have different versions of saved data.  
**Fix:** Add storage event listeners to detect changes in other tabs. Invalidate stale data when detected. Consider consolidating to a single storage mechanism where appropriate.

### SAVE-10: No Size Limits for Save Data
**Severity:** Medium  
**Description:** There are no checks on the size of save data before writing to localStorage. Large adventures with extensive story logs, world maps, and inventory can exceed localStorage limits (typically 5-10MB).  
**Location:** `src/context/GameContext.tsx` (save functions), `src/context/reducers/adventureReducer.ts`  
**Risk:** Large saves can fail silently when exceeding localStorage quota. Users lose progress without understanding why.  
**Fix:** Check the size of save data before writing. Warn users when save size approaches limits. Implement save compression or pruning of old story log entries for large adventures.

### SAVE-11: APPLY_REMOTE_STATE Merges Full Remote State Without Stripping Transient Fields
**Severity:** Critical  
**Description:** The APPLY_REMOTE_STATE case in multiplayerReducer.ts spreads the entire remoteState (host's game state) into the local GameState, only preserving peerId, sessionId, isHost, and connectionStatus. This merges transient multiplayer-specific fields into the local state. When persisted to a saved adventure, these fields become part of the permanent save, causing invalid state when loading in single-player mode.  
**Location:** `src/context/reducers/multiplayerReducer.ts` lines 82-94  
**Risk:** Saved adventures include invalid multiplayer session data, leading to broken saves that fail to load correctly in single-player mode. Multiplayer state contaminates persistent storage.  
**Fix:** Strip transient multiplayer fields before merging remote state. Create a `sanitizeStateForPersistence()` function that removes multiplayer-specific fields before saving.

### SAVE-12: Conflicts Between Local Saves and Multiplayer State
**Severity:** High  
**Description:** When in a multiplayer session, there is no clear separation between local saves and the multiplayer state received from the host. The APPLY_REMOTE_STATE merges remote state into local state, potentially overwriting local progress without conflict resolution.  
**Location:** `src/context/reducers/multiplayerReducer.ts`, `src/hooks/use-multiplayer.ts`  
**Risk:** Local progress can be lost when joining a multiplayer session. Conflicts between local and remote state are not detected or resolved.  
**Fix:** Implement conflict detection when applying remote state. Prompt the user to choose between local and remote state. Keep multiplayer state separate from the persistent local state until the user explicitly saves.

### SAVE-13: Multiplayer State Not Properly Separated from Single-Player Saves
**Severity:** High  
**Description:** The GameState interface mixes single-player and multiplayer state (peerId, sessionId, isHost, connectionStatus, partyState, etc.). When saving, multiplayer fields are included in the save data, making it invalid for single-player loading.  
**Location:** `src/types/game-types.ts` (GameState interface), `src/context/reducers/multiplayerReducer.ts`  
**Risk:** Saves created during multiplayer sessions cannot be loaded in single-player mode. The save data contains invalid fields that cause errors.  
**Fix:** Separate multiplayer state into its own context or namespace. Exclude multiplayer fields from saved adventure data. Create a clean separation between single-player and multiplayer state.

### SAVE-14: No Backup Mechanism Before Overwriting Saves
**Severity:** High  
**Description:** When SAVE_CURRENT_ADVENTURE is dispatched, the code filters out the old save and pushes the new one to the array. This updated array is then written to localStorage without any backup of the previous data.  
**Location:** `src/context/reducers/adventureReducer.ts` (lines 200-202), `src/context/GameContext.tsx` (line 176)  
**Risk:** If the save operation fails mid-write or produces corrupted data, the previous save is permanently lost. Users can lose hours of progress with no way to recover.  
**Fix:** Before overwriting a save, create a backup (e.g., `endlessTalesBackup_<id>_<timestamp>`). Keep the last N backups. Provide a recovery UI to restore from backups.

### SAVE-15: No Way to Repair Partially Corrupted Save Data
**Severity:** Medium  
**Description:** When save data is partially corrupted (some fields valid, others missing/invalid), there is no repair mechanism. The code either loads it as-is (causing errors) or deletes it entirely.  
**Location:** `src/context/GameContext.tsx` (loadAdventure, migrateSavedAdventure)  
**Risk:** Partially corrupted saves with valuable progress are lost entirely. Users cannot recover any data from corrupted saves.  
**Fix:** Implement a repair wizard that: (1) Identifies valid fields, (2) Prompts user to fill in missing fields, (3) Reconstructs the save with defaults for irrecoverable data. Show a preview of what can be recovered.

### SAVE-16: Saves Not Validated Before Writing
**Severity:** High  
**Description:** The code does not validate the game state before serializing and writing it to localStorage. Invalid or incomplete state can be saved, resulting in saves that cannot be loaded.  
**Location:** `src/context/GameContext.tsx` (persistence effect), `src/context/reducers/adventureReducer.ts` (SAVE_CURRENT_ADVENTURE)  
**Risk:** Invalid state is persisted, creating corrupted saves. Users discover the problem only when trying to load the save later.  
**Fix:** Validate the game state against a schema before saving. Check that required fields are present and valid. Show a warning if validation fails, offering to fix issues before saving.

### SAVE-17: No Automatic Backup Creation
**Severity:** Medium  
**Description:** The save system does not automatically create backups. Only the most recent save is kept for each adventure. If that save becomes corrupted, there is no fallback.  
**Location:** `src/context/reducers/adventureReducer.ts` (SAVE_CURRENT_ADVENTURE case)  
**Risk:** Single point of failure for each saved adventure. Corruption or bugs can permanently lose all progress for that adventure.  
**Fix:** Automatically create timestamped backups before each save operation. Keep the last 3-5 backups per adventure. Add a "Restore Backup" feature in the load screen.