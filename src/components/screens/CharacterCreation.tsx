// src/components/screens/CharacterCreation.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
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
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants"; // Import from constants file
import type { CharacterStats, Character } from "@/types/character-types"; // Import from specific types file
import { initialCharacterStats as defaultInitialStats } from "@/context/game-initial-state"; // Corrected import
import { BasicCharacterForm } from "@/components/character/BasicCharacterForm";
import { TextCharacterForm } from "@/components/character/TextCharacterForm";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "@/components/icons/HandDrawnIcons"; // Import stat icons


// --- Zod Schema for Validation ---
const baseCharacterSchema = z.object({
  name: z.string().min(1, "Character name is required.").max(50, "Name too long (max 50)."),
});

// Helper for comma-separated strings with max item validation
const commaSeparatedMaxItems = (max: number, message: string) =>
  z.string()
   .transform(val => val === undefined || val === "" ? [] : val.split(',').map(s => s.trim()).filter(Boolean)) // Transform to array first
   .refine(arr => arr.length <= max, { message }) // Validate array length
   .transform(arr => arr.join(', ')) // Transform back to string for form state if needed
   .optional()
   .transform(val => val || ""); // Ensure empty string if optional and not provided

const basicCreationSchema = baseCharacterSchema.extend({
  creationType: z.literal("basic"),
  class: z.string().min(1, "Class is required.").max(30, "Class name too long (max 30).").default("Adventurer"),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""),
});

