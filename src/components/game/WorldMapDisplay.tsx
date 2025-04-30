// src/components/game/WorldMapDisplay.tsx
"use client";

import { useGame } from "@/context/GameContext";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { HandDrawnMapIcon } from "@/components/icons/HandDrawnIcons"; // Assuming you have this

export function WorldMapDisplay() {
  const { state } = useGame();
  // In a real implementation, you'd use game state to render the map
  // For now, it's a placeholder

  return (
    <CardboardCard className="mb-4 bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <HandDrawnMapIcon className="w-5 h-5" /> World Map
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 min-h-[150px] flex items-center justify-center">
        <p className="text-muted-foreground italic">Map visualization coming soon...</p>
        {/* TODO: Implement interactive map based on game state */}
      </CardContent>
    </CardboardCard>
  );
}
