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

export function Gameplay() {
  const { state, dispatch } = useGame();
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
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if(scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, []);


  // --- Initial Narration ---
  useEffect(() => {
    if (!currentNarration && character && !isLoading) {
      // Trigger initial narration when component mounts and no narration exists yet
      handlePlayerAction("Start the adventure");
    }
    // Intentionally omitting handlePlayerAction from dependency array to only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, currentNarration, isLoading, dispatch]); // Run only when character loads or narration clears


   // Scroll to bottom when new narration arrives
   useEffect(() => {
    scrollToBottom();
   }, [currentNarration, scrollToBottom]);


  // --- Handle Player Action Submission ---
  const handlePlayerAction = async (action: string) => {
    if (!character || isLoading) return;

    setIsLoading(true);
    setError(null);
    setDiceResult(null); // Clear previous dice result

    // --- Dice Roll ---
    let successModifier = 0;
    if (Math.random() < 0.5) { // 50% chance to require a dice roll (adjust probability as needed)
        setIsRollingDice(true);
        try {
            const roll = await rollDice();
            setDiceResult(roll);
             // Simple success logic: 4+ is good, 1-3 is less good/bad
            successModifier = roll >= 4 ? 1 : (roll <= 2 ? -1 : 0);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pause to show dice result
        } catch (diceError) {
            console.error("Dice roll failed:", diceError);
            setError("Dice roll failed. Proceeding without roll.");
            // Proceed without roll effect
        } finally {
            setIsRollingDice(false);
        }
    }


    // --- Prepare input for AI ---
    const inputForAI = {
      characterDescription: character.aiGeneratedDescription || character.description, // Prefer AI description if available
      playerChoice: `${action}${diceResult !== null ? ` (Dice Roll: ${diceResult})` : ''}`,
      gameState: currentGameStateString,
      // Consider adding relevant stats to context if needed by AI
    };

    try {
      console.log("Sending to narrateAdventure:", inputForAI);
      const result = await narrateAdventure(inputForAI);
       // TODO: Refine narration based on successModifier (e.g., prepend success/failure flavour text)
       // For now, just dispatching the result directly.
      dispatch({ type: "UPDATE_NARRATION", payload: result });
    } catch (err) {
      console.error("Narration error:", err);
      setError("The story encountered a snag. Try a different action.");
      // Keep the old game state if narration fails
    } finally {
      setIsLoading(false);
      setPlayerInput(""); // Clear input field after submission
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerInput.trim()) {
      handlePlayerAction(playerInput.trim());
    }
  };

  // --- End Adventure ---
  const handleEndAdventure = async () => {
     if (isLoading) return;
     setIsLoading(true);
     setError(null);

     // Get final narration or use last one
     const finalNarration = currentNarration; // Could add a specific "End Game" action too

     // Generate Summary
     let summary = "Your adventure has concluded.";
     if (storyLog.length > 0) {
         const fullStory = storyLog.map(log => log.narration).join("\n\n");
         try {
             const summaryResult = await summarizeAdventure({ story: fullStory });
             summary = summaryResult.summary;
         } catch (summaryError) {
             console.error("Summary generation failed:", summaryError);
             summary = "Could not generate a summary. Here's the full story:\n\n" + fullStory.substring(0, 500) + "...";
         }
     }

     dispatch({ type: "END_ADVENTURE", payload: { summary, finalNarration } });
     setIsLoading(false);
   };

   const handleGoBack = () => {
       // Consider adding confirmation dialog
       dispatch({ type: "SET_GAME_STATUS", payload: "MainMenu" }); // Or AdventureSetup?
       // Maybe Reset Game completely? dispatch({ type: "RESET_GAME" });
   }

  return (
    <div className="flex flex-col md:flex-row h-screen max-h-screen overflow-hidden bg-background">
        {/* Left Panel (Character & Map) - Visible on larger screens */}
        <div className="hidden md:block w-1/3 lg:w-1/4 p-4 overflow-y-auto border-r border-border">
             <CharacterDisplay />
             <WorldMapDisplay />
             <Button variant="outline" onClick={handleGoBack} className="w-full mt-4">
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back to Setup/Menu
             </Button>
             <Button variant="destructive" onClick={handleEndAdventure} className="w-full mt-2">
                 <BookCopy className="mr-2 h-4 w-4" /> End Adventure & Summarize
             </Button>
        </div>

        {/* Right Panel (Story & Input) */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Story Display Area */}
            <ScrollArea className="flex-1 mb-4 border border-border rounded-md p-4 bg-card" ref={scrollAreaRef}>
                 <div className="prose prose-sm max-w-none text-foreground"> {/* Basic prose styling */}
                     {storyLog.map((log, index) => (
                        <div key={index} className="mb-4 pb-4 border-b border-border/50 last:border-b-0">
                           <p style={{ whiteSpace: 'pre-wrap' }}>{log.narration}</p>
                        </div>
                     ))}
                     {isLoading && !isRollingDice && (
                        <div className="flex items-center justify-center py-4">
                           <Loader2 className="h-6 w-6 animate-spin text-primary" />
                           <p className="ml-2 text-muted-foreground">The story unfolds...</p>
                        </div>
                     )}
                     {isRollingDice && (
                         <div className="flex items-center justify-center py-4 text-accent font-semibold">
                             <Dices className="h-6 w-6 animate-spin mr-2" />
                             Rolling dice... {diceResult !== null ? `Rolled a ${diceResult}!` : ''}
                         </div>
                     )}
                     {error && (
                        <Alert variant="destructive" className="my-4">
                             <Info className="h-4 w-4" />
                            <AlertTitle>Story Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                     )}
                 </div>
             </ScrollArea>

             {/* Input Area */}
             <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <Input
                  type="text"
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  placeholder="What do you do next?"
                  disabled={isLoading || isRollingDice}
                  className="flex-1 text-base"
                  aria-label="Player action input"
                />
                <Button type="submit" disabled={isLoading || isRollingDice || !playerInput.trim()} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                   <Send className="h-5 w-5" />
                  <span className="sr-only">Send Action</span>
                </Button>
             </form>
             {/* Buttons for smaller screens */}
              <div className="md:hidden flex flex-col gap-2 mt-4">
                 <CharacterDisplay /> {/* Show character briefly on mobile */}
                 <Button variant="outline" onClick={handleGoBack}>
                     <ArrowLeft className="mr-2 h-4 w-4" /> Back
                 </Button>
                 <Button variant="destructive" onClick={handleEndAdventure}>
                     <BookCopy className="mr-2 h-4 w-4" /> End Adventure
                 </Button>
             </div>
        </div>
    </div>
  );
}
