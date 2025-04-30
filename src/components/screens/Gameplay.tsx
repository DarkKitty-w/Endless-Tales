// src/components/screens/Gameplay.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { CharacterDisplay } from "@/components/game/CharacterDisplay";
import { WorldMapDisplay } from "@/components/game/WorldMapDisplay";
import { narrateAdventure } from "@/ai/flows/narrate-adventure";
import { summarizeAdventure } from "@/ai/flows/summarize-adventure";
import type { NarrateAdventureOutput } from "@/ai/flows/narrate-adventure"; // Import type
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Loader2, BookCopy, ArrowLeft, Info, Dices, Sparkles } from "lucide-react";
import { rollDice } from "@/services/dice-roller"; // Import the dice roller
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

export function Gameplay() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const { character, currentNarration, currentGameStateString, storyLog, adventureSettings } = state;
  const [playerInput, setPlayerInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false); // State for ending/summarizing
  const [error, setError] = useState<string | null>(null);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea viewport
  const scrollEndRef = useRef<HTMLDivElement>(null); // Ref for an element at the bottom

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
     scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);


  // --- Handle Player Action Submission ---
  const handlePlayerAction = useCallback(async (action: string, isInitialAction = false) => {
    if (!character || (isLoading && !isInitialAction) || isEnding) {
       console.log("Action blocked: No character, already loading, or ending.");
       return;
     }

    console.log(`Handling action: "${action}"`);
    setIsLoading(true);
    setError(null);
    setDiceResult(null);

    let actionWithDice = action;
    // Example: Avoid rolls for simple observation, roll for actions with uncertainty
    const actionLower = action.trim().toLowerCase();
    const requiresRoll = !isInitialAction && !["look", "look around", "check inventory", "examine self", "status"].includes(actionLower) && Math.random() < 0.6; // 60% chance for non-trivial actions

    if (requiresRoll) {
        setIsRollingDice(true);
        toast({ title: "Rolling Dice...", description: "Testing fate...", duration: 1500 });
        await new Promise(resolve => setTimeout(resolve, 600)); // Pause for effect

        try {
            const roll = await rollDice();
            setDiceResult(roll);
            actionWithDice += ` (Dice Roll Result: ${roll})`;
            console.log(`Dice rolled: ${roll}`);
            toast({ title: `Rolled a ${roll}!`, description: roll >= 5 ? "Success!" : (roll <= 2 ? "Challenging..." : "Average outcome."), duration: 1500 });
            await new Promise(resolve => setTimeout(resolve, 600)); // Pause to show toast
        } catch (diceError) {
            console.error("Dice roll failed:", diceError);
            setError("The dice seem unresponsive... Proceeding based on skill.");
            toast({ title: "Dice Error", description: "Could not roll dice.", variant: "destructive" });
        } finally {
            setIsRollingDice(false);
        }
    }

    const inputForAI = {
      character: {
        name: character.name,
        description: character.description,
        traits: character.traits,
        knowledge: character.knowledge,
        background: character.background,
        stats: character.stats,
        aiGeneratedDescription: character.aiGeneratedDescription,
      },
      playerChoice: actionWithDice,
      gameState: currentGameStateString,
      previousNarration: storyLog.length > 0 ? storyLog[storyLog.length - 1].narration : undefined,
    };

    try {
      console.log("Sending to narrateAdventure flow:", JSON.stringify(inputForAI, null, 2));
      const result = await narrateAdventure(inputForAI);
      console.log("Received from narrateAdventure flow:", result);
      dispatch({ type: "UPDATE_NARRATION", payload: result });
      setError(null); // Clear error on success

       // Check for end game condition (e.g., based on gameState string or narration content)
       // This is a simple example, a real game would have more robust logic
       if (result.updatedGameState?.toLowerCase().includes("game over") || result.narration?.toLowerCase().includes("your adventure ends")) {
            if (adventureSettings.permanentDeath) {
                toast({title: "Game Over!", description: "Your journey has reached its final end.", variant: "destructive", duration: 5000});
                await handleEndAdventure(result); // Pass final narration for context
            } else {
                 toast({title: "Defeat!", description: "You were defeated, but your story can continue...", variant: "destructive", duration: 5000});
                 // TODO: Implement respawn logic if permanentDeath is false
                 // For now, we'll just end the game for simplicity
                 await handleEndAdventure(result);
            }
       }

    } catch (err: any) {
      console.error("Narration error:", err);
      const errorMessage = err.message || "The story encountered an unexpected snag.";
      setError(`${errorMessage} Perhaps try a different approach?`);
      toast({ title: "Story Error", description: errorMessage.substring(0, 100), variant: "destructive"});
    } finally {
      setIsLoading(false);
      if (!isInitialAction) setPlayerInput(""); // Clear input field unless it was the initial action
      // Scroll after state update and DOM render
      requestAnimationFrame(scrollToBottom);
    }
  }, [character, isLoading, isEnding, currentGameStateString, storyLog, adventureSettings, dispatch, toast, scrollToBottom]); // Removed handleEndAdventure from deps


  // --- End Adventure ---
  const handleEndAdventure = useCallback(async (finalNarration?: NarrateAdventureOutput) => {
     if (isLoading || isEnding) return;
     setIsEnding(true); // Use dedicated ending state
     setError(null);
     toast({ title: "Ending Adventure", description: "Summarizing your tale..." });

     // Use the provided final narration if available, otherwise use context state
     const finalNarrationContext = finalNarration ?? currentNarration ?? (storyLog.length > 0 ? storyLog[storyLog.length - 1] : null);

     let summary = "Your adventure has concluded.";
     // Check if there's anything to summarize
     const hasLog = storyLog.length > 0 || finalNarrationContext;
     if (hasLog) {
         // Combine all narrations into a single story string for summarization
          const fullStoryLog = [...storyLog];
          // Add the final narration to the log if it exists and isn't already the last entry
          if (finalNarrationContext && (!storyLog.length || storyLog[storyLog.length - 1].narration !== finalNarrationContext.narration)) {
             fullStoryLog.push({ ...finalNarrationContext, timestamp: Date.now() });
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

   }, [isLoading, isEnding, storyLog, currentNarration, dispatch, toast]); // Added dependencies

  // --- Initial Narration Trigger ---
  useEffect(() => {
    if (state.status === "Gameplay" && character && storyLog.length === 0 && !isLoading && !isEnding) {
        console.log("Gameplay: Triggering initial narration.");
        handlePlayerAction("Begin the adventure by looking around.", true);
    }
  }, [state.status, character, storyLog.length, isLoading, isEnding, handlePlayerAction]);


   // Scroll to bottom when new narration/log entries arrive or loading starts/ends
   useEffect(() => {
       scrollToBottom();
   }, [storyLog, isLoading, isEnding, diceResult, error, scrollToBottom]); // Depend on anything that adds content


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = playerInput.trim();
    if (trimmedInput && !isLoading && !isRollingDice && !isEnding) {
       handlePlayerAction(trimmedInput);
    } else if (!trimmedInput) {
        toast({ description: "Please enter an action.", variant: "destructive"});
    } else if (isLoading || isRollingDice || isEnding) {
        toast({ description: "Please wait for the current action to complete.", variant: "default", duration: 2000 });
    }
  };


   // --- Go Back (Abandon Adventure) ---
   const handleGoBack = useCallback(() => {
       if (isLoading || isEnding) return;
       toast({ title: "Returning to Main Menu...", description: "Abandoning current adventure." });
       dispatch({ type: "RESET_GAME" });
   }, [isLoading, isEnding, dispatch, toast]); // Added dependencies

   // --- Suggest Action ---
   const handleSuggestAction = useCallback(() => {
       if (isLoading || isEnding) return;
        const suggestions = [
            "Look around", "Examine surroundings", "Check inventory", "Check status",
            "Move north", "Move east", "Move south", "Move west",
            "Talk to [NPC Name]", "Ask about [Topic]",
            "Examine [Object]", "Pick up [Item]", "Use [Item]",
            "Open [Door/Chest]", "Search the area",
            "Rest here", "Wait for a while",
            "Attack [Target]", "Defend yourself", "Flee",
            "Cast [Spell Name]", // If applicable
            "Use skill: [Skill Name]", // If applicable
        ];
        const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        setPlayerInput(suggestion);
        toast({ title: "Suggestion", description: `Try: "${suggestion}"`, duration: 3000 });
   }, [isLoading, isEnding, toast]); // Added dependencies

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
    if (isEnding) {
        return (
            <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse">
                <BookCopy className="h-5 w-5 mr-2 animate-pulse" />
                <span>Ending and summarizing...</span>
            </div>
        );
    }
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse">
          {isRollingDice ? (
            <>
              <Dices className="h-5 w-5 mr-2 animate-spin duration-500" />
              <span>Rolling dice...</span>
            </>
          ) : (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>The story unfolds...</span>
            </>
          )}
        </div>
      );
    }
    if (diceResult !== null) {
      // Use key to force re-render and restart animation
      return (
        <div key={`dice-${Date.now()}`} className="flex items-center justify-center py-2 text-accent font-semibold italic animate-fade-in-out">
          <Dices className="h-5 w-5 mr-2" /> Rolled a {diceResult}!
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
     if (storyLog.length === 0 && !isLoading && !isEnding) { // Show initial prompt only if log is empty and not ending
         return <p className="text-center text-muted-foreground italic py-4">Initializing your adventure...</p>;
     }
    return null; // Render nothing if none of the above conditions met
   };


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
                    <Button variant="outline" className="w-full" disabled={isLoading || isEnding}>
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

                 <Button variant="destructive" onClick={() => handleEndAdventure()} className="w-full" disabled={isLoading || isEnding}>
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
                    disabled={isLoading || isRollingDice || isEnding}
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
                  disabled={isLoading || isRollingDice || isEnding}
                  className="flex-grow text-base h-11 min-w-0" // Allow input to grow but have a min width
                  aria-label="Player action input"
                  autoComplete="off"
                />
                <Button
                    type="submit"
                    disabled={isLoading || isRollingDice || isEnding || !playerInput.trim()}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground h-11 px-5 flex-shrink-0"
                    aria-label="Submit action"
                >
                   {isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : <Send className="h-5 w-5" />}
                </Button>
             </form>

             {/* Buttons for smaller screens (Mobile View) */}
              <div className="md:hidden flex flex-col gap-2 mt-4 border-t pt-4">
                  <AlertDialog>
                     <AlertDialogTrigger asChild>
                         <Button variant="outline" className="w-full" disabled={isLoading || isEnding}>
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
                 <Button variant="destructive" onClick={() => handleEndAdventure()} className="w-full" disabled={isLoading || isEnding}>
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
