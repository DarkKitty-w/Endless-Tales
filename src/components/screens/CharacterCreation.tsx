
// src/components/screens/CharacterCreation.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Wand2, RotateCcw, User, Save, AlertCircle, CheckCircle, LogOut } from "lucide-react";
import { generateCharacterDescription, type GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { StatAllocationInput } from "@/components/character/StatAllocationInput";
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants";
import type { CharacterStats, Character } from "@/types/character-types";
import { initialCharacterState, initialCharacterStats as defaultInitialStats } from "@/context/game-initial-state";
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
  description: z.string().optional(),
  class: z.string().max(30, "Class name too long (max 30).").optional().transform(val => val || ""),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""),
};
const textCreationSchema = baseCharacterSchema.extend(textCreationSchemaFields);

let currentGlobalAdventureType: string | null = null;

const combinedSchema = z.discriminatedUnion("creationType", [
  basicCreationSchema,
  textCreationSchema,
]).superRefine((data, ctx) => {
  const currentAdventureTypeForValidation = currentGlobalAdventureType;
  console.log("Zod superRefine - currentGlobalAdventureType:", currentAdventureTypeForValidation, "Data:", data);

  if (currentAdventureTypeForValidation !== "Immersed") {
    if (data.creationType === "basic") {
      if (!data.class || data.class.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Class is required for this adventure type.",
          path: ["class"],
        });
      }
    }
    if (data.creationType === "text") {
        if (!data.description || data.description.trim().length < 10) {
             ctx.addIssue({
                 code: z.ZodIssueCode.custom,
                 message: "Description (min 10 chars) is required for AI profile generation when not in Immersed mode.",
                 path: ["description"],
             });
        }
    }
  }
});

type FormData = z.infer<typeof combinedSchema>;

const staticDefaultValues: Partial<FormData> = {
    creationType: "basic",
    name: "",
    class: "",
    traits: "",
    knowledge: "",
    background: "",
    description: "",
};


