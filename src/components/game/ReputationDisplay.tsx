// src/components/game/ReputationDisplay.tsx
"use client";

import React from "react";
import type { Reputation } from "../../types/game-types";
import { Progress } from "../ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ThumbsUp, Landmark } from "lucide-react";

interface ReputationDisplayProps {
  reputation: Reputation;
}

export function ReputationDisplay({ reputation }: ReputationDisplayProps) {
  const entries = Object.entries(reputation);
  
  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-center">
        <Landmark className="mx-auto mb-2 h-6 w-6 text-muted-foreground/60" />
        <p className="text-xs font-medium text-muted-foreground">No faction reputation yet</p>
        <p className="mt-1 text-[11px] text-muted-foreground/80">
          Your actions can earn trust, suspicion, favors, or enemies as factions appear in the story.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {entries.map(([faction, score]) => {
          const normalizedScore = Math.max(-100, Math.min(100, score));
          const percentage = ((normalizedScore + 100) / 200) * 100; // map -100..100 to 0..100
          const isPositive = normalizedScore >= 0;
          
          return (
            <div key={faction} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{faction}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`text-sm font-mono ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {normalizedScore > 0 ? '+' : ''}{normalizedScore}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Relationship with {faction}</p>
                    <p className="text-xs text-muted-foreground">
                      {normalizedScore >= 75 ? 'Exalted' :
                       normalizedScore >= 50 ? 'Revered' :
                       normalizedScore >= 25 ? 'Honored' :
                       normalizedScore >= 0 ? 'Friendly' :
                       normalizedScore >= -25 ? 'Neutral' :
                       normalizedScore >= -50 ? 'Unfriendly' :
                       normalizedScore >= -75 ? 'Hostile' : 'Hated'}
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