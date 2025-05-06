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

const basicCreationSchema = baseCharacterSchema.extend({
  creationType: z.literal("basic"),
  class: z.string().min(1, "Class is required.").max(30, "Class name too long (max 30).").default("Adventurer"),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""),
  // Ensure description from text tab is not required here
  description: z.string().optional().transform(val => val || ""),
});

const textCreationSchema = baseCharacterSchema.extend({
  creationType: z.literal("text"),
  description: z.string().min(10, "Please provide a brief description (at least 10 characters)."),
  // Ensure basic fields are not required here if AI fills them
  class: z.string().optional().transform(val => val || "Adventurer"),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""),
});


const combinedSchema = z.discriminatedUnion("creationType", [
  basicCreationSchema,
  textCreationSchema,
]);

type FormData = z.infer<typeof basicCreationSchema> | z.infer<typeof textCreationSchema>;

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
        // If total is not 15, reset to default distribution that sums to 15
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

  const handleStatChange = useCallback((newStats: CharacterStats) => {
    const newRemaining = calculateRemainingPoints(newStats);
    setStats(newStats);
    setRemainingPoints(newRemaining);

    if (newRemaining < 0) {
      setStatError(`${Math.abs(newRemaining)} point(s) over the limit.`);
    } else if (newRemaining > 0) {
      setStatError(`${newRemaining} point(s) remaining.`);
    }
     else {
      setStatError(null);
    }
  }, [calculateRemainingPoints]);

  const currentSchema = creationType === "basic" ? basicCreationSchema : textCreationSchema;

  const { register, handleSubmit, formState: { errors, isValid: formIsValid, isDirty }, reset, watch, setValue, trigger } = useForm<FormData>({
     resolver: zodResolver(currentSchema),
     mode: "onChange",
     defaultValues: {
        creationType: "basic",
        name: state.character?.name ?? "",
        class: state.character?.class ?? "Adventurer",
        traits: state.character?.traits?.join(', ') ?? "",
        knowledge: state.character?.knowledge?.join(', ') ?? "",
        background: state.character?.background ?? "",
        description: state.character?.description ?? state.character?.aiGeneratedDescription ?? "",
     },
   });

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
    while (currentTotal !== TOTAL_STAT_POINTS && safetyNet < 50) { // Increased safety net
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
        // Fallback if distribution fails, ensure it sums to 15
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
            // Prevent infinite loop if all stats are at min/max
            if (allocatedStatKeys.every(k => (diff > 0 && newAllocatedStats[k] === MAX_STAT_VALUE) || (diff < 0 && newAllocatedStats[k] === MIN_STAT_VALUE))) break;
        }
    }


    const finalStats: CharacterStats = {
        ...defaultInitialStats,
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

     reset();

     const name = randomNames[Math.floor(Math.random() * randomNames.length)];
     setValue("name", name, { shouldValidate: true, shouldDirty: true });

     if (creationType === 'basic') {
         const charClass = randomClasses[Math.floor(Math.random() * randomClasses.length)];
         const traits = randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1).join(', ');
         const knowledge = randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1).join(', ');
         const background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
         setValue("creationType", "basic");
         setValue("class", charClass, { shouldValidate: true, shouldDirty: true });
         setValue("traits", traits, { shouldValidate: true, shouldDirty: true });
         setValue("knowledge", knowledge, { shouldValidate: true, shouldDirty: true });
         setValue("background", background, { shouldValidate: true, shouldDirty: true });
         setValue("description", "", { shouldValidate: true, shouldDirty: true });
     } else {
         const description = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
         setValue("creationType", "text");
         setValue("description", description, { shouldValidate: true, shouldDirty: true });
         // When randomizing for text, also set default basic fields which AI might populate later
         setValue("class", "Adventurer", { shouldValidate: true, shouldDirty: true });
         setValue("traits", "", { shouldValidate: true, shouldDirty: true });
         setValue("knowledge", "", { shouldValidate: true, shouldDirty: true });
         setValue("background", "", { shouldValidate: true, shouldDirty: true });
     }

     randomizeStats();

     await new Promise(res => setTimeout(res, 200));
     setIsRandomizing(false);
     setRandomizationComplete(true);
     setTimeout(() => setRandomizationComplete(false), 1000);

     trigger();

 }, [creationType, reset, setValue, randomizeStats, trigger]);


  const handleGenerateDescription = useCallback(async () => {
     await trigger(["name", "description"]);
     const currentDescValue = watch("description");
     const currentName = watch("name");
     const nameError = errors.name;
     const descError = errors.description;

     if (nameError || !currentName?.trim() || (creationType === 'text' && (descError || !currentDescValue || currentDescValue.length < 10))) {
       setError(nameError ? "Name is required." : "Please provide a description (min 10 chars) before generating.");
       return;
     }

     setError(null);
     setIsGenerating(true);
     try {
        const descriptionToProcess = currentDescValue || `A character named ${currentName}.`; // Fallback if description is empty but name exists
        const result: GenerateCharacterDescriptionOutput = await generateCharacterDescription({ characterDescription: descriptionToProcess });

        setValue("description", result.detailedDescription || descriptionToProcess, { shouldValidate: true, shouldDirty: true });
        setValue("class", result.inferredClass || "Adventurer", { shouldValidate: true, shouldDirty: true });
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
   }, [watch, trigger, errors.name, errors.description, setValue, dispatch, toast, creationType]);


  const onSubmit = (data: FormData) => {
     setError(null);

     if (remainingPoints !== 0) {
         setStatError(`Please allocate all ${TOTAL_STAT_POINTS} stat points. ${remainingPoints} points ${remainingPoints > 0 ? 'remaining' : 'over'}.`);
         toast({ title: "Stat Allocation Incomplete", description: `You have ${remainingPoints} points ${remainingPoints > 0 ? 'left to allocate' : 'over the limit'}.`, variant: "destructive"});
         return;
     }
     setStatError(null);

     const finalName = data.name;
     let finalClass = "Adventurer";
     let finalTraits: string[] = [];
     let finalKnowledge: string[] = [];
     let finalBackground = "";
     let finalDescription = "";
     let finalAiGeneratedDescription = state.character?.aiGeneratedDescription;

     if (data.creationType === 'basic') {
         finalClass = data.class || "Adventurer";
         finalTraits = data.traits?.split(',').map((t: string) => t.trim()).filter(Boolean) ?? [];
         finalKnowledge = data.knowledge?.split(',').map((k: string) => k.trim()).filter(Boolean) ?? [];
         finalBackground = data.background ?? "";
         finalDescription = data.description ?? ""; // Can come from AI if basic was populated by AI
     } else { // text creation
         finalDescription = data.description || "";
         finalClass = data.class || "Adventurer"; // This should be populated by AI if "Ask AI" was used
         finalTraits = data.traits?.split(',').map((t: string) => t.trim()).filter(Boolean) ?? [];
         finalKnowledge = data.knowledge?.split(',').map((k: string) => k.trim()).filter(Boolean) ?? [];
         finalBackground = data.background ?? "";
         finalAiGeneratedDescription = finalDescription; // In text mode, the user's description is the AI's source
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
       const newSchema = creationType === 'basic' ? basicCreationSchema : textCreationSchema;
       const currentValues = watch();
       reset(currentValues, {
         keepValues: true,
         keepDirty: true,
         keepErrors: false,
         keepTouched: false,
         keepIsValid: false,
         keepSubmitCount: false,
       });
       setValue("creationType", creationType);
       trigger();
   }, [creationType, reset, watch, setValue, trigger]);

   const watchedFields = watch();
   const formValues = JSON.stringify(watchedFields);

    const isProceedButtonDisabled = useCallback(() => {
        if (isGenerating || isRandomizing) return true;
        if (remainingPoints !== 0) return true; // Must allocate all points
        if (!!statError) return true; // Any stat error (over/under limit from direct input)

        const name = watch("name");
        if (!name?.trim() || !!errors.name) return true;

        if (creationType === 'basic') {
            const charClass = watch("class");
            if (!charClass?.trim() || !!errors.class) return true;
            if (!!errors.traits || !!errors.knowledge || !!errors.background) return true;
        } else { // 'text'
            const description = watch("description");
            if (!description?.trim() || description.length < 10 || !!errors.description) return true;
            // For text mode, class/traits/etc. might be optional if AI is expected to fill them.
            // However, if "Ask AI" wasn't used, they might be empty.
            // Let's assume if "Ask AI" was not used, they might be blank, but that's okay if description is valid.
            // If "Ask AI" *was* used, the zod schema will validate their format if they exist.
        }
        return !formIsValid; // Rely on overall form validity from zod
    }, [isGenerating, isRandomizing, remainingPoints, statError, errors, watch, creationType, formIsValid, formValues]);


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
                    {(error || statError) && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Hold On!</AlertTitle>
                            <AlertDescription>{error || statError}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs value={creationType} onValueChange={(value) => {
                        const newType = value as "basic" | "text";
                        setCreationType(newType);
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Fields</TabsTrigger>
                            <TabsTrigger value="text">Text Description</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50">
                            <BasicCharacterForm register={register as UseFormRegister<any>} errors={errors as FieldErrors<any>} />
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
                             <p className={`text-sm font-medium ${remainingPoints !== 0 ? 'text-destructive' : 'text-green-600'}`}>
                                {remainingPoints < 0 ? (
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" /> {Math.abs(remainingPoints)} point(s) over limit.
                                    </span>
                                ) : remainingPoints > 0 ? (
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