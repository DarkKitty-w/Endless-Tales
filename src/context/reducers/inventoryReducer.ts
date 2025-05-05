// src/context/reducers/inventoryReducer.ts
import type { InventoryItem, ItemQuality } from "@/types/inventory-types";
import type { Action } from "../game-actions";
import { initialInventory } from "../game-initial-state";
import { updateGameStateString } from "@/lib/game-state-utils"; // If needed for derived state

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
            console.log("Adding validated item:", newItem.name);
            return [...state, newItem];
        }
        case "REMOVE_ITEM": {
            const { itemName, quantity = 1 } = action.payload;
            console.log(`Attempting to remove ${quantity} of item:`, itemName);
            const updatedInventory = [...state];
            let removedCount = 0;
            for (let i = updatedInventory.length - 1; i >= 0 && removedCount < quantity; i--) {
                if (updatedInventory[i].name === itemName) {
                    updatedInventory.splice(i, 1);
                    removedCount++;
                }
            }
            if (removedCount < quantity) {
                console.warn(`Tried to remove ${quantity} of ${itemName}, but only found ${removedCount}.`);
            }
            return updatedInventory;
        }
        case "UPDATE_ITEM": {
            const { itemName, updates } = action.payload;
            console.log("Updating item:", itemName, "with", updates);
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
            console.log("Replacing inventory with new list:", validatedNewInventory.map(i => i.name));
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
                    console.warn(`Attempted to consume non-existent item: ${itemName}`);
                }
            });

            // Add crafted item if successful
            if (craftedItem) {
                updatedInventory.push(craftedItem);
            }
            return updatedInventory;
        }
         case "START_GAMEPLAY": // Initialize inventory on new game start
            // Only initialize if not loading a save (reducer handles loading separately)
             // Check if currentAdventureId exists in the *previous* state or passed somehow
             // If not resuming, return initialInventory
             // This logic might need adjustment depending on how START_GAMEPLAY interacts with LOAD_ADVENTURE
             // For now, assume START_GAMEPLAY implies a new game unless LOAD_ADVENTURE happened before.
            // A better approach might be to handle inventory init within the CREATE_CHARACTER or LOAD_ADVENTURE reducers.
            // Let's return initialInventory for now, LOAD_ADVENTURE will overwrite it if needed.
            return [...initialInventory]; // Return a copy
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
