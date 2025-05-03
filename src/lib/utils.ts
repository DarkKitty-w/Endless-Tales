import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ItemQuality } from "@/context/GameContext"; // Import ItemQuality type

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper to get quality color
export const getQualityColor = (quality: ItemQuality | undefined): string => {
    switch (quality) {
        case "Poor": return "text-gray-500 dark:text-gray-400";
        case "Common": return "text-foreground";
        case "Uncommon": return "text-green-600 dark:text-green-400";
        case "Rare": return "text-blue-600 dark:text-blue-400";
        case "Epic": return "text-purple-600 dark:text-purple-400";
        case "Legendary": return "text-orange-500 dark:text-orange-400";
        default: return "text-muted-foreground";
    }
};

// Function to calculate XP needed for the next level (example curve)
export const calculateXpToNextLevel = (currentLevel: number): number => {
  // Example: Simple exponential curve (adjust as needed)
  // Level 1 -> 2 needs 100 XP
  // Level 2 -> 3 needs 150 XP
  // Level 3 -> 4 needs 225 XP
  // ...
  const baseXP = 100;
  const scalingFactor = 1.5;
  return Math.floor(baseXP * Math.pow(scalingFactor, currentLevel - 1));
};
