"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from "../../context/GameContext";
import { Button } from "../../components/ui/button";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/game/CardboardCard";
import { Play, Settings, Sparkles, FolderClock, ChevronDown, Dices, Swords, Users, KeyRound, HardDrive } from "lucide-react";
import { SettingsPanel } from '../../components/screens/SettingsPanel';
import {
  Sheet,
  SheetTrigger,
} from "../../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../components/ui/dropdown-menu";
import type { AdventureType } from "../../types/adventure-types";

interface MainMenuProps {
  // Props can be added here if needed in the future
}

const ADVENTURE_MODE_SUMMARIES = [
  {
    icon: Dices,
    title: "Randomized",
    description: "A rule-enforced RPG run where the world unfolds as you play.",
  },
  {
    icon: Swords,
    title: "Custom",
    description: "Build your own genre, tone, magic, tech, and challenge mix.",
  },
  {
    icon: Sparkles,
    title: "Immersed",
    description: "A freer sandbox for existing universes, lore, and roleplay fantasy.",
  },
  {
    icon: Users,
    title: "Co-op",
    description: "Private manual P2P co-op for one friend now; small-party target later.",
  },
];

export const MainMenu = React.memo(function MainMenu(props: MainMenuProps) {
  const { dispatch } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("MainMenu component mounted.");
    }
  }, []);

  const handleNewGameFlow = (adventureType: AdventureType) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`MainMenu: Starting new game flow for type: ${adventureType}`);
    }
    dispatch({ type: "RESET_GAME" });
    dispatch({ type: "SET_ADVENTURE_TYPE", payload: adventureType });

    if (adventureType === "Randomized") {
      // For Randomized, go to Character Creation first.
      dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
    } else if (adventureType === "Coop") {
      // For Co-op, go to CoopLobby for hosting/joining sessions.
      dispatch({ type: "SET_GAME_STATUS", payload: "CoopLobby" });
    } else {
      // For Custom and Immersed, go to Adventure Setup first.
      dispatch({ type: "SET_GAME_STATUS", payload: "AdventureSetup" });
    }
  };

  const handleViewSaved = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log("MainMenu: Handling View Saved Adventures button click.");
    }
    dispatch({ type: "SET_GAME_STATUS", payload: "ViewSavedAdventures" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background relative">
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-2 focus:rounded focus:shadow-md"
      >
        Skip to main content
      </a>

      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10" aria-label="Open settings">
            <Settings className="h-6 w-6 text-muted-foreground" />
            <span className="sr-only">Open Settings</span>
          </Button>
        </SheetTrigger>
        <SettingsPanel isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      </Sheet>

      <CardboardCard id="main-content" className="w-full max-w-md text-center shadow-xl border-2 border-foreground/20">
        <CardHeader className="border-b border-foreground/10 pb-4">
          <CardTitle className="text-4xl font-bold text-foreground mb-4">
            Endless Tales
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {ADVENTURE_MODE_SUMMARIES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-md border border-foreground/10 bg-muted/20 p-3">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <Icon className="h-4 w-4 text-primary" /> {title}
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-left text-xs text-muted-foreground space-y-2">
            <p className="flex items-start gap-2">
              <KeyRound className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong className="text-foreground">BYOK AI:</strong> cloud providers use your own API keys from Settings. WebLLM is experimental and local.</span>
            </p>
            <p className="flex items-start gap-2">
              <HardDrive className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong className="text-foreground">Local saves:</strong> adventures stay in this browser, with JSON import/export for backups.</span>
            </p>
          </div>

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
              <DropdownMenuItem onClick={() => handleNewGameFlow("Coop")} className="cursor-pointer">
                <Users className="mr-2 h-4 w-4" /> Co-op Adventure
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="lg" onClick={handleViewSaved} variant="secondary" className="w-full">
            <FolderClock className="mr-2 h-5 w-5" /> View Saved Adventures
          </Button>
        </CardContent>
        <CardFooter className="pt-4 justify-center flex-col items-center">
          <p className="text-xs text-muted-foreground mb-2">v0.1.0 - Alpha · Browser-first · BYOK · Local saves</p>
          <a
            href='https://ko-fi.com/K3K31ELFCW'
            target='_blank'
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-foreground/15 bg-muted/40 px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            Support on Ko-fi
          </a>
        </CardFooter>
      </CardboardCard>
      <footer className="mt-8 text-sm text-muted-foreground text-center">
        <p>An AI-powered text adventure where your choices shape the story.</p>
      </footer>
    </div>
  );
});