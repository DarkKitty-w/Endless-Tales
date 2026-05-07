// src/context/game-state-utils.ts

import type { Character } from "../types/character-types";
import type { InventoryItem } from "../types/inventory-types";
import type { GameState, GameStateContext } from "../types/game-types";
import type { StoryLogEntry } from "../types/adventure-types";

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
        statusEffects: character.statusEffects?.map(e => ({ name: e.name, remainingTurns: e.remainingTurns })),
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

    // Build story log summary from recent entries (last 10 turns)
    const storyLogSummary = buildStoryLogSummary(storyLog.slice(-10));

    // Build character memory from traits, background, and key story events
    const characterMemory = character ? buildCharacterMemory(character, storyLog.slice(-10)) : undefined;

    // Build structured story state facts (locations, NPCs, objects)
    const storyStateFacts = buildStoryStateFacts(storyLog);

    return {
        turn: turnCount,
        character: characterContext,
        inventory: inventoryContext,
        adventureSettings: adventureSettingsContext,
        previousNarration,
        storyLogLength: storyLog.length,
        storyLogSummary,
        characterMemory,
        storyStateFacts,
        worldMap: state.worldMap,
    };
}

/**
 * Builds a concise summary of recent story events for AI context.
 * This helps maintain narrative continuity across turns.
 */
function buildStoryLogSummary(recentEntries: StoryLogEntry[]): string {
    if (recentEntries.length === 0) return 'No previous events.';
    
    const summaryLines: string[] = [];
    recentEntries.forEach((entry, index) => {
        const turnNum = Math.max(1, recentEntries.length - 10 + index + 1);
        // Extract first 100 chars of narration as summary
        const shortNarration = entry.narration.length > 100 
            ? entry.narration.substring(0, 100) + '...' 
            : entry.narration;
        summaryLines.push(`Turn ${turnNum}: ${shortNarration}`);
    });
    
    return summaryLines.join('\n');
}

/**
 * Builds a character memory section that includes personality traits,
 * background, and key events that demonstrate character personality.
 */
function buildCharacterMemory(character: Character, recentEntries: StoryLogEntry[]): string {
    const memoryLines: string[] = [];
    
    // Add personality traits
    memoryLines.push(`Personality Traits: ${character.traits.join(', ') || 'None'}`);
    memoryLines.push(`Background: ${character.background}`);
    
    // Add key knowledge
    if (character.knowledge.length > 0) {
        memoryLines.push(`Key Knowledge: ${character.knowledge.join(', ')}`);
    }
    
    // Add NPC relationships
    const relationships = Object.entries(character.npcRelationships);
    if (relationships.length > 0) {
        memoryLines.push(`NPC Relationships: ${relationships.map(([n, s]) => `${n} (${s})`).join(', ')}`);
    }
    
    // Add notable events from recent story that demonstrate personality
    const notableEvents = recentEntries
        .filter(entry => entry.updatedTraits && entry.updatedTraits.length > 0)
        .map(entry => {
            const traits = entry.updatedTraits!.join(', ');
            return `Demonstrated traits: ${traits}`;
        });
    
    if (notableEvents.length > 0) {
        memoryLines.push(`Recent Personality Demonstrations: ${notableEvents.join('; ')}`);
    }
    
    return memoryLines.join('\n');
}

/**
 * Builds structured story state facts from the entire story log.
 * Extracts key facts: locations visited, NPCs met, objects state.
 * This helps prevent narrative contradictions.
 */
function buildStoryStateFacts(storyLog: StoryLogEntry[]): string {
    if (storyLog.length === 0) return 'No established facts yet.';
    
    const facts: string[] = [];
    const locationsVisited = new Set<string>();
    const npcsMet = new Set<string>();
    const objectStates = new Map<string, string>(); // object -> state (locked, unlocked, etc.)
    
    // Extract state changes from story log entries
    storyLog.forEach(entry => {
        // Check for location changes in updatedGameState
        if (entry.updatedGameState) {
            // Extract location if present (format: "location: Forest of Shadows" or similar)
            const locationMatch = entry.updatedGameState.match(/location:\s*([^,\n]+)/i);
            if (locationMatch) {
                locationsVisited.add(locationMatch[1].trim());
            }
            
            // Track object states (doors, chests, etc.)
            const stateMatch = entry.updatedGameState.match(/(\w+(?:\s+\w+)?):\s*(locked|unlocked|open|closed|broken|repaired)/gi);
            if (stateMatch) {
                stateMatch.forEach((match: string) => {
                    const parts = match.match(/(\w+(?:\s+\w+)?):\s*(\w+)/i);
                    if (parts) {
                        objectStates.set(parts[1].trim(), parts[2].trim());
                    }
                });
            }
        }
        
        // Extract NPC mentions from narration (simple heuristic)
        const narration = entry.narration.toLowerCase();
        const npcMatches = narration.match(/(?:meet|met|talk to|spoke to|encountered)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g);
        if (npcMatches) {
            npcMatches.forEach(match => {
                const nameMatch = match.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)$/);
                if (nameMatch) {
                    npcsMet.add(nameMatch[1]);
                }
            });
        }
    });
    
    // Build facts string
    if (locationsVisited.size > 0) {
        facts.push(`Locations Visited: ${Array.from(locationsVisited).join(', ')}`);
    }
    
    if (npcsMet.size > 0) {
        facts.push(`NPCs Met: ${Array.from(npcsMet).join(', ')}`);
    }
    
    if (objectStates.size > 0) {
        const objectFacts = Array.from(objectStates.entries()).map(([obj, state]) => `${obj} (${state})`);
        facts.push(`Object States: ${objectFacts.join(', ')}`);
    }
    
    // Add recent narration as context
    const recentEntries = storyLog.slice(-5);
    if (recentEntries.length > 0) {
        facts.push(`Recent Events: ${recentEntries.map(e => e.narration.substring(0, 80)).join(' | ')}`);
    }
    
    return facts.length > 0 ? facts.join('\n') : 'No established facts yet.';
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
        const statusEffects = c.statusEffects || [];
        const statusEffectsText = statusEffects.length > 0 
          ? statusEffects.map(e => `${e.name} (${e.remainingTurns} turns remaining)`).join(', ') 
          : 'None';
        lines.push(`Status Effects: ${statusEffectsText}`);
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

    // Add Character Memory section for personality consistency
    if (ctx.characterMemory) {
        lines.push('');
        lines.push('**Character Memory (Maintain Personality Consistency):**');
        lines.push(ctx.characterMemory);
    }

    // Add Story State Facts to prevent narrative contradictions
    if (ctx.storyStateFacts) {
        lines.push('');
        lines.push('**Established Story Facts (DO NOT Contradict):**');
        lines.push(ctx.storyStateFacts);
    }

    // Add Story Log Summary for narrative continuity
    if (ctx.storyLogSummary) {
        lines.push('');
        lines.push('**Recent Story Summary (Last 10 Turns):**');
        lines.push(ctx.storyLogSummary);
    }

    return lines.join('\n');
}