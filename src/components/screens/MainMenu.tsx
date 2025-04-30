// src/components/screens/MainMenu.tsx
"use client";

import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { BookOpen, Play } from "lucide-react";

export function MainMenu() {
  const { dispatch } = useGame();

  const handleNewGame = () => {
    dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
  };

  const handleViewStories = () => {
    // TODO: Implement view saved stories functionality
    alert("Viewing saved stories - Not yet implemented!");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-foreground mb-4 font-['Comic_Sans_MS',_'Chalkboard_SE',_'Marker_Felt',_sans-serif]">
            Endless Tales
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button size="lg" onClick={handleNewGame} className="bg-accent hover:bg-accent/90 text-accent-foreground w-full">
            <Play className="mr-2 h-5 w-5" /> Start New Adventure
          </Button>
          <Button variant="secondary" size="lg" onClick={handleViewStories} className="w-full">
            <BookOpen className="mr-2 h-5 w-5" /> View Saved Stories
          </Button>
        </CardContent>
      </CardboardCard>
       <footer className="mt-8 text-sm text-muted-foreground">
        <p>Press Ctrl/Cmd + B to toggle the sidebar (if applicable).</p>
        <p>An AI-powered text adventure.</p>
      </footer>
    </div>
  );
}
