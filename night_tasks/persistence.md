# Persistence & Save Integrity Audit Report

## Overview
This audit analyzes the data persistence, save/load reliability, and integrity mechanisms in the Endless Tales project. The game uses localStorage as its primary persistence mechanism with a comprehensive save system including schema validation, migration support, atomic writes, and corruption handling.

## Summary
- **Persistence Mechanism**: localStorage (client-side only)
- **Schema Validation**: Zod-based validation via `SavedAdventureSchema`
- **Versioning**: CURRENT_STATE_VERSION = 1, with migration system
- **Atomicity**: Write-to-temp → verify → backup → rename pattern
- **Backup System**: Up to 5 backups per save, corrupted data backups
- **Multiplayer**: State sanitized before persistence (multiplayer fields removed)

---

## Detailed Findings

### SAVE-1: Limited Migration Path Coverage
**Severity:** Medium  
**Description:** The migration system only defines one migration (v0 → v1) that adds the `worldMap` field. As the game evolves and schema changes, new migrations must be added. There's no automated testing of migration paths.  
**Location:** `src/context/schemas/migration-system.ts`  
**Risk:** Future schema changes may break loading of older saves if migrations are not properly implemented. The `migrations` record may have gaps if versions are skipped.  
**Fix:** 
- Implement automated migration path testing
- Add a migration registration system that validates continuity
- Document migration patterns for future developers
- Consider adding a `migrationsApplied` array to saves to track which migrations have been run

### SAVE-2: No Server-Side Persistence or Export/Import
**Severity:** High  
**Description:** All saved adventures are stored exclusively in localStorage. If users clear their browser data, switch devices, or experience browser storage corruption, all progress is permanently lost.  
**Location:** `src/context/GameContext.tsx` (persistence effect), `src/lib/storage-utils.ts`  
**Risk:** Complete data loss on browser data clearance, device switching, or localStorage corruption. No way for users to backup their saves externally.  
**Fix:** 
- Implement save export/import functionality (JSON file download/upload)
- Consider optional cloud sync using Firebase/Supabase for cross-device play
- Add "Export Save" and "Import Save" buttons in the UI

### SAVE-3: localStorage Quota Limits (5MB)
**Severity:** High  
**Description:** The game stores all saves in localStorage, which typically has a 5MB limit. Each save contains the full story log (capped at 50 entries on save), character data, inventory, and game state string. The `checkSaveSize()` function warns at 4MB and blocks at 5MB.  
**Location:** `src/lib/storage-utils.ts` (MAX_SAVE_SIZE = 5 * 1024 * 1024), `src/context/GameContext.tsx`  
**Risk:** Users with multiple long adventures may hit the quota limit, causing save failures. The error handling offers to delete ALL saves, which is a drastic measure.  
**Fix:** 
- Implement save compression using `JSON.stringify` + `pako` or similar
- Consider using IndexedDB for larger storage capacity
- Offer per-save deletion instead of "delete all" when quota is exceeded
- Add a storage usage indicator in settings

### SAVE-4: No Save Integrity Checksum
**Severity:** Medium  
**Description:** While the game uses Zod schema validation to verify save structure, there is no checksum or hash mechanism to detect if a save has been tampered with or corrupted at the byte level.  
**Location:** `src/context/schemas/save-schema.ts`, `src/lib/storage-utils.ts`  
**Risk:** Malicious or accidental modification of save data may not be detected. Corruption that maintains valid JSON structure but alters values (e.g., changing health from 10 to 1000) won't be caught.  
**Fix:** 
- Add a SHA-256 or simpler hash (CRC32) of the save data stored alongside the save
- Validate checksum on load and warn user if mismatch detected
- Consider signing saves with a client-side key if anti-cheat is important

### SAVE-5: Multiplayer State Leakage Risk in Saves
**Severity:** Medium  
**Description:** The `sanitizeStateForPersistence()` function removes multiplayer-specific fields (`sessionId`, `players`, `isHost`, `peerId`, etc.) before saving. However, if new multiplayer fields are added to the state and not added to the `fieldsToRemove` array, they could leak into saved adventures.  
**Location:** `src/lib/storage-utils.ts` (sanitizeStateForPersistence function)  
**Risk:** Multiplayer state could contaminate single-player saves, potentially causing bugs when loading. Sensitive session information might be exposed in saves.  
**Fix:** 
- Use an allowlist approach instead of blocklist for sanitization
- Add runtime warnings if unexpected fields are detected in saves
- Consider separating multiplayer state into a sub-object that's never persisted

