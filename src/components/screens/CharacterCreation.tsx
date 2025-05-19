
// src/components/screens/CharacterCreation.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Wand2, RotateCcw, User, Save, AlertCircle, CheckCircle } from "lucide-react";
import { generateCharacterDescription, type GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { StatAllocationInput } from "@/components/character/StatAllocationInput";
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants";
import type { CharacterStats, Character } from "@/types/character-types";
import { initialCharacterStats as defaultInitialStats } from "@/context/game-initial-state";
import { BasicCharacterForm } from "@/components/character/BasicCharacterForm";
import { TextCharacterForm } from "@/components/character/TextCharacterForm";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "@/components/icons/HandDrawnIcons";

// --- Zod Schema for Validation ---
const baseCharacterSchema = z.object({
  name: z.string().min(1, "Character name is required.").max(50, "Name too long (max 50)."),
});

const commaSeparatedMaxItems = (max: number, message: string) =>
  z.string()
   .transform(val => val === undefined || val === "" ? [] : val.split(',').map(s => s.trim()).filter(Boolean))
   .refine(arr => arr.length <= max, { message })
   .transform(arr => arr.join(', '))
   .optional()
   .transform(val => val || "");

// Class is optional at this base level, will be refined.
const basicCreationSchemaFields = {
  creationType: z.literal("basic"),
  class: z.string().max(30, "Class name too long (max 30).").optional().transform(val => val || ""),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""),
  description: z.string().optional().transform(val => val || ""),
};

const basicCreationSchema = baseCharacterSchema.extend(basicCreationSchemaFields);

const textCreationSchemaFields = {
  creationType: z.literal("text"),
  description: z.string().optional(), // Make description optional here, will refine.
  class: z.string().max(30, "Class name too long (max 30).").optional().transform(val => val || ""),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""),
};
const textCreationSchema = baseCharacterSchema.extend(textCreationSchemaFields);

// This global variable will be set before useForm is called.
// It's a way to pass context (adventureType) into the Zod refinement logic.
let currentGlobalAdventureType: string | null = null;

const combinedSchema = z.discriminatedUnion("creationType", [
  basicCreationSchema,
  textCreationSchema,
]).superRefine((data, ctx) => {
  // Validation for non-Immersed adventures
  if (currentGlobalAdventureType !== "Immersed") {
    if (data.creationType === "basic") {
      if (!data.class || data.class.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Class is required for this adventure type.",
          path: ["class"],
        });
      }
    }
    // For text creation (non-Immersed), description is required
    if (data.creationType === "text") {
        if (!data.description || data.description.trim().length < 10) {
             ctx.addIssue({
                 code: z.ZodIssueCode.custom,
                 message: "Description (min 10 chars) is required for Randomized or Custom adventures.",
                 path: ["description"],
             });
        }
    }
  }
  // For Immersed adventures with text creation, description is optional if character concept is primary.
  // The base schema already makes description optional for text mode, so this refine focuses on non-Immersed.
});

type FormData = z.infer<typeof combinedSchema>;

