// src/components/game/WorldMapDisplay.tsx
"use client";

import { useGame } from "@/context/GameContext";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { HandDrawnMapIcon } from "@/components/icons/HandDrawnIcons";
import Image from "next/image"; // Import next/image

export function WorldMapDisplay() {
  const { state } = useGame();
  const { character } = state; // Access character if needed for map context

  // Placeholder map generation logic - replace with AI call later
  // Using a fixed image for now, but could be dynamic based on character/adventureId
  const mapImageUri = `https://picsum.photos/seed/${state.currentAdventureId || 'defaultmap'}/400/300`;

  return (
    <CardboardCard className="mb-4 bg-card/90 backdrop-blur-sm">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <HandDrawnMapIcon className="w-5 h-5" /> World Map
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 flex flex-col items-center justify-center">
        {/* Display the map image */}
        <div className="w-full aspect-[4/3] relative mb-2 rounded-sm overflow-hidden border border-foreground/10 shadow-inner">
           <Image
             src={mapImageUri}
             alt="Adventure Map"
             layout="fill" // Use fill layout
             objectFit="cover" // Cover the area
             className="filter grayscale-[30%] sepia-[20%]" // Apply a slight old map filter
           />
            {/* TODO: Add player marker based on game state */}
            {/* Example placeholder marker */}
            {/* <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <User className="w-4 h-4 text-red-600 animate-pulse" />
            </div> */}
        </div>
        <p className="text-sm text-muted-foreground italic text-center">
          {character ? `${character.name}'s known world.` : 'Map visualization.'}
        </p>
        <p className="text-xs text-muted-foreground italic text-center mt-1">
            (Map interaction coming soon...)
        </p>
        {/* TODO: Implement interactive map elements based on game state */}
      </CardContent>
    </CardboardCard>
  );
}
