// src/components/screens/AdventureSummary.tsx
"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, FileText, Home } from "lucide-react";

export function AdventureSummary() {
  const { state, dispatch } = useGame();
  const { adventureSummary, storyLog, character } = state;
  const [showDetailed, setShowDetailed] = useState(false);

  const handleMainMenu = () => {
    dispatch({ type: "RESET_GAME" }); // Reset game state fully
  };

  const handleNewAdventureSameCharacter = () => {
    // Keep character, reset other things and go to setup
    if (!character) return;
    dispatch({ type: "SET_GAME_STATUS", payload: "AdventureSetup" });
    // Keep character, reset adventure settings, log, summary, narration
    dispatch({ type: "SET_ADVENTURE_SETTINGS", payload: { adventureType: null, permanentDeath: true }}); // Reset settings
    dispatch({ type: 'UPDATE_NARRATION', payload: { narration: '', updatedGameState: '' } }); // Clear narration
    dispatch({ type: 'END_ADVENTURE', payload: { summary: null } }); // Clear summary, reset status implicitly handled by SET_GAME_STATUS

  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
             <BookOpen className="w-7 h-7"/> Adventure Ended
             {character && <span className="text-xl font-medium text-muted-foreground"> - {character.name}'s Tale</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Section */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5"/> Summary</h3>
            <ScrollArea className="h-40 rounded-md border p-3 bg-muted/30">
                 <p className="text-sm whitespace-pre-wrap">{adventureSummary || "No summary available."}</p>
             </ScrollArea>
          </div>

          {/* Detailed Story Log Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="detailed-log">
              <AccordionTrigger className="text-xl font-semibold">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5"/> View Full Story Log
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-64 rounded-md border p-3 bg-muted/30">
                  {storyLog.length > 0 ? (
                    storyLog.map((log, index) => (
                      <div key={index} className="mb-3 pb-3 border-b border-border/50 last:border-b-0">
                        <p className="text-sm whitespace-pre-wrap">{log.narration}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No story log recorded.</p>
                  )}
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
           {/* Option to restart with same character - needs state management adjustment */}
           {/* <Button variant="outline" onClick={handleNewAdventureSameCharacter} disabled={!character}>
                Restart with {character?.name || 'Character'}
           </Button> */}
           <Button onClick={handleMainMenu} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full">
              <Home className="mr-2 h-4 w-4" /> Back to Main Menu
           </Button>
        </CardFooter>
      </CardboardCard>
    </div>
  );
}
