(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/src_36340e7d._.js", {

"[project]/src/ai/ai-instance.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// src/ai/ai-instance.ts
__turbopack_context__.s({
    "aiClient": (()=>aiClient),
    "getClient": (()=>getClient)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/web/index.mjs [app-client] (ecmascript)");
;
// Safely access process.env
const safeProcess = typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] !== 'undefined' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] : {
    env: {}
};
// Use a dummy key if not present to prevent initialization crash. 
// Real requests will fail if a valid key isn't provided via getClient later or if this env var is invalid.
const apiKey = safeProcess.env.API_KEY || safeProcess.env.GOOGLE_GENAI_API_KEY || 'DUMMY_KEY_FOR_INIT';
const aiClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleGenAI"]({
    apiKey
});
function getClient(userApiKey) {
    if (userApiKey) {
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleGenAI"]({
            apiKey: userApiKey
        });
    }
    return aiClient;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/ai/flows/generate-character-description.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * @fileOverview An AI agent that generates a detailed character description.
 */ __turbopack_context__.s({
    "generateCharacterDescription": (()=>generateCharacterDescription)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/ai-instance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/web/index.mjs [app-client] (ecmascript)");
;
;
const responseSchema = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
    properties: {
        detailedDescription: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
        },
        inferredClass: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
        },
        inferredTraits: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].ARRAY,
            items: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
            }
        },
        inferredKnowledge: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].ARRAY,
            items: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
            }
        },
        inferredBackground: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
        }
    },
    required: [
        "detailedDescription",
        "inferredClass",
        "inferredTraits",
        "inferredKnowledge",
        "inferredBackground"
    ]
};
async function generateCharacterDescription(input) {
    let promptContext = "";
    if (input.isImmersedMode) {
        promptContext = `
**Context: IMMERSED ADVENTURE MODE**
* Universe: ${input.universeName}
* Character Concept: ${input.playerCharacterConcept}
* User Description: ${input.characterDescription}

Task:
1. Elaborate on the character within the ${input.universeName} universe.
2. Infer role/archetype (inferredClass).
3. Infer traits, knowledge/skills, and background fitting the lore.
`;
    } else {
        promptContext = `
**Context: STANDARD ADVENTURE MODE**
* User Description: ${input.characterDescription}

Task:
1. Elaborate on the description.
2. Infer Class from [Warrior, Mage, Rogue, Scholar, Hunter, Healer, Bard, Artisan, Noble, Commoner, Adventurer].
3. Infer traits, knowledge, and background.
`;
    }
    const prompt = `You are a fantasy/sci-fi story writer and character profiler.
${promptContext}

Output JSON matching the schema.
`;
    try {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])(input.userApiKey);
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        const text = response.text;
        if (!text) throw new Error("No text returned from AI");
        const output = JSON.parse(text);
        // Sanitization
        output.inferredTraits = Array.isArray(output.inferredTraits) ? output.inferredTraits : [];
        output.inferredKnowledge = Array.isArray(output.inferredKnowledge) ? output.inferredKnowledge : [];
        return output;
    } catch (error) {
        console.error("AI Character Generation Error:", error);
        return {
            detailedDescription: `AI generation failed for: "${input.characterDescription}".`,
            inferredClass: input.isImmersedMode ? "Immersed Protagonist" : "Adventurer",
            inferredTraits: [],
            inferredKnowledge: [],
            inferredBackground: "Unknown"
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/ai/flows/suggest-existing-characters.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * @fileOverview An AI agent that suggests existing character names.
 */ __turbopack_context__.s({
    "suggestExistingCharacters": (()=>suggestExistingCharacters)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/ai-instance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/web/index.mjs [app-client] (ecmascript)");
;
;
const responseSchema = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
    properties: {
        suggestedNames: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].ARRAY,
            items: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
            }
        }
    },
    required: [
        "suggestedNames"
    ]
};
async function suggestExistingCharacters(input) {
    const prompt = `Suggest 3 to 5 well-known existing characters from the universe "${input.universeName}" suitable for a player character. Return only a JSON object with 'suggestedNames' array.`;
    try {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])(input.userApiKey);
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        const text = response.text;
        if (!text) throw new Error("No text");
        return JSON.parse(text);
    } catch (e) {
        console.error("AI Suggestion Error:", e);
        return {
            suggestedNames: [
                "Hero",
                "Villain",
                "Sidekick"
            ]
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/ai/flows/suggest-original-character-concepts.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * @fileOverview An AI agent that suggests original character concepts.
 */ __turbopack_context__.s({
    "suggestOriginalCharacterConcepts": (()=>suggestOriginalCharacterConcepts)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/ai-instance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/web/index.mjs [app-client] (ecmascript)");
;
;
const responseSchema = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
    properties: {
        suggestedConcepts: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].ARRAY,
            items: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
            }
        }
    },
    required: [
        "suggestedConcepts"
    ]
};
async function suggestOriginalCharacterConcepts(input) {
    const prompt = `Suggest 3 to 5 creative ORIGINAL character concepts for the universe "${input.universeName}". Brief phrases. Return only JSON object with 'suggestedConcepts' array.`;
    try {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])(input.userApiKey);
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        const text = response.text;
        if (!text) throw new Error("No text");
        return JSON.parse(text);
    } catch (e) {
        console.error("AI Suggestion Error:", e);
        return {
            suggestedConcepts: [
                "A wanderer",
                "A local merchant",
                "A lost soldier"
            ]
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/ai/flows/narrate-adventure.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * @fileOverview An AI agent that narrates the story of a text adventure game.
 */ __turbopack_context__.s({
    "narrateAdventure": (()=>narrateAdventure)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/ai-instance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/web/index.mjs [app-client] (ecmascript)");
;
;
const responseSchema = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
    properties: {
        narration: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
        },
        updatedGameState: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
        },
        updatedStats: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
            properties: {
                strength: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER
                },
                stamina: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER
                },
                wisdom: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER
                }
            },
            nullable: true
        },
        updatedTraits: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].ARRAY,
            items: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
            },
            nullable: true
        },
        updatedKnowledge: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].ARRAY,
            items: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
            },
            nullable: true
        },
        progressedToStage: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER,
            nullable: true
        },
        healthChange: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER,
            nullable: true
        },
        staminaChange: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER,
            nullable: true
        },
        manaChange: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER,
            nullable: true
        },
        xpGained: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER,
            nullable: true
        },
        reputationChange: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
            properties: {
                faction: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                },
                change: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER
                }
            },
            nullable: true
        },
        npcRelationshipChange: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
            properties: {
                npcName: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                },
                change: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER
                }
            },
            nullable: true
        },
        suggestedClassChange: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING,
            nullable: true
        },
        gainedSkill: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
            properties: {
                name: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                },
                description: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                },
                type: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                },
                manaCost: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER
                },
                staminaCost: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER
                }
            },
            nullable: true
        },
        branchingChoices: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].ARRAY,
            items: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
                properties: {
                    text: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                    },
                    consequenceHint: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                    }
                },
                required: [
                    "text"
                ]
            }
        },
        dynamicEventTriggered: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING,
            nullable: true
        },
        isCharacterDefeated: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].BOOLEAN,
            nullable: true
        }
    },
    required: [
        "narration",
        "updatedGameState",
        "branchingChoices"
    ]
};
async function narrateAdventure(input) {
    if (input.character.class === 'admin000') {
        return {
            narration: `Developer command "${input.playerChoice}" processed.`,
            updatedGameState: input.gameState,
            branchingChoices: [
                {
                    text: "Continue."
                },
                {
                    text: "Inspect."
                },
                {
                    text: "Status."
                },
                {
                    text: "Chaos."
                }
            ]
        };
    }
    const { character, adventureSettings, turnCount } = input;
    const isCustom = adventureSettings.adventureType === "Custom";
    const isImmersed = adventureSettings.adventureType === "Immersed";
    const isRandomized = adventureSettings.adventureType === "Randomized";
    let adventureContext = "";
    if (isCustom) {
        adventureContext = `
* World: ${adventureSettings.worldType}
* Main Quest: ${adventureSettings.mainQuestline}
* Genre: ${adventureSettings.genreTheme}
* Tone: ${adventureSettings.dominantTone}
      `;
    } else if (isImmersed) {
        adventureContext = `
* Universe: ${adventureSettings.universeName}
* Character Concept: ${adventureSettings.playerCharacterConcept}
**INSTRUCTION:** Adhere strictly to universe lore.
      `;
    } else if (isRandomized) {
        adventureContext = `**INSTRUCTION:** Establish a unique setting based on character traits.`;
    }
    const prompt = `
You are a creative Game Master AI for "Endless Tales". Narrate the next segment.

**Character:**
Name: ${character.name}
Class: ${character.class}
Stats: STR ${character.stats.strength}, STA ${character.stats.stamina}, WIS ${character.stats.wisdom}
Health: ${character.currentHealth}/${character.maxHealth}
Description: ${character.aiGeneratedDescription || character.description}

**Context:**
Turn: ${turnCount}
Difficulty: ${adventureSettings.difficulty}
${adventureContext}

**Previous Narration:** ${input.previousNarration || "None"}
**Current Game State:** ${input.gameState}

**Action:** ${input.playerChoice}

**Task:**
1. Narrate the outcome.
2. Update game state (include Turn: ${turnCount + 1}).
3. Provide exactly 4 branching choices.
4. Calculate resource changes (health, stamina, mana) if applicable.
5. If character HP <= 0, set isCharacterDefeated: true.

Output JSON.
`;
    try {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])(input.userApiKey);
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        const text = response.text;
        if (!text) throw new Error("No text returned from AI");
        const output = JSON.parse(text);
        // Force correct branching choice count if AI fails
        if (!output.branchingChoices || output.branchingChoices.length !== 4) {
            output.branchingChoices = [
                {
                    text: "Look around."
                },
                {
                    text: "Think carefully."
                },
                {
                    text: "Check inventory."
                },
                {
                    text: "Wait."
                }
            ];
        }
        return output;
    } catch (error) {
        console.error("AI Narration Error:", error);
        return {
            narration: `The Narrator stumbled. (AI Error: ${error.message}). Please retry.`,
            updatedGameState: input.gameState,
            branchingChoices: [
                {
                    text: "Look around."
                },
                {
                    text: "Think carefully."
                },
                {
                    text: "Check inventory."
                },
                {
                    text: "Wait."
                }
            ]
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/ai/flows/summarize-adventure.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * @fileOverview Summarizes the adventure.
 */ __turbopack_context__.s({
    "summarizeAdventure": (()=>summarizeAdventure)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/ai-instance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/web/index.mjs [app-client] (ecmascript)");
;
;
const responseSchema = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
    properties: {
        summary: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
        }
    },
    required: [
        "summary"
    ]
};
async function summarizeAdventure(input) {
    const prompt = `Summarize the following adventure story concisely, highlighting key events and consequences:\n\n${input.story}`;
    try {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])(input.userApiKey);
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        const text = response.text;
        if (!text) throw new Error("No text");
        return JSON.parse(text);
    } catch (e) {
        console.error("AI Summary Error:", e);
        return {
            summary: "Summary generation failed."
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/ai/flows/assess-action-difficulty.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * @fileOverview An AI agent that assesses the difficulty of a player action in a text adventure game.
 */ __turbopack_context__.s({
    "assessActionDifficulty": (()=>assessActionDifficulty)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/ai-instance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/web/index.mjs [app-client] (ecmascript)");
;
;
const responseSchema = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
    properties: {
        difficulty: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING,
            enum: [
                "Trivial",
                "Easy",
                "Normal",
                "Hard",
                "Very Hard",
                "Impossible"
            ],
            description: "The assessed difficulty level."
        },
        reasoning: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING,
            description: "Explanation for the difficulty."
        },
        suggestedDice: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING,
            enum: [
                "d6",
                "d10",
                "d20",
                "d100",
                "None"
            ],
            description: "Suggested dice to roll."
        }
    },
    required: [
        "difficulty",
        "reasoning",
        "suggestedDice"
    ]
};
async function assessActionDifficulty(input) {
    if (input.characterClass === 'admin000') {
        return {
            difficulty: "Trivial",
            reasoning: "Developer Mode active. Action automatically succeeds.",
            suggestedDice: "None"
        };
    }
    const prompt = `
You are an expert Game Master AI for the text adventure "Endless Tales". Your task is to assess the difficulty of a player's intended action.

**Overall Game Difficulty:** ${input.gameDifficulty} (Adjust baseline difficulty: Harder settings make actions generally tougher).
**Current Turn:** ${input.turnCount}

**Factors to Consider:**
1. **Player Action:** ${input.playerAction}
2. **Character Capabilities:** ${input.characterCapabilities}
3. **Current Situation:** ${input.currentSituation}
4. **Game State Summary:** ${input.gameStateSummary}
5. **Plausibility:** Is the action physically possible? "Fly to the moon" or "become king instantly" are Impossible without specific justification.

**Assessment Task:**
Determine the difficulty: Trivial, Easy, Normal, Hard, Very Hard, Impossible.
Suggest a dice type: d6, d10, d20, d100, None.

Output JSON only.
`;
    try {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])(input.userApiKey);
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        const text = response.text;
        if (!text) throw new Error("No text returned from AI");
        return JSON.parse(text);
    } catch (error) {
        console.error("AI Error in assessActionDifficulty:", error);
        // Fallback
        let fallbackDifficulty = "Normal";
        let fallbackDice = "d10";
        switch(input.gameDifficulty?.toLowerCase()){
            case 'easy':
                fallbackDifficulty = "Easy";
                fallbackDice = "d6";
                break;
            case 'hard':
            case 'nightmare':
                fallbackDifficulty = "Hard";
                fallbackDice = "d20";
                break;
            default:
                fallbackDifficulty = "Normal";
                fallbackDice = "d10";
        }
        return {
            difficulty: fallbackDifficulty,
            reasoning: "AI assessment failed, assuming difficulty based on game settings.",
            suggestedDice: fallbackDice
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/ai/flows/generate-skill-tree.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * @fileOverview An AI agent that generates a skill tree.
 */ __turbopack_context__.s({
    "generateSkillTree": (()=>generateSkillTree)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/ai-instance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/web/index.mjs [app-client] (ecmascript)");
;
;
const responseSchema = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
    properties: {
        className: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
        },
        stages: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].ARRAY,
            items: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
                properties: {
                    stage: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER
                    },
                    stageName: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                    },
                    skills: {
                        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].ARRAY,
                        items: {
                            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
                            properties: {
                                name: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                                },
                                description: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                                },
                                manaCost: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER,
                                    nullable: true
                                },
                                staminaCost: {
                                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER,
                                    nullable: true
                                }
                            },
                            required: [
                                "name",
                                "description"
                            ]
                        }
                    }
                },
                required: [
                    "stage",
                    "stageName",
                    "skills"
                ]
            }
        }
    },
    required: [
        "className",
        "stages"
    ]
};
const createFallbackSkillTree = (className)=>({
        className: className,
        stages: [
            {
                stage: 0,
                stageName: "Potential",
                skills: []
            },
            {
                stage: 1,
                stageName: "Novice",
                skills: [
                    {
                        name: "Basic Training",
                        description: "Improves readiness."
                    }
                ]
            },
            {
                stage: 2,
                stageName: "Apprentice",
                skills: [
                    {
                        name: "Focused Study",
                        description: "Deeper understanding."
                    }
                ]
            },
            {
                stage: 3,
                stageName: "Adept",
                skills: [
                    {
                        name: "Power Surge",
                        description: "Boosts effectiveness."
                    }
                ]
            },
            {
                stage: 4,
                stageName: "Master",
                skills: [
                    {
                        name: "Ultimate Focus",
                        description: "True potential."
                    }
                ]
            }
        ]
    });
