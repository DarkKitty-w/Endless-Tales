/**
 * @fileOverview Shared context formatting utilities for AI prompts.
 * Provides functions to format game state, character info, and other context
 * into strings that can be injected into AI prompts.
 */

import type { Character, GameStateContext } from '../../types/game-types';
import type { AdventureSettings } from '../../types/adventure-types';

/**
 * Formats character information for AI prompts
 */
export function formatCharacterContext(character: Character): string {
  const lines: string[] = [];
  
  lines.push(`Name: ${character.name}`);
  lines.push(`Class: ${character.class}`);
  lines.push(`Level: ${character.level}`);
  lines.push(`HP: ${character.stats.health}/${character.stats.maxHealth}`);
  lines.push(`MP: ${character.stats.mana}/${character.stats.maxMana}`);
  lines.push(`Stamina: ${character.stats.stamina}/${character.stats.maxStamina}`);
  
  if (character.traits && character.traits.length > 0) {
    lines.push(`Traits: ${character.traits.join(', ')}`);
  }
  
  if (character.background) {
    lines.push(`Background: ${character.background}`);
  }
  
  if (character.knowledge && character.knowledge.length > 0) {
    lines.push(`Knowledge: ${character.knowledge.join(', ')}`);
  }
  
  if (character.learnedSkills && character.learnedSkills.length > 0) {
    lines.push(`Available Skills: ${character.learnedSkills.join(', ')}`);
  }
  
  return lines.join('\n');
}

/**
 * Formats inventory for AI prompts
 */
export function formatInventoryContext(inventory: Array<{ name: string; quantity: number; description?: string }>): string {
  if (!inventory || inventory.length === 0) return 'Inventory: Empty';
  
  const items = inventory.map(item => {
    let str = `${item.name} (x${item.quantity})`;
    if (item.description) str += ` - ${item.description}`;
    return str;
  });
  
  return `Inventory:\n${items.join('\n')}`;
}

/**
 * Formats NPC relationships for AI prompts
 */
export function formatRelationshipsContext(npcRelationships: Record<string, string>): string {
  const entries = Object.entries(npcRelationships);
  if (entries.length === 0) return 'NPC Relationships: None';
  
  const formatted = entries.map(([npc, status]) => `${npc}: ${status}`).join(', ');
  return `NPC Relationships: ${formatted}`;
}

/**
 * Formats adventure settings for AI prompts
 */
export function formatAdventureSettings(settings: AdventureSettings): string {
  const lines: string[] = [];
  
  lines.push(`Difficulty: ${settings.difficulty}`);
  if (settings.permadeath) lines.push('PERMANENT DEATH MODE: ENABLED - Character death is permanent!');
  if (settings.allowPVP) lines.push('PVP: Enabled');
  if (settings.multiplayer) lines.push('Multiplayer: Enabled');
  
  return lines.join('\n');
}

/**
 * Formats story state summary for AI prompts
 */
export function formatStorySummary(storySummary: string): string {
  if (!storySummary || storySummary === 'No established facts yet.') {
    return 'Story State: Beginning of adventure. No established facts yet.';
  }
  return `Story State Summary (Last 10 Turns):\n${storySummary}`;
}

/**
 * Builds a complete game context string from GameStateContext
 * This is the main function to use when building prompts for narrate-adventure
 */
export function buildGameContextForPrompt(gameState: GameStateContext): string {
  const parts: string[] = [];
  
  // Character info
  parts.push('=== CHARACTER ===');
  parts.push(formatCharacterContext(gameState.character));
  
  // Inventory
  if (gameState.inventory && gameState.inventory.length > 0) {
    parts.push('\n=== INVENTORY ===');
    parts.push(formatInventoryContext(gameState.inventory));
  }
  
  // NPC Relationships
  if (gameState.character.npcRelationships && 
      Object.keys(gameState.character.npcRelationships).length > 0) {
    parts.push('\n=== NPC RELATIONSHIPS ===');
    parts.push(formatRelationshipsContext(gameState.character.npcRelationships));
  }
  
  // Adventure settings
  if (gameState.adventureSettings) {
    parts.push('\n=== ADVENTURE SETTINGS ===');
    parts.push(formatAdventureSettings(gameState.adventureSettings));
  }
  
  // Story summary
  if (gameState.storyLogSummary) {
    parts.push('\n=== STORY STATE ===');
    parts.push(formatStorySummary(gameState.storyLogSummary));
  }
  
  // Character memory (personality and key events)
  if (gameState.characterMemory) {
    parts.push('\n=== CHARACTER MEMORY ===');
    parts.push(gameState.characterMemory);
  }
  
  return parts.join('\n');
}