const textCreationSchema = baseCharacterSchema.extend({
  creationType: z.literal("text"),
  description: z.string().min(10, "Please provide a brief description (at least 10 characters)."),
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

  // --- Stat Allocation Logic ---
  const calculateRemainingPoints = useCallback((currentStats: CharacterStats): number => {
    const allocatedTotal = currentStats.strength + currentStats.stamina + currentStats.agility;
    return TOTAL_STAT_POINTS - allocatedTotal;
  }, []);

  const [stats, setStats] = useState<CharacterStats>(() => {
    const loadedStats = state.character?.stats;
    const initial = loadedStats ? { ...defaultInitialStats, ...loadedStats } : { ...defaultInitialStats };
    let currentTotal = initial.strength + initial.stamina + initial.agility;
    if (currentTotal > TOTAL_STAT_POINTS) {
        console.warn("Loaded stats exceeded total points, resetting to default.");
        return { ...defaultInitialStats };
    }
    return initial;
  });


  const [remainingPoints, setRemainingPoints] = useState<number>(() => calculateRemainingPoints(stats));
  const [statError, setStatError] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [randomizationComplete, setRandomizationComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null); // General error

  // Centralized handler for stat changes
 const handleStatChange = useCallback((newStats: CharacterStats) => {
    const newRemaining = calculateRemainingPoints(newStats);
    setStats(newStats);
    setRemainingPoints(newRemaining);

    if (newRemaining < 0) {
      setStatError(`${Math.abs(newRemaining)} point(s) over the limit.`);
    } else {
      setStatError(null);
    }
  }, [calculateRemainingPoints]);


  // Determine the current schema based on the selected tab
  const currentSchema = creationType === "basic" ? basicCreationSchema : textCreationSchema;

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, trigger } = useForm<FormData>({
     resolver: zodResolver(currentSchema),
     mode: "onChange", // Trigger validation on change
     defaultValues: {
        creationType: "basic",
        name: state.character?.name ?? "",
        class: state.character?.class ?? "Adventurer",
        traits: state.character?.traits?.join(', ') ?? "",
        knowledge: state.character?.knowledge?.join(', ') ?? "",
        background: state.character?.background ?? "",
        description: state.character?.description ?? state.character?.aiGeneratedDescription ?? "", // Use main description, fallback to AI
     },
   });

 // --- Randomize All ---
 const randomizeStats = useCallback(() => {
    let pointsLeft = TOTAL_STAT_POINTS;
    let newAllocatedStats: Pick<CharacterStats, 'strength' | 'stamina' | 'agility'> = {
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
     while (currentTotal !== TOTAL_STAT_POINTS && safetyNet < 20) {
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

    const finalStats: CharacterStats = {
        ...defaultInitialStats, 
        ...newAllocatedStats,
    };

    handleStatChange(finalStats); 
}, [handleStatChange, defaultInitialStats]); // Added defaultInitialStats to dependencies

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
     setValue("name", name);

     if (creationType === 'basic') {
         const charClass = randomClasses[Math.floor(Math.random() * randomClasses.length)];
         const traits = randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1).join(', ');
         const knowledge = randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1).join(', ');
         const background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
         setValue("creationType", "basic");
         setValue("class", charClass);
         setValue("traits", traits);
         setValue("knowledge", knowledge);
         setValue("background", background);
         setValue("description", ""); 
     } else {
         const description = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
         setValue("creationType", "text");
         setValue("description", description);
         setValue("class", "Adventurer");
         setValue("traits", "");
         setValue("knowledge", "");
         setValue("background", "");
     }

     randomizeStats(); 

     await new Promise(res => setTimeout(res, 200)); 
     setIsRandomizing(false); 
     setRandomizationComplete(true); 
     setTimeout(() => setRandomizationComplete(false), 1000); 


     trigger(); 

 }, [creationType, reset, setValue, randomizeStats, toast, trigger]);


  // --- AI Description Generation ---
 const handleGenerateDescription = useCallback(async () => {
     await trigger(["name", "description"]); 
     const currentDescValue = watch("description");
     const currentName = watch("name");
     const nameError = errors.name;
     const descError = errors.description;

     if (nameError || descError || !currentDescValue || currentDescValue.length < 10) {
       setError("Please provide a valid name and description (min 10 chars) before generating.");
       return;
     }

     setError(null);
     setIsGenerating(true);
     try {
        console.log("Calling generateCharacterDescription with:", currentDescValue);
        const result: GenerateCharacterDescriptionOutput = await generateCharacterDescription({ characterDescription: currentDescValue });
        console.log("AI Result:", result);

         setValue("description", result.detailedDescription || currentDescValue, { shouldValidate: true, shouldDirty: true });

         setValue("class", result.inferredClass || "Adventurer", { shouldValidate: true, shouldDirty: true });
         setValue("traits", (result.inferredTraits && result.inferredTraits.length > 0) ? result.inferredTraits.join(', ') : "", { shouldValidate: true, shouldDirty: true });
         setValue("knowledge", (result.inferredKnowledge && result.inferredKnowledge.length > 0) ? result.inferredKnowledge.join(', ') : "", { shouldValidate: true, shouldDirty: true });
         setValue("background", result.inferredBackground || "", { shouldValidate: true, shouldDirty: true });

         dispatch({ type: "SET_AI_DESCRIPTION", payload: result.detailedDescription });

         setTimeout(() => {
            trigger(["class", "traits", "knowledge", "background", "description"]);
          }, 0); 

     } catch (err) {
       console.error("AI generation failed:", err);
       setError("Failed to generate description or infer details. The AI might be busy or encountered an error. Please try again later.");
     } finally {
       setIsGenerating(false);
     }
   }, [watch, trigger, errors.name, errors.description, setValue, dispatch]);


  // --- Form Submission ---
  const onSubmit = (data: FormData) => {
     setError(null); 

     const finalAllocatedTotal = stats.strength + stats.stamina + stats.agility;
     if (finalAllocatedTotal !== TOTAL_STAT_POINTS) {
         setStatError(`Total points must be exactly ${TOTAL_STAT_POINTS} (currently ${finalAllocatedTotal}). Please adjust.`);
         return;
     }
     if (Object.entries(stats).some(([key, val]) => ['strength', 'stamina', 'agility'].includes(key) && (val < MIN_STAT_VALUE || val > MAX_STAT_VALUE))) {
         setStatError(`Allocatable stats (STR, STA, AGI) must be between ${MIN_STAT_VALUE} and ${MAX_STAT_VALUE}.`);
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

     if (creationType === 'basic') {
         const basicData = data as z.infer<typeof basicCreationSchema>;
         finalClass = basicData.class || "Adventurer";
         finalTraits = basicData.traits?.split(',').map((t: string) => t.trim()).filter(Boolean) ?? [];
         finalKnowledge = basicData.knowledge?.split(',').map((k: string) => k.trim()).filter(Boolean) ?? [];
         finalBackground = basicData.background ?? "";
         finalDescription = watch("description") || ""; 
     } else { 
          const textData = data as z.infer<typeof textCreationSchema>;
         finalDescription = textData.description || ""; 
         finalClass = watch("class") || "Adventurer";
         finalTraits = watch("traits")?.split(',').map((t: string) => t.trim()).filter(Boolean) ?? [];
         finalKnowledge = watch("knowledge")?.split(',').map((k: string) => k.trim()).filter(Boolean) ?? [];
         finalBackground = watch("background") ?? "";
         finalAiGeneratedDescription = finalDescription; 
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

     console.log("Dispatching CREATE_CHARACTER_AND_SETUP with payload:", characterData);
     dispatch({ type: "CREATE_CHARACTER_AND_SETUP", payload: characterData });
     toast({ title: "Character Created!", description: `Welcome, ${characterData.name}. Prepare your adventure!` });

   };


  // --- Effects ---
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

   // --- Calculate if proceed button should be disabled ---
    const isProceedDisabled = useCallback(() => {
        const hasNameError = !!errors.name;
        const hasStatErrorCondition = !!statError; 
        const hasRemainingPointsError = remainingPoints !== 0;

        let typeSpecificError = false;

        if (creationType === 'basic') {
            const basicData = watch() as z.infer<typeof basicCreationSchema>;
            const basicErrors = errors as FieldErrors<z.infer<typeof basicCreationSchema>>;
            typeSpecificError = !!basicErrors.class || !!basicErrors.traits || !!basicErrors.knowledge || !!basicErrors.background;
            if (!typeSpecificError && !basicData.class) typeSpecificError = true; // Check if class is empty and no error
        } else { // creationType === 'text'
            const textData = watch() as z.infer<typeof textCreationSchema>;
            const textErrors = errors as FieldErrors<z.infer<typeof textCreationSchema>>;
            typeSpecificError = !!textErrors.description;
            if (!typeSpecificError && (!textData.description || textData.description.length < 10)) typeSpecificError = true;
        }

         if (!errors.name && !watch("name")) {
             typeSpecificError = true;
         }

         const finalDisabledState =
            isGenerating ||
            isRandomizing ||
            hasStatErrorCondition ||
            hasRemainingPointsError ||
            hasNameError ||
            typeSpecificError;

        return finalDisabledState;
    }, [
        isGenerating, isRandomizing, statError, remainingPoints, errors, creationType, formValues, watch
    ]);


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
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Hold On!</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* --- Creation Type Tabs --- */}
                    <Tabs value={creationType} onValueChange={(value) => {
                        const newType = value as "basic" | "text";
                        setCreationType(newType);
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Fields</TabsTrigger>
                            <TabsTrigger value="text">Text Description</TabsTrigger>
                        </TabsList>

                        {/* --- Basic Creation Content --- */}
                        <TabsContent value="basic" className="space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50">
                            <BasicCharacterForm register={register as UseFormRegister<any>} errors={errors as FieldErrors<any>} />
                        </TabsContent>

                        {/* --- Text-Based Creation Content --- */}
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

                    {/* --- Stat Allocation --- */}
                    <Separator />
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                            <h3 className="text-xl font-semibold">Allocate Stats ({stats.strength + stats.stamina + stats.agility} / {TOTAL_STAT_POINTS} Total Points)</h3>
                            <p className={`text-sm font-medium ${statError ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {statError ? (
                                    <span className="flex items-center gap-1 text-destructive">
                                        <AlertCircle className="h-4 w-4" /> {statError}
                                    </span>
                                ) : (remainingPoints === 0 ? "All points allocated!" : `${remainingPoints} points remaining.`)}
                            </p>
                        </div>

                        {/* Stat Inputs (Grid) */}
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
                        {/* Display non-adjustable stats */}
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
                        disabled={isProceedDisabled()}
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
