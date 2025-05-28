
// src/app/page.tsx
"use client";

import { useEffect } from 'react';
import { useGame } from "@/context/GameContext";
import { MainMenu } from "@/components/screens/MainMenu";
import { CharacterCreation } from "@/components/screens/CharacterCreation";
import { AdventureSetup } from "@/components/screens/AdventureSetup";
import { Gameplay } from "@/components/screens/Gameplay";
import { AdventureSummary } from "@/components/screens/AdventureSummary";
import { SavedAdventuresList } from "@/components/screens/SavedAdventuresList";
import { CoopLobby } from "@/components/screens/CoopLobby"; // Import CoopLobby
import { Loader2 } from "lucide-react";

export default function Home() {
  const { state } = useGame();

  useEffect(() => {
    console.log("Current Game Status in page.tsx:", state.status);
  }, [state.status]);


  const renderScreen = () => {
    console.log("Rendering screen for status:", state.status);
    switch (state.status) {
      case "MainMenu":
        return <MainMenu />;
      case "CharacterCreation":
        return <CharacterCreation />;
      case "AdventureSetup":
        return <AdventureSetup />;
      case "Gameplay":
      case "CoopGameplay": // Gameplay component handles both single and co-op
        // For co-op, character might be null initially if managed by session
        if (state.status === "CoopGameplay" && state.sessionId) {
            return <Gameplay />;
        }
        return state.character ? <Gameplay /> : <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin mr-2"/> Loading Character...</div>;
      case "AdventureSummary":
        return <AdventureSummary />;
      case "ViewSavedAdventures":
        return <SavedAdventuresList />;
      case "CoopLobby": // New case for CoopLobby
        return <CoopLobby />;
      default:
        console.warn("Unknown game status in page.tsx:", state.status, "Defaulting to MainMenu.");
        return <MainMenu />;
    }
  };

  return <main className="min-h-screen">{renderScreen()}</main>;
}
