// src/lib/storage-utils.ts
/**
 * Utility functions for safe localStorage operations with atomicity and error handling
 */

import type { SavedAdventure } from "../types/adventure-types";
import type { Character } from "../types/character-types";
import type { AdventureSettings } from "../types/adventure-types";
import type { GameStatus } from "../types/game-types";
import { CURRENT_STATE_VERSION } from "../context/game-initial-state";
import { logger } from "./logger";

const TEMP_PREFIX = '_temp_';
const BACKUP_PREFIX = '_backup_';

/**
 * Atomically write data to localStorage
 * Uses write-to-temp, validate, rename pattern for atomicity
 * 
 * @param key - The localStorage key to write to
 * @param value - The value to write (will be JSON.stringified)
 * @returns true if write succeeded, false otherwise
 */
export function atomicLocalStorageWrite(key: string, value: unknown): boolean {
  const tempKey = `${TEMP_PREFIX}${key}`;
  const backupKey = `${BACKUP_PREFIX}${key}`;
  
  try {
    // Step 1: Read existing value for backup (if exists)
    const existingValue = localStorage.getItem(key);
    
    // Step 2: Write to temporary key
    const serialized = JSON.stringify(value);
    localStorage.setItem(tempKey, serialized);
    
    // Step 3: Validate the write by reading it back
    const verifyRead = localStorage.getItem(tempKey);
    if (!verifyRead || verifyRead !== serialized) {
      // Write validation failed, clean up temp
      localStorage.removeItem(tempKey);
      logger.error('Atomic write failed: verification failed for key', 'storage-utils', { key });
      return false;
    }
    
    // Step 4: Create backup of existing data (if any)
    if (existingValue !== null) {
      localStorage.setItem(backupKey, existingValue);
    }
    
    // Step 5: Rename temp to final key (overwrite)
    localStorage.setItem(key, serialized);
    
    // Step 6: Verify final write
    const finalVerify = localStorage.getItem(key);
    if (!finalVerify || finalVerify !== serialized) {
      // Final write failed, try to restore from backup
      const backup = localStorage.getItem(backupKey);
      if (backup) {
        localStorage.setItem(key, backup);
      }
      localStorage.removeItem(tempKey);
      localStorage.removeItem(backupKey);
      logger.error('Atomic write failed: final verification failed for key', 'storage-utils', { key });
      return false;
    }
    
    // Step 7: Clean up temp and backup
    localStorage.removeItem(tempKey);
    localStorage.removeItem(backupKey);
    
    return true;
  } catch (error) {
    // Clean up on error
    try {
      localStorage.removeItem(tempKey);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    logger.error('Atomic write failed with error:', 'storage-utils', { error });
    return false;
  }
}

/**
 * Read from localStorage with fallback to backup if main read fails
 * 
 * @param key - The localStorage key to read from
 * @returns The parsed value, or null if not found or invalid
 */
export function safeLocalStorageRead<T = unknown>(key: string): T | null {
  const backupKey = `${BACKUP_PREFIX}${key}`;
  
  try {
    const data = localStorage.getItem(key);
    if (data === null) return null;
    
    return JSON.parse(data) as T;
  } catch (error) {
    logger.warn(`Failed to read ${key}, trying backup...`, 'storage-utils', { error });
    
    // Try backup
    try {
      const backupData = localStorage.getItem(backupKey);
      if (backupData !== null) {
        logger.info(`Successfully read backup for ${key}`, 'storage-utils');
        return JSON.parse(backupData) as T;
      }
    } catch (backupError) {
      logger.error(`Backup read also failed for ${key}`, 'storage-utils', { backupError });
    }
    
    return null;
  }
}

/**
 * Get the size of a localStorage item in bytes (approximate)
 */
export function getLocalStorageItemSize(key: string): number {
  const value = localStorage.getItem(key);
  if (value === null) return 0;
  return new Blob([value]).size;
}

/**
 * Check if localStorage is approaching quota limit
 * Returns true if less than 10% quota remains (assuming 5MB typical limit)
 */
export function isLocalStorageQuotaLow(thresholdPercent: number = 10): boolean {
  try {
    // Test by writing 1KB and seeing if it fails
    const testKey = '_quota_test_';
    const testData = 'x'.repeat(1024); // 1KB
    
    localStorage.setItem(testKey, testData);
    localStorage.removeItem(testKey);
    
    // Also check current usage
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        totalSize += getLocalStorageItemSize(key);
      }
    }
    
    // Assume 5MB limit (typical)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
    const usedPercent = (totalSize / estimatedLimit) * 100;
    
    return usedPercent > (100 - thresholdPercent);
  } catch (error) {
    // If we get quota error during test, we're definitely low
    return true;
  }
}

