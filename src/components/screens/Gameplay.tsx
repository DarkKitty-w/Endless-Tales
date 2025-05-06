// src/components/screens/Gameplay.tsx
"use client";

import React, { useState, useCallback, useEffect } from "react";
import type {
    GameState, SavedAdventure, Character, SkillTree, Skill, Reputation, NpcRelationships, DifficultyLevel as AssessedDifficultyLevel
} from '@/types/game-types';
import type { StoryLogEntry, InventoryItem } from '@/types/game-types'; // Import necessary types directly
import { useGame } from "@/context/GameContext";
import { useToast } from "@/hooks/use-toast";
import { calculateXpToNextLevel } from "@/lib/gameUtils";
import { narrateAdventure, type NarrateAdventureInput, type NarrateAdventureOutput } from "@/ai/flows/narrate-adventure";
import { summarizeAdventure } from "@/ai/flows/summarize-adventure";
import { assessActionDifficulty, type AssessActionDifficultyInput } from "@/ai/flows/assess-action-difficulty";
import { generateSkillTree } from "@/ai/flows/generate-skill-tree";
import { attemptCrafting, type AttemptCraftingInput, type AttemptCraftingOutput } from "@/ai/flows/attempt-crafting";
import { Loader2, Settings, ArrowLeft, Skull, Save } from "lucide-react";
import { SettingsPanel } from "@/components/screens/SettingsPanel";
import { LeftPanel } from "@/components/game/LeftPanel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NarrationDisplay } from '@/components/gameplay/NarrationDisplay';
import { ActionInput } from '@/components/gameplay/ActionInput';
import { GameplayActions } from '@/components/gameplay/GameplayActions';
import { CraftingDialog } from '@/components/gameplay/CraftingDialog';
import { ClassChangeDialog } from '@/components/gameplay/ClassChangeDialog';
import { MobileSheet } from '@/components/gameplay/MobileSheet';
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from "@/lib/utils";


// Helper function to map difficulty dice string to roller function
// Ensure these functions are globally available or properly imported/mocked
declare global {
    function rollD6(): Promise<number>;
    function rollD10(): Promise<number>;
    function rollD20(): Promise<number>;
    function rollD100(): Promise<number>;
}

const getDiceRollFunction = (diceType: string): (() => Promise<number>) | null => {
    if (typeof window === 'undefined') return null; // Prevent server-side execution
    switch (diceType?.toLowerCase()) {
        case 'd6': return typeof rollD6 === 'function' ? rollD6 : null;
        case 'd10': return typeof rollD10 === 'function' ? rollD10 : null;
        case 'd20': return typeof rollD20 === 'function' ? rollD20 : null;
        case 'd100': return typeof rollD100 === 'function' ? rollD100 : null;
        case 'none': default: return null;
    }
};

