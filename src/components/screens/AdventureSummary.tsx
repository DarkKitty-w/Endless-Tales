// src/components/screens/AdventureSummary.tsx
"use client";

import React from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, FileText, Home } from "lucide-react";

export function AdventureSummary() {
  const { state, dispatch } = useGame();
  const { adventureSummary, storyLog, character } = state;

  const handleMainMenu = () => {
    dispatch({ type: "RESET_GAME" }); // Reset game state fully
  };

  // TODO: Implement saving/loading logic if required later
  // const handleSaveStory = () => { ... }
  // const handleViewSavedStories = () => { ... }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-2xl shadow-xl border-2 border-foreground/20">
        <CardHeader className="border-b border-foreground/10 pb-4">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
             <BookOpen className="w-7 h-7"/> Adventure Ended
             {character && <span className="text-xl font-medium text-muted-foreground"> - {character.name}'s Tale</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Summary Section */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold flex items-center gap-2"><FileText className="w-5 h-5"/> Summary of Your Journey</h3>
            <ScrollArea className="h-40 rounded-md border p-3 bg-muted/30 border-foreground/10">
                 <p className="text-sm whitespace-pre-wrap leading-relaxed">{adventureSummary || "No summary was generated for this adventure."}</p>
             </ScrollArea>
          </div>

          {/* Detailed Story Log Accordion */}
          <Accordion type="single" collapsible className="w-full border-t border-foreground/10 pt-6">
            <AccordionItem value="detailed-log" className="border-b-0">
              <AccordionTrigger className="text-xl font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5"/> View Full Story Log
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ScrollArea className="h-64 rounded-md border p-3 bg-muted/30 border-foreground/10">
                  {storyLog.length > 0 ? (
                    storyLog.map((log, index) => (
                      <div key={log.timestamp ? `log-${log.timestamp}-${index}` : `log-fallback-${index}`} className="mb-3 pb-3 border-b border-border/50 last:border-b-0">
                        <p className="text-sm font-semibold text-muted-foreground">Turn {index + 1} <span className="text-xs">({new Date(log.timestamp || Date.now()).toLocaleTimeString()})</span></p>
                        <p className="text-sm whitespace-pre-wrap mt-1 leading-relaxed">{log.narration}</p>
                         {/* Optional: Show game state changes for debugging */}
                         {/* <pre className="text-xs text-muted-foreground/70 mt-2 italic overflow-auto bg-black/10 p-1 rounded">State:\n{log.updatedGameState}</pre> */}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No detailed story log was recorded for this adventure.</p>
                  )}
                </ScrollArea>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t border-foreground/10">
           {/* Note: Persistent saving (across sessions) is not implemented yet. */}
           {/* <Button variant="secondary" disabled>Save Story (Coming Soon)</Button> */}
           <Button onClick={handleMainMenu} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" /> Back to Main Menu
           </Button>
        </CardFooter>
      </CardboardCard>
    </div>
  );
}

    