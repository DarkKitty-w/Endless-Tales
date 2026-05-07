import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ItemQuality } from "../types/inventory-types";
import { jsonrepair } from "jsonrepair";
import { z } from "zod";
import { logger } from "./logger";

/* -------------------------------------------------------
   UI UTIL
------------------------------------------------------- */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

/* -------------------------------------------------------
   SECURITY / INPUT SANITIZATION
   
   Note: This function sanitizes user input before sending to AI.
   It is NOT intended for XSS prevention in HTML rendering.
   For React JSX rendering, rely on built-in escaping.
   If HTML output is ever needed, use DOMPurify instead.
------------------------------------------------------- */
export function sanitizePlayerAction(input: string): string {
  if (!input || typeof input !== 'string') return "";

  let sanitized = input;

  // Remove code blocks and inline code
  sanitized = sanitized.replace(/```[\s\S]*?```/g, "");
  sanitized = sanitized.replace(/`[^`]*`/g, "");
  
  // SEC-8 Fix: Escape more dangerous characters for HTML context
  // Note: This is secondary protection; React JSX escaping is primary
  sanitized = sanitized
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\//g, "&#x2F;");

  // Check for prompt injection patterns (supplement to protectUserAction in ai-router.ts)
  const injectionPatterns = [
    /ignore (previous|all) instructions?/gi,
    /you are now/gi,
    /act as if/gi,
    /system prompt/gi,
    /\[INST\]/gi,
    /<\/?system>/gi,
    /override/gi,
    /bypass/gi,
    /forget (all )?(previous|above|instructions?)/gi,
    /you are an? (AI|assistant|language model)/gi,
    /repeat (the )?above/gi,
    /output (your|the) (system )?prompt/gi,
  ];

  for (const pattern of injectionPatterns) {
    sanitized = sanitized.replace(pattern, "[filtered]");
  }

  // Limit length to prevent abuse
  sanitized = sanitized.trim();
  if (sanitized.length > 500) sanitized = sanitized.substring(0, 500);

  return sanitized;
}

/**
 * Sanitize AI-generated content before rendering
 * SEC-9 Fix: Add defense-in-depth sanitization for AI content
 * Note: React's JSX escaping is the primary XSS protection.
 * This function provides additional safety by removing potentially dangerous content.
 */
export function sanitizeAIContent(content: unknown): string {
  if (typeof content !== 'string') {
    // If it's not a string, convert it safely
    if (content === null || content === undefined) return '';
    try {
      content = String(content);
    } catch {
      return '';
    }
  }
  
  let sanitized = content;
  
  // Remove any script tags or javascript: URLs
  sanitized = sanitized.replace(/<script[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove event handler attributes (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');
  
  // Remove dangerous HTML tags
  const dangerousTags = ['iframe', 'object', 'embed', 'form', 'input', 'button'];
  for (const tag of dangerousTags) {
    sanitized = sanitized.replace(new RegExp(`<${tag}[\\s\\S]*?</${tag}>`, 'gi'), '');
    sanitized = sanitized.replace(new RegExp(`<${tag}[\\s/>]+`, 'gi'), '');
  }
  
  return sanitized;
}

/* -------------------------------------------------------
   JSON EXTRACTION + REPAIR LAYER
------------------------------------------------------- */
export function extractJsonFromResponse(text: string): string {
  if (!text) return "{}";

  let cleaned = text.trim();

  // 1. Remove markdown fences (even if they enclose the whole JSON)
  cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1");

  // 2. Try to find JSON object/array boundaries
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let start =
    firstBrace === -1
      ? firstBracket
      : firstBracket === -1
      ? firstBrace
      : Math.min(firstBrace, firstBracket);

  const lastBrace = cleaned.lastIndexOf("}");
  const lastBracket = cleaned.lastIndexOf("]");
  let end =
    lastBrace === -1
      ? lastBracket
      : lastBracket === -1
      ? lastBrace
      : Math.max(lastBrace, lastBracket);

  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  // 3. Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  // 4. Strip trailing backticks that might have leaked through
  cleaned = cleaned.replace(/`{1,3}$/g, "").trim();

  return cleaned;
}

/* -------------------------------------------------------
   OUTPUT VALIDATION (GAME RULES)
------------------------------------------------------- */
/**
 * Validates AI-generated choices against available game state.
 * Filters out choices that reference skills/items the player doesn't have.
 */
export function validateChoicesAgainstGameState(
  choices: Array<{ text: string; consequenceHint?: string }>,
  availableSkills: string[],
  inventory: string[]
): Array<{ text: string; consequenceHint?: string }> {
  if (!choices || choices.length === 0) return choices;
  
  return choices.filter(choice => {
    const text = choice.text.toLowerCase();
    
    // Check if choice references a skill not in availableSkills
    const mentionsSkill = availableSkills.some(skill => 
      text.includes(skill.toLowerCase())
    );
    
    // If the text mentions a skill not in the list, filter it out
    const hasInvalidSkill = availableSkills.length > 0 && 
      text.includes('skill') && 
      !mentionsSkill && 
      availableSkills.every(skill => !text.includes(skill.toLowerCase()));
    
    // Check if choice references an item not in inventory
    const mentionsItem = inventory.some(item => 
      text.includes(item.toLowerCase())
    );
    
    // If text mentions an item not in inventory, filter it out
    const hasInvalidItem = inventory.length > 0 && 
      (text.includes('use') || text.includes('equip') || text.includes('drink') || text.includes('read')) &&
      !mentionsItem &&
      inventory.every(item => !text.includes(item.toLowerCase()));
    
    return !hasInvalidSkill && !hasInvalidItem;
  });
}

