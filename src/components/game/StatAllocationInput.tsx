// src/components/game/StatAllocationInput.tsx
"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants";
import type { CharacterStats } from "@/types/game-types";
import { cn } from "@/lib/utils";

interface StatAllocationInputProps {
  label: string;
  statKey: keyof CharacterStats;
  value: number;
  onChange: (statKey: keyof CharacterStats, value: number) => void;
  Icon?: LucideIcon;
  iconColor?: string;
}

export function StatAllocationInput({
  label,
  statKey,
  value,
  onChange,
  Icon,
  iconColor = "text-muted-foreground",
}: StatAllocationInputProps) {
  const handleSliderChange = (newValue: number[]) => {
    onChange(statKey, newValue[0]);
  };

  return (
    <div className="space-y-3 border p-4 rounded-md bg-card/50">
      <div className="flex items-center justify-between">
         <Label htmlFor={statKey} className={cn("text-base font-medium flex items-center gap-1.5", iconColor)}>
             {Icon && <Icon className="w-4 h-4" />}
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
