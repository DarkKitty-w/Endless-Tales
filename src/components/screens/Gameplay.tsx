
// src/components/screens/Gameplay.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { GameState, Character, SkillTree, Reputation, NpcRelationships } from '@/types/game-types';
import type { StoryLogEntry, InventoryItem, DifficultyLevel as AssessedDifficultyLevel, AdventureSettings } from '@/types/adventure-types';
import type { Skill } from '@/types/character-types';
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/use-toast";
import { calculateXpToNextLevel } from "@/lib/gameUtils";
import { narrateAdventure, type NarrateAdventureInput, type NarrateAdventureOutput } from "@/ai/flows/narrate-adventure";
import { summarizeAdventure } from "@/ai/flows/summarize-adventure";
import { assessActionDifficulty, type AssessActionDifficultyInput } from "@/ai/flows/assess-action-difficulty";
import { generateSkillTree } from "@/ai/flows/generate-skill-tree";
import { attemptCrafting, type AttemptCraftingInput, type AttemptCraftingOutput } from "@/ai/flows/attempt-crafting";

import { Loader2, Settings, ArrowLeft, Skull, Save, Info, Dices, Hammer, BookCopy, CalendarClock, GitBranch } from "lucide-react";
import { SettingsPanel } from "@/components/screens/SettingsPanel";
import { LeftPanel } from "@/components/game/LeftPanel";
import { NarrationDisplay } from '@/components/gameplay/NarrationDisplay';
import { ActionInput } from '@/components/gameplay/ActionInput';
import { GameplayActions } from '@/components/gameplay/GameplayActions';
import { CraftingDialog } from '@/components/gameplay/CraftingDialog';
import { ClassChangeDialog } from '@/components/gameplay/ClassChangeDialog';
import { MobileSheet } from '@/components/gameplay/MobileSheet';
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";


// --- Dice Roller Service (Embedded) ---
const localRollDie = (sides: number): number => {
    if (sides < 1) throw new Error("Sides must be at least 1.");
    return Math.floor(Math.random() * sides) + 1;
};
const localGetDiceRollFunction = (diceType: string): (() => number) | null => {
    switch (diceType?.toLowerCase()) {
        case 'd6': return () => localRollDie(6);
        case 'd10': return () => localRollDie(10);
        case 'd20': return () => localRollDie(20);
        case 'd100': return () => localRollDie(100);
        case 'none': default: return null;
    }
};
// --- End Dice Roller Service ---

// Helper function to process developer commands
function processDevCommand(input: {
    character: Character;
    playerChoice: string;
    gameState: string;
    adventureSettings: AdventureSettings;
    turnCount: number;
}): NarrateAdventureOutput {
    let devNarration = `(Developer Mode) Player chose: "${input.playerChoice}".`;
    const command = input.playerChoice.trim().toLowerCase();
    const parts = command.split(' ');
    const baseCommand = parts[0];
    const value = parts.length > 1 ? parts.slice(1).join(' ') : undefined;

    let xpGained: number | undefined;
    let progressedToStage: number | undefined;
    let healthChange: number | undefined;
    let updatedTraits: string[] | undefined;
    let updatedKnowledge: string[] | undefined;
    let gainedSkill: Skill | undefined;
    let reputationChange: { faction: string, change: number } | undefined;
    let npcRelationshipChange: { npcName: string, change: number } | undefined;
    // Add other fields as needed for dev commands

    if (baseCommand === '/xp' && value) {
        const amount = parseInt(value, 10);
        if (!isNaN(amount)) { xpGained = amount; devNarration += ` Granted ${amount} XP.`; }
        else { devNarration += " - Invalid XP amount."; }
    } else if (baseCommand === '/stage' && value) {
        const stageNum = parseInt(value, 10);
        if (!isNaN(stageNum) && stageNum >= 0 && stageNum <= 4) { progressedToStage = stageNum; devNarration += ` Set skill stage to ${stageNum}.`; }
        else { devNarration += " - Invalid stage number (0-4)."; }
    } else if (baseCommand === '/additem' && value) {
        devNarration += ` Attempted to add item: ${value}. (Dev command: Dispatch ADD_ITEM externally if complex)`;
        // For direct handling: you might need to return an inventory update
    } else if (baseCommand === '/removeitem' && value) {
        devNarration += ` Attempted to remove item: ${value}. (Dev command: Dispatch REMOVE_ITEM externally if complex)`;
    } else if (baseCommand === '/health' && value) {
        const amount = parseInt(value, 10);
        if (!isNaN(amount)) { healthChange = amount; devNarration += ` Changed health by ${amount}.`; }
        else { devNarration += " - Invalid health amount."; }
    } else if (baseCommand === '/addtrait' && value) {
        updatedTraits = [...(input.character.traits || []), value];
        devNarration += ` Added trait: ${value}.`;
    } else if (baseCommand === '/addknowledge' && value) {
        updatedKnowledge = [...(input.character.knowledge || []), value];
        devNarration += ` Added knowledge: ${value}.`;
    } else if (baseCommand === '/addskill' && value) {
        gainedSkill = { name: value, description: "Developer added skill", type: "Learned" };
        devNarration += ` Added skill: ${value}.`;
    } else {
        devNarration += " Action processed in developer mode. Restrictions bypassed.";
    }

    return {
        narration: devNarration,
        updatedGameState: `${input.gameState} (Dev Action: ${input.playerChoice}, Turn: ${input.turnCount + 1})`,
        xpGained,
        progressedToStage,
        healthChange,
        updatedTraits,
        updatedKnowledge,
        gainedSkill,
        reputationChange,
        npcRelationshipChange,
    };
}


