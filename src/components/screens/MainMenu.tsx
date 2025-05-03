// src/components/screens/MainMenu.tsx
"use client";

import React, { useState } from 'react';
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Play, FolderClock, Settings } from "lucide-react"; // Added Settings icon
import { SettingsPanel } from './SettingsPanel'; // Import the new SettingsPanel
import {
  Sheet,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MainMenu() {
  const { dispatch } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleNewGame = () => {
    // Reset game state before starting character creation ensures a fresh start
    dispatch({ type: "RESET_GAME" });
    // Set status to CharacterCreation immediately after reset
    dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
  };

  const handleViewSaved = () => {
    dispatch({ type: "SET_GAME_STATUS", payload: "ViewSavedAdventures" });
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background relative">
      {/* Settings Button - Top Right */}
       <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetTrigger asChild>
           <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10">
              <Settings className="h-6 w-6 text-muted-foreground" />
              <span className="sr-only">Open Settings</span>
           </Button>
        </SheetTrigger>
         <SettingsPanel isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </Sheet>


      <CardboardCard className="w-full max-w-md text-center shadow-xl border-2 border-foreground/20">
        <CardHeader className="border-b border-foreground/10 pb-4">
          <CardTitle className="text-4xl font-bold text-foreground mb-4 font-['Comic_Sans_MS',_'Chalkboard_SE',_'Marker_Felt',_sans-serif]">
            Endless Tales
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-6">
          <Button size="lg" onClick={handleNewGame} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full">
            <Play className="mr-2 h-5 w-5" /> Start New Adventure
          </Button>
           {/* Add button to view saved adventures */}
           <Button size="lg" onClick={handleViewSaved} variant="secondary" className="w-full">
             <FolderClock className="mr-2 h-5 w-5" /> View Saved Adventures
           </Button>
        </CardContent>
        <CardFooter className="pt-4 justify-center">
           <p className="text-xs text-muted-foreground">v0.1.0 - Alpha</p>
        </CardFooter>
      </CardboardCard>
       <footer className="mt-8 text-sm text-muted-foreground text-center">
        <p>An AI-powered text adventure where your choices shape the story.</p>
      </footer>
    </div>
  );
}
