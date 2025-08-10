// src/components/screens/Gameplay.tsx
"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import type { GameState, Character, SkillTree, Reputation, NpcRelationships } from '@/types/game-types';
import type { StoryLogEntry, InventoryItem, DifficultyLevel as AssessedDifficultyLevel, AdventureSettings } from '@/types/adventure-types';
import type { Skill, CharacterStats } from '@/types/character-types';
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/use-toast";
import { calculateXpToNextLevel, calculateMaxHealth, calculateMaxActionStamina, calculateMaxMana, getStarterSkillsForClass } from "@/lib/gameUtils";
import { narrateAdventure, type NarrateAdventureInput, type NarrateAdventureOutput } from "@/ai/flows/narrate-adventure";
import { summarizeAdventure } from "@/ai/flows/summarize-adventure";
import { assessActionDifficulty, type AssessActionDifficultyInput } from "@/ai/flows/assess-action-difficulty";
import { generateSkillTree } from "@/ai/flows/generate-skill-tree";
import { attemptCrafting, type AttemptCraftingInput, type AttemptCraftingOutput } from "@/ai/flows/attempt-crafting";
import { cn } from "@/lib/utils";

import { Loader2, Settings, ArrowLeft, Skull, Save, Info, Dices, Hammer, BookCopy, CalendarClock, GitBranch, RefreshCw } from "lucide-react";
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
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"; // Added SheetContent, SheetHeader, SheetTitle
import { TooltipProvider } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";


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

const GENERIC_BRANCHING_CHOICES: NarrateAdventureOutput['branchingChoices'] = [
    { text: "Look around more closely.", consequenceHint: "May reveal new details." },
    { text: "Consider your next move carefully.", consequenceHint: "Take a moment to think." },
    { text: "Check your inventory.", consequenceHint: "Review your belongings." },
    { text: "Rest for a moment.", consequenceHint: "Conserve your strength." }
];

const INITIAL_ACTION_STRING = "Begin the adventure by looking around.";

