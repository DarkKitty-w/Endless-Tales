// src/app/page.tsx
"use client";

import { useEffect } from 'react'; // Import useEffect
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

  // Add useEffect for logging
  useEffect(() => {
    console.log("Current Game Status in page.tsx:", state.status);
  }, [state.status]);


  const renderScreen = () => {
    console.log("Rendering screen for status:", state.status); // Log before switch
    switch (state.status) {
      case "MainMenu":
        console.log("Rendering MainMenu component");
        return <MainMenu />;
      case "CharacterCreation":
        console.log("Rendering CharacterCreation component");
        return <CharacterCreation />;
      case "AdventureSetup":
        console.log("Rendering AdventureSetup component");
        return <AdventureSetup />;
      case "Gameplay":
        console.log("Checking for character before rendering Gameplay");
        // Add check for character before rendering Gameplay
        return state.character ? <Gameplay /> : <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin mr-2"/> Loading Character...</div>;
      case "AdventureSummary":
         console.log("Rendering AdventureSummary component");
        return <AdventureSummary />;
      case "ViewSavedAdventures": // Add case for the new status
         console.log("Rendering SavedAdventuresList component");
        return <SavedAdventuresList />;
      default:
        console.warn("Unknown game status in page.tsx:", state.status, "Defaulting to MainMenu.");
        return <MainMenu />; // Default to main menu
    }
  };

  return <main className="min-h-screen">{renderScreen()}</main>;
}
