"use client";

import { useEffect } from 'react';
import { useGame } from "../context/GameContext";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { logger } from "@/lib/logger";

// PERF: Code-split each screen so only the active screen is loaded.
// ssr:false keeps them client-only (they all rely on browser APIs/localStorage state).
const MainMenu = dynamic(() => import("../components/screens/MainMenu").then(m => ({ default: m.MainMenu })), {
  ssr: false,
  loading: () => <ScreenLoader />,
});
const CharacterCreation = dynamic(() => import("../components/screens/CharacterCreation").then(m => ({ default: m.CharacterCreation })), {
  ssr: false,
  loading: () => <ScreenLoader />,
});
const AdventureSetup = dynamic(() => import("../components/screens/AdventureSetup").then(m => ({ default: m.AdventureSetup })), {
  ssr: false,
  loading: () => <ScreenLoader />,
});
const Gameplay = dynamic(() => import("../components/screens/Gameplay").then(m => ({ default: m.Gameplay })), {
  ssr: false,
  loading: () => <ScreenLoader />,
});
const AdventureSummary = dynamic(() => import("../components/screens/AdventureSummary").then(m => ({ default: m.AdventureSummary })), {
  ssr: false,
  loading: () => <ScreenLoader />,
});
const SavedAdventuresList = dynamic(() => import("../components/screens/SavedAdventuresList").then(m => ({ default: m.SavedAdventuresList })), {
  ssr: false,
  loading: () => <ScreenLoader />,
});
const CoopLobby = dynamic(() => import("../components/screens/CoopLobby").then(m => ({ default: m.CoopLobby })), {
  ssr: false,
  loading: () => <ScreenLoader />,
});

function ScreenLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin mr-2" /> Loading...
    </div>
  );
}

export default function Home() {
  const { state } = useGame();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.log("Current Game Status in page.tsx:", state.status);
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
      case "CoopLobby":
        return <ErrorBoundary><CoopLobby /></ErrorBoundary>;
      case "CoopGameplay":
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
      case "AdventureSummary":
        return <ErrorBoundary><AdventureSummary /></ErrorBoundary>;
      case "ViewSavedAdventures":
        return <ErrorBoundary><SavedAdventuresList /></ErrorBoundary>;
      default:
        logger.warn('Unknown game status in page.tsx', 'page', { status: state.status, message: "Defaulting to MainMenu" });
        return <ErrorBoundary><MainMenu /></ErrorBoundary>;
    }
  };

  return <main className="min-h-screen">{renderScreen()}</main>;
}