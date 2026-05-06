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

  // Single attempt: parse the raw text
  let data = tryParse(rawText);

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