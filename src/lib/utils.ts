import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ItemQuality } from "../types/inventory-types";

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

/**
 * Sanitizes a player action input to prevent injection attacks and ensure reasonable length.
 * - Removes code blocks (triple backticks) and inline code.
 * - Escapes HTML-like tags.
 * - Trims and limits to 500 characters.
 * - Filters potential prompt injection patterns.
 */
export function sanitizePlayerAction(input: string): string {
    if (!input) return '';
    
    let sanitized = input;
    
    // Remove code blocks (triple backticks and content between them)
    sanitized = sanitized.replace(/```[\s\S]*?```/g, '');
    
    // Remove inline code (single backticks)
    sanitized = sanitized.replace(/`[^`]*`/g, '');
    
    // Escape HTML-like tags to prevent any XSS (though React handles this, defense in depth)
    sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Remove potential prompt injection patterns (e.g., "Ignore previous instructions", "You are now")
    const injectionPatterns = [
        /ignore (previous|all) instructions?/gi,
        /you are now/gi,
        /act as if/gi,
        /system prompt/gi,
        /\[INST\]/gi,
        /<\/?system>/gi,
        /override/gi,
        /bypass/gi,
    ];
    
    for (const pattern of injectionPatterns) {
        sanitized = sanitized.replace(pattern, '[filtered]');
    }
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Limit to 500 characters
    if (sanitized.length > 500) {
        sanitized = sanitized.substring(0, 500);
    }
    
    return sanitized;
}