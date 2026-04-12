// src/components/game/ReputationDisplay.tsx
"use client";

import React from "react";
import type { Reputation } from "../../types/game-types";
import { Progress } from "../ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface ReputationDisplayProps {
  reputation: Reputation;
}

export function ReputationDisplay({ reputation }: ReputationDisplayProps) {
  const entries = Object.entries(reputation);
  
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground italic">No reputation recorded.</p>;
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