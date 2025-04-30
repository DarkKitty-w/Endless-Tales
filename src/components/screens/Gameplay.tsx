// src/components/screens/Gameplay.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useGame, type InventoryItem } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { CharacterDisplay } from "@/components/game/CharacterDisplay";
import { WorldMapDisplay } from "@/components/game/WorldMapDisplay";
import { InventoryDisplay } from "@/components/game/InventoryDisplay"; // Import InventoryDisplay
import { narrateAdventure } from "@/ai/flows/narrate-adventure";
import { summarizeAdventure } from "@/ai/flows/summarize-adventure";
import { assessActionDifficulty, type DifficultyLevel } from "@/ai/flows/assess-action-difficulty"; // Import assessment flow and type
import type { NarrateAdventureOutput } from "@/ai/flows/narrate-adventure"; // Import type
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Loader2, BookCopy, ArrowLeft, Info, Dices, Sparkles, Save } from "lucide-react"; // Added Save icon
import { rollDice, rollDifficultDice } from "@/services/dice-roller"; // Import both dice rollers
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

// Helper function to map difficulty dice string to roller function
const getDiceRollFunction = (diceType: string): (() => Promise<number>) | null => {
  switch (diceType) {
    case 'd6':
    case 'd10': // Use standard d10 roller for Easy/Normal for now
      return rollDice; // Assuming rollDice is d10
    case 'd20': // Add d20 if needed, or map to d10/d100
      return rollDice; // Map d20 to d10 for now
    case 'd100':
      return rollDifficultDice;
    case 'None':
    default:
      return null;
  }
};

