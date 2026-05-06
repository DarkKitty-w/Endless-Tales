// src/lib/storage-utils.ts
/**
 * Utility functions for safe localStorage operations with atomicity and error handling
 */

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
      console.error('Atomic write failed: verification failed for key', key);
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
      console.error('Atomic write failed: final verification failed for key', key);
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
    
    console.error('Atomic write failed with error:', error);
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
    console.warn(`Failed to read ${key}, trying backup...`, error);
    
    // Try backup
    try {
      const backupData = localStorage.getItem(backupKey);
      if (backupData !== null) {
        console.log(`Successfully read backup for ${key}`);
        return JSON.parse(backupData) as T;
      }
    } catch (backupError) {
      console.error(`Backup read also failed for ${key}`, backupError);
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
