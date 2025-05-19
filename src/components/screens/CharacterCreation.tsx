
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

const basicCreationSchemaFields = {
  creationType: z.literal("basic"),
  class: z.string().max(30, "Class name too long (max 30).").optional().transform(val => val || ""),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""),
  description: z.string().optional().transform(val => val || ""), // User's description in basic mode
};

const basicCreationSchema = baseCharacterSchema.extend(basicCreationSchemaFields);

const textCreationSchemaFields = {
  creationType: z.literal("text"),
  description: z.string().optional(), // This will be the AI-elaborated or user-inputted rich text
  class: z.string().max(30, "Class name too long (max 30).").optional().transform(val => val || ""), // Can be inferred by AI
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."), // Can be inferred
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."), // Can be inferred
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""), // Can be inferred
};
const textCreationSchema = baseCharacterSchema.extend(textCreationSchemaFields);

let currentGlobalAdventureType: string | null = null;

const combinedSchema = z.discriminatedUnion("creationType", [
  basicCreationSchema,
  textCreationSchema,
]).superRefine((data, ctx) => {
  console.log("Zod superRefine. AdventureType:", currentGlobalAdventureType, "Data:", { name: data.name, class: data.class, descLength: data.description?.length, creationType: data.creationType });
  if (currentGlobalAdventureType !== "Immersed") {
    if (data.creationType === "basic") {
      if (!data.class || data.class.trim() === "") {
        console.log("superRefine: Basic/Non-Immersed - Adding CLASS error.");
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Class is required for this adventure type.",
          path: ["class"],
        });
      }
    }
    // For text creation in Randomized/Custom, description is essential for AI to work from.
    if (data.creationType === "text") {
        if (!data.description || data.description.trim().length < 10) {
             console.log("superRefine: Text/Non-Immersed - Adding DESCRIPTION error.");
             ctx.addIssue({
                 code: z.ZodIssueCode.custom,
                 message: "Description (min 10 chars) is required for AI profile generation.",
                 path: ["description"],
             });
        }
    }
  } else { // Immersed mode
      if (data.creationType === "text" && (!data.description || data.description.trim().length < 10) && !state.adventureSettings.playerCharacterConcept?.trim()) {
          console.log("superRefine: Text/Immersed - Adding DESCRIPTION error (no concept).");
          ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Description (min 10 chars) or a Character Concept (from Adventure Setup) is needed for AI profile generation in Immersed mode.",
              path: ["description"],
          });
      }
      // Class is not required for Immersed mode
  }
});

type FormData = z.infer<typeof combinedSchema>;

