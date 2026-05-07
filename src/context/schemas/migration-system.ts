// src/context/schemas/migration-system.ts
import type { SavedAdventure } from '../../types/adventure-types';
import { CURRENT_STATE_VERSION } from '../game-initial-state';
import { logger } from '@/lib/logger';

/**
 * Migration function type - takes a SavedAdventure and returns a migrated version
 */
type MigrationFunction = (adventure: SavedAdventure) => SavedAdventure;

/**
 * Migration map: version number -> migration function to upgrade from that version to version+1
 * Each migration migrates from version X to X+1
 */
const migrations: Record<number, MigrationFunction> = {
  // Migration from version 0 to version 1: Add worldMap if missing
  0: (adventure: SavedAdventure): SavedAdventure => {
    if (!adventure.worldMap) {
      // Import initialState dynamically to avoid circular dependency
      // Use a default world map structure
      logger.log('Migration v0->v1: Adding missing worldMap field');
      return {
        ...adventure,
        worldMap: {
          locations: [],
          currentLocationId: null,
        },
      };
    }
    return adventure;
  },
  
  // Future migrations can be added here
  // 1: (adventure: SavedAdventure): SavedAdventure => { ... },
};

/**
 * Run all necessary migrations to bring an adventure from its current version to the latest version
 * @param adventure - The saved adventure to migrate
 * @returns The migrated adventure at the current version
 */
export function runMigrations(adventure: SavedAdventure): SavedAdventure {
  const currentVersion = adventure.version ?? 0;
  
  if (currentVersion >= CURRENT_STATE_VERSION) {
    // Already at current version or newer, no migration needed
    return adventure;
  }
  
  let migrated = { ...adventure };
  
  // Run each migration in sequence
  for (let v = currentVersion; v < CURRENT_STATE_VERSION; v++) {
    const migration = migrations[v];
    if (migration) {
      try {
        migrated = migration(migrated);
        logger.log(`Migration: Applied v${v} -> v${v + 1}`);
      } catch (error) {
        logger.error(`Migration failed at v${v} -> v${v + 1}:`, "migration-system", { error: String(error) });
        // Continue with next migration - best effort
      }
    } else {
      logger.warn(`No migration found for v${v} -> v${v + 1}, skipping`);
    }
  }
  
  // Ensure the version is set to current
  migrated.version = CURRENT_STATE_VERSION;
  
  return migrated;
}

/**
 * Get the list of pending migrations for an adventure
 * @param adventure - The saved adventure to check
 * @returns Array of version numbers for pending migrations
 */
export function getPendingMigrations(adventure: SavedAdventure): number[] {
  const currentVersion = adventure.version ?? 0;
  const pending: number[] = [];
  
  for (let v = currentVersion; v < CURRENT_STATE_VERSION; v++) {
    if (migrations[v]) {
      pending.push(v);
    }
  }
  
  return pending;
}
