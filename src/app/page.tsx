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
import { ErrorBoundary } from "../components/ErrorBoundary";

export default function Home() {
  const { state } = useGame();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Current Game Status in page.tsx:", state.status);
    }
  }, [state.status]);

  const renderScreen = () => {
    switch (state.status) {
      case "MainMenu":
        return <ErrorBoundary><MainMenu /></ErrorBoundary>;
      case "CharacterCreation":
        return <ErrorBoundary><CharacterCreation /></ErrorBoundary>;
      case "AdventureSetup":
        return <ErrorBoundary><AdventureSetup /></ErrorBoundary>;
      case "Gameplay":
        return (
          <ErrorBoundary>
            {state.character ? (
              <Gameplay />
            ) : (
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading Character...
              </div>
            )}
          </ErrorBoundary>
        );
      // Co-op modes temporarily disabled
      case "CoopGameplay":
      case "CoopLobby":
        return <ErrorBoundary><MainMenu /></ErrorBoundary>;
      case "AdventureSummary":
        return <ErrorBoundary><AdventureSummary /></ErrorBoundary>;
      case "ViewSavedAdventures":
        return <ErrorBoundary><SavedAdventuresList /></ErrorBoundary>;
      default:
        console.warn("Unknown game status in page.tsx:", state.status, "Defaulting to MainMenu.");
        return <ErrorBoundary><MainMenu /></ErrorBoundary>;
    }
  };

  return <main className="min-h-screen">{renderScreen()}</main>;
}