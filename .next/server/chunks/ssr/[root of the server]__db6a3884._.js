module.exports = {

"[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/src/lib/gameUtils.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/lib/gameUtils.ts
__turbopack_context__.s({
    "CLASS_STARTER_SKILLS": (()=>CLASS_STARTER_SKILLS),
    "COMMON_STARTER_SKILL": (()=>COMMON_STARTER_SKILL),
    "calculateMaxActionStamina": (()=>calculateMaxActionStamina),
    "calculateMaxHealth": (()=>calculateMaxHealth),
    "calculateMaxMana": (()=>calculateMaxMana),
    "calculateXpToNextLevel": (()=>calculateXpToNextLevel),
    "generateAdventureId": (()=>generateAdventureId),
    "getStarterSkillsForClass": (()=>getStarterSkillsForClass)
});
const calculateMaxHealth = (stats)=>{
    // Example: Base HP + Stamina stat * multiplier
    return Math.max(10, 20 + stats.stamina * 10);
};
const calculateMaxActionStamina = (stats)=>{
    // Example: Base Action Stamina + Strength stat * multiplier
    return Math.max(10, 30 + stats.strength * 5);
};
const calculateMaxMana = (stats, knowledge)=>{
    const baseMana = 10;
    // Wisdom is now the primary stat for mana
    const wisdomBonus = stats.wisdom * 10;
    const knowledgeBonus = knowledge.some((k)=>[
            "Magic",
            "Arcana",
            "Healing",
            "Mysticism",
            "Lore"
        ].includes(k)) ? 20 : 0;
    return baseMana + wisdomBonus + knowledgeBonus;
};
const COMMON_STARTER_SKILL = {
    name: "Observe",
    description: "Carefully examine your surroundings.",
    type: 'Starter'
};
const CLASS_STARTER_SKILLS = {
    "Warrior": [
        {
            name: "Power Strike",
            description: "A forceful attack consuming action stamina.",
            type: 'Starter',
            staminaCost: 10
        },
        {
            name: "Brace",
            description: "Prepare for an incoming blow, temporarily increasing resilience.",
            type: 'Starter',
            staminaCost: 5
        }
    ],
    "Mage": [
        {
            name: "Arcane Bolt",
            description: "Launch a bolt of magical energy.",
            type: 'Starter',
            manaCost: 10
        },
        {
            name: "Meditate",
            description: "Focus to slowly recover mana.",
            type: 'Starter'
        }
    ],
    "Rogue": [
        {
            name: "Swift Strike",
            description: "A quick attack that costs less action stamina.",
            type: 'Starter',
            staminaCost: 5
        },
        {
            name: "Stealth",
            description: "Attempt to become less conspicuous.",
            type: 'Starter',
            staminaCost: 5
        }
    ],
    "Scholar": [
        {
            name: "Insightful Analysis",
            description: "Use wisdom to uncover hidden details or weaknesses.",
            type: 'Starter',
            manaCost: 5
        },
        {
            name: "Recall Lore",
            description: "Tap into your knowledge on a subject.",
            type: 'Starter'
        }
    ],
    "Adventurer": [
        {
            name: "Basic Strike",
            description: "A simple physical attack.",
            type: 'Starter',
            staminaCost: 5
        },
        {
            name: "First Aid",
            description: "Attempt to patch up minor wounds.",
            type: 'Starter',
            staminaCost: 10
        }
    ],
    "admin000": [
        {
            name: "Dev Power",
            description: "Access developer abilities.",
            type: 'Starter'
        }
    ]
};
function getStarterSkillsForClass(className) {
    const classSkills = CLASS_STARTER_SKILLS[className] || CLASS_STARTER_SKILLS["Adventurer"];
    const skills = [
        COMMON_STARTER_SKILL,
        ...classSkills
    ];
    return Array.from(new Map(skills.map((skill)=>[
            skill.name,
            skill
        ])).values());
}
const calculateXpToNextLevel = (currentLevel)=>{
    const baseXP = 100;
    return Math.floor(baseXP + (currentLevel - 1) * 50 + Math.pow(currentLevel - 1, 2.2) * 10);
};
function generateAdventureId() {
    return `adv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
}}),
"[project]/src/lib/constants.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/lib/constants.ts
__turbopack_context__.s({
    "MAX_STAT_VALUE": (()=>MAX_STAT_VALUE),
    "MIN_STAT_VALUE": (()=>MIN_STAT_VALUE),
    "SAVED_ADVENTURES_KEY": (()=>SAVED_ADVENTURES_KEY),
    "THEME_ID_KEY": (()=>THEME_ID_KEY),
    "THEME_MODE_KEY": (()=>THEME_MODE_KEY),
    "TOTAL_STAT_POINTS": (()=>TOTAL_STAT_POINTS),
    "USER_API_KEY_KEY": (()=>USER_API_KEY_KEY),
    "VALID_ADVENTURE_DIFFICULTY_LEVELS": (()=>VALID_ADVENTURE_DIFFICULTY_LEVELS),
    "VALID_ASSESSMENT_DIFFICULTY_LEVELS": (()=>VALID_ASSESSMENT_DIFFICULTY_LEVELS)
});
const TOTAL_STAT_POINTS = 15;
const MIN_STAT_VALUE = 1;
const MAX_STAT_VALUE = 10;
const VALID_ADVENTURE_DIFFICULTY_LEVELS = [
    "Easy",
    "Normal",
    "Hard",
    "Nightmare"
];
const VALID_ASSESSMENT_DIFFICULTY_LEVELS = [
    "Trivial",
    "Easy",
    "Normal",
    "Hard",
    "Very Hard",
    "Impossible"
];
const SAVED_ADVENTURES_KEY = "endlessTalesSavedAdventures";
const THEME_ID_KEY = "colorTheme";
const THEME_MODE_KEY = "themeMode";
const USER_API_KEY_KEY = "userGoogleAiApiKey";
}}),
"[project]/src/context/game-initial-state.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/context/game-initial-state.ts
__turbopack_context__.s({
    "initialAdventureSettings": (()=>initialAdventureSettings),
    "initialCharacterState": (()=>initialCharacterState),
    "initialCharacterStats": (()=>initialCharacterStats),
    "initialInventory": (()=>initialInventory),
    "initialState": (()=>initialState)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gameUtils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-ssr] (ecmascript)");
;
;
const pointsPerStat = Math.floor(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOTAL_STAT_POINTS"] / 3);
const remainderPoints = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["TOTAL_STAT_POINTS"] % 3;
const initialCharacterStats = {
    strength: pointsPerStat + (remainderPoints > 0 ? 1 : 0),
    stamina: pointsPerStat + (remainderPoints > 1 ? 1 : 0),
    wisdom: pointsPerStat
};
const initialCharacterState = {
    name: "",
    description: "",
    class: "Adventurer",
    traits: [],
    knowledge: [],
    background: "",
    stats: {
        ...initialCharacterStats
    },
    aiGeneratedDescription: undefined,
    maxHealth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(initialCharacterStats),
    currentHealth: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(initialCharacterStats),
    maxStamina: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(initialCharacterStats),
    currentStamina: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(initialCharacterStats),
    maxMana: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxMana"])(initialCharacterStats, []),
    currentMana: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxMana"])(initialCharacterStats, []),
    level: 1,
    xp: 0,
    xpToNextLevel: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateXpToNextLevel"])(1),
    reputation: {},
    npcRelationships: {},
    skillTree: null,
    skillTreeStage: 0,
    learnedSkills: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStarterSkillsForClass"])("Adventurer")
};
const initialInventory = [
    {
        name: "Basic Clothes",
        description: "Simple, slightly worn clothes.",
        quality: "Poor",
        weight: 1
    },
    {
        name: "Crusty Bread",
        description: "A piece of somewhat stale bread.",
        quality: "Poor",
        weight: 0.5
    }
];
const initialAdventureSettings = {
    adventureType: null,
    permanentDeath: true,
    difficulty: "Normal",
    worldType: "",
    mainQuestline: "",
    genreTheme: "",
    magicSystem: "",
    techLevel: "",
    dominantTone: "",
    startingSituation: "",
    combatFrequency: "Medium",
    puzzleFrequency: "Medium",
    socialFocus: "Medium",
    universeName: "",
    playerCharacterConcept: "",
    characterOriginType: 'original'
};
const initialState = {
    status: "MainMenu",
    character: null,
    // Multiplayer specific state
    sessionId: null,
    players: [],
    currentPlayerUid: null,
    isHost: false,
    adventureSettings: {
        ...initialAdventureSettings
    },
    currentNarration: null,
    storyLog: [],
    adventureSummary: null,
    currentGameStateString: "The adventure is about to begin...",
    inventory: [],
    savedAdventures: [],
    currentAdventureId: null,
    isGeneratingSkillTree: false,
    turnCount: 0,
    selectedThemeId: 'cardboard',
    isDarkMode: false,
    userGoogleAiApiKey: null
};
}}),
"[project]/src/context/reducers/characterReducer.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/context/reducers/characterReducer.ts
__turbopack_context__.s({
    "characterReducer": (()=>characterReducer)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/game-initial-state.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gameUtils.ts [app-ssr] (ecmascript)");
;
;
function characterReducer(state, action) {
    switch(action.type){
        case "CREATE_CHARACTER":
            {
                const baseStats = action.payload.stats ? {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialCharacterStats"],
                    ...action.payload.stats
                } : {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialCharacterStats"]
                };
                const baseKnowledge = action.payload.knowledge ?? [];
                const maxHealth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(baseStats);
                const maxActionStamina = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(baseStats);
                const maxMana = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxMana"])(baseStats, baseKnowledge);
                const characterClass = action.payload.class ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialCharacterState"].class;
                const starterSkills = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStarterSkillsForClass"])(characterClass);
                const initialLevel = 1;
                const initialXpToNext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateXpToNextLevel"])(initialLevel);
                const newCharacter = {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialCharacterState"],
                    name: action.payload.name ?? "",
                    description: action.payload.description ?? "",
                    class: characterClass,
                    traits: action.payload.traits ?? [],
                    knowledge: baseKnowledge,
                    background: action.payload.background ?? "",
                    stats: baseStats,
                    aiGeneratedDescription: action.payload.aiGeneratedDescription ?? undefined,
                    maxHealth: maxHealth,
                    currentHealth: maxHealth,
                    maxStamina: maxActionStamina,
                    currentStamina: maxActionStamina,
                    maxMana: maxMana,
                    currentMana: maxMana,
                    level: initialLevel,
                    xp: 0,
                    xpToNextLevel: initialXpToNext,
                    reputation: {},
                    npcRelationships: {},
                    skillTree: null,
                    skillTreeStage: 0,
                    learnedSkills: starterSkills
                };
                return newCharacter;
            }
        case "UPDATE_CHARACTER":
            {
                if (!state) return null;
                const updatedStats = action.payload.stats ? {
                    ...state.stats,
                    ...action.payload.stats
                } : state.stats;
                const updatedKnowledge = action.payload.knowledge ?? state.knowledge;
                const newMaxHealth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(updatedStats);
                const newMaxActionStamina = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(updatedStats);
                const newMaxMana = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxMana"])(updatedStats, updatedKnowledge);
                return {
                    ...state,
                    ...action.payload,
                    stats: updatedStats,
                    knowledge: updatedKnowledge,
                    maxHealth: newMaxHealth,
                    currentHealth: Math.min(action.payload.currentHealth ?? state.currentHealth, newMaxHealth),
                    maxStamina: newMaxActionStamina,
                    currentStamina: Math.min(action.payload.currentStamina ?? state.currentStamina, newMaxActionStamina),
                    maxMana: newMaxMana,
                    currentMana: Math.min(action.payload.currentMana ?? state.currentMana, newMaxMana),
                    traits: action.payload.traits ?? state.traits,
                    skillTree: action.payload.skillTree !== undefined ? action.payload.skillTree : state.skillTree,
                    skillTreeStage: action.payload.skillTreeStage !== undefined ? action.payload.skillTreeStage : state.skillTreeStage,
                    aiGeneratedDescription: action.payload.aiGeneratedDescription !== undefined ? action.payload.aiGeneratedDescription : state.aiGeneratedDescription,
                    learnedSkills: action.payload.learnedSkills ?? state.learnedSkills,
                    level: action.payload.level ?? state.level,
                    xp: action.payload.xp ?? state.xp,
                    xpToNextLevel: action.payload.xpToNextLevel ?? state.xpToNextLevel,
                    reputation: action.payload.reputation ?? state.reputation,
                    npcRelationships: action.payload.npcRelationships ?? state.npcRelationships
                };
            }
        case "SET_AI_DESCRIPTION":
            if (!state) return null;
            return {
                ...state,
                aiGeneratedDescription: action.payload
            };
        case "GRANT_XP":
            {
                if (!state) return null;
                const newXp = state.xp + action.payload;
                return {
                    ...state,
                    xp: newXp
                };
            }
        case "LEVEL_UP":
            {
                if (!state) return null;
                if (action.payload.newLevel <= state.level) return state;
                const remainingXp = Math.max(0, state.xp - state.xpToNextLevel);
                // Full heal on level up
                const newMaxHealth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(state.stats);
                const newMaxActionStamina = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(state.stats);
                const newMaxMana = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxMana"])(state.stats, state.knowledge);
                return {
                    ...state,
                    level: action.payload.newLevel,
                    xp: remainingXp,
                    xpToNextLevel: action.payload.newXpToNextLevel,
                    maxHealth: newMaxHealth,
                    currentHealth: newMaxHealth,
                    maxStamina: newMaxActionStamina,
                    currentStamina: newMaxActionStamina,
                    maxMana: newMaxMana,
                    currentMana: newMaxMana
                };
            }
        case "UPDATE_REPUTATION":
            {
                if (!state) return null;
                const { faction, change } = action.payload;
                const currentScore = state.reputation[faction] ?? 0;
                const newScore = Math.max(-100, Math.min(100, currentScore + change));
                return {
                    ...state,
                    reputation: {
                        ...state.reputation,
                        [faction]: newScore
                    }
                };
            }
        case "UPDATE_NPC_RELATIONSHIP":
            {
                if (!state) return null;
                const { npcName, change } = action.payload;
                const currentScore = state.npcRelationships[npcName] ?? 0;
                const newScore = Math.max(-100, Math.min(100, currentScore + change));
                return {
                    ...state,
                    npcRelationships: {
                        ...state.npcRelationships,
                        [npcName]: newScore
                    }
                };
            }
        case "SET_SKILL_TREE":
            {
                if (!state || state.class !== action.payload.class) return state;
                const stages = action.payload.skillTree.stages || [];
                if (stages.length !== 5) {
                    console.error(`Reducer: Received skill tree with ${stages.length} stages, expected 5. Discarding.`);
                    return state;
                }
                const validatedStages = Array.from({
                    length: 5
                }, (_, i)=>{
                    const foundStage = stages.find((s)=>s.stage === i);
                    return {
                        stage: i,
                        stageName: foundStage?.stageName || (i === 0 ? "Potential" : `Stage ${i}`),
                        skills: (Array.isArray(foundStage?.skills) ? foundStage.skills : []).map((skill)=>({
                                name: skill.name || "Unnamed Skill",
                                description: skill.description || "No description.",
                                type: skill.type || 'Learned',
                                manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                                staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined
                            }))
                    };
                });
                const validatedSkillTree = {
                    className: action.payload.class,
                    stages: validatedStages
                };
                return {
                    ...state,
                    skillTree: validatedSkillTree
                };
            }
        case "CHANGE_CLASS_AND_RESET_SKILLS":
            {
                if (!state) return null;
                const stages = action.payload.newSkillTree.stages || [];
                if (stages.length !== 5) {
                    console.error(`Reducer: Received new skill tree with ${stages.length} stages, expected 5. Aborting class change.`);
                    return state;
                }
                const validatedStages = Array.from({
                    length: 5
                }, (_, i)=>{
                    const foundStage = stages.find((s)=>s.stage === i);
                    return {
                        stage: i,
                        stageName: foundStage?.stageName || (i === 0 ? "Potential" : `Stage ${i}`),
                        skills: (Array.isArray(foundStage?.skills) ? foundStage.skills : []).map((skill)=>({
                                name: skill.name || "Unnamed Skill",
                                description: skill.description || "No description.",
                                type: skill.type || 'Learned',
                                manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                                staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined
                            }))
                    };
                });
                const newValidatedSkillTree = {
                    className: action.payload.newClass,
                    stages: validatedStages
                };
                const starterSkills = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStarterSkillsForClass"])(action.payload.newClass);
                return {
                    ...state,
                    class: action.payload.newClass,
                    skillTree: newValidatedSkillTree,
                    skillTreeStage: 0,
                    learnedSkills: starterSkills
                };
            }
        case "PROGRESS_SKILL_STAGE":
            {
                if (!state || !state.skillTree) return state;
                const newStage = Math.max(0, Math.min(4, action.payload));
                if (newStage > state.skillTreeStage) return {
                    ...state,
                    skillTreeStage: newStage
                };
                return state;
            }
        case "UPDATE_NARRATION":
            {
                if (!state) return null;
                const { updatedStats, updatedTraits, updatedKnowledge, healthChange, staminaChange, manaChange, gainedSkill, xpGained, reputationChange, npcRelationshipChange, progressedToStage } = action.payload;
                let newState = {
                    ...state
                };
                if (updatedStats) newState.stats = {
                    ...newState.stats,
                    ...updatedStats
                };
                if (updatedTraits) newState.traits = updatedTraits;
                if (updatedKnowledge) newState.knowledge = updatedKnowledge;
                // Recalculate max values if stats or knowledge changed
                if (updatedStats || updatedKnowledge) {
                    newState.maxHealth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(newState.stats);
                    newState.maxStamina = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(newState.stats);
                    newState.maxMana = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxMana"])(newState.stats, newState.knowledge);
                }
                if (healthChange) newState.currentHealth = Math.max(0, Math.min(newState.maxHealth, newState.currentHealth + healthChange));
                if (staminaChange) newState.currentStamina = Math.max(0, Math.min(newState.maxStamina, newState.currentStamina + staminaChange));
                if (manaChange) newState.currentMana = Math.max(0, Math.min(newState.maxMana, newState.currentMana + manaChange));
                if (gainedSkill && !newState.learnedSkills.some((s)=>s.name === gainedSkill.name)) {
                    newState.learnedSkills = [
                        ...newState.learnedSkills,
                        {
                            ...gainedSkill,
                            type: 'Learned'
                        }
                    ];
                }
                if (xpGained) newState.xp += xpGained;
                if (reputationChange) {
                    const { faction, change } = reputationChange;
                    const currentScore = newState.reputation[faction] ?? 0;
                    newState.reputation[faction] = Math.max(-100, Math.min(100, currentScore + change));
                }
                if (npcRelationshipChange) {
                    const { npcName, change } = npcRelationshipChange;
                    const currentScore = newState.npcRelationships[npcName] ?? 0;
                    newState.npcRelationships[npcName] = Math.max(-100, Math.min(100, currentScore + change));
                }
                if (progressedToStage !== undefined && progressedToStage > newState.skillTreeStage) {
                    newState.skillTreeStage = progressedToStage;
                }
                return newState;
            }
        case "RESPAWN_CHARACTER":
            {
                if (!state) return null;
                // TODO: Implement more nuanced respawn penalties (e.g., XP loss) if desired.
                return {
                    ...state,
                    currentHealth: state.maxHealth,
                    currentStamina: state.maxStamina,
                    currentMana: state.maxMana
                };
            }
        case "RESET_GAME":
            return null;
        case "LOAD_ADVENTURE":
            const savedChar = action.payload.character;
            const validatedStats = savedChar?.stats ? {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialCharacterStats"],
                ...savedChar.stats
            } : {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialCharacterStats"]
            };
            const validatedKnowledge = Array.isArray(savedChar?.knowledge) ? savedChar.knowledge : [];
            const loadedCharClass = savedChar?.class || "Adventurer";
            return {
                ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialCharacterState"],
                ...savedChar || {},
                name: savedChar?.name || "Recovered Adventurer",
                class: loadedCharClass,
                knowledge: validatedKnowledge,
                stats: validatedStats,
                maxHealth: typeof savedChar?.maxHealth === 'number' ? savedChar.maxHealth : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(validatedStats),
                currentHealth: typeof savedChar?.currentHealth === 'number' ? savedChar.currentHealth : savedChar?.maxHealth ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(validatedStats),
                maxStamina: typeof savedChar?.maxStamina === 'number' ? savedChar.maxStamina : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(validatedStats),
                currentStamina: typeof savedChar?.currentStamina === 'number' ? savedChar.currentStamina : savedChar?.maxStamina ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(validatedStats),
                maxMana: typeof savedChar?.maxMana === 'number' ? savedChar.maxMana : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxMana"])(validatedStats, validatedKnowledge),
                currentMana: typeof savedChar?.currentMana === 'number' ? savedChar.currentMana : savedChar?.maxMana ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxMana"])(validatedStats, validatedKnowledge),
                level: typeof savedChar?.level === 'number' ? savedChar.level : 1,
                xpToNextLevel: typeof savedChar?.xpToNextLevel === 'number' ? savedChar.xpToNextLevel : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateXpToNextLevel"])(savedChar?.level ?? 1),
                skillTree: savedChar?.skillTree ? {
                    className: savedChar.skillTree.className || loadedCharClass,
                    stages: (Array.isArray(savedChar.skillTree.stages) ? savedChar.skillTree.stages : []).map((stage, index)=>({
                            stage: typeof stage.stage === 'number' ? stage.stage : index,
                            stageName: stage.stageName || (index === 0 ? "Potential" : `Stage ${stage.stage ?? index}`),
                            skills: (Array.isArray(stage.skills) ? stage.skills : []).map((skill)=>({
                                    name: skill.name || "Unknown Skill",
                                    description: skill.description || "",
                                    type: skill.type || 'Learned',
                                    manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                                    staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined
                                }))
                        })).slice(0, 5)
                } : null,
                learnedSkills: Array.isArray(savedChar?.learnedSkills) && savedChar.learnedSkills.length > 0 ? savedChar.learnedSkills.map((skill)=>({
                        name: skill.name || "Unknown Skill",
                        description: skill.description || "",
                        type: skill.type || 'Learned',
                        manaCost: typeof skill.manaCost === 'number' ? skill.manaCost : undefined,
                        staminaCost: typeof skill.staminaCost === 'number' ? skill.staminaCost : undefined
                    })) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStarterSkillsForClass"])(loadedCharClass)
            };
        default:
            return state;
    }
}
}}),
"[project]/src/context/reducers/inventoryReducer.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/context/reducers/inventoryReducer.ts
__turbopack_context__.s({
    "inventoryReducer": (()=>inventoryReducer)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/game-initial-state.ts [app-ssr] (ecmascript)");
;
function inventoryReducer(state, action) {
    switch(action.type){
        case "ADD_ITEM":
            {
                const newItem = {
                    name: action.payload.name || "Mysterious Item",
                    description: action.payload.description || "An item of unclear origin.",
                    quality: action.payload.quality || "Common",
                    weight: typeof action.payload.weight === 'number' ? action.payload.weight : 1,
                    durability: typeof action.payload.durability === 'number' ? action.payload.durability : undefined,
                    magicalEffect: action.payload.magicalEffect || undefined
                };
                console.log("Adding validated item:", newItem.name);
                return [
                    ...state,
                    newItem
                ];
            }
        case "REMOVE_ITEM":
            {
                const { itemName, quantity = 1 } = action.payload;
                console.log(`Attempting to remove ${quantity} of item:`, itemName);
                const updatedInventory = [
                    ...state
                ];
                let removedCount = 0;
                for(let i = updatedInventory.length - 1; i >= 0 && removedCount < quantity; i--){
                    if (updatedInventory[i].name === itemName) {
                        updatedInventory.splice(i, 1);
                        removedCount++;
                    }
                }
                if (removedCount < quantity) {
                    console.warn(`Tried to remove ${quantity} of ${itemName}, but only found ${removedCount}.`);
                }
                return updatedInventory;
            }
        case "UPDATE_ITEM":
            {
                const { itemName, updates } = action.payload;
                console.log("Updating item:", itemName, "with", updates);
                return state.map((item)=>item.name === itemName ? {
                        ...item,
                        ...updates
                    } : item);
            }
        case "UPDATE_INVENTORY":
            {
                const validatedNewInventory = action.payload.map((item)=>({
                        name: item.name || "Unknown Item",
                        description: item.description || "An item of unclear origin.",
                        weight: typeof item.weight === 'number' ? item.weight : 1,
                        quality: item.quality || "Common",
                        durability: typeof item.durability === 'number' ? item.durability : undefined,
                        magicalEffect: item.magicalEffect || undefined
                    }));
                console.log("Replacing inventory with new list:", validatedNewInventory.map((i)=>i.name));
                return validatedNewInventory;
            }
        case "UPDATE_CRAFTING_RESULT":
            {
                const { consumedItems, craftedItem } = action.payload;
                let updatedInventory = [
                    ...state
                ];
                // Consume items
                consumedItems.forEach((itemName)=>{
                    const indexToRemove = updatedInventory.findIndex((item)=>item.name === itemName);
                    if (indexToRemove > -1) {
                        updatedInventory.splice(indexToRemove, 1);
                    } else {
                        console.warn(`Attempted to consume non-existent item: ${itemName}`);
                    }
                });
                // Add crafted item if successful
                if (craftedItem) {
                    updatedInventory.push(craftedItem);
                }
                return updatedInventory;
            }
        case "START_GAMEPLAY":
            // Only initialize if not loading a save (reducer handles loading separately)
            // Check if currentAdventureId exists in the *previous* state or passed somehow
            // If not resuming, return initialInventory
            // This logic might need adjustment depending on how START_GAMEPLAY interacts with LOAD_ADVENTURE
            // For now, assume START_GAMEPLAY implies a new game unless LOAD_ADVENTURE happened before.
            // A better approach might be to handle inventory init within the CREATE_CHARACTER or LOAD_ADVENTURE reducers.
            // Let's return initialInventory for now, LOAD_ADVENTURE will overwrite it if needed.
            return [
                ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialInventory"]
            ]; // Return a copy
        case "RESET_GAME":
            return []; // Clear inventory on reset
        case "LOAD_ADVENTURE":
            // Validate inventory data from loaded adventure
            return (Array.isArray(action.payload.inventory) ? action.payload.inventory : []).map((item)=>({
                    name: item.name || "Unknown Item",
                    description: item.description || "An item of unclear origin.",
                    weight: typeof item.weight === 'number' ? item.weight : 1,
                    quality: item.quality || "Common",
                    durability: typeof item.durability === 'number' ? item.durability : undefined,
                    magicalEffect: item.magicalEffect || undefined
                }));
        default:
            return state;
    }
}
}}),
"[project]/src/context/reducers/settingsReducer.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/context/reducers/settingsReducer.ts
__turbopack_context__.s({
    "settingsReducer": (()=>settingsReducer)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/game-initial-state.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-ssr] (ecmascript)");
;
;
function settingsReducer(state, action) {
    switch(action.type){
        case "SET_ADVENTURE_SETTINGS":
            {
                const incomingPayload = action.payload;
                const currentAdventureTypeInState = state.adventureSettings.adventureType;
                // Prioritize adventureType from payload if available, otherwise keep existing.
                // This is crucial because AdventureSetup dispatches this with the type already determined.
                const finalAdventureType = incomingPayload.adventureType ?? currentAdventureTypeInState;
                if (!finalAdventureType) {
                    console.error("SettingsReducer: SET_ADVENTURE_SETTINGS - finalAdventureType is unexpectedly null/undefined. This could lead to issues.", "Incoming Payload:", incomingPayload, "Current state type:", currentAdventureTypeInState);
                }
                const validatedDifficulty = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VALID_ADVENTURE_DIFFICULTY_LEVELS"].includes(incomingPayload.difficulty) ? incomingPayload.difficulty : state.adventureSettings.difficulty;
                let characterOriginTypeForUpdate = undefined;
                if (finalAdventureType === 'Immersed') {
                    characterOriginTypeForUpdate = incomingPayload.characterOriginType ?? state.adventureSettings.characterOriginType ?? 'original';
                }
                const newSettings = {
                    ...state.adventureSettings,
                    ...incomingPayload,
                    adventureType: finalAdventureType,
                    difficulty: validatedDifficulty,
                    characterOriginType: characterOriginTypeForUpdate,
                    // Ensure Custom fields are only populated if type is Custom
                    worldType: finalAdventureType === 'Custom' ? incomingPayload.worldType ?? state.adventureSettings.worldType ?? "" : "",
                    mainQuestline: finalAdventureType === 'Custom' ? incomingPayload.mainQuestline ?? state.adventureSettings.mainQuestline ?? "" : "",
                    genreTheme: finalAdventureType === 'Custom' ? incomingPayload.genreTheme ?? state.adventureSettings.genreTheme ?? "" : "",
                    magicSystem: finalAdventureType === 'Custom' ? incomingPayload.magicSystem ?? state.adventureSettings.magicSystem ?? "" : "",
                    techLevel: finalAdventureType === 'Custom' ? incomingPayload.techLevel ?? state.adventureSettings.techLevel ?? "" : "",
                    dominantTone: finalAdventureType === 'Custom' ? incomingPayload.dominantTone ?? state.adventureSettings.dominantTone ?? "" : "",
                    startingSituation: finalAdventureType === 'Custom' ? incomingPayload.startingSituation ?? state.adventureSettings.startingSituation ?? "" : "",
                    combatFrequency: finalAdventureType === 'Custom' ? incomingPayload.combatFrequency ?? state.adventureSettings.combatFrequency : undefined,
                    puzzleFrequency: finalAdventureType === 'Custom' ? incomingPayload.puzzleFrequency ?? state.adventureSettings.puzzleFrequency : undefined,
                    socialFocus: finalAdventureType === 'Custom' ? incomingPayload.socialFocus ?? state.adventureSettings.socialFocus : undefined,
                    // Ensure Immersed fields are only populated if type is Immersed
                    universeName: finalAdventureType === 'Immersed' ? incomingPayload.universeName ?? state.adventureSettings.universeName ?? "" : "",
                    playerCharacterConcept: finalAdventureType === 'Immersed' ? incomingPayload.playerCharacterConcept ?? state.adventureSettings.playerCharacterConcept ?? "" : ""
                };
                console.log("SettingsReducer: SET_ADVENTURE_SETTINGS. Final settings being applied:", JSON.stringify(newSettings));
                return {
                    ...state,
                    adventureSettings: newSettings
                };
            }
        case "SET_ADVENTURE_TYPE":
            {
                console.log("SettingsReducer: Setting adventure type to", action.payload, ". Resetting specific fields.");
                const preservedDifficulty = state.adventureSettings.difficulty || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialAdventureSettings"].difficulty;
                const preservedPermadeath = state.adventureSettings.permanentDeath !== undefined ? state.adventureSettings.permanentDeath : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialAdventureSettings"].permanentDeath;
                return {
                    ...state,
                    adventureSettings: {
                        // Start with a clean slate for adventure-specific settings
                        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialAdventureSettings"],
                        adventureType: action.payload,
                        // Preserve general settings
                        difficulty: preservedDifficulty,
                        permanentDeath: preservedPermadeath,
                        // Crucially, characterOriginType is ONLY relevant for "Immersed"
                        // For Randomized/Custom, it MUST be undefined.
                        characterOriginType: action.payload === 'Immersed' ? 'original' : undefined
                    }
                };
            }
        case "SET_THEME_ID":
            return {
                ...state,
                selectedThemeId: action.payload
            };
        case "SET_DARK_MODE":
            return {
                ...state,
                isDarkMode: action.payload
            };
        case "SET_USER_API_KEY":
            return {
                ...state,
                userGoogleAiApiKey: action.payload
            };
        case "RESET_GAME":
            // Preserve theme and API key, reset adventure settings
            return {
                ...state,
                adventureSettings: {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialAdventureSettings"]
                }
            };
        case "LOAD_ADVENTURE":
            {
                const settingsToLoad = action.payload.adventureSettings;
                const validatedDifficulty = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["VALID_ADVENTURE_DIFFICULTY_LEVELS"].includes(settingsToLoad?.difficulty) ? settingsToLoad.difficulty : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialAdventureSettings"].difficulty;
                const loadedAdventureType = settingsToLoad?.adventureType || null;
                let loadedCharacterOriginType = undefined;
                if (loadedAdventureType === 'Immersed') {
                    loadedCharacterOriginType = settingsToLoad?.characterOriginType ?? 'original';
                }
                const validatedSettings = {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialAdventureSettings"],
                    ...settingsToLoad || {},
                    adventureType: loadedAdventureType,
                    difficulty: validatedDifficulty,
                    characterOriginType: loadedCharacterOriginType,
                    worldType: loadedAdventureType === 'Custom' ? settingsToLoad?.worldType ?? "" : "",
                    mainQuestline: loadedAdventureType === 'Custom' ? settingsToLoad?.mainQuestline ?? "" : "",
                    genreTheme: loadedAdventureType === 'Custom' ? settingsToLoad?.genreTheme ?? "" : "",
                    magicSystem: loadedAdventureType === 'Custom' ? settingsToLoad?.magicSystem ?? "" : "",
                    techLevel: loadedAdventureType === 'Custom' ? settingsToLoad?.techLevel ?? "" : "",
                    dominantTone: loadedAdventureType === 'Custom' ? settingsToLoad?.dominantTone ?? "" : "",
                    startingSituation: loadedAdventureType === 'Custom' ? settingsToLoad?.startingSituation ?? "" : "",
                    combatFrequency: loadedAdventureType === 'Custom' ? settingsToLoad?.combatFrequency : undefined,
                    puzzleFrequency: loadedAdventureType === 'Custom' ? settingsToLoad?.puzzleFrequency : undefined,
                    socialFocus: loadedAdventureType === 'Custom' ? settingsToLoad?.socialFocus : undefined,
                    universeName: loadedAdventureType === 'Immersed' ? settingsToLoad?.universeName ?? "" : "",
                    playerCharacterConcept: loadedAdventureType === 'Immersed' ? settingsToLoad?.playerCharacterConcept ?? "" : ""
                };
                console.log("SettingsReducer: Loaded adventure settings:", JSON.stringify(validatedSettings));
                return {
                    ...state,
                    adventureSettings: validatedSettings
                };
            }
        default:
            return state;
    }
}
}}),
"[project]/src/lib/game-state-utils.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/lib/game-state-utils.ts
__turbopack_context__.s({
    "updateGameStateString": (()=>updateGameStateString)
});
const updateGameStateString = (baseString, character, inventory, turn)=>{
    if (!character) return baseString; // Return base if no character
    let updatedString = baseString;
    // Update Turn Count
    updatedString = updatedString.replace(/Turn: \d+/, `Turn: ${turn}`);
    // Update Level and XP
    updatedString = updatedString.replace(/Level: \d+ \(\d+\/\d+ XP\)/, `Level: ${character.level} (${character.xp}/${character.xpToNextLevel} XP)`);
    // Update Inventory
    const inventoryString = inventory.length > 0 ? inventory.map((item)=>`${item.name}${item.quality && item.quality !== 'Common' ? ` (${item.quality})` : ''}`).join(', ') : 'Empty';
    updatedString = updatedString.replace(/Inventory:.*?(?:\n|$)/, `Inventory: ${inventoryString}\n`);
    // Update Status (Stamina/Mana)
    updatedString = updatedString.replace(/Status:.*?\(STA: \d+\/\d+, MANA: \d+\/\d+\)/, `Status: Healthy (STA: ${character.currentStamina}/${character.maxStamina}, MANA: ${character.currentMana}/${character.maxMana})`);
    // Update Reputation
    const reputationString = Object.entries(character.reputation).map(([f, s])=>`${f}: ${s}`).join(', ') || 'None';
    updatedString = updatedString.replace(/Reputation:.*?(?:\n|$)/, `Reputation: ${reputationString}\n`);
    // Update NPC Relationships
    const relationshipString = Object.entries(character.npcRelationships).map(([n, s])=>`${n}: ${s}`).join(', ') || 'None';
    updatedString = updatedString.replace(/NPC Relationships:.*?(?:\n|$)/, `NPC Relationships: ${relationshipString}\n`);
    // Update Class
    updatedString = updatedString.replace(/Class: .*?(?:\n|$)/, `Class: ${character.class}\n`);
    // Update Skill Stage
    const currentStage = character.skillTreeStage ?? 0;
    const stageName = currentStage >= 0 && character.skillTree && character.skillTree.stages.length > currentStage ? character.skillTree.stages[currentStage]?.stageName ?? `Stage ${currentStage}` : "Potential";
    const skillStageString = character.skillTree ? `${stageName} (Stage ${currentStage}/4)` : 'None';
    updatedString = updatedString.replace(/Skill Stage:.*?(?:\n|$)/, `Skill Stage: ${skillStageString}\n`);
    // Update Learned Skills
    const learnedSkillsString = character.learnedSkills.map((s)=>s.name).join(', ') || 'None';
    updatedString = updatedString.replace(/Learned Skills:.*?(?:\n|$)/, `Learned Skills: ${learnedSkillsString}\n`);
    // Note: Character description, traits, knowledge, background, stats, AI profile, and adventure settings
    // are usually part of the initial state or updated less frequently, so we might not need
    // to parse and replace them on every narration update unless explicitly changed by the AI.
    // If they *can* change, add similar replace logic here.
    return updatedString;
};
}}),
"[project]/src/context/reducers/adventureReducer.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/context/reducers/adventureReducer.ts
__turbopack_context__.s({
    "adventureReducer": (()=>adventureReducer)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/game-initial-state.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/gameUtils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/game-state-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-ssr] (ecmascript)");
;
;
;
;
function adventureReducer(state, action) {
    switch(action.type){
        case "SET_GAME_STATUS":
            return {
                ...state,
                status: action.payload
            };
        case "START_GAMEPLAY":
            {
                if (state.adventureSettings.adventureType !== "Coop" && !state.character) {
                    console.error("AdventureReducer: Cannot start single-player gameplay: Character is null. Resetting to Main Menu.");
                    return {
                        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialState"],
                        savedAdventures: state.savedAdventures,
                        selectedThemeId: state.selectedThemeId,
                        isDarkMode: state.isDarkMode,
                        userGoogleAiApiKey: state.userGoogleAiApiKey
                    };
                }
                if (!state.adventureSettings.adventureType && state.adventureSettings.adventureType !== "Coop") {
                    console.error("AdventureReducer: Cannot start gameplay: Adventure type is not set. Resetting to Main Menu.");
                    return {
                        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialState"],
                        savedAdventures: state.savedAdventures,
                        selectedThemeId: state.selectedThemeId,
                        isDarkMode: state.isDarkMode,
                        userGoogleAiApiKey: state.userGoogleAiApiKey
                    };
                }
                const adventureId = state.currentAdventureId || (state.adventureSettings.adventureType === "Coop" ? state.sessionId : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateAdventureId"])());
                const turnCount = state.turnCount > 0 ? state.turnCount : 0;
                const currentInventory = state.inventory.length > 0 ? state.inventory : [
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialInventory"]
                ];
                const initialGameState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateGameStateString"])(state.storyLog.length > 0 ? state.currentGameStateString : "The adventure is about to begin...", state.character, currentInventory, turnCount);
                const newStatus = state.adventureSettings.adventureType === "Coop" ? "CoopGameplay" : "Gameplay";
                return {
                    ...state,
                    status: newStatus,
                    inventory: currentInventory,
                    currentGameStateString: initialGameState,
                    currentAdventureId: adventureId,
                    isGeneratingSkillTree: state.character ? state.adventureSettings.adventureType !== "Immersed" && !state.character.skillTree && !state.isGeneratingSkillTree : false,
                    turnCount: turnCount
                };
            }
        case "UPDATE_NARRATION":
            {
                const newLogEntry = {
                    ...action.payload,
                    timestamp: action.payload.timestamp || Date.now()
                };
                const newLog = [
                    ...state.storyLog,
                    newLogEntry
                ];
                const newTurnCount = state.turnCount + 1;
                // Create a deep copy of the character to apply updates
                let updatedCharacter = state.character ? {
                    ...state.character
                } : null;
                if (updatedCharacter) {
                    const { updatedStats, updatedTraits, updatedKnowledge, healthChange, staminaChange, manaChange, gainedSkill, xpGained, reputationChange, npcRelationshipChange, progressedToStage } = action.payload;
                    // Update Stats and recalculate derived max values
                    if (updatedStats) {
                        updatedCharacter.stats = {
                            ...updatedCharacter.stats,
                            ...updatedStats
                        };
                        updatedCharacter.maxHealth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxHealth"])(updatedCharacter.stats);
                        updatedCharacter.maxStamina = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxActionStamina"])(updatedCharacter.stats);
                        updatedCharacter.maxMana = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxMana"])(updatedCharacter.stats, updatedCharacter.knowledge);
                    }
                    // Update Lists
                    if (updatedTraits) updatedCharacter.traits = updatedTraits;
                    if (updatedKnowledge) updatedCharacter.knowledge = updatedKnowledge;
                    // Recalculate max values if knowledge changed (affects Mana)
                    if (updatedKnowledge) {
                        updatedCharacter.maxMana = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$gameUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateMaxMana"])(updatedCharacter.stats, updatedCharacter.knowledge);
                    }
                    // Update Vitals (Current)
                    if (healthChange) updatedCharacter.currentHealth = Math.max(0, Math.min(updatedCharacter.maxHealth, updatedCharacter.currentHealth + healthChange));
                    if (staminaChange) updatedCharacter.currentStamina = Math.max(0, Math.min(updatedCharacter.maxStamina, updatedCharacter.currentStamina + staminaChange));
                    if (manaChange) updatedCharacter.currentMana = Math.max(0, Math.min(updatedCharacter.maxMana, updatedCharacter.currentMana + manaChange));
                    // Update Skills/XP/Rep
                    if (gainedSkill && !updatedCharacter.learnedSkills.some((s)=>s.name === gainedSkill.name)) {
                        updatedCharacter.learnedSkills = [
                            ...updatedCharacter.learnedSkills,
                            {
                                ...gainedSkill,
                                type: 'Learned'
                            }
                        ];
                    }
                    if (xpGained) updatedCharacter.xp += xpGained;
                    if (reputationChange) {
                        const { faction, change } = reputationChange;
                        const currentScore = updatedCharacter.reputation[faction] ?? 0;
                        updatedCharacter.reputation = {
                            ...updatedCharacter.reputation,
                            [faction]: Math.max(-100, Math.min(100, currentScore + change))
                        };
                    }
                    if (npcRelationshipChange) {
                        const { npcName, change } = npcRelationshipChange;
                        const currentScore = updatedCharacter.npcRelationships[npcName] ?? 0;
                        updatedCharacter.npcRelationships = {
                            ...updatedCharacter.npcRelationships,
                            [npcName]: Math.max(-100, Math.min(100, currentScore + change))
                        };
                    }
                    if (progressedToStage !== undefined && progressedToStage > updatedCharacter.skillTreeStage) {
                        updatedCharacter.skillTreeStage = progressedToStage;
                    }
                }
                const updatedGameState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateGameStateString"])(action.payload.updatedGameState, updatedCharacter, state.inventory, newTurnCount);
                if (action.payload.isCharacterDefeated && updatedCharacter && updatedCharacter.currentHealth <= 0) {
                    if (state.adventureSettings.permanentDeath) {
                        console.log("AdventureReducer: Character defeated (Permadeath). Game will end.");
                    } else {
                        console.log("AdventureReducer: Character defeated. Respawn should be triggered.");
                    }
                }
                return {
                    ...state,
                    character: updatedCharacter,
                    currentNarration: newLogEntry,
                    storyLog: newLog,
                    currentGameStateString: updatedGameState,
                    turnCount: newTurnCount
                };
            }
        case "RESPAWN_CHARACTER":
            {
                if (!state.character) return state;
                const respawnMessage = action.payload?.narrationMessage || "You had a narrow escape and have recovered!";
                const respawnLogEntry = {
                    narration: respawnMessage,
                    updatedGameState: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateGameStateString"])(state.currentGameStateString, state.character, state.inventory, state.turnCount),
                    timestamp: Date.now()
                };
                // Restore character vitals
                const updatedCharacter = {
                    ...state.character,
                    currentHealth: state.character.maxHealth,
                    currentStamina: state.character.maxStamina,
                    currentMana: state.character.maxMana
                };
                return {
                    ...state,
                    character: updatedCharacter,
                    storyLog: [
                        ...state.storyLog,
                        respawnLogEntry
                    ],
                    currentNarration: respawnLogEntry
                };
            }
        case "UPDATE_CRAFTING_RESULT":
            {
                const { narration, newGameStateString: providedGameState } = action.payload;
                const newTurnCount = state.turnCount + 1;
                if (!state.character) return {
                    ...state,
                    turnCount: newTurnCount
                };
                const finalGameStateString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateGameStateString"])(providedGameState || state.currentGameStateString, state.character, state.inventory, newTurnCount);
                const craftingLogEntry = {
                    narration: narration,
                    updatedGameState: finalGameStateString,
                    timestamp: Date.now()
                };
                return {
                    ...state,
                    storyLog: [
                        ...state.storyLog,
                        craftingLogEntry
                    ],
                    currentNarration: craftingLogEntry,
                    currentGameStateString: finalGameStateString,
                    turnCount: newTurnCount
                };
            }
        case "INCREMENT_TURN":
            return {
                ...state,
                turnCount: state.turnCount + 1
            };
        case "SET_SKILL_TREE_GENERATING":
            return {
                ...state,
                isGeneratingSkillTree: action.payload
            };
        case "END_ADVENTURE":
            {
                let finalLog = [
                    ...state.storyLog
                ];
                let finalGameState = state.currentGameStateString;
                let finalCharacterState = state.character;
                let finalInventoryState = state.inventory;
                let finalTurnCount = state.turnCount;
                if (action.payload.finalNarration && (!state.currentNarration || action.payload.finalNarration.narration !== state.currentNarration.narration)) {
                    const finalEntry = {
                        ...action.payload.finalNarration,
                        timestamp: action.payload.finalNarration.timestamp || Date.now()
                    };
                    finalLog.push(finalEntry);
                    finalCharacterState = state.character;
                    finalInventoryState = state.inventory;
                    finalTurnCount = state.turnCount + (action.payload.finalNarration ? 1 : 0);
                    if (finalCharacterState) {
                        finalGameState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateGameStateString"])(action.payload.finalNarration.updatedGameState, finalCharacterState, finalInventoryState, finalTurnCount);
                    }
                }
                let updatedSavedAdventures = state.savedAdventures;
                if (finalCharacterState && state.currentAdventureId && state.adventureSettings.adventureType !== "Coop") {
                    const endedAdventure = {
                        id: state.currentAdventureId,
                        saveTimestamp: Date.now(),
                        characterName: finalCharacterState.name,
                        character: finalCharacterState,
                        adventureSettings: state.adventureSettings,
                        storyLog: finalLog,
                        currentGameStateString: finalGameState,
                        inventory: finalInventoryState,
                        statusBeforeSave: "AdventureSummary",
                        adventureSummary: action.payload.summary,
                        turnCount: finalTurnCount
                    };
                    updatedSavedAdventures = state.savedAdventures.filter((adv)=>adv.id !== endedAdventure.id);
                    updatedSavedAdventures.push(endedAdventure);
                    localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAVED_ADVENTURES_KEY"], JSON.stringify(updatedSavedAdventures));
                }
                return {
                    ...state,
                    status: "AdventureSummary",
                    character: finalCharacterState,
                    adventureSummary: action.payload.summary,
                    storyLog: finalLog,
                    inventory: finalInventoryState,
                    turnCount: finalTurnCount,
                    currentNarration: null,
                    savedAdventures: updatedSavedAdventures,
                    isGeneratingSkillTree: false,
                    sessionId: state.adventureSettings.adventureType === "Coop" ? null : state.sessionId,
                    isHost: state.adventureSettings.adventureType === "Coop" ? false : state.isHost
                };
            }
        case "LOAD_SAVED_ADVENTURES":
            return {
                ...state,
                savedAdventures: action.payload
            };
        case "SAVE_CURRENT_ADVENTURE":
            {
                if (!state.character || !state.currentAdventureId || state.status !== "Gameplay" || state.adventureSettings.adventureType === "Coop") {
                    return state; // Do not save co-op games this way
                }
                const currentSave = {
                    id: state.currentAdventureId,
                    saveTimestamp: Date.now(),
                    characterName: state.character.name,
                    character: state.character,
                    adventureSettings: state.adventureSettings,
                    storyLog: state.storyLog,
                    currentGameStateString: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$game$2d$state$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateGameStateString"])(state.currentGameStateString, state.character, state.inventory, state.turnCount),
                    inventory: state.inventory,
                    statusBeforeSave: state.status,
                    adventureSummary: state.adventureSummary,
                    turnCount: state.turnCount
                };
                const savesWithoutCurrent = state.savedAdventures.filter((adv)=>adv.id !== currentSave.id);
                const newSaves = [
                    ...savesWithoutCurrent,
                    currentSave
                ];
                localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAVED_ADVENTURES_KEY"], JSON.stringify(newSaves));
                return {
                    ...state,
                    savedAdventures: newSaves
                };
            }
        case "LOAD_ADVENTURE":
            {
                const adventureToLoad = action.payload;
                if (!adventureToLoad || adventureToLoad.adventureSettings.adventureType === "Coop") {
                    return state; // Do not load co-op games this way
                }
                const statusToLoad = adventureToLoad.statusBeforeSave || (adventureToLoad.adventureSummary ? "AdventureSummary" : "Gameplay");
                return {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialState"],
                    savedAdventures: state.savedAdventures,
                    selectedThemeId: state.selectedThemeId,
                    isDarkMode: state.isDarkMode,
                    userGoogleAiApiKey: state.userGoogleAiApiKey,
                    status: statusToLoad,
                    character: adventureToLoad.character,
                    adventureSettings: adventureToLoad.adventureSettings,
                    storyLog: adventureToLoad.storyLog,
                    inventory: adventureToLoad.inventory,
                    turnCount: adventureToLoad.turnCount || 0,
                    currentGameStateString: adventureToLoad.currentGameStateString,
                    currentNarration: adventureToLoad.storyLog.length > 0 ? adventureToLoad.storyLog[adventureToLoad.storyLog.length - 1] : null,
                    adventureSummary: adventureToLoad.adventureSummary,
                    currentAdventureId: adventureToLoad.id,
                    isGeneratingSkillTree: false
                };
            }
        case "DELETE_ADVENTURE":
            {
                const filteredSaves = state.savedAdventures.filter((adv)=>adv.id !== action.payload);
                localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAVED_ADVENTURES_KEY"], JSON.stringify(filteredSaves));
                return {
                    ...state,
                    savedAdventures: filteredSaves
                };
            }
        // --- Multiplayer Actions ---
        case "SET_SESSION_ID":
            return {
                ...state,
                sessionId: action.payload,
                currentAdventureId: action.payload
            }; // For co-op, sessionID is the adventureID
        case "SET_PLAYERS":
            return {
                ...state,
                players: action.payload
            };
        case "ADD_PLAYER":
            if (state.players.includes(action.payload)) return state;
            return {
                ...state,
                players: [
                    ...state.players,
                    action.payload
                ]
            };
        case "REMOVE_PLAYER":
            return {
                ...state,
                players: state.players.filter((uid)=>uid !== action.payload)
            };
        case "SET_CURRENT_PLAYER_UID":
            return {
                ...state,
                currentPlayerUid: action.payload
            };
        case "SET_IS_HOST":
            return {
                ...state,
                isHost: action.payload
            };
        case "SYNC_COOP_SESSION_STATE":
            {
                const sessionData = action.payload;
                let updatedState = {
                    ...state
                };
                if (sessionData.players) updatedState.players = sessionData.players;
                if (sessionData.turnCount !== undefined) updatedState.turnCount = sessionData.turnCount;
                if (sessionData.storyLog) updatedState.storyLog = sessionData.storyLog;
                if (sessionData.currentGameStateString) updatedState.currentGameStateString = sessionData.currentGameStateString;
                if (sessionData.sharedCharacter) updatedState.character = sessionData.sharedCharacter; // Simple sync for now
                if (sessionData.sharedInventory) updatedState.inventory = sessionData.sharedInventory;
                if (sessionData.adventureSettings) {
                    updatedState.adventureSettings = {
                        ...state.adventureSettings,
                        ...sessionData.adventureSettings,
                        adventureType: "Coop"
                    };
                }
                if (sessionData.storyLog && sessionData.storyLog.length > 0) {
                    updatedState.currentNarration = sessionData.storyLog[sessionData.storyLog.length - 1];
                }
                return updatedState;
            }
        default:
            return state;
    }
}
}}),
"[project]/src/context/game-reducer.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "gameReducer": (()=>gameReducer)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/game-initial-state.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$reducers$2f$characterReducer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/reducers/characterReducer.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$reducers$2f$inventoryReducer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/reducers/inventoryReducer.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$reducers$2f$settingsReducer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/reducers/settingsReducer.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$reducers$2f$adventureReducer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/reducers/adventureReducer.ts [app-ssr] (ecmascript)"); // This will handle most game flow logic
"use client";
;
;
;
;
;
function gameReducer(state, action) {
    console.log(`GameReducer: Action received - ${action.type}`, action.payload !== undefined ? JSON.stringify(action.payload).substring(0, 300) : '(no payload)');
    const updatedCharacter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$reducers$2f$characterReducer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["characterReducer"])(state.character, action);
    const updatedInventory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$reducers$2f$inventoryReducer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["inventoryReducer"])(state.inventory, action);
    const settingsRelatedState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$reducers$2f$settingsReducer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["settingsReducer"])({
        adventureSettings: state.adventureSettings,
        selectedThemeId: state.selectedThemeId,
        isDarkMode: state.isDarkMode,
        userGoogleAiApiKey: state.userGoogleAiApiKey
    }, action);
    let nextState = {
        ...state,
        character: updatedCharacter,
        inventory: updatedInventory,
        adventureSettings: settingsRelatedState.adventureSettings,
        selectedThemeId: settingsRelatedState.selectedThemeId,
        isDarkMode: settingsRelatedState.isDarkMode,
        userGoogleAiApiKey: settingsRelatedState.userGoogleAiApiKey
    };
    nextState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$reducers$2f$adventureReducer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adventureReducer"])(nextState, action);
    switch(action.type){
        case "RESET_GAME":
            {
                const { savedAdventures, selectedThemeId, isDarkMode, userGoogleAiApiKey } = state;
                console.log("GameReducer: Resetting game to initial state, preserving session settings.");
                return {
                    ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialState"],
                    savedAdventures,
                    selectedThemeId,
                    isDarkMode,
                    userGoogleAiApiKey,
                    status: "MainMenu"
                };
            }
        // CREATE_CHARACTER_AND_SETUP is now fully handled by adventureReducer which calls characterReducer
        // Other specific root actions handled by adventureReducer or sub-reducers.
        default:
            return nextState;
    }
}
}}),
"[project]/src/lib/themes.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/lib/themes.ts
__turbopack_context__.s({
    "THEMES": (()=>THEMES)
});
const THEMES = [
    {
        name: "Cardboard",
        id: "cardboard",
        light: {
            "--background": "20 15% 95%",
            "--foreground": "20 10% 20%",
            "--card": "30 20% 92%",
            "--card-foreground": "20 10% 20%",
            "--popover": "30 20% 92%",
            "--popover-foreground": "20 10% 20%",
            "--primary": "0 0% 50%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "30 15% 80%",
            "--secondary-foreground": "20 10% 20%",
            "--muted": "30 15% 85%",
            "--muted-foreground": "0 0% 45%",
            "--accent": "20 60% 50%",
            "--accent-foreground": "0 0% 100%",
            "--destructive": "0 84.2% 60.2%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "20 10% 75%",
            "--input": "20 10% 80%",
            "--ring": "20 60% 50%",
            "--chart-1": "12 76% 61%",
            "--chart-2": "173 58% 39%",
            "--chart-3": "197 37% 24%",
            "--chart-4": "43 74% 66%",
            "--chart-5": "27 87% 67%"
        },
        dark: {
            "--background": "20 10% 10%",
            "--foreground": "20 5% 95%",
            "--card": "20 10% 15%",
            "--card-foreground": "20 5% 95%",
            "--popover": "20 10% 15%",
            "--popover-foreground": "20 5% 95%",
            "--primary": "0 0% 70%",
            "--primary-foreground": "0 0% 10%",
            "--secondary": "30 10% 25%",
            "--secondary-foreground": "20 5% 95%",
            "--muted": "30 10% 20%",
            "--muted-foreground": "0 0% 63.9%",
            "--accent": "20 60% 50%",
            "--accent-foreground": "0 0% 100%",
            "--destructive": "0 62.8% 30.6%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "20 10% 30%",
            "--input": "20 10% 35%",
            "--ring": "20 60% 50%",
            "--chart-1": "220 70% 50%",
            "--chart-2": "160 60% 45%",
            "--chart-3": "30 80% 55%",
            "--chart-4": "280 65% 60%",
            "--chart-5": "340 75% 55%"
        }
    },
    {
        name: "Ocean Depths",
        id: "ocean",
        light: {
            "--background": "210 40% 98%",
            "--foreground": "210 30% 15%",
            "--card": "210 40% 94%",
            "--card-foreground": "210 30% 15%",
            "--popover": "210 40% 94%",
            "--popover-foreground": "210 30% 15%",
            "--primary": "210 60% 45%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "180 40% 85%",
            "--secondary-foreground": "210 30% 15%",
            "--muted": "210 40% 90%",
            "--muted-foreground": "210 15% 45%",
            "--accent": "185 70% 50%",
            "--accent-foreground": "210 30% 15%",
            "--destructive": "0 84.2% 60.2%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "210 20% 75%",
            "--input": "210 20% 80%",
            "--ring": "185 70% 50%",
            "--chart-1": "210 80% 55%",
            "--chart-2": "185 75% 45%",
            "--chart-3": "195 60% 60%",
            "--chart-4": "220 50% 70%",
            "--chart-5": "170 65% 40%"
        },
        dark: {
            "--background": "210 30% 10%",
            "--foreground": "210 20% 95%",
            "--card": "210 30% 15%",
            "--card-foreground": "210 20% 95%",
            "--popover": "210 30% 15%",
            "--popover-foreground": "210 20% 95%",
            "--primary": "210 70% 65%",
            "--primary-foreground": "210 30% 10%",
            "--secondary": "180 30% 25%",
            "--secondary-foreground": "210 20% 95%",
            "--muted": "210 30% 20%",
            "--muted-foreground": "210 15% 63.9%",
            "--accent": "185 60% 60%",
            "--accent-foreground": "210 30% 10%",
            "--destructive": "0 62.8% 30.6%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "210 20% 30%",
            "--input": "210 20% 35%",
            "--ring": "185 60% 60%",
            "--chart-1": "210 70% 60%",
            "--chart-2": "185 65% 55%",
            "--chart-3": "195 50% 70%",
            "--chart-4": "220 40% 80%",
            "--chart-5": "170 70% 50%"
        }
    },
    {
        name: "Forest Canopy",
        id: "forest",
        light: {
            "--background": "120 10% 96%",
            "--foreground": "120 20% 10%",
            "--card": "110 15% 93%",
            "--card-foreground": "120 20% 10%",
            "--popover": "110 15% 93%",
            "--popover-foreground": "120 20% 10%",
            "--primary": "120 50% 35%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "40 30% 80%",
            "--secondary-foreground": "120 20% 10%",
            "--muted": "110 15% 90%",
            "--muted-foreground": "120 10% 45%",
            "--accent": "90 60% 55%",
            "--accent-foreground": "120 20% 10%",
            "--destructive": "0 84.2% 60.2%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "110 10% 75%",
            "--input": "110 10% 80%",
            "--ring": "90 60% 55%",
            "--chart-1": "120 60% 40%",
            "--chart-2": "90 70% 50%",
            "--chart-3": "40 40% 60%",
            "--chart-4": "100 50% 70%",
            "--chart-5": "80 65% 45%"
        },
        dark: {
            "--background": "120 20% 8%",
            "--foreground": "110 10% 94%",
            "--card": "120 20% 12%",
            "--card-foreground": "110 10% 94%",
            "--popover": "120 20% 12%",
            "--popover-foreground": "110 10% 94%",
            "--primary": "120 60% 55%",
            "--primary-foreground": "120 20% 8%",
            "--secondary": "40 25% 20%",
            "--secondary-foreground": "110 10% 94%",
            "--muted": "120 20% 15%",
            "--muted-foreground": "110 10% 63.9%",
            "--accent": "90 50% 65%",
            "--accent-foreground": "120 20% 8%",
            "--destructive": "0 62.8% 30.6%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "110 10% 25%",
            "--input": "110 10% 30%",
            "--ring": "90 50% 65%",
            "--chart-1": "120 50% 50%",
            "--chart-2": "90 60% 60%",
            "--chart-3": "40 30% 40%",
            "--chart-4": "100 40% 80%",
            "--chart-5": "80 55% 60%"
        }
    },
    {
        name: "Mystic Scroll",
        id: "scroll",
        light: {
            "--background": "35 40% 94%",
            "--foreground": "35 15% 20%",
            "--card": "35 45% 90%",
            "--card-foreground": "35 15% 20%",
            "--popover": "35 45% 90%",
            "--popover-foreground": "35 15% 20%",
            "--primary": "50 60% 50%",
            "--primary-foreground": "35 15% 20%",
            "--secondary": "0 40% 85%",
            "--secondary-foreground": "35 15% 20%",
            "--muted": "35 40% 92%",
            "--muted-foreground": "35 10% 45%",
            "--accent": "280 50% 60%",
            "--accent-foreground": "0 0% 100%",
            "--destructive": "0 84.2% 60.2%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "35 15% 70%",
            "--input": "35 15% 75%",
            "--ring": "280 50% 60%",
            "--chart-1": "50 70% 60%",
            "--chart-2": "0 50% 70%",
            "--chart-3": "280 60% 65%",
            "--chart-4": "35 30% 50%",
            "--chart-5": "240 40% 75%"
        },
        dark: {
            "--background": "35 15% 12%",
            "--foreground": "35 25% 92%",
            "--card": "35 15% 18%",
            "--card-foreground": "35 25% 92%",
            "--popover": "35 15% 18%",
            "--popover-foreground": "35 25% 92%",
            "--primary": "50 70% 70%",
            "--primary-foreground": "35 15% 12%",
            "--secondary": "0 30% 30%",
            "--secondary-foreground": "35 25% 92%",
            "--muted": "35 15% 22%",
            "--muted-foreground": "35 10% 63.9%",
            "--accent": "280 60% 75%",
            "--accent-foreground": "35 15% 12%",
            "--destructive": "0 62.8% 30.6%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "35 15% 35%",
            "--input": "35 15% 40%",
            "--ring": "280 60% 75%",
            "--chart-1": "50 60% 65%",
            "--chart-2": "0 40% 55%",
            "--chart-3": "280 50% 70%",
            "--chart-4": "35 20% 40%",
            "--chart-5": "240 50% 80%"
        }
    },
    {
        name: "Nightshade",
        id: "nightshade",
        light: {
            "--background": "240 10% 90%",
            "--foreground": "240 20% 10%",
            "--card": "240 15% 85%",
            "--card-foreground": "240 20% 10%",
            "--popover": "240 15% 85%",
            "--popover-foreground": "240 20% 10%",
            "--primary": "260 60% 55%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "300 30% 75%",
            "--secondary-foreground": "240 20% 10%",
            "--muted": "240 15% 88%",
            "--muted-foreground": "240 10% 45%",
            "--accent": "150 50% 50%",
            "--accent-foreground": "240 20% 10%",
            "--destructive": "0 84.2% 60.2%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "240 10% 70%",
            "--input": "240 10% 75%",
            "--ring": "150 50% 50%",
            "--chart-1": "260 70% 60%",
            "--chart-2": "300 40% 80%",
            "--chart-3": "150 60% 55%",
            "--chart-4": "240 30% 70%",
            "--chart-5": "280 50% 65%"
        },
        dark: {
            "--background": "240 20% 6%",
            "--foreground": "240 10% 95%",
            "--card": "240 20% 10%",
            "--card-foreground": "240 10% 95%",
            "--popover": "240 20% 10%",
            "--popover-foreground": "240 10% 95%",
            "--primary": "260 70% 70%",
            "--primary-foreground": "240 20% 6%",
            "--secondary": "300 40% 25%",
            "--secondary-foreground": "240 10% 95%",
            "--muted": "240 20% 12%",
            "--muted-foreground": "240 10% 63.9%",
            "--accent": "150 60% 65%",
            "--accent-foreground": "240 20% 6%",
            "--destructive": "0 62.8% 30.6%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "240 10% 20%",
            "--input": "240 10% 25%",
            "--ring": "150 60% 65%",
            "--chart-1": "260 60% 65%",
            "--chart-2": "300 30% 50%",
            "--chart-3": "150 50% 70%",
            "--chart-4": "240 20% 40%",
            "--chart-5": "280 40% 60%"
        }
    }
];
}}),
"[project]/src/context/GameContext.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/context/GameContext.tsx
__turbopack_context__.s({
    "GameProvider": (()=>GameProvider),
    "useGame": (()=>useGame)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/game-initial-state.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$reducer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/game-reducer.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$themes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/themes.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
// Firebase imports disabled
// import { auth } from '../lib/firebase';
// import type { User } from 'firebase/auth';
// import { signInAnonymously } from "firebase/auth";
// import { listenToSessionUpdates } from "../services/multiplayer-service";
const GameContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const GameProvider = ({ children })=>{
    const [state, dispatch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useReducer"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$reducer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["gameReducer"], __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialState"]);
    const applyTheme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((themeId, isDark)=>{
        const theme = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$themes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEMES"].find((t)=>t.id === themeId) || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$themes$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEMES"][0];
        const colors = isDark ? theme.dark : theme.light;
        const root = document.documentElement;
        if (!root) return;
        Object.entries(colors).forEach(([property, value])=>{
            root.style.setProperty(property, value);
        });
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log("GameProvider initializing...");
        // Load saved adventures from localStorage
        try {
            const savedData = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAVED_ADVENTURES_KEY"]);
            if (savedData) {
                const loadedAdventures = JSON.parse(savedData);
                if (Array.isArray(loadedAdventures)) {
                    dispatch({
                        type: "LOAD_SAVED_ADVENTURES",
                        payload: loadedAdventures
                    });
                } else {
                    localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAVED_ADVENTURES_KEY"]);
                }
            }
        } catch (error) {
            console.error("Failed to load saved adventures:", error);
            localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SAVED_ADVENTURES_KEY"]);
        }
        // Load theme and API key from localStorage
        const savedThemeId = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEME_ID_KEY"]) || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$game$2d$initial$2d$state$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initialState"].selectedThemeId;
        const savedMode = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEME_MODE_KEY"]);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialDarkMode = savedMode === 'dark' || savedMode === null && prefersDark;
        const savedUserApiKey = localStorage.getItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_API_KEY_KEY"]);
        if (savedUserApiKey) {
            dispatch({
                type: 'SET_USER_API_KEY',
                payload: savedUserApiKey
            });
        }
        dispatch({
            type: 'SET_THEME_ID',
            payload: savedThemeId
        });
        dispatch({
            type: 'SET_DARK_MODE',
            payload: initialDarkMode
        });
        // Apply the loaded theme immediately
        applyTheme(savedThemeId, initialDarkMode);
    // FIREBASE DISABLED
    /*
        // Setup Firebase anonymous auth listener
        const unsubscribeAuth = auth.onAuthStateChanged(async (user: User | null) => {
            if (user) {
                console.log("GameProvider: Firebase Auth user signed in:", user.uid);
                dispatch({ type: 'SET_CURRENT_PLAYER_UID', payload: user.uid });
            } else {
                console.log("GameProvider: Firebase Auth user signed out or no user. Attempting anonymous sign-in.");
                try {
                    const userCredential = await signInAnonymously(auth);
                    console.log("GameProvider: Signed in anonymously:", userCredential.user.uid);
                    dispatch({ type: 'SET_CURRENT_PLAYER_UID', payload: userCredential.user.uid });
                } catch (error) {
                    console.error("GameProvider: Error signing in anonymously:", error);
                    dispatch({ type: 'SET_CURRENT_PLAYER_UID', payload: null });
                }
            }
        });

        // Cleanup auth listener on component unmount
        return () => {
            unsubscribeAuth();
        };
        */ }, [
        applyTheme
    ]); // Only run this effect once on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Apply visual changes immediately regardless of game status
        applyTheme(state.selectedThemeId, state.isDarkMode);
        // Persist to local storage
        localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEME_ID_KEY"], state.selectedThemeId);
        localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEME_MODE_KEY"], state.isDarkMode ? 'dark' : 'light');
    }, [
        state.selectedThemeId,
        state.isDarkMode,
        applyTheme
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Persist API key regardless of game status
        if (state.userGoogleAiApiKey) {
            localStorage.setItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_API_KEY_KEY"], state.userGoogleAiApiKey);
        } else {
            // Only remove if explicitly null (cleared), undefined might be initial load
            if (state.userGoogleAiApiKey === null) {
                localStorage.removeItem(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USER_API_KEY_KEY"]);
            }
        }
    }, [
        state.userGoogleAiApiKey
    ]);
    // FIREBASE DISABLED - Removed Session Listener
    /*
    useEffect(() => {
        let unsubscribeSession: (() => void) | undefined;

        if (state.sessionId && (state.status === "CoopLobby" || state.status === "CoopGameplay")) {
            console.log(`GameContext: Listening to session updates for sessionId: ${state.sessionId}`);
            unsubscribeSession = listenToSessionUpdates(state.sessionId, (sessionData: FirestoreCoopSession | null) => {
                if (sessionData) {
                    console.log("GameContext: Firestore session data received:", sessionData);
                    dispatch({ type: "SYNC_COOP_SESSION_STATE", payload: sessionData });

                    if (sessionData.status === 'playing' && state.status === 'CoopLobby') {
                        dispatch({
                            type: "SET_ADVENTURE_SETTINGS",
                            payload: {
                                ...sessionData.adventureSettings,
                                adventureType: "Coop"
                            }
                        });
                        dispatch({ type: "SET_GAME_STATUS", payload: "CoopGameplay" });
                    }
                } else {
                    console.log("GameContext: Session data is null (deleted or error).");
                    if (state.status === "CoopLobby" || state.status === "CoopGameplay") {
                         dispatch({ type: "RESET_GAME" });
                    }
                }
            });
        }
        return () => {
            if (unsubscribeSession) {
                console.log(`GameContext: Unsubscribing from session updates for sessionId: ${state.sessionId}`);
                unsubscribeSession();
            }
        };
    }, [state.sessionId, state.status, dispatch]);
    */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const currentStageName = state.character?.skillTreeStage !== undefined && state.character?.skillTree ? state.character.skillTree.stages[state.character.skillTreeStage]?.stageName ?? `Stage ${state.character.skillTreeStage}` : "Potential";
        const reputationString = state.character ? Object.entries(state.character.reputation).map(([f, s])=>`${f}: ${s}`).join(', ') || 'None' : 'N/A';
        const relationshipString = state.character ? Object.entries(state.character.npcRelationships).map(([n, s])=>`${n}: ${s}`).join(', ') || 'None' : 'N/A';
        const inventoryString = state.inventory.map((i)=>`${i.name}${i.quality ? ` (${i.quality})` : ''}`).join(', ') || 'Empty';
        console.log("Game State Updated:", {
            status: state.status,
            turn: state.turnCount,
            character: state.character?.name,
            level: state.character?.level,
            xp: `${state.character?.xp}/${state.character?.xpToNextLevel}`,
            reputation: reputationString,
            relationships: relationshipString,
            class: state.character?.class,
            stage: `${currentStageName} (${state.character?.skillTreeStage ?? 0}/4)`,
            health: `${state.character?.currentHealth}/${state.character?.maxHealth}`,
            actionStamina: `${state.character?.currentStamina}/${state.character?.maxStamina}`,
            mana: `${state.character?.currentMana}/${state.character?.maxMana}`,
            adventureId: state.currentAdventureId,
            settings: state.adventureSettings,
            inventory: inventoryString,
            theme: `${state.selectedThemeId} (${state.isDarkMode ? 'Dark' : 'Light'})`,
            apiKeySet: !!state.userGoogleAiApiKey,
            storyLogLength: state.storyLog.length,
            isGeneratingSkillTree: state.isGeneratingSkillTree,
            sessionId: state.sessionId,
            players: state.players,
            currentPlayerUid: state.currentPlayerUid,
            isHost: state.isHost
        });
    }, [
        state
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GameContext.Provider, {
        value: {
            state,
            dispatch
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/GameContext.tsx",
        lineNumber: 201,
        columnNumber: 5
    }, this);
};
const useGame = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(GameContext);
    if (context === undefined) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
};
}}),
"[project]/src/hooks/use-toast.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "reducer": (()=>reducer),
    "toast": (()=>toast),
    "useToast": (()=>useToast)
});
// src/hooks/use-toast.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const TOAST_LIMIT = 3 // Allow up to 3 toasts visible at once
;
const TOAST_REMOVE_DELAY = 5000 // Auto-remove after 5 seconds
;
const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST"
};
let count = 0;
// Generates a unique ID for each toast
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
// Stores timeout IDs for automatic removal
const toastTimeouts = new Map();
// Schedules a toast for removal after a delay
const addToRemoveQueue = (toastId)=>{
    // If a timeout already exists for this toast, do nothing
    if (toastTimeouts.has(toastId)) {
        return;
    }
    // Set a timeout to dispatch the REMOVE_TOAST action
    const timeout = setTimeout(()=>{
        toastTimeouts.delete(toastId); // Remove the timeout ID from the map
        // Dispatch action to remove the toast from state
        dispatch({
            type: "REMOVE_TOAST",
            toastId: toastId
        });
    }, TOAST_REMOVE_DELAY);
    // Store the timeout ID
    toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action)=>{
    switch(action.type){
        // Add a new toast to the beginning of the array, respecting the limit
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [
                    action.toast,
                    ...state.toasts
                ].slice(0, TOAST_LIMIT)
            };
        // Update an existing toast by its ID
        case "UPDATE_TOAST":
            return {
                ...state,
                toasts: state.toasts.map((t)=>t.id === action.toast.id ? {
                        ...t,
                        ...action.toast
                    } : t)
            };
        // Mark toast(s) as not open and schedule for removal
        case "DISMISS_TOAST":
            {
                const { toastId } = action;
                // Schedule the specific toast or all toasts for removal
                if (toastId) {
                    addToRemoveQueue(toastId);
                } else {
                    state.toasts.forEach((toast)=>{
                        addToRemoveQueue(toast.id);
                    });
                }
                // Update the state to mark the toast(s) as closed
                return {
                    ...state,
                    toasts: state.toasts.map((t)=>t.id === toastId || toastId === undefined ? {
                            ...t,
                            open: false
                        } : t)
                };
            }
        // Remove a specific toast or all toasts immediately
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                // Remove all toasts
                return {
                    ...state,
                    toasts: []
                };
            }
            // Remove a specific toast by filtering
            return {
                ...state,
                toasts: state.toasts.filter((t)=>t.id !== action.toastId)
            };
        default:
            return state;
    }
};
// Array to hold listener functions that will be called on state change
const listeners = [];
// The single source of truth for the toast state
let memoryState = {
    toasts: []
};
// Dispatches an action to the reducer and notifies listeners
function dispatch(action) {
    // console.log("Dispatching toast action:", action.type, action); // Optional logging
    memoryState = reducer(memoryState, action);
    // Call all registered listener functions with the new state
    listeners.forEach((listener)=>{
        listener(memoryState);
    });
}
// Function to create and display a new toast
function toast({ ...props }) {
    const id = genId() // Generate a unique ID
    ;
    // Function to update this specific toast
    const update = (props)=>dispatch({
            type: "UPDATE_TOAST",
            toast: {
                ...props,
                id
            }
        });
    // Function to dismiss this specific toast
    const dismiss = ()=>dispatch({
            type: "DISMISS_TOAST",
            toastId: id
        });
    // Dispatch the action to add the new toast to the state
    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            // Callback for when the toast's open state changes (e.g., closed by user)
            onOpenChange: (open)=>{
                if (!open) dismiss() // If closed manually, dismiss it
                ;
            }
        }
    });
    // Return methods to control the toast
    return {
        id: id,
        dismiss,
        update
    };
}
// The custom hook to access toast state and actions
function useToast() {
    // Use React state to trigger re-renders when the memoryState changes
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(memoryState);
    // Register and unregister the setState function as a listener
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        listeners.push(setState); // Add listener on mount
        return ()=>{
            // Remove listener on unmount
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [
        state
    ]) // Re-run effect if state identity changes (shouldn't normally happen)
    ;
    // Return the current state and the toast/dismiss functions
    return {
        ...state,
        toast,
        dismiss: (toastId)=>dispatch({
                type: "DISMISS_TOAST",
                toastId
            })
    };
}
;
}}),
"[project]/src/lib/utils.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "cn": (()=>cn),
    "getQualityColor": (()=>getQualityColor)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-ssr] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
const getQualityColor = (quality)=>{
    switch(quality){
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
}}),
"[project]/src/components/ui/toast.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Toast": (()=>Toast),
    "ToastAction": (()=>ToastAction),
    "ToastClose": (()=>ToastClose),
    "ToastDescription": (()=>ToastDescription),
    "ToastProvider": (()=>ToastProvider),
    "ToastTitle": (()=>ToastTitle),
    "ToastViewport": (()=>ToastViewport)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// src/components/ui/toast.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-toast/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const ToastProvider = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Provider"];
const ToastViewport = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(// Changed default positioning to bottom-0 for mobile
        "fixed bottom-0 z-[100] flex max-h-screen w-full flex-col p-4 sm:bottom-0 sm:right-0 sm:flex-col md:max-w-[420px]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 17,
        columnNumber: 3
    }, this));
ToastViewport.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Viewport"].displayName;
const toastVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cva"])("group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full data-[state=open]:sm:slide-in-from-bottom-full", {
    variants: {
        variant: {
            default: "border bg-background text-foreground",
            destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
        }
    },
    defaultVariants: {
        variant: "default"
    }
});
const Toast = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, variant, ...props }, ref)=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])(toastVariants({
            variant
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 51,
        columnNumber: 5
    }, this);
});
Toast.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Root"].displayName;
const ToastAction = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Action"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 64,
        columnNumber: 3
    }, this));
ToastAction.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Action"].displayName;
const ToastClose = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600", className),
        "toast-close": "",
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
            className: "h-4 w-4"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/toast.tsx",
            lineNumber: 88,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 79,
        columnNumber: 3
    }, this));
ToastClose.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Close"].displayName;
const ToastTitle = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 97,
        columnNumber: 3
    }, this));
ToastTitle.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Title"].displayName;
const ToastDescription = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(({ className, ...props }, ref)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"], {
        ref: ref,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("text-sm opacity-90", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/toast.tsx",
        lineNumber: 109,
        columnNumber: 3
    }, this));
ToastDescription.displayName = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Description"].displayName;
;
}}),
"[project]/src/components/ui/toaster.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Toaster": (()=>Toaster)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
// src/components/ui/toaster.tsx
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-toast.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/toast.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function Toaster() {
    const { toasts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$toast$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useToast"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastProvider"], {
        children: [
            toasts.map(function({ id, title, description, action, ...props }) {
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toast"], {
                    ...props,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-1",
                            children: [
                                title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastTitle"], {
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/toaster.tsx",
                                    lineNumber: 23,
                                    columnNumber: 25
                                }, this),
                                description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastDescription"], {
                                    children: description
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/toaster.tsx",
                                    lineNumber: 25,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ui/toaster.tsx",
                            lineNumber: 22,
                            columnNumber: 13
                        }, this),
                        action,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastClose"], {}, void 0, false, {
                            fileName: "[project]/src/components/ui/toaster.tsx",
                            lineNumber: 29,
                            columnNumber: 13
                        }, this)
                    ]
                }, id, true, {
                    fileName: "[project]/src/components/ui/toaster.tsx",
                    lineNumber: 21,
                    columnNumber: 11
                }, this);
            }),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$toast$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ToastViewport"], {
                className: "fixed bottom-0 z-[100] flex max-h-screen w-full flex-col p-4 sm:bottom-0 sm:right-0 sm:flex-col md:max-w-[420px]"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/toaster.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/toaster.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__db6a3884._.js.map