export function Gameplay() {
    const { state, dispatch } = useGame();
    const { toast } = useToast();
    const {
        character, currentNarration, currentGameStateString, storyLog,
        adventureSettings, inventory, currentAdventureId,
        isGeneratingSkillTree: contextIsGeneratingSkillTree,
        turnCount, userGoogleAiApiKey
    } = state;

    const [isLoading, setIsLoading] = useState(false); // For subsequent narrations
    const [isInitialLoading, setIsInitialLoading] = useState(true); // Specifically for the first narration
    const [isEnding, setIsEnding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAssessingDifficulty, setIsAssessingDifficulty] = useState(false);
    const [isRollingDice, setIsRollingDice] = useState(false);
    const [isCraftingLoading, setIsCraftingLoading] = useState(false);
    const [localIsGeneratingSkillTree, setLocalIsGeneratingSkillTree] = useState(false);
    const [lastPlayerAction, setLastPlayerAction] = useState<string | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [diceType, setDiceType] = useState<string>("None");
    const [pendingClassChange, setPendingClassChange] = useState<string | null>(null);
    const [branchingChoices, setBranchingChoices] = useState<NarrateAdventureOutput['branchingChoices']>(GENERIC_BRANCHING_CHOICES);
    const [isCraftingDialogOpen, setIsCraftingDialogOpen] = useState(false);
    const [isDesktopSettingsOpen, setIsDesktopSettingsOpen] = useState(false);
    
    const initialSetupAttemptedRef = useRef<Record<string, boolean>>({});
    const isMobile = useIsMobile();

    useEffect(() => {
        if (contextIsGeneratingSkillTree !== localIsGeneratingSkillTree) {
            setLocalIsGeneratingSkillTree(contextIsGeneratingSkillTree);
        }
    }, [contextIsGeneratingSkillTree, localIsGeneratingSkillTree]);

     useEffect(() => {
         console.log("Gameplay: currentAdventureId changed or component mounted. Resetting relevant states. New ID:", currentAdventureId);
         setIsInitialLoading(true);
         setError(null);
         setLastPlayerAction(null); // Reset last action for new adventure
         setBranchingChoices(GENERIC_BRANCHING_CHOICES);
         // Reset the attempted flag for the new adventure
         if (currentAdventureId) {
            initialSetupAttemptedRef.current = { [currentAdventureId]: false };
         } else {
            initialSetupAttemptedRef.current = {};
         }
     }, [currentAdventureId]);


    const handleEndAdventure = useCallback(async (finalNarrationEntry?: StoryLogEntry, characterIsDefeated = false) => {
        if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || localIsGeneratingSkillTree || contextIsGeneratingSkillTree || isCraftingLoading) return;
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

        if (hasLog && character) { 
            const fullStory = finalLogToSummarize.map((log, index) => `[Turn ${index + 1}]\n${log.narration}`).join("\n\n---\n\n");
            if (fullStory.trim().length > 0) {
                try {
                    const summaryResult = await summarizeAdventure({ story: fullStory, userApiKey: userGoogleAiApiKey });
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
        setIsEnding(false);
    }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, localIsGeneratingSkillTree, contextIsGeneratingSkillTree, storyLog, dispatch, toast, character, isCraftingLoading, userGoogleAiApiKey]);

    const handlePlayerAction = useCallback(async (action: string, isInitialAction = false) => {
        console.log(`Gameplay: handlePlayerAction called. Action: "${action.substring(0,50)}...", isInitialAction: ${isInitialAction}`);
        if (!character) {
            toast({ title: "Error", description: "Character data is missing.", variant: "destructive" });
             if (isInitialAction) setIsInitialLoading(false);
             console.error("Gameplay: Character is null in handlePlayerAction.");
            return;
        }
        
        setLastPlayerAction(action); // Store the action being processed
        if (isInitialAction) {
            setIsInitialLoading(true);
            console.log("Gameplay: handlePlayerAction - Initial action. isInitialLoading set to true.");
        } else {
            setIsLoading(true);
        }
        setError(null); setDiceResult(null); setDiceType("None"); 

        let actionWithDice = action;
        let assessedDifficulty: AssessedDifficultyLevel = "Normal";
        let requiresRoll = false;
        let rollFunction: (() => number) | null = null;

        try {
            if (character.class === 'admin000') {
                // Dev commands are now handled synchronously inside Gameplay.tsx to directly dispatch state changes
                return;
            }

            const actionLower = action.trim().toLowerCase();
            const isPassiveAction = [INITIAL_ACTION_STRING.toLowerCase(), "look", "look around", "check inventory", "check status", "check relationships", "check reputation"].includes(actionLower);

            if (!isInitialAction && !isPassiveAction) {
                setIsAssessingDifficulty(true);
                toast({ title: "Assessing Challenge...", duration: 1000 });
                await new Promise(resolve => setTimeout(resolve, 150));
                const repString = character.reputation ? Object.entries(character.reputation).map(([f, s]) => `${f}: ${s}`).join(', ') || 'None' : 'None';
                const relString = character.npcRelationships ? Object.entries(character.npcRelationships).map(([n, s]) => `${n}: ${s}`).join(', ') || 'None' : 'None';
                const capabilitiesSummary = `Lvl: ${character.level}. Class: ${character.class}. Stage: ${character.skillTreeStage}. Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, WIS ${character.stats.wisdom}. Health: ${character.currentHealth}/${character.maxHealth}. Action STA: ${character.currentStamina}/${character.maxStamina}. Mana: ${character.currentMana}/${character.maxMana}. Traits: ${character.traits.join(', ') || 'None'}. Knowledge: ${character.knowledge.join(', ') || 'None'}. Background: ${character.background}. Inventory: ${inventory.map(i => i.name).join(', ') || 'Empty'}. Learned Skills: ${character.learnedSkills.map(s => s.name).join(', ') || 'None'}. Rep: ${repString}. Rel: ${relString}`;
                const assessmentInput: AssessActionDifficultyInput = {
                    playerAction: action, characterCapabilities: capabilitiesSummary, characterClass: character.class,
                    currentSituation: currentNarration?.narration || "At the beginning of the scene.",
                    gameStateSummary: currentGameStateString, gameDifficulty: adventureSettings.difficulty, turnCount: turnCount,
                    userApiKey: userGoogleAiApiKey,
                };
                const assessmentResult = await assessActionDifficulty(assessmentInput);
                setIsAssessingDifficulty(false);
                assessedDifficulty = assessmentResult.difficulty;
                setDiceType(assessmentResult.suggestedDice);
                rollFunction = localGetDiceRollFunction(assessmentResult.suggestedDice);
                requiresRoll = assessedDifficulty !== "Trivial" && assessedDifficulty !== "Impossible" && rollFunction !== null;
                toast({ title: `Action Difficulty: ${assessedDifficulty}`, description: assessmentResult.reasoning.substring(0, 100), duration: 1500 });
                await new Promise(resolve => setTimeout(resolve, 200));
                
                if (assessedDifficulty === "Impossible") {
                    const impossibleActionLog: StoryLogEntry = {
                        narration: `Narrator: Your attempt to "${action}" is deemed impossible. ${assessmentResult.reasoning}`,
                        updatedGameState: currentGameStateString, // No state change for impossible action
                        timestamp: Date.now(),
                        branchingChoices: GENERIC_BRANCHING_CHOICES, // Provide generic choices
                    };
                    dispatch({ type: "UPDATE_NARRATION", payload: impossibleActionLog });
                    setBranchingChoices(GENERIC_BRANCHING_CHOICES);
                    toast({ title: "Action Impossible", description: assessmentResult.reasoning, variant: "destructive", duration: 4000 });
                    return; // Return early as the action doesn't proceed to narration
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
                await new Promise(resolve => setTimeout(resolve, 100));
                setIsRollingDice(false);
                await new Promise(resolve => setTimeout(resolve, 1400)); // Time for user to see dice result
                setDiceResult(null); // Clear dice result
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

            const reputationString = character.reputation ? JSON.stringify(character.reputation) : "{}";
            const npcRelationshipsString = character.npcRelationships ? JSON.stringify(character.npcRelationships) : "{}";

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
                userApiKey: userGoogleAiApiKey,
            };

            const narrationResult = await narrateAdventure(inputForAI);

            // Fallback handling is now mostly inside narrateAdventureFlow, but we check again
            if (narrationResult && narrationResult.narration && narrationResult.updatedGameState) {
                dispatch({ type: "UPDATE_NARRATION", payload: { ...narrationResult, timestamp: Date.now() } });
                setBranchingChoices(narrationResult.branchingChoices ?? GENERIC_BRANCHING_CHOICES);
                // Toasts for positive feedback
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

                const updatedChar = state.character; // This will be updated after dispatch
                if (narrationResult.isCharacterDefeated && updatedChar && updatedChar.currentHealth <=0) { 
                    if (adventureSettings.permanentDeath) {
                        await handleEndAdventure({ ...narrationResult, timestamp: Date.now() }, true);
                    } else {
                        dispatch({ type: "RESPAWN_CHARACTER", payload: { narrationMessage: `${character.name} was defeated but managed to escape death's grasp this time!` } });
                        toast({ title: "Defeated!", description: "You narrowly escaped death! Your health and resources are restored.", variant: "destructive", duration: 5000 });
                    }
                }
            } else {
                 // This path should ideally not be hit if narrateAdventureFlow has robust fallbacks.
                 setError("Narration failed: AI did not return a valid response. Try a different action or retry.");
                 setBranchingChoices(GENERIC_BRANCHING_CHOICES);
                 toast({title: "Narration Error", description: "AI failed to respond. Please try again.", variant: "destructive"});
            }
        } catch (err: any) {
            console.error("Gameplay: Error in handlePlayerAction:", err);
            setError(`An unexpected error occurred while processing your action: ${err.message}`);
            setBranchingChoices(GENERIC_BRANCHING_CHOICES); // Ensure choices are available even on error
            toast({title: "Unexpected Error", description: "Something went wrong processing your action.", variant: "destructive"});
        } finally {
            if (isInitialAction) {
                console.log("Gameplay: handlePlayerAction - Initial action finished, isInitialLoading set to false.");
                setIsInitialLoading(false);
            }
            setIsLoading(false); 
            if (isAssessingDifficulty) setIsAssessingDifficulty(false);
            if (isRollingDice) setIsRollingDice(false);
            console.log(`Gameplay: handlePlayerAction finished. Action: "${action.substring(0,50)}...". Loading states reset.`);
        }
    }, [
        character, inventory, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice,
        localIsGeneratingSkillTree, contextIsGeneratingSkillTree, currentGameStateString, currentNarration, storyLog, adventureSettings, turnCount,
        dispatch, toast, handleEndAdventure, isCraftingLoading, userGoogleAiApiKey
    ]);

    const handleRetryNarration = useCallback(() => {
        let actionToRetry = lastPlayerAction;
        let isRetryInitial = false;

        if (!actionToRetry && storyLog.length === 0) {
            actionToRetry = INITIAL_ACTION_STRING;
            isRetryInitial = true;
             console.log("Gameplay: Retrying initial narration because no last action and story log is empty.");
        } else if (actionToRetry === INITIAL_ACTION_STRING) {
            isRetryInitial = true;
        }
        
        if (actionToRetry) {
            toast({ title: "Retrying AI Narration...", description: `Re-sending action: "${actionToRetry.substring(0,30)}..."`});
            handlePlayerAction(actionToRetry, isRetryInitial);
        } else {
            toast({ title: "Cannot Retry", description: "No previous action to retry, and initial narration was already attempted.", variant: "destructive"});
        }
    }, [lastPlayerAction, handlePlayerAction, toast, storyLog.length]);


    const triggerSkillTreeGeneration = useCallback(async (charClass: string | undefined): Promise<SkillTree | null> => {
        if (!charClass || adventureSettings.adventureType === "Immersed") {
            if (contextIsGeneratingSkillTree) dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
            setLocalIsGeneratingSkillTree(false);
            return character?.skillTree || null;
        }
         if (character && character.skillTree && character.skillTree.className === charClass) {
             if (contextIsGeneratingSkillTree) dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
             setLocalIsGeneratingSkillTree(false);
             return character.skillTree;
         }
        
        dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true });
        setLocalIsGeneratingSkillTree(true);
        setError(null);
        toast({ title: "Generating Skill Tree...", description: `Crafting abilities for the ${charClass} class...`, duration: 3000 });
        
        try {
            const skillTreeResult = await generateSkillTree({ characterClass: charClass, userApiKey: userGoogleAiApiKey });
            if (skillTreeResult && skillTreeResult.stages.length === 5) { 
                dispatch({ type: "SET_SKILL_TREE", payload: { class: charClass, skillTree: skillTreeResult } });
                toast({ title: "Skill Tree Generated!", description: `The path of the ${charClass} is set.` });
                return skillTreeResult;
            } else {
                toast({ title: "Skill Tree Error", description: "Using default progression (AI fallback used).", variant: "default" });
                return skillTreeResult; // Return fallback if AI provided one
            }
        } catch (err: any) {
            setError(`Skill Tree Error: ${err.message}. Using default progression.`);
            toast({ title: "Skill Tree Error", description: "Could not generate skill tree. Default progression used.", variant: "destructive" });
            return null; 
        } finally {
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
            setLocalIsGeneratingSkillTree(false);
        }
    }, [dispatch, toast, adventureSettings.adventureType, character, contextIsGeneratingSkillTree, userGoogleAiApiKey]);

    useEffect(() => {
        const performInitialSetup = async () => {
            if (!character || !currentAdventureId || initialSetupAttemptedRef.current[currentAdventureId]) {
                if (isInitialLoading) setIsInitialLoading(false); // Stop loading if prerequisites are missing
                return;
            }
            initialSetupAttemptedRef.current[currentAdventureId] = true;
            console.log(`Gameplay Initial Setup: Starting for adventure ${currentAdventureId}.`);

            // Step 1: Generate Skill Tree if needed
            let skillTreeReady = adventureSettings.adventureType === "Immersed" || !!character.skillTree;
            if (!skillTreeReady) {
                console.log("Gameplay Initial Setup: Skill tree needed for class:", character.class);
                await triggerSkillTreeGeneration(character.class);
                // Re-check state after dispatch
                const updatedCharacter = state.character;
                skillTreeReady = adventureSettings.adventureType === "Immersed" || !!updatedCharacter?.skillTree;
                 console.log("Gameplay Initial Setup: Skill tree generation attempt finished. Ready:", skillTreeReady);
            }

            // Step 2: Trigger initial narration only after skill tree is ready and if no story exists
            if (skillTreeReady && storyLog.length === 0) {
                console.log("Gameplay Initial Setup: Conditions met for initial narration. Calling handlePlayerAction.");
                await handlePlayerAction(INITIAL_ACTION_STRING, true);
            } else {
                // If story log already has entries (e.g., from a loaded game), we don't need initial narration.
                 console.log("Gameplay Initial Setup: Story log has entries or skill tree failed. Skipping initial narration.");
                setIsInitialLoading(false);
            }
        };

        performInitialSetup().catch(err => {
            console.error("Gameplay: Fatal error during initial setup:", err);
            setError("A critical error occurred while starting the adventure. Please try again.");
            setIsInitialLoading(false);
        });
    
    }, [character, currentAdventureId, adventureSettings.adventureType, triggerSkillTreeGeneration, handlePlayerAction, storyLog.length, state.character, isInitialLoading]);
    

    const handleSaveGame = useCallback(async () => {
        if (isLoading || isEnding || isSaving || !currentAdventureId || !character) return;
        setIsSaving(true); toast({ title: "Saving Progress..." }); await new Promise(resolve => setTimeout(resolve, 500));
        try {
            dispatch({ type: "SAVE_CURRENT_ADVENTURE" });
            toast({ title: "Game Saved!", description: `Progress for "${character.name}" saved.`, variant: "default" });
        } catch (err) {
            toast({ title: "Save Failed", description: "Could not save progress.", variant: "destructive" });
        } finally { setIsSaving(false); }
    }, [dispatch, toast, isLoading, isEnding, isSaving, currentAdventureId, character]);

    const handleCrafting = useCallback(async (goal: string, ingredients: string[]) => {
        if (!character || isCraftingLoading) return;
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
             let userFriendlyError = `Crafting attempt failed. Please try again later.`;
             if (err.message?.includes('400 Bad Request') || err.message?.includes('invalid argument')) userFriendlyError = "Crafting failed: Invalid materials or combination? The AI was unable to process the request.";
             else if (err.message) userFriendlyError = `Crafting Error: ${err.message.substring(0, 100)}`;
            toast({ title: "Crafting Error", description: userFriendlyError, variant: "destructive" });
             setIsCraftingDialogOpen(false);
        } finally { setIsCraftingLoading(false); }
    }, [character, inventory, dispatch, toast, currentGameStateString, isCraftingLoading]);

     const handleConfirmClassChange = useCallback(async (newClass: string) => {
         if (!character || !newClass || localIsGeneratingSkillTree || adventureSettings.adventureType === "Immersed") return;
         setPendingClassChange(null);
         
         toast({ title: `Becoming a ${newClass}...`, description: "Generating new skill path...", duration: 2000 });
         let newSkillTreeResult: SkillTree | null = null;
         try {
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true });
            setLocalIsGeneratingSkillTree(true);
             newSkillTreeResult = await generateSkillTree({ characterClass: newClass, userApiKey: userGoogleAiApiKey });
             if (newSkillTreeResult && newSkillTreeResult.stages.length === 5) { 
                 dispatch({ type: "CHANGE_CLASS_AND_RESET_SKILLS", payload: { newClass, newSkillTree: newSkillTreeResult } });
                 toast({ title: `Class Changed to ${newClass}!`, description: "Your abilities and progression have been reset." });
             } else {
                 toast({ title: "Class Change Failed", description: `Could not generate skill tree for ${newClass}. Class change aborted.`, variant: "destructive" });
             }
         } catch (err: any) {
             toast({ title: "Class Change Error", description: `Could not generate skill tree for ${newClass}. Class change aborted.`, variant: "destructive" });
         } finally {
             dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
             setLocalIsGeneratingSkillTree(false);
         }
     }, [character, dispatch, toast, localIsGeneratingSkillTree, adventureSettings.adventureType, userGoogleAiApiKey]);

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

    const processDevCommand = useCallback((action: string) => {
        if (!character) return;
        
        let devNarration = `(Developer Mode) Player chose: "${action}".`;
        const command = action.trim().toLowerCase();
        const parts = command.split(' ');
        const baseCommand = parts[0];
        const value = parts.length > 1 ? parts.slice(1).join(' ') : undefined;
        
        const updates: Partial<Character> = {};
        let xpGained: number | undefined;

        if (baseCommand === '/xp' && value) {
            const amount = parseInt(value, 10);
            if (!isNaN(amount)) { xpGained = amount; devNarration += ` Granted ${amount} XP.`; }
            else { devNarration += " - Invalid XP amount."; }
        } else if (baseCommand === '/stage' && value) {
            const stageNum = parseInt(value, 10);
            if (!isNaN(stageNum) && stageNum >= 0 && stageNum <= 4) { updates.skillTreeStage = stageNum; devNarration += ` Set skill stage to ${stageNum}.`; }
            else { devNarration += " - Invalid stage number (0-4)."; }
        } else if (baseCommand === '/health' && value) {
            const amount = parseInt(value, 10);
            if (!isNaN(amount)) {
                const newHealth = Math.max(0, Math.min(character.maxHealth, character.currentHealth + amount));
                updates.currentHealth = newHealth;
                devNarration += ` Adjusted health by ${amount}. New health: ${newHealth}.`;
            } else { devNarration += " - Invalid health amount."; }
        } else if (baseCommand === '/stamina' && value) {
            const amount = parseInt(value, 10);
            if (!isNaN(amount)) {
                updates.currentStamina = Math.max(0, Math.min(character.maxStamina, character.currentStamina + amount));
                devNarration += ` Adjusted action stamina by ${amount}.`;
            } else { devNarration += " - Invalid action stamina amount."; }
        } else if (baseCommand === '/mana' && value) {
            const amount = parseInt(value, 10);
            if (!isNaN(amount)) {
                updates.currentMana = Math.max(0, Math.min(character.maxMana, character.currentMana + amount));
                devNarration += ` Adjusted mana by ${amount}.`;
            } else { devNarration += " - Invalid mana amount."; }
        } else if (baseCommand === '/addtrait' && value) {
            updates.traits = [...character.traits, value];
            devNarration += ` Added trait: ${value}.`;
        } else if (baseCommand === '/addknowledge' && value) {
            updates.knowledge = [...character.knowledge, value];
            devNarration += ` Added knowledge: ${value}.`;
        } else if (baseCommand === '/addskill' && value) {
            updates.learnedSkills = [...character.learnedSkills, { name: value, description: "Developer added skill", type: 'Learned' }];
            devNarration += ` Added skill: ${value}.`;
        } else {
            devNarration += " Action processed. Dev restrictions bypassed.";
        }

        if (Object.keys(updates).length > 0) dispatch({ type: "UPDATE_CHARACTER", payload: updates });
        if (xpGained) dispatch({ type: "GRANT_XP", payload: xpGained });
        
        const devLogEntry: StoryLogEntry = {
            narration: devNarration,
            updatedGameState: updateGameStateString(currentGameStateString, character, inventory, turnCount + 1),
            timestamp: Date.now(),
            branchingChoices: GENERIC_BRANCHING_CHOICES
        };
        
        dispatch({ type: "UPDATE_NARRATION", payload: devLogEntry });
        setBranchingChoices(GENERIC_BRANCHING_CHOICES);

    }, [character, currentGameStateString, inventory, turnCount, dispatch]);

    // New useEffect to handle dev commands
    useEffect(() => {
        if (character?.class === 'admin000' && lastPlayerAction && lastPlayerAction.startsWith('/')) {
            processDevCommand(lastPlayerAction);
            setLastPlayerAction(null); // Clear after processing
        }
    }, [lastPlayerAction, character, processDevCommand]);


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

    const anyLoading = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || localIsGeneratingSkillTree || contextIsGeneratingSkillTree || isCraftingLoading || isInitialLoading;

    return (
        <TooltipProvider>
            <div className="flex flex-col md:flex-row min-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">
                 <LeftPanel character={character} inventory={inventory} isGeneratingSkillTree={localIsGeneratingSkillTree || contextIsGeneratingSkillTree} turnCount={turnCount} renderReputation={renderReputation} renderNpcRelationships={renderNpcRelationships} />
                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                     <MobileSheet character={character} inventory={inventory} isGeneratingSkillTree={localIsGeneratingSkillTree || contextIsGeneratingSkillTree} turnCount={turnCount} renderReputation={renderReputation} renderNpcRelationships={renderNpcRelationships} onSettingsOpen={() => setIsDesktopSettingsOpen(true)} />
                    <NarrationDisplay storyLog={storyLog} isLoading={isLoading} isAssessingDifficulty={isAssessingDifficulty} isRollingDice={isRollingDice} isGeneratingSkillTree={localIsGeneratingSkillTree || contextIsGeneratingSkillTree} isEnding={isEnding} isSaving={isSaving} isCraftingLoading={isCraftingLoading} diceResult={diceResult} diceType={diceType} error={error} branchingChoices={branchingChoices} handlePlayerAction={handlePlayerAction} isInitialLoading={isInitialLoading} onRetryNarration={handleRetryNarration} />
                    <ActionInput onSubmit={handlePlayerAction} onSuggest={handleSuggestAction} onCraft={() => setIsCraftingDialogOpen(true)} disabled={anyLoading || character.class === 'admin000'} />
                    <GameplayActions onSave={handleSaveGame} onAbandon={handleGoBack} onEnd={() => handleEndAdventure(undefined, character.currentHealth <= 0)} onSettings={() => setIsDesktopSettingsOpen(true)} disabled={anyLoading} isMobile={isMobile} currentAdventureId={currentAdventureId} />
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
