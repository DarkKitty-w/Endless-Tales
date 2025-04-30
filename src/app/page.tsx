// src/app/page.tsx
"use client";

import { useGame } from "@/context/GameContext";
import { MainMenu } from "@/components/screens/MainMenu";
import { CharacterCreation } from "@/components/screens/CharacterCreation";
import { AdventureSetup } from "@/components/screens/AdventureSetup";
import { Gameplay } from "@/components/screens/Gameplay";
import { AdventureSummary } from "@/components/screens/AdventureSummary";
import { SavedAdventuresList } from "@/components/screens/SavedAdventuresList"; // Import the new component
import { Loader2 } from "lucide-react";

export default function Home() {
  const { state } = useGame();

  const renderScreen = () => {
    switch (state.status) {
      case "MainMenu":
        return <MainMenu />;
      case "CharacterCreation":
        return <CharacterCreation />;
      case "AdventureSetup":
        return <AdventureSetup />;
      case "Gameplay":
        // Add check for character before rendering Gameplay
        return state.character ? <Gameplay /> : <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin mr-2"/> Loading Character...</div>;
      case "AdventureSummary":
        return <AdventureSummary />;
      case "ViewSavedAdventures": // Add case for the new status
        return <SavedAdventuresList />;
      default:
        console.warn("Unknown game status:", state.status);
        return <MainMenu />; // Default to main menu
    }
  };

  return <main className="min-h-screen">{renderScreen()}</main>;
}
