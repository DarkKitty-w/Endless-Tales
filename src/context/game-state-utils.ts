// src/context/game-state-utils.ts

import type { Character } from "../types/character-types";
import type { InventoryItem } from "../types/inventory-types";
import type { GameState, GameStateContext } from "../types/game-types";

/**
 * Helper function to update the game state string with current character and inventory info.
 * (Legacy method – kept for backward compatibility)
 */
export const updateGameStateString = (
    baseString: string,
    character: Character | null,
    inventory: InventoryItem[],
    turn: number
): string => {
    if (!character) return baseString;

    let updatedString = baseString;
    updatedString = updatedString.replace(/Turn: \d+/, `Turn: ${turn}`);
    updatedString = updatedString.replace(/Level: \d+ \(\d+\/\d+ XP\)/, `Level: ${character.level} (${character.xp}/${character.xpToNextLevel} XP)`);

    const inventoryString = inventory.length > 0
        ? inventory.map(item => `${item.name}${item.quality && item.quality !== 'Common' ? ` (${item.quality})` : ''}`).join(', ')
        : 'Empty';
    updatedString = updatedString.replace(/Inventory:.*?(?:\n|$)/, `Inventory: ${inventoryString}\n`);

    updatedString = updatedString.replace(/Status:.*?\(STA: \d+\/\d+, MANA: \d+\/\d+\)/, `Status: Healthy (STA: ${character.currentStamina}/${character.maxStamina}, MANA: ${character.currentMana}/${character.maxMana})`);

    const reputationString = Object.entries(character.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None';
    updatedString = updatedString.replace(/Reputation:.*?(?:\n|$)/, `Reputation: ${reputationString}\n`);

    const relationshipString = Object.entries(character.npcRelationships).map(([n, s]) => `${n}: ${s}`).join(', ') || 'None';
    updatedString = updatedString.replace(/NPC Relationships:.*?(?:\n|$)/, `NPC Relationships: ${relationshipString}\n`);

    updatedString = updatedString.replace(/Class: .*?(?:\n|$)/, `Class: ${character.class}\n`);

    const currentStage = character.skillTreeStage ?? 0;
    const stageName = currentStage >= 0 && character.skillTree && character.skillTree.stages.length > currentStage
        ? character.skillTree.stages[currentStage]?.stageName ?? `Stage ${currentStage}`
        : "Potential";
    const skillStageString = character.skillTree ? `${stageName} (Stage ${currentStage}/4)` : 'None';
    updatedString = updatedString.replace(/Skill Stage:.*?(?:\n|$)/, `Skill Stage: ${skillStageString}\n`);

    const learnedSkillsString = character.learnedSkills.map(s => s.name).join(', ') || 'None';
    updatedString = updatedString.replace(/Learned Skills:.*?(?:\n|$)/, `Learned Skills: ${learnedSkillsString}\n`);

    return updatedString;
};

/**
 * Builds a structured GameStateContext from the current GameState.
 * This replaces the need for regex parsing in AI prompts.
 */
export function buildGameStateContext(state: GameState): GameStateContext {
    const { character, inventory, adventureSettings, storyLog, turnCount } = state;

    const characterContext: GameStateContext['character'] = character ? {
        name: character.name,
        class: character.class,
        level: character.level,
        xp: character.xp,
        xpToNextLevel: character.xpToNextLevel,
        stats: {
            strength: character.stats.strength,
            stamina: character.stats.stamina,
            wisdom: character.stats.wisdom,
        },
        health: { current: character.currentHealth, max: character.maxHealth },
        stamina: { current: character.currentStamina, max: character.maxStamina },
        mana: { current: character.currentMana, max: character.maxMana },
        traits: character.traits,
        knowledge: character.knowledge,
        background: character.background,
        description: character.description,
        aiGeneratedDescription: character.aiGeneratedDescription,
        reputation: character.reputation,
        npcRelationships: character.npcRelationships,
        skillTreeStage: character.skillTreeStage,
        skillTreeStageName: character.skillTree?.stages[character.skillTreeStage]?.stageName ?? 'Potential',
        learnedSkills: character.learnedSkills.map(s => s.name),
    } : null;

    const inventoryContext: GameStateContext['inventory'] = inventory.map(item => ({
        name: item.name,
        description: item.description,
        quality: item.quality,
        weight: item.weight,
        durability: item.durability,
        magicalEffect: item.magicalEffect,
    }));

    const adventureSettingsContext: GameStateContext['adventureSettings'] = {
        type: adventureSettings.adventureType,
        difficulty: adventureSettings.difficulty,
        permanentDeath: adventureSettings.permanentDeath,
        worldType: adventureSettings.worldType,
        mainQuestline: adventureSettings.mainQuestline,
        genreTheme: adventureSettings.genreTheme,
        magicSystem: adventureSettings.magicSystem,
        techLevel: adventureSettings.techLevel,
        dominantTone: adventureSettings.dominantTone,
        startingSituation: adventureSettings.startingSituation,
        combatFrequency: adventureSettings.combatFrequency,
        puzzleFrequency: adventureSettings.puzzleFrequency,
        socialFocus: adventureSettings.socialFocus,
        universeName: adventureSettings.universeName,
        playerCharacterConcept: adventureSettings.playerCharacterConcept,
        characterOriginType: adventureSettings.characterOriginType,
    };

    const previousNarration = storyLog.length > 0 ? storyLog[storyLog.length - 1].narration : undefined;

    return {
        turn: turnCount,
        character: characterContext,
        inventory: inventoryContext,
        adventureSettings: adventureSettingsContext,
        previousNarration,
        storyLogLength: storyLog.length,
    };
}

/**
 * Converts a GameStateContext into a human-readable string suitable for AI prompts.
 */
export function formatGameStateContextForPrompt(ctx: GameStateContext): string {
    const lines: string[] = [];

    lines.push(`Turn: ${ctx.turn}`);
    lines.push('');

    if (ctx.character) {
        const c = ctx.character;
        lines.push(`Character: ${c.name} (${c.class}), Level ${c.level} (XP: ${c.xp}/${c.xpToNextLevel})`);
        lines.push(`Stats: STR ${c.stats.strength}, STA ${c.stats.stamina}, WIS ${c.stats.wisdom}`);
        lines.push(`Health: ${c.health.current}/${c.health.max}, Action STA: ${c.stamina.current}/${c.stamina.max}, Mana: ${c.mana.current}/${c.mana.max}`);
        lines.push(`Traits: ${c.traits.join(', ') || 'None'}`);
        lines.push(`Knowledge: ${c.knowledge.join(', ') || 'None'}`);
        lines.push(`Background: ${c.background}`);
        lines.push(`Description: ${c.aiGeneratedDescription || c.description}`);
        lines.push(`Reputation: ${Object.entries(c.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None'}`);
        lines.push(`NPC Relationships: ${Object.entries(c.npcRelationships).map(([n, s]) => `${n}: ${s}`).join(', ') || 'None'}`);
        lines.push(`Skill Stage: ${c.skillTreeStageName} (Stage ${c.skillTreeStage}/4)`);
        lines.push(`Learned Skills: ${c.learnedSkills.join(', ') || 'None'}`);
    } else {
        lines.push('Character: None');
    }

    lines.push('');
    lines.push(`Inventory: ${ctx.inventory.map(i => `${i.name}${i.quality ? ` (${i.quality})` : ''}`).join(', ') || 'Empty'}`);
    lines.push('');

    const s = ctx.adventureSettings;
    lines.push(`Adventure Type: ${s.type}`);
    lines.push(`Difficulty: ${s.difficulty}, Permanent Death: ${s.permanentDeath}`);
    if (s.type === 'Custom') {
        lines.push(`World: ${s.worldType}, Main Quest: ${s.mainQuestline}`);
        lines.push(`Genre: ${s.genreTheme}, Magic: ${s.magicSystem}, Tech: ${s.techLevel}, Tone: ${s.dominantTone}`);
        lines.push(`Starting Situation: ${s.startingSituation}`);
        lines.push(`Combat Freq: ${s.combatFrequency}, Puzzle Freq: ${s.puzzleFrequency}, Social Focus: ${s.socialFocus}`);
    } else if (s.type === 'Immersed') {
        lines.push(`Universe: ${s.universeName}, Character Concept: ${s.playerCharacterConcept}, Origin: ${s.characterOriginType}`);
    }

    if (ctx.previousNarration) {
        lines.push('');
        lines.push(`Previous Narration: ${ctx.previousNarration}`);
    }

    return lines.join('\n');
}