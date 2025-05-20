// src/components/character/StatAllocationInput.tsx
"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants";
import type { CharacterStats } from "@/types/character-types";
import { cn } from "@/lib/utils";
// Assuming HandDrawnWisdomIcon is now imported from HandDrawnIcons
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnMagicIcon as HandDrawnWisdomIcon } from "@/components/icons/HandDrawnIcons";

interface StatAllocationInputProps {
  label: string;
  statKey: keyof CharacterStats; // Will be 'strength', 'stamina', or 'wisdom'
  value: number;
  onChange: (statKey: keyof CharacterStats, value: number) => void;
  Icon?: LucideIcon; // The specific icon for the stat will be determined internally
  disabled?: boolean;
  remainingPoints: number;
}

export function StatAllocationInput({
  label,
  statKey,
  value,
  onChange,
  // Icon prop is kept for flexibility but specific icons are used based on statKey
  Icon: PropIcon, 
  disabled = false,
  remainingPoints,
}: StatAllocationInputProps) {

  // Map statKey to the appropriate icon component
  const StatSpecificIcon =
    statKey === 'strength' ? HandDrawnStrengthIcon :
    statKey === 'stamina' ? HandDrawnStaminaIcon :
    statKey === 'wisdom' ? HandDrawnWisdomIcon : // Use HandDrawnWisdomIcon
    PropIcon; // Fallback to passed Icon prop if any (though less likely to be used now)

  const handleSliderChange = (newValue: number[]) => {
     if (disabled) return;
     const change = newValue[0] - value;
     if (change > 0 && remainingPoints <= 0) {
         return; 
     }
    onChange(statKey, newValue[0]);
  };

  return (
    <div className={cn("space-y-3 border p-4 rounded-md bg-card/50 transition-opacity", disabled && "opacity-50 cursor-not-allowed")}>
      <div className="flex items-center justify-between">
         <Label htmlFor={statKey as string} className="text-base font-medium flex items-center gap-1.5">
              {StatSpecificIcon && <StatSpecificIcon className={cn("w-4 h-4",
                  statKey === 'strength' ? 'text-destructive' :
                  statKey === 'stamina' ? 'text-green-600' :
                  statKey === 'wisdom' ? 'text-purple-500' : // Color for Wisdom
                  'text-muted-foreground'
               )} />}
             {label}
         </Label>
         <span className="text-lg font-bold font-mono">{value}</span>
      </div>
      <Slider
        id={statKey as string}
        min={MIN_STAT_VALUE}
        max={MAX_STAT_VALUE}
        step={1}
        value={[value]}
        onValueChange={handleSliderChange}
        aria-label={`${label} Stat Slider`}
        disabled={disabled || (remainingPoints <= 0 && value >= MAX_STAT_VALUE)}
        className={disabled ? "cursor-not-allowed" : ""}
      />
    </div>
  );
}