export function Gameplay() {
    const { state, dispatch } = useGame();
    const { toast } = useToast();
    const {
        character, currentNarration, currentGameStateString, storyLog,
        adventureSettings, inventory, currentAdventureId,
        isGeneratingSkillTree: contextIsGeneratingSkillTree,
        turnCount
    } = state;

    const [isLoading, setIsLoading] = useState(false); // For subsequent AI calls
    const [isEnding, setIsEnding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAssessingDifficulty, setIsAssessingDifficulty] = useState(false);
    const [isRollingDice, setIsRollingDice] = useState(false);
    const [isCraftingLoading, setIsCraftingLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true); // Specifically for first narration
    const [localIsGeneratingSkillTree, setLocalIsGeneratingSkillTree] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [diceType, setDiceType] = useState<string>("None");
    const [pendingClassChange, setPendingClassChange] = useState<string | null>(null);
    const [branchingChoices, setBranchingChoices] = useState<NarrateAdventureOutput['branchingChoices']>([]);
    const [isCraftingDialogOpen, setIsCraftingDialogOpen] = useState(false);
    const [isDesktopSettingsOpen, setIsDesktopSettingsOpen] = useState(false);

    const isMobile = useIsMobile();

     useEffect(() => {
        // Sync local skill tree loading state with context
        if (contextIsGeneratingSkillTree && !localIsGeneratingSkillTree) {
            setLocalIsGeneratingSkillTree(true);
        } else if (!contextIsGeneratingSkillTree && localIsGeneratingSkillTree) {
            setLocalIsGeneratingSkillTree(false);
        }
    }, [contextIsGeneratingSkillTree, localIsGeneratingSkillTree]);

    const triggerSkillTreeGeneration = useCallback(async (charClass: string | undefined) => {
        if (!charClass || adventureSettings.adventureType === "Immersed") {
            if (adventureSettings.adventureType === "Immersed") {
                dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
                 setLocalIsGeneratingSkillTree(false); // Ensure local state matches
            }
            return;
        }
        if (character && character.skillTree && character.skillTree.className === charClass) {
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
            setLocalIsGeneratingSkillTree(false); // Ensure local state matches
            return;
        }
        
        console.log("Gameplay: Triggering skill tree generation for class:", charClass);
        setLocalIsGeneratingSkillTree(true); // Set local state
        dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true }); // Set context state
        setError(null);
        toast({ title: "Generating Skill Tree...", description: `Crafting abilities for the ${charClass} class...`, duration: 2000 });
        try {
            const skillTreeResult = await generateSkillTree({ characterClass: charClass });
            dispatch({ type: "SET_SKILL_TREE", payload: { class: charClass, skillTree: skillTreeResult } });
            toast({ title: "Skill Tree Generated!", description: `The path of the ${charClass} is set.` });
        } catch (err: any) {
            console.error("Gameplay: Failed to generate skill tree:", err);
            setError(`Skill Tree Error: ${err.message}. Using default progression.`);
            toast({ title: "Skill Tree Error", description: "Could not generate skill tree. Proceeding without class-specific skills.", variant: "destructive" });
        } finally {
            console.log("Gameplay: Skill tree generation process finished.");
            setLocalIsGeneratingSkillTree(false); // Reset local state
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false }); // Reset context state
        }
    }, [dispatch, toast, adventureSettings.adventureType, character]);


    const handleEndAdventure = useCallback(async (finalNarrationEntry?: StoryLogEntry, characterIsDefeated = false) => {
        if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || localIsGeneratingSkillTree || isCraftingLoading) return;
        console.log("Gameplay: Initiating end adventure. Defeated:", characterIsDefeated);
        setIsEnding(true);
        setError(null);
        toast({ title: characterIsDefeated ? "Character Defeated" : "Ending Adventure", description: "Summarizing your tale..." });

        const finalLogToSummarize = [...storyLog];
        if (finalNarrationEntry && (!storyLog.length || storyLog[storyLog.length - 1].narration !== finalNarrationEntry.narration)) {
            finalLogToSummarize.push(finalNarrationEntry);
        }
        let summary = characterIsDefeated ? "Your character has been defeated." : "Your adventure has concluded.";
        const hasLog = finalLogToSummarize.length > 0;

        if (hasLog) {
            const fullStory = finalLogToSummarize.map((log, index) => `[Turn ${index + 1}]\n${log.narration}`).join("\n\n---\n\n");
            if (fullStory.trim().length > 0) {
                try {
                    const summaryResult = await summarizeAdventure({ story: fullStory });
                    summary = summaryResult.summary;
                    toast({ title: "Summary Generated", description: "View your adventure outcome." });
                } catch (summaryError: any) {
                    console.error("Gameplay: Summarize adventure error:", summaryError);
                    summary = `Could not generate a summary due to an error: ${summaryError.message || 'Unknown error'}. ${summary}`;
                    toast({ title: "Summary Error", description: "Failed to generate summary.", variant: "destructive" });
                }
            }
        }
        dispatch({ type: "END_ADVENTURE", payload: { summary, finalNarration: finalNarrationEntry } });
    }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, localIsGeneratingSkillTree, storyLog, dispatch, toast, isCraftingLoading]);


    const handlePlayerAction = useCallback(async (action: string, isInitialAction = false) => {
        if (!character) {
            toast({ title: "Error", description: "Character data is missing.", variant: "destructive" });
             if (isInitialAction) setIsInitialLoading(false); // Ensure initial loading flag is cleared
            return;
        }
        if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || localIsGeneratingSkillTree || isCraftingLoading) {
            let reason = "Please wait for the current action to complete.";
            if (localIsGeneratingSkillTree) reason = "Please wait for skill tree generation to finish.";
            toast({ description: reason, variant: "default", duration: 1500 });
            return;
        }
        console.log(`Gameplay: Handling player action: "${action}", Initial: ${isInitialAction}`);
        
        if (isInitialAction) {
            setIsInitialLoading(true); // Set specifically for the first action
        }
        setIsLoading(true); // General loading for any action
        setError(null); setDiceResult(null); setDiceType("None"); setBranchingChoices([]);
        
        let actionWithDice = action;
        let assessedDifficulty: AssessedDifficultyLevel = "Normal";
        let requiresRoll = false;
        let rollFunction: (() => number) | null = null;

        const actionLower = action.trim().toLowerCase();
        const isPassiveAction = ["look", "look around", "check inventory", "check status", "check relationships", "check reputation"].includes(actionLower);

        try {
            if (character.class === 'admin000') {
                const devOutput = processDevCommand({character, playerChoice: action, gameState: currentGameStateString, adventureSettings, turnCount});
                dispatch({ type: "UPDATE_NARRATION", payload: { narration: devOutput.narration, updatedGameState: devOutput.updatedGameState, timestamp: Date.now(), ...devOutput } });
                if(devOutput.xpGained) dispatch({type: 'GRANT_XP', payload: devOutput.xpGained});
                if(devOutput.progressedToStage !== undefined) dispatch({type: 'PROGRESS_SKILL_STAGE', payload: devOutput.progressedToStage});
                if(devOutput.healthChange && character) dispatch({type: 'UPDATE_CHARACTER', payload: {currentHealth: Math.max(0, Math.min(character.maxHealth, character.currentHealth + devOutput.healthChange)) }})
                return; // Exits early for dev commands
            }

            if (!isInitialAction && !isPassiveAction) {
                setIsAssessingDifficulty(true);
                toast({ title: "Assessing Challenge...", duration: 1000 });
                await new Promise(resolve => setTimeout(resolve, 150)); // Simulate AI thought
                const repString = character.reputation ? Object.entries(character.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None' : 'None';
                const relString = character.npcRelationships ? Object.entries(character.npcRelationships).map(([n, s]) => `${n}: ${s}`).join(', ') || 'None' : 'None';
                const capabilitiesSummary = `Lvl: ${character.level}. Class: ${character.class}. Stage: ${character.skillTreeStage}. Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, WIS ${character.stats.wisdom}. Health: ${character.currentHealth}/${character.maxHealth}. Action STA: ${character.currentStamina}/${character.maxStamina}. Mana: ${character.currentMana}/${character.maxMana}. Traits: ${character.traits.join(', ') || 'None'}. Knowledge: ${character.knowledge.join(', ') || 'None'}. Background: ${character.background}. Inventory: ${inventory.map(i => i.name).join(', ') || 'Empty'}. Learned Skills: ${character.learnedSkills.map(s => s.name).join(', ') || 'None'}. Rep: ${repString}. Rel: ${relString}`;
                const assessmentInput: AssessActionDifficultyInput = {
                    playerAction: action, characterCapabilities: capabilitiesSummary, characterClass: character.class,
                    currentSituation: currentNarration?.narration || "At the beginning of the scene.",
                    gameStateSummary: currentGameStateString, gameDifficulty: adventureSettings.difficulty, turnCount: turnCount,
                };
                const assessmentResult = await assessActionDifficulty(assessmentInput);
                setIsAssessingDifficulty(false);
                assessedDifficulty = assessmentResult.difficulty;
                setDiceType(assessmentResult.suggestedDice);
                rollFunction = localGetDiceRollFunction(assessmentResult.suggestedDice);
                requiresRoll = assessedDifficulty !== "Trivial" && assessedDifficulty !== "Impossible" && rollFunction !== null;
                toast({ title: `Difficulty: ${assessedDifficulty}`, description: assessmentResult.reasoning.substring(0, 100), duration: 1500 });
                await new Promise(resolve => setTimeout(resolve, 200));
                if (assessedDifficulty === "Impossible") {
                    setError(`Action seems impossible: ${assessmentResult.reasoning} Try something else.`);
                    toast({ title: "Action Impossible", description: assessmentResult.reasoning, variant: "destructive", duration: 4000 });
                    return; // Exits early
                }
            } else {
                requiresRoll = false; assessedDifficulty = "Trivial"; setDiceType("None");
            }

            if (requiresRoll && rollFunction) {
                setIsRollingDice(true);
                toast({ title: `Rolling ${diceType}...`, duration: 1000 });
                await new Promise(resolve => setTimeout(resolve, 200));
                const roll = rollFunction();
                setDiceResult(roll);
                const numericDiceType = parseInt(diceType.substring(1), 10);
                if (!isNaN(numericDiceType) && numericDiceType > 0) {
                     actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll Result: ${roll}/${numericDiceType})`;
                } else { actionWithDice += ` (Difficulty: ${assessedDifficulty}, Roll: ${roll})`; }
                await new Promise(resolve => setTimeout(resolve, 100)); // Short pause for UI update
                setIsRollingDice(false);
                await new Promise(resolve => setTimeout(resolve, 1400)); // Keep dice result visible
                setDiceResult(null); // Clear dice result after visibility period
            } else if (!isPassiveAction && assessedDifficulty !== "Impossible" && diceType !== 'None') {
                actionWithDice += ` (Difficulty: ${assessedDifficulty}, No Roll Required)`;
            }

            let skillTreeSummaryForAI = null;
            if (character.skillTree && character.skillTreeStage >= 0) {
                const currentStageData = character.skillTree.stages.find(s => s.stage === character.skillTreeStage);
                skillTreeSummaryForAI = {
                    className: character.skillTree.className, stageCount: character.skillTree.stages.length,
                    availableSkillsAtCurrentStage: currentStageData ? currentStageData.skills.map(s => s.name) : [],
                };
            }

            const reputationString = character.reputation ? JSON.stringify(character.reputation) : "";
            const npcRelationshipsString = character.npcRelationships ? JSON.stringify(character.npcRelationships) : "";

            const inputForAI: NarrateAdventureInput = {
                character: {
                    name: character.name, class: character.class, description: character.description,
                    traits: character.traits, knowledge: character.knowledge, background: character.background,
                    stats: character.stats, currentHealth: character.currentHealth, maxHealth: character.maxHealth,
                    currentStamina: character.currentStamina, maxStamina: character.maxStamina,
                    currentMana: character.currentMana, maxMana: character.maxMana,
                    level: character.level, xp: character.xp, xpToNextLevel: character.xpToNextLevel,
                    reputationString, npcRelationshipsString, skillTreeSummary: skillTreeSummaryForAI,
                    skillTreeStage: character.skillTreeStage, learnedSkills: character.learnedSkills.map(s => s.name),
                    aiGeneratedDescription: character.aiGeneratedDescription,
                },
                playerChoice: actionWithDice, gameState: currentGameStateString,
                previousNarration: storyLog.length > 0 ? storyLog[storyLog.length - 1].narration : undefined,
                adventureSettings: adventureSettings, turnCount: turnCount,
                isCustomAdventure: adventureSettings.adventureType === "Custom",
                isRandomizedAdventure: adventureSettings.adventureType === "Randomized",
                isImmersedAdventure: adventureSettings.adventureType === "Immersed",
            };

            let retryCount = 0; const maxRetries = 2; let narrationResult: NarrateAdventureOutput | null = null;
            while (retryCount <= maxRetries && !narrationResult) {
                try {
                    const result = await narrateAdventure(inputForAI);
                    if (!result || !result.narration || !result.updatedGameState) throw new Error("AI response missing critical narration or game state.");
                    if (!result.updatedGameState.toLowerCase().includes('turn:')) {
                         result.updatedGameState = `${result.updatedGameState}\nTurn: ${turnCount + 1}`;
                    }
                    narrationResult = result; setError(null);
                } catch (err: any) {
                    const errorMessage = err.message || "The story encountered an unexpected snag.";
                    console.error(`Gameplay: AI Narration Error (Attempt ${retryCount + 1}/${maxRetries + 1}):`, err);
                    setError(`AI Error: ${errorMessage.substring(0,100)}...`);
                    toast({ title: "AI Error", description: `${errorMessage.substring(0, 60)}... ${retryCount < maxRetries ? 'Retrying...' : 'Failed.'}`, variant: "destructive"});
                    if (retryCount >= maxRetries) {
                        setError(`Narration failed after ${maxRetries + 1} attempts: ${errorMessage}. Try a different action or wait a moment.`);
                        toast({ title: "Narration Failed", description: "Please try a different action.", variant: "destructive", duration: 5000 });
                        return; // Exits early
                    }
                    retryCount++; await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }

            if (narrationResult) {
                 dispatch({ type: "UPDATE_NARRATION", payload: { ...narrationResult, timestamp: Date.now() } });
                setBranchingChoices(narrationResult.branchingChoices ?? []);
                if (narrationResult.dynamicEventTriggered) toast({ title: "Dynamic Event!", description: narrationResult.dynamicEventTriggered, duration: 4000, className: "border-purple-500" });
                if (narrationResult.xpGained && narrationResult.xpGained > 0) toast({ title: `Gained ${narrationResult.xpGained} XP!`, duration: 3000, className: "bg-yellow-100 dark:bg-yellow-900 border-yellow-500" });
                if (narrationResult.reputationChange) { const { faction, change } = narrationResult.reputationChange; const dir = change > 0 ? 'increased' : 'worsened'; toast({ title: `Reputation with ${faction} ${dir} by ${Math.abs(change)}!`, duration: 3000 }); }
                if (narrationResult.npcRelationshipChange) { const { npcName, change } = narrationResult.npcRelationshipChange; const dir = change > 0 ? 'improved' : 'worsened'; toast({ title: `Relationship with ${npcName} ${dir} by ${Math.abs(change)}!`, duration: 3000 }); }
                if (narrationResult.progressedToStage && narrationResult.progressedToStage > character.skillTreeStage) {
                     const stageName = character.skillTree?.stages.find(s => s.stage === narrationResult!.progressedToStage)?.stageName || `Stage ${narrationResult.progressedToStage}`;
                     toast({ title: "Skill Stage Increased!", description: `You've reached ${stageName} (Stage ${narrationResult.progressedToStage})!`, duration: 4000, className: "bg-purple-100 dark:bg-purple-900 border-purple-500" });
                }
                 if (narrationResult.gainedSkill) toast({ title: "Skill Learned!", description: `You gained: ${narrationResult.gainedSkill.name}!`, duration: 4000 });
                 if (narrationResult.suggestedClassChange && narrationResult.suggestedClassChange !== character.class && adventureSettings.adventureType !== "Immersed") setPendingClassChange(narrationResult.suggestedClassChange);

                if (narrationResult.isCharacterDefeated) {
                    if (adventureSettings.permanentDeath) {
                        await handleEndAdventure({ ...narrationResult, timestamp: Date.now() }, true);
                    } else {
                        dispatch({ type: "RESPAWN_CHARACTER", payload: { narrationMessage: `${character.name} was defeated but managed to escape death's grasp this time!` } });
                        toast({ title: "Defeated!", description: "You narrowly escaped death! Your health and resources are restored.", variant: "destructive", duration: 5000 });
                    }
                }
            }
        } catch (err: any) {
            console.error("Gameplay: Uncaught error in handlePlayerAction:", err);
            setError(`An unexpected error occurred: ${err.message}`);
            toast({title: "Unexpected Error", description: "Something went wrong processing your action.", variant: "destructive"});
        } finally {
            setIsLoading(false);
            if (isInitialAction) {
                setIsInitialLoading(false); // Crucial for clearing initial skeleton
            }
            if (isAssessingDifficulty) setIsAssessingDifficulty(false);
            if (isRollingDice) setIsRollingDice(false);
        }
    }, [
        character, inventory, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice,
        localIsGeneratingSkillTree, currentGameStateString, currentNarration, storyLog, adventureSettings, turnCount,
        dispatch, toast, handleEndAdventure, isCraftingLoading
    ]);

    const handleSaveGame = useCallback(async () => {
        if (isLoading || isEnding || isSaving || !currentAdventureId || !character) return;
        setIsSaving(true); toast({ title: "Saving Progress..." }); await new Promise(resolve => setTimeout(resolve, 500));
        try {
            dispatch({ type: "SAVE_CURRENT_ADVENTURE" });
            toast({ title: "Game Saved!", description: `Progress for "${character.name}" saved.`, variant: "default" });
        } catch (err) {
             console.error("Gameplay: Save game error:", err);
            toast({ title: "Save Failed", description: "Could not save progress.", variant: "destructive" });
        } finally { setIsSaving(false); }
    }, [dispatch, toast, isLoading, isEnding, isSaving, currentAdventureId, character]);

    const handleCrafting = useCallback(async (goal: string, ingredients: string[]) => {
        if (!character) return;
        setIsCraftingLoading(true); toast({ title: "Attempting to craft...", description: `Trying to make: ${goal}` });
        const inventoryListNames = inventory.map(item => item.name);
        const skills = character.learnedSkills.map(s => s.name);
        const craftingInput: AttemptCraftingInput = {
            characterKnowledge: character.knowledge, characterSkills: skills, inventoryItems: inventoryListNames,
            desiredItem: goal, usedIngredients: ingredients,
        };
        try {
            const result: AttemptCraftingOutput = await attemptCrafting(craftingInput);
            toast({ title: result.success ? "Crafting Successful!" : "Crafting Failed!", description: result.message, variant: result.success ? "default" : "destructive", duration: 5000 });
            let narrationText = `You attempted to craft ${goal} using ${ingredients.join(', ')}. ${result.message}`;
            if (result.success && result.craftedItem) {
                narrationText = `You successfully crafted a ${result.craftedItem.quality ? result.craftedItem.quality + ' ' : ''}${result.craftedItem.name}! ${result.message}`;
            }
             dispatch({ type: 'UPDATE_CRAFTING_RESULT', payload: { narration: narrationText, consumedItems: result.consumedItems, craftedItem: result.success ? result.craftedItem : null, newGameStateString: currentGameStateString }});
             setIsCraftingDialogOpen(false);
        } catch (err: any) {
             console.error("Gameplay: Crafting error:", err);
            let userFriendlyError = `Crafting attempt failed. Please try again later.`;
             if (err.message?.includes('400 Bad Request')) userFriendlyError = "Crafting failed: Invalid materials or combination?";
             else if (err.message) userFriendlyError = `Crafting Error: ${err.message.substring(0, 100)}`;
            toast({ title: "Crafting Error", description: userFriendlyError, variant: "destructive" });
             setIsCraftingDialogOpen(false); // Close dialog on error too
        } finally { setIsCraftingLoading(false); }
    }, [character, inventory, dispatch, toast, currentGameStateString]);

     const handleConfirmClassChange = useCallback(async (newClass: string) => {
         if (!character || !newClass || localIsGeneratingSkillTree || adventureSettings.adventureType === "Immersed") return; // Prevent for Immersed
         setPendingClassChange(null);
         
         toast({ title: `Becoming a ${newClass}...`, description: "Generating new skill path...", duration: 2000 });
         try {
            setLocalIsGeneratingSkillTree(true);
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true });
             const newSkillTree = await generateSkillTree({ characterClass: newClass });
             dispatch({ type: "CHANGE_CLASS_AND_RESET_SKILLS", payload: { newClass, newSkillTree } });
             toast({ title: `Class Changed to ${newClass}!`, description: "Your abilities and progression have been reset." });
         } catch (err: any) {
             console.error("Gameplay: Class change error:", err);
             toast({ title: "Class Change Error", description: `Could not generate skill tree for ${newClass}. Class change aborted.`, variant: "destructive" });
         } finally {
             setLocalIsGeneratingSkillTree(false);
             dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
         }
     }, [character, dispatch, toast, localIsGeneratingSkillTree, adventureSettings.adventureType]);

    const handleGoBack = useCallback(() => {
        if (isLoading || isEnding || isSaving) return;
        toast({ title: "Returning to Main Menu...", description: "Abandoning current adventure." });
        dispatch({ type: "RESET_GAME" });
    }, [isLoading, isEnding, isSaving, dispatch, toast]);

    const handleSuggestAction = useCallback(() => {
        if (isLoading || isEnding || isSaving || !character) return;
        const learnedSkillNames = character.learnedSkills.map(s => s.name);
        const baseSuggestions = ["Look around", "Examine surroundings", "Check inventory", "Check status", "Check relationships", "Check reputation", "Move north", "Move east", "Move south", "Move west", "Talk to [NPC Name]", "Ask about [Topic]", "Examine [Object]", "Pick up [Item]", "Use [Item]", "Drop [Item]", "Open [Door/Chest]", "Search the area", "Rest here", "Wait for a while", "Attack [Target]", "Defend yourself", "Flee"];
        const skillSuggestions = learnedSkillNames.map(name => `Use skill: ${name}`);
        const suggestions = [...baseSuggestions, ...skillSuggestions];
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        toast({ title: "Suggestion", description: `Try: "${suggestion}"`, duration: 3000 });
    }, [isLoading, isEnding, isSaving, character, toast]);

    // Effect for initial setup: Skill tree generation and initial narration
    useEffect(() => {
        if (state.status !== "Gameplay" || !character) {
            console.log("Gameplay Effect: Not in Gameplay status or no character, returning.");
            if (isInitialLoading) setIsInitialLoading(false);
            return;
        }

        let didInitialActions = false; // Flag to ensure initial actions run only once

        async function initialSetup() {
            console.log("Gameplay Effect: Running initialSetup. isInitialLoading:", isInitialLoading, "localIsGeneratingSkillTree:", localIsGeneratingSkillTree, "contextIsGeneratingSkillTree:", contextIsGeneratingSkillTree, "storyLog.length:", storyLog.length);
            if (didInitialActions) {
                console.log("Gameplay Effect: Initial actions already performed this mount/update cycle.");
                return;
            }
            didInitialActions = true;

            // 1. Skill Tree Generation (if needed and not already generating)
            let skillTreeSeemsReady = adventureSettings.adventureType === "Immersed" || (character && character.skillTree);
            if (adventureSettings.adventureType !== "Immersed" && character && !character.skillTree && !localIsGeneratingSkillTree && !contextIsGeneratingSkillTree) {
                console.log("Gameplay Effect: Triggering skill tree generation for class:", character.class);
                await triggerSkillTreeGeneration(character.class); // Await to ensure it attempts to complete
                // Re-check character from state after dispatch as it might have updated
                const updatedChar = state.character; 
                skillTreeSeemsReady = !!updatedChar?.skillTree;
            } else if (character && character.skillTree) {
                console.log("Gameplay Effect: Skill tree already exists for", character.class);
                if (localIsGeneratingSkillTree) setLocalIsGeneratingSkillTree(false);
                if (contextIsGeneratingSkillTree) dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
            } else if (localIsGeneratingSkillTree || contextIsGeneratingSkillTree) {
                console.log("Gameplay Effect: Skill tree is currently generating. Waiting.");
                return; // Don't proceed to narration if skill tree is still being generated
            }

            // 2. Initial Narration (if skill tree is ready or not needed, and log is empty)
            if (skillTreeSeemsReady && storyLog.length === 0 && !isLoading && isInitialLoading) { // Added isInitialLoading check
                console.log("Gameplay Effect: Conditions met for initial narration.");
                await handlePlayerAction("Begin the adventure by looking around.", true);
            } else if (storyLog.length > 0 && isInitialLoading) {
                console.log("Gameplay Effect: Story log already populated. Setting isInitialLoading to false.");
                setIsInitialLoading(false);
            } else if (!skillTreeSeemsReady && isInitialLoading && adventureSettings.adventureType !== "Immersed") {
                console.log("Gameplay Effect: Waiting for skill tree, isInitialLoading remains true.");
            } else if (isInitialLoading) { 
                console.log("Gameplay Effect: Other condition, setting isInitialLoading to false.");
                setIsInitialLoading(false);
            }
        }
        
        // Only run initialSetup if isInitialLoading is still true OR if there's no character skill tree when there should be one
        if (isInitialLoading || (character && adventureSettings.adventureType !== "Immersed" && !character.skillTree && !localIsGeneratingSkillTree && !contextIsGeneratingSkillTree) ) {
            initialSetup();
        } else if (storyLog.length === 0 && !isLoading && !isInitialLoading && !localIsGeneratingSkillTree && !contextIsGeneratingSkillTree) {
            // Fallback: If initial loading finished, no story log, and not loading anything else, try to kickstart narration
            console.warn("Gameplay Effect: Fallback - initial load complete, no log, trying to start narration.");
             initialSetup(); // Try setup again
        }


    }, [
        state.status, character, state.character?.skillTree, // Added state.character.skillTree to deps
        storyLog.length, localIsGeneratingSkillTree, contextIsGeneratingSkillTree,
        adventureSettings.adventureType, triggerSkillTreeGeneration, handlePlayerAction,
        isLoading, isInitialLoading, dispatch
    ]);


    if (!character) {
        return ( <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4"> <Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="text-lg text-muted-foreground">Loading Character Data...</p> <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="outline"> Return to Main Menu </Button> </div> );
    }

     const renderReputation = useCallback((rep: Reputation | undefined) => {
        if (!rep || Object.keys(rep).length === 0) return <p className="text-xs text-muted-foreground italic">None</p>;
        return ( <ul className="list-none pl-0"> {Object.entries(rep).map(([faction, score]) => ( <li key={faction} className="flex justify-between items-center text-xs"> <span>{faction}:</span> <span className={`font-medium ${score > 10 ? 'text-green-600' : score < -10 ? 'text-destructive' : ''}`}>{score}</span> </li> ))} </ul> );
    }, []);

     const renderNpcRelationships = useCallback((rels: NpcRelationships | undefined) => {
        if (!rels || Object.keys(rels).length === 0) return <p className="text-xs text-muted-foreground italic">None</p>;
        return ( <ul className="list-none pl-0"> {Object.entries(rels).map(([npcName, score]) => ( <li key={npcName} className="flex justify-between items-center text-xs"> <span>{npcName}:</span> <span className={`font-medium ${score > 20 ? 'text-green-600' : score < -20 ? 'text-destructive' : ''}`}>{score}</span> </li> ))} </ul> );
    }, []);

    const anyLoading = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || localIsGeneratingSkillTree || isCraftingLoading || isInitialLoading;

    return (
        <TooltipProvider>
            <div className="flex flex-col md:flex-row min-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">
                 <LeftPanel character={character} inventory={inventory} isGeneratingSkillTree={localIsGeneratingSkillTree} turnCount={turnCount} renderReputation={renderReputation} renderNpcRelationships={renderNpcRelationships} />
                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                     <MobileSheet character={character} inventory={inventory} isGeneratingSkillTree={localIsGeneratingSkillTree} turnCount={turnCount} renderReputation={renderReputation} renderNpcRelationships={renderNpcRelationships} onSettingsOpen={() => setIsDesktopSettingsOpen(true)} />
                    <NarrationDisplay storyLog={storyLog} isLoading={isLoading} isAssessingDifficulty={isAssessingDifficulty} isRollingDice={isRollingDice} isGeneratingSkillTree={localIsGeneratingSkillTree} isEnding={isEnding} isSaving={isSaving} isCraftingLoading={isCraftingLoading} diceResult={diceResult} diceType={diceType} error={error} branchingChoices={branchingChoices} handlePlayerAction={handlePlayerAction} isInitialLoading={isInitialLoading} />
                    <ActionInput onSubmit={handlePlayerAction} onSuggest={handleSuggestAction} onCraft={() => setIsCraftingDialogOpen(true)} disabled={anyLoading} />
                    <GameplayActions onSave={handleSaveGame} onAbandon={handleGoBack} onEnd={() => handleEndAdventure(undefined, character.currentHealth <= 0)} onSettings={() => setIsDesktopSettingsOpen(true)} disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || localIsGeneratingSkillTree || isCraftingLoading} isMobile={isMobile} currentAdventureId={currentAdventureId} />
                    <ClassChangeDialog isOpen={!!pendingClassChange} onOpenChange={(open) => !open && setPendingClassChange(null)} character={character} pendingClassChange={pendingClassChange} onConfirm={handleConfirmClassChange} />
                    <CraftingDialog isOpen={isCraftingDialogOpen} onOpenChange={setIsCraftingDialogOpen} inventory={inventory} onCraft={handleCrafting} />
                    <Sheet open={isDesktopSettingsOpen} onOpenChange={setIsDesktopSettingsOpen}>
                       <SettingsPanel isOpen={isDesktopSettingsOpen} onOpenChange={setIsDesktopSettingsOpen} />
                    </Sheet>
                </div>
            </div>
        </TooltipProvider>
    );
}