// --- Component ---
export function CharacterCreation() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [creationType, setCreationType] = useState<"basic" | "text">("basic");

  const calculateRemainingPoints = useCallback((currentStats: CharacterStats): number => {
    const allocatedTotal = currentStats.strength + currentStats.stamina + currentStats.agility;
    return TOTAL_STAT_POINTS - allocatedTotal;
  }, []);

  const [stats, setStats] = useState<CharacterStats>(() => {
    const loadedStats = state.character?.stats;
    const initial = loadedStats ? { ...defaultInitialStats, ...loadedStats } : { ...defaultInitialStats };
    let currentTotal = initial.strength + initial.stamina + initial.agility;

    if (currentTotal !== TOTAL_STAT_POINTS) {
        console.warn(`Initial stats total (${currentTotal}) was not ${TOTAL_STAT_POINTS}. Resetting to default allocation.`);
        return { ...defaultInitialStats };
    }
    return initial;
  });

  const [remainingPoints, setRemainingPoints] = useState<number>(() => calculateRemainingPoints(stats));
  const [statError, setStatError] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [randomizationComplete, setRandomizationComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Set the global adventure type for Zod refinement before useForm
  currentGlobalAdventureType = state.adventureSettings.adventureType;

  const { register, handleSubmit, formState: { errors, isValid: formIsValid, isDirty }, reset, watch, setValue, trigger, getValues } = useForm<FormData>({
     resolver: zodResolver(combinedSchema),
     mode: "onChange", // "onChange" ensures formIsValid updates dynamically
     defaultValues: {
        creationType: "basic",
        name: state.character?.name ?? "",
        // Class is empty for Immersed by default, "Adventurer" otherwise
        class: state.character?.class ?? (state.adventureSettings.adventureType === "Immersed" ? "" : "Adventurer"),
        traits: state.character?.traits?.join(', ') ?? "",
        knowledge: state.character?.knowledge?.join(', ') ?? "",
        background: state.character?.background ?? "",
        description: state.character?.description ?? state.character?.aiGeneratedDescription ?? "",
     },
   });


  const handleStatChange = useCallback((newStats: CharacterStats) => {
    const newRemaining = calculateRemainingPoints(newStats);
    setStats(newStats);
    setRemainingPoints(newRemaining);

    if (newRemaining < 0) {
      setStatError(`${Math.abs(newRemaining)} point(s) over the limit.`);
    } else if (newRemaining > 0) {
      setStatError(`${newRemaining} point(s) remaining.`);
    } else {
      setStatError(null);
    }
    trigger(); // Trigger validation which might depend on stats indirectly
  }, [calculateRemainingPoints, trigger]);


 const randomizeStats = useCallback(() => {
    let pointsLeft = TOTAL_STAT_POINTS;
    const newAllocatedStats: Pick<CharacterStats, 'strength' | 'stamina' | 'agility'> = {
        strength: MIN_STAT_VALUE,
        stamina: MIN_STAT_VALUE,
        agility: MIN_STAT_VALUE,
    };
    pointsLeft -= (MIN_STAT_VALUE * 3);

    const allocatedStatKeys: (keyof typeof newAllocatedStats)[] = ['strength', 'stamina', 'agility'];

    while (pointsLeft > 0) {
        const availableKeys = allocatedStatKeys.filter(key => newAllocatedStats[key] < MAX_STAT_VALUE);
        if (availableKeys.length === 0) break;
        const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        newAllocatedStats[randomKey]++;
        pointsLeft--;
    }

    let currentTotal = newAllocatedStats.strength + newAllocatedStats.stamina + newAllocatedStats.agility;
    let safetyNet = 0;
    while (currentTotal !== TOTAL_STAT_POINTS && safetyNet < 50) {
        if (currentTotal < TOTAL_STAT_POINTS) {
            const availableKeys = allocatedStatKeys.filter(key => newAllocatedStats[key] < MAX_STAT_VALUE);
            if (availableKeys.length === 0) break;
            const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
            newAllocatedStats[randomKey]++;
            currentTotal++;
        } else {
            const availableKeys = allocatedStatKeys.filter(key => newAllocatedStats[key] > MIN_STAT_VALUE);
            if (availableKeys.length === 0) break;
            const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
            newAllocatedStats[randomKey]--;
            currentTotal--;
        }
        safetyNet++;
    }
     if (currentTotal !== TOTAL_STAT_POINTS) {
        console.warn("Stat randomization safety net reached, re-balancing to ensure total 15.");
        let diff = TOTAL_STAT_POINTS - currentTotal;
        while (diff !== 0) {
            const keyToAdjust = allocatedStatKeys[Math.floor(Math.random() * allocatedStatKeys.length)];
            if (diff > 0 && newAllocatedStats[keyToAdjust] < MAX_STAT_VALUE) {
                newAllocatedStats[keyToAdjust]++;
                diff--;
            } else if (diff < 0 && newAllocatedStats[keyToAdjust] > MIN_STAT_VALUE) {
                newAllocatedStats[keyToAdjust]--;
                diff++;
            }
            if (allocatedStatKeys.every(k => (diff > 0 && newAllocatedStats[k] === MAX_STAT_VALUE) || (diff < 0 && newAllocatedStats[k] === MIN_STAT_VALUE))) break;
        }
    }

    const finalStats: CharacterStats = {
        ...defaultInitialStats, // Use the imported renamed initialStats
        ...newAllocatedStats,
    };

    handleStatChange(finalStats);
}, [handleStatChange, defaultInitialStats]);

 const randomizeAll = useCallback(async () => {
     setIsRandomizing(true);
     setRandomizationComplete(false);
     await new Promise(res => setTimeout(res, 300));
     setError(null);

     const randomNames = ["Anya", "Borin", "Carys", "Darian", "Elara", "Fendrel", "Gorok", "Silas", "Lyra", "Roric"];
     const randomClasses = ["Warrior", "Rogue", "Mage", "Scout", "Scholar", "Wanderer", "Guard", "Tinkerer", "Healer", "Bard", "Adventurer"];
     const randomTraitsPool = ["Brave", "Curious", "Cautious", "Impulsive", "Loyal", "Clever", "Resourceful", "Quiet", "Stern", "Generous", "Optimistic", "Pessimistic", "Sarcastic", "Gruff"];
     const randomKnowledgePool = ["Herbalism", "Local Lore", "Survival", "Trading", "Ancient Runes", "Beasts", "Smithing", "First Aid", "Storytelling", "Navigation", "History", "Magic", "Alchemy", "Lockpicking"];
     const randomBackgrounds = ["Farmer", "Orphan", "Noble Exile", "Street Urchin", "Acolyte", "Guard", "Merchant's Child", "Hermit", "Former Soldier", "Wanderer", "Blacksmith Apprentice", "Scribe"];
     const randomDescriptions = [
         "A weary traveler with keen eyes and a rough, patched cloak, seeking forgotten paths.",
         "A cheerful youth from a small village, always eager for adventure, perhaps a bit naively.",
         "A stern-faced individual, marked by a faded scar across their brow, rarely speaking of their past.",
         "A bookish scholar, more comfortable with dusty tomes than drawn swords, muttering about forgotten lore.",
         "A nimble rogue with quick fingers and even quicker wit, always looking for an opportunity.",
         "A wandering healer, carrying herbs and bandages, offering aid to those in need.",
         "A charismatic bard, quick with a song or a story, always seeking an audience.",
         "A stoic warrior, their well-maintained gear hinting at past battles.",
         "A resourceful inventor, always tinkering with strange contraptions.",
         "A quiet hunter, adept at tracking and moving unseen through the wilds.",
     ];

     reset(); // Clear form fields

     const name = randomNames[Math.floor(Math.random() * randomNames.length)];
     setValue("name", name, { shouldValidate: true, shouldDirty: true });

     if (creationType === 'basic') {
         const charClass = state.adventureSettings.adventureType === "Immersed" ? "" : randomClasses[Math.floor(Math.random() * randomClasses.length)];
         const traits = randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1).join(', ');
         const knowledge = randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1).join(', ');
         const background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
         setValue("creationType", "basic");
         setValue("class", charClass, { shouldValidate: true, shouldDirty: true });
         setValue("traits", traits, { shouldValidate: true, shouldDirty: true });
         setValue("knowledge", knowledge, { shouldValidate: true, shouldDirty: true });
         setValue("background", background, { shouldValidate: true, shouldDirty: true });
         setValue("description", "", { shouldValidate: true, shouldDirty: true }); // Clear description for basic random
     } else { // text creation
         const description = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
         setValue("creationType", "text");
         setValue("description", description, { shouldValidate: true, shouldDirty: true });
         // For text mode, even if Immersed, AI can infer from the random description.
         // If not Immersed, these will be picked up if "Ask AI" is not used.
         setValue("class", state.adventureSettings.adventureType === "Immersed" ? "" : "Adventurer", { shouldValidate: true, shouldDirty: true });
         setValue("traits", "", { shouldValidate: true, shouldDirty: true });
         setValue("knowledge", "", { shouldValidate: true, shouldDirty: true });
         setValue("background", "", { shouldValidate: true, shouldDirty: true });
     }

     randomizeStats();

     await new Promise(res => setTimeout(res, 200));
     setIsRandomizing(false);
     setRandomizationComplete(true);
     setTimeout(() => setRandomizationComplete(false), 1000);

     trigger(); // Trigger validation for all fields after randomizing
 }, [creationType, reset, setValue, randomizeStats, trigger, toast, state.adventureSettings.adventureType]);


  const handleGenerateDescription = useCallback(async () => {
     await trigger(["name", "description"]); // Validate relevant fields first
     const currentDescValue = getValues("description"); // Use getValues for latest
     const currentName = getValues("name");
     const nameError = errors.name;
     // For text mode, description needs to be valid if not Immersed, or if Immersed and no player concept.
     const isDescRequired = creationType === 'text' &&
                           (state.adventureSettings.adventureType !== "Immersed" ||
                           (state.adventureSettings.adventureType === "Immersed" && !state.adventureSettings.playerCharacterConcept?.trim()));

     if (nameError || !currentName?.trim() || (isDescRequired && (!currentDescValue || currentDescValue.length < 10 || !!errors.description))) {
       setError(nameError ? "Name is required." : "Please provide a description (min 10 chars) before generating.");
       toast({ title: "Input Required", description: nameError ? "Name is required." : "A description of at least 10 characters is needed.", variant: "destructive" });
       return;
     }

     setError(null);
     setIsGenerating(true);
     try {
        // Use character concept for Immersed if description is empty, otherwise use description.
        let descriptionToProcess = currentDescValue || "";
        if (state.adventureSettings.adventureType === "Immersed" && !descriptionToProcess.trim() && state.adventureSettings.playerCharacterConcept?.trim()) {
            descriptionToProcess = `Character concept: ${state.adventureSettings.playerCharacterConcept} for the universe of ${state.adventureSettings.universeName || 'a specified universe'}. Their name is ${currentName}.`;
        } else if (!descriptionToProcess.trim()) {
            descriptionToProcess = `A character named ${currentName}.`; // Fallback
        }


        const result: GenerateCharacterDescriptionOutput = await generateCharacterDescription({ characterDescription: descriptionToProcess });

        setValue("description", result.detailedDescription || descriptionToProcess, { shouldValidate: true, shouldDirty: true });
        setValue("class", result.inferredClass || (state.adventureSettings.adventureType === "Immersed" ? "" : "Adventurer"), { shouldValidate: true, shouldDirty: true });
        setValue("traits", (result.inferredTraits && result.inferredTraits.length > 0) ? result.inferredTraits.join(', ') : "", { shouldValidate: true, shouldDirty: true });
        setValue("knowledge", (result.inferredKnowledge && result.inferredKnowledge.length > 0) ? result.inferredKnowledge.join(', ') : "", { shouldValidate: true, shouldDirty: true });
        setValue("background", result.inferredBackground || "", { shouldValidate: true, shouldDirty: true });

        dispatch({ type: "SET_AI_DESCRIPTION", payload: result.detailedDescription });
        toast({ title: "AI Profile Generated!", description: "Character details have been updated based on the description.", duration: 4000});
        trigger(); // Retrigger validation for all fields
     } catch (err) {
       console.error("AI generation failed:", err);
       setError("Failed to generate description or infer details. The AI might be busy or encountered an error. Please try again later.");
       toast({ title: "AI Generation Failed", description: "Could not process the description.", variant: "destructive" });
     } finally {
       setIsGenerating(false);
     }
   }, [getValues, trigger, errors.name, errors.description, setValue, dispatch, toast, creationType, state.adventureSettings.adventureType, state.adventureSettings.playerCharacterConcept, state.adventureSettings.universeName]);


  const onSubmit = (data: FormData) => {
     setError(null);

     if (remainingPoints !== 0) {
         setStatError(`Please allocate all ${TOTAL_STAT_POINTS} stat points. ${remainingPoints} point(s) ${remainingPoints > 0 ? 'remaining' : 'over'}.`);
         toast({ title: "Stat Allocation Incomplete", description: `You have ${remainingPoints} points ${remainingPoints > 0 ? 'left to allocate' : 'over the limit'}.`, variant: "destructive"});
         return;
     }
     setStatError(null);

     // SuperRefine should have caught this, but double-check for safety
     if (state.adventureSettings.adventureType !== "Immersed" && data.creationType === "basic" && (!data.class || data.class.trim() === "")) {
        setError("Class is required. Please select or enter a class.");
        toast({ title: "Class Required", description: "Please enter a class for your character.", variant: "destructive" });
        return;
     }
     if (state.adventureSettings.adventureType !== "Immersed" && data.creationType === "text" && (!data.description || data.description.trim().length < 10 )) {
        setError("Description (min 10 chars) is required for this adventure type.");
        toast({ title: "Description Required", description: "Please provide a character description (min 10 chars).", variant: "destructive" });
        return;
     }


     const finalName = data.name;
     let finalClass = data.class || ""; // Will be empty if Immersed + Basic
     if (state.adventureSettings.adventureType === "Immersed") {
        finalClass = data.class || ""; // Keep it potentially empty for Immersed, AI might use concept.
     } else {
        finalClass = data.class || "Adventurer"; // Default for non-Immersed if somehow empty
     }

     let finalTraits: string[] = data.traits?.split(',').map((t: string) => t.trim()).filter(Boolean) ?? [];
     let finalKnowledge: string[] = data.knowledge?.split(',').map((k: string) => k.trim()).filter(Boolean) ?? [];
     let finalBackground = data.background ?? "";
     let finalDescription = data.description ?? "";
     let finalAiGeneratedDescription = state.character?.aiGeneratedDescription;

     // If text creation was used and AI generated the description, use that.
     if (data.creationType === "text" && isGenerating) { // Check if AI was just used
         finalAiGeneratedDescription = data.description; // The detailed description is now in data.description
     } else if (data.creationType === "text") {
         finalDescription = data.description ?? ""; // User's direct input
     }


     const characterData: Partial<Character> = {
         name: finalName,
         class: finalClass,
         description: finalDescription,
         traits: finalTraits,
         knowledge: finalKnowledge,
         background: finalBackground,
         stats: stats,
         aiGeneratedDescription: finalAiGeneratedDescription,
     };

     dispatch({ type: "CREATE_CHARACTER_AND_SETUP", payload: characterData });
     toast({ title: "Character Created!", description: `Welcome, ${characterData.name}. Prepare your adventure!` });
   };

   useEffect(() => {
       currentGlobalAdventureType = state.adventureSettings.adventureType;
       const currentValues = getValues(); // Get all current form values
       reset( // Reset with current values to re-apply defaults or existing state
         {
           ...currentValues,
           creationType: creationType, // Ensure creationType is correctly set
           // Adjust class default if adventureType changed
           class: currentValues.class || (state.adventureSettings.adventureType === "Immersed" ? "" : "Adventurer"),
         },
         {
           keepValues: false, // false to re-evaluate defaults based on new adventureType
           keepDirty: true,
           keepErrors: false, // Clear errors to re-validate with potentially new schema context
           keepTouched: false,
           keepIsValid: false,
           keepSubmitCount: false,
         }
       );
       trigger(); // Trigger validation after reset, especially if adventureType changed
   }, [creationType, state.adventureSettings.adventureType, reset, getValues, setValue, trigger]);


   const watchedFields = watch(); // For re-evaluating isProceedButtonDisabled
   const formValues = JSON.stringify(watchedFields); // For dependency array

    const isProceedButtonDisabled = useCallback(() => {
        if (isGenerating || isRandomizing) return true;
        if (remainingPoints !== 0) return true;
        if (!!statError) return true;

        const name = watch("name");
        if (!name?.trim()) return true; // Quick check for name

        // `formIsValid` from Zod resolver, which uses `superRefine` with `currentGlobalAdventureType`
        return !formIsValid;
    }, [isGenerating, isRandomizing, remainingPoints, statError, watch, formIsValid, formValues, currentGlobalAdventureType]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl">
            <CardboardCard className="shadow-xl border-2 border-foreground/20">
                <CardHeader className="border-b border-foreground/10 pb-4">
                    <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
                        <User className="w-7 h-7" /> Create Your Adventurer
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {(error) && ( // Only show general error here, statError is near stats
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Hold On!</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs value={creationType} onValueChange={(value) => {
                        const newType = value as "basic" | "text";
                        setCreationType(newType);
                        setValue("creationType", newType); // Update RHF state for discriminated union
                        trigger(); // Re-validate when tab changes
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Fields</TabsTrigger>
                            <TabsTrigger value="text">Text Description</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50">
                            <BasicCharacterForm
                                register={register as UseFormRegister<any>}
                                errors={errors as FieldErrors<any>}
                                adventureType={state.adventureSettings.adventureType}
                            />
                        </TabsContent>

                        <TabsContent value="text" className="space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50">
                            <TextCharacterForm
                                register={register as UseFormRegister<any>}
                                errors={errors as FieldErrors<any>}
                                onGenerateDescription={handleGenerateDescription}
                                isGenerating={isGenerating}
                                watchedName={watch("name")}
                                watchedDescription={watch("description")}
                            />
                        </TabsContent>
                    </Tabs>

                    <Separator />
                     <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                            <h3 className="text-xl font-semibold">Allocate Stats ({stats.strength + stats.stamina + stats.agility} / {TOTAL_STAT_POINTS} Total Points)</h3>
                             <p className={`text-sm font-medium ${remainingPoints !== 0 || statError ? 'text-destructive' : 'text-green-600'}`}>
                                {statError ? (
                                     <span className="flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" /> {statError}
                                     </span>
                                ) : remainingPoints !== 0 ? (
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" /> {remainingPoints} point(s) remaining.
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-green-600">
                                        <CheckCircle className="h-4 w-4" /> All points allocated!
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatAllocationInput
                                label="Strength"
                                statKey="strength"
                                value={stats.strength}
                                onChange={(key, val) => handleStatChange({...stats, [key]: val})}
                                Icon={HandDrawnStrengthIcon}
                                disabled={isGenerating || isRandomizing}
                                remainingPoints={remainingPoints}
                            />
                            <StatAllocationInput
                                label="Stamina"
                                statKey="stamina"
                                value={stats.stamina}
                                onChange={(key, val) => handleStatChange({...stats, [key]: val})}
                                Icon={HandDrawnStaminaIcon}
                                disabled={isGenerating || isRandomizing}
                                remainingPoints={remainingPoints}
                            />
                            <StatAllocationInput
                                label="Agility"
                                statKey="agility"
                                value={stats.agility}
                                onChange={(key, val) => handleStatChange({...stats, [key]: val})}
                                Icon={HandDrawnAgilityIcon}
                                disabled={isGenerating || isRandomizing}
                                remainingPoints={remainingPoints}
                            />
                        </div>
                        <div className="text-sm text-muted-foreground grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                            <span>Intellect: {stats.intellect}</span>
                            <span>Wisdom: {stats.wisdom}</span>
                            <span>Charisma: {stats.charisma}</span>
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-foreground/10">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    onClick={randomizeAll}
                                    variant="secondary"
                                    aria-label="Randomize All Character Fields and Stats"
                                    className="relative overflow-hidden w-full sm:w-auto"
                                    disabled={isRandomizing || isGenerating}
                                >
                                    <RotateCcw className={`mr-2 h-4 w-4 ${isRandomizing ? 'animate-spin' : ''}`} />
                                    {isRandomizing ? 'Randomizing...' : 'Randomize Everything'}
                                    <CheckCircle className={`absolute right-2 h-4 w-4 text-green-500 transition-opacity duration-500 ${randomizationComplete ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: randomizationComplete ? '300ms' : '0ms' }} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Generate a completely random character based on the selected creation type.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <Button
                        type="submit"
                        className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
                        disabled={isProceedButtonDisabled()}
                        aria-label="Save character and proceed to adventure setup"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Proceed to Adventure Setup
                    </Button>
                </CardFooter>
            </CardboardCard>
        </form>
    </div>
  );
}

    