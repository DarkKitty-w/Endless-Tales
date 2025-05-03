// src/components/screens/Gameplay.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useGame, type InventoryItem, type StoryLogEntry, type SkillTree, type Skill, type Character, type Reputation, type NpcRelationships, calculateXpToNextLevel } from "@/context/GameContext"; // Added NpcRelationships
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { CharacterDisplay } from "@/components/game/CharacterDisplay";
import { InventoryDisplay } from "@/components/game/InventoryDisplay";
import { narrateAdventure, type NarrateAdventureInput, type NarrateAdventureOutput } from "@/ai/flows/narrate-adventure";
import { summarizeAdventure } from "@/ai/flows/summarize-adventure";
import { assessActionDifficulty, type DifficultyLevel } from "@/ai/flows/assess-action-difficulty";
import { generateSkillTree } from "@/ai/flows/generate-skill-tree";
import { attemptCrafting, type AttemptCraftingInput, type AttemptCraftingOutput } from "@/ai/flows/attempt-crafting"; // Import crafting flow
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Loader2, BookCopy, ArrowLeft, Info, Dices, Sparkles, Save, Backpack, Workflow, User, Star, ThumbsUp, ThumbsDown, Award, Hammer, CheckSquare, Square, Users, Milestone, CalendarClock, Skull, HeartPulse } from "lucide-react"; // Added Milestone, CalendarClock, Skull, HeartPulse, Users
import { rollD6, rollD10, rollD20, rollD100 } from "@/services/dice-roller"; // Import specific rollers
import { useToast } from "@/hooks/use-toast"; // Import useToast hook
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
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogFooter,
   DialogClose, // Import DialogClose
} from "@/components/ui/dialog"; // Import Dialog components
import { SkillTreeDisplay } from "@/components/game/SkillTreeDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "../ui/progress"; // Import Progress
import { Skeleton } from "../ui/skeleton";
import { Label } from "../ui/label"; // Import Label
import { Badge } from "../ui/badge"; // Import Badge for item selection
import { getQualityColor } from "@/lib/utils"; // Import quality color helper

// Helper function to map difficulty dice string to roller function
const getDiceRollFunction = (diceType: string): (() => Promise<number>) | null => {
  switch (diceType) {
    case 'd6': return rollD6;
    case 'd10': return rollD10;
    case 'd20': return rollD20;
    case 'd100': return rollD100;
    case 'None': default: return null;
  }
};


