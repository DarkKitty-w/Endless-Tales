// src/components/screens/MainMenu.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Play, Users, Settings, Sparkles, FolderClock, ChevronDown, Info, Dices, Swords } from "lucide-react"; // Added Dices, Swords
import { SettingsPanel } from '@/components/screens/SettingsPanel';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { AdventureType } from "@/types/adventure-types";
import Image from 'next/image';

export function MainMenu() {
  const { dispatch } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

   useEffect(() => {
     console.log("MainMenu component mounted.");
   }, []);

  const handleNewGameFlow = (adventureType: AdventureType) => {
    console.log(`MainMenu: Starting new game flow for type: ${adventureType}`);
    dispatch({ type: "RESET_GAME" }); 
    dispatch({ type: "SET_ADVENTURE_TYPE", payload: adventureType }); 
    dispatch({ type: "SET_GAME_STATUS", payload: "AdventureSetup" });
  };

  const handleViewSaved = () => {
     console.log("MainMenu: Handling View Saved Adventures button click.");
    dispatch({ type: "SET_GAME_STATUS", payload: "ViewSavedAdventures" });
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background relative">
       <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetTrigger asChild>
           <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10">
              <Settings className="h-6 w-6 text-muted-foreground" />
              <span className="sr-only">Open Settings</span>
           </Button>
        </SheetTrigger>
        <SheetContent side="right">
           <SheetHeader className="p-4 border-b">
              <SheetTitle>Settings</SheetTitle>
           </SheetHeader>
           <SettingsPanel isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
        </SheetContent>
       </Sheet>

      <CardboardCard className="w-full max-w-md text-center shadow-xl border-2 border-foreground/20">
        <CardHeader className="border-b border-foreground/10 pb-4">
          <CardTitle className="text-4xl font-bold text-foreground mb-4 font-['Comic_Sans_MS',_'Chalkboard_SE',_'Marker_Felt',_sans-serif]">
            Endless Tales
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full">
                  <Play className="mr-2 h-5 w-5" /> Start New Adventure <ChevronDown className="ml-auto h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[calc(100%-2rem)] sm:w-[364px] max-w-md">
                <DropdownMenuItem onClick={() => handleNewGameFlow("Randomized")} className="cursor-pointer">
                  <Dices className="mr-2 h-4 w-4" /> Randomized Adventure
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNewGameFlow("Custom")} className="cursor-pointer">
                  <Swords className="mr-2 h-4 w-4" /> Custom Adventure
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNewGameFlow("Immersed")} className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" /> Immersed Adventure
                </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <Users className="mr-2 h-4 w-4" /> Co-op Adventure (Coming Soon)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="lg" onClick={handleViewSaved} variant="secondary" className="w-full">
              <FolderClock className="mr-2 h-5 w-5" /> View Saved Adventures
            </Button>
        </CardContent>
        <CardFooter className="pt-4 justify-center flex-col items-center">
           <p className="text-xs text-muted-foreground mb-2">v0.1.0 - Alpha</p>
            <a href='https://ko-fi.com/K3K31ELFCW' target='_blank' rel="noopener noreferrer">
                <Image
                    src='https://storage.ko-fi.com/cdn/kofi5.png?v=6'
                    alt='Buy Me a Coffee at ko-fi.com'
                    width={150} 
                    height={36} 
                    style={{border: '0px', height: '36px', width: 'auto'}} 
                />
            </a>
        </CardFooter>
      </CardboardCard>
       <footer className="mt-8 text-sm text-muted-foreground text-center">
        <p>An AI-powered text adventure where your choices shape the story.</p>
      </footer>
    </div>
  );
}