### SAVE-6: Atomic Write Pattern Dependency on Browser Implementation
**Severity:** Low  
**Description:** The `atomicLocalStorageWrite()` function uses a temp → verify → backup → rename pattern. However, it assumes localStorage operations are synchronous and that the browser won't crash between operations. The pattern writes to temp, reads back, writes backup, then writes final.  
**Location:** `src/lib/storage-utils.ts` (atomicLocalStorageWrite function)  
**Risk:** If the browser crashes or power is lost between steps, the save could be left in an inconsistent state. The backup system provides some protection, but recovery is manual.  
**Fix:** 
- Consider using a more robust journaling approach
- Add a "last write timestamp" to detect incomplete writes on next load
- Implement automatic recovery from backups on initialization

### SAVE-7: sessionStorage for Multiplayer State Backups
**Severity:** Medium  
**Description:** When applying remote state in multiplayer, the game creates backups in `sessionStorage` with keys like `endlessTales_temp_backup_${id}_${timestamp}`. sessionStorage is tab-specific and cleared when the tab is closed.  
**Location:** `src/context/reducers/multiplayerReducer.ts` (APPLY_REMOTE_STATE case)  
**Risk:** These backups are fragile - they're lost when the tab closes or crashes. They also accumulate in sessionStorage and are never cleaned up during the session.  
**Fix:** 
- Use localStorage with a temp prefix for multiplayer backups instead
- Add cleanup logic to remove old temp backups
- Consider if these backups are truly necessary or if the regular save backup system suffices

### SAVE-8: No Save Compression for Large Story Logs
**Severity:** Medium  
**Description:** Story logs can contain up to 50 entries per save (capped from 200 during gameplay). Each entry contains `narration` (potentially long text), `updatedGameState` (stringified game state), and other fields. Large saves are checked but not compressed.  
**Location:** `src/context/reducers/adventureReducer.ts` (SAVE_CURRENT_ADVENTURE), `src/lib/storage-utils.ts` (checkSaveSize)  
**Risk:** Wasted storage space, faster quota exhaustion. Large story logs could be compressed significantly (text compresses well).  
**Fix:** 
- Implement compression for story log entries using a library like `pako`
- Decompress on load with fallback to uncompressed for backward compatibility
- Add a migration to compress existing saves


### SAVE-9: Debounced Save May Race with Navigation
**Severity:** Medium  
**Description:** The persistence effect in `GameContext.tsx` uses a 300ms debounce before writing to localStorage. If the user navigates away or closes the tab within this 300ms window, the save may not complete.  
**Location:** `src/context/GameContext.tsx` (persistence useEffect, line ~421-553)  
**Risk:** Recent game state changes may be lost if the user navigates quickly or closes the tab. The debounce is meant to reduce I/O but creates a race condition.  
**Fix:** 
- Use `navigator.sendBeacon` or `beforeunload` event to force-save on tab close
- Reduce debounce time or make it configurable
- Show a "Saving..." indicator so users know save is pending
- Consider using `flushSync` from React for critical saves

### SAVE-10: Zod Schema Uses Passthrough Allowing Stale Data
**Severity:** Low  
**Description:** The `SavedAdventureSchema` uses `.passthrough()` on nested objects like `character`, `adventureSettings`, `storyLog` entries, and `worldMap`. This allows extra fields to pass validation without error.  
**Location:** `src/context/schemas/save-schema.ts`  
**Risk:** Stale or deprecated fields from older versions may persist in saves, potentially causing issues if the codebase changes how it interprets those fields.  
**Fix:** 
- Consider using `.strict()` instead of `.passthrough()` for tighter validation
- Add a cleanup step in migrations to remove unknown fields
- Log warnings when unknown fields are detected

### SAVE-11: No Save Naming or Metadata
**Severity:** Low  
**Description:** Saves are identified by a generated ID (UUID) and the character name. There's no user-editable save name, description, or notes field.  
**Location:** `src/types/adventure-types.ts` (SavedAdventure interface), `src/components/screens/SavedAdventuresList.tsx`  
**Risk:** Users with multiple saves for the same character can't easily distinguish between them. No way to add notes like "Before boss fight" or "After getting legendary sword".  
**Fix:** 
- Add optional `saveName` and `notes` fields to `SavedAdventure`
- Allow users to name/describe their saves in the UI
- Show save metadata in the SavedAdventuresList component

