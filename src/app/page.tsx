// src/app/page.tsx
"use client";

import { useGame } from "@/context/GameContext";
import { MainMenu } from "@/components/screens/MainMenu";
import { CharacterCreation } from "@/components/screens/CharacterCreation";
import { AdventureSetup } from "@/components/screens/AdventureSetup";
import { Gameplay } from "@/components/screens/Gameplay";
import { AdventureSummary } from "@/components/screens/AdventureSummary";

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
        return <Gameplay />;
      case "AdventureSummary":
        return <AdventureSummary />;
      default:
        return <MainMenu />; // Default to main menu
    }
  };

  return <main className="min-h-screen">{renderScreen()}</main>;
}
