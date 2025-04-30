// src/context/GameContext.tsx
"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useReducer, Dispatch } from "react";
import type { GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";
import type { NarrateAdventureOutput } from "@/ai/flows/narrate-adventure";

export type GameStatus =
  | "MainMenu"
  | "CharacterCreation"
  | "AdventureSetup"
  | "Gameplay"
  | "AdventureSummary";

// --- State Definition ---

export interface CharacterStats {
  strength: number;
  stamina: number;
  agility: number;
}

export interface Character {
  name: string;
  description: string; // User input description (basic combined or text-based)
  traits: string[]; // Array of traits
  knowledge: string[]; // Array of knowledge areas
  background: string; // Single background string
  stats: CharacterStats;
  aiGeneratedDescription?: GenerateCharacterDescriptionOutput['detailedDescription']; // Optional detailed description from AI
}

export interface AdventureSettings {
  adventureType: "Randomized" | "Custom" | null;
  permanentDeath: boolean;
  // Add custom parameters here if needed
  worldType?: string;
  mainQuestline?: string;
  difficulty?: string;
}

export interface GameState {
  status: GameStatus;
  character: Character | null;
  adventureSettings: AdventureSettings;
  currentNarration: NarrateAdventureOutput | null; // The very latest narration received
  storyLog: NarrateAdventureOutput[]; // Log of all narrations for summary/review
  adventureSummary: string | null;
  currentGameStateString: string; // Game state string for AI narration flow input
}

const initialCharacterState: Character = {
  name: "",
  description: "",
  traits: [],
  knowledge: [],
  background: "",
  stats: { strength: 5, stamina: 5, agility: 5 }, // Default starting stats
};

const initialState: GameState = {
  status: "MainMenu",
  character: null,
  adventureSettings: {
    adventureType: null,
    permanentDeath: true,
  },
  currentNarration: null,
  storyLog: [],
  adventureSummary: null,
  currentGameStateString: "The adventure is about to begin...", // Initial game state placeholder
};

// --- Action Definitions ---

type Action =
  | { type: "SET_GAME_STATUS"; payload: GameStatus }
  | { type: "CREATE_CHARACTER"; payload: Partial<Character> } // Accepts partial character data
  | { type: "UPDATE_CHARACTER"; payload: Partial<Character> }
  | { type: "SET_AI_DESCRIPTION"; payload: string } // Action specifically for AI description
  | { type: "SET_ADVENTURE_SETTINGS"; payload: Partial<AdventureSettings> }
  | { type: "START_GAMEPLAY" }
  | { type: "UPDATE_NARRATION"; payload: NarrateAdventureOutput }
  | { type: "END_ADVENTURE"; payload: { summary: string | null; finalNarration?: NarrateAdventureOutput } }
  | { type: "RESET_GAME" };

// --- Reducer ---

function gameReducer(state: GameState, action: Action): GameState {
  console.log(`Reducer Action: ${action.type}`, action); // Log actions for debugging
  switch (action.type) {
    case "SET_GAME_STATUS":
      return { ...state, status: action.payload };
    case "CREATE_CHARACTER":
      const newCharacter: Character = {
        ...initialCharacterState,
        ...action.payload,
         stats: action.payload.stats ? { ...initialCharacterState.stats, ...action.payload.stats } : initialCharacterState.stats,
         // Ensure arrays are always initialized
         traits: action.payload.traits ?? [],
         knowledge: action.payload.knowledge ?? [],
      };
      return {
        ...state,
        character: newCharacter,
        status: "AdventureSetup",
      };
    case "UPDATE_CHARACTER":
        if (!state.character) return state;
        return {
            ...state,
            character: { ...state.character, ...action.payload },
        };
    case "SET_AI_DESCRIPTION":
        if (!state.character) return state;
        return {
            ...state,
            character: { ...state.character, aiGeneratedDescription: action.payload },
        };
    case "SET_ADVENTURE_SETTINGS":
      return {
        ...state,
        adventureSettings: { ...state.adventureSettings, ...action.payload },
      };
    case "START_GAMEPLAY":
      if (!state.character || !state.adventureSettings.adventureType) {
        console.error("Cannot start gameplay: Missing character or adventure type.");
        return state; // Prevent starting gameplay without necessary info
      }
       const charDesc = state.character.aiGeneratedDescription || state.character.description || "No description provided.";
       const initialGameState = `Location: Starting Point\nInventory: Basic Clothes\nStatus: Healthy\nTime: Day 1, Morning\nQuest: None\nMilestones: None\nCharacter Name: ${state.character.name}\nTraits: ${state.character.traits.join(', ') || 'None'}\nKnowledge: ${state.character.knowledge.join(', ') || 'None'}\nBackground: ${state.character.background || 'None'}\nStats: STR ${state.character.stats.strength}, STA ${state.character.stats.stamina}, AGI ${state.character.stats.agility}\nDescription: ${charDesc}\nAdventure Mode: ${state.adventureSettings.adventureType}, ${state.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn'}`;
      return {
        ...state,
        status: "Gameplay",
        storyLog: [], // Clear previous log
        currentNarration: null, // Clear previous narration
        adventureSummary: null, // Clear previous summary
        currentGameStateString: initialGameState, // Set detailed initial state for AI
      };
    case "UPDATE_NARRATION":
      // Append the new narration+state object to the log
      const newLog = [...state.storyLog, action.payload];
      return {
        ...state,
        currentNarration: action.payload, // Update the latest narration
        storyLog: newLog, // Update the full log
        currentGameStateString: action.payload.updatedGameState, // Update the game state string for the next turn
      };
     case "END_ADVENTURE":
      // Optionally add the final narration to the log if provided
      const finalLog = action.payload.finalNarration
        ? [...state.storyLog, action.payload.finalNarration]
        : state.storyLog;
      return {
        ...state,
        status: "AdventureSummary",
        adventureSummary: action.payload.summary,
        storyLog: finalLog, // Save the full log for detailed view
      };
    case "RESET_GAME":
      return { ...initialState }; // Reset to main menu, clear everything
    default:
      return state;
  }
}

// --- Context and Provider ---

const GameContext = createContext<{ state: GameState; dispatch: Dispatch<Action> } | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

   // Log state changes for debugging
   useEffect(() => {
     console.log("Game State Changed:", state);
   }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

// --- Hook ---

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

// Effect hook for debugging (optional)
import { useEffect } from "react";
```

```
      );
    }
  }, [isLoading, isRollingDice, diceResult, storyLog, error]); // Add dependencies


  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">
        {/* Left Panel (Character & Map) - Fixed width, scrollable content */}
        <div className="hidden md:flex flex-col w-80 lg:w-96 p-4 border-r border-foreground/10 overflow-y-auto bg-card/50 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
             <CharacterDisplay />
             <WorldMapDisplay />
             {/* Actions at the bottom */}
             <div className="mt-auto space-y-2 pt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={isLoading}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Abandon Adventure
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Abandoning the adventure will end your current progress and return you to the main menu. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleGoBack} className="bg-destructive hover:bg-destructive/90">Abandon</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                 <Button variant="destructive" onClick={handleEndAdventure} className="w-full" disabled={isLoading}>
                     <BookCopy className="mr-2 h-4 w-4" /> End & Summarize
                 </Button>
             </div>
        </div>

        {/* Right Panel (Story & Input) - Flexible width, main interaction area */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Story Display Area */}
            <CardboardCard className="flex-1 flex flex-col overflow-hidden mb-4 border-2 border-foreground/20 shadow-inner">
                 <CardHeader className="py-3 px-4 border-b border-foreground/10">
                    <CardTitle className="text-lg font-semibold">Story Log</CardTitle>
                 </CardHeader>
                 <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full p-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" ref={scrollAreaViewportRef}>
                        {/* Render story log entries */}
                        {storyLog.map((log, index) => (
                            <div key={index} className="mb-4 pb-4 border-b border-foreground/10 last:border-b-0">
                                <p className="text-base whitespace-pre-wrap leading-relaxed text-foreground">{log.narration}</p>
                                {/* Optionally display game state changes for debugging */}
                                {/* <p className="text-xs text-muted-foreground mt-1 italic">State: {log.updatedGameState.substring(0, 100)}...</p> */}
                            </div>
                        ))}

                         {/* Render the dynamic content (loading, dice, error, initial prompt) */}
                         {renderDynamicContent()}

                         {/* Add invisible element to help scrolling */}
                          <div ref={scrollEndRef} />
                    </ScrollArea>
                 </CardContent>
            </CardboardCard>


             {/* Input Area */}
             <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-auto">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSuggestAction}
                    disabled={isLoading || isRollingDice}
                    aria-label="Suggest an action"
                    className="text-muted-foreground hover:text-accent"
                    title="Suggest Action"
                >
                    <Sparkles className="h-5 w-5" />
                </Button>
                <Input
                  type="text"
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  placeholder="What do you do next?"
                  disabled={isLoading || isRollingDice} // Disable input while loading or rolling
                  className="flex-1 text-base h-11"
                  aria-label="Player action input"
                  autoComplete="off"
                />
                <Button
                    type="submit"
                    disabled={isLoading || isRollingDice || !playerInput.trim()}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground h-11 px-5"
                    aria-label="Submit action"
                >
                   {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5" />}
                </Button>
             </form>

             {/* Buttons for smaller screens (Mobile View) */}
              <div className="md:hidden flex flex-col gap-2 mt-4 border-t pt-4">
                 {/* Optionally show a condensed character display on mobile */}
                 {/* <CharacterDisplay /> */}
                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                         <Button variant="outline" className="w-full" disabled={isLoading}>
                             <ArrowLeft className="mr-2 h-4 w-4" /> Abandon
                         </Button>
                     </AlertDialogTrigger>
                     <AlertDialogContent>
                         <AlertDialogHeader>
                             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                             <AlertDialogDescription>
                                 Abandoning the adventure will end your current progress and return you to the main menu.
                             </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                             <AlertDialogCancel>Cancel</AlertDialogCancel>
                             <AlertDialogAction onClick={handleGoBack} className="bg-destructive hover:bg-destructive/90">Abandon</AlertDialogAction>
                         </AlertDialogFooter>
                     </AlertDialogContent>
                 </AlertDialog>
                 <Button variant="destructive" onClick={handleEndAdventure} className="w-full" disabled={isLoading}>
                     <BookCopy className="mr-2 h-4 w-4" /> End Adventure
                 </Button>
             </div>
        </div>
    </div>
  );
}

