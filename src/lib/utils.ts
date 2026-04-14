import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ItemQuality } from "../types/inventory-types";
import { jsonrepair } from "jsonrepair";
import { z } from "zod";

/* -------------------------------------------------------
   UI UTIL
------------------------------------------------------- */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getQualityColor = (quality: ItemQuality | undefined): string => {
  switch (quality) {
    case "Poor":
      return "text-gray-500 dark:text-gray-400";
    case "Common":
      return "text-foreground";
    case "Uncommon":
      return "text-green-600 dark:text-green-400";
    case "Rare":
      return "text-blue-600 dark:text-blue-400";
    case "Epic":
      return "text-purple-600 dark:text-purple-400";
    case "Legendary":
      return "text-orange-500 dark:text-orange-400";
    default:
      return "text-muted-foreground";
  }
};

/* -------------------------------------------------------
   SECURITY / INPUT SANITIZATION
------------------------------------------------------- */
export function sanitizePlayerAction(input: string): string {
  if (!input) return "";

  let sanitized = input;

  sanitized = sanitized.replace(/```[\s\S]*?```/g, "");
  sanitized = sanitized.replace(/`[^`]*`/g, "");
  sanitized = sanitized.replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
    sanitized = sanitized.replace(pattern, "[filtered]");
  }

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

  // Remove markdown fences
  cleaned = cleaned.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, "$1");

  // Extract JSON bounds
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

  cleaned = cleaned.trim();

  // remove trailing commas
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  try {
    const repaired = jsonrepair(cleaned);
    JSON.parse(repaired);
    return repaired;
  } catch {
    try {
      const fallback = cleaned
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/,\s*([}\]])/g, "$1");

      const repaired = jsonrepair(fallback);
      JSON.parse(repaired);
      return repaired;
    } catch {
      return cleaned;
    }
  }
}

/* -------------------------------------------------------
   UNIVERSAL AI PIPELINE (FULL UPGRADE)
------------------------------------------------------- */
export async function processAiResponse<T>(
  rawText: string,
  schema: z.ZodSchema<T>,
  fallback: T,
  normalizer?: (data: any) => any
): Promise<T> {
  /* ------------------------------
     FORMAT ANALYSIS (DEBUG ONLY)
  ------------------------------ */
  function detectFormatIssues(data: any): string[] {
    const issues: string[] = [];
    if (!data) issues.push("empty");
    if (typeof data !== "object") issues.push("not_object");
    if (Array.isArray(data)) issues.push("root_array");
    if (data && typeof data === "object" && Object.keys(data).length === 0) {
      issues.push("empty_object");
    }
    return issues;
  }

  /* ------------------------------
     UNIVERSAL NORMALIZER
  ------------------------------ */
  function smartNormalize(raw: any): any {
    if (!raw) return raw;

    // stringified JSON
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    }

    // array root
    if (Array.isArray(raw)) {
      return { data: raw };
    }

    if (typeof raw !== "object") return raw;

    // numeric-key objects
    const keys = Object.keys(raw);
    if (keys.length && keys.every((k) => !isNaN(Number(k)))) {
      const arr = Object.entries(raw)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([, v]) => v);

      return { data: arr };
    }

    // common LLM wrappers
    if (raw.result) return raw.result;
    if (raw.output) return raw.output;
    if (raw.response) return raw.response;

    if (raw.data && typeof raw.data === "string") {
      try {
        return JSON.parse(raw.data);
      } catch {
        return raw;
      }
    }

    return raw;
  }

  /* ------------------------------
     MINIMAL STRUCTURE FIX
  ------------------------------ */
  function ensureMinimalShape(data: any): any {
    if (!data || typeof data !== "object") return data;

    // narration compatibility layer (safe, non-breaking)
    if ("narration" in data || "branchingChoices" in data) {
      return {
        narration: data.narration ?? data.description ?? "Something happens...",
        updatedGameState: data.updatedGameState ?? "",
        branchingChoices: Array.isArray(data.branchingChoices)
          ? data.branchingChoices.slice(0, 4)
          : [
              { text: "Continue." },
              { text: "Observe." },
              { text: "Think." },
              { text: "Wait." },
            ],
        ...data,
      };
    }

    return data;
  }

  /* ------------------------------
     RETRY INPUT STRATEGY
  ------------------------------ */
  const attempts = [
    rawText,
    `Return ONLY valid JSON.\n${rawText}`,
    `Fix this JSON and return valid JSON ONLY:\n${rawText}`,
  ];

  for (let i = 0; i < attempts.length; i++) {
    try {
      const repaired = extractJsonFromResponse(attempts[i]);
      const parsed = JSON.parse(repaired);

      let processed = smartNormalize(parsed);
      processed = ensureMinimalShape(processed);

      if (normalizer) {
        processed = normalizer(processed);
      }

      const validation = schema.safeParse(processed);

      if (validation.success) {
        return validation.data;
      }

      throw validation.error;
    } catch {
      // retry next attempt
    }
  }

  return fallback;
}