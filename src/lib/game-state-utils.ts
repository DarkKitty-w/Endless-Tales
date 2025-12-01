
// src/lib/game-state-utils.ts

import type { Character } from "../types/character-types";
import type { InventoryItem } from "../types/inventory-types";

/**
 * Helper function to update the game state string with current character and inventory info.
 * It parses the existing string and replaces relevant sections.
 *
 * @param baseString - The current game state string.
 * @param character - The current character object.
 * @param inventory - The current inventory array.
 * @param turn - The current turn count.
 * @returns The updated game state string.
 */
export const updateGameStateString = (
    baseString: string,
    character: Character | null,
    inventory: InventoryItem[],
    turn: number
): string => {
    if (!character) return baseString; // Return base if no character

    let updatedString = baseString;

    // Update Turn Count
    updatedString = updatedString.replace(/Turn: \d+/, `Turn: ${turn}`);

    // Update Level and XP
    updatedString = updatedString.replace(/Level: \d+ \(\d+\/\d+ XP\)/, `Level: ${character.level} (${character.xp}/${character.xpToNextLevel} XP)`);

    // Update Inventory
    const inventoryString = inventory.length > 0 ? inventory.map(item => `${item.name}${item.quality && item.quality !== 'Common' ? ` (${item.quality})` : ''}`).join(', ') : 'Empty';
    updatedString = updatedString.replace(/Inventory:.*?(?:\n|$)/, `Inventory: ${inventoryString}\n`);

    // Update Status (Stamina/Mana)
    updatedString = updatedString.replace(/Status:.*?\(STA: \d+\/\d+, MANA: \d+\/\d+\)/, `Status: Healthy (STA: ${character.currentStamina}/${character.maxStamina}, MANA: ${character.currentMana}/${character.maxMana})`);

    // Update Reputation
    const reputationString = Object.entries(character.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None';
    updatedString = updatedString.replace(/Reputation:.*?(?:\n|$)/, `Reputation: ${reputationString}\n`);

    // Update NPC Relationships
    const relationshipString = Object.entries(character.npcRelationships).map(([n, s]) => `${n}: ${s}`).join(', ') || 'None';
    updatedString = updatedString.replace(/NPC Relationships:.*?(?:\n|$)/, `NPC Relationships: ${relationshipString}\n`);

    // Update Class
    updatedString = updatedString.replace(/Class: .*?(?:\n|$)/, `Class: ${character.class}\n`);

    // Update Skill Stage
    const currentStage = character.skillTreeStage ?? 0;
    const stageName = currentStage >= 0 && character.skillTree && character.skillTree.stages.length > currentStage
        ? character.skillTree.stages[currentStage]?.stageName ?? `Stage ${currentStage}`
        : "Potential";
    const skillStageString = character.skillTree ? `${stageName} (Stage ${currentStage}/4)` : 'None';
    updatedString = updatedString.replace(/Skill Stage:.*?(?:\n|$)/, `Skill Stage: ${skillStageString}\n`);

    // Update Learned Skills
    const learnedSkillsString = character.learnedSkills.map(s => s.name).join(', ') || 'None';
    updatedString = updatedString.replace(/Learned Skills:.*?(?:\n|$)/, `Learned Skills: ${learnedSkillsString}\n`);

    // Note: Character description, traits, knowledge, background, stats, AI profile, and adventure settings
    // are usually part of the initial state or updated less frequently, so we might not need
    // to parse and replace them on every narration update unless explicitly changed by the AI.
    // If they *can* change, add similar replace logic here.

    return updatedString;
};