### SAVE-12: Backup Cleanup Doesn't Remove Orphaned Backups
**Severity:** Low  
**Description:** The `createSaveBackup()` function keeps up to `MAX_BACKUPS_PER_SAVE` (5) backups per save ID. However, when a save is deleted via `DELETE_ADVENTURE`, the backups for that save are not cleaned up.  
**Location:** `src/lib/storage-utils.ts` (createSaveBackup, getSaveBackups), `src/context/reducers/adventureReducer.ts` (DELETE_ADVENTURE)  
**Risk:** Orphaned backups accumulate in localStorage, wasting space. Over time, this could contribute to quota issues.  
**Fix:** 
- Modify `DELETE_ADVENTURE` handler to also delete backups for that save ID
- Add a periodic cleanup function for orphaned backups
- Consider including backup cleanup in the quota warning flow

### SAVE-13: Repair Function Uses Hardcoded Defaults
**Severity:** Medium  
**Description:** The `repairSaveData()` function attempts to repair corrupted saves by using hardcoded defaults from `game-initial-state.ts`. However, these defaults may not match the user's actual game state (e.g., default character name is "Unknown Hero", class is "Adventurer").  
**Location:** `src/lib/storage-utils.ts` (repairSaveData function), `src/context/GameContext.tsx` (migrateSavedAdventure)  
**Risk:** Repaired saves may have plausible but incorrect data. Users might lose progress or have inconsistent state after repair.  
**Fix:** 
- Improve repair logic to extract as much valid data as possible
- Show users exactly what was repaired vs. what was defaulted
- Consider offering multiple repair strategies (aggressive vs. conservative)
- Add a "repair preview" so users can see what will be changed

### SAVE-14: No Save Version Display to User
**Severity:** Low  
**Description:** The save system uses versioning (CURRENT_STATE_VERSION = 1), but users are never shown what version their saves are. When migration occurs, it happens silently.  
**Location:** `src/components/screens/SavedAdventuresList.tsx`, `src/context/schemas/migration-system.ts`  
**Risk:** Users don't know if their saves are up-to-date. If a migration fails silently, they won't know their save is on an old version.  
**Fix:** 
- Display save version in the SavedAdventuresList UI
- Show migration status/errors to users
- Add a "Check for Updates" function that validates all saves


### SAVE-15: storyLog Capping Inconsistency
**Severity:** Low  
**Description:** During gameplay, the story log can grow up to `MAX_LOG_SIZE` (200 entries) in memory. When saving, it's capped at 50 entries. However, when loading an adventure, the full saved storyLog is restored without re-capping.  
**Location:** `src/context/reducers/adventureReducer.ts` (UPDATE_NARRATION caps at 200, SAVE_CURRENT_ADVENTURE caps at 50, LOAD_ADVENTURE restores full log)  
**Risk:** Loading an old save, then continuing gameplay could result in a story log larger than expected. The 50-entry cap on save might cause loss of recent story entries.  
**Fix:** 
- Standardize the capping behavior between save and load
- Consider if 50 entries is too few for users who want to review their story
- Add a "full history" feature that stores complete log separately

### SAVE-16: Multiplayer Reconnection State Sync Relies on Host
**Severity:** Medium  
**Description:** When a multiplayer peer reconnects, it requests a full state sync from the host. If the host is unavailable or the state checksum fails, the guest must manually rejoin. The reconnection logic in `use-multiplayer.ts` has exponential backoff but limited retry logic.  
**Location:** `src/hooks/use-multiplayer.ts` (reconnect function, requestStateResync), `src/context/reducers/multiplayerReducer.ts` (RECONNECT_SYNC)  
**Risk:** If host disconnects during a guest's reconnection attempt, the guest may be stuck. State sync conflicts between host and guest aren't automatically resolved.  
**Fix:** 
- Implement a more robust state reconciliation protocol
- Allow guests to force-reconnect even if host state mismatches
- Consider storing the last known good state for offline reconnection attempts

### SAVE-17: Corrupted Save Backup Key Inconsistency
**Severity:** Low  
**Description:** When save data is corrupted and can't be parsed, the game creates a backup with the key `endlessTalesCorruptedBackup_${timestamp}`. However, the regular backup system uses `SAVE_BACKUP_PREFIX = '_savebackup_'`. These are two different backup systems with different key patterns.  
**Location:** `src/context/GameContext.tsx` (initialization effect, line ~332-345), `src/lib/storage-utils.ts` (createSaveBackup)  
**Risk:** Backup management becomes confusing with two different systems. Users and developers may not know where to find backups.  
**Fix:** 
- Unify backup key patterns
- Create a single backup management system
- Add a "Manage Backups" UI that shows all backup types

