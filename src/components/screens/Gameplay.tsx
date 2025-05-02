// src/components/screens/Gameplay.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useGame, type InventoryItem, type StoryLogEntry, type SkillTree } from "@/context/GameContext"; // Added StoryLogEntry, SkillTree
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Added ScrollBar
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { CharacterDisplay } from "@/components/game/CharacterDisplay";
import { InventoryDisplay } from "@/components/game/InventoryDisplay";
import { narrateAdventure, type NarrateAdventureInput, type NarrateAdventureOutput } from "@/ai/flows/narrate-adventure"; // Import types
import { summarizeAdventure } from "@/ai/flows/summarize-adventure";
import { assessActionDifficulty, type DifficultyLevel } from "@/ai/flows/assess-action-difficulty";
import { generateSkillTree } from "@/ai/flows/generate-skill-tree"; // Import skill tree generation flow
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Loader2, BookCopy, ArrowLeft, Info, Dices, Sparkles, Save, Backpack, Workflow } from "lucide-react"; // Added Workflow icon
import { rollDice, rollDifficultDice } from "@/services/dice-roller";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SkillTreeDisplay } from "@/components/game/SkillTreeDisplay"; // Import SkillTreeDisplay

// Helper function to map difficulty dice string to roller function
const getDiceRollFunction = (diceType: string): (() => Promise<number>) | null => {
  switch (diceType) {
    case 'd6':
    case 'd10': return rollDice;
    case 'd20': return rollDice; // Map d20 to d10 for now
    case 'd100': return rollDifficultDice;
    case 'None': default: return null;
  }
};

// Placeholder for image URI generation
async function generatePlaceholderImageUri(itemName: string): Promise<string> {
    let hash = 0;
    for (let i = 0; i < itemName.length; i++) hash = itemName.charCodeAt(i) + ((hash << 5) - hash);
    const width = 200 + (Math.abs(hash) % 101);
    const height = 200 + (Math.abs(hash >> 16) % 101);
    return `https://picsum.photos/${width}/${height}?random=${encodeURIComponent(itemName)}&t=${Date.now()}`;
}


