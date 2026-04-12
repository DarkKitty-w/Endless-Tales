// src/components/game/NpcRelationshipsDisplay.tsx
"use client";

import React from "react";
import type { NpcRelationships } from "../../types/game-types";
import { Progress } from "../ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Heart } from "lucide-react";

interface NpcRelationshipsDisplayProps {
  relationships: NpcRelationships;
}

export function NpcRelationshipsDisplay({ relationships }: NpcRelationshipsDisplayProps) {
  const entries = Object.entries(relationships);
  
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No known NPCs.</p>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {entries.map(([npcName, score]) => {
          const normalizedScore = Math.max(-100, Math.min(100, score));
          const percentage = ((normalizedScore + 100) / 200) * 100;
          const isPositive = normalizedScore >= 0;
          
          return (
            <div key={npcName} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{npcName}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`text-sm font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {normalizedScore > 0 ? '+' : ''}{normalizedScore}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Relationship with {npcName}</p>
                    <p className="text-xs text-muted-foreground">
                      {normalizedScore >= 75 ? 'Ally' :
                       normalizedScore >= 50 ? 'Friend' :
                       normalizedScore >= 25 ? 'Friendly' :
                       normalizedScore >= 0 ? 'Acquaintance' :
                       normalizedScore >= -25 ? 'Neutral' :
                       normalizedScore >= -50 ? 'Disliked' :
                       normalizedScore >= -75 ? 'Enemy' : 'Nemesis'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Progress
                value={percentage}
                className={`h-2 ${isPositive ? '[&>div]:bg-green-500' : '[&>div]:bg-red-500'}`}
              />
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}