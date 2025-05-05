// src/components/screens/Gameplay.tsx
"use client";

import type { ComponentProps, SVGProps } from "react"; // Needed for SVG component type
import React, { useState, useRef, useEffect, useCallback } from "react";
import type { GameState, SavedAdventure, StoryLogEntry, Character, SkillTree, Skill, InventoryItem, Reputation, NpcRelationships, ItemQuality, AdventureSettings, DifficultyLevel } from '@/types/game-types'; // Import centralized types
import { useGame } from "@/context/GameContext"; // Import main context hook
import { useToast } from "@/hooks/use-toast";
import { calculateXpToNextLevel } from "@/lib/gameUtils"; // Import specific game utils
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/game/CardboardCard"; // Added CardFooter import
import { CharacterDisplay } from "@/components/game/CharacterDisplay";
import { SkillTreeDisplay } from "@/components/game/SkillTreeDisplay"; // Import SkillTreeDisplay
import { InventoryDisplay } from "@/components/game/InventoryDisplay"; // Import InventoryDisplay
import { narrateAdventure, type NarrateAdventureInput, type NarrateAdventureOutput } from "@/ai/flows/narrate-adventure";
import { summarizeAdventure } from "@/ai/flows/summarize-adventure";
import { assessActionDifficulty, type AssessActionDifficultyInput, type DifficultyLevel as AssessedDifficultyLevel } from "@/ai/flows/assess-action-difficulty"; // Import AssessActionDifficultyInput and its DifficultyLevel
import { generateSkillTree } from "@/ai/flows/generate-skill-tree";
import { attemptCrafting, type AttemptCraftingInput, type AttemptCraftingOutput } from "@/ai/flows/attempt-crafting"; // Import crafting flow
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Loader2, BookCopy, ArrowLeft, Info, Dices, Sparkles, Save, Backpack, Workflow, User, Star, ThumbsUp, ThumbsDown, Award, Hammer, CheckSquare, Square, Users, Milestone, CalendarClock, Skull, HeartPulse, GitBranch, ShieldAlert, Zap, Settings, CheckCircle } from "lucide-react"; // Added CheckCircle
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
  SheetFooter, // Keep SheetFooter
} from "@/components/ui/sheet";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogClose, // Import DialogClose
   DialogFooter, // Import DialogFooter
} from "@/components/ui/dialog"; // Import Dialog components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress"; // Import Progress
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { Label } from "@/components/ui/label"; // Import Label
import { Badge } from "@/components/ui/badge"; // Import Badge for item selection
import { getQualityColor } from "@/lib/utils"; // Import quality color helper
import { SettingsPanel } from "@/components/screens/SettingsPanel"; // Corrected import path for SettingsPanel
import {
    Tooltip,
    TooltipContent,
    TooltipProvider, // Import TooltipProvider
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils"; // Import cn utility
import { LeftPanel } from "@/components/game/LeftPanel"; // Import the new LeftPanel


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
  const { character, currentNarration, currentGameStateString, storyLog, adventureSettings, inventory, currentAdventureId, isGeneratingSkillTree, turnCount } = state;
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
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false); // State for settings panel

  // Crafting state
  const [isCraftingDialogOpen, setIsCraftingDialogOpen] = useState(false);
  const [craftingGoal, setCraftingGoal] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isCraftingLoading, setIsCraftingLoading] = useState(false);
  const [craftingError, setCraftingError] = useState<string | null>(null);

  // State for initial loading/narration
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
     setTimeout(() => {
       scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
     }, 100);
  }, []);

   // --- End Adventure (Define before handlePlayerAction) ---
   const handleEndAdventure = useCallback(async (finalNarrationEntry?: StoryLogEntry) => {
     const busy = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading;
     if (busy) return; // Check busy state at the start
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
     setIsEnding(false); // Ensure ending state is reset
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, storyLog, dispatch, toast, isCraftingLoading]);


  // --- Trigger Skill Tree Generation ---
   const triggerSkillTreeGeneration = useCallback(async (charClass: string) => {
        if (!charClass || isGeneratingSkillTree) return;
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
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
        }
   }, [dispatch, toast, isGeneratingSkillTree]);


   // --- Confirm and Handle Class Change ---
   const handleConfirmClassChange = useCallback(async (newClass: string) => {
        if (!character || !newClass || isGeneratingSkillTree) return;
        console.log(`Confirmed class change to: ${newClass}`);
        setPendingClassChange(null);
        dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: true });
        toast({ title: `Becoming a ${newClass}...`, description: "Generating new skill path...", duration: 2000 });

        try {
            const newSkillTree = await generateSkillTree({ characterClass: newClass });
            dispatch({ type: "CHANGE_CLASS_AND_RESET_SKILLS", payload: { newClass, newSkillTree } });
            toast({ title: `Class Changed to ${newClass}!`, description: "Your abilities and progression have been reset." });
        } catch (err: any) {
            console.error("Failed to generate skill tree for new class:", err);
            toast({ title: "Class Change Error", description: `Could not generate skill tree for ${newClass}. Class change aborted.`, variant: "destructive" });
            dispatch({ type: "SET_SKILL_TREE_GENERATING", payload: false });
        }
   }, [character, dispatch, toast, isGeneratingSkillTree]);

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
        setIsLoading(true); // Show loading while processing dev command
        setError(null);
        setDiceResult(null);
        setDiceType("None");
        setBranchingChoices([]);

        let devNarration = `(Developer Mode) Action: "${action}"`;
        let devGameState = `Turn: ${turnCount + 1}\n${currentGameStateString.replace(/Turn: \d+/, '')}\nDEV MODE ACTIVE`; // Basic state update
        let xpGained = 0;
        let progressedToStage: number | undefined = undefined;
        let stateUpdateDispatched = false; // Track if a specific action was dispatched

        const command = action.trim().toLowerCase();

        // Command Parsing
        if (command.startsWith('/xp')) {
            const amountMatch = command.match(/\/xp\s+(\d+)/);
            if (amountMatch && amountMatch[1]) {
                const amount = parseInt(amountMatch[1], 10);
                if (!isNaN(amount)) {
                    xpGained = amount;
                    dispatch({ type: 'GRANT_XP', payload: amount });
                    devNarration = `(Developer Mode) Granted ${amount} XP.`;
                    stateUpdateDispatched = true;
                } else {
                    devNarration += " - Invalid XP amount.";
                }
            } else {
                devNarration += " - Usage: /xp <amount>";
            }
        } else if (command.startsWith('/stage')) {
            const stageMatch = command.match(/\/stage\s+(\d)/);
             if (stageMatch && stageMatch[1]) {
                const stageNum = parseInt(stageMatch[1], 10);
                 if (!isNaN(stageNum) && stageNum >= 0 && stageNum <= 4) {
                    progressedToStage = stageNum;
                    dispatch({ type: 'PROGRESS_SKILL_STAGE', payload: stageNum });
                     devNarration = `(Developer Mode) Set skill stage to ${stageNum}.`;
                     stateUpdateDispatched = true;
                 } else {
                     devNarration += " - Invalid stage number (0-4).";
                 }
             } else {
                 devNarration += " - Usage: /stage <0-4>";
             }
        } else if (command.startsWith('/additem')) {
             const itemMatch = command.match(/\/additem\s+(.+)/);
             if (itemMatch && itemMatch[1]) {
                 const itemName = itemMatch[1].trim();
                 const newItem: InventoryItem = { name: itemName, description: "(Dev Added Item)", quality: "Common" };
                 dispatch({ type: 'ADD_ITEM', payload: newItem });
                 devNarration = `(Developer Mode) Added item: ${itemName}.`;
                 // NOTE: Inventory string update is handled by the reducer/state update effect now.
                 stateUpdateDispatched = true;
             } else {
                 devNarration += " - Usage: /additem <item name>";
             }
         } else if (command.startsWith('/removeitem')) {
              const itemMatch = command.match(/\/removeitem\s+(.+)/);
              if (itemMatch && itemMatch[1]) {
                  const itemName = itemMatch[1].trim();
                  dispatch({ type: 'REMOVE_ITEM', payload: { itemName } });
                  devNarration = `(Developer Mode) Attempted to remove item: ${itemName}.`;
                  stateUpdateDispatched = true;
              } else {
                  devNarration += " - Usage: /removeitem <item name>";
              }
          }
          // Add more commands as needed (/setstat, /setrep, etc.)


        // If no specific command was processed, narrate the action as successful
        if (!stateUpdateDispatched) {
             devNarration += " performed successfully. Restrictions bypassed.";
        }

        // We need the updated character state AFTER the dispatch for XP/Level checks
         // This approach relies on the fact that dispatch updates state synchronously for the next render cycle
         // but it might be safer to calculate the potential level up based on current + granted XP
         let characterAfterDevUpdate = state.character; // Get the latest state
         if (characterAfterDevUpdate && xpGained > 0) {
             characterAfterDevUpdate = { ...characterAfterDevUpdate, xp: characterAfterDevUpdate.xp + xpGained };
         }
         if (characterAfterDevUpdate && progressedToStage !== undefined) {
             characterAfterDevUpdate = { ...characterAfterDevUpdate, skillTreeStage: progressedToStage };
         }
         // Get updated inventory string after dispatch
         const updatedInventoryString = state.inventory.map(item => `${item.name}${item.quality ? ` (${item.quality})` : ''}`).join(', ') || 'Empty';
         devGameState = devGameState.replace(/Inventory:.*?\n/, `Inventory: ${updatedInventoryString}\n`);

        // Dispatch a standard narration update to show the command result/narration
        const devLogEntry: StoryLogEntry = {
            narration: devNarration,
            updatedGameState: devGameState, // Use the updated state string
            timestamp: Date.now(),
            // Only include progression fields if they were explicitly changed by a command
             ...(xpGained > 0 && { xpGained }),
             ...(progressedToStage !== undefined && { progressedToStage }),
        };
        dispatch({ type: "UPDATE_NARRATION", payload: devLogEntry });

        // Check for level up AFTER the main dispatch has potentially updated XP
         // This might require a slight delay or reading the state after the reducer cycle completes
         // For simplicity, let's trigger the level up check in the dispatch itself if possible or here based on calculation
         if (characterAfterDevUpdate && characterAfterDevUpdate.xp >= characterAfterDevUpdate.xpToNextLevel) {
             const newLevel = characterAfterDevUpdate.level + 1;
             const newXpToNext = calculateXpToNextLevel(newLevel);
             // Need to dispatch level up separately
             dispatch({ type: "LEVEL_UP", payload: { newLevel, newXpToNextLevel } });
             toast({ title: `Level Up! Reached Level ${newLevel}!`, description: "You feel stronger!", duration: 5000, className: "bg-green-100 dark:bg-green-900 border-green-500" });
         }


        setIsLoading(false);
        scrollToBottom();
        return; // Exit early for developer mode
    }

    // --- Standard Action Handling (Non-Dev Mode) ---
    if (!character.skillTree && !isGeneratingSkillTree) {
        triggerSkillTreeGeneration(character.class);
        toast({ description: "Initializing skill tree before proceeding...", duration: 1500 });
        setIsLoading(false); // Reset loading state here
        return;
    }

    console.log(`Handling action: "${action}"`);
    setIsLoading(true);
    setError(null);
    setDiceResult(null);
    setDiceType("None");
    setBranchingChoices([]); // Reset choices before processing

    let actionWithDice = action;
    let assessedDifficulty: AssessedDifficultyLevel = "Normal";
    let difficultyReasoning = "";
    let requiresRoll = false;
    let rollFunction: (() => Promise<number>) | null = null;

    const actionLower = action.trim().toLowerCase();
    const isPassiveAction = ["look", "look around", "check inventory", "check status", "check relationships", "check reputation"].includes(actionLower);

    if (!isInitialAction && !isPassiveAction) {
        setIsAssessingDifficulty(true);
        toast({ title: "Assessing Challenge...", duration: 1500 });
        await new Promise(resolve => setTimeout(resolve, 300));

        try {
             const reputationString = Object.entries(character.reputation).map(([faction, score]) => `${faction}: ${score}`).join(', ') || 'None';
             const relationshipString = Object.entries(character.npcRelationships).map(([npc, score]) => `${npc}: ${score}`).join(', ') || 'None';

             const assessmentInput: AssessActionDifficultyInput = { // Use the imported type
                playerAction: action,
                characterCapabilities: `Level: ${character.level}. Class: ${character.class}. Stage: ${character.skillTreeStage}. Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, AGI ${character.stats.agility}. Traits: ${character.traits.join(', ') || 'None'}. Knowledge: ${character.knowledge.join(', ') || 'None'}. Background: ${character.background}. Inventory: ${inventory.map(i => i.name).join(', ') || 'Empty'}. Stamina: ${character.currentStamina}/${character.maxStamina}. Mana: ${character.currentMana}/${character.maxMana}. Learned Skills: ${character.learnedSkills.map(s=>s.name).join(', ') || 'None'}. Reputation: ${reputationString}. Relationships: ${relationshipString}`,
                characterClass: character.class, // Pass the class here
                currentSituation: currentNarration?.narration || "At the beginning of the scene.",
                gameStateSummary: currentGameStateString,
                gameDifficulty: adventureSettings.difficulty,
                turnCount: turnCount,
             };
            const assessmentResult = await assessActionDifficulty(assessmentInput);
            assessedDifficulty = assessmentResult.difficulty;
            difficultyReasoning = assessmentResult.reasoning;
            setDiceType(assessmentResult.suggestedDice);
            rollFunction = getDiceRollFunction(assessmentResult.suggestedDice);
            requiresRoll = assessedDifficulty !== "Trivial" && assessedDifficulty !== "Impossible" && rollFunction !== null;

            toast({ title: `Difficulty: ${assessedDifficulty}`, description: difficultyReasoning.substring(0, 100), duration: 2000 });
            await new Promise(resolve => setTimeout(resolve, 400));

            if (assessedDifficulty === "Impossible") {
                setError(`Action seems impossible: ${difficultyReasoning} Try something else.`);
                toast({ title: "Action Impossible", description: difficultyReasoning, variant: "destructive", duration: 4000 });
                setIsLoading(false);
                setIsAssessingDifficulty(false);
                scrollToBottom();
                return;
            }
        } catch (assessError: any) {
            console.error("Difficulty assessment failed:", assessError);
            setError(`Failed to assess difficulty (${assessError.message}). Assuming 'Normal'.`);
            toast({ title: "Assessment Error", description: "Assuming normal difficulty.", variant: "destructive" });
            assessedDifficulty = "Normal";
            setDiceType("d10");
            rollFunction = rollD10;
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

    if (requiresRoll && rollFunction) {
        setIsRollingDice(true);
        toast({ title: `Rolling ${diceType}...`, duration: 1500 });
        await new Promise(resolve => setTimeout(resolve, 400));
        try {
            const roll = await rollFunction();
            setDiceResult(roll);
            const numericDiceType = parseInt(diceType.substring(1), 10);
            if (!isNaN(numericDiceType) && numericDiceType > 0) {
                actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll Result: ${roll}/${numericDiceType})`;
                console.log(`Dice rolled ${diceType}: ${roll}`);
                const successThreshold = Math.ceil(numericDiceType * 0.6);
                const failThreshold = Math.floor(numericDiceType * 0.3);
                let outcomeDesc = "Average outcome.";
                if (roll >= successThreshold) outcomeDesc = "Success!";
                if (roll <= failThreshold) outcomeDesc = "Challenging...";
                toast({ title: `Rolled ${roll} on ${diceType}!`, description: outcomeDesc, duration: 2000 });
            } else {
                console.warn(`Dice roll successful (${roll}), but dice type '${diceType}' was unexpected. Not adding roll details to action string.`);
                actionWithDice += ` (Difficulty: ${assessedDifficulty}, Roll: ${roll})`;
                toast({ title: `Rolled ${roll} (Dice Type: ${diceType})`, description: "Outcome determined...", duration: 2000 });
            }
            await new Promise(resolve => setTimeout(resolve, 600));
        } catch (diceError) {
            console.error("Dice roll failed:", diceError);
            setError("The dice seem unresponsive... Proceeding based on skill.");
            toast({ title: "Dice Error", description: "Could not roll dice.", variant: "destructive" });
            actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll: Failed)`;
        } finally {
            setIsRollingDice(false);
        }
    } else if (!isPassiveAction && assessedDifficulty !== "Impossible" && diceType !== 'None') {
         actionWithDice += ` (Difficulty: ${assessedDifficulty}, No Roll Required)`;
    }

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
        maxMana: character.maxMana,
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
      adventureSettings: {
        difficulty: adventureSettings.difficulty,
        permanentDeath: adventureSettings.permanentDeath,
        adventureType: adventureSettings.adventureType,
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
          setError(null);

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
            setError(`Narration failed after ${maxRetries + 1} attempts: ${errorMessage}. Try a different action or wait a moment.`);
            toast({ title: "Narration Failed", description: "Please try a different action.", variant: "destructive", duration: 5000 });
            setIsLoading(false);
            scrollToBottom();
            return;
          }

          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
    }

    if (narrationResult) {
      const logEntryForResult: StoryLogEntry = {
          narration: narrationResult.narration,
          updatedGameState: narrationResult.updatedGameState,
          updatedStats: narrationResult.updatedStats,
          updatedTraits: narrationResult.updatedTraits,
          updatedKnowledge: narrationResult.updatedKnowledge,
          progressedToStage: narrationResult.progressedToStage,
          suggestedClassChange: narrationResult.suggestedClassChange,
          staminaChange: narrationResult.staminaChange,
          manaChange: narrationResult.manaChange,
          gainedSkill: narrationResult.gainedSkill,
          xpGained: narrationResult.xpGained,
          reputationChange: narrationResult.reputationChange,
          npcRelationshipChange: narrationResult.npcRelationshipChange,
          timestamp: Date.now(),
      };
      dispatch({ type: "UPDATE_NARRATION", payload: logEntryForResult });

       setBranchingChoices(narrationResult.branchingChoices ?? []); // Set choices from result

      if (narrationResult.dynamicEventTriggered) {
          toast({
              title: "Dynamic Event!",
              description: narrationResult.dynamicEventTriggered,
              duration: 4000,
              variant: "default", // Use default variant for events
              className: "border-purple-500" // Optional: Add custom styling
          });
      }

       if (logEntryForResult.xpGained && logEntryForResult.xpGained > 0) {
           // State updates are handled by the reducer for XP gain
           // Need to check for level up AFTER the reducer has potentially updated the state
           // This requires reading the state again, possibly after a short delay or in the next render cycle
           // For simplicity, let's trigger the level up check in the dispatch itself if possible or here based on calculation
           const potentialNewXp = (state.character?.xp ?? 0) + logEntryForResult.xpGained;
           if (state.character && potentialNewXp >= state.character.xpToNextLevel) {
              const newLevel = state.character.level + 1;
              const newXpToNext = calculateXpToNextLevel(newLevel);
              dispatch({ type: "LEVEL_UP", payload: { newLevel, newXpToNextLevel } });
              toast({ title: `Level Up! Reached Level ${newLevel}!`, description: "You feel stronger!", duration: 5000, className: "bg-green-100 dark:bg-green-900 border-green-500" }); // Level Up Toast Style
           } else {
               toast({ title: `Gained ${logEntryForResult.xpGained} XP!`, duration: 3000, className: "bg-yellow-100 dark:bg-yellow-900 border-yellow-500" }); // XP Toast Style
           }
        }


       if (logEntryForResult.reputationChange) {
            // Dispatch handled by reducer
            const { faction, change } = logEntryForResult.reputationChange;
            const direction = change > 0 ? 'increased' : 'worsened';
            toast({ title: `Reputation with ${faction} ${direction} by ${Math.abs(change)}!`, duration: 3000 });
       }

       if (logEntryForResult.npcRelationshipChange) {
           // Dispatch handled by reducer
           const { npcName, change } = logEntryForResult.npcRelationshipChange;
           const direction = change > 0 ? 'improved' : 'worsened';
           toast({ title: `Relationship with ${npcName} ${direction} by ${Math.abs(change)}!`, duration: 3000 });
       }

       if (narrationResult.progressedToStage && narrationResult.progressedToStage > character.skillTreeStage) {
            const progressedStageName = character.skillTree?.stages.find(s => s.stage === narrationResult!.progressedToStage)?.stageName || `Stage ${narrationResult.progressedToStage}`;
            // Dispatch handled by reducer
            toast({ title: "Skill Stage Increased!", description: `You've reached ${progressedStageName} (Stage ${narrationResult.progressedToStage}) of the ${character.class} path!`, duration: 4000, className: "bg-purple-100 dark:bg-purple-900 border-purple-500" }); // Skill Stage Toast
       }
        if (narrationResult.gainedSkill) {
            // Dispatching is handled within UPDATE_NARRATION reducer case
            toast({ title: "Skill Learned!", description: `You gained the skill: ${narrationResult.gainedSkill.name}!`, duration: 4000 });
        }

       if (narrationResult.suggestedClassChange && narrationResult.suggestedClassChange !== character.class) {
            console.log(`AI suggested class change to: ${narrationResult.suggestedClassChange}`);
            setPendingClassChange(narrationResult.suggestedClassChange);
       }

       const lowerNarration = narrationResult.narration?.toLowerCase() || "";
       const lowerGameState = narrationResult.updatedGameState?.toLowerCase() || "";
       const isGameOver = lowerGameState.includes("game over") || lowerNarration.includes("your adventure ends") || lowerNarration.includes("you have died") || lowerNarration.includes("you achieved victory");

       if (isGameOver) {
            if (adventureSettings.permanentDeath && (lowerNarration.includes("you have died"))) {
                toast({title: "Game Over!", description: "Your journey has reached its final, permanent end.", variant: "destructive", duration: 5000});
                await handleEndAdventure(logEntryForResult);
            } else if (lowerNarration.includes("you have died")) {
                toast({title: "Defeat!", description: "You were overcome, but perhaps fate offers another chance (Respawn enabled).", variant: "destructive", duration: 5000});
                 await handleEndAdventure(logEntryForResult);
            } else {
                 toast({title: "Adventure Concluded!", description: "Your tale reaches its current conclusion.", duration: 5000});
                 await handleEndAdventure(logEntryForResult);
            }
       }
    }

    setIsLoading(false);
    scrollToBottom();

  }, [
      character, inventory, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice,
      isGeneratingSkillTree, currentGameStateString, currentNarration, storyLog, adventureSettings, turnCount, state, // Added state here
      dispatch, toast, scrollToBottom, triggerSkillTreeGeneration, handleEndAdventure, isCraftingLoading
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
   }, [dispatch, toast, isLoading, isEnding, isSaving, currentAdventureId, character, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, isCraftingLoading]);

    // --- Handle Crafting Attempt ---
    const handleCrafting = useCallback(async () => {
        // Validate input early
        if (!character) {
             setCraftingError("Character data is missing. Cannot craft.");
             return;
         }
         if (isLoading || isCraftingLoading || isEnding || isSaving) {
             setCraftingError("Cannot craft while another action is in progress.");
             return;
         }
         if (!craftingGoal.trim()) {
             setCraftingError("Please specify what you want to craft.");
             return;
         }
         if (selectedIngredients.length === 0) {
              setCraftingError("Please select at least one ingredient.");
              return;
         }

        setIsCraftingLoading(true);
        setCraftingError(null);
        toast({ title: "Attempting to craft...", description: `Trying to make: ${craftingGoal}` });
        console.log("Crafting initiated with:", { goal: craftingGoal, ingredients: selectedIngredients });

        // Prepare input for the AI flow
        const inventoryListNames = inventory.map(item => item.name);
        const skills = character.learnedSkills.map(s => s.name);

        const craftingInput: AttemptCraftingInput = {
            characterKnowledge: character.knowledge,
            characterSkills: skills,
            inventoryItems: inventoryListNames,
            desiredItem: craftingGoal,
            usedIngredients: selectedIngredients,
        };

        try {
            console.log("Sending data to attemptCrafting flow:", JSON.stringify(craftingInput, null, 2));
            const result: AttemptCraftingOutput = await attemptCrafting(craftingInput);
            console.log("Crafting AI Result:", JSON.stringify(result, null, 2));

            // Handle the result
            toast({
                title: result.success ? "Crafting Successful!" : "Crafting Failed!",
                description: result.message,
                variant: result.success ? "default" : "destructive",
                duration: 5000,
            });

             // Create a narration log entry for the crafting attempt
             let narrationText = `You attempted to craft ${craftingGoal} using ${selectedIngredients.join(', ')}. ${result.message}`;
             if (result.success && result.craftedItem) {
                 narrationText = `You successfully crafted a ${result.craftedItem.quality ? result.craftedItem.quality + ' ' : ''}${result.craftedItem.name}! ${result.message}`;
             }

              // Dispatch updates in one go to ensure atomicity relative to crafting outcome
              dispatch({ type: 'UPDATE_CRAFTING_RESULT', payload: {
                    narration: narrationText,
                    consumedItems: result.consumedItems,
                    craftedItem: result.success ? result.craftedItem : null,
                    newGameStateString: "" // Placeholder, reducer will calculate based on inventory change
              }});

            // Close dialog and reset state
            setIsCraftingDialogOpen(false);
            setCraftingGoal("");
            setSelectedIngredients([]);

        } catch (err: any) {
            console.error("Crafting AI call failed:", err);
             let userFriendlyError = `Crafting attempt failed. Please try again later.`;
             if (err.message?.includes('400 Bad Request')) {
                 userFriendlyError = "Crafting failed: Invalid materials or combination? Check the recipe.";
             } else if (err.message?.includes('503')) {
                 userFriendlyError = "Crafting failed: The crafting spirits are busy. Please try again later.";
             } else if (err.message) {
                  userFriendlyError = `Crafting Error: ${err.message}`;
             }
            setCraftingError(userFriendlyError);
            toast({ title: "Crafting Error", description: userFriendlyError.substring(0,100), variant: "destructive" });
        } finally {
            setIsCraftingLoading(false);
        }
    }, [character, inventory, craftingGoal, selectedIngredients, dispatch, toast, isLoading, isCraftingLoading, isEnding, isSaving]); // Added missing deps


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
     const busy = isLoading || isEnding || isSaving || isGeneratingSkillTree;
     if (state.status !== "Gameplay" || !character || busy) return;

     const isNewGame = storyLog.length === 0 && !state.savedAdventures.some(s => s.id === state.currentAdventureId);
     const isLoadedGame = storyLog.length > 0 && state.savedAdventures.some(s => s.id === state.currentAdventureId);

     if (isNewGame && isInitialLoading) {
         console.log("Gameplay: New game started.");
          if (!character.skillTree) {
             console.log("Gameplay: Triggering initial skill tree generation.");
             triggerSkillTreeGeneration(character.class);
          } else if (!isLoading && !isGeneratingSkillTree && storyLog.length === 0) {
             console.log("Gameplay: Triggering initial narration (skill tree exists).");
             handlePlayerAction("Begin the adventure by looking around.", true).finally(() => setIsInitialLoading(false));
          }
     } else if (isLoadedGame && isInitialLoading) {
         console.log("Gameplay: Resumed loaded game.");
         toast({ title: "Game Loaded", description: `Resuming adventure for ${character.name}.`, duration: 3000 });
          if (!character.skillTree && !isGeneratingSkillTree) {
              console.log("Gameplay (Load): Triggering skill tree generation for loaded character.");
              triggerSkillTreeGeneration(character.class);
          }
          requestAnimationFrame(scrollToBottom);
          setIsInitialLoading(false); // Mark initial load complete for loaded games
     } else if (isInitialLoading && character.skillTree && !isLoading && !isGeneratingSkillTree && storyLog.length === 0) {
        // Handle case where skill tree finished generating for a new game
        console.log("Gameplay: Skill tree generated, triggering initial narration.");
        handlePlayerAction("Begin the adventure by looking around.", true).finally(() => setIsInitialLoading(false));
     }
  }, [state.status, character, state.currentAdventureId, storyLog.length, isLoading, isEnding, isSaving, isGeneratingSkillTree, triggerSkillTreeGeneration, handlePlayerAction, state.savedAdventures, toast, scrollToBottom, isInitialLoading]); // Added isInitialLoading


   // Scroll to bottom effect
   useEffect(() => {
       scrollToBottom();
   }, [storyLog, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, diceResult, error, branchingChoices, scrollToBottom, isCraftingLoading]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = playerInput.trim();
     const busy = isLoading || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isEnding || isSaving || isCraftingLoading;
    if (trimmedInput && !busy) {
       handlePlayerAction(trimmedInput);
       setPlayerInput(""); // Clear input after submission
    } else if (!trimmedInput) {
        toast({ description: "Please enter an action.", variant: "destructive"});
    } else if (busy) {
        let reason = "Please wait for the current action to complete.";
        if (isGeneratingSkillTree) reason = "Generating skill tree...";
        if (isEnding) reason = "Ending adventure...";
        if (isSaving) reason = "Saving game...";
         if (isCraftingLoading) reason = "Crafting in progress...";
        toast({ description: reason, variant: "default", duration: 2000 });
    }
  };


   // --- Go Back (Abandon Adventure) ---
   const handleGoBack = useCallback(() => {
        const busy = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading;
        if (busy) return;
        toast({ title: "Returning to Main Menu...", description: "Abandoning current adventure." });
        dispatch({ type: "RESET_GAME" });
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, dispatch, toast, isCraftingLoading]);


   // --- Suggest Action ---
   const handleSuggestAction = useCallback(() => {
       const busy = isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading;
       if (busy || !character) return;
       const learnedSkillNames = character.learnedSkills.map(s => s.name);
        const baseSuggestions = [ "Look around", "Examine surroundings", "Check inventory", "Check status", "Check relationships", "Check reputation", "Move north", "Move east", "Move south", "Move west", "Talk to [NPC Name]", "Ask about [Topic]", "Examine [Object]", "Pick up [Item]", "Use [Item]", "Drop [Item]", "Open [Door/Chest]", "Search the area", "Rest here", "Wait for a while", "Attack [Target]", "Defend yourself", "Flee", ];
        const skillSuggestions = learnedSkillNames.map(name => `Use skill: ${name}`);
        const suggestions = [...baseSuggestions, ...skillSuggestions];

        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        setPlayerInput(suggestion);
        toast({ title: "Suggestion", description: `Try: "${suggestion}"`, duration: 3000 });
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, character, toast, isCraftingLoading]);

   if (!character) {
       return (
           <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
               <Loader2 className="h-12 w-12 animate-spin text-primary" />
               <p className="text-lg text-muted-foreground">Loading Character Data...</p>
               <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="outline"> Return to Main Menu </Button>
           </div>
       );
   }

    // Helper Functions for Progression Card
    const renderReputation = (rep: Reputation | undefined) => {
        if (!rep || Object.keys(rep).length === 0) return <p className="text-xs text-muted-foreground italic">No faction reputations yet.</p>;
        return (
            <ul className="space-y-1">
                {Object.entries(rep).map(([faction, score]) => (
                    <li key={faction} className="flex justify-between items-center text-xs">
                        <span>{faction}:</span>
                        <span className={`font-medium ${score > 10 ? 'text-green-600' : score < -10 ? 'text-destructive' : ''}`}>
                            {score}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderNpcRelationships = (rels: NpcRelationships | undefined) => {
        if (!rels || Object.keys(rels).length === 0) return <p className="text-xs text-muted-foreground italic">No known relationships.</p>;
        return (
            <ul className="space-y-1">
                {Object.entries(rels).map(([npcName, score]) => (
                    <li key={npcName} className="flex justify-between items-center text-xs">
                        <span>{npcName}:</span>
                         <span className={`font-medium ${score > 20 ? 'text-green-600' : score < -20 ? 'text-destructive' : ''}`}>
                            {score}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

   // Helper function to render dynamic content at the end of the scroll area
   const renderDynamicContent = () => {
     const busy = isLoading || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isEnding || isSaving || isCraftingLoading;

     // Display skeleton loaders during initial narration generation
     if (isInitialLoading && !storyLog.length) {
         return (
            <div className="space-y-4 py-4">
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-8 w-3/4" />
                 <Skeleton className="h-6 w-1/2" />
            </div>
         );
     }

    // Consolidated Loading Indicator
    if (busy && !isInitialLoading) {
        let loadingText = "Thinking...";
        let LoadingIcon = Loader2;
        let iconAnimation = "animate-spin";
        if (isGeneratingSkillTree) loadingText = "Generating skill tree...";
        else if (isSaving) {loadingText = "Saving progress..."; LoadingIcon = Save; iconAnimation="animate-pulse";}
        else if (isEnding) {loadingText = "Ending and summarizing..."; LoadingIcon = BookCopy; iconAnimation="animate-pulse";}
        else if (isAssessingDifficulty) loadingText = "Assessing difficulty...";
        else if (isRollingDice) { loadingText = `Rolling ${diceType}...`; LoadingIcon = Dices; iconAnimation="animate-spin";}
        else if (isCraftingLoading) { loadingText = "Crafting..."; LoadingIcon = Hammer; iconAnimation="animate-spin"; } // Crafting loader

        return (
           <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse">
               <LoadingIcon className={`h-5 w-5 mr-2 ${iconAnimation}`} />
               <span>{loadingText}</span>
           </div>
        );
    }


    // Dice Result (flashy animation)
    if (diceResult !== null && diceType !== "None") {
      return (
        <div key={`dice-${Date.now()}`} className="flex items-center justify-center py-2 text-accent font-semibold italic animate-fade-in-out">
          <Dices className="h-5 w-5 mr-2" /> Rolled {diceResult} on {diceType}!
        </div>
      );
    }

    // Error Display
    if (error) {
      return (
        <Alert variant="destructive" className="my-2">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      );
    }

     // Display branching choices
     if (!busy && branchingChoices && branchingChoices.length > 0 && storyLog.length > 0) { // Only show after first log entry
         return (
             <div className="py-2 mt-2 space-y-2 border-t border-dashed border-foreground/10 pt-3">
                 <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5"><GitBranch className="w-4 h-4"/> Choose your path...</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                     {branchingChoices.map((choice, index) => (
                         <Button
                             key={index}
                             variant="outline"
                             size="sm"
                             className="text-left justify-start h-auto py-1.5"
                             onClick={() => {
                                 setPlayerInput(choice.text); // Optional: prefill input
                                 handlePlayerAction(choice.text);
                             }}
                             disabled={busy}
                         >
                             <div className="flex flex-col items-start w-full">
                                 <span className="font-medium text-foreground">{choice.text}</span>
                                 {choice.consequenceHint && <p className="text-xs text-muted-foreground whitespace-normal">{choice.consequenceHint}</p>}
                             </div>
                         </Button>
                     ))}
                 </div>
             </div>
         );
     }

    // Default idle state (no specific loading or choices)
    if (!busy && storyLog.length > 0) {
        return <p className="py-2 text-muted-foreground italic text-center text-xs">What will you do next?</p>;
    }
     // Initial state before first narration
     if (storyLog.length === 0 && !isInitialLoading && !busy) {
         return <p className="py-2 text-muted-foreground italic">Initializing your adventure...</p>;
     }


    return null; // Should not happen often
   };

   // Define the settings panel content
   const renderSettingsPanel = () => (
       <SettingsPanel isOpen={isSettingsPanelOpen} onOpenChange={setIsSettingsPanelOpen} />
   );

   // Define crafting dialog content
   const renderCraftingDialog = () => (
     <Dialog open={isCraftingDialogOpen} onOpenChange={setIsCraftingDialogOpen}>
       <DialogContent className="sm:max-w-[480px]">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2"><Hammer className="w-5 h-5"/>Attempt Crafting</DialogTitle>
           <DialogDescription>
             Combine items from your inventory to create something new. The AI will determine the outcome based on your knowledge, skills, and the ingredients used.
           </DialogDescription>
         </DialogHeader>
         <div className="grid gap-4 py-4">
           {/* Crafting Goal Input */}
           <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="crafting-goal" className="text-right col-span-1">
               Goal
             </Label>
             <Input
               id="crafting-goal"
               value={craftingGoal}
               onChange={(e) => setCraftingGoal(e.target.value)}
               placeholder="e.g., Healing Poultice, Sharp Dagger"
               className="col-span-3"
               disabled={isCraftingLoading}
             />
           </div>
           {/* Ingredient Selection */}
           <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right col-span-1 mt-2">
                 Ingredients
              </Label>
              <div className="col-span-3">
                 <ScrollArea className="h-40 border rounded-md p-2 bg-muted/30">
                   {inventory.length > 0 ? (
                     <div className="space-y-1">
                       {inventory.map((item) => (
                         <div key={item.name} className="flex items-center gap-2">
                           <Square
                             data-state={selectedIngredients.includes(item.name) ? 'checked' : 'unchecked'}
                             onClick={() => !isCraftingLoading && handleIngredientToggle(item.name)}
                             className={cn(
                                 "w-4 h-4 text-primary cursor-pointer transition-colors",
                                 selectedIngredients.includes(item.name) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground/50 hover:text-foreground'
                             )}
                             aria-label={`Select ${item.name}`}
                           >
                              {selectedIngredients.includes(item.name) && <CheckCircle className="w-full h-full p-0.5"/>}
                            </Square>
                            <Label
                               htmlFor={`ingredient-${item.name}`} // Link label to checkbox (optional, using Square click instead)
                               className={`text-sm flex-1 cursor-pointer ${getQualityColor(item.quality)}`}
                               onClick={() => !isCraftingLoading && handleIngredientToggle(item.name)}
                             >
                                {item.name} {item.quality && item.quality !== "Common" ? `(${item.quality})` : ''}
                            </Label>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-sm text-muted-foreground italic text-center py-4">Inventory is empty.</p>
                   )}
                 </ScrollArea>
                 <p className="text-xs text-muted-foreground mt-1">Select the items you want to use.</p>
              </div>
           </div>
           {craftingError && (
             <Alert variant="destructive" className="col-span-4">
               <AlertDescription>{craftingError}</AlertDescription>
             </Alert>
           )}
         </div>
         <DialogFooter>
             <DialogClose asChild>
                 <Button type="button" variant="secondary" disabled={isCraftingLoading}>
                     Cancel
                 </Button>
             </DialogClose>
              <Button type="button" onClick={handleCrafting} disabled={isCraftingLoading || !craftingGoal.trim() || selectedIngredients.length === 0}>
                 {isCraftingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                 Attempt Craft
               </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );

   // --- Render Main Component ---
  return (
    <TooltipProvider>
        <div className="flex flex-col md:flex-row min-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">

            {/* Left Panel */}
             <LeftPanel
                 character={character}
                 inventory={inventory}
                 isGeneratingSkillTree={isGeneratingSkillTree}
                 turnCount={turnCount}
                 renderReputation={renderReputation} // Pass helper functions
                 renderNpcRelationships={renderNpcRelationships} // Pass helper functions
             />


             {/* Main Panel (Narration & Input) */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden"> {/* Use flex-col and overflow */}
                {/* Top Bar - Mobile Only */}
                <div className="md:hidden flex justify-between items-center mb-2 border-b pb-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="sm"><User className="w-4 h-4 mr-1.5"/> Profile</Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[85vw] p-0 flex flex-col">
                             <SheetHeader className="p-4 border-b">
                                <SheetTitle>Character Profile</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="flex-grow p-4">
                                <CharacterDisplay />
                                {/* Mobile Progression Card */}
                                <CardboardCard className="mb-4">
                                    <CardHeader className="pb-2 pt-4">
                                        <CardTitle className="text-lg font-semibold flex items-center gap-2"><Milestone className="w-4 h-4"/> Progression</CardTitle>
                                    </CardHeader>
                                     <CardContent className="pt-4 pb-4 text-sm space-y-3">
                                        <Tooltip>
                                            <TooltipTrigger className="w-full cursor-help">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium flex items-center gap-1"><Award className="w-3.5 h-3.5"/> Level:</span>
                                                    <span className="font-bold text-base">{character.level}</span>
                                                    <span className="ml-auto font-medium text-muted-foreground">XP:</span>
                                                    <span className="font-mono text-muted-foreground">{character.xp} / {character.xpToNextLevel}</span>
                                                </div>
                                                <Progress value={(character.xp / character.xpToNextLevel) * 100} className="h-2 bg-yellow-100 dark:bg-yellow-900/50 [&>div]:bg-yellow-500"/>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Experience Points</p><p className="text-xs text-muted-foreground">({character.xpToNextLevel - character.xp} needed)</p></TooltipContent>
                                        </Tooltip>
                                        <Separator />
                                        <div className="space-y-1"><Label className="text-sm font-medium flex items-center gap-1 mb-1"><Users className="w-3.5 h-3.5"/> Reputation:</Label>{renderReputation(character.reputation)}</div>
                                        <Separator />
                                        <div className="space-y-1"><Label className="text-sm font-medium flex items-center gap-1 mb-1"><HeartPulse className="w-3.5 h-3.5"/> Relationships:</Label>{renderNpcRelationships(character.npcRelationships)}</div>
                                        <Separator />
                                         <div className="flex justify-between items-center"><Label className="text-sm font-medium flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5"/> Turn:</Label><span className="font-bold text-base">{turnCount}</span></div>
                                    </CardContent>
                                </CardboardCard>
                            </ScrollArea>
                            <SheetFooter className="p-4 border-t bg-background mt-auto">
                                {/* Add relevant mobile actions here if needed */}
                           </SheetFooter>
                        </SheetContent>
                    </Sheet>
                    <div className="flex gap-1">
                        {/* Mobile Inventory/Skills Trigger */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon"><Backpack className="w-5 h-5" /></Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col">
                               <Tabs defaultValue="inventory" className="h-full flex flex-col">
                                    <TabsList className="flex-none border-b">
                                        <TabsTrigger value="inventory" className="flex-1"><Backpack className="w-4 h-4 mr-1.5"/> Inventory</TabsTrigger>
                                        <TabsTrigger value="skills" className="flex-1"><Workflow className="w-4 h-4 mr-1.5"/> Skills</TabsTrigger>
                                    </TabsList>
                                    <div className="flex-grow overflow-hidden">
                                        <TabsContent value="inventory" className="h-full"><InventoryDisplay /></TabsContent>
                                        <TabsContent value="skills" className="h-full">
                                            {character.skillTree && !isGeneratingSkillTree ? (
                                                <SkillTreeDisplay skillTree={character.skillTree} learnedSkills={character.learnedSkills} currentStage={character.skillTreeStage} />
                                             ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    {isGeneratingSkillTree ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : ""}
                                                    {isGeneratingSkillTree ? "Generating skill tree..." : "No skill tree available."}
                                                </div>
                                             )}
                                         </TabsContent>
                                    </div>
                                </Tabs>
                            </SheetContent>
                        </Sheet>
                        {/* Mobile Settings Trigger */}
                        <Sheet open={isSettingsPanelOpen} onOpenChange={setIsSettingsPanelOpen}>
                            <SheetTrigger asChild><Button variant="ghost" size="icon"><Settings className="w-5 h-5" /></Button></SheetTrigger>
                            {renderSettingsPanel()}
                        </Sheet>
                    </div>
                </div>

                 {/* Narration Area */}
                 <CardboardCard className="flex-1 flex flex-col overflow-hidden mb-4 border-2 border-foreground/20 shadow-inner min-h-0">
                    <CardHeader className="flex-none border-b border-foreground/10 py-3 px-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <BookCopy className="w-4 h-4"/> Story Log
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                        <ScrollArea className="h-full pr-3"> {/* Use full height */}
                            {storyLog.length > 0 ? (
                                storyLog.map((log, index) => (
                                    <div key={`log-${index}`} className="mb-3 pb-3 border-b border-border/50 last:border-b-0">
                                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                            <CalendarClock className="w-3 h-3"/> Turn {index + 1}
                                            <span className="ml-auto text-xs">({new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                                        </p>
                                        <p className="text-sm whitespace-pre-wrap mt-1 leading-relaxed">{log.narration}</p>
                                    </div>
                                ))
                            ) : (
                                isInitialLoading ? <Skeleton className="h-12 w-full mt-2" /> : (
                                    <p className="text-sm text-muted-foreground italic mt-4">Your adventure begins now. Type your first action below.</p>
                                )
                            )}
                             {renderDynamicContent()} {/* Render loading, dice, errors, or choices here */}
                            <div ref={scrollEndRef} />
                        </ScrollArea>

                    </CardContent>
                 </CardboardCard>

                 {/* Input Area */}
                 <div className="flex-none"> {/* Prevent input area from shrinking */}
                    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                        <Input
                            type="text"
                            value={playerInput}
                            onChange={(e) => setPlayerInput(e.target.value)}
                            placeholder="What do you do? (e.g., look around, use sword, talk to guard)"
                            className="flex-1 text-sm h-10"
                            aria-label="Enter your action or command"
                            disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}
                        />
                         <Tooltip>
                             <TooltipTrigger asChild>
                                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 px-4" aria-label="Send action to narrator" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading || !playerInput.trim()}>
                                   <Send className="w-4 h-4" />
                                </Button>
                             </TooltipTrigger>
                              <TooltipContent>Send Action</TooltipContent>
                         </Tooltip>
                          <Tooltip>
                             <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" type="button" onClick={handleSuggestAction} aria-label="Suggest Action" className="h-10 w-10" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}>
                                   <Sparkles className="w-4 h-4"/>
                                </Button>
                             </TooltipTrigger>
                              <TooltipContent><p>Suggest Action</p></TooltipContent>
                         </Tooltip>
                         {/* Crafting Button */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" type="button" onClick={() => setIsCraftingDialogOpen(true)} aria-label="Open Crafting" className="h-10 w-10" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}>
                                    <Hammer className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Open Crafting</p></TooltipContent>
                        </Tooltip>

                    </form>
                 </div>

                {/* Action Buttons - Placed below input */}
                <div className="flex-none flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                    <Button variant="secondary" size="sm" onClick={handleSaveGame} disabled={isLoading || isEnding || isSaving || !currentAdventureId || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}>
                        <Save className="mr-1 h-4 w-4" /> Save Game
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="outline" size="sm" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}>
                                <ArrowLeft className="mr-1 h-4 w-4" /> Abandon
                             </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>Abandoning the adventure will end your current progress (unsaved changes lost) and return you to the main menu.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleGoBack} className="bg-destructive hover:bg-destructive/90">Abandon</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="destructive" size="sm" onClick={() => handleEndAdventure()} disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isCraftingLoading}>
                       <Skull className="mr-1 h-4 w-4" /> End Adventure
                    </Button>
                     {/* Desktop Settings Button */}
                     <Sheet open={isSettingsPanelOpen} onOpenChange={setIsSettingsPanelOpen}>
                        <SheetTrigger asChild>
                           <Button variant="ghost" size="sm" className="hidden md:inline-flex"><Settings className="w-4 h-4 mr-1.5" /> Settings</Button>
                        </SheetTrigger>
                        {renderSettingsPanel()}
                    </Sheet>
                </div>


                {/* Class Change Confirmation Dialog */}
                 {pendingClassChange && (
                    <AlertDialog open={!!pendingClassChange} onOpenChange={() => setPendingClassChange(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Class Change Suggestion</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Your actions suggest you might be more suited to the **{pendingClassChange}** class. Changing class will reset your current skill progression ({character.class} Stage {character.skillTreeStage}) and grant you the starting skills of a {pendingClassChange}. Do you wish to change?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setPendingClassChange(null)}>Stay as {character.class}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleConfirmClassChange(pendingClassChange)}>Become a {pendingClassChange}</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                 )}

                 {/* Render Crafting Dialog */}
                 {renderCraftingDialog()}
            </div>
        </div>
    </TooltipProvider>
  );
}