export function Gameplay() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const { character, currentNarration, currentGameStateString, storyLog, adventureSettings, inventory, currentAdventureId, isGeneratingSkillTree } = state;
  const [playerInput, setPlayerInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // General loading for narration/assessment
  const [isEnding, setIsEnding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAssessingDifficulty, setIsAssessingDifficulty] = useState(false);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [diceType, setDiceType] = useState<string>("None");
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const [isGeneratingInventoryImages, setIsGeneratingInventoryImages] = useState(false);
  const [pendingClassChange, setPendingClassChange] = useState<string | null>(null); // State for pending class change confirmation


  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
     scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

   // --- Handle Inventory Image Generation ---
   const generateInventoryImages = useCallback(async (itemNames: string[]) => {
       if (!itemNames || itemNames.length === 0 || isGeneratingInventoryImages) return;
       const itemsInStateNeedingImage = inventory.filter(item => itemNames.includes(item.name) && !item.imageDataUri);
       const namesInList = new Set(itemNames);
       const itemsMissingFromList = inventory.filter(item => namesInList.has(item.name) && !item.imageDataUri);
       const combinedNeedsGeneration = [...new Set([...itemsInStateNeedingImage, ...itemsMissingFromList])];
       if (combinedNeedsGeneration.length === 0) {
           const finalInventory = inventory.filter(item => namesInList.has(item.name));
           if(finalInventory.length !== inventory.length || !finalInventory.every((item, index) => item.name === inventory[index]?.name)) {
                dispatch({ type: "UPDATE_CHARACTER", payload: { inventory: finalInventory } as any });
           }
           return;
       }
       setIsGeneratingInventoryImages(true);
       console.log("Generating images for inventory items:", combinedNeedsGeneration.map(i => i.name));
       toast({ title: "Loading Item Images...", description: `Fetching visuals for ${combinedNeedsGeneration.length} item(s).`, duration: 2000 });
       try {
           const generationPromises = combinedNeedsGeneration.map(async (item) => {
               const imageDataUri = await generatePlaceholderImageUri(item.name);
               return { name: item.name, imageDataUri };
           });
           const generatedItemsData = await Promise.all(generationPromises);
           const generatedMap = new Map(generatedItemsData.map(item => [item.name, item.imageDataUri]));
           const finalInventory = itemNames.map(name => {
               const existingItem = inventory.find(i => i.name === name);
               const generatedUri = generatedMap.get(name);
               return { name: name, description: existingItem?.description, imageDataUri: generatedUri || existingItem?.imageDataUri };
           });
           dispatch({ type: "UPDATE_CHARACTER", payload: { inventory: finalInventory } as any });
           console.log("Finished generating inventory images.");
       } catch (error) {
           console.error("Error generating inventory images:", error);
           toast({ title: "Image Loading Error", description: "Could not load some item images.", variant: "destructive" });
           const fallbackInventory = itemNames.map(name => {
               const existingItem = inventory.find(i => i.name === name);
               return { name: name, description: existingItem?.description, imageDataUri: existingItem?.imageDataUri };
            });
           dispatch({ type: "UPDATE_CHARACTER", payload: { inventory: fallbackInventory } as any });
       } finally {
           setIsGeneratingInventoryImages(false);
       }
   }, [inventory, dispatch, toast, isGeneratingInventoryImages]);


  // --- Trigger Skill Tree Generation ---
   const triggerSkillTreeGeneration = useCallback(async (charClass: string) => {
        if (!charClass || isGeneratingSkillTree) return;
        console.log(`Triggering skill tree generation for class: ${charClass}`);
        dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true });
        setError(null);
        toast({ title: "Generating Skill Tree...", description: `Crafting abilities for the ${charClass} class...` });

        try {
            const skillTreeResult = await generateSkillTree({ characterClass: charClass });
            dispatch({ type: "SET_SKILL_TREE", payload: { class: charClass, skillTree: skillTreeResult } });
            toast({ title: "Skill Tree Generated!", description: `The path of the ${charClass} is set.` });
        } catch (err: any) {
            console.error("Skill tree generation failed:", err);
            setError(`Failed to generate skill tree: ${err.message}. Using default progression.`);
            toast({ title: "Skill Tree Error", description: "Could not generate skill tree. Proceeding without specific skills.", variant: "destructive" });
            // Handle fallback - maybe set skillTree to null or a default structure
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false }); // Ensure loading stops
        }
        // No finally needed for setting generating false, reducer handles it on SET_SKILL_TREE or explicitly above on error
   }, [dispatch, toast, isGeneratingSkillTree]); // Removed character dependency


   // --- Confirm and Handle Class Change ---
   const handleConfirmClassChange = useCallback(async (newClass: string) => {
        if (!character || !newClass || isGeneratingSkillTree) return;
        console.log(`Confirmed class change to: ${newClass}`);
        setPendingClassChange(null); // Close the dialog trigger
        dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true }); // Set generating state for new tree
        toast({ title: `Becoming a ${newClass}...`, description: "Generating new skill path..." });

        try {
            const newSkillTree = await generateSkillTree({ characterClass: newClass });
            dispatch({ type: "CHANGE_CLASS_AND_RESET_SKILLS", payload: { newClass, newSkillTree } });
            toast({ title: `Class Changed to ${newClass}!`, description: "Your abilities and progression have been reset." });
        } catch (err: any) {
            console.error("Failed to generate skill tree for new class:", err);
            toast({ title: "Class Change Error", description: `Could not generate skill tree for ${newClass}. Class change aborted.`, variant: "destructive" });
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false }); // Stop loading on error
        }
   }, [character, dispatch, toast, isGeneratingSkillTree]);


  // --- Handle Player Action Submission ---
  const handlePlayerAction = useCallback(async (action: string, isInitialAction = false) => {
     if (!character || isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree) {
       console.log("Action blocked: No character or already busy.", { isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages, isGeneratingSkillTree });
       let reason = "Please wait for the current action to complete.";
       if (isGeneratingSkillTree) reason = "Please wait for skill tree generation to finish.";
       toast({ description: reason, variant: "default", duration: 1500 });
       return;
     }

    // Check if skill tree exists, trigger generation if not
    if (!character.skillTree && !isGeneratingSkillTree) {
        triggerSkillTreeGeneration(character.class);
        // Optionally wait or just let the next action handle the loading state
        toast({ description: "Initializing skill tree before proceeding...", duration: 1500 });
        return; // Prevent action until tree is generated
    }

    console.log(`Handling action: "${action}"`);
    setIsLoading(true); // General loading for the whole process
    setError(null);
    setDiceResult(null);
    setDiceType("None");

    let actionWithDice = action;
    let assessedDifficulty: DifficultyLevel = "Normal";
    let difficultyReasoning = "";
    let requiresRoll = false;
    let rollFunction: (() => Promise<number>) | null = null;

    // --- 1. Assess Difficulty (unless passive/initial) ---
    const actionLower = action.trim().toLowerCase();
    const isPassiveAction = ["look", "look around", "check inventory", "examine self", "status", "wait", "rest"].includes(actionLower);

    if (!isInitialAction && !isPassiveAction) {
        setIsAssessingDifficulty(true);
        toast({ title: "Assessing Challenge...", description: "Determining difficulty...", duration: 1500 });
        await new Promise(resolve => setTimeout(resolve, 400));

        try {
             const assessmentInput = {
                playerAction: action,
                characterCapabilities: `Class: ${character.class}. Stage: ${character.skillTreeStage}. Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, AGI ${character.stats.agility}. Traits: ${character.traits.join(', ') || 'None'}. Knowledge: ${character.knowledge.join(', ') || 'None'}. Background: ${character.background}. Inventory: ${inventory.map(i => i.name).join(', ') || 'Empty'}`,
                currentSituation: currentNarration?.narration || "At the beginning of the scene.",
                gameStateSummary: currentGameStateString,
             };
            const assessmentResult = await assessActionDifficulty(assessmentInput);
            assessedDifficulty = assessmentResult.difficulty;
            difficultyReasoning = assessmentResult.reasoning;
            setDiceType(assessmentResult.suggestedDice);
            rollFunction = getDiceRollFunction(assessmentResult.suggestedDice);
            requiresRoll = assessedDifficulty !== "Trivial" && assessedDifficulty !== "Impossible" && rollFunction !== null;

            toast({ title: `Difficulty: ${assessedDifficulty}`, description: difficultyReasoning.substring(0, 100), duration: 2500 });
            await new Promise(resolve => setTimeout(resolve, 600));

            if (assessedDifficulty === "Impossible") {
                setError(`Action seems impossible: ${difficultyReasoning} Try something else.`);
                toast({ title: "Action Impossible", description: difficultyReasoning, variant: "destructive", duration: 4000 });
                setIsLoading(false);
                setIsAssessingDifficulty(false);
                setPlayerInput("");
                scrollToBottom();
                return;
            }
        } catch (assessError: any) {
            console.error("Difficulty assessment failed:", assessError);
            setError("Failed to assess difficulty. Assuming 'Normal'.");
            toast({ title: "Assessment Error", description: "Assuming normal difficulty.", variant: "destructive" });
            assessedDifficulty = "Normal";
            setDiceType("d10");
            rollFunction = rollDice;
            requiresRoll = true;
        } finally {
            setIsAssessingDifficulty(false);
        }
    } else {
        requiresRoll = false;
        assessedDifficulty = "Trivial";
        difficultyReasoning = "Passive or initial action.";
        setDiceType("None");
    }

    // --- 2. Roll Dice (if required) ---
    if (requiresRoll && rollFunction) {
        setIsRollingDice(true);
        toast({ title: `Rolling ${diceType}...`, description: "Testing fate...", duration: 1500 });
        await new Promise(resolve => setTimeout(resolve, 600));
        try {
            const roll = await rollFunction();
            setDiceResult(roll);
            actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll Result: ${roll}/${diceType.substring(1)})`;
            console.log(`Dice rolled ${diceType}: ${roll}`);
            const numericDiceType = parseInt(diceType.substring(1), 10);
            const successThreshold = Math.ceil(numericDiceType * 0.6);
            const failThreshold = Math.floor(numericDiceType * 0.3);
            let outcomeDesc = "Average outcome.";
            if (roll >= successThreshold) outcomeDesc = "Success!";
            if (roll <= failThreshold) outcomeDesc = "Challenging...";
            toast({ title: `Rolled ${roll} on ${diceType}!`, description: outcomeDesc, duration: 2000 });
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (diceError) {
            console.error("Dice roll failed:", diceError);
            setError("The dice seem unresponsive... Proceeding based on skill.");
            toast({ title: "Dice Error", description: "Could not roll dice.", variant: "destructive" });
            actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll: Failed)`;
        } finally {
            setIsRollingDice(false);
        }
    } else if (!isPassiveAction && assessedDifficulty !== "Impossible") {
         actionWithDice += ` (Difficulty: ${assessedDifficulty}, No Roll Required)`;
    }

    // --- 3. Narrate Action Outcome ---
     // Prepare skill tree summary for the AI prompt
    let skillTreeSummaryForAI = null;
    if (character.skillTree && character.skillTreeStage > 0) {
        const currentStageData = character.skillTree.stages.find(s => s.stage === character.skillTreeStage);
        skillTreeSummaryForAI = {
            className: character.skillTree.className,
            stageCount: character.skillTree.stages.length,
            skillsInCurrentStage: currentStageData ? currentStageData.skills.map(s => s.name) : [],
        };
    } else if (character.skillTree) {
         skillTreeSummaryForAI = {
             className: character.skillTree.className,
             stageCount: character.skillTree.stages.length,
             skillsInCurrentStage: [], // No skills at stage 0
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
        skillTreeSummary: skillTreeSummaryForAI, // Pass summary
        skillTreeStage: character.skillTreeStage, // Pass current stage
        aiGeneratedDescription: character.aiGeneratedDescription,
      },
      playerChoice: actionWithDice,
      gameState: currentGameStateString,
      previousNarration: storyLog.length > 0 ? storyLog[storyLog.length - 1].narration : undefined,
    };

    try {
      console.log("Sending to narrateAdventure flow:", JSON.stringify(inputForAI, null, 2));
      const result: NarrateAdventureOutput = await narrateAdventure(inputForAI);
      console.log("Received from narrateAdventure flow:", result);

      const logEntryForResult: StoryLogEntry = {
          narration: result.narration,
          updatedGameState: result.updatedGameState,
          updatedInventory: result.updatedInventory,
          updatedStats: result.updatedStats,
          updatedTraits: result.updatedTraits,
          updatedKnowledge: result.updatedKnowledge,
          updatedClass: result.updatedClass, // Can be directly updated by AI (though prompt discourages it)
          progressedToStage: result.progressedToStage,
          suggestedClassChange: result.suggestedClassChange,
          timestamp: Date.now(),
      };
      dispatch({ type: "UPDATE_NARRATION", payload: logEntryForResult });
      setError(null);

      // Handle inventory image generation
      if (result.updatedInventory) {
         await generateInventoryImages(result.updatedInventory);
      }

      // Handle AI-driven progression AFTER updating narration/state
       if (result.progressedToStage && result.progressedToStage > character.skillTreeStage) {
           dispatch({ type: "PROGRESS_SKILL_STAGE", payload: result.progressedToStage });
           toast({ title: "Skill Stage Increased!", description: `You've reached Stage ${result.progressedToStage} of the ${character.class} path!`, duration: 4000 });
       }

        // Handle suggested class change - set state to trigger confirmation dialog
       if (result.suggestedClassChange && result.suggestedClassChange !== character.class) {
            console.log(`AI suggested class change to: ${result.suggestedClassChange}`);
            setPendingClassChange(result.suggestedClassChange); // Trigger dialog
       }


       // --- Check for End Game Condition ---
       const lowerNarration = result.narration?.toLowerCase() || "";
       const lowerGameState = result.updatedGameState?.toLowerCase() || "";
       const isGameOver = lowerGameState.includes("game over") || lowerNarration.includes("your adventure ends") || lowerNarration.includes("you have died") || lowerNarration.includes("you achieved victory");

       if (isGameOver) {
            if (adventureSettings.permanentDeath && (lowerNarration.includes("you have died"))) {
                toast({title: "Game Over!", description: "Your journey has reached its final, permanent end.", variant: "destructive", duration: 5000});
                await handleEndAdventure(logEntryForResult);
            } else if (lowerNarration.includes("you have died")) {
                toast({title: "Defeat!", description: "You were overcome, but perhaps fate offers another chance (Respawn not implemented).", variant: "destructive", duration: 5000});
                 await handleEndAdventure(logEntryForResult);
            } else {
                 toast({title: "Adventure Concluded!", description: "Your tale reaches its current conclusion.", duration: 5000});
                 await handleEndAdventure(logEntryForResult);
            }
       }

    } catch (err: any) {
      console.error("Narration error:", err);
      const errorMessage = err.message || "The story encountered an unexpected snag.";
      setError(`${errorMessage} Perhaps try a different approach?`);
      toast({ title: "Story Error", description: errorMessage.substring(0, 100), variant: "destructive"});
    } finally {
      setIsLoading(false);
      if (!isInitialAction) setPlayerInput("");
      requestAnimationFrame(scrollToBottom);
    }
  }, [
      character, inventory, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages,
      isGeneratingSkillTree, // Include skill tree generation state
      currentGameStateString, currentNarration, storyLog, adventureSettings, dispatch, toast, scrollToBottom, generateInventoryImages,
      triggerSkillTreeGeneration // Add trigger function dependency
  ]);


  // --- End Adventure ---
  const handleEndAdventure = useCallback(async (finalNarrationEntry?: StoryLogEntry) => {
     if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree) return;
     setIsEnding(true);
     setError(null);
     toast({ title: "Ending Adventure", description: "Summarizing your tale..." });
     const finalContext = finalNarrationEntry ?? (storyLog.length > 0 ? storyLog[storyLog.length - 1] : null);
     let summary = "Your adventure has concluded.";
     const fullStoryLog = [...storyLog];
     if (finalNarrationEntry && (!storyLog.length || storyLog[storyLog.length - 1].narration !== finalNarrationEntry.narration)) {
        fullStoryLog.push(finalNarrationEntry);
     }
     const hasLog = fullStoryLog.length > 0;
     if (hasLog) {
         const fullStory = fullStoryLog.map((log, index) => `[Turn ${index + 1}]\n${log.narration}`).join("\n\n---\n\n");
         if(fullStory.trim().length > 0) {
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
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages, isGeneratingSkillTree, storyLog, currentNarration, dispatch, toast]);


   // --- Handle Save Game ---
   const handleSaveGame = useCallback(async () => {
        if (isLoading || isEnding || isSaving || !currentAdventureId || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree) return;
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
   }, [dispatch, toast, isLoading, isEnding, isSaving, currentAdventureId, character, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages, isGeneratingSkillTree]);


  // --- Initial Narration & Skill Tree Trigger ---
  useEffect(() => {
     if (state.status !== "Gameplay" || !character || isLoading || isEnding || isSaving || isGeneratingSkillTree) return;

     const isNewGame = storyLog.length === 0 && !state.savedAdventures.some(s => s.id === state.currentAdventureId);
     const isLoadedGame = storyLog.length > 0 && state.savedAdventures.some(s => s.id === state.currentAdventureId);

     if (isNewGame) {
         console.log("Gameplay: New game started.");
          // Trigger skill tree generation FIRST if needed
          if (!character.skillTree) {
             console.log("Gameplay: Triggering initial skill tree generation.");
             triggerSkillTreeGeneration(character.class);
             // Don't trigger initial narration yet, wait for skill tree
          } else if (!isLoading && !isGeneratingSkillTree) { // Only trigger narration if tree exists and not loading
             console.log("Gameplay: Triggering initial narration (skill tree exists).");
             handlePlayerAction("Begin the adventure by looking around.", true);
             if (inventory.length > 0) {
                 generateInventoryImages(inventory.map(i => i.name));
             }
          }
     } else if (isLoadedGame) {
         console.log("Gameplay: Resumed loaded game.");
         toast({ title: "Game Loaded", description: `Resuming adventure for ${character.name}.`, duration: 3000 });
          // Ensure skill tree exists on load, generate if missing (e.g., from older save)
          if (!character.skillTree && !isGeneratingSkillTree) {
              console.log("Gameplay (Load): Triggering skill tree generation for loaded character.");
              triggerSkillTreeGeneration(character.class);
          }
          generateInventoryImages(inventory.map(i => i.name));
          requestAnimationFrame(scrollToBottom);
     }
  // Trigger specifically when skill tree becomes available after generation in a new game
  }, [state.status, character?.name, character?.class, character?.skillTree, state.currentAdventureId, storyLog.length, isLoading, isEnding, isSaving, isGeneratingSkillTree, triggerSkillTreeGeneration, handlePlayerAction, generateInventoryImages, inventory, state.savedAdventures, toast, scrollToBottom]);


   // Scroll to bottom effect
   useEffect(() => {
       scrollToBottom();
   }, [storyLog, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, diceResult, error, scrollToBottom]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = playerInput.trim();
     const busy = isLoading || isAssessingDifficulty || isRollingDice || isEnding || isSaving || isGeneratingInventoryImages || isGeneratingSkillTree;
    if (trimmedInput && !busy) {
       handlePlayerAction(trimmedInput);
    } else if (!trimmedInput) {
        toast({ description: "Please enter an action.", variant: "destructive"});
    } else if (busy) {
        let reason = "Please wait for the current action to complete.";
        if (isGeneratingSkillTree) reason = "Generating skill tree...";
        toast({ description: reason, variant: "default", duration: 2000 });
    }
  };


   // --- Go Back (Abandon Adventure) ---
   const handleGoBack = useCallback(() => {
        if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree) return;
        toast({ title: "Returning to Main Menu...", description: "Abandoning current adventure." });
        dispatch({ type: "RESET_GAME" });
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages, isGeneratingSkillTree, dispatch, toast]);


   // --- Suggest Action ---
   const handleSuggestAction = useCallback(() => {
       if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree) return;
        const suggestions = [ "Look around", "Examine surroundings", "Check inventory", "Check status", "Move north", "Move east", "Move south", "Move west", "Talk to [NPC Name]", "Ask about [Topic]", "Examine [Object]", "Pick up [Item]", "Use [Item]", "Drop [Item]", "Open [Door/Chest]", "Search the area", "Rest here", "Wait for a while", "Attack [Target]", "Defend yourself", "Flee", "Cast [Spell Name]", "Use skill: [Skill Name]", ];
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        setPlayerInput(suggestion);
        toast({ title: "Suggestion", description: `Try: "${suggestion}"`, duration: 3000 });
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages, isGeneratingSkillTree, toast]);

   if (!character) {
       return (
           <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
               <Loader2 className="h-12 w-12 animate-spin text-primary" />
               <p className="text-lg text-muted-foreground">Loading Character Data...</p>
               <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="outline"> Return to Main Menu </Button>
           </div>
       );
   }

   // Helper function to render dynamic content at the end of the scroll area
   const renderDynamicContent = () => {
     const busy = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree;
     if (isGeneratingSkillTree) {
         return (
             <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse">
                 <Workflow className="h-5 w-5 mr-2 animate-spin"/>
                 <span>Generating skill tree...</span>
             </div>
         );
     }
     if (isGeneratingInventoryImages && !isLoading) {
        return ( <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse"> <Loader2 className="h-5 w-5 mr-2 animate-spin"/> <span>Loading item images...</span> </div> );
     }
    if (isSaving) {
        return ( <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse"> <Save className="h-5 w-5 mr-2 animate-ping" /> <span>Saving progress...</span> </div> );
    }
    if (isEnding) {
        return ( <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse"> <BookCopy className="h-5 w-5 mr-2 animate-pulse" /> <span>Ending and summarizing...</span> </div> );
    }
    if (isLoading) {
      let loadingText = "The story unfolds..."; let LoadingIcon = Loader2;
      if (isAssessingDifficulty) loadingText = "Assessing difficulty...";
      else if (isRollingDice) { loadingText = `Rolling ${diceType}...`; LoadingIcon = Dices; }
      return ( <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse"> <LoadingIcon className={`h-5 w-5 mr-2 ${isRollingDice ? 'animate-spin duration-500' : 'animate-spin'}`} /> <span>{loadingText}</span> </div> );
    }
    if (diceResult !== null && diceType !== "None") {
      return ( <div key={`dice-${Date.now()}`} className="flex items-center justify-center py-2 text-accent font-semibold italic animate-fade-in-out"> <Dices className="h-5 w-5 mr-2" /> Rolled {diceResult} on {diceType}! </div> );
    }
    if (error) {
      return ( <Alert variant="destructive" className="my-4"> <Info className="h-4 w-4" /> <AlertTitle>Story Hiccup</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> );
    }
     if (storyLog.length === 0 && !busy) {
         return <p className="text-center text-muted-foreground italic py-4">Initializing your adventure...</p>;
     }
    return null;
   };

  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">
        {/* Left Panel (Character & Actions) - Fixed width */}
        <div className="hidden md:flex flex-col w-80 lg:w-96 p-4 border-r border-foreground/10 overflow-y-auto bg-card/50 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
             <CharacterDisplay />

             {/* Actions at the bottom */}
             <div className="mt-auto space-y-2 pt-4 sticky bottom-0 bg-card/50 pb-4">
                 {/* Inventory Trigger */}
                 <Sheet>
                     <SheetTrigger asChild>
                         <Button variant="outline" className="w-full" disabled={isLoading || isGeneratingInventoryImages}>
                             <Backpack className="mr-2 h-4 w-4" /> View Inventory
                         </Button>
                     </SheetTrigger>
                     <SheetContent side="left" className="w-full sm:w-96 p-0 flex flex-col">
                         <SheetHeader className="p-4 border-b"> <SheetTitle>Inventory</SheetTitle> <SheetDescription> Items carried by {character.name}. </SheetDescription> </SheetHeader>
                         <div className="flex-grow overflow-hidden"> <InventoryDisplay /> </div>
                     </SheetContent>
                 </Sheet>

                  {/* Skill Tree Trigger */}
                  <Sheet>
                     <SheetTrigger asChild>
                         <Button variant="outline" className="w-full" disabled={isLoading || isGeneratingSkillTree || !character.skillTree}>
                              {isGeneratingSkillTree ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Workflow className="mr-2 h-4 w-4" />}
                              {isGeneratingSkillTree ? "Generating..." : "View Skill Tree"}
                         </Button>
                     </SheetTrigger>
                     <SheetContent side="left" className="w-full sm:w-96 p-0 flex flex-col">
                         <SheetHeader className="p-4 border-b"> <SheetTitle>Skill Tree: {character.skillTree?.className || character.class}</SheetTitle> <SheetDescription> Current Stage: {character.skillTreeStage} / 4 </SheetDescription> </SheetHeader>
                         <div className="flex-grow overflow-hidden">
                            {character.skillTree ? <SkillTreeDisplay skillTree={character.skillTree} currentStage={character.skillTreeStage} /> : <p className="p-4 text-muted-foreground italic">No skill tree available.</p>}
                         </div>
                     </SheetContent>
                  </Sheet>


                 <Button variant="secondary" onClick={handleSaveGame} className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" /> } {isSaving ? "Saving..." : "Save Game"}
                 </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Abandon Adventure
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader> <AlertDialogTitle>Are you sure?</AlertDialogTitle> <AlertDialogDescription> Abandoning the adventure will end your current progress (any unsaved changes will be lost) and return you to the main menu. </AlertDialogDescription> </AlertDialogHeader>
                    <AlertDialogFooter> <AlertDialogCancel>Cancel</AlertDialogCancel> <AlertDialogAction onClick={handleGoBack} className="bg-destructive hover:bg-destructive/90">Abandon</AlertDialogAction> </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                 <Button variant="destructive" onClick={() => handleEndAdventure()} className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree}>
                     {isEnding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BookCopy className="mr-2 h-4 w-4" /> } {isEnding ? "Summarizing..." : "End & Summarize"}
                 </Button>
             </div>
        </div>

        {/* Right Panel (Story & Input) */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden flex justify-between items-center mb-2 pb-2 border-b border-foreground/10">
                 <h2 className="text-lg font-semibold truncate">{character.name}</h2>
                 <div>
                      {/* Mobile Inventory Trigger */}
                     <Sheet>
                         <SheetTrigger asChild> <Button variant="ghost" size="icon"> <Backpack className="h-5 w-5" /> <span className="sr-only">Open Inventory</span> </Button> </SheetTrigger>
                         <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col">
                             <SheetHeader className="p-4 border-b"> <SheetTitle>Inventory</SheetTitle> </SheetHeader>
                             <div className="flex-grow overflow-hidden"> <InventoryDisplay /> </div>
                         </SheetContent>
                     </Sheet>
                      {/* Mobile Skill Tree Trigger */}
                     <Sheet>
                         <SheetTrigger asChild>
                             <Button variant="ghost" size="icon" disabled={isGeneratingSkillTree || !character.skillTree}>
                                 <Workflow className="h-5 w-5" /> <span className="sr-only">Open Skill Tree</span>
                             </Button>
                         </SheetTrigger>
                         <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col">
                             <SheetHeader className="p-4 border-b"> <SheetTitle>Skill Tree: {character.skillTree?.className || character.class}</SheetTitle> <SheetDescription> Current Stage: {character.skillTreeStage} / 4 </SheetDescription> </SheetHeader>
                             <div className="flex-grow overflow-hidden">
                                 {character.skillTree ? <SkillTreeDisplay skillTree={character.skillTree} currentStage={character.skillTreeStage} /> : <p className="p-4 text-muted-foreground italic">No skill tree available.</p>}
                             </div>
                         </SheetContent>
                     </Sheet>
                 </div>
            </div>

            {/* Story Display Area */}
            <CardboardCard className="flex-1 flex flex-col overflow-hidden mb-4 border-2 border-foreground/20 shadow-inner">
                 <CardHeader className="py-3 px-4 border-b border-foreground/10"> <CardTitle className="text-lg font-semibold">Story Log</CardTitle> </CardHeader>
                 <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                            {storyLog.map((log, index) => (
                                <div key={log.timestamp ? `log-${log.timestamp}-${index}` : `log-fallback-${index}`} className="pb-4 border-b border-foreground/10 last:border-b-0">
                                    <p className="text-base whitespace-pre-wrap leading-relaxed text-foreground">{log.narration}</p>
                                </div>
                            ))}
                            {renderDynamicContent()}
                            <div ref={scrollEndRef} style={{ height: '1px' }} />
                        </div>
                         <ScrollBar orientation="vertical" />
                    </ScrollArea>
                 </CardContent>
            </CardboardCard>

             {/* Input Area */}
             <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-auto">
                <Button type="button" variant="ghost" size="icon" onClick={handleSuggestAction} disabled={isLoading || isAssessingDifficulty || isRollingDice || isEnding || isSaving || isGeneratingInventoryImages || isGeneratingSkillTree} aria-label="Suggest an action" className="text-muted-foreground hover:text-accent flex-shrink-0" title="Suggest Action">
                    <Sparkles className="h-5 w-5" />
                </Button>
                <Input type="text" value={playerInput} onChange={(e) => setPlayerInput(e.target.value)} placeholder="What do you do next?" disabled={isLoading || isAssessingDifficulty || isRollingDice || isEnding || isSaving || isGeneratingInventoryImages || isGeneratingSkillTree} className="flex-grow text-base h-11 min-w-0" aria-label="Player action input" autoComplete="off" />
                <Button type="submit" disabled={isLoading || isAssessingDifficulty || isRollingDice || isEnding || isSaving || isGeneratingInventoryImages || isGeneratingSkillTree || !playerInput.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground h-11 px-5 flex-shrink-0" aria-label="Submit action">
                   {(isLoading || isGeneratingInventoryImages || isGeneratingSkillTree) ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5" />}
                </Button>
             </form>

             {/* Buttons for smaller screens (Mobile View) */}
              <div className="md:hidden flex flex-col gap-2 mt-4 border-t pt-4">
                   <CharacterDisplay />
                   <Button variant="secondary" onClick={handleSaveGame} className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" /> } {isSaving ? "Saving..." : "Save Game"}
                   </Button>
                  <AlertDialog>
                     <AlertDialogTrigger asChild> <Button variant="outline" className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree}> <ArrowLeft className="mr-2 h-4 w-4" /> Abandon </Button> </AlertDialogTrigger>
                     <AlertDialogContent> <AlertDialogHeader> <AlertDialogTitle>Are you sure?</AlertDialogTitle> <AlertDialogDescription> Abandoning the adventure will end your current progress (unsaved changes lost) and return you to the main menu. </AlertDialogDescription> </AlertDialogHeader> <AlertDialogFooter> <AlertDialogCancel>Cancel</AlertDialogCancel> <AlertDialogAction onClick={handleGoBack} className="bg-destructive hover:bg-destructive/90">Abandon</AlertDialogAction> </AlertDialogFooter> </AlertDialogContent>
                 </AlertDialog>
                 <Button variant="destructive" onClick={() => handleEndAdventure()} className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages || isGeneratingSkillTree}>
                    {isEnding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BookCopy className="mr-2 h-4 w-4" /> } {isEnding ? "Summarizing..." : "End Adventure"}
                 </Button>
             </div>
        </div>

        {/* Class Change Confirmation Dialog */}
        {pendingClassChange && (
             <AlertDialog open={!!pendingClassChange} onOpenChange={(open) => !open && setPendingClassChange(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Class Change Suggested!</AlertDialogTitle>
                        <AlertDialogDescription>
                             Your actions suggest a path closer to the <span className="font-semibold">{pendingClassChange}</span> class. Would you like to embrace this change? Your current class progress (<span className="font-semibold">{character.class} - Stage {character.skillTreeStage}</span>) will be reset, and you'll start fresh on the {pendingClassChange} skill tree.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPendingClassChange(null)}>Stay as {character.class}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleConfirmClassChange(pendingClassChange)} className="bg-accent hover:bg-accent/90">Become a {pendingClassChange}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
             </AlertDialog>
        )}
    </div>
  );
}
