# Persistence & Save Integrity Audit Report

**Project:** Endless Tales  
**Date:** 2025-05-07  
**Scope:** Data persistence, save/load reliability, and integrity  

---

## Executive Summary

The Endless Tales project implements a client-side save/load system using browser localStorage with several well-designed safety mechanisms:

**Strengths:**
- Zod-based schema validation for save data
- Versioned save format with migration system (currently v1)
- Atomic write operations with temp/backup pattern
- Save repair functionality for corrupted data
- Automatic backups before overwriting saves
- Save size checking with warnings
- Multiplayer field sanitization before persistence
- Storage event listeners for cross-tab detection

**Key Concerns:**
- Single-point-of-failure with localStorage only
- Limited migration system (only v0 to v1 exists)
- No checksum/integrity verification
- Potential race conditions in debounced saves
- No export/import functionality for user backups

---

## Detailed Findings

### SAVE-1: No Explicit Version Field Validation on Save Creation
**Severity:** Medium  
**Description:** While `version: CURRENT_STATE_VERSION` is set when creating saves, there is no runtime validation that the version is correctly applied. The system relies on the developer to correctly set the version.  
**Location:** `src/context/reducers/adventureReducer.ts`  
**Risk:** If a developer forgets to update the version field during schema changes, saves may be created with stale version numbers.  
**Fix:** Add validation step after save object creation to verify version matches `CURRENT_STATE_VERSION`.

---

### SAVE-2: Permissive Schema Validation with passthrough()
**Severity:** Medium  
**Description:** The Zod schema uses `.passthrough()` which allows extra fields without validation, leading to inconsistent save formats.  
**Location:** `src/context/schemas/save-schema.ts`  
**Risk:** Invalid fields could cause runtime errors. The passthrough allows "silent" data corruption.  
**Fix:** Use `.strict()` instead of `.passthrough()` for critical objects.

---

### SAVE-3: Limited Migration System for Future Growth
**Severity:** Medium  
**Description:** Only one migration exists (v0 to v1). No systematic approach for complex migrations, rollback, or testing.  
**Location:** `src/context/schemas/migration-system.ts`  
**Risk:** As the game evolves, the migration system may not handle complex schema changes.  
**Fix:** Design migration system to support up/down migrations and create test suite.

---

### SAVE-4: No Cloud Save Synchronization
**Severity:** Low  
**Description:** The project relies exclusively on localStorage. No cloud sync, cross-device transfer, or user account-based storage.  
**Location:** Throughout persistence layer  
**Risk:** Players lose all progress if they clear browser data, switch devices, or use different browsers.  
**Fix:** Implement optional cloud save sync or at minimum provide export/import functionality.

---

### SAVE-5: Incomplete QuotaExceededError Handling
**Severity:** High  
**Description:** `atomicLocalStorageWrite` doesn't specifically handle `QuotaExceededError`. The atomic write can fail silently.  
**Location:** `src/lib/storage-utils.ts`  
**Risk:** When localStorage is full, the write may fail and user loses recent save data.  
**Fix:** Add specific `QuotaExceededError` handling and notify user when quota is exceeded.

---

### SAVE-6: Atomic Write Failure Not Always Handled
**Severity:** Medium  
**Description:** In some code paths, the save is added to state without verifying the write succeeded.  
**Location:** `src/context/GameContext.tsx`, `src/context/reducers/adventureReducer.ts`  
**Risk:** UI may show save as "saved" but data may not be persisted to localStorage.  
**Fix:** Only add saves to state after successful write. Add user notification for save failures.

---

### SAVE-7: Backups Stored in Same localStorage
**Severity:** Medium  
**Description:** Save backups are stored in same localStorage as main saves, consuming same limited quota.  
**Location:** `src/lib/storage-utils.ts`  
**Risk:** Backups may cause quota to be exceeded faster. If user clears browser data, all backups are lost.  
**Fix:** Limit backup frequency. Consider storing backups in IndexedDB.

---

### SAVE-8: Story Log Size Inconsistency
**Severity:** Low  
**Description:** Story log capped at 50 entries when saving, but schema doesn't enforce this limit.  
**Location:** `src/context/reducers/adventureReducer.ts`, `src/context/schemas/save-schema.ts`  
**Risk:** Large story logs can cause localStorage quota issues and slow performance.  
**Fix:** Document the 50-entry save limit. Consider compressing old log entries.

---

### SAVE-9: No Checksum or Integrity Verification
**Severity:** Medium  
**Description:** Save data written as JSON without integrity checks or tamper detection.  
**Location:** Throughout persistence layer  
**Risk:** Partially corrupted data may load invalid state without warning. Malicious users could tamper with save data.  
**Fix:** Add checksum field to `SavedAdventure` interface. Verify on loading.