const SAVE_BACKUP_PREFIX = '_savebackup_';
const MAX_BACKUPS_PER_SAVE = 5;
const WARN_SIZE_THRESHOLD = 4 * 1024 * 1024; // 4MB - warn when approaching 5MB limit
const MAX_SAVE_SIZE = 5 * 1024 * 1024; // 5MB - hard limit for a single save

/**
 * Check if a save is too large and return size information
 * 
 * @param saveData - The save data to check
 * @returns Object with size info and whether it exceeds thresholds
 */
export function checkSaveSize(saveData: unknown): { 
  size: number; 
  isTooLarge: boolean; 
  isApproachingLimit: boolean;
  sizeFormatted: string;
} {
  try {
    const serialized = JSON.stringify(saveData);
    const size = new Blob([serialized]).size;
    
    return {
      size,
      isTooLarge: size > MAX_SAVE_SIZE,
      isApproachingLimit: size > WARN_SIZE_THRESHOLD,
      sizeFormatted: formatBytes(size)
    };
  } catch (error) {
    logger.error('Failed to check save size:', 'storage-utils', { error });
    return { size: 0, isTooLarge: false, isApproachingLimit: false, sizeFormatted: '0 B' };
  }
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create a backup of a save before overwriting (SAVE-14, SAVE-17)
 * Keeps up to MAX_BACKUPS_PER_SAVE backups per save ID
 * 
 * @param saveId - The ID of the save to backup
 * @param saveData - The save data to backup
 */
export function createSaveBackup(saveId: string, saveData: unknown): void {
  try {
    const backupKey = `${SAVE_BACKUP_PREFIX}${saveId}_${Date.now()}`;
    const serialized = JSON.stringify(saveData);
    localStorage.setItem(backupKey, serialized);
    
    // Clean up old backups - keep only the most recent MAX_BACKUPS_PER_SAVE
    const keysToRemove: string[] = [];
    const saveBackups: { key: string; timestamp: number }[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${SAVE_BACKUP_PREFIX}${saveId}_`)) {
        const parts = key.split('_');
        const timestamp = parseInt(parts[parts.length - 1]);
        if (!isNaN(timestamp)) {
          saveBackups.push({ key, timestamp });
        }
      }
    }
    
    // Sort by timestamp descending (newest first)
    saveBackups.sort((a, b) => b.timestamp - a.timestamp);
    
    // Mark old backups for removal
    if (saveBackups.length > MAX_BACKUPS_PER_SAVE) {
      for (let i = MAX_BACKUPS_PER_SAVE; i < saveBackups.length; i++) {
        keysToRemove.push(saveBackups[i].key);
      }
    }
    
    // Remove old backups
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Ignore cleanup errors
      }
    });
  } catch (error) {
    logger.error('Failed to create save backup:', 'storage-utils', { error });
  }
}

/**
 * Get all backups for a specific save ID
 * 
 * @param saveId - The save ID to get backups for
 * @returns Array of backup data with metadata
 */
export function getSaveBackups(saveId: string): Array<{ key: string; timestamp: number; data: unknown }> {
  const backups: Array<{ key: string; timestamp: number; data: unknown }> = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${SAVE_BACKUP_PREFIX}${saveId}_`)) {
        const parts = key.split('_');
        const timestamp = parseInt(parts[parts.length - 1]);
        if (!isNaN(timestamp)) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || 'null');
            backups.push({ key, timestamp, data });
          } catch (e) {
            // Skip invalid backups
          }
        }
      }
    }
    
    // Sort by timestamp descending (newest first)
    backups.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    logger.error('Failed to get save backups:', 'storage-utils', { error });
  }
  
  return backups;
}

/**
 * Restore a save from backup
 * 
 * @param backupKey - The backup key to restore from
 * @returns The restored save data, or null if failed
 */
export function restoreFromBackup(backupKey: string): unknown {
  try {
    const data = localStorage.getItem(backupKey);
    if (data === null) return null;
    return JSON.parse(data);
  } catch (error) {
    logger.error('Failed to restore from backup:', 'storage-utils', { error });
    return null;
  }
}

/**
 * SAVE-11 Fix: Sanitize state for persistence by removing multiplayer-specific fields
 * that should not be persisted in saved adventures.
 * 
 * @param state - The game state to sanitize
 * @returns A new state object with multiplayer fields removed
 */