// Placeholder function to generate image URIs (replace with actual AI call later)
// Keep this local for now, might move to a service later
async function generatePlaceholderImageUri(itemName: string): Promise<string> {
    let hash = 0;
    for (let i = 0; i < itemName.length; i++) {
        hash = itemName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const width = 200 + (Math.abs(hash) % 101); // width between 200-300
    const height = 200 + (Math.abs(hash >> 16) % 101); // height between 200-300
    // Add timestamp to ensure unique image on retry/reload if needed
    return `https://picsum.photos/${width}/${height}?random=${encodeURIComponent(itemName)}&t=${Date.now()}`;
}


export function Gameplay() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const { character, currentNarration, currentGameStateString, storyLog, adventureSettings, inventory, currentAdventureId } = state; // Added inventory, currentAdventureId
  const [playerInput, setPlayerInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false); // State for ending/summarizing
  const [isSaving, setIsSaving] = useState(false); // State for saving
  const [error, setError] = useState<string | null>(null);
  const [isAssessingDifficulty, setIsAssessingDifficulty] = useState(false); // State for difficulty assessment
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [diceType, setDiceType] = useState<string>("None"); // Track which die was rolled (string like "d10", "d100", "None")
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea viewport
  const scrollEndRef = useRef<HTMLDivElement>(null); // Ref for an element at the bottom
  const [isGeneratingInventoryImages, setIsGeneratingInventoryImages] = useState(false);

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
     scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

   // --- Handle Inventory Image Generation ---
   const generateInventoryImages = useCallback(async (itemNames: string[]) => {
       if (!itemNames || itemNames.length === 0 || isGeneratingInventoryImages) {
           return;
       }

        // Find items that are in the list but don't have an image URI yet
       const itemsToGenerate = inventory.filter(item => itemNames.includes(item.name) && !item.imageDataUri);

       if (itemsToGenerate.length === 0) {
           console.log("All listed inventory items already have images (or list is empty).");
           return;
       }

       setIsGeneratingInventoryImages(true);
       console.log("Generating images for inventory items:", itemsToGenerate.map(i => i.name));
       toast({ title: "Loading Item Images...", description: `Fetching visuals for ${itemsToGenerate.length} item(s).`, duration: 2000 });

       try {
           const generationPromises = itemsToGenerate.map(async (item) => {
               const imageDataUri = await generatePlaceholderImageUri(item.name);
               return { ...item, imageDataUri }; // Return item with new image URI
           });

           const generatedItems = await Promise.all(generationPromises);

           // Update the state by merging generated items with existing ones
           dispatch({
               type: "UPDATE_CHARACTER", // Use a generic update for simplicity, or add specific inventory action
               payload: {
                    // Merge existing inventory with newly generated images
                   inventory: inventory.map(existingItem => {
                       const generated = generatedItems.find(g => g.name === existingItem.name);
                       return generated ? generated : existingItem;
                   })
               } as any // Cast as any to bypass strict type check if needed for inventory update
           });

           console.log("Finished generating inventory images.");
          // toast({ title: "Item Images Loaded", duration: 1500 });

       } catch (error) {
           console.error("Error generating inventory images:", error);
           toast({ title: "Image Loading Error", description: "Could not load some item images.", variant: "destructive" });
       } finally {
           setIsGeneratingInventoryImages(false);
       }
   }, [inventory, dispatch, toast, isGeneratingInventoryImages]); // Add dependencies


  // --- Handle Player Action Submission ---
  const handlePlayerAction = useCallback(async (action: string, isInitialAction = false) => {
     if (!character || isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages) {
       console.log("Action blocked: No character or already busy.");
       toast({ description: "Please wait for the current action to complete.", variant: "default", duration: 1500 });
       return;
     }

    console.log(`Handling action: "${action}"`);
    setIsLoading(true); // Set loading true for the whole process
    setError(null);
    setDiceResult(null);
    setDiceType("None"); // Reset dice type

    let actionWithDice = action;
    let assessedDifficulty: DifficultyLevel = "Normal"; // Default difficulty
    let difficultyReasoning = "";
    let requiresRoll = false;
    let rollFunction: (() => Promise<number>) | null = null;


    // --- 1. Assess Difficulty (unless passive/initial) ---
    const actionLower = action.trim().toLowerCase();
    const isPassiveAction = ["look", "look around", "check inventory", "examine self", "status", "wait", "rest"].includes(actionLower);

    if (!isInitialAction && !isPassiveAction) {
        setIsAssessingDifficulty(true);
        toast({ title: "Assessing Challenge...", description: "Determining difficulty...", duration: 1500 });
        await new Promise(resolve => setTimeout(resolve, 400)); // Short pause for effect

        try {
             const assessmentInput = {
                playerAction: action,
                 // Include inventory in capabilities string
                characterCapabilities: `Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, AGI ${character.stats.agility}. Traits: ${character.traits.join(', ') || 'None'}. Knowledge: ${character.knowledge.join(', ') || 'None'}. Background: ${character.background}. Inventory: ${inventory.map(i => i.name).join(', ') || 'Empty'}`,
                currentSituation: currentNarration?.narration || "At the beginning of the scene.", // Use last narration as situation
                gameStateSummary: currentGameStateString,
             };
            console.log("Sending to assessActionDifficulty:", JSON.stringify(assessmentInput, null, 2));
            const assessmentResult = await assessActionDifficulty(assessmentInput);
            console.log("Received from assessActionDifficulty:", assessmentResult);

            assessedDifficulty = assessmentResult.difficulty;
            difficultyReasoning = assessmentResult.reasoning;
            setDiceType(assessmentResult.suggestedDice); // Store the suggested dice string
            rollFunction = getDiceRollFunction(assessmentResult.suggestedDice); // Get the actual function

            requiresRoll = assessedDifficulty !== "Trivial" && assessedDifficulty !== "Impossible" && rollFunction !== null;

             toast({
                title: `Difficulty: ${assessedDifficulty}`,
                description: difficultyReasoning.substring(0, 100), // Show snippet of reasoning
                duration: 2500
             });
             await new Promise(resolve => setTimeout(resolve, 600)); // Pause after assessment

            // If impossible, stop here and inform player
            if (assessedDifficulty === "Impossible") {
                setError(`Action seems impossible: ${difficultyReasoning} Try something else.`);
                toast({ title: "Action Impossible", description: difficultyReasoning, variant: "destructive", duration: 4000 });
                setIsLoading(false);
                setIsAssessingDifficulty(false);
                setPlayerInput(""); // Clear input
                scrollToBottom();
                return; // Stop processing the action
            }

        } catch (assessError: any) {
            console.error("Difficulty assessment failed:", assessError);
            setError("Failed to assess difficulty. Assuming 'Normal'.");
            toast({ title: "Assessment Error", description: "Assuming normal difficulty.", variant: "destructive" });
            assessedDifficulty = "Normal";
            setDiceType("d10"); // Default dice on error
            rollFunction = rollDice;
            requiresRoll = true; // Assume roll is needed if assessment failed
        } finally {
            setIsAssessingDifficulty(false);
        }
    } else {
        // Passive or initial action, no assessment needed
        requiresRoll = false;
        assessedDifficulty = "Trivial";
        difficultyReasoning = "Passive or initial action.";
        setDiceType("None");
    }


    // --- 2. Roll Dice (if required) ---
    if (requiresRoll && rollFunction) {
        setIsRollingDice(true);
        toast({ title: `Rolling ${diceType}...`, description: "Testing fate...", duration: 1500 });
        await new Promise(resolve => setTimeout(resolve, 600)); // Pause for effect

        try {
            const roll = await rollFunction(); // Call the determined roll function
            setDiceResult(roll);
            actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll Result: ${roll}/${diceType.substring(1)})`; // Append roll and type
            console.log(`Dice rolled ${diceType}: ${roll}`);

            // Basic outcome toast (can be refined)
            const numericDiceType = parseInt(diceType.substring(1), 10);
            const successThreshold = Math.ceil(numericDiceType * 0.6);
            const failThreshold = Math.floor(numericDiceType * 0.3);
            let outcomeDesc = "Average outcome.";
            if (roll >= successThreshold) outcomeDesc = "Success!";
            if (roll <= failThreshold) outcomeDesc = "Challenging...";

            toast({ title: `Rolled ${roll} on ${diceType}!`, description: outcomeDesc, duration: 2000 });
            await new Promise(resolve => setTimeout(resolve, 800)); // Pause

        } catch (diceError) {
            console.error("Dice roll failed:", diceError);
            setError("The dice seem unresponsive... Proceeding based on skill.");
            toast({ title: "Dice Error", description: "Could not roll dice.", variant: "destructive" });
            actionWithDice += ` (Difficulty: ${assessedDifficulty}, Dice Roll: Failed)`; // Indicate dice failure
        } finally {
            setIsRollingDice(false);
        }
    } else if (!isPassiveAction && assessedDifficulty !== "Impossible") {
         // Add difficulty context even if no roll needed (e.g., Trivial)
         actionWithDice += ` (Difficulty: ${assessedDifficulty}, No Roll Required)`;
    }

    // --- 3. Narrate Action Outcome ---
    const inputForAI: NarrateAdventureInput = { // Ensure type correctness
      character: {
        name: character.name,
        description: character.description,
        traits: character.traits,
        knowledge: character.knowledge,
        background: character.background,
        stats: character.stats,
        aiGeneratedDescription: character.aiGeneratedDescription,
      },
      playerChoice: actionWithDice, // Send action possibly with dice result and difficulty context
      gameState: currentGameStateString, // Send the most up-to-date game state string
      previousNarration: storyLog.length > 0 ? storyLog[storyLog.length - 1].narration : undefined,
    };

    try {
      console.log("Sending to narrateAdventure flow:", JSON.stringify(inputForAI, null, 2));
      const result: NarrateAdventureOutput = await narrateAdventure(inputForAI);
      console.log("Received from narrateAdventure flow:", result);
      dispatch({ type: "UPDATE_NARRATION", payload: result }); // Dispatch full result including optional inventory
      setError(null); // Clear error on success

      // Trigger inventory image generation if inventory changed
      if (result.updatedInventory) {
         await generateInventoryImages(result.updatedInventory);
      }

       // --- Check for End Game Condition ---
       const lowerNarration = result.narration?.toLowerCase() || "";
       const lowerGameState = result.updatedGameState?.toLowerCase() || "";
       const isGameOver = lowerGameState.includes("game over") || lowerNarration.includes("your adventure ends") || lowerNarration.includes("you have died") || lowerNarration.includes("you achieved victory");

       if (isGameOver) {
            if (adventureSettings.permanentDeath && (lowerNarration.includes("you have died"))) {
                toast({title: "Game Over!", description: "Your journey has reached its final, permanent end.", variant: "destructive", duration: 5000});
                await handleEndAdventure(result);
            } else if (lowerNarration.includes("you have died")) {
                toast({title: "Defeat!", description: "You were overcome, but perhaps fate offers another chance (Respawn not implemented).", variant: "destructive", duration: 5000});
                 await handleEndAdventure(result);
            } else {
                 toast({title: "Adventure Concluded!", description: "Your tale reaches its current conclusion.", duration: 5000});
                 await handleEndAdventure(result);
            }
       }

    } catch (err: any) {
      console.error("Narration error:", err);
      const errorMessage = err.message || "The story encountered an unexpected snag.";
      setError(`${errorMessage} Perhaps try a different approach?`);
      toast({ title: "Story Error", description: errorMessage.substring(0, 100), variant: "destructive"});
    } finally {
      setIsLoading(false); // Set loading false only after everything is done
      if (!isInitialAction) setPlayerInput(""); // Clear input field
      requestAnimationFrame(scrollToBottom); // Scroll after state update
    }
  }, [character, inventory, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages, currentGameStateString, currentNarration, storyLog, adventureSettings, dispatch, toast, scrollToBottom, generateInventoryImages]); // Added inventory and image generation state/function


  // --- End Adventure ---
  const handleEndAdventure = useCallback(async (finalNarration?: NarrateAdventureOutput) => {
     if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages) return;
     setIsEnding(true); // Use dedicated ending state
     setError(null);
     toast({ title: "Ending Adventure", description: "Summarizing your tale..." });

     const finalNarrationContext = finalNarration ?? currentNarration ?? (storyLog.length > 0 ? storyLog[storyLog.length - 1] : null);

     let summary = "Your adventure has concluded.";
     const hasLog = storyLog.length > 0 || finalNarrationContext;
     if (hasLog) {
          // Ensure finalNarrationContext matches StoryLogEntry structure if used directly
          const finalLogEntryMaybe: StoryLogEntry | null = finalNarrationContext ? { ...finalNarrationContext, timestamp: Date.now() } : null;

          const fullStoryLog = [...storyLog];
          if (finalLogEntryMaybe && (!storyLog.length || storyLog[storyLog.length - 1].narration !== finalLogEntryMaybe.narration)) {
             fullStoryLog.push(finalLogEntryMaybe);
          }
         const fullStory = fullStoryLog.map((log, index) => `[Turn ${index + 1}]\n${log.narration}`).join("\n\n---\n\n");

         if(fullStory.trim().length > 0) {
             try {
                 console.log("Sending story for summarization:", fullStory.substring(0, 500) + "...");
                 const summaryResult = await summarizeAdventure({ story: fullStory });
                 summary = summaryResult.summary;
                 console.log("Summary received:", summary);
                 toast({ title: "Summary Generated", description: "View your adventure outcome." });
             } catch (summaryError: any) {
                 console.error("Summary generation failed:", summaryError);
                 summary = `Could not generate a summary due to an error: ${summaryError.message || 'Unknown error'}. The adventure ended.`;
                 toast({ title: "Summary Error", description: "Failed to generate summary.", variant: "destructive" });
             }
         } else {
             summary = "The story was too brief to summarize, but your adventure has concluded.";
         }
     } else {
         summary = "Your adventure ended before it could be properly logged.";
     }

     // Dispatch END_ADVENTURE which will change status and save summary/final log
      dispatch({ type: "END_ADVENTURE", payload: { summary, finalNarration: finalNarrationContext ?? undefined } });
     // No need to set isLoading/isEnding false here, as the component will transition

   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages, storyLog, currentNarration, dispatch, toast]);


   // --- Handle Save Game ---
   const handleSaveGame = useCallback(async () => {
        if (isLoading || isEnding || isSaving || !currentAdventureId || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages) return;
        setIsSaving(true);
        toast({ title: "Saving Progress..." });
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save time

        try {
            dispatch({ type: "SAVE_CURRENT_ADVENTURE" });
            toast({ title: "Game Saved!", description: `Your progress for "${character?.name || 'Adventurer'}" has been saved.`, variant: "default" });
        } catch (err) {
            console.error("Failed to save game:", err);
            toast({ title: "Save Failed", description: "Could not save your progress.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
   }, [dispatch, toast, isLoading, isEnding, isSaving, currentAdventureId, character, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages]);


  // --- Initial Narration & Image Generation Trigger ---
  useEffect(() => {
     const isNewGame = state.status === "Gameplay" && character && storyLog.length === 0 && !isLoading && !isEnding && !isSaving && !isAssessingDifficulty && !isRollingDice && !isGeneratingInventoryImages && !state.savedAdventures.some(s => s.id === state.currentAdventureId);
     const isLoadedGame = state.status === "Gameplay" && character && storyLog.length > 0 && !isLoading && !isEnding && !isSaving && !isAssessingDifficulty && !isRollingDice && !isGeneratingInventoryImages && state.savedAdventures.some(s => s.id === state.currentAdventureId);

     if (isNewGame) {
         console.log("Gameplay: Triggering initial narration for new game.");
         handlePlayerAction("Begin the adventure by looking around.", true);
         // Trigger initial inventory image generation AFTER the initial narration potentially adds items
         // This check might be better placed after handlePlayerAction completes for the initial action
          if (inventory.length > 0) {
             generateInventoryImages(inventory.map(i => i.name));
         }
     } else if (isLoadedGame) {
          console.log("Gameplay: Resumed loaded game.");
          toast({ title: "Game Loaded", description: `Resuming adventure for ${character.name}.`, duration: 3000 });
          // Generate images for any items missing them on load
          generateInventoryImages(inventory.map(i => i.name));
          requestAnimationFrame(scrollToBottom);
     }
  }, [state.status, character, storyLog.length, inventory, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages, handlePlayerAction, state.savedAdventures, state.currentAdventureId, toast, scrollToBottom, generateInventoryImages]);


   // Scroll to bottom when new narration/log entries arrive or loading/assessment/rolling starts/ends
   useEffect(() => {
       scrollToBottom();
   }, [storyLog, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, diceResult, error, scrollToBottom]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = playerInput.trim();
    if (trimmedInput && !isLoading && !isAssessingDifficulty && !isRollingDice && !isEnding && !isSaving && !isGeneratingInventoryImages) {
       handlePlayerAction(trimmedInput);
    } else if (!trimmedInput) {
        toast({ description: "Please enter an action.", variant: "destructive"});
    } else if (isLoading || isAssessingDifficulty || isRollingDice || isEnding || isSaving || isGeneratingInventoryImages) {
        toast({ description: "Please wait for the current action to complete.", variant: "default", duration: 2000 });
    }
  };


   // --- Go Back (Abandon Adventure) ---
   const handleGoBack = useCallback(() => {
       if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages) return;
       toast({ title: "Returning to Main Menu...", description: "Abandoning current adventure." });
       dispatch({ type: "RESET_GAME" });
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages, dispatch, toast]);


   // --- Suggest Action ---
   const handleSuggestAction = useCallback(() => {
       if (isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages) return;
        const suggestions = [
            "Look around", "Examine surroundings", "Check inventory", "Check status",
            "Move north", "Move east", "Move south", "Move west",
            "Talk to [NPC Name]", "Ask about [Topic]",
            "Examine [Object]", "Pick up [Item]", "Use [Item]", "Drop [Item]",
            "Open [Door/Chest]", "Search the area",
            "Rest here", "Wait for a while",
            "Attack [Target]", "Defend yourself", "Flee",
            "Cast [Spell Name]", // If applicable
            "Use skill: [Skill Name]", // If applicable
        ];
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        setPlayerInput(suggestion);
        toast({ title: "Suggestion", description: `Try: "${suggestion}"`, duration: 3000 });
   }, [isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingInventoryImages, toast]);

   if (!character) {
       return (
           <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
               <Loader2 className="h-12 w-12 animate-spin text-primary" />
               <p className="text-lg text-muted-foreground">Loading Character Data...</p>
               <Button onClick={() => dispatch({ type: 'RESET_GAME' })} variant="outline">
                   Return to Main Menu
               </Button>
           </div>
       );
   }

   // Helper function to render dynamic content at the end of the scroll area
   const renderDynamicContent = () => {
     if (isGeneratingInventoryImages && !isLoading) { // Show only if not already showing main loading
        return (
            <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse">
                <Loader2 className="h-5 w-5 mr-2 animate-spin"/>
                <span>Loading item images...</span>
            </div>
        );
     }
    if (isSaving) {
        return (
            <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse">
                <Save className="h-5 w-5 mr-2 animate-ping" />
                <span>Saving progress...</span>
            </div>
        );
    }
    if (isEnding) {
        return (
            <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse">
                <BookCopy className="h-5 w-5 mr-2 animate-pulse" />
                <span>Ending and summarizing...</span>
            </div>
        );
    }
    // Combined Loading State (Assessment, Rolling, Narrating)
    if (isLoading) {
      let loadingText = "The story unfolds...";
      let LoadingIcon = Loader2;
      if (isAssessingDifficulty) {
        loadingText = "Assessing difficulty...";
      } else if (isRollingDice) {
        loadingText = `Rolling ${diceType}...`;
        LoadingIcon = Dices; // Use Dices icon for rolling
      }

      return (
        <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse">
           <LoadingIcon className={`h-5 w-5 mr-2 ${isRollingDice ? 'animate-spin duration-500' : 'animate-spin'}`} />
           <span>{loadingText}</span>
        </div>
      );
    }
    // Display Dice Result Separately after loading finishes
    if (diceResult !== null && diceType !== "None") {
      return (
        <div key={`dice-${Date.now()}`} className="flex items-center justify-center py-2 text-accent font-semibold italic animate-fade-in-out">
          <Dices className="h-5 w-5 mr-2" /> Rolled {diceResult} on {diceType}!
        </div>
      );
    }
    if (error) {
      return (
        <Alert variant="destructive" className="my-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Story Hiccup</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
     if (storyLog.length === 0 && !isLoading && !isEnding && !isSaving && !isAssessingDifficulty && !isRollingDice && !isGeneratingInventoryImages) { // Show initial prompt only if log is empty and not busy
         return <p className="text-center text-muted-foreground italic py-4">Initializing your adventure...</p>;
     }
    return null; // Render nothing if none of the above conditions met
   };


  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">
        {/* Left Panel (Character, Map, Inventory) - Fixed width, scrollable content */}
        <div className="hidden md:flex flex-col w-80 lg:w-96 p-4 border-r border-foreground/10 overflow-y-auto bg-card/50 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
             <CharacterDisplay />
             <WorldMapDisplay />
             <InventoryDisplay /> {/* Add Inventory Display */}
             {/* Actions at the bottom */}
             <div className="mt-auto space-y-2 pt-4 sticky bottom-0 bg-card/50 pb-4"> {/* Make actions sticky */}
                 <Button variant="secondary" onClick={handleSaveGame} className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" /> }
                      {isSaving ? "Saving..." : "Save Game"}
                 </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Abandon Adventure
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Abandoning the adventure will end your current progress (any unsaved changes will be lost) and return you to the main menu.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleGoBack} className="bg-destructive hover:bg-destructive/90">Abandon</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                 <Button variant="destructive" onClick={() => handleEndAdventure()} className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages}>
                     {isEnding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BookCopy className="mr-2 h-4 w-4" /> }
                     {isEnding ? "Summarizing..." : "End & Summarize"}
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
                    <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
                        <div className="p-4 space-y-4"> {/* Add padding here instead of ScrollArea */}
                            {/* Render story log entries */}
                            {storyLog.map((log, index) => (
                                <div key={log.timestamp ? `log-${log.timestamp}-${index}` : `log-fallback-${index}`} className="pb-4 border-b border-foreground/10 last:border-b-0">
                                    <p className="text-base whitespace-pre-wrap leading-relaxed text-foreground">{log.narration}</p>
                                     {/* Optional: Display game state changes for debugging */}
                                     {/* <pre className="text-xs text-muted-foreground/70 mt-1 overflow-auto bg-black/10 p-1 rounded">State:\n{log.updatedGameState}</pre> */}
                                </div>
                            ))}

                            {/* Render the dynamic content (loading, dice, error, initial prompt) */}
                            {renderDynamicContent()}

                            {/* Add invisible element at the very end for scrolling */}
                            <div ref={scrollEndRef} style={{ height: '1px' }} />
                        </div>
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
                    disabled={isLoading || isAssessingDifficulty || isRollingDice || isEnding || isSaving || isGeneratingInventoryImages}
                    aria-label="Suggest an action"
                    className="text-muted-foreground hover:text-accent flex-shrink-0"
                    title="Suggest Action"
                >
                    <Sparkles className="h-5 w-5" />
                </Button>
                <Input
                  type="text"
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  placeholder="What do you do next?"
                  disabled={isLoading || isAssessingDifficulty || isRollingDice || isEnding || isSaving || isGeneratingInventoryImages}
                  className="flex-grow text-base h-11 min-w-0" // Allow input to grow but have a min width
                  aria-label="Player action input"
                  autoComplete="off"
                />
                <Button
                    type="submit"
                    disabled={isLoading || isAssessingDifficulty || isRollingDice || isEnding || isSaving || isGeneratingInventoryImages || !playerInput.trim()}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground h-11 px-5 flex-shrink-0"
                    aria-label="Submit action"
                >
                   {(isLoading || isGeneratingInventoryImages) ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5" />}
                </Button>
             </form>

             {/* Buttons for smaller screens (Mobile View) */}
              <div className="md:hidden flex flex-col gap-2 mt-4 border-t pt-4">
                   {/* Add Inventory for Mobile */}
                   <InventoryDisplay />
                   <Button variant="secondary" onClick={handleSaveGame} className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4" /> }
                        {isSaving ? "Saving..." : "Save Game"}
                   </Button>
                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                         <Button variant="outline" className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages}>
                             <ArrowLeft className="mr-2 h-4 w-4" /> Abandon
                         </Button>
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
                 <Button variant="destructive" onClick={() => handleEndAdventure()} className="w-full" disabled={isLoading || isEnding || isSaving || isAssessingDifficulty || isRollingDice || isGeneratingInventoryImages}>
                    {isEnding ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BookCopy className="mr-2 h-4 w-4" /> }
                    {isEnding ? "Summarizing..." : "End Adventure"}
                 </Button>
             </div>
        </div>
    </div>
  );
}

// Add fade-in-out animation to tailwind config if not already present
// In tailwind.config.ts -> theme.extend.animation:
// 'fade-in-out': 'fadeInOut 1.5s ease-in-out forwards',
// In tailwind.config.ts -> theme.extend.keyframes:
// fadeInOut: {
//   '0%, 100%': { opacity: 0 },
//   '20%, 80%': { opacity: 1 }, // Stay visible longer
// }

// Add scrollbar-thin plugin if needed:
// Install: npm install -D tailwind-scrollbar
// In tailwind.config.ts -> plugins:
// plugins: [require("tailwindcss-animate"), require('tailwind-scrollbar')({ nocompatible: true })], // Add nocompatible for v3