// Add fade-in-out animation to tailwind config if not already present
// In tailwind.config.ts -> theme.extend.animation:
// 'fade-in-out': 'fadeInOut 2s ease-in-out forwards',
// In tailwind.config.ts -> theme.extend.keyframes:
// fadeInOut: {
//   '0%, 100%': { opacity: 0 },
//   '50%': { opacity: 1 },
// }

// Add scrollbar-thin plugin if needed:
// Install: npm install -D tailwind-scrollbar
// In tailwind.config.ts -> plugins:
// plugins: [require("tailwindcss-animate"), require('tailwind-scrollbar')],
```

```xml
<changes>
  <change>
    <file>src/ai/flows/narrate-adventure.ts</file>
    <description>Update narrateAdventure flow to handle dice roll results in playerChoice, enforce logical progression based on gameState, and provide clear instructions to the AI narrator regarding character abilities, restrictions, and consequences.</description>
    <content><![CDATA[// src/ai/flows/narrate-adventure.ts
'use server';
/**
 * @fileOverview A text adventure narration AI agent.
 *
 * - narrateAdventure - A function that handles the text adventure narration.
 * - NarrateAdventureInput - The input type for the narrateAdventure function.
 * - NarrateAdventureOutput - The return type for the narrateAdventure function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import type { CharacterStats } from '@/context/GameContext'; // Import CharacterStats type

// Define Zod schema for CharacterStats if not already imported elsewhere globally
const CharacterStatsSchema = z.object({
  strength: z.number().describe('Character strength attribute (typically 1-10 or similar scale).'),
  stamina: z.number().describe('Character stamina attribute (typically 1-10 or similar scale).'),
  agility: z.number().describe('Character agility attribute (typically 1-10 or similar scale).'),
});

const NarrateAdventureInputSchema = z.object({
  character: z.object({
    name: z.string().describe('Character name.'),
    description: z.string().describe('A brief description of the character (appearance, personality, backstory snippet).'),
    traits: z.array(z.string()).describe('List of character traits (e.g., Brave, Curious).'),
    knowledge: z.array(z.string()).describe('List of character knowledge areas (e.g., Magic, History).'),
    background: z.string().describe('Character background (e.g., Soldier, Royalty).'),
    stats: CharacterStatsSchema, // Use the defined stats schema
    aiGeneratedDescription: z.string().optional().describe('Optional detailed AI-generated character profile.'),
  }).describe('The player character details.'),
  playerChoice: z.string().describe('The player\'s chosen action or command. May include dice roll result like "(Dice Roll Result: 4)".'),
  gameState: z.string().describe('A string representing the current state of the game, including location, inventory, ongoing events, character progression milestones achieved, time, etc.'),
  previousNarration: z.string().optional().describe('The narration text immediately preceding the player\'s current choice, for context.'),
});
export type NarrateAdventureInput = z.infer<typeof NarrateAdventureInputSchema>;

const NarrateAdventureOutputSchema = z.object({
  narration: z.string().describe('The AI-generated narration describing the outcome of the action and the current situation.'),
  updatedGameState: z.string().describe('The updated state of the game string after the player action and narration, reflecting changes in location, inventory, character status, time, or achieved milestones.'),
});
export type NarrateAdventureOutput = z.infer<typeof NarrateAdventureOutputSchema>;

export async function narrateAdventure(input: NarrateAdventureInput): Promise<NarrateAdventureOutput> {
  return narrateAdventureFlow(input);
}

const narrateAdventurePrompt = ai.definePrompt({
  name: 'narrateAdventurePrompt',
  input: { schema: NarrateAdventureInputSchema },
  output: { schema: NarrateAdventureOutputSchema },
  prompt: `You are a dynamic and engaging AI narrator for the text-based adventure game, "Endless Tales". Your role is to weave a compelling story based on player choices, character attributes, and the established game world.

**Game Context:**
{{{gameState}}}

{{#if previousNarration}}
**Previous Scene:**
{{{previousNarration}}}
{{/if}}

**Player Character:**
Name: {{{character.name}}}
Stats: Strength {{{character.stats.strength}}}, Stamina {{{character.stats.stamina}}}, Agility {{{character.stats.agility}}}
Traits: {{#if character.traits}}{{#each character.traits}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Knowledge: {{#if character.knowledge}}{{#each character.knowledge}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
Background: {{{character.background}}}
Description: {{{character.description}}}
{{#if character.aiGeneratedDescription}}Detailed Profile: {{{character.aiGeneratedDescription}}}{{/if}}

**Player's Action:**
{{{playerChoice}}}

**Your Task:**
Generate the next part of the story based on ALL the information above.

1.  **React Dynamically:** Describe the outcome of the player's action. Consider their character's stats (strength, stamina, agility), traits, knowledge, and background. A strong character might succeed at physical tasks, a knowledgeable one might recall relevant lore, a brave one might face danger head-on.
2.  **Incorporate Dice Rolls:** If the Player's Action includes "(Dice Roll Result: N)", where N is a number from 1 to 6, interpret the outcome. A high roll (5-6) usually means success, possibly with a bonus. A low roll (1-2) suggests failure, complications, or negative consequences. A mid-roll (3-4) might mean partial success or success with a cost. Use the dice roll to add unpredictability to actions where chance is involved. If no dice roll is mentioned, determine the outcome based purely on context, character abilities, and game state logic.
3.  **Logical Progression & Restrictions:** Characters start with limited abilities. Prevent players from performing actions far beyond their current capabilities or the established world rules (e.g., instantly becoming king, controlling time early on, casting master-level spells without learning them). These powerful actions should only become possible *after* significant narrative progress, achieving specific milestones (like "Completed the Mage Tower Trial", "Found the Crown of Ages", "Gained Rank: Archmage" - which should be tracked in the gameState under Milestones). If the player attempts something unreasonable for their current state, narrate why it fails or is impossible *within the story*, referencing their lack of skill, knowledge, power, or the necessary game state conditions.
4.  **Consequences:** Actions have consequences. Decisions can alter the story, affect relationships with NPCs (implied or explicit), change the character's status (e.g., injured, poisoned, blessed), modify the game world, or consume resources. Reflect these consequences in the narration and the updated game state.
5.  **Update Game State:** Modify the 'gameState' string concisely to reflect all significant changes resulting from the player's action and the narration (e.g., new location, item acquired/lost, NPC mood change, time passed, quest progress updated, milestone achieved, status effects added/removed). Ensure the gameState string remains informative and parsable for future turns.
6.  **Tone:** Maintain a consistent tone suitable for a fantasy text adventure. Be descriptive and engaging. Avoid breaking character or addressing the player directly as a game master.

**Output Format:** Respond ONLY with the JSON object containing 'narration' and 'updatedGameState'. Ensure the JSON is valid.

Example Updated Game State: "Location: Whispering Caves - Chamber of Echoes\nInventory: Sword, Rope, Lantern (Oil Low), Mysterious Gem\nStatus: Healthy\nTime: Day 1, Afternoon\nQuest: Find the Lost Amulet (Progress: Following cave markings)\nMilestones: Solved Riddle Bridge\nNPCs: Goblin Trader (Met, Unfriendly)"
`,
});

const narrateAdventureFlow = ai.defineFlow<
  typeof NarrateAdventureInputSchema,
  typeof NarrateAdventureOutputSchema
>(
  {
    name: 'narrateAdventureFlow',
    inputSchema: NarrateAdventureInputSchema,
    outputSchema: NarrateAdventureOutputSchema,
  },
  async (input) => {
     // --- AI Call ---
     console.log("Sending to narrateAdventurePrompt:", JSON.stringify(input, null, 2)); // Log the input being sent
     const {output} = await narrateAdventurePrompt(input);

     // --- Validation & Fallback ---
     const narration = output?.narration?.trim();
     const updatedGameState = output?.updatedGameState?.trim();

     if (!narration || !updatedGameState) {
        console.error("AI narration output missing or invalid:", output);
        // Provide a safe fallback if AI fails
        return {
            narration: "The threads of fate seem momentarily tangled. You pause, considering your next move as the world holds its breath. (AI Error: Narration generation failed)",
            updatedGameState: input.gameState, // Return original game state on error
        };
     }

    console.log("Received from narrateAdventurePrompt:", JSON.stringify(output, null, 2));

    // Minimal check to ensure game state wasn't completely wiped or drastically altered inappropriately
    // More complex validation could be added if needed.
    if (updatedGameState.length < 20 || !updatedGameState.includes("Location:")) {
         console.warn("Potentially problematic updatedGameState received:", updatedGameState);
         // Optionally, revert to old game state or try to recover
         // For now, we'll allow it but log a warning.
    }


    return {
      narration: narration,
      updatedGameState: updatedGameState,
    };
  }
);