export function CharacterCreation() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [creationType, setCreationType] = useState<"basic" | "text">("basic");

  const calculateRemainingPoints = useCallback((currentStats: CharacterStats): number => {
    const allocatedTotal = currentStats.strength + currentStats.stamina + currentStats.agility;
    return TOTAL_STAT_POINTS - allocatedTotal;
  }, []);

  const [stats, setStats] = useState<CharacterStats>(() => {
    const characterStats = state.character?.stats;
    const initial = characterStats ? { ...defaultInitialStats, ...characterStats } : { ...defaultInitialStats };
     if (initial.strength + initial.stamina + initial.agility > TOTAL_STAT_POINTS ||
         initial.strength < MIN_STAT_VALUE || initial.stamina < MIN_STAT_VALUE || initial.agility < MIN_STAT_VALUE ) {
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

  const { register, handleSubmit, formState, reset, watch, setValue, trigger, getValues } = useForm<FormData>({
     resolver: zodResolver(combinedSchema),
     mode: "onChange",
     defaultValues: staticDefaultValues
   });
   const { errors, isValid: formIsValid, isDirty } = formState;

  useEffect(() => {
    console.log("CharacterCreation: useEffect for form reset. adventureType:", state.adventureSettings.adventureType, "creationType:", creationType, "Character from context:", state.character);
    const adventureType = state.adventureSettings?.adventureType;
    const characterOrigin = state.adventureSettings?.characterOriginType;
    const character = state.character;
    const currentFormValues = getValues();

    const newFormValues: Partial<FormData> = {
      creationType: currentFormValues.creationType || creationType,
      name: character?.name ?? currentFormValues.name ?? "",
      class: (adventureType === "Immersed" || characterOrigin === 'existing') ? "" : (character?.class || currentFormValues.class || (currentFormValues.creationType === "basic" || creationType === "basic" ? "Adventurer" : "")),
      traits: character?.traits?.join(', ') ?? currentFormValues.traits ?? "",
      knowledge: character?.knowledge?.join(', ') ?? currentFormValues.knowledge ?? "",
      background: character?.background ?? currentFormValues.background ?? "",
      description: character?.description ?? character?.aiGeneratedDescription ?? currentFormValues.description ?? "",
    };

    console.log("CharacterCreation: Resetting form with values:", newFormValues);
    reset(newFormValues, { keepDirty: isDirty, keepValues: true });

    if (currentGlobalAdventureType !== adventureType) {
        currentGlobalAdventureType = adventureType;
        trigger();
    }

  }, [state.character, state.adventureSettings.adventureType, state.adventureSettings.characterOriginType, creationType, reset, getValues, trigger, isDirty]);


   useEffect(() => {
     const newAdventureType = state.adventureSettings.adventureType;
     const currentClassValue = getValues("class");
     const currentCreationTypeValue = watch("creationType") || creationType;

     if (currentGlobalAdventureType !== newAdventureType) {
         currentGlobalAdventureType = newAdventureType;
         if (newAdventureType === "Immersed") {
             if (currentClassValue !== "") {
                 setValue("class", "", { shouldValidate: true, shouldDirty: isDirty });
             }
         } else {
             if (!currentClassValue && currentCreationTypeValue === "basic") {
                 setValue("class", "Adventurer", { shouldValidate: true, shouldDirty: isDirty });
             }
         }
         trigger();
     }
   }, [state.adventureSettings.adventureType, creationType, setValue, getValues, trigger, watch, isDirty]);

  const handleStatChange = useCallback((newStats: CharacterStats) => {
    const newRemaining = calculateRemainingPoints(newStats);
    setStats(newStats);
    setRemainingPoints(newRemaining);

    if (newRemaining < 0) setStatError(`${Math.abs(newRemaining)} point(s) over limit.`);
    else if (newRemaining > 0) setStatError(`${newRemaining} point(s) remaining.`);
    else setStatError(null);
    trigger();
  }, [calculateRemainingPoints, trigger]);

  const randomizeStats = useCallback(() => {
    let pointsLeft = TOTAL_STAT_POINTS;
    const newAllocatedStats: Pick<CharacterStats, 'strength' | 'stamina' | 'agility'> = { strength: MIN_STAT_VALUE, stamina: MIN_STAT_VALUE, agility: MIN_STAT_VALUE };
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
    if (currentTotal !== TOTAL_STAT_POINTS) {
        let diff = TOTAL_STAT_POINTS - currentTotal;
        const sortedByVal = allocatedStatKeys.sort((a, b) => newAllocatedStats[a] - newAllocatedStats[b]);

        while (diff !== 0 && sortedByVal.length > 0) {
            const keyToAdjust = diff > 0 ? sortedByVal[0] : sortedByVal[sortedByVal.length - 1];
            const change = Math.sign(diff);

            if ((change > 0 && newAllocatedStats[keyToAdjust] < MAX_STAT_VALUE) || (change < 0 && newAllocatedStats[keyToAdjust] > MIN_STAT_VALUE)) {
                newAllocatedStats[keyToAdjust] += change;
                diff -= change;
            } else {
                if (diff > 0) sortedByVal.shift();
                else sortedByVal.pop();
            }
        }
    }
    const finalStats: CharacterStats = { ...defaultInitialStats, ...newAllocatedStats };
    handleStatChange(finalStats);
  }, [handleStatChange]);

 const randomizeAll = useCallback(async () => {
     setIsRandomizing(true);
     setRandomizationComplete(false);
     await new Promise(res => setTimeout(res, 300));
     setError(null);
     const randomNames = ["Anya", "Borin", "Carys", "Darian", "Elara", "Fendrel", "Gorok", "Silas", "Lyra", "Roric"];
     const randomClasses = ["Warrior", "Rogue", "Mage", "Scout", "Scholar", "Wanderer", "Guard", "Tinkerer", "Healer", "Bard", "Adventurer"];
     const randomTraitsPool = ["Brave", "Curious", "Cautious", "Impulsive", "Loyal", "Clever", "Resourceful", "Quiet", "Stern", "Generous"];
     const randomKnowledgePool = ["Herbalism", "Local Lore", "Survival", "Trading", "Ancient Runes", "Beasts", "Smithing", "First Aid"];
     const randomBackgrounds = ["Farmer", "Orphan", "Noble Exile", "Street Urchin", "Acolyte", "Guard", "Merchant's Child", "Hermit"];
     const randomDescriptions = [
         "A weary traveler, eyes sharp, cloak patched, seeking forgotten paths.",
         "A cheerful youth from a small village, naive but eager for adventure.",
         "A stern individual with a faded scar, silent about their past.",
         "A scholar obsessed with forgotten lore, carrying a satchel full of ancient texts.",
         "A skilled artisan, hands calloused but deft, always ready to craft or repair."
     ];

     const currentCreationTypeForRandom = watch("creationType") || creationType;
     const name = randomNames[Math.floor(Math.random() * randomNames.length)];
     const adventureType = state.adventureSettings.adventureType;
     const characterOrigin = state.adventureSettings.characterOriginType;

     const defaultDataForReset: Partial<FormData> = {
        creationType: currentCreationTypeForRandom,
        name: name,
        class: "", traits: "", knowledge: "", background: "", description: ""
     };

     if (currentCreationTypeForRandom === 'basic') {
         defaultDataForReset.class = (adventureType === "Immersed" || characterOrigin === 'existing') ? "" : randomClasses[Math.floor(Math.random() * randomClasses.length)];
         defaultDataForReset.traits = randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1).join(', ');
         defaultDataForReset.knowledge = randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1).join(', ');
         defaultDataForReset.background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
     } else { // Text-based
         let desc = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
         if (adventureType === "Immersed") {
             desc = `Concept: A ${randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)]} in the ${state.adventureSettings.universeName || 'chosen universe'}. Name: ${name}.`;
         }
         defaultDataForReset.description = desc;
         defaultDataForReset.class = (adventureType === "Immersed" || characterOrigin === 'existing') ? "" : "Adventurer";
     }
     reset(defaultDataForReset as FormData);
     randomizeStats();
     await new Promise(res => setTimeout(res, 200));
     setIsRandomizing(false);
     setRandomizationComplete(true);
     setTimeout(() => setRandomizationComplete(false), 1000);
     trigger();
 }, [creationType, reset, randomizeStats, trigger, state.adventureSettings.adventureType, state.adventureSettings.universeName, state.adventureSettings.characterOriginType, watch]);

  const handleGenerateDescription = useCallback(async () => {
     await trigger(["name", "description"]);
     const currentDescValue = getValues("description");
     const currentName = getValues("name");
     const currentAdventureType = state.adventureSettings.adventureType;
     const playerConcept = state.adventureSettings.playerCharacterConcept;
     const universeName = state.adventureSettings.universeName;

     let descriptionToUseForAI = currentDescValue || "";
     let contextForAIInput = {
         characterDescription: descriptionToUseForAI,
         isImmersedMode: currentAdventureType === "Immersed",
         universeName: currentAdventureType === "Immersed" ? universeName : undefined,
         playerCharacterConcept: currentAdventureType === "Immersed" ? playerConcept : undefined,
     };

     if (!currentName?.trim()) {
         toast({ title: "Name Required", description: "Please enter a character name.", variant: "destructive" });
         return;
     }

     if (currentAdventureType === "Immersed") {
         if ((!currentDescValue || currentDescValue.length < 10) && playerConcept?.trim()) {
            contextForAIInput.characterDescription = playerConcept;
         } else if (!currentDescValue || currentDescValue.length < 10) {
             toast({ title: "Input Required", description: "For Immersed AI profile, please provide a character description (min 10 chars) or ensure a Character Concept is set in Adventure Setup.", variant: "destructive" });
             return;
         }
     } else {
         if (!currentDescValue || currentDescValue.length < 10) {
             toast({ title: "Description Required", description: "Description (min 10 chars) required for AI profile.", variant: "destructive" });
             return;
         }
     }

     setError(null);
     setIsGenerating(true);
     try {
        const result: GenerateCharacterDescriptionOutput = await generateCharacterDescription(contextForAIInput);
        setValue("description", result.detailedDescription || descriptionToUseForAI, { shouldValidate: true, shouldDirty: true });
        const inferredClass = result.inferredClass || (currentAdventureType === "Immersed" ? "" : "Adventurer");
        setValue("class", (currentAdventureType === "Immersed" && state.adventureSettings.characterOriginType === 'existing') ? "" : inferredClass, { shouldValidate: true, shouldDirty: true });
        setValue("traits", (result.inferredTraits?.join(', ')) || "", { shouldValidate: true, shouldDirty: true });
        setValue("knowledge", (result.inferredKnowledge?.join(', ')) || "", { shouldValidate: true, shouldDirty: true });
        setValue("background", result.inferredBackground || "", { shouldValidate: true, shouldDirty: true });

        dispatch({ type: "SET_AI_DESCRIPTION", payload: result.detailedDescription });
        toast({ title: "AI Profile Generated!", description: "Character details updated."});
        trigger();
     } catch (err) {
       console.error("CharacterCreation: AI generation failed:", err);
       setError("Failed to generate profile. The AI might be busy or encountered an error.");
       toast({ title: "AI Generation Failed", variant: "destructive" });
     } finally {
       setIsGenerating(false);
     }
   }, [getValues, trigger, setValue, dispatch, toast, state.adventureSettings]);

  const onSubmit = (data: FormData) => {
     console.log("CharacterCreation: onSubmit called. Form Data:", data, "Form validity:", formIsValid, "Errors:", errors);
     console.log("CharacterCreation: Current stats:", stats, "Remaining points:", remainingPoints, "Stat error:", statError);
     setError(null);

     if (remainingPoints !== 0) {
         setStatError(`Please allocate all ${TOTAL_STAT_POINTS} stat points. ${remainingPoints > 0 ? `${remainingPoints} point(s) remaining.` : `${Math.abs(remainingPoints)} point(s) over limit.`}`);
         toast({ title: "Stat Allocation Incomplete", description: statError, variant: "destructive"});
         return;
     }
     setStatError(null);

     if (!formIsValid) {
         let errorMessages = "Please correct the highlighted fields.";
         const fieldErrorMessages = Object.entries(errors).map(([key, err]) => err?.message ? `${key}: ${err.message}` : null).filter(Boolean);
         if (fieldErrorMessages.length > 0) { errorMessages = fieldErrorMessages.join('; '); }
         toast({ title: "Validation Error", description: errorMessages, variant: "destructive"});
         console.error("CharacterCreation: Form validation failed.", errors);
         return;
     }

     const finalName = data.name;
     let finalClass = data.class || "";
     if (state.adventureSettings.adventureType !== "Immersed" || state.adventureSettings.characterOriginType === 'original') {
        finalClass = data.class || "Adventurer";
     } else { // Immersed, existing character
        finalClass = state.character?.class || ""; // Use AI generated class from adventure setup
     }

     const finalTraits: string[] = data.traits?.split(',').map((t: string) => t.trim()).filter(Boolean) ?? [];
     const finalKnowledge: string[] = data.knowledge?.split(',').map((k: string) => k.trim()).filter(Boolean) ?? [];
     const finalBackground = data.background ?? "";
     const finalDescription = data.description || "";
     const finalAiGeneratedDescription = (data.creationType === "text" && state.character?.aiGeneratedDescription)
                                           ? state.character.aiGeneratedDescription
                                           : (data.creationType === "text" ? finalDescription : undefined);

     const characterDataToDispatch: Partial<Character> = {
         name: finalName,
         class: finalClass,
         description: finalDescription,
         traits: finalTraits,
         knowledge: finalKnowledge,
         background: finalBackground,
         stats: stats,
         aiGeneratedDescription: finalAiGeneratedDescription,
     };
     console.log("CharacterCreation: Dispatching CREATE_CHARACTER_AND_SETUP with payload:", characterDataToDispatch);
     dispatch({ type: "CREATE_CHARACTER_AND_SETUP", payload: characterDataToDispatch });
     toast({ title: "Character Ready!", description: `Welcome, ${finalName}. Adventure awaits!` });
   };

    const proceedButtonDisabled = useMemo(() => {
        const nameField = watch("name");
        const nameValid = !!nameField?.trim();
        const isDisabled = isGenerating || isRandomizing || remainingPoints !== 0 || !!statError || !formIsValid || !nameValid;
        console.log("CharacterCreation: isProceedButtonDisabled check:", { isGenerating, isRandomizing, remainingPoints, statError, formIsValid, nameValid, calculatedIsDisabled: isDisabled, errors });
        return isDisabled;
    }, [isGenerating, isRandomizing, remainingPoints, statError, formIsValid, errors, watch("name")]);

  const handleBackToMenu = () => {
    dispatch({ type: "RESET_GAME" });
  };

  const showCharacterDefinitionForms =
    state.adventureSettings.adventureType !== "Immersed" ||
    (state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "original");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl">
            <CardboardCard className="shadow-xl border-2 border-foreground/20">
                <CardHeader className="border-b border-foreground/10 pb-4">
                    <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
                        <User className="w-7 h-7" /> Create Your Adventurer
                    </CardTitle>
                     {state.adventureSettings.adventureType === "Immersed" && (
                        <p className="text-sm text-center text-muted-foreground mt-1">
                            Mode: Immersed in <span className="font-semibold">{state.adventureSettings.universeName || "chosen universe"}</span>
                            {state.adventureSettings.characterOriginType === 'existing'
                                ? ` as an existing character: ${state.adventureSettings.playerCharacterConcept || 'N/A'}.`
                                : ` as an original character: ${state.adventureSettings.playerCharacterConcept || 'Your Concept'}.`}
                        </p>
                    )}
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {showCharacterDefinitionForms ? (
                        <Tabs value={creationType} onValueChange={(value) => {
                            const newType = value as "basic" | "text";
                            setValue("creationType", newType);
                            setCreationType(newType);
                            trigger();
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
                    ) : (
                        <Alert>
                            <User className="h-4 w-4" />
                            <AlertTitle>Pre-defined Character</AlertTitle>
                            <AlertDescription>
                                For an existing character in Immersed Mode, the core profile (name, class, traits, background, description)
                                has been generated by AI based on the universe and character concept you provided.
                                You can proceed to allocate or review stats below.
                            </AlertDescription>
                        </Alert>
                    )}

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
                                    <span className="flex items-center gap-1 text-destructive">
                                        <AlertCircle className="h-4 w-4" /> {remainingPoints > 0 ? `${remainingPoints} point(s) remaining.` : `${Math.abs(remainingPoints)} point(s) over limit.`}
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
                    <Button
                        type="button"
                        onClick={handleBackToMenu}
                        variant="outline"
                        aria-label="Back to Main Menu"
                        className="w-full sm:w-auto"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Back to Main Menu
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
                                        {isRandomizing ? 'Randomizing...' : 'Randomize All'}
                                        <CheckCircle className={`absolute right-2 h-4 w-4 text-green-500 transition-opacity duration-500 ${randomizationComplete ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDelay: randomizationComplete ? '300ms' : '0ms' }} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Generate a completely random character based on the selected creation type.</p>
                                    {state.adventureSettings.adventureType === "Immersed" && <p className="text-xs text-muted-foreground">(Universe/Concept will be kept)</p>}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button
                            type="submit"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
                            disabled={proceedButtonDisabled}
                            aria-label="Save character and proceed"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "existing"
                                ? "Finalize Character & Start"
                                : "Proceed"}
                        </Button>
                    </div>
                </CardFooter>
            </CardboardCard>
        </form>
    </div>
  );
}