/* -------------------------------------------------------
   UNIVERSAL AI PIPELINE (REAL RETRIES + DEBUG LOGS)
------------------------------------------------------- */
export async function processAiResponse<T>(
  rawText: string,
  schema: z.ZodSchema<T>,
  fallback: T,
  normalizer?: (data: any) => any
): Promise<T> {
  // Helper that runs extraction, jsonrepair, and parse in sequence
  const tryParse = (text: string): any | null => {
    try {
      const repaired = jsonrepair(extractJsonFromResponse(text));
      const parsed = JSON.parse(repaired);
      return parsed;
    } catch (e) {
      return null;
    }
  };

  // RETRY LOGIC: Multiple extraction attempts with different strategies
  const extractionStrategies = [
    // Strategy 1: Full text parse (original)
    () => tryParse(rawText),
    // Strategy 2: Extract from markdown blocks specifically
    () => {
      const markdownMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      return markdownMatch ? tryParse(markdownMatch[1]) : null;
    },
    // Strategy 3: Try to find JSON object with regex (more permissive)
    () => {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      return jsonMatch ? tryParse(jsonMatch[0]) : null;
    },
    // Strategy 4: Try to find JSON array
    () => {
      const arrayMatch = rawText.match(/\[[\s\S]*\]/);
      return arrayMatch ? tryParse(arrayMatch[0]) : null;
    },
    // Strategy 5: Aggressive cleanup - remove all non-JSON content
    () => {
      let cleaned = rawText;
      // Remove any leading/trailing text before/after JSON
      const firstBrace = cleaned.indexOf('{');
      const firstBracket = cleaned.indexOf('[');
      const lastBrace = cleaned.lastIndexOf('}');
      const lastBracket = cleaned.lastIndexOf(']');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
        return tryParse(cleaned);
      }
      if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        cleaned = cleaned.substring(firstBracket, lastBracket + 1);
        return tryParse(cleaned);
      }
      return null;
    }
  ];

  let data: any = null;
  for (let i = 0; i < extractionStrategies.length; i++) {
    try {
      data = extractionStrategies[i]();
      if (data !== null) {
        logger.log(`[processAiResponse] Extraction succeeded with strategy ${i + 1}`);
        break;
      }
    } catch (e) {
      logger.error(`[processAiResponse] Strategy ${i + 1} failed:`, e);
    }
  }

  if (!data) {
    logger.error("[processAiResponse] All parsing attempts failed. rawText (first 500 chars):", rawText.substring(0, 500));
    return fallback;
  }

  // Apply the universal normalizers (defensive checks)
  // Wrapped in try/catch so that an error here doesn't break the pipeline
  let processed: any;
  try {
    // smartNormalize – try to unwrap common LLM response wrappers
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch {}
    }
    if (Array.isArray(data)) data = { data };

    if (typeof data === "object" && data !== null) {
      // unwrap .result, .output, .response, .data
      if (data.result && typeof data.result === "object") data = data.result;
      else if (data.output && typeof data.output === "object") data = data.output;
      else if (data.response && typeof data.response === "object") data = data.response;
      else if (data.data && typeof data.data === "object") data = data.data;
    }

    // ensureMinimalShape – inject minimal required fields for narration
    if (typeof data === "object" && data !== null) {
      if ("narration" in data || "branchingChoices" in data || "choices" in data) {
        data = {
          narration: data.narration ?? "Something happens...",
          updatedGameState: data.updatedGameState ?? "",
          branchingChoices: Array.isArray(data.branchingChoices)
            ? data.branchingChoices
            : Array.isArray(data.choices)
            ? data.choices.map((c: any) => ({
                text: c.text ?? c.description ?? c.prompt ?? "Continue",
                consequenceHint: c.consequenceHint ?? c.gameEffect ?? undefined,
              }))
            : [
                { text: "Continue." },
                { text: "Observe." },
                { text: "Think." },
                { text: "Wait." },
              ],
          ...data,
        };
      }
    }

    // Apply the flow-specific normalizer (if provided)
    if (normalizer) {
      data = normalizer(data);
    }

    // Zod validation
    const validation = schema.safeParse(data);
    if (validation.success) {
      return validation.data;
    } else {
      logger.error("[processAiResponse] Zod validation failed:", validation.error.issues);
      return fallback;
    }
  } catch (e) {
    logger.error("[processAiResponse] Processing error:", e);
    return fallback;
  }
}