### SAVE-18: No Periodic Save Integrity Check
**Severity:** Low  
**Description:** Save integrity is only checked when loading or saving. There's no background periodic check to verify that all saved adventures in localStorage are still valid.  
**Location:** `src/context/GameContext.tsx`, `src/lib/storage-utils.ts`  
**Risk:** Corruption could go undetected until the user tries to load a save. By then, it may be too late if backups have also been rotated out.  
**Fix:** 
- Add a periodic integrity check (on app start, once per session)
- Validate all saves and alert user to any issues
- Proactively create backups of saves that are valid but haven't been backed up recently

### SAVE-19: JSON.parse Without Size Limits
**Severity:** Low  
**Description:** The `safeLocalStorageRead()` function uses `JSON.parse()` on data read from localStorage. Extremely large save data (even if under the 5MB limit) could cause performance issues or out-of-memory errors during parsing.  
**Location:** `src/lib/storage-utils.ts` (safeLocalStorageRead function)  
**Risk:** Malformed but large saves could cause the browser tab to hang or crash during parsing.  
**Fix:** 
- Add size checks before parsing (e.g., if string length > 5MB, skip)
- Use streaming JSON parse for large saves
- Wrap JSON.parse in a try-catch with timeout

### SAVE-20: Missing IndexedDB Fallback for Large Saves
**Severity:** Medium  
**Description:** The game exclusively uses localStorage which has a ~5MB limit. For users with extensive story logs or multiple adventures, this may be insufficient. IndexedDB provides much larger storage capacity.  
**Location:** `src/lib/storage-utils.ts`, `src/context/GameContext.tsx`  
**Risk:** Users may be unable to save their progress if they're prolific players with multiple long adventures. The only current mitigation is the "delete all saves" option.  
**Fix:** 
- Implement an IndexedDB storage backend as an option
- Use localStorage for settings and IndexedDB for save data
- Add automatic fallback to IndexedDB if localStorage quota is exceeded

---

## Recommendations Summary

### High Priority
1. **SAVE-2**: Implement save export/import functionality for backup portability
2. **SAVE-3**: Add IndexedDB support or compression to handle localStorage quota limits

### Medium Priority
1. **SAVE-1**: Improve migration system with testing and validation
2. **SAVE-4**: Add checksum/hash verification for save integrity
3. **SAVE-5**: Strengthen multiplayer state sanitization
4. **SAVE-8**: Implement save compression for large story logs
5. **SAVE-9**: Fix debounced save race condition with navigation
6. **SAVE-13**: Improve repair function with better data extraction
7. **SAVE-16**: Enhance multiplayer reconnection state sync
8. **SAVE-20**: Add IndexedDB fallback option

### Low Priority
1. **SAVE-6**: Improve atomic write robustness
2. **SAVE-7**: Fix sessionStorage usage for backups
3. **SAVE-10**: Review Zod passthrough usage
4. **SAVE-11**: Add save naming and metadata
5. **SAVE-12**: Clean up orphaned backups
6. **SAVE-14**: Display save version to users
7. **SAVE-15**: Standardize storyLog capping
8. **SAVE-17**: Unify backup key patterns
9. **SAVE-18**: Add periodic integrity checks
10. **SAVE-19**: Add JSON.parse size limits

---

## Positive Findings

The codebase demonstrates several strong persistence practices:

1. ✅ **Schema Validation**: Zod-based validation with `SavedAdventureSchema`
2. ✅ **Migration System**: Versioned schema with `runMigrations()` and `getPendingMigrations()`
3. ✅ **Atomic Writes**: `atomicLocalStorageWrite()` with temp/backup/rename pattern
4. ✅ **Backup System**: Automatic backups before overwrite (up to 5 per save)
5. ✅ **Corruption Handling**: `repairSaveData()` function for partial recovery
6. ✅ **Size Checking**: `checkSaveSize()` warns at 4MB, blocks at 5MB
7. ✅ **Multiplayer Sanitization**: `sanitizeStateForPersistence()` removes MP fields
8. ✅ **Storage Event Listener**: Detects changes from other tabs
9. ✅ **Quota Monitoring**: `isLocalStorageQuotaLow()` warns when approaching limits
10. ✅ **Error Recovery UI**: Toast notifications with recovery options for corrupted data

