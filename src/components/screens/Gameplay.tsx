// src/components/screens/Gameplay.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { CharacterDisplay } from "@/components/game/CharacterDisplay";
import { WorldMapDisplay } from "@/components/game/WorldMapDisplay"; // Assuming placeholder exists
import { narrateAdventure } from "@/ai/flows/narrate-adventure";
import { summarizeAdventure } from "@/ai/flows/summarize-adventure";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Send, Loader2, BookCopy, ArrowLeft, Info, Dices } from "lucide-react";
import { rollDice } from "@/services/dice-roller"; // Import the dice roller
import { useToast } from "@/hooks/use-toast";

export function Gameplay() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const { character, currentNarration, currentGameStateString, storyLog, adventureSettings } = state;
  const [playerInput, setPlayerInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      // Use querySelector to find the viewport element within the ScrollArea
      const scrollViewport = scrollAreaRef.current.querySelector<HTMLDivElement>('div[data-radix-scroll-area-viewport]');
      if(scrollViewport) {
        // Set scrollTop to scrollHeight to scroll to the bottom
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      } else {
          // Fallback if viewport not found (might happen during initial render)
          // Try scrolling the main element, though less reliable
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }
  }, []);


  // --- Initial Narration ---
  useEffect(() => {
    // Only trigger initial narration if:
    // - We are in the Gameplay state
    // - There's a character loaded
    // - There is no current narration (meaning it's the first load or came back from summary)
    // - We are not already loading
    if (state.status === "Gameplay" && character && !currentNarration && !isLoading && storyLog.length === 0) {
        console.log("Gameplay: Triggering initial narration.");
        // Use a generic starting prompt for the very first action
        handlePlayerAction("Begin the adventure.");
    }
    // Dependency array includes necessary state pieces to re-evaluate when needed.
    // handlePlayerAction is memoized with useCallback to prevent unnecessary re-renders.
  }, [state.status, character, currentNarration, isLoading, storyLog.length, handlePlayerAction]);


   // Scroll to bottom when new narration/log entries arrive
   useEffect(() => {
       scrollToBottom();
   }, [storyLog, scrollToBottom]); // Depend on storyLog length or content


  // --- Handle Player Action Submission ---
  // Memoize handlePlayerAction to prevent it from changing on every render unless dependencies change
  const handlePlayerAction = useCallback(async (action: string) => {
    // Ensure character exists and not already loading
    if (!character || isLoading) {
       console.log("Action blocked: No character or already loading.");
       return;
     }

    console.log(`Handling action: "${action}"`);
    setIsLoading(true);
    setError(null);
    setDiceResult(null); // Clear previous dice result visual

    // --- Dice Roll Simulation ---
    let actionWithDice = action;
    // Example: 30% chance to trigger a dice roll for player actions
    // This could be more complex based on action type, character skills etc.
    if (action !== "Begin the adventure." && Math.random() < 0.3) {
        setIsRollingDice(true);
        toast({ title: "Rolling Dice...", description: "Fate hangs in the balance!" });
        await new Promise(resolve => setTimeout(resolve, 800)); // Short pause for effect

        try {
            const roll = await rollDice();
            setDiceResult(roll); // Set result for potential display
            // Add dice roll info to the action string for the AI
            actionWithDice += ` (Dice Roll Result: ${roll})`;
            console.log(`Dice rolled: ${roll}`);
            toast({ title: `Dice Roll: ${roll}`, description: roll >= 4 ? "Success!" : (roll <= 2 ? "Challenging..." : "Average outcome.")});
            await new Promise(resolve => setTimeout(resolve, 700)); // Pause to show dice result toast

        } catch (diceError) {
            console.error("Dice roll failed:", diceError);
            setError("The dice clattered away mysteriously... Proceeding without roll.");
            toast({ title: "Dice Error", description: "Could not roll dice.", variant: "destructive" });
            // Proceed without roll info in the action
        } finally {
            setIsRollingDice(false);
        }
    }


    // --- Prepare input for AI ---
    const inputForAI = {
      // Pass the entire character object as defined in the flow's input schema
      character: {
        name: character.name,
        description: character.description, // Base description
        traits: character.traits,
        knowledge: character.knowledge,
        background: character.background,
        stats: character.stats,
        aiGeneratedDescription: character.aiGeneratedDescription, // Pass optional AI description
      },
      playerChoice: actionWithDice, // Use the action string, potentially with dice info
      gameState: currentGameStateString,
    };

    try {
      console.log("Sending to narrateAdventure flow:", JSON.stringify(inputForAI, null, 2));
      const result = await narrateAdventure(inputForAI);
      console.log("Received from narrateAdventure flow:", result);

      // Dispatch the valid result from the AI
      dispatch({ type: "UPDATE_NARRATION", payload: result });

    } catch (err: any) {
      console.error("Narration error:", err);
      const errorMessage = err.message || "The story encountered an unexpected snag.";
      setError(`${errorMessage} Please try a different action or rephrase.`);
      toast({ title: "Story Error", description: errorMessage.substring(0, 100), variant: "destructive"});
      // Keep the old game state if narration fails to ensure consistency
    } finally {
      setIsLoading(false);
      setPlayerInput(""); // Clear input field after attempt
      // Ensure scroll after potential error or success
       requestAnimationFrame(() => {
           scrollToBottom();
       });
    }
  }, [character, isLoading, currentGameStateString, dispatch, toast, scrollToBottom]); // Dependencies for useCallback

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = playerInput.trim();
    if (trimmedInput && !isLoading && !isRollingDice) { // Prevent submission while loading/rolling
       handlePlayerAction(trimmedInput);
    } else if (!trimmedInput) {
        toast({ description: "Please enter an action.", variant: "destructive"});
    }
  };

  // --- End Adventure ---
  const handleEndAdventure = async () => {
     if (isLoading) return; // Don't end if loading
     setIsLoading(true);
     setError(null);
     toast({ title: "Ending Adventure", description: "Summarizing your tale..." });

     // Get final narration or use last one - maybe send a specific "End Game" action?
     const finalNarration = currentNarration || { narration: "The adventure concludes.", updatedGameState: currentGameStateString };

     // Generate Summary from the story log
     let summary = "Your adventure has concluded.";
     if (storyLog.length > 0) {
         // Combine narrations into a single story string
         const fullStory = storyLog.map((log, index) => `[Turn ${index + 1}]\n${log.narration}`).join("\n\n---\n\n");
         try {
             console.log("Sending story for summarization:", fullStory.substring(0, 500) + "..."); // Log snippet
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
         summary = "Your adventure ended before it truly began.";
     }

     // Dispatch END_ADVENTURE with the summary and optional final narration
     dispatch({ type: "END_ADVENTURE", payload: { summary, finalNarration } });
     setIsLoading(false);
   };

   // --- Go Back ---
   const handleGoBack = () => {
       if (isLoading) return;
       // TODO: Add confirmation dialog ("Are you sure you want to abandon this adventure?")
       toast({ title: "Returning...", description: "Leaving current adventure." });
       // Reset parts of the state but keep character? Or full reset?
       // Option 1: Go back to setup (keep character)
       // dispatch({ type: "SET_GAME_STATUS", payload: "AdventureSetup" });
       // Option 2: Go back to main menu (full reset likely needed before next game)
       dispatch({ type: "RESET_GAME" }); // Resets everything including character
       dispatch({ type: "SET_GAME_STATUS", payload: "MainMenu" });

   }

   // Display placeholder if character is somehow null
   if (!character) {
       return (
           <div className="flex items-center justify-center min-h-screen">
               <Loader2 className="h-8 w-8 animate-spin" />
               <p className="ml-4 text-lg">Loading Character...</p>
           </div>
       );
   }


  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen overflow-hidden bg-gradient-to-br from-background to-muted/30">
        {/* Left Panel (Character & Map) - Fixed width, scrollable content */}
        <div className="hidden md:flex flex-col w-80 lg:w-96 p-4 border-r border-foreground/10 overflow-y-auto bg-card/50">
             <CharacterDisplay />
             <WorldMapDisplay />
             {/* Actions at the bottom */}
             <div className="mt-auto space-y-2 pt-4">
                 <Button variant="outline" onClick={handleGoBack} className="w-full" disabled={isLoading}>
                     <ArrowLeft className="mr-2 h-4 w-4" /> Abandon Adventure
                 </Button>
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
                    <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                        {/* Render story log entries */}
                        {storyLog.map((log, index) => (
                            <div key={index} className="mb-4 pb-4 border-b border-foreground/10 last:border-b-0">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">{log.narration}</p>
                            {/* Optionally display game state changes for debugging */}
                            {/* <p className="text-xs text-muted-foreground mt-1 italic">State: {log.updatedGameState.substring(0, 100)}...</p> */}
                            </div>
                        ))}

                         {/* Loading / Dice Rolling Indicators */}
                        {isLoading && (
                            <div className="flex items-center justify-center py-4 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            <span>{isRollingDice ? 'Rolling dice...' : 'The story unfolds...'}</span>
                            </div>
                        )}
                        {/* Display Dice Roll Result Temporarily */}
                         {/* {diceResult !== null && !isLoading && (
                            <div className="flex items-center justify-center py-2 text-accent font-semibold">
                                <Dices className="h-5 w-5 mr-2" /> Rolled a {diceResult}!
                            </div>
                         )} */}

                        {/* Error Message */}
                        {error && (
                            <Alert variant="destructive" className="my-4">
                                <Info className="h-4 w-4" />
                                <AlertTitle>Story Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {/* Prompt for action if log is empty and not loading */}
                         {storyLog.length === 0 && !isLoading && (
                             <p className="text-center text-muted-foreground italic py-4">Your adventure awaits. What will you do?</p>
                         )}
                    </ScrollArea>
                 </CardContent>
            </CardboardCard>


             {/* Input Area */}
             <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-auto">
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
                   <Send className="h-5 w-5" />
                </Button>
             </form>

             {/* Buttons for smaller screens (Mobile View) */}
              <div className="md:hidden flex flex-col gap-2 mt-4 border-t pt-4">
                 {/* Optionally show a condensed character display on mobile */}
                 {/* <CharacterDisplay /> */}
                 <Button variant="outline" onClick={handleGoBack} disabled={isLoading}>
                     <ArrowLeft className="mr-2 h-4 w-4" /> Abandon
                 </Button>
                 <Button variant="destructive" onClick={handleEndAdventure} disabled={isLoading}>
                     <BookCopy className="mr-2 h-4 w-4" /> End Adventure
                 </Button>
             </div>
        </div>
    </div>
  );
}
