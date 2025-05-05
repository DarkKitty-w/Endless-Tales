"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants";
import type { CharacterStats } from "@/types/character-types";
import { cn } from "@/lib/utils";

interface StatAllocationInputProps {
  label: string;
  statKey: keyof CharacterStats;
  value: number;
  onChange: (statKey: keyof CharacterStats, value: number) => void;
  Icon?: LucideIcon;
  iconColor?: string; // Keep this prop for compatibility, but don't use it directly
}

export function StatAllocationInput({
  label,
  statKey,
  value,
  onChange,
  Icon,
  // iconColor is no longer needed here as it's applied within the Icon usage
}: StatAllocationInputProps) {
  const handleSliderChange = (newValue: number[]) => {
    onChange(statKey, newValue[0]);
  };

  return (
    <div className="space-y-3 border p-4 rounded-md bg-card/50">
      <div className="flex items-center justify-between">
         <Label htmlFor={statKey} className="text-base font-medium flex items-center gap-1.5">
              {/* Apply icon color directly to the Icon component */}
              {Icon && <Icon className={cn("w-4 h-4",
                  statKey === 'strength' ? 'text-destructive' :
                  statKey === 'stamina' ? 'text-green-600' :
                  statKey === 'agility' ? 'text-blue-500' :
                  'text-muted-foreground' // Default color
               )} />}
             {label}
         </Label>
         <span className="text-lg font-bold font-mono">{value}</span>
      </div>
      <Slider
        id={statKey}
        min={MIN_STAT_VALUE}
        max={MAX_STAT_VALUE}
        step={1}
        value={[value]}
        onValueChange={handleSliderChange}
        aria-label={`${label} Stat Slider`}
      />
    </div>
  );
}
