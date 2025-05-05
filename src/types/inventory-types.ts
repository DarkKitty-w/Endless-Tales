// src/types/inventory-types.ts

/** Defines the possible quality levels for items. */
export type ItemQuality = "Poor" | "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

/** Represents an item in the character's inventory. */
export interface InventoryItem {
    name: string;
    description: string; // Make description mandatory
    weight?: number; // Optional weight
    durability?: number; // Optional durability (e.g., 0-100)
    magicalEffect?: string; // Optional description of magical effects
    quality?: ItemQuality; // Optional quality level
}