export function Gameplay() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const { character, currentNarration, currentGameStateString, storyLog, adventureSettings, inventory, currentAdventureId, isGeneratingSkillTree, turnCount } = state; // Add turnCount
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
  const [pendingClassChange, setPendingClassChange] = useState<string | null>(null); // State for pending class change confirmation
  const [branchingChoices, setBranchingChoices] = useState<NarrateAdventureOutput['branchingChoices']>([]); // State for branching choices

  // Crafting state
  const [isCraftingDialogOpen, setIsCraftingDialogOpen] = useState(false);
  const [craftingGoal, setCraftingGoal] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]); // Changed to string array
  const [isCraftingLoading, setIsCraftingLoading] = useState(false);
  const [craftingError, setCraftingError] = useState<string | null>(null);

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
     // Add a small delay to allow the DOM to update before scrolling
     setTimeout(() => {
       scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
     }, 100);
  }, []);


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
   }, [dispatch, toast, isGeneratingSkillTree]);


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
     if (!character || isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree) {
       console.log("Action blocked: No character or already busy.", { isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree });
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
    setBranchingChoices([]); // Clear previous branching choices

    let actionWithDice = action;
    let assessedDifficulty: DifficultyLevel = "Normal";
    let difficultyReasoning = "";
    let requiresRoll = false;
    let rollFunction: (() => Promise<number>) | null = null;

    // --- 1. Assess Difficulty (unless passive/initial) ---
    const actionLower = action.trim().toLowerCase();
    const isPassiveAction = ["look", "look around", "check inventory", "check status", "check relationships", "check reputation"].includes(actionLower); // Added relationship/reputation checks

    if (!isInitialAction && !isPassiveAction) {
        setIsAssessingDifficulty(true);
        toast({ title: "Assessing Challenge...", description: "Determining difficulty...", duration: 1500 });
        await new Promise(resolve => setTimeout(resolve, 400));

        try {
             // Generate strings for reputation and relationships
             const reputationString = Object.entries(character.reputation)
                 .map(([faction, score]) => `${faction}: ${score}`)
                 .join(', ') || 'None';
             const relationshipString = Object.entries(character.npcRelationships)
                 .map(([npc, score]) => `${npc}: ${score}`)
                 .join(', ') || 'None';

             const assessmentInput = {
                playerAction: action,
                characterCapabilities: `Level: ${character.level}. Class: ${character.class}. Stage: ${character.skillTreeStage}. Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, AGI ${character.stats.agility}. Traits: ${character.traits.join(', ') || 'None'}. Knowledge: ${character.knowledge.join(', ') || 'None'}. Background: ${character.background}. Inventory: ${inventory.map(i => i.name).join(', ') || 'Empty'}. Stamina: ${character.currentStamina}/${character.maxStamina}. Mana: ${character.currentMana}/${character.maxMana}. Learned Skills: ${character.learnedSkills.map(s=>s.name).join(', ') || 'None'}. Reputation: ${reputationString}. Relationships: ${relationshipString}`,
                currentSituation: currentNarration?.narration || "At the beginning of the scene.",
                gameStateSummary: currentGameStateString,
                gameDifficulty: adventureSettings.difficulty, // Pass game difficulty
                turnCount: turnCount, // Pass turn count
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
            setError(`Failed to assess difficulty (${assessError.message}). Assuming 'Normal'.`);
            toast({ title: "Assessment Error", description: "Assuming normal difficulty.", variant: "destructive" });
            assessedDifficulty = "Normal";
            setDiceType("d10"); // Default to d10 on error
            rollFunction = rollD10; // Default roll function
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
            const numericDiceType = parseInt(diceType.substring(1), 10);
            // Ensure we have a valid number for the dice type before including it in the action string
            if (!isNaN(numericDiceType) && numericDiceType > 0) {
                actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll Result: ${roll}/${numericDiceType})`;
                console.log(`Dice rolled ${diceType}: ${roll}`);
                // Simple outcome logic: > 60% is success, < 30% is challenging/partial fail, rest is average
                const successThreshold = Math.ceil(numericDiceType * 0.6);
                const failThreshold = Math.floor(numericDiceType * 0.3);
                let outcomeDesc = "Average outcome.";
                if (roll >= successThreshold) outcomeDesc = "Success!";
                if (roll <= failThreshold) outcomeDesc = "Challenging...";
                toast({ title: `Rolled ${roll} on ${diceType}!`, description: outcomeDesc, duration: 2000 });
            } else {
                console.warn(`Dice roll successful (${roll}), but dice type '${diceType}' was unexpected. Not adding roll details to action string.`);
                actionWithDice += ` (Difficulty: ${assessedDifficulty}, Roll: ${roll})`; // Indicate roll happened but type was off
                toast({ title: `Rolled ${roll} (Dice Type: ${diceType})`, description: "Outcome determined...", duration: 2000 });
            }

            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (diceError) {
            console.error("Dice roll failed:", diceError);
            setError("The dice seem unresponsive... Proceeding based on skill.");
            toast({ title: "Dice Error", description: "Could not roll dice.", variant: "destructive" });
            actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll: Failed)`;
        } finally {
            setIsRollingDice(false);
        }
    } else if (!isPassiveAction && assessedDifficulty !== "Impossible" && diceType !== 'None') { // Check diceType !== 'None'
         actionWithDice += ` (Difficulty: ${assessedDifficulty}, No Roll Required)`;
    }

    // --- 3. Narrate Action Outcome ---
     // Prepare skill tree summary for the AI prompt
    let skillTreeSummaryForAI = null;
    if (character.skillTree && character.skillTreeStage >= 0) { // Check for >= 0
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
        currentStamina: character.currentStamina, // Pass current resources
        maxStamina: character.maxStamina,
        currentMana: character.currentMana,
        maxMana: character.maxMana,
        level: character.level,
        xp: character.xp,
        xpToNextLevel: character.xpToNextLevel,
        reputation: character.reputation,
        npcRelationships: character.npcRelationships, // Pass NPC relationships
        skillTreeSummary: skillTreeSummaryForAI, // Pass summary
        skillTreeStage: character.skillTreeStage, // Pass current stage
        learnedSkills: character.learnedSkills.map(s => s.name), // Pass learned skill names
        aiGeneratedDescription: character.aiGeneratedDescription,
      },
      playerChoice: actionWithDice,
      gameState: currentGameStateString,
      previousNarration: storyLog.length > 0 ? storyLog[storyLog.length - 1].narration : undefined,
      adventureSettings: { // Pass adventure settings
        difficulty: adventureSettings.difficulty,
        permanentDeath: adventureSettings.permanentDeath,
        adventureType: adventureSettings.adventureType,
      },
      turnCount: turnCount, // Pass current turn count
    };

    let retryCount = 0;
    const maxRetries = 2;
    let narrationResult: NarrateAdventureOutput | null = null;

    while (retryCount <= maxRetries && !narrationResult) {
        try {
          console.log(`Sending to narrateAdventure flow (Attempt ${retryCount + 1}):`, JSON.stringify(inputForAI, null, 2));
          const result = await narrateAdventure(inputForAI);
          console.log("Received from narrateAdventure flow:", result);

          // Basic validation of critical fields
           if (!result || !result.narration || !result.updatedGameState) {
               throw new Error("AI response missing critical narration or game state.");
           }
           // Validate game state includes turn count
           if (!result.updatedGameState.toLowerCase().includes('turn:')) {
                throw new Error("AI response missing Turn count in updated game state.");
           }

          narrationResult = result; // Success
          setError(null); // Clear previous errors on success

        } catch (err: any) {
          console.error(`Narration error (Attempt ${retryCount + 1}):`, err);
          const errorMessage = err.message || "The story encountered an unexpected snag.";
           if (err.message?.includes('503') || err.message?.includes('overloaded')) {
               setError(`AI Service Overloaded (Attempt ${retryCount + 1}/${maxRetries + 1}). Please try again shortly. Retrying...`);
               toast({ title: "AI Busy", description: `Service overloaded. Retrying...`, variant: "default"});
           } else if (err.message?.includes('Error fetching') || err.message?.includes('400 Bad Request')) {
               setError(`AI Error: Could not process request (${errorMessage.substring(0, 50)}...). Retrying... (Attempt ${retryCount + 1}/${maxRetries + 1})`);
               toast({ title: "AI Error", description: `${errorMessage.substring(0, 60)}... Retrying...`, variant: "destructive"});
           } else {
               setError(`${errorMessage} (Attempt ${retryCount + 1}/${maxRetries + 1}). Retrying...`);
               toast({ title: "Story Error", description: `${errorMessage.substring(0, 60)}... Retrying...`, variant: "destructive"});
           }


          if (retryCount >= maxRetries) {
            // Final failure after retries
            setError(`Narration failed after ${maxRetries + 1} attempts: ${errorMessage}. Try a different action or wait a moment.`);
            toast({ title: "Narration Failed", description: "Please try a different action.", variant: "destructive", duration: 5000 });
            setIsLoading(false);
            setPlayerInput("");
            scrollToBottom();
            return; // Stop execution
          }

          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Wait before retrying
        }
    }

    // Proceed if narrationResult is valid
    if (narrationResult) {
      const logEntryForResult: StoryLogEntry = {
          narration: narrationResult.narration,
          updatedGameState: narrationResult.updatedGameState,
          updatedStats: narrationResult.updatedStats,
          updatedTraits: narrationResult.updatedTraits,
          updatedKnowledge: narrationResult.updatedKnowledge,
          progressedToStage: narrationResult.progressedToStage,
          suggestedClassChange: narrationResult.suggestedClassChange,
          staminaChange: narrationResult.staminaChange, // Get resource changes
          manaChange: narrationResult.manaChange,
          gainedSkill: narrationResult.gainedSkill, // Get gained skill
          xpGained: narrationResult.xpGained, // Get XP gained
          reputationChange: narrationResult.reputationChange, // Get reputation change
          npcRelationshipChange: narrationResult.npcRelationshipChange, // Get NPC relationship change
          timestamp: Date.now(),
      };
      dispatch({ type: "UPDATE_NARRATION", payload: logEntryForResult });

      // Handle branching choices and dynamic events
      setBranchingChoices(narrationResult.branchingChoices || []);
      if (narrationResult.dynamicEventTriggered) {
          toast({
              title: "Dynamic Event!",
              description: narrationResult.dynamicEventTriggered,
              duration: 4000,
          });
      }


        // --- Parse Game State for Inventory ---
        const gameStateInventoryMatch = narrationResult.updatedGameState.match(/Inventory: (.*?)\n/);
        if (gameStateInventoryMatch && gameStateInventoryMatch[1]) {
            const itemsFromGameState = gameStateInventoryMatch[1]
                .split(',')
                 // Remove quality indicators like (Poor), (Common) before comparison
                .map(name => name.trim().replace(/\s*\((Poor|Common|Uncommon|Rare|Epic|Legendary)\)$/i, ''))
                .filter(Boolean);

            // Compare with current inventory names
            const currentInvNames = inventory.map(i => i.name);
            const addedItems = itemsFromGameState.filter(name => !currentInvNames.includes(name));
            const removedItems = currentInvNames.filter(name => !itemsFromGameState.includes(name));

            // Dispatch updates - NOTE: This assumes the AI correctly added/removed items
            // and provided basic details. A more robust system might need AI to return
            // explicit item changes.
            addedItems.forEach(name => dispatch({ type: "ADD_ITEM", payload: { name, description: "Acquired during adventure", quality: "Common" } })); // Add default details
            removedItems.forEach(name => dispatch({ type: "REMOVE_ITEM", payload: { itemName: name } }));

            if (addedItems.length > 0 || removedItems.length > 0) {
                console.log("Inventory updated via game state parsing:", { added: addedItems, removed: removedItems });
                toast({ title: "Inventory Updated", description: `${addedItems.length > 0 ? 'Added: ' + addedItems.join(', ') : ''}${removedItems.length > 0 ? ' Removed: ' + removedItems.join(', ') : ''}`, duration: 3000 });
            }
        }

      // --- Handle Progression AFTER state update from narration ---

      // Apply XP gain (from the narration result)
      if (logEntryForResult.xpGained && logEntryForResult.xpGained > 0) {
          dispatch({ type: "GRANT_XP", payload: logEntryForResult.xpGained });
           toast({ title: `Gained ${logEntryForResult.xpGained} XP!`, duration: 3000 });
           // Check for level up AFTER dispatching GRANT_XP
           const charAfterXp = { ...character, xp: character.xp + logEntryForResult.xpGained }; // Simulate state after XP grant
           if (charAfterXp.xp >= charAfterXp.xpToNextLevel) {
                const newLevel = charAfterXp.level + 1;
                const newXpToNext = calculateXpToNextLevel(newLevel);
                dispatch({ type: "LEVEL_UP", payload: { newLevel, newXpToNextLevel } });
                toast({ title: `Level Up! Reached Level ${newLevel}!`, description: "You feel stronger!", duration: 5000, variant: "default" });
           }
      }

       // Apply reputation change (from the narration result)
       if (logEntryForResult.reputationChange) {
            dispatch({ type: 'UPDATE_REPUTATION', payload: logEntryForResult.reputationChange });
            const { faction, change } = logEntryForResult.reputationChange;
            const direction = change > 0 ? 'increased' : 'decreased';
            toast({ title: `Reputation with ${faction} ${direction} by ${Math.abs(change)}!`, duration: 3000 });
       }

       // Apply NPC relationship change (from the narration result)
       if (logEntryForResult.npcRelationshipChange) {
           dispatch({ type: 'UPDATE_NPC_RELATIONSHIP', payload: logEntryForResult.npcRelationshipChange });
           const { npcName, change } = logEntryForResult.npcRelationshipChange;
           const direction = change > 0 ? 'improved' : 'worsened';
           toast({ title: `Relationship with ${npcName} ${direction} by ${Math.abs(change)}!`, duration: 3000 });
       }


      // Handle AI-driven skill stage progression
       if (narrationResult.progressedToStage && narrationResult.progressedToStage > character.skillTreeStage) {
            const progressedStageName = character.skillTree?.stages.find(s => s.stage === narrationResult!.progressedToStage)?.stageName || `Stage ${narrationResult.progressedToStage}`;
           dispatch({ type: "PROGRESS_SKILL_STAGE", payload: narrationResult.progressedToStage });
           toast({ title: "Skill Stage Increased!", description: `You've reached ${progressedStageName} (Stage ${narrationResult.progressedToStage}) of the ${character.class} path!`, duration: 4000 });
       }
        // Handle gained skill notification
        if (narrationResult.gainedSkill) {
            toast({ title: "Skill Learned!", description: `You gained the skill: ${narrationResult.gainedSkill.name}!`, duration: 4000 });
        }

        // Handle suggested class change - set state to trigger confirmation dialog
       if (narrationResult.suggestedClassChange && narrationResult.suggestedClassChange !== character.class) {
            console.log(`AI suggested class change to: ${narrationResult.suggestedClassChange}`);
            setPendingClassChange(narrationResult.suggestedClassChange); // Trigger dialog
       }


       // --- Check for End Game Condition ---
       const lowerNarration = narrationResult.narration?.toLowerCase() || "";
       const lowerGameState = narrationResult.updatedGameState?.toLowerCase() || "";
       const isGameOver = lowerGameState.includes("game over") || lowerNarration.includes("your adventure ends") || lowerNarration.includes("you have died") || lowerNarration.includes("you achieved victory");

       if (isGameOver) {
            if (adventureSettings.permanentDeath && (lowerNarration.includes("you have died"))) {
                toast({title: "Game Over!", description: "Your journey has reached its final, permanent end.", variant: "destructive", duration: 5000});
                await handleEndAdventure(logEntryForResult);
            } else if (lowerNarration.includes("you have died")) {
                toast({title: "Defeat!", description: "You were overcome, but perhaps fate offers another chance (Respawn enabled).", variant: "destructive", duration: 5000});
                 await handleEndAdventure(logEntryForResult); // Still end, but message differs
            } else {
                 toast({title: "Adventure Concluded!", description: "Your tale reaches its current conclusion.", duration: 5000});
                 await handleEndAdventure(logEntryForResult);
            }
       }
    } // End if(narrationResult)

    setIsLoading(false);
    if (!isInitialAction) setPlayerInput("");
    scrollToBottom(); // Scroll after processing is complete

  }, [
      character, inventory, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice,
      isGeneratingSkillTree, // Include skill tree generation state
      currentGameStateString, currentNarration, storyLog, adventureSettings, turnCount, // Add turnCount dependency
      dispatch, toast, scrollToBottom,
      triggerSkillTreeGeneration // Add trigger function dependency
  ]);


   // --- End Adventure ---
   const handleEndAdventure = useCallback(async (finalNarrationEntry?: StoryLogEntry) => {
     if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree) return;
     setIsEnding(true);
     setError(null);
     toast({ title: "Ending Adventure", description: "Summarizing your tale..." });
     const finalContext = finalNarrationEntry ?? (storyLog.length > 0 ? storyLog[storyLog.length - 1] : null);
     let summary = "Your adventure has concluded.";
     const finalLogToSummarize = [...storyLog];
     if (finalNarrationEntry && (!storyLog.length || storyLog[storyLog.length - 1].narration !== finalNarrationEntry.narration)) {
        finalLogToSummarize.push(finalNarrationEntry);
     }
     const hasLog = finalLogToSummarize.length > 0;
     if (hasLog) {
         const fullStory = finalLogToSummarize.map((log, index) => `[Turn ${index + 1}]\n${log.narration}`).join("\n\n---\n\n");
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
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, storyLog, dispatch, toast]);


   // --- Handle Save Game ---
   const handleSaveGame = useCallback(async () => {
        if (isLoading || isEnding || isSaving || !currentAdventureId || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree) return;
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
   }, [dispatch, toast, isLoading, isEnding, isSaving, currentAdventureId, character, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree]);

    // --- Handle Crafting Attempt ---
    const handleCrafting = useCallback(async () => {
        if (!character || isLoading || isCraftingLoading || !craftingGoal.trim() || selectedIngredients.length === 0) {
            setCraftingError("Please specify a crafting goal and select at least one ingredient.");
            return;
        }

        setIsCraftingLoading(true);
        setCraftingError(null);
        toast({ title: "Attempting to craft...", description: `Trying to make: ${craftingGoal}` });

        // Prepare inventory list for the AI (send names only)
        const inventoryListNames = inventory.map(item => item.name);
        // Use selectedIngredients directly as it's now an array of names
        const ingredientsUsed = selectedIngredients;

        const craftingInput: AttemptCraftingInput = {
            characterKnowledge: character.knowledge,
            characterSkills: character.learnedSkills.map(s => s.name),
            inventoryItems: inventoryListNames, // Pass array of names
            desiredItem: craftingGoal,
            usedIngredients: ingredientsUsed,
        };

        try {
            const result: AttemptCraftingOutput = await attemptCrafting(craftingInput);
            console.log("Crafting Result:", result);
            toast({
                title: result.success ? "Crafting Successful!" : "Crafting Failed!",
                description: result.message,
                variant: result.success ? "default" : "destructive",
                duration: 5000,
            });

            if (result.success && result.craftedItem) {
                // Add the crafted item
                dispatch({ type: "ADD_ITEM", payload: result.craftedItem });
                // Remove used ingredients
                result.consumedItems.forEach(itemName => {
                    dispatch({ type: "REMOVE_ITEM", payload: { itemName: itemName } });
                });
                 // Optionally, update game state string if crafting outcome needs immediate reflection
                const updatedGameState = `${currentGameStateString}\nEvent: Crafted ${result.craftedItem.name}. Consumed: ${result.consumedItems.join(', ')}.`;
                dispatch({ type: 'UPDATE_NARRATION', payload: { narration: `You successfully crafted ${result.craftedItem.name}! (${result.message})`, updatedGameState, timestamp: Date.now() } });

            } else if (!result.success && result.consumedItems.length > 0) {
                 // Remove consumed items even on failure if specified
                result.consumedItems.forEach(itemName => {
                    dispatch({ type: "REMOVE_ITEM", payload: { itemName: itemName } });
                });
                // Optionally, update game state string
                 const updatedGameState = `${currentGameStateString}\nEvent: Crafting failed. Consumed: ${result.consumedItems.join(', ')}. ${result.message}`;
                 dispatch({ type: 'UPDATE_NARRATION', payload: { narration: `Crafting failed! ${result.message}`, updatedGameState, timestamp: Date.now() } });
            } else {
                // Crafting failed with no items consumed
                 const updatedGameState = `${currentGameStateString}\nEvent: Crafting failed. ${result.message}`;
                 dispatch({ type: 'UPDATE_NARRATION', payload: { narration: `Crafting failed! ${result.message}`, updatedGameState, timestamp: Date.now() } });
            }

            setIsCraftingDialogOpen(false); // Close dialog on success/handled failure
            setCraftingGoal("");
            setSelectedIngredients([]); // Clear selected items

        } catch (err: any) {
            console.error("Crafting AI call failed:", err);
            setCraftingError(`Crafting attempt failed: ${err.message}. Please try again later.`);
            toast({ title: "Crafting Error", description: "The AI failed to process the crafting attempt.", variant: "destructive" });
        } finally {
            setIsCraftingLoading(false);
        }
    }, [character, inventory, craftingGoal, selectedIngredients, dispatch, toast, isLoading, isCraftingLoading, currentGameStateString]);


     // Handle ingredient selection toggle
     const handleIngredientToggle = (itemName: string) => {
        setSelectedIngredients(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
     };


     // Reset crafting state when dialog closes
     useEffect(() => {
       if (!isCraftingDialogOpen) {
         setCraftingGoal("");
         setSelectedIngredients([]);
         setCraftingError(null);
         setIsCraftingLoading(false);
       }
     }, [isCraftingDialogOpen]);


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
          } else if (!isLoading && !isGeneratingSkillTree && storyLog.length === 0) { // Only trigger initial narration if skill tree exists, not loading, and no logs yet
             console.log("Gameplay: Triggering initial narration (skill tree exists).");
             handlePlayerAction("Begin the adventure by looking around.", true);
          }
     } else if (isLoadedGame) {
         console.log("Gameplay: Resumed loaded game.");
         toast({ title: "Game Loaded", description: `Resuming adventure for ${character.name}.`, duration: 3000 });
          // Ensure skill tree exists on load, generate if missing (e.g., from older save)
          if (!character.skillTree && !isGeneratingSkillTree) {
              console.log("Gameplay (Load): Triggering skill tree generation for loaded character.");
              triggerSkillTreeGeneration(character.class);
          }
          requestAnimationFrame(scrollToBottom);
     }
  // Re-trigger initial action if skill tree becomes available later and story log is still empty
  }, [state.status, character?.name, character?.class, character?.skillTree, state.currentAdventureId, storyLog.length, isLoading, isEnding, isSaving, isGeneratingSkillTree, triggerSkillTreeGeneration, handlePlayerAction, state.savedAdventures, toast, scrollToBottom, dispatch, currentGameStateString]); // Added storyLog.length dependency


   // Scroll to bottom effect
   useEffect(() => {
       scrollToBottom();
   }, [storyLog, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, diceResult, error, scrollToBottom, branchingChoices]); // Added branchingChoices dependency


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = playerInput.trim();
     const busy = isLoading || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree;
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
        if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree) return;
        toast({ title: "Returning to Main Menu...", description: "Abandoning current adventure." });
        dispatch({ type: "RESET_GAME" });
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, dispatch, toast]);


   // --- Suggest Action ---
   const handleSuggestAction = useCallback(() => {
       if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || !character) return;
        // Include learned skills in suggestions
       const learnedSkillNames = character.learnedSkills.map(s => s.name);
        const baseSuggestions = [ "Look around", "Examine surroundings", "Check inventory", "Check status", "Check reputation", "Check relationships", "Move north", "Move east", "Move south", "Move west", "Talk to [NPC Name]", "Ask about [Topic]", "Examine [Object]", "Pick up [Item]", "Use [Item]", "Drop [Item]", "Open [Door/Chest]", "Search the area", "Rest here", "Wait for a while", "Attack [Target]", "Defend yourself", "Flee", ];
        const skillSuggestions = learnedSkillNames.map(name => `Use skill: ${name}`);
        const suggestions = [...baseSuggestions, ...skillSuggestions];

        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        setPlayerInput(suggestion);
        toast({ title: "Suggestion", description: `Try: "${suggestion}"`, duration: 3000 });
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, character, toast]);

   if (!character) {
       return (
           <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
               <Loader2 className="h-12 w-12 animate-spin text-primary" />
               <p className="text-lg text-muted-foreground">Loading Character Data...</p>
               <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="outline"> Return to Main Menu </Button>
           </div>
       );
   }

    // Determine current stage name for mobile sheet
     const currentStageName = character.skillTree && character.skillTreeStage >= 0 && character.skillTree.stages[character.skillTreeStage]
        ? character.skillTree.stages[character.skillTreeStage]?.stageName ?? `Stage ${character.skillTreeStage}`
        : "Potential"; // Default to "Potential" for stage 0

   // Helper to render reputation list
    const renderReputation = (rep: Record<string, number>) => {
        const entries = Object.entries(rep);
        if (entries.length === 0) {
            return <p className="text-xs text-muted-foreground italic">No faction reputations yet.</p>;
        }
        return (
            <ul className="space-y-1">
                {entries.map(([faction, score]) => (
                    <li key={faction} className="flex justify-between items-center text-xs">
                        <span>{faction}:</span>
                        <span className={`font-medium ${score > 10 ? 'text-green-600' : score < -10 ? 'text-destructive' : ''}`}>
                            {score}
                             {score > 50 && <ThumbsUp className="inline ml-1 h-3 w-3 text-green-500"/>}
                             {score < -50 && <ThumbsDown className="inline ml-1 h-3 w-3 text-red-500"/>}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

   // Helper function to render NPC relationship list
    const renderNpcRelationships = (NpcRelationships | undefined) => {
        if (!NpcRelationships) {
            return <p className="text-xs text-muted-foreground italic">No known relationships.</p>;
        }
        const entries = Object.entries(NpcRelationships);
        if (entries.length === 0) {
            return <p className="text-xs text-muted-foreground italic">No known relationships.</p>;
        }
        return (
            <ul className="space-y-1">
                {entries.map(([npcName, score]) => (
                    <li key={npcName} className="flex justify-between items-center text-xs">
                        <span>{npcName}:</span>
                        <span className={`font-medium ${score > 20 ? 'text-green-600' : score < -20 ? 'text-destructive' : ''}`}>
                            {score}
                             {score > 50 && <HeartPulse className="inline ml-1 h-3 w-3 text-pink-500"/>}
                             {score < -50 && <Skull className="inline ml-1 h-3 w-3 text-gray-500"/>}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };


   // Helper function to render dynamic content at the end of the scroll area
   const renderDynamicContent = () => {
     const busy = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree;
     if (isGeneratingSkillTree) {
         return (
             <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse">
                 <Workflow className="h-5 w-5 mr-2 animate-spin"/>
                 <span>Generating skill tree...</span>
             </div>
         );
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
    // Only show dice result if it's not null AND diceType is not 'None'
    if (diceResult !== null && diceType !== "None") {
      return ( <div key={`dice-${Date.now()}`} className="flex items-center justify-center py-2 text-accent font-semibold italic animate-fade-in-out"> <Dices className="h-5 w-5 mr-2" /> Rolled {diceResult} on {diceType}! </div> );
    }
    // Show branching choices if available
    if (branchingChoices && branchingChoices.length > 0) {
        return (
            <div className="mt-4 pt-4 border-t border-foreground/10">
                 <p className="text-center font-semibold mb-2">Choose your path:</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                     {branchingChoices.map((choice, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className="text-left h-auto py-2 justify-start"
                            onClick={() => handlePlayerAction(choice.text)}
                            disabled={isLoading || isEnding || isSaving}
                        >
                            <div>
                                <p>{choice.text}</p>
                                {choice.consequenceHint && <p className="text-xs text-muted-foreground italic mt-1">{choice.consequenceHint}</p>}
                            </div>
                        </Button>
                     ))}
                 </div>
            </div>
        );
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
    // Adjusted root div: removed max-h-screen, added min-h-screen for mobile
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">

        {/* Left Panel (Character & Actions) - Fixed width on Desktop */}
        <div className="hidden md:flex flex-col w-80 lg:w-96 p-4 border-r border-foreground/10 overflow-y-auto bg-card/50 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
             <CharacterDisplay />

              {/* Progression Info - Desktop Only */}
              <CardboardCard className="mb-4 bg-card/90 backdrop-blur-sm z-10 border-2 border-foreground/20">
                  <CardHeader className="pb-2 pt-4 border-b border-foreground/10">
                      <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
                          Progression
                      </CardTitle>
                  </CardHeader>
                   <CardContent className="pt-4 pb-4">
                      <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                              <span>Level:</span>
                              <span className="font-bold">{character.level}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                              <span>XP:</span>
                              <span className="font-mono text-muted-foreground">{character.xp} / {character.xpToNextLevel}</span>
                          </div>
                           <Progress
                               value={(character.xp / character.xpToNextLevel) * 100}
                               className="h-2 bg-yellow-100 dark:bg-yellow-900/50 [&>div]:bg-yellow-500"
                               aria-label={`Experience points ${character.xp} of ${character.xpToNextLevel}`}
                           />
                      </div>
                      <Separator className="my-3"/>

                      <div className="space-y-1 mb-3">
                          <p className="text-sm font-semibold">Reputation:</p>
                          {renderReputation(character.reputation)}
                      </div>
                       <Separator className="my-3"/>
                      <div className="space-y-1">
                          <p className="text-sm font-semibold">Relationships:</p>
                          {renderNpcRelationships(character.npcRelationships)}
                      </div>
                       <Separator className="my-3"/>
                       <div className="space-y-1">
                         <p className="text-sm font-semibold">Turn:</p>
                         <p className="text-lg font-bold text-center">{turnCount}</p>
                       </div>
                   </CardContent>
              </CardboardCard>

             {/* Tabs for Inventory and Skill Tree */}
             <Tabs defaultValue="inventory" className="w-full flex flex-col flex-grow min-h-0"> {/* Adjust Tabs structure */}
                <TabsList className="grid w-full grid-cols-2 flex-shrink-0">

                     {/* Desktop Inventory Tab */}
                    <TabsTrigger value="inventory" className="flex items-center gap-1">
                        <Backpack className="h-4 w-4"/> Inventory
                    </TabsTrigger>

                      {/* Desktop Skill Tree Tab */}
                     <TabsTrigger value="skills" disabled={isGeneratingSkillTree} className="flex items-center gap-1">
                        <Workflow className="h-4 w-4"/>
                        {isGeneratingSkillTree ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Skills
                    </TabsTrigger>

                </TabsList>
                {/* Desktop Tab Content */}
                <TabsContent value="inventory" className="flex-grow overflow-hidden">
                     <InventoryDisplay />
                </TabsContent>
                <TabsContent value="skills" className="flex-grow overflow-hidden">
                     {character.skillTree && !isGeneratingSkillTree ? (
                           <SkillTreeDisplay
                                skillTree={character.skillTree}
                                currentStage={character.skillTreeStage}
                                learnedSkills={character.learnedSkills} // Pass learned skills
                           />
                     ) : (
                        <CardboardCard className="m-4 flex flex-col items-center justify-center h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Workflow className="w-5 h-5"/> Skill Tree</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                 {isGeneratingSkillTree ? <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> : null}
                                <p className="text-muted-foreground">
                                    {isGeneratingSkillTree ? "Generating skill tree..." : "No skill tree available."}
                                </p>
                            </CardContent>
                        </CardboardCard>
                     )}
                </TabsContent>
             </Tabs>

        </div>

        {/* Right Panel (Game Log & Input) - Flexible width */}
        <div className="flex-1 flex flex-col p-4 min-h-0"> {/* Added min-h-0 */}
             {/* Mobile Header with Icons */}
             <div className="md:hidden flex justify-between items-center mb-2 flex-shrink-0">
                   {/* Mobile Character Sheet Trigger */}
                   <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <User className="h-5 w-5" />
                          <span className="sr-only">Character Info</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0 flex flex-col">
                         <SheetHeader className="p-4 border-b">
                           <SheetTitle>Character Info</SheetTitle>
                         </SheetHeader>
                         <ScrollArea className="flex-grow p-4">
                             <CharacterDisplay />
                              {/* Progression Info in Mobile Sheet */}
                              <CardboardCard className="mb-4">
                                  <CardHeader className="pb-2 pt-4 border-b"> <CardTitle className="text-lg">Progression</CardTitle> </CardHeader>
                                  <CardContent className="pt-3 pb-3 text-xs">
                                      <div className="flex items-center justify-between"><span>Level:</span> <span className="font-bold">{character.level}</span></div>
                                      <div className="flex items-center justify-between"><span>XP:</span> <span className="font-mono text-muted-foreground">{character.xp} / {character.xpToNextLevel}</span></div>
                                       <Progress value={(character.xp / character.xpToNextLevel) * 100} className="h-1.5 mt-1 mb-2 bg-yellow-100 dark:bg-yellow-900/50 [&>div]:bg-yellow-500" />
                                      <Separator className="my-2"/>
                                      <p className="font-medium mb-1">Reputation:</p>
                                      {renderReputation(character.reputation)}
                                      <Separator className="my-2"/>
                                      <p className="font-medium mb-1">Relationships:</p>
                                      {renderNpcRelationships(character.npcRelationships)}
                                      <Separator className="my-2"/>
                                      <div className="flex items-center justify-between"><span>Turn:</span> <span className="font-bold">{turnCount}</span></div>
                                  </CardContent>
                              </CardboardCard>
                         </ScrollArea>
                      </SheetContent>
                   </Sheet>

                   <h2 className="text-lg font-semibold">Adventure Log</h2>

                   {/* Combined Inventory/Skills Sheet Trigger */}
                   <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Backpack className="h-5 w-5" />
                                <span className="sr-only">Inventory & Skills</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col">
                             <SheetHeader className="p-4 border-b">
                                 <SheetTitle>Inventory & Skills</SheetTitle>
                             </SheetHeader>
                             <Tabs defaultValue="inventory" className="w-full flex-grow flex flex-col min-h-0">
                                 <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                                     <TabsTrigger value="inventory">Inventory</TabsTrigger>
                                     <TabsTrigger value="skills" disabled={isGeneratingSkillTree}>
                                         {isGeneratingSkillTree ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Skills
                                     </TabsTrigger>
                                 </TabsList>
                                 <TabsContent value="inventory" className="flex-grow overflow-hidden">
                                     <InventoryDisplay />
                                 </TabsContent>
                                 <TabsContent value="skills" className="flex-grow overflow-hidden">
                                     {character.skillTree && !isGeneratingSkillTree ? (
                                         <SkillTreeDisplay
                                             skillTree={character.skillTree}
                                             currentStage={character.skillTreeStage}
                                             learnedSkills={character.learnedSkills}
                                         />
                                     ) : (
                                         <div className="p-4 text-center text-muted-foreground flex flex-col items-center justify-center h-full">
                                              {isGeneratingSkillTree ? <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" /> : null}
                                             {isGeneratingSkillTree ? "Generating skill tree..." : "No skill tree available."}
                                         </div>
                                     )}
                                 </TabsContent>
                             </Tabs>
                         </SheetContent>
                   </Sheet>
             </div>


            {/* Narration Area */}
            <CardboardCard className="shadow-md rounded-sm bg-card flex-1 flex flex-col overflow-hidden mb-4 border-2 border-foreground/20 shadow-inner min-h-0">
                <CardHeader className="hidden md:block pb-2 pt-4 border-b border-foreground/10">
                    <CardTitle className="text-xl font-semibold flex items-center justify-between gap-2">
                        <span>Story Log</span>
                        <span className="text-sm font-normal text-muted-foreground flex items-center gap-1"> <CalendarClock className="w-4 h-4"/> Turn: {turnCount} </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent p-4 md:p-6">
                    <ScrollArea className="h-full">
                        <div>
                            {storyLog.map((log, index) => (
                                <div key={index} className="mb-4 pb-2 border-b border-foreground/10 last:border-b-0">
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{log.narration}</p>
                                </div>
                            ))}
                            {/* Dynamic Content at the End */}
                            <div ref={scrollEndRef}>
                                {renderDynamicContent()}
                            </div>
                        </div>
                    </ScrollArea>
                </CardContent>
            </CardboardCard>

            {/* Action Input - Show only if no branching choices are active */}
            {!branchingChoices || branchingChoices.length === 0 ? (
                <CardboardCard className="border-2 border-foreground/20 shadow-inner flex-shrink-0">
                    <CardContent className="p-3 md:p-4">
                        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                            <Input
                                type="text"
                                value={playerInput}
                                onChange={(e) => setPlayerInput(e.target.value)}
                                placeholder="Enter your action..."
                                className="flex-1 text-sm"
                                disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}
                            />
                            {/* Suggest Action Button */}
                            <Button
                                type="button"
                                onClick={handleSuggestAction}
                                variant="secondary"
                                size="sm"
                                disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}
                                aria-label="Suggest Action"
                            >
                                <Sparkles className="mr-1 md:mr-2 h-4 w-4" />
                                <span className="hidden md:inline">Suggest</span>
                            </Button>
                            <Button type="submit" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading} aria-label="Submit Action" size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </CardboardCard>
             ) : (
                // Placeholder or instruction when branching choices are active
                <div className="text-center text-muted-foreground italic p-4">
                    Select one of the choices above to continue...
                </div>
             )}

             {/* Bottom Buttons for Mobile and Desktop */}
            <div className="flex justify-between items-center mt-4 flex-shrink-0 gap-2">
                   <AlertDialog>
                     <AlertDialogTrigger asChild>
                         <Button variant="outline" className="w-1/4" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}> <ArrowLeft className="mr-1 h-4 w-4" /> Abandon </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                           <AlertDialogDescription>
                              Abandoning the adventure will end your current progress (unsaved changes lost) and return you to the main menu.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={handleGoBack} className="bg-destructive hover:bg-destructive/90">Abandon</AlertDialogAction>
                         </AlertDialogFooter>
                      </AlertDialogContent>
                   </AlertDialog>

                    {/* Crafting Dialog Trigger */}
                     <Dialog open={isCraftingDialogOpen} onOpenChange={setIsCraftingDialogOpen}>
                       <DialogTrigger asChild>
                         <Button variant="outline" className="w-1/4" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}>
                           <Hammer className="mr-1 h-4 w-4" /> Craft
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md flex flex-col max-h-[80vh]"> {/* Adjust size and height */}
                         <DialogHeader>
                           <DialogTitle>Attempt Crafting</DialogTitle>
                           <DialogDescription>
                             Describe what you want to craft and select ingredients from your inventory. The AI will determine the outcome.
                           </DialogDescription>
                         </DialogHeader>
                         <div className="grid gap-4 py-4">
                           {craftingError && (
                             <Alert variant="destructive">
                               <Info className="h-4 w-4" />
                               <AlertTitle>Crafting Error</AlertTitle>
                               <AlertDescription>{craftingError}</AlertDescription>
                             </Alert>
                           )}
                           <div className="space-y-2">
                             <Label htmlFor="crafting-goal">
                               Crafting Goal
                             </Label>
                             <Input
                               id="crafting-goal"
                               value={craftingGoal}
                               onChange={(e) => setCraftingGoal(e.target.value)}
                               placeholder="e.g., Healing Salve, Sharpened Sword"
                               disabled={isCraftingLoading}
                             />
                           </div>
                           <div className="space-y-2 flex-grow overflow-hidden flex flex-col"> {/* Make ingredient list scrollable */}
                             <Label>Select Ingredients</Label>
                             <ScrollArea className="flex-grow border rounded-md p-2 max-h-48"> {/* Limit height and add scroll */}
                               {inventory.length > 0 ? (
                                <div className="space-y-2">
                                   {inventory.map((item, index) => (
                                     <button
                                       key={`${item.name}-${index}`}
                                       type="button"
                                       onClick={() => handleIngredientToggle(item.name)}
                                       disabled={isCraftingLoading}
                                       className={`w-full text-left p-2 rounded-md flex items-center justify-between text-sm transition-colors ${selectedIngredients.includes(item.name) ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'}`}
                                     >
                                       <span className="flex items-center gap-2">
                                         {selectedIngredients.includes(item.name) ? <CheckSquare className="h-4 w-4"/> : <Square className="h-4 w-4 text-muted-foreground"/>}
                                         <span className={getQualityColor(item.quality)}>{item.name}</span>
                                         {item.quality && item.quality !== "Common" && (
                                             <Badge variant="outline" className={`text-xs ml-1 py-0 px-1 h-4 border-0 ${getQualityColor(item.quality)} bg-transparent`}>
                                                {item.quality}
                                             </Badge>
                                         )}
                                       </span>
                                     </button>
                                   ))}
                                </div>
                               ) : (
                                 <p className="text-sm text-muted-foreground italic text-center py-4">Inventory is empty.</p>
                               )}
                             </ScrollArea>
                           </div>
                         </div>
                         <DialogFooter>
                           <DialogClose asChild>
                               <Button type="button" variant="secondary" disabled={isCraftingLoading}>Cancel</Button>
                           </DialogClose>
                           <Button
                                type="button"
                                onClick={handleCrafting}
                                disabled={isCraftingLoading || !craftingGoal.trim() || selectedIngredients.length === 0}
                            >
                             {isCraftingLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hammer className="mr-2 h-4 w-4" />}
                             {isCraftingLoading ? "Crafting..." : "Attempt Craft"}
                           </Button>
                         </DialogFooter>
                       </DialogContent>
                     </Dialog>


                  <Button variant="destructive" onClick={() => handleEndAdventure()} className="w-1/4" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}>
                     End Adventure
                  </Button>

                   <Button variant="secondary" onClick={handleSaveGame} className="w-1/4" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}>
                      <Save className="mr-1 h-4 w-4" />
                      {isSaving ? "Saving..." : "Save"}
                   </Button>

                    {/* Confirmation Dialog for Class Change */}
                    <AlertDialog open={!!pendingClassChange} onOpenChange={(open) => !open && setPendingClassChange(null)}>
                       <AlertDialogContent>
                          <AlertDialogHeader>
                             <AlertDialogTitle>Path Divergence!</AlertDialogTitle>
                             <AlertDialogDescription>
                                Your actions suggest a path towards the <span className="font-semibold">{pendingClassChange}</span> class. Do you wish to embrace this new direction? Your current skill progress will be reset, and you'll start learning {pendingClassChange} abilities.
                             </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                             <AlertDialogCancel onClick={() => setPendingClassChange(null)}>Stay Current Path</AlertDialogCancel>
                             <AlertDialogAction onClick={() => pendingClassChange && handleConfirmClassChange(pendingClassChange)} className="bg-accent hover:bg-accent/90">
                                Embrace {pendingClassChange}
                             </AlertDialogAction>
                          </AlertDialogFooter>
                       </AlertDialogContent>
                    </AlertDialog>
            </div>
        </div>
    </div>
  );
}

    