export function sanitizeStateForPersistence(state: Record<string, unknown>): Record<string, unknown> {
  // Create a copy to avoid mutating original
  const sanitized = { ...state };
  
  // Remove multiplayer-specific fields that shouldn't be persisted
  const fieldsToRemove = [
    'sessionId',
    'players', 
    'isHost',
    'peerId',
    'connectionStatus',
    'turnOrder',
    'currentTurnIndex',
    'isMyTurn',
    'pendingInteraction',
    'partyState',
    'chatMessages',
    'isPaused'
  ];
  
  fieldsToRemove.forEach(field => {
    delete sanitized[field];
  });
  
  return sanitized;
}

/**
 * SAVE-15 Fix: Attempt to repair partially corrupted save data.
 * Identifies valid fields and reconstructs the save with defaults for missing data.
 * 
 * @param corruptedData - The corrupted save data to repair
 * @param initialState - The initial state to use for defaults
 * @returns Repaired SavedAdventure or null if repair is not possible
 */
export function repairSaveData(
  corruptedData: Record<string, unknown>,
  initialState: {
    characterName: string;
    character: any;
    adventureSettings: any;
    storyLog: any[];
    currentGameStateString: string;
    inventory: any[];
    worldMap: any;
  }
): SavedAdventure | null {
  try {
    // Start with defaults
    const repaired: Partial<SavedAdventure> = {
      id: typeof corruptedData.id === 'string' ? corruptedData.id : `repaired_${Date.now()}`,
      version: typeof corruptedData.version === 'number' ? corruptedData.version : CURRENT_STATE_VERSION,
      saveTimestamp: typeof corruptedData.saveTimestamp === 'number' ? corruptedData.saveTimestamp : Date.now(),
    };
    
    // Repair characterName
    if (typeof corruptedData.characterName === 'string' && corruptedData.characterName.trim()) {
      repaired.characterName = corruptedData.characterName;
    } else if (corruptedData.character && typeof corruptedData.character === 'object' && corruptedData.character !== null && 'name' in (corruptedData.character as any)) {
      repaired.characterName = (corruptedData.character as any).name;
    } else {
      repaired.characterName = initialState.characterName;
    }
    
    // Repair character
    if (corruptedData.character && typeof corruptedData.character === 'object' && corruptedData.character !== null) {
      repaired.character = corruptedData.character as any as Character;
    } else {
      repaired.character = initialState.character;
    }
    
    // Repair adventureSettings
    if (corruptedData.adventureSettings && typeof corruptedData.adventureSettings === 'object' && corruptedData.adventureSettings !== null) {
      repaired.adventureSettings = corruptedData.adventureSettings as any as AdventureSettings;
    } else {
      repaired.adventureSettings = initialState.adventureSettings;
    }
    
    // Repair storyLog
    if (Array.isArray(corruptedData.storyLog)) {
      repaired.storyLog = corruptedData.storyLog;
    } else {
      repaired.storyLog = initialState.storyLog;
    }
    
    // Repair currentGameStateString
    if (typeof corruptedData.currentGameStateString === 'string') {
      repaired.currentGameStateString = corruptedData.currentGameStateString;
    } else {
      repaired.currentGameStateString = initialState.currentGameStateString;
    }
    
    // Repair inventory
    if (Array.isArray(corruptedData.inventory)) {
      repaired.inventory = corruptedData.inventory;
    } else {
      repaired.inventory = initialState.inventory;
    }
    
    // Repair worldMap
    if (corruptedData.worldMap && typeof corruptedData.worldMap === 'object' && corruptedData.worldMap !== null) {
      repaired.worldMap = corruptedData.worldMap as any;
    } else {
      repaired.worldMap = initialState.worldMap;
    }
    
    // Copy optional fields if valid
    if (typeof corruptedData.statusBeforeSave === 'string') {
      repaired.statusBeforeSave = corruptedData.statusBeforeSave as GameStatus;
    }
    // null is not allowed, so we skip it (leaves it undefined)
    
    if (typeof corruptedData.adventureSummary === 'string' || corruptedData.adventureSummary === null) {
      repaired.adventureSummary = corruptedData.adventureSummary as string | null | undefined;
    }
    
    if (typeof corruptedData.turnCount === 'number') {
      repaired.turnCount = corruptedData.turnCount;
    }
    
    // Validate the repaired save has all required fields
    if (!repaired.id || !repaired.characterName || !repaired.character || !repaired.adventureSettings || 
        !repaired.storyLog || !repaired.currentGameStateString || !repaired.inventory) {
      logger.error('Repair failed: missing required fields after repair', 'storage-utils');
      return null;
    }
    
    return repaired as SavedAdventure;
  } catch (error) {
    logger.error('Failed to repair save data:', 'storage-utils', { error });
    return null;
  }
}
