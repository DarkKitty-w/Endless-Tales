"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from "../../context/GameContext";
import { Button } from "../../components/ui/button";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/game/CardboardCard";
import { Play, Settings, Sparkles, FolderClock, ChevronDown, Dices, Swords, Users, KeyRound, HardDrive } from "lucide-react";
import { SettingsPanel } from '../../components/screens/SettingsPanel';
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

import { logger } from "@/lib/logger";

export const MainMenu = React.memo(function MainMenu(props: MainMenuProps) {
  const { dispatch } = useGame();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    logger.debug("MainMenu component mounted.", "MainMenu");
  }, []);

  const handleNewGameFlow = (adventureType: AdventureType) => {
    logger.debug(`Starting new game flow for type: ${adventureType}`, "MainMenu", { adventureType });
    dispatch({ type: "RESET_GAME" });
    dispatch({ type: "SET_ADVENTURE_TYPE", payload: adventureType });

    if (adventureType === "Randomized") {
      // For Randomized, go to Character Creation first.
      dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
    } else if (adventureType === "Coop") {
      // Co-op still needs a local character before entering the lobby.
      dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
    } else {
      // For Custom and Immersed, go to Adventure Setup first.
      dispatch({ type: "SET_GAME_STATUS", payload: "AdventureSetup" });
    }
  };

  const handleViewSaved = () => {
    logger.debug("Handling View Saved Adventures button click.", "MainMenu");
    dispatch({ type: "SET_GAME_STATUS", payload: "ViewSavedAdventures" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-2 sm:p-4 bg-background relative overflow-y-auto">
      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:p-2 focus:rounded focus:shadow-md"
      >
        Skip to main content
      </a>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10"
        aria-label="Open settings"
        onClick={() => setIsSettingsOpen(true)}
      >
        <Settings className="h-6 w-6 text-muted-foreground" />
      </Button>
      <SettingsPanel isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />

      <CardboardCard id="main-content" className="w-full max-w-lg text-center shadow-xl border-2 border-foreground/20 my-2">
        <CardHeader className="border-b border-foreground/10 py-3 sm:py-4">
          <CardTitle className="text-3xl sm:text-4xl font-bold text-foreground">
            Endless Tales
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-3 sm:pt-4">
          <div className="grid grid-cols-2 gap-2 text-left">
            {ADVENTURE_MODE_SUMMARIES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-md border border-foreground/10 bg-muted/20 p-2">
                <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" /> {title}
                </div>
                <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground leading-snug">{description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-primary/20 bg-primary/5 p-2 text-left text-[10px] sm:text-xs text-muted-foreground space-y-1.5">
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
        <CardFooter className="pt-3 pb-3 justify-center flex-col items-center">
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