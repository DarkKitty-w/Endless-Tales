import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ItemQuality } from "@/types/game-types"; // Import ItemQuality type

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

// Function to calculate XP needed for the next level is now in lib/gameUtils.ts
