// src/components/character/StatAllocationInput.tsx
"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants";
import type { CharacterStats } from "@/types/character-types";
import { cn } from "@/lib/utils";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "@/components/icons/HandDrawnIcons";

interface StatAllocationInputProps {
  label: string;
  statKey: keyof CharacterStats;
  value: number;
  onChange: (statKey: keyof CharacterStats, value: number) => void;
  Icon?: LucideIcon;
  disabled?: boolean;
  remainingPoints: number; // Add remaining points prop
}

export function StatAllocationInput({
  label,
  statKey,
  value,
  onChange,
  Icon,
  disabled = false,
  remainingPoints, // Use remaining points prop
}: StatAllocationInputProps) {

  // Map statKey to the appropriate icon component
  const StatIcon =
    statKey === 'strength' ? HandDrawnStrengthIcon :
    statKey === 'stamina' ? HandDrawnStaminaIcon :
    statKey === 'agility' ? HandDrawnAgilityIcon :
    Icon; // Fallback to passed Icon prop if any

  const handleSliderChange = (newValue: number[]) => {
     if (disabled) return;
     const change = newValue[0] - value;
      // Allow decreasing even if at 0 remaining, but not increasing if at 0
     if (change > 0 && remainingPoints <= 0) {
         return; // Prevent increasing if no points left
     }
    onChange(statKey, newValue[0]);
  };

   // Determine max value for slider based on remaining points
  const sliderMax = Math.min(MAX_STAT_VALUE, value + remainingPoints);

  return (
    <div className={cn("space-y-3 border p-4 rounded-md bg-card/50 transition-opacity", disabled && "opacity-50 cursor-not-allowed")}>
      <div className="flex items-center justify-between">
         <Label htmlFor={statKey} className="text-base font-medium flex items-center gap-1.5">
              {StatIcon && <StatIcon className={cn("w-4 h-4",
                  statKey === 'strength' ? 'text-destructive' :
                  statKey === 'stamina' ? 'text-green-600' :
                  statKey === 'agility' ? 'text-blue-500' :
                  'text-muted-foreground' // Default color for others
               )} />}
             {label}
         </Label>
         <span className="text-lg font-bold font-mono">{value}</span>
      </div>
      <Slider
        id={statKey}
        min={MIN_STAT_VALUE}
        max={MAX_STAT_VALUE} // Keep absolute max here
        step={1}
        value={[value]}
        onValueChange={handleSliderChange}
        aria-label={`${label} Stat Slider`}
        disabled={disabled || (remainingPoints <= 0 && value >= MAX_STAT_VALUE)} // Disable if 0 points AND max value reached for this stat
        className={disabled ? "cursor-not-allowed" : ""}
        // The onValueChange handler prevents increasing beyond the limit
      />
    </div>
  );
}