export function Gameplay() {
    const { state, dispatch } = useGame();
    const { toast } = useToast();
    const {
        character,
        currentNarration,
        currentGameStateString,
        storyLog,
        adventureSettings,
        inventory,
        currentAdventureId,
        isGeneratingSkillTree,
        turnCount
    } = state;

    // Loading States
    const [isLoading, setIsLoading] = useState(false); // General loading for narration/assessment
    const [isEnding, setIsEnding] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAssessingDifficulty, setIsAssessingDifficulty] = useState(false);
    const [isRollingDice, setIsRollingDice] = useState(false);
    const [isCraftingLoading, setIsCraftingLoading] = useState(false); // Separate loading for crafting
    const [isInitialLoading, setIsInitialLoading] = useState(true); // Flag for initial narration

    // UI State
    const [error, setError] = useState<string | null>(null);
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [diceType, setDiceType] = useState<string>("None");
    const [pendingClassChange, setPendingClassChange] = useState<string | null>(null);
    const [branchingChoices, setBranchingChoices] = useState<NarrateAdventureOutput['branchingChoices']>([]);
    const [isCraftingDialogOpen, setIsCraftingDialogOpen] = useState(false);
    const [isDesktopSettingsOpen, setIsDesktopSettingsOpen] = useState(false);

    const isMobile = useIsMobile(); // Hook to check screen size

    // --- Trigger Skill Tree Generation ---
    const triggerSkillTreeGeneration = useCallback(async (charClass: string) => {
        if (!charClass || isGeneratingSkillTree || adventureSettings.adventureType === "Immersed") {
            if (adventureSettings.adventureType === "Immersed") {
                console.log("Skipping class-based skill tree generation for Immersed adventure.");
                // Optionally dispatch an action to set a flag or a generic skill tree
                dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false }); // Ensure loading is false
            }
            return;
        }
        console.log(`Triggering skill tree generation for class: ${charClass}`);
        dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true });
        setError(null);
        toast({ title: "Generating Skill Tree...", description: `Crafting abilities for the ${charClass} class...`, duration: 2000 });

        try {
            const skillTreeResult = await generateSkillTree({ characterClass: charClass });
            dispatch({ type: "SET_SKILL_TREE", payload: { class: charClass, skillTree: skillTreeResult } });
            toast({ title: "Skill Tree Generated!", description: `The path of the ${charClass} is set.` });
        } catch (err: any) {
            console.error("Skill tree generation failed:", err);
            setError(`Failed to generate skill tree: ${err.message}. Using default progression.`);
            toast({ title: "Skill Tree Error", description: "Could not generate skill tree. Proceeding without specific skills.", variant: "destructive" });
            // Ensure loading state is unset even on error
        } finally {
             dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
        }
    }, [dispatch, toast, isGeneratingSkillTree, adventureSettings.adventureType]); // Added isGeneratingSkillTree dependency


     // --- End Adventure ---
     const handleEndAdventure = useCallback(async (finalNarrationEntry?: StoryLogEntry) => {
        const busy = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading;
        if (busy) return;
        setIsEnding(true);
        setError(null);
        toast({ title: "Ending Adventure", description: "Summarizing your tale..." });

        const finalLogToSummarize = [...storyLog];
        if (finalNarrationEntry && (!storyLog.length || storyLog[storyLog.length - 1].narration !== finalNarrationEntry.narration)) {
            finalLogToSummarize.push(finalNarrationEntry);
        }

        let summary = "Your adventure has concluded.";
        const hasLog = finalLogToSummarize.length > 0;

        if (hasLog) {
            const fullStory = finalLogToSummarize.map((log, index) => `[Turn ${index + 1}]\n${log.narration}`).join("\n\n---\n\n");
            if (fullStory.trim().length > 0) {
                try {
                    const summaryResult = await summarizeAdventure({ story: fullStory });
                    summary = summaryResult.summary;
                    toast({ title: "Summary Generated", description: "View your adventure outcome." });
                } catch (summaryError: any) {
                    summary = `Could not generate a summary due to an error: ${summaryError.message || 'Unknown error'}. The adventure ended.`;
                    toast({ title: "Summary Error", description: "Failed to generate summary.", variant: "destructive" });
                }
            } else {
                summary = "The story was too brief to summarize, but your adventure has concluded.";
            }
        } else {
            summary = "Your adventure ended before it could be properly logged.";
        }

        dispatch({ type: "END_ADVENTURE", payload: { summary, finalNarration: finalNarrationEntry } });
        // No need to set isEnding false here, as the component will unmount/change status
    }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, storyLog, dispatch, toast, isCraftingLoading]); // Added dependencies


    // --- Handle Player Action Submission ---
    const handlePlayerAction = useCallback(async (action: string, isInitialAction = false) => {
        const busy = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading;
        if (!character || busy) {
            console.log("Action blocked: No character or already busy.", { isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, isCraftingLoading });
            let reason = "Please wait for the current action to complete.";
            if (isGeneratingSkillTree) reason = "Please wait for skill tree generation to finish.";
            if (isCraftingLoading) reason = "Please wait for crafting to finish.";
            if (isEnding) reason = "Adventure is ending...";
            if (isSaving) reason = "Saving progress...";
            if (isAssessingDifficulty) reason = "Assessing difficulty...";
            if (isRollingDice) reason = "Rolling dice...";
            toast({ description: reason, variant: "default", duration: 1500 });
            return;
        }

        // Developer Mode Check & Command Handling
        if (character.class === 'admin000') {
            console.log("Developer Mode: Processing action:", action);
            setIsLoading(true); // Set loading true during processing
            setError(null);
            setDiceResult(null);
            setDiceType("None");
            setBranchingChoices([]);

            let devNarration = `(Developer Mode) Action: "${action}"`;
            let stateUpdateDispatched = false;

            const command = action.trim().toLowerCase();
            const parts = command.split(' ');
            const baseCommand = parts[0];
            const value = parts.length > 1 ? parts.slice(1).join(' ') : undefined;

            try { // Wrap dev commands in try/catch
                if (baseCommand === '/xp' && value) {
                    const amount = parseInt(value, 10);
                    if (!isNaN(amount)) {
                        dispatch({ type: 'GRANT_XP', payload: amount });
                        devNarration = `(Developer Mode) Granted ${amount} XP.`;
                        stateUpdateDispatched = true;
                        // Check for level up immediately after granting XP
                        const tempCharState = { ...character, xp: character.xp + amount }; // Simulate state change
                        if (tempCharState.xp >= tempCharState.xpToNextLevel) {
                             const newLevel = tempCharState.level + 1;
                             const newXpToNext = calculateXpToNextLevel(newLevel);
                             dispatch({ type: "LEVEL_UP", payload: { newLevel, newXpToNextLevel: newXpToNext } });
                             toast({ title: `Level Up! Reached Level ${newLevel}!`, description: "You feel stronger!", duration: 5000, className: "bg-green-100 dark:bg-green-900 border-green-500" });
                             devNarration += ` Leveled up to ${newLevel}!`;
                        }
                    } else {
                        devNarration += " - Invalid XP amount.";
                    }
                } else if (baseCommand === '/stage' && value) {
                    const stageNum = parseInt(value, 10);
                    if (!isNaN(stageNum) && stageNum >= 0 && stageNum <= 4) {
                        dispatch({ type: 'PROGRESS_SKILL_STAGE', payload: stageNum });
                        devNarration = `(Developer Mode) Set skill stage to ${stageNum}.`;
                        stateUpdateDispatched = true;
                    } else {
                        devNarration += " - Invalid stage number (0-4).";
                    }
                } else if (baseCommand === '/additem' && value) {
                    const newItem: InventoryItem = { name: value, description: "(Dev Added Item)", quality: "Common" };
                    dispatch({ type: 'ADD_ITEM', payload: newItem });
                    devNarration = `(Developer Mode) Added item: ${value}.`;
                    stateUpdateDispatched = true;
                } else if (baseCommand === '/removeitem' && value) {
                    dispatch({ type: 'REMOVE_ITEM', payload: { itemName: value } });
                    devNarration = `(Developer Mode) Attempted to remove item: ${value}.`;
                    stateUpdateDispatched = true;
                } else {
                    // Default success message if no specific command matched
                    devNarration += " performed successfully. Restrictions bypassed.";
                }

                 const devLogEntry = {
                     narration: devNarration,
                     updatedGameState: "", // Will be generated by reducer based on dispatched actions
                     timestamp: Date.now(),
                 };
                 dispatch({ type: "UPDATE_NARRATION", payload: devLogEntry });

             } catch (devError: any) {
                 console.error("Error processing dev command:", devError);
                 setError(`Dev command failed: ${devError.message}`);
                 toast({ title: "Dev Command Error", description: devError.message, variant: "destructive" });
             } finally {
                 setIsLoading(false); // Unset loading after processing
             }
            return; // End execution for dev mode
        }


        // --- Standard Action Handling (Non-Dev Mode) ---
        if (!character.skillTree && !isGeneratingSkillTree && adventureSettings.adventureType !== "Immersed") {
            // Re-trigger generation if skill tree is missing, not generating, and not an Immersed adventure
            triggerSkillTreeGeneration(character.class);
            toast({ description: "Initializing skill tree before proceeding...", duration: 1500 });
            setIsLoading(false); // Reset loading state if we return early
            return;
        }

        console.log(`Handling action: "${action}"`);
        setIsLoading(true); // General loading for the whole process
        setError(null);
        setDiceResult(null);
        setDiceType("None");
        setBranchingChoices([]);

        let actionWithDice = action;
        let assessedDifficulty: AssessedDifficultyLevel = "Normal";
        let requiresRoll = false;
        let rollFunction: (() => Promise<number>) | null = null;

        const actionLower = action.trim().toLowerCase();
        const isPassiveAction = ["look", "look around", "check inventory", "check status", "check relationships", "check reputation"].includes(actionLower);

        // --- Difficulty Assessment ---
        if (!isInitialAction && !isPassiveAction) {
            setIsAssessingDifficulty(true);
            toast({ title: "Assessing Challenge...", duration: 1000 }); // Shorter duration
             // Use a shorter delay, assessment should be quick
            await new Promise(resolve => setTimeout(resolve, 150));

            try {
                 const reputationString = Object.entries(character.reputation).map(([faction, score]) => `${faction}: ${score}`).join(', ') || 'None';
                const relationshipString = Object.entries(character.npcRelationships).map(([npc, score]) => `${npc}: ${score}`).join(', ') || 'None';
                const capabilitiesSummary = `Lvl: ${character.level}. Class: ${character.class}. Stage: ${character.skillTreeStage}. Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, AGI ${character.stats.agility}, INT ${character.stats.intellect}, WIS ${character.stats.wisdom}, CHA ${character.stats.charisma}. Traits: ${character.traits.join(', ') || 'None'}. Knowledge: ${character.knowledge.join(', ') || 'None'}. Background: ${character.background}. Inventory: ${inventory.map(i => i.name).join(', ') || 'Empty'}. Stamina: ${character.currentStamina}/${character.maxStamina}. Mana: ${character.currentMana}/${character.maxMana}. Learned Skills: ${character.learnedSkills.map(s => s.name).join(', ') || 'None'}. Rep: ${reputationString}. Rel: ${relationshipString}`;

                const assessmentInput: AssessActionDifficultyInput = {
                    playerAction: action,
                    characterCapabilities: capabilitiesSummary,
                    characterClass: character.class,
                    currentSituation: currentNarration?.narration || "At the beginning of the scene.",
                    gameStateSummary: currentGameStateString,
                    gameDifficulty: adventureSettings.difficulty,
                    turnCount: turnCount,
                };
                const assessmentResult = await assessActionDifficulty(assessmentInput);
                assessedDifficulty = assessmentResult.difficulty;
                setDiceType(assessmentResult.suggestedDice);
                rollFunction = getDiceRollFunction(assessmentResult.suggestedDice);
                requiresRoll = assessedDifficulty !== "Trivial" && assessedDifficulty !== "Impossible" && rollFunction !== null;

                toast({ title: `Difficulty: ${assessedDifficulty}`, description: assessmentResult.reasoning.substring(0, 100), duration: 1500 });
                 await new Promise(resolve => setTimeout(resolve, 200)); // Short delay after assessment toast

                if (assessedDifficulty === "Impossible") {
                    setError(`Action seems impossible: ${assessmentResult.reasoning} Try something else.`);
                    toast({ title: "Action Impossible", description: assessmentResult.reasoning, variant: "destructive", duration: 4000 });
                    setIsLoading(false);
                    setIsAssessingDifficulty(false);
                    return;
                }
            } catch (assessError: any) {
                console.error("Difficulty assessment failed:", assessError);
                setError(`Failed to assess difficulty (${assessError.message}). Assuming 'Normal'.`);
                toast({ title: "Assessment Error", description: "Assuming normal difficulty.", variant: "destructive" });
                assessedDifficulty = "Normal";
                setDiceType("d10");
                rollFunction = typeof window !== 'undefined' && typeof rollD10 === 'function' ? rollD10 : null;
                requiresRoll = !!rollFunction; // Requires roll only if function exists
            } finally {
                setIsAssessingDifficulty(false);
            }
        } else {
            requiresRoll = false;
            assessedDifficulty = "Trivial";
            setDiceType("None");
        }

        // --- Dice Rolling ---
        if (requiresRoll && rollFunction) {
            setIsRollingDice(true);
            toast({ title: `Rolling ${diceType}...`, duration: 1000 }); // Shorter duration
             await new Promise(resolve => setTimeout(resolve, 200)); // Short delay
            try {
                const roll = await rollFunction();
                setDiceResult(roll); // Set state immediately
                const numericDiceType = parseInt(diceType.substring(1), 10);

                if (!isNaN(numericDiceType) && numericDiceType > 0) {
                     actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll Result: ${roll}/${numericDiceType})`;
                    const successThreshold = Math.ceil(numericDiceType * 0.6); // Example threshold
                    const failThreshold = Math.floor(numericDiceType * 0.3); // Example threshold
                    let outcomeDesc = "Average outcome.";
                    if (roll >= successThreshold) outcomeDesc = "Success!";
                    if (roll <= failThreshold) outcomeDesc = "Challenging...";
                    // Removed toast here, dice result is shown in NarrationDisplay
                } else {
                    console.warn(`Dice roll successful (${roll}), but dice type '${diceType}' was unexpected.`);
                    actionWithDice += ` (Difficulty: ${assessedDifficulty}, Roll: ${roll})`;
                }
                // Very short delay after setting dice result state to allow render
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (diceError) {
                console.error("Dice roll failed:", diceError);
                setError("The dice seem unresponsive... Proceeding based on skill.");
                toast({ title: "Dice Error", description: "Could not roll dice.", variant: "destructive" });
                actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll: Failed)`;
                setDiceResult(null); // Reset dice result on error
            } finally {
                setIsRollingDice(false); // Stop rolling state
                // Short delay before AI call to ensure dice animation finishes
                await new Promise(resolve => setTimeout(resolve, 1400));
                setDiceResult(null); // Clear dice result visually before AI call
            }
        } else if (!isPassiveAction && assessedDifficulty !== "Impossible" && diceType !== 'None') {
            actionWithDice += ` (Difficulty: ${assessedDifficulty}, No Roll Required)`;
        }

        // --- AI Narration Call ---
        let skillTreeSummaryForAI = null;
        if (character.skillTree && character.skillTreeStage >= 0) {
            const currentStageData = character.skillTree.stages.find(s => s.stage === character.skillTreeStage);
            skillTreeSummaryForAI = {
                className: character.skillTree.className,
                stageCount: character.skillTree.stages.length,
                availableSkillsAtCurrentStage: currentStageData ? currentStageData.skills.map(s => s.name) : [],
            };
        }

        const inputForAI: NarrateAdventureInput = {
            character: {
                name: character.name,
                class: character.class,
                description: character.description,
                traits: character.traits,
                knowledge: character.knowledge,
                background: character.background,
                stats: character.stats,
                currentStamina: character.currentStamina,
                maxStamina: character.maxStamina,
                currentMana: character.currentMana,
                maxMana: maxMana,
                level: character.level,
                xp: character.xp,
                xpToNextLevel: character.xpToNextLevel,
                reputation: character.reputation,
                npcRelationships: character.npcRelationships,
                skillTreeSummary: skillTreeSummaryForAI,
                skillTreeStage: character.skillTreeStage,
                learnedSkills: character.learnedSkills.map(s => s.name),
                aiGeneratedDescription: character.aiGeneratedDescription,
            },
            playerChoice: actionWithDice,
            gameState: currentGameStateString,
            previousNarration: storyLog.length > 0 ? storyLog[storyLog.length - 1].narration : undefined,
            adventureSettings: { // Ensure all adventure settings are passed
                difficulty: adventureSettings.difficulty,
                permanentDeath: adventureSettings.permanentDeath,
                adventureType: adventureSettings.adventureType,
                worldType: adventureSettings.worldType,
                mainQuestline: adventureSettings.mainQuestline,
                universeName: adventureSettings.universeName,
                playerCharacterConcept: adventureSettings.playerCharacterConcept,
            },
            turnCount: turnCount,
        };

        let retryCount = 0;
        const maxRetries = 2;
        let narrationResult: NarrateAdventureOutput | null = null;

        while (retryCount <= maxRetries && !narrationResult) {
            try {
                console.log(`Sending to narrateAdventure flow (Attempt ${retryCount + 1}):`, JSON.stringify(inputForAI, null, 2));
                const result = await narrateAdventure(inputForAI);
                console.log("Received from narrateAdventure flow:", result);

                if (!result || !result.narration || !result.updatedGameState) {
                    throw new Error("AI response missing critical narration or game state.");
                }
                 if (!result.updatedGameState.toLowerCase().includes('turn:')) {
                    throw new Error("AI response missing Turn count in updated game state.");
                }

                narrationResult = result;
                setError(null); // Clear previous errors on success

            } catch (err: any) {
                console.error(`Narration error (Attempt ${retryCount + 1}):`, err);
                const errorMessage = err.message || "The story encountered an unexpected snag.";
                 setError(`AI Error (Attempt ${retryCount + 1}/${maxRetries + 1}): ${errorMessage.substring(0,100)}... Retrying...`);
                 toast({ title: "AI Error", description: `${errorMessage.substring(0, 60)}... Retrying...`, variant: "destructive"});

                if (retryCount >= maxRetries) {
                    setError(`Narration failed after ${maxRetries + 1} attempts: ${errorMessage}. Try a different action or wait a moment.`);
                    toast({ title: "Narration Failed", description: "Please try a different action.", variant: "destructive", duration: 5000 });
                    setIsLoading(false); // Stop loading on final failure
                    return; // Abort action handling
                }
                retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
            }
        }

        // --- Process Narration Result ---
        if (narrationResult) {
             // Dispatch action with payload that includes everything needed for reducers
             dispatch({ type: "UPDATE_NARRATION", payload: { ...narrationResult, timestamp: Date.now() } });

            setBranchingChoices(narrationResult.branchingChoices ?? []); // Update branching choices state

            // Show toasts for specific events
            if (narrationResult.dynamicEventTriggered) {
                toast({ title: "Dynamic Event!", description: narrationResult.dynamicEventTriggered, duration: 4000, className: "border-purple-500" });
            }
            if (narrationResult.xpGained && narrationResult.xpGained > 0) {
                 toast({ title: `Gained ${narrationResult.xpGained} XP!`, duration: 3000, className: "bg-yellow-100 dark:bg-yellow-900 border-yellow-500" });
                // Level up check happens *after* dispatch in GameContext effect now
            }
            if (narrationResult.reputationChange) {
                const { faction, change } = narrationResult.reputationChange;
                const direction = change > 0 ? 'increased' : 'worsened';
                toast({ title: `Reputation with ${faction} ${direction} by ${Math.abs(change)}!`, duration: 3000 });
            }
            if (narrationResult.npcRelationshipChange) {
                const { npcName, change } = narrationResult.npcRelationshipChange;
                const direction = change > 0 ? 'improved' : 'worsened';
                toast({ title: `Relationship with ${npcName} ${direction} by ${Math.abs(change)}!`, duration: 3000 });
            }
            if (narrationResult.progressedToStage && narrationResult.progressedToStage > character.skillTreeStage) {
                 const progressedStageName = character.skillTree?.stages.find(s => s.stage === narrationResult!.progressedToStage)?.stageName || `Stage ${narrationResult.progressedToStage}`;
                 toast({ title: "Skill Stage Increased!", description: `You've reached ${progressedStageName} (Stage ${narrationResult.progressedToStage}) of the ${character.class} path!`, duration: 4000, className: "bg-purple-100 dark:bg-purple-900 border-purple-500" });
            }
             if (narrationResult.gainedSkill) {
                 toast({ title: "Skill Learned!", description: `You gained the skill: ${narrationResult.gainedSkill.name}!`, duration: 4000 });
             }
             if (narrationResult.suggestedClassChange && narrationResult.suggestedClassChange !== character.class) {
                 setPendingClassChange(narrationResult.suggestedClassChange); // Trigger confirmation dialog
             }

            // Check for Game Over condition
            const lowerNarration = narrationResult.narration?.toLowerCase() || "";
            const lowerGameState = narrationResult.updatedGameState?.toLowerCase() || "";
            const isGameOver = lowerGameState.includes("game over") || lowerNarration.includes("your adventure ends") || lowerNarration.includes("you have died") || lowerNarration.includes("you achieved victory");

            if (isGameOver) {
                 await handleEndAdventure({ ...narrationResult, timestamp: Date.now() }); // Pass final narration data
             }
        }

         // Reset loading state after processing
         setIsLoading(false);
          if (isInitialAction) {
             setIsInitialLoading(false); // Mark initial load as complete
          }

    }, [
        character, inventory, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice,
        isGeneratingSkillTree, currentGameStateString, currentNarration, storyLog, adventureSettings, turnCount, state, // Include full state for context access
        dispatch, toast, triggerSkillTreeGeneration, handleEndAdventure, isCraftingLoading
    ]);


    // --- Handle Save Game ---
    const handleSaveGame = useCallback(async () => {
        const busy = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading;
        if (busy || !currentAdventureId) return;
        setIsSaving(true);
        toast({ title: "Saving Progress..." });
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
            dispatch({ type: "SAVE_CURRENT_ADVENTURE" });
            toast({ title: "Game Saved!", description: `Your progress for "${character?.name || 'Adventurer'}" has been saved.`, variant: "default" });
        } catch (err) {
            console.error("Failed to save game:", err);
            toast({ title: "Save Failed", description: "Could not save your progress.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }, [dispatch, toast, isLoading, isEnding, isSaving, currentAdventureId, character, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, isCraftingLoading]); // Added dependencies

    // --- Handle Crafting Attempt ---
    const handleCrafting = useCallback(async (goal: string, ingredients: string[]) => {
        if (!character) return;
        setIsCraftingLoading(true);
        toast({ title: "Attempting to craft...", description: `Trying to make: ${goal}` });

        const inventoryListNames = inventory.map(item => item.name);
        const skills = character.learnedSkills.map(s => s.name);
        const craftingInput: AttemptCraftingInput = {
            characterKnowledge: character.knowledge,
            characterSkills: skills,
            inventoryItems: inventoryListNames,
            desiredItem: goal,
            usedIngredients: ingredients,
        };

        try {
            const result: AttemptCraftingOutput = await attemptCrafting(craftingInput);
            toast({
                title: result.success ? "Crafting Successful!" : "Crafting Failed!",
                description: result.message,
                variant: result.success ? "default" : "destructive",
                duration: 5000,
            });

            let narrationText = `You attempted to craft ${goal} using ${ingredients.join(', ')}. ${result.message}`;
            if (result.success && result.craftedItem) {
                narrationText = `You successfully crafted a ${result.craftedItem.quality ? result.craftedItem.quality + ' ' : ''}${result.craftedItem.name}! ${result.message}`;
            }

             // Dispatch a single action containing all crafting results
             dispatch({ type: 'UPDATE_CRAFTING_RESULT', payload: {
                 narration: narrationText,
                 consumedItems: result.consumedItems,
                 craftedItem: result.success ? result.craftedItem : null,
                 newGameStateString: "" // Let reducer calculate this based on new inventory
             }});
             setIsCraftingDialogOpen(false); // Close dialog on success/failure

        } catch (err: any) {
            console.error("Crafting AI call failed:", err);
            let userFriendlyError = `Crafting attempt failed. Please try again later.`;
             if (err.message?.includes('400 Bad Request')) {
                 userFriendlyError = "Crafting failed: Invalid materials or combination?";
             } else if (err.message) {
                 userFriendlyError = `Crafting Error: ${err.message.substring(0, 100)}`;
             }
            toast({ title: "Crafting Error", description: userFriendlyError, variant: "destructive" });
             setIsCraftingDialogOpen(false); // Close dialog even on error
        } finally {
            setIsCraftingLoading(false);
        }
    }, [character, inventory, dispatch, toast]); // Added dependencies

     // --- Confirm and Handle Class Change ---
     const handleConfirmClassChange = useCallback(async (newClass: string) => {
         if (!character || !newClass || isGeneratingSkillTree) return;
         setPendingClassChange(null); // Close dialog immediately
         dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true });
         toast({ title: `Becoming a ${newClass}...`, description: "Generating new skill path...", duration: 2000 });

         try {
             const newSkillTree = await generateSkillTree({ characterClass: newClass });
             dispatch({ type: "CHANGE_CLASS_AND_RESET_SKILLS", payload: { newClass, newSkillTree } });
             toast({ title: `Class Changed to ${newClass}!`, description: "Your abilities and progression have been reset." });
         } catch (err: any) {
             console.error("Failed to generate skill tree for new class:", err);
             toast({ title: "Class Change Error", description: `Could not generate skill tree for ${newClass}. Class change aborted.`, variant: "destructive" });
             dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false }); // Ensure loading stops
         }
         // No finally block needed here as skill tree generation state is handled in try/catch
     }, [character, dispatch, toast, isGeneratingSkillTree]); // Added dependencies


    // --- Go Back (Abandon Adventure) ---
    const handleGoBack = useCallback(() => {
        const busy = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading;
        if (busy) return;
        toast({ title: "Returning to Main Menu...", description: "Abandoning current adventure." });
        dispatch({ type: "RESET_GAME" });
    }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, dispatch, toast, isCraftingLoading]); // Added dependencies

    // --- Suggest Action ---
    const handleSuggestAction = useCallback(() => {
        const busy = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading;
        if (busy || !character) return;
        const learnedSkillNames = character.learnedSkills.map(s => s.name);
        const baseSuggestions = ["Look around", "Examine surroundings", "Check inventory", "Check status", "Check relationships", "Check reputation", "Move north", "Move east", "Move south", "Move west", "Talk to [NPC Name]", "Ask about [Topic]", "Examine [Object]", "Pick up [Item]", "Use [Item]", "Drop [Item]", "Open [Door/Chest]", "Search the area", "Rest here", "Wait for a while", "Attack [Target]", "Defend yourself", "Flee"];
        const skillSuggestions = learnedSkillNames.map(name => `Use skill: ${name}`);
        const suggestions = [...baseSuggestions, ...skillSuggestions];
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        toast({ title: "Suggestion", description: `Try: "${suggestion}"`, duration: 3000 });
    }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, character, toast, isCraftingLoading]); // Added dependencies

    // --- Initial Load Effect ---
    useEffect(() => {
        if (state.status !== "Gameplay" || !character) return;

         console.log("Gameplay Mounted/State Updated. Status:", state.status, "StoryLog Length:", storyLog.length, "Character:", !!character, "isInitialLoading:", isInitialLoading);

        // Determine if it's a truly new game (no log entries, no existing save for this ID)
        const isNewGame = storyLog.length === 0 && !state.savedAdventures.some(s => s.id === state.currentAdventureId);

        if (isInitialLoading) {
             console.log("Initial Loading...");
             if (adventureSettings.adventureType !== "Immersed" && !character.skillTree && !isGeneratingSkillTree) {
                 console.log("Triggering initial skill tree generation for non-Immersed adventure...");
                 triggerSkillTreeGeneration(character.class);
             } else if ((character.skillTree || adventureSettings.adventureType === "Immersed") && storyLog.length === 0 && !isLoading) {
                 // If skill tree exists OR it's an Immersed adventure (doesn't strictly need a class tree), log is empty, and not already loading, trigger first narration
                 console.log("Skill tree exists or Immersed, triggering initial narration...");
                 handlePlayerAction("Begin the adventure by looking around.", true);
                 // setIsInitialLoading will be set to false in handlePlayerAction's finally block
             } else if (!character.skillTree && isGeneratingSkillTree) {
                  // Waiting for skill tree generation
                  console.log("Waiting for skill tree generation...");
             } else if (storyLog.length > 0) {
                  // Already loaded or resumed with existing log
                   console.log("Gameplay resumed with existing log, setting initial loading false.");
                   setIsInitialLoading(false);
             } else {
                 // Fallback: something unexpected, stop initial loading
                 console.warn("Unexpected state during initial load check, setting initial loading false.");
                 setIsInitialLoading(false);
             }
         } else if (storyLog.length > 0 && isInitialLoading) {
             // If we somehow reach here (log has entries but still initial loading), correct it
             console.log("Correcting initial loading state as story log exists.");
             setIsInitialLoading(false);
         }

    }, [
        state.status, character, state.currentAdventureId, storyLog.length, isGeneratingSkillTree,
        triggerSkillTreeGeneration, handlePlayerAction, state.savedAdventures, isInitialLoading, isLoading, adventureSettings.adventureType // Added isLoading and adventureType
    ]);


    // --- Loading/Character Check ---
    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-lg text-muted-foreground">Loading Character Data...</p>
                <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="outline"> Return to Main Menu </Button>
            </div>
        );
    }

     // --- Helper Functions for Progression Card ---
     const renderReputation = useCallback((rep: Reputation | undefined) => {
        if (!rep || Object.keys(rep).length === 0) return <p className="text-xs text-muted-foreground italic">None</p>;
        return (
            <ul className="list-none pl-0">
                {Object.entries(rep).map(([faction, score]) => (
                    <li key={faction} className="flex justify-between items-center text-xs">
                        <span>{faction}:</span>
                        <span className={`font-medium ${score > 10 ? 'text-green-600' : score < -10 ? 'text-destructive' : ''}`}>{score}</span>
                    </li>
                ))}
            </ul>
        );
    }, []);

     const renderNpcRelationships = useCallback((rels: NpcRelationships | undefined) => {
        if (!rels || Object.keys(rels).length === 0) return <p className="text-xs text-muted-foreground italic">None</p>;
        return (
             <ul className="list-none pl-0">
                 {Object.entries(rels).map(([npcName, score]) => (
                     <li key={npcName} className="flex justify-between items-center text-xs">
                         <span>{npcName}:</span>
                         <span className={`font-medium ${score > 20 ? 'text-green-600' : score < -20 ? 'text-destructive' : ''}`}>{score}</span>
                     </li>
                 ))}
             </ul>
        );
    }, []);


    // --- Main Render ---
    return (
        <TooltipProvider>
            <div className="flex flex-col md:flex-row min-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">

                 {/* Left Panel - Integrated Tabs */}
                 <LeftPanel
                     character={character}
                     inventory={inventory}
                     isGeneratingSkillTree={isGeneratingSkillTree}
                     turnCount={turnCount}
                     renderReputation={renderReputation}
                     renderNpcRelationships={renderNpcRelationships}
                 />

                 {/* Main Panel (Narration & Input) */}
                <div className="flex-1 flex flex-col p-4 overflow-hidden">

                     {/* Mobile Top Bar & Sheets */}
                     <MobileSheet
                        character={character}
                        inventory={inventory}
                        isGeneratingSkillTree={isGeneratingSkillTree}
                        turnCount={turnCount}
                        renderReputation={renderReputation}
                        renderNpcRelationships={renderNpcRelationships}
                        onSettingsOpen={() => setIsDesktopSettingsOpen(true)}
                     />

                     {/* Narration Area */}
                    <NarrationDisplay
                        storyLog={storyLog}
                        isLoading={isLoading}
                        isAssessingDifficulty={isAssessingDifficulty}
                        isRollingDice={isRollingDice}
                        isGeneratingSkillTree={isGeneratingSkillTree}
                        isEnding={isEnding}
                        isSaving={isSaving}
                        isCraftingLoading={isCraftingLoading}
                        diceResult={diceResult}
                        diceType={diceType}
                        error={error}
                        branchingChoices={branchingChoices}
                        handlePlayerAction={handlePlayerAction}
                        isInitialLoading={isInitialLoading} // Pass the state down
                    />

                    {/* Input Area */}
                    <ActionInput
                        onSubmit={handlePlayerAction}
                        onSuggest={handleSuggestAction}
                        onCraft={() => setIsCraftingDialogOpen(true)}
                         disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading || isInitialLoading} // Disable during initial load
                    />

                    {/* Action Buttons */}
                    <GameplayActions
                        onSave={handleSaveGame}
                        onAbandon={handleGoBack}
                        onEnd={() => handleEndAdventure()}
                        onSettings={() => setIsDesktopSettingsOpen(true)}
                        disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}
                        isMobile={isMobile}
                        currentAdventureId={currentAdventureId}
                    />

                     {/* Dialogs */}
                    <ClassChangeDialog
                        isOpen={!!pendingClassChange}
                        onOpenChange={(open) => !open && setPendingClassChange(null)} // Close if dialog is dismissed
                        character={character}
                        pendingClassChange={pendingClassChange}
                        onConfirm={handleConfirmClassChange}
                    />

                    <CraftingDialog
                        isOpen={isCraftingDialogOpen}
                        onOpenChange={setIsCraftingDialogOpen}
                        inventory={inventory}
                        onCraft={handleCrafting}
                    />

                     {/* Settings Panel Sheet (Triggered by both mobile and desktop) */}
                    <Sheet open={isDesktopSettingsOpen} onOpenChange={setIsDesktopSettingsOpen}>
                       <SettingsPanel isOpen={isDesktopSettingsOpen} onOpenChange={setIsDesktopSettingsOpen} />
                    </Sheet>
                </div>
            </div>
        </TooltipProvider>
    );
}