export function CharacterCreation() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [creationType, setCreationType] = useState<"basic" | "text">("basic");

  const calculateRemainingPoints = useCallback((currentStats: CharacterStats): number => {
    const allocatedTotal = currentStats.strength + currentStats.stamina + currentStats.agility;
    return TOTAL_STAT_POINTS - allocatedTotal;
  }, []);

  const [stats, setStats] = useState<CharacterStats>(() => {
    const initial = state.character?.stats ? { ...defaultInitialStats, ...state.character.stats } : { ...defaultInitialStats };
    if (calculateRemainingPoints(initial) !== 0 && (initial.strength + initial.stamina + initial.agility !== TOTAL_STAT_POINTS) ) {
        console.warn(`CharacterCreation: Loaded stats for ${state.character?.name} were invalid or didn't sum to ${TOTAL_STAT_POINTS}. Resetting to default allocation.`);
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
     defaultValues:  useCallback(() => {
        console.log("Setting defaultValues. AdventureType:", state.adventureSettings.adventureType);
        return {
            creationType: "basic",
            name: state.character?.name ?? "",
            class: state.adventureSettings.adventureType === "Immersed" ? "" : (state.character?.class || "Adventurer"),
            traits: state.character?.traits?.join(', ') ?? "",
            knowledge: state.character?.knowledge?.join(', ') ?? "",
            background: state.character?.background ?? "",
            description: state.character?.description ?? state.character?.aiGeneratedDescription ?? "",
        };
     }, [state.character, state.adventureSettings.adventureType]) // Dependencies for defaultValues
   });
   const { errors, isValid: formIsValid, isDirty } = formState;

  useEffect(() => {
    currentGlobalAdventureType = state.adventureSettings.adventureType;
    console.log("CharacterCreation: Global adventure type for Zod updated to:", currentGlobalAdventureType);
    // When adventure type changes, re-validate the whole form.
    // Also, adjust the 'class' field's value if necessary.
    const currentClassValue = getValues("class");
    if (state.adventureSettings.adventureType === "Immersed") {
        if (currentClassValue !== "") { // Only set if it's not already empty
            setValue("class", "", { shouldValidate: true, shouldDirty: true });
        } else {
            trigger("class"); // Still trigger validation for class if it was already empty
        }
    } else { // Randomized or Custom
        if (!currentClassValue && creationType === "basic") {
            setValue("class", "Adventurer", { shouldValidate: true, shouldDirty: true });
        } else {
             trigger("class"); // Validate existing or empty class
        }
    }
    console.log("CharacterCreation: Triggering full form validation due to adventureType change.");
    trigger();
  }, [state.adventureSettings.adventureType, creationType, setValue, getValues, trigger]);


  useEffect(() => {
    console.log("CharacterCreation: FormState updated - isValid:", formIsValid, "Errors:", JSON.stringify(errors), "isDirty:", isDirty);
  }, [formIsValid, errors, isDirty]);


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
    if (currentTotal !== TOTAL_STAT_POINTS) { // Simplified re-balancing
        let diff = TOTAL_STAT_POINTS - currentTotal;
        for (const key of allocatedStatKeys) {
            if (diff === 0) break;
            const change = Math.sign(diff);
            if ((change > 0 && newAllocatedStats[key] < MAX_STAT_VALUE) || (change < 0 && newAllocatedStats[key] > MIN_STAT_VALUE)) {
                newAllocatedStats[key] += change;
                diff -= change;
            }
        }
    }
    const finalStats: CharacterStats = { ...defaultInitialStats, ...newAllocatedStats };
    handleStatChange(finalStats);
}, [handleStatChange, defaultInitialStats]);

 const randomizeAll = useCallback(async () => {
     // ... (randomizeAll implementation remains similar but ensure setValue calls include shouldDirty: true)
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
     ];
     reset({ // Reset with new creationType to ensure schema context is correct
        creationType: creationType, // Keep current tab
        name: "", class: "", traits: "", knowledge: "", background: "", description: ""
     });

     const name = randomNames[Math.floor(Math.random() * randomNames.length)];
     setValue("name", name, { shouldValidate: true, shouldDirty: true });

     if (creationType === 'basic') {
         const charClass = state.adventureSettings.adventureType === "Immersed" ? "" : randomClasses[Math.floor(Math.random() * randomClasses.length)];
         setValue("class", charClass, { shouldValidate: true, shouldDirty: true });
         setValue("traits", randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1).join(', '), { shouldValidate: true, shouldDirty: true });
         setValue("knowledge", randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1).join(', '), { shouldValidate: true, shouldDirty: true });
         setValue("background", randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)], { shouldValidate: true, shouldDirty: true });
         setValue("description", "", { shouldValidate: true, shouldDirty: true });
     } else { // text
         setValue("description", randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)], { shouldValidate: true, shouldDirty: true });
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
     trigger();
 }, [creationType, reset, setValue, randomizeStats, trigger, state.adventureSettings.adventureType]);


  const handleGenerateDescription = useCallback(async () => {
     // ... (handleGenerateDescription implementation remains similar but ensure shouldDirty: true for setValue)
     await trigger(["name", "description"]);
     const currentDescValue = getValues("description");
     const currentName = getValues("name");
     let descriptionToUseForAI = currentDescValue || "";

     if (state.adventureSettings.adventureType === "Immersed") {
         if (!currentName?.trim() || ((!currentDescValue || currentDescValue.length < 10) && !state.adventureSettings.playerCharacterConcept?.trim())) {
             toast({ title: "Input Required", description: "Name and either Description (min 10 chars) or Character Concept (from Adventure Setup) required for Immersed AI profile.", variant: "destructive" });
             return;
         }
         if ((!currentDescValue || currentDescValue.length < 10) && state.adventureSettings.playerCharacterConcept?.trim()) {
            descriptionToUseForAI = `Character: ${state.adventureSettings.playerCharacterConcept}. Name: ${currentName}. Universe: ${state.adventureSettings.universeName || 'a specified universe'}.`;
         }
     } else { // Randomized or Custom
         if (!currentName?.trim() || !currentDescValue || currentDescValue.length < 10) {
             toast({ title: "Input Required", description: "Name and Description (min 10 chars) required for AI profile.", variant: "destructive" });
             return;
         }
     }

     setError(null);
     setIsGenerating(true);
     try {
        const result: GenerateCharacterDescriptionOutput = await generateCharacterDescription({ characterDescription: descriptionToUseForAI });
        setValue("description", result.detailedDescription || descriptionToUseForAI, { shouldValidate: true, shouldDirty: true });
        const inferredClass = result.inferredClass || (state.adventureSettings.adventureType === "Immersed" ? "" : "Adventurer");
        setValue("class", inferredClass, { shouldValidate: true, shouldDirty: true });
        setValue("traits", (result.inferredTraits?.join(', ')) || "", { shouldValidate: true, shouldDirty: true });
        setValue("knowledge", (result.inferredKnowledge?.join(', ')) || "", { shouldValidate: true, shouldDirty: true });
        setValue("background", result.inferredBackground || "", { shouldValidate: true, shouldDirty: true });
        dispatch({ type: "SET_AI_DESCRIPTION", payload: result.detailedDescription });
        toast({ title: "AI Profile Generated!", description: "Character details updated."});
        trigger();
     } catch (err) {
       console.error("AI generation failed:", err);
       setError("Failed to generate profile. The AI might be busy or encountered an error.");
       toast({ title: "AI Generation Failed", variant: "destructive" });
     } finally {
       setIsGenerating(false);
     }
   }, [getValues, trigger, setValue, dispatch, toast, state.adventureSettings.adventureType, state.adventureSettings.playerCharacterConcept, state.adventureSettings.universeName]);


  const onSubmit = (data: FormData) => {
     console.log("CharacterCreation: onSubmit function called. Data:", data, "Remaining Points:", remainingPoints, "Stat Error:", statError, "Form isValid:", formIsValid);
     setError(null);

     if (remainingPoints !== 0) {
         setStatError(`Please allocate all ${TOTAL_STAT_POINTS} stat points. ${remainingPoints > 0 ? `${remainingPoints} remaining.` : `${Math.abs(remainingPoints)} over.`}`);
         console.error("CharacterCreation: Submit blocked - Stat allocation incomplete. Remaining:", remainingPoints);
         toast({ title: "Stat Allocation", description: `Stat points: ${remainingPoints > 0 ? `${remainingPoints} remaining.` : `${Math.abs(remainingPoints)} over limit.`}`, variant: "destructive" });
         return;
     }
     setStatError(null);

     if (!formIsValid) {
         console.error("CharacterCreation: Submit blocked - Form is invalid. Errors:", JSON.stringify(errors));
         let errorMessages = "Please correct the highlighted fields.";
         const fieldErrorMessages = Object.entries(errors).map(([key, err]) => err?.message ? `${key}: ${err.message}` : null).filter(Boolean);
         if (fieldErrorMessages.length > 0) { errorMessages = fieldErrorMessages.join('; '); }
         toast({ title: "Validation Error", description: errorMessages, variant: "destructive"});
         return;
     }
     console.log("CharacterCreation: Form validation passed, proceeding to dispatch.");

     const finalName = data.name;
     let finalClass = data.class || "";
     if (state.adventureSettings.adventureType !== "Immersed") {
        finalClass = data.class || "Adventurer";
     }

     const finalTraits: string[] = data.traits?.split(',').map((t: string) => t.trim()).filter(Boolean) ?? [];
     const finalKnowledge: string[] = data.knowledge?.split(',').map((k: string) => k.trim()).filter(Boolean) ?? [];
     const finalBackground = data.background ?? "";
     const finalDescription = data.description || ""; // This is the rich description, potentially AI-generated
     const finalAiGeneratedDescription = data.creationType === "text" ? data.description : state.character?.aiGeneratedDescription;


     const characterDataToDispatch: Partial<Character> = {
         name: finalName,
         class: finalClass,
         description: finalDescription, // This will be user's input from basic, or AI/user from text
         traits: finalTraits,
         knowledge: finalKnowledge,
         background: finalBackground,
         stats: stats, // The allocated stats from the component's state
         aiGeneratedDescription: finalAiGeneratedDescription,
     };
     console.log("CharacterCreation: Dispatching CREATE_CHARACTER_AND_SETUP with payload:", characterDataToDispatch);
     dispatch({ type: "CREATE_CHARACTER_AND_SETUP", payload: characterDataToDispatch });
     toast({ title: "Character Ready!", description: `Welcome, ${finalName}. Adventure awaits!` });
   };

   const proceedButtonDisabled = useCallback(() => {
        const isDisabled = isGenerating || isRandomizing || remainingPoints !== 0 || !!statError || !formIsValid;
        // console.log("CharacterCreation: isProceedButtonDisabled check:", {
        //     isGenerating, isRandomizing, remainingPoints, statError: !!statError,
        //     formIsValid,
        //     calculatedDisabled: isDisabled,
        //     currentErrors: JSON.stringify(errors) // Log current form errors
        // });
        return isDisabled;
    }, [isGenerating, isRandomizing, remainingPoints, statError, formIsValid, errors]); // errors dependency for logging


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
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs value={creationType} onValueChange={(value) => {
                        const newType = value as "basic" | "text";
                        setCreationType(newType);
                        setValue("creationType", newType, {shouldValidate: true, shouldDirty: true});
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
                        disabled={proceedButtonDisabled()}
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