async function generateSkillTree(input) {
    const prompt = `
You are a game designer. Generate a 5-stage skill tree (stages 0-4) for the class: ${input.characterClass}.

Requirements:
1. 5 stages (0, 1, 2, 3, 4).
2. Stage 0 named "Potential" or similar, with EMPTY skills array.
3. Stages 1-4 have thematic names and 1-3 skills each.
4. Skills need name, description, and optional manaCost/staminaCost.

Output JSON.
`;
    try {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])(input.userApiKey);
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        const text = response.text;
        if (!text) throw new Error("No text returned from AI");
        const output = JSON.parse(text);
        // Basic validation
        if (!output.stages || output.stages.length !== 5) throw new Error("Invalid stage count");
        return output;
    } catch (error) {
        console.error("AI Skill Tree Error:", error);
        return createFallbackSkillTree(input.characterClass);
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/ai/flows/attempt-crafting.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
/**
 * @fileOverview An AI agent that determines the outcome of a crafting attempt.
 */ __turbopack_context__.s({
    "attemptCrafting": (()=>attemptCrafting)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ai/ai-instance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/genai/dist/web/index.mjs [app-client] (ecmascript)");
;
;
const responseSchema = {
    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
    properties: {
        success: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].BOOLEAN
        },
        message: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
        },
        craftedItem: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].OBJECT,
            properties: {
                name: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                },
                description: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                },
                quality: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING,
                    enum: [
                        "Poor",
                        "Common",
                        "Uncommon",
                        "Rare",
                        "Epic",
                        "Legendary"
                    ]
                },
                weight: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER
                },
                durability: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].NUMBER
                },
                magicalEffect: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
                }
            },
            nullable: true
        },
        consumedItems: {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].ARRAY,
            items: {
                type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$genai$2f$dist$2f$web$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Type"].STRING
            }
        }
    },
    required: [
        "success",
        "message",
        "consumedItems"
    ]
};
async function attemptCrafting(input) {
    const prompt = `
You are a Master Crafter AI for the text adventure "Endless Tales". Evaluate a player's crafting attempt.

**Character Capabilities:**
* Knowledge: ${input.characterKnowledge.length ? input.characterKnowledge.join(', ') : 'None'}
* Skills: ${input.characterSkills.length ? input.characterSkills.join(', ') : 'None'}

**Inventory:**
${input.inventoryItems.length ? input.inventoryItems.join(', ') : 'Empty'}

**Crafting Attempt:**
* Goal: ${input.desiredItem}
* Ingredients Used: ${input.usedIngredients.length ? input.usedIngredients.join(', ') : 'None specified'}

**Evaluation Task:**
1. **Plausibility:** Is crafting ${input.desiredItem} feasible?
2. **Knowledge/Skills:** Does character have required know-how?
3. **Ingredients:** Are ingredients logical and available?

**Outcome:**
* **Success:** Set success=true. Generate item details. List used ingredients in consumedItems.
* **Failure/Impossible:** Set success=false. Provide message. List ingredients consumed (if failed attempt wasted them).

Output JSON.
`;
    try {
        const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ai$2f$ai$2d$instance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getClient"])(input.userApiKey);
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        const text = response.text;
        if (!text) throw new Error("No text returned from AI");
        return JSON.parse(text);
    } catch (error) {
        console.error("AI Crafting Error:", error);
        return {
            success: false,
            message: "The crafting attempt failed due to an external force (AI Error).",
            craftedItem: null,
            consumedItems: []
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/hooks/use-mobile.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useIsMobile": (()=>useIsMobile)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
    _s();
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useIsMobile.useEffect": ()=>{
            const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
            const onChange = {
                "useIsMobile.useEffect.onChange": ()=>{
                    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
                }
            }["useIsMobile.useEffect.onChange"];
            mql.addEventListener("change", onChange);
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
            return ({
                "useIsMobile.useEffect": ()=>mql.removeEventListener("change", onChange)
            })["useIsMobile.useEffect"];
        }
    }["useIsMobile.useEffect"], []);
    return !!isMobile;
}
_s(useIsMobile, "D6B2cPXNCaIbeOx+abFr1uxLRM0=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/src/app/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>Home)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/GameContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$MainMenu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/screens/MainMenu.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$CharacterCreation$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/screens/CharacterCreation.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$AdventureSetup$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/screens/AdventureSetup.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$Gameplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/screens/Gameplay.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$AdventureSummary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/screens/AdventureSummary.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$SavedAdventuresList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/screens/SavedAdventuresList.tsx [app-client] (ecmascript)");
// import { CoopLobby } from "../components/screens/CoopLobby"; // Disabled
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
function Home() {
    _s();
    const { state } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            console.log("Current Game Status in page.tsx:", state.status);
        }
    }["Home.useEffect"], [
        state.status
    ]);
    const renderScreen = ()=>{
        console.log("Rendering screen for status:", state.status);
        switch(state.status){
            case "MainMenu":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$MainMenu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MainMenu"], {}, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 27,
                    columnNumber: 16
                }, this);
            case "CharacterCreation":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$CharacterCreation$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CharacterCreation"], {}, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 29,
                    columnNumber: 16
                }, this);
            case "AdventureSetup":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$AdventureSetup$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdventureSetup"], {}, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 31,
                    columnNumber: 16
                }, this);
            case "Gameplay":
                return state.character ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$Gameplay$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Gameplay"], {}, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 33,
                    columnNumber: 34
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center min-h-screen",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                            className: "h-8 w-8 animate-spin mr-2"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 33,
                            columnNumber: 112
                        }, this),
                        " Loading Character..."
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 33,
                    columnNumber: 49
                }, this);
            // Co-op modes temporarily disabled
            case "CoopGameplay":
            case "CoopLobby":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$MainMenu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MainMenu"], {}, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 38,
                    columnNumber: 17
                }, this);
            case "AdventureSummary":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$AdventureSummary$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdventureSummary"], {}, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 41,
                    columnNumber: 16
                }, this);
            case "ViewSavedAdventures":
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$SavedAdventuresList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SavedAdventuresList"], {}, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 43,
                    columnNumber: 16
                }, this);
            default:
                console.warn("Unknown game status in page.tsx:", state.status, "Defaulting to MainMenu.");
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$screens$2f$MainMenu$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MainMenu"], {}, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 46,
                    columnNumber: 16
                }, this);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen",
        children: renderScreen()
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 50,
        columnNumber: 10
    }, this);
}
_s(Home, "riw5Aoty5RXzsYEOPxUxRQHKUJI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$GameContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGame"]
    ];
});
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=src_36340e7d._.js.map