---

### SAVE-10: Multiplayer State Leak Risk
**Severity:** High  
**Description:** `sanitizeStateForPersistence` only removes hardcoded list of fields. New multiplayer fields could leak.  
**Location:** `src/lib/storage-utils.ts`, `src/context/reducers/adventureReducer.ts`  
**Risk:** New multiplayer fields might accidentally be persisted or cause issues when loading.  
**Fix:** Use whitelist approach instead of blacklist for sanitization.

---

### SAVE-11: No Periodic Auto-Save
**Severity:** Low  
**Description:** Game relies entirely on manual saving. No periodic auto-save or recovery save on page unload.  
**Location:** `src/context/GameContext.tsx`, `src/context/reducers/adventureReducer.ts`  
**Risk:** If browser crashes or user closes tab, all progress since last manual save is lost.  
**Fix:** Add periodic auto-save. Listen for `beforeunload` event.

---

### SAVE-12: Permanent Deletion Without Backup
**Severity:** Medium  
**Description:** When deleting an adventure, no backup is created. Save is permanently removed.  
**Location:** `src/context/reducers/adventureReducer.ts`  
**Risk:** Accidental deletion cannot be undone. Users lose all progress with no recovery option.  
**Fix:** Create backup before deleting. Add "recently deleted" recovery feature.

---

### SAVE-13: Race Condition in Debounced Save
**Severity:** Medium  
**Description:** Persistence effect uses debounced save (500ms). Multiple rapid state changes could cause race conditions.  
**Location:** `src/context/GameContext.tsx`  
**Risk:** Saved data may not reflect most recent game state, leading to lost progress.  
**Fix:** Use state value captured in effect, not stale closure. Consider using `useRef`.

---

### SAVE-14: Browser Data Clearing Destroys All Saves
**Severity:** High  
**Description:** Since all saves are in localStorage, clearing browsing data destroys all save data.  
**Location:** Browser-dependent  
**Risk:** Users can lose hundreds of hours of gameplay instantly with a single accidental click.  
**Fix:** Implement save export/import functionality. Show warning in UI about backing up saves.

---

### SAVE-15: No Save File Export/Import
**Severity:** Medium  
**Description:** No user-facing functionality to export/import saves or share between devices.  
**Location:** No UI or API for this  
**Risk:** Users locked into single browser on single device.  
**Fix:** Implement export/import buttons in SavedAdventuresList component.

---

### SAVE-16: No Validation of Loaded Save Data Integrity
**Severity:** Medium  
**Description:** When loading adventure, code trusts save data is valid after migration. No validation of stats, items, or map data.  
**Location:** `src/context/reducers/adventureReducer.ts`  
**Risk:** Invalid save data could cause runtime errors or undefined behavior during gameplay.  
**Fix:** Add `validateLoadedAdventure` function that checks integrity of critical game state.

---

### SAVE-17: Story Log Timestamp Inconsistency
**Severity:** Low  
**Description:** Story log entries have timestamp field, but format not validated and no chronological order check.  
**Location:** `src/types/adventure-types.ts`, `src/context/schemas/save-schema.ts`  
**Risk:** Invalid timestamps may display incorrect information in UI.  
**Fix:** Validate timestamps in schema. Add default timestamp for migrated entries.

---

## Recommendations Summary

| Priority | Action | Impact |
|----------|--------|--------|
| **High** | Implement save export/import | Prevents total data loss |
| **High** | Add QuotaExceededError handling | Prevents silent save failures |
| **High** | Fix multiplayer state isolation | Prevents state contamination |
| **Medium** | Add checksum verification | Detects corruption |
| **Medium** | Improve migration system | Supports future growth |
| **Medium** | Add auto-save feature | Reduces progress loss |
| **Medium** | Fix atomic write error handling | Ensures save reliability |
| **Low** | Document save format | Helps with debugging |
| **Low** | Add save compression | Reduces storage usage |

---

## Schema Version History

| Version | Changes | Migration |
|---------|---------|-----------|
| 0 | Initial version (no version field) | N/A |
| 1 | Added `worldMap` field | `migration-system.ts` v0 to v1 |

---

## Testing Recommendations

1. **Unit Tests:**
   - Test all migration functions
   - Test schema validation with valid/invalid data
   - Test atomic write success/failure paths

2. **Integration Tests:**
   - Load save from previous version, verify migration
   - Test save/load cycle with all game features
   - Test corruption detection and repair

3. **Manual Tests:**
   - Clear localStorage, verify graceful handling
   - Exceed quota, verify error messages
   - Load intentionally corrupted save file

---

**End of Report**
