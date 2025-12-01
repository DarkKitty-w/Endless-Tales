
"use client";

import { useEffect } from 'react';
import { useGame } from "../context/GameContext";
import { MainMenu } from "../components/screens/MainMenu";
import { CharacterCreation } from "../components/screens/CharacterCreation";
import { AdventureSetup } from "../components/screens/AdventureSetup";
import { Gameplay } from "../components/screens/Gameplay";
import { AdventureSummary } from "../components/screens/AdventureSummary";
import { SavedAdventuresList } from "../components/screens/SavedAdventuresList";
// import { CoopLobby } from "../components/screens/CoopLobby"; // Disabled
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
        return state.character ? <Gameplay /> : <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin mr-2"/> Loading Character...</div>;
      
      // Co-op modes temporarily disabled
      case "CoopGameplay":
      case "CoopLobby":
         return <MainMenu />;

      case "AdventureSummary":
        return <AdventureSummary />;
      case "ViewSavedAdventures":
        return <SavedAdventuresList />;
      default:
        console.warn("Unknown game status in page.tsx:", state.status, "Defaulting to MainMenu.");
        return <MainMenu />;
    }
  };

  return <main className="min-h-screen">{renderScreen()}</main>;
}
