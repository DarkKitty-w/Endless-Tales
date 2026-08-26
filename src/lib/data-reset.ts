// src/lib/data-reset.ts
import { logger } from "./logger";
import { SAVED_ADVENTURES_KEY } from "./constants";

/**
 * App-owned localStorage keys. Only these are cleared by "Reset All Data"
 * so unrelated entries on the same origin are never touched.
 */
const APP_STORAGE_KEYS = [
  SAVED_ADVENTURES_KEY, // saved adventures list (GameContext)
  "colorTheme", // THEME_ID_KEY
  "themeMode", // THEME_MODE_KEY
  "userGoogleAiApiKey", // USER_API_KEY_KEY (legacy Gemini key)
  "endlessTales_aiProvider",
  "endlessTales_providerApiKeys",
  "endlessTales_providerModels",
  "endlessTales_onboardingSeen",
];

export interface ResetDataResult {
  removedKeys: string[];
  failedKeys: string[];
}

/**
 * Remove every Endless Tales entry from localStorage: saves, settings,
 * provider keys/models, temp/backup copies, and the onboarding flag.
 * Keys that fail to be removed (rare) are reported instead of aborting.
 */
export function resetAllLocalData(): ResetDataResult {
  const removedKeys: string[] = [];
  const failedKeys: string[] = [];

  const isAppKey = (key: string) =>
    APP_STORAGE_KEYS.includes(key) ||
    key.startsWith("_temp_") || // atomic write staging copies
    key.startsWith("_backup_") || // atomic write backups
    key.startsWith("endlessTalesCorruptedBackup_") ||
    key.startsWith("endlessTales_temp_backup_"); // multiplayer temp backups

  try {
    const keysToRemove = Object.keys(localStorage).filter(isAppKey);
    for (const key of keysToRemove) {
      try {
        localStorage.removeItem(key);
        removedKeys.push(key);
      } catch {
        failedKeys.push(key);
      }
    }
  } catch (error) {
    logger.error("Failed to enumerate localStorage for reset", "data-reset", {
      error: String(error),
    });
  }

  if (failedKeys.length > 0) {
    logger.error("Some keys could not be removed during data reset", "data-reset", {
      failedKeys,
    });
  } else {
    logger.log("All local Endless Tales data cleared", "data-reset", {
      removedKeys,
    });
  }

  return { removedKeys, failedKeys };
}