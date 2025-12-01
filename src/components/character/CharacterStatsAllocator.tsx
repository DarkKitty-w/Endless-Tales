
// src/components/character/CharacterStatsAllocator.tsx
"use client";

import React from "react";
import type { CharacterStats } from "../../types/character-types";
import { StatAllocationInput } from "./StatAllocationInput";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "../icons/HandDrawnIcons";
import { AlertCircle } from "lucide-react";

interface CharacterStatsAllocatorProps {
    stats: CharacterStats;
    remainingPoints: number;
    statError: string | null;
    onStatChange: (newStats: CharacterStats) => void;
    isGenerating?: boolean; // Optional prop for disabling inputs
}

export function CharacterStatsAllocator({
    stats,
    remainingPoints,
    statError,
    onStatChange,
    isGenerating = false, // Default to false
}: CharacterStatsAllocatorProps) {

    const handleLocalStatChange = (statKey: keyof CharacterStats, value: number) => {
        const newStats = { ...stats, [statKey]: value };
        onStatChange(newStats); // Call the parent handler with the updated stats object
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <h3 className="text-xl font-semibold">Allocate Stats ({stats.strength + stats.stamina + stats.wisdom} / 15 Total Points)</h3>
                <p className={`text-sm font-medium ${statError ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {statError ? (
                        <span className="flex items-center gap-1 text-destructive">
                            <AlertCircle className="h-4 w-4" /> {statError}
                        </span>
                    ) : (remainingPoints === 0 ? "All points allocated!" : `${remainingPoints} points remaining.`)}
                </p>
            </div>

            {/* Stat Inputs (Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatAllocationInput
                    label="Strength"
                    statKey="strength"
                    value={stats.strength}
                    onChange={handleLocalStatChange}
                    Icon={HandDrawnStrengthIcon}
                    disabled={isGenerating}
                    remainingPoints={remainingPoints}
                />
                <StatAllocationInput
                    label="Stamina"
                    statKey="stamina"
                    value={stats.stamina}
                    onChange={handleLocalStatChange}
                    Icon={HandDrawnStaminaIcon}
                    disabled={isGenerating}
                    remainingPoints={remainingPoints}
                />
                <StatAllocationInput
                    label="Wisdom"
                    statKey="wisdom"
                    value={stats.wisdom}
                    onChange={handleLocalStatChange}
                    Icon={HandDrawnAgilityIcon} // Using Agility icon as placeholder/alternative if Wisdom icon not defined here, though prompt implies Wisdom is used. Assuming HandDrawnAgilityIcon exists as per imports.
                    disabled={isGenerating}
                    remainingPoints={remainingPoints}
                />
            </div>
            {/* Display non-adjustable stats removed as per previous logic which focused on 3 main stats */}
        </div>
    );
}
