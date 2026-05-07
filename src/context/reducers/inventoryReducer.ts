// src/context/reducers/inventoryReducer.ts
import type { InventoryItem, ItemQuality } from "../../types/inventory-types";
import type { Action } from "../game-actions";
import { initialInventory } from "../game-initial-state";
import { logger } from "../../lib/logger";

export function inventoryReducer(state: InventoryItem[], action: Action): InventoryItem[] {
    switch (action.type) {
        case "ADD_ITEM": {
            const newItem: InventoryItem = {
                name: action.payload.name || "Mysterious Item",
                description: action.payload.description || "An item of unclear origin.",
                quality: action.payload.quality || "Common",
                weight: typeof action.payload.weight === 'number' ? action.payload.weight : 1,
                durability: typeof action.payload.durability === 'number' ? action.payload.durability : undefined,
                magicalEffect: action.payload.magicalEffect || undefined,
            };
            logger.debug("Adding validated item:", "inventoryReducer", { itemName: newItem.name });
            return [...state, newItem];
        }
        case "REMOVE_ITEM": {
            const { itemName, quantity = 1 } = action.payload;
            logger.debug(`Attempting to remove ${quantity} of item:`, "inventoryReducer", { itemName });
            // Check if item exists before creating new array
            const itemExists = state.some(item => item.name === itemName);
            if (!itemExists) {
                logger.warn(`Item ${itemName} not found in inventory.`, "inventoryReducer");
                return state;
            }
            const updatedInventory = [...state];
            let removedCount = 0;
            for (let i = updatedInventory.length - 1; i >= 0 && removedCount < quantity; i--) {
                if (updatedInventory[i].name === itemName) {
                    updatedInventory.splice(i, 1);
                    removedCount++;
                }
            }
            if (removedCount < quantity) {
                logger.warn(`Tried to remove ${quantity} of ${itemName}, but only found ${removedCount}.`, "inventoryReducer");
            }
            // Only return new array if items were actually removed
            return removedCount > 0 ? updatedInventory : state;
        }
        case "UPDATE_ITEM": {
            const { itemName, updates } = action.payload;
            logger.debug("Updating item:", "inventoryReducer", { itemName, updates });
            // Check if any item actually needs updating
            const needsUpdate = state.some(item => {
                if (item.name !== itemName) return false;
                // Check if any update field actually changes the item
                return Object.keys(updates).some(key => {
                    const updateKey = key as keyof InventoryItem;
                    return item[updateKey] !== updates[updateKey];
                });
            });
            if (!needsUpdate) return state;
            return state.map(item =>
                item.name === itemName ? { ...item, ...updates } : item
            );
        }
        case "UPDATE_INVENTORY": {
            const validatedNewInventory = action.payload.map(item => ({
                name: item.name || "Unknown Item",
                description: item.description || "An item of unclear origin.",
                weight: typeof item.weight === 'number' ? item.weight : 1,
                quality: item.quality || "Common" as ItemQuality,
                durability: typeof item.durability === 'number' ? item.durability : undefined,
                magicalEffect: item.magicalEffect || undefined,
            }));
            logger.debug("Replacing inventory with new list:", "inventoryReducer", { 
                itemNames: validatedNewInventory.map(i => i.name) 
            });
            return validatedNewInventory;
        }
        case "UPDATE_CRAFTING_RESULT": {
            const { consumedItems, craftedItem } = action.payload;
            let updatedInventory = [...state];

            // Consume items
            consumedItems.forEach(itemName => {
                const indexToRemove = updatedInventory.findIndex(item => item.name === itemName);
                if (indexToRemove > -1) {
                    updatedInventory.splice(indexToRemove, 1);
                } else {
                    logger.warn(`Attempted to consume non-existent item: ${itemName}`, "inventoryReducer");
                }
            });

            // Add crafted item if successful
            if (craftedItem) {
                updatedInventory.push(craftedItem);
            }
            return updatedInventory;
        }
        case "START_GAMEPLAY":
            // Only initialise if inventory is empty (new game).
            // If already populated (e.g., from LOAD_ADVENTURE), keep it.
            return state.length === 0 ? [...initialInventory] : state;
        case "RESET_GAME":
            return []; // Clear inventory on reset
        case "LOAD_ADVENTURE":
             // Validate inventory data from loaded adventure
             return (Array.isArray(action.payload.inventory) ? action.payload.inventory : []).map(item => ({
                 name: item.name || "Unknown Item",
                 description: item.description || "An item of unclear origin.",
                 weight: typeof item.weight === 'number' ? item.weight : 1,
                 quality: item.quality || "Common" as ItemQuality,
                 durability: typeof item.durability === 'number' ? item.durability : undefined,
                 magicalEffect: item.magicalEffect || undefined,
             }));
        default:
            return state;
    }
}