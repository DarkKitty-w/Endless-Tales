
// src/components/screens/CharacterCreation.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import _ from 'lodash'; // For deep comparison
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Wand2, RotateCcw, User, Save, AlertCircle, CheckCircle, LogOut, Loader2, TrendingUp } from "lucide-react";
import { generateCharacterDescription, type GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { StatAllocationInput } from "@/components/character/StatAllocationInput";
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants";
import type { CharacterStats, Character } from "@/types/character-types";
import { initialCharacterStats as defaultInitialStats, initialCharacterState } from "@/context/game-initial-state";
import { BasicCharacterForm } from "@/components/character/BasicCharacterForm";
import { TextCharacterForm } from "@/components/character/TextCharacterForm";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnMagicIcon as HandDrawnWisdomIcon } from "@/components/icons/HandDrawnIcons";
import type { AdventureType } from "@/types/adventure-types";


// Module-level variables to be updated by useEffect, for Zod's superRefine
let currentGlobalAdventureType: AdventureType | null = null;
let currentGlobalCharacterOriginType: 'existing' | 'original' | undefined = undefined;

const baseCharacterSchema = z.object({
  name: z.string().min(1, "Character name is required.").max(50, "Name too long (max 50)."),
});

// Helper for comma-separated fields
const commaSeparatedMaxItems = (max: number, message: string) =>
  z.string()
   .transform(val => val === undefined || val === "" ? [] : val.split(',').map(s => s.trim()).filter(Boolean))
   .refine(arr => arr.length <= max, { message })
   .transform(arr => arr.join(', ')) // Convert back to string for form state if needed, or keep as array
   .optional()
   .transform(val => val || ""); // Ensure it's an empty string if undefined/null

const basicCreationSchemaFields = {
  creationType: z.literal("basic"),
  class: z.string().max(30, "Class name too long (max 30).").optional().transform(val => val || ""),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""),
  description: z.string().optional().transform(val => val || ""), // Description can be set even in basic
};
const basicCreationSchema = baseCharacterSchema.extend(basicCreationSchemaFields);

const textCreationSchemaFields = {
  creationType: z.literal("text"),
  description: z.string().optional(), // Description is primary here
  // These fields might be auto-filled by AI, so make them optional for the text schema itself
  class: z.string().max(30, "Class name too long (max 30).").optional().transform(val => val || ""),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""),
};
const textCreationSchema = baseCharacterSchema.extend(textCreationSchemaFields);

// Combined schema with superRefine for conditional validation
const combinedSchema = z.discriminatedUnion("creationType", [
  basicCreationSchema,
  textCreationSchema,
]).superRefine((data, ctx) => {
  console.log("Zod superRefine check. Current Adventure Type:", currentGlobalAdventureType, "Creation Type:", data.creationType);
  const isImmersedMode = currentGlobalAdventureType === "Immersed";
  const isOriginalCharacterImmersed = isImmersedMode && currentGlobalCharacterOriginType === "original";

  if (data.creationType === "basic") {
    if (!isImmersedMode && (!data.class || data.class.trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Class is required for Randomized/Custom adventures.", path: ["class"] });
    }
  } else if (data.creationType === "text") {
    const descLength = data.description?.trim().length ?? 0;
    if (descLength < 10) {
      if (isOriginalCharacterImmersed) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Original Character Concept (min 10 chars in description box) is required for AI profile.", path: ["description"] });
      } else if (!isImmersedMode) { // For Randomized/Custom with text input
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Description (min 10 chars) is required for AI profile generation in Randomized/Custom modes.", path: ["description"] });
      }
    }
  }
});

type FormData = z.infer<typeof combinedSchema>;

// Simple static default values for useForm initialization
const staticDefaultValues: FormData = {
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
  const formRef = useRef<HTMLFormElement>(null);

  const [creationType, setCreationType] = useState<"basic" | "text">("basic");

  const calculateRemainingPoints = useCallback((currentStats: CharacterStats): number => {
    const allocatedTotal = currentStats.strength + currentStats.stamina + currentStats.wisdom;
    return TOTAL_STAT_POINTS - allocatedTotal;
  }, []);

  const [stats, setStats] = useState<CharacterStats>(() => {
    const characterStats = state.character?.stats;
    const initial = characterStats ? { ...defaultInitialStats, ...characterStats } : { ...defaultInitialStats };
     if (initial.strength + initial.stamina + initial.wisdom > TOTAL_STAT_POINTS ||
         initial.strength < MIN_STAT_VALUE || initial.stamina < MIN_STAT_VALUE || initial.wisdom < MIN_STAT_VALUE ) {
        console.warn("CharacterCreation: Initial stats from context were invalid or exceeded total. Resetting to defaultInitialStats.");
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
     mode: "onChange", // Validate on change
     defaultValues: staticDefaultValues, // Use static defaults
   });
   const { errors, isValid: formIsValid, isDirty, dirtyFields } = formState;

   // Update module-level variables for Zod when context changes
   useEffect(() => {
    currentGlobalAdventureType = state.adventureSettings.adventureType;
    currentGlobalCharacterOriginType = state.adventureSettings.characterOriginType;
    console.log("CharacterCreation: Context adventureType updated for Zod:", currentGlobalAdventureType);
    trigger(); // Re-trigger validation if adventure type changes
  }, [state.adventureSettings.adventureType, state.adventureSettings.characterOriginType, trigger]);


   // Effect to sync form with context state (e.g., when loading a character or after AI generation)
   useEffect(() => {
     console.log("CharacterCreation: useEffect for form sync triggered. Adventure Type:", state.adventureSettings.adventureType, "Creation Type:", creationType, "Dirty Fields:", dirtyFields);
     const formSnapshot = getValues();
     let shouldReset = false;

     const newFormValues: Partial<FormData> = {
         creationType: creationType, // Always reflect current tab
         // For other fields, prioritize dirty (user-input) values, then context, then static defaults
         name: dirtyFields.name ? formSnapshot.name : state.character?.name || staticDefaultValues.name,
         class: (state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType !== "original")
                 ? "" // Class is not user-defined for Immersed (Existing)
                 : (dirtyFields.class ? formSnapshot.class : state.character?.class || (state.adventureSettings.adventureType === "Immersed" ? "" : "Adventurer")),
         traits: dirtyFields.traits ? formSnapshot.traits : state.character?.traits?.join(', ') || staticDefaultValues.traits,
         knowledge: dirtyFields.knowledge ? formSnapshot.knowledge : state.character?.knowledge?.join(', ') || staticDefaultValues.knowledge,
         background: dirtyFields.background ? formSnapshot.background : state.character?.background || staticDefaultValues.background,
         description: dirtyFields.description ? formSnapshot.description : (state.character?.aiGeneratedDescription || state.character?.description || staticDefaultValues.description),
     };
      // Special handling for Immersed Original Character concept
      if (state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "original" &&
          !dirtyFields.description && state.adventureSettings.playerCharacterConcept &&
          newFormValues.description !== state.adventureSettings.playerCharacterConcept) {
          newFormValues.description = state.adventureSettings.playerCharacterConcept;
      }


     // Check if any relevant value in newFormValues differs from formSnapshot
     for (const key in newFormValues) {
         if (newFormValues[key as keyof FormData] !== formSnapshot[key as keyof FormData]) {
             shouldReset = true;
             break;
         }
     }

     if (shouldReset) {
         console.log("CharacterCreation: Calling reset with new values:", newFormValues);
         reset(newFormValues as FormData, { keepDirtyValues: true }); // keepDirty helps preserve user input
         trigger(); // Re-trigger validation after reset if schema might have changed
     }
   }, [
     state.character, state.adventureSettings.adventureType, state.adventureSettings.characterOriginType,
     state.adventureSettings.playerCharacterConcept, creationType,
     reset, getValues, dirtyFields, trigger,
   ]);


  const handleStatChange = useCallback((newStats: CharacterStats) => {
    const newRemaining = calculateRemainingPoints(newStats);
    setStats(newStats);
    setRemainingPoints(newRemaining);
    setStatError(null); // Clear previous error

    if (newRemaining < 0) {
        setStatError(`${Math.abs(newRemaining)} point(s) over limit.`);
    } else if (newRemaining > 0) {
        // No error if points remaining
    } else { // newRemaining === 0
        // All points allocated, no error
    }
  }, [calculateRemainingPoints]);


  const randomizeStats = useCallback(() => {
    setIsRandomizing(true);
    let pointsLeft = TOTAL_STAT_POINTS;
    const newAllocatedStats: Pick<CharacterStats, 'strength' | 'stamina' | 'wisdom'> = { strength: MIN_STAT_VALUE, stamina: MIN_STAT_VALUE, wisdom: MIN_STAT_VALUE };
    pointsLeft -= (MIN_STAT_VALUE * 3);
    const allocatedStatKeys: (keyof typeof newAllocatedStats)[] = ['strength', 'stamina', 'wisdom'];

    while (pointsLeft > 0) {
        const availableKeys = allocatedStatKeys.filter(key => newAllocatedStats[key] < MAX_STAT_VALUE);
        if (availableKeys.length === 0) break;
        const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        newAllocatedStats[randomKey]++;
        pointsLeft--;
    }
    let currentTotal = newAllocatedStats.strength + newAllocatedStats.stamina + newAllocatedStats.wisdom;
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
                if (diff > 0) sortedByVal.shift(); else sortedByVal.pop();
            }
        }
    }
    const finalStats: CharacterStats = { ...defaultInitialStats, ...newAllocatedStats };
    handleStatChange(finalStats);
    setStatError(null); // Ensure no stat error after randomization
    setIsRandomizing(false);
  }, [handleStatChange]);


 const randomizeAll = useCallback(async () => {
     setIsRandomizing(true);
     setRandomizationComplete(false);
     setError(null);

     const randomNames = ["Anya", "Borin", "Carys", "Darian", "Elara", "Fendrel", "Gorok", "Silas", "Lyra", "Roric"];
     const randomClasses = ["Warrior", "Rogue", "Mage", "Scout", "Scholar", "Wanderer", "Guard", "Tinkerer", "Healer", "Bard", "Adventurer"];
     const randomTraitsPool = ["Brave", "Curious", "Cautious", "Impulsive", "Loyal", "Clever", "Resourceful", "Quiet", "Stern", "Generous", "Witty", "Pessimistic"];
     const randomKnowledgePool = ["Herbalism", "Local Lore", "Survival", "Trading", "Ancient Runes", "Beasts", "Smithing", "First Aid", "Navigation", "City Secrets"];
     const randomBackgrounds = ["Farmer", "Orphan", "Noble Exile", "Street Urchin", "Acolyte", "Guard", "Merchant's Child", "Hermit", "Former Soldier", "Traveling Minstrel"];
     const randomDescriptions = [
         "A weary traveler, eyes sharp as a hawk, their cloak patched from countless journeys, forever seeking forgotten paths and lost knowledge.",
         "A cheerful youth hailing from a small, secluded village, somewhat naive to the wider world but brimming with an infectious eagerness for adventure.",
         "A stern and reserved individual, a faded scar across their cheek tells a silent story of a past they refuse to speak of.",
         "A dedicated scholar, almost comically obsessed with forgotten lore and ancient prophecies, rarely seen without a satchel overflowing with dusty tomes and cryptic maps.",
         "A skilled artisan, hands calloused yet remarkably deft, always ready to craft, repair, or ingeniously repurpose whatever materials are at hand."
     ];

     const currentCreationTypeForRandom = watch("creationType") || creationType;
     const name = randomNames[Math.floor(Math.random() * randomNames.length)];

     const dataToSet: Partial<FormData> = {
        creationType: currentCreationTypeForRandom,
        name: name,
        class: "", traits: "", knowledge: "", background: "", description: ""
     };

     const currentAdvType = state.adventureSettings.adventureType;
     const isImmersedOriginal = currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original";

     if (currentCreationTypeForRandom === 'basic' && !isImmersedOriginal) { // Basic mode for Randomized/Custom
         dataToSet.class = (currentAdvType === "Immersed") ? "" : randomClasses[Math.floor(Math.random() * randomClasses.length)];
         dataToSet.traits = randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2).join(', '); // 2-4 traits
         dataToSet.knowledge = randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1).join(', '); // 1-3 knowledge areas
         dataToSet.background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
         dataToSet.description = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)]; // Also set a random description for basic
     } else { // Text mode OR Immersed Original
         let desc = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
         if (isImmersedOriginal) {
             desc = `An original character for the ${state.adventureSettings.universeName || 'chosen universe'}: A ${randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)]} named ${name}. ${desc}`;
         }
         dataToSet.description = desc;
         dataToSet.class = (currentAdvType === "Immersed") ? "" : "Adventurer"; // Default to Adventurer for text mode in non-Immersed
         // For text mode, AI will infer traits, knowledge, background.
         // We can pre-fill some random ones which AI might override or use as inspiration.
         dataToSet.traits = randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 1).join(', ');
         dataToSet.knowledge = randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2)).join(', '); // 0-1 knowledge
         dataToSet.background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
     }

     console.log("Randomize All: Data to set in form:", dataToSet);
     reset(dataToSet as FormData); // Reset the entire form with new values
     randomizeStats(); // Randomize stats separately

     await new Promise(res => setTimeout(res, 100)); // Short delay for state updates

     setIsRandomizing(false);
     setRandomizationComplete(true);
     toast({ title: "Character Randomized!", description: `Created a new character: ${name}. Review and adjust as needed.` });
     setTimeout(() => setRandomizationComplete(false), 1200);
     trigger(); // Re-validate the form after all changes
 }, [creationType, randomizeStats, reset, state.adventureSettings.adventureType, state.adventureSettings.characterOriginType, state.adventureSettings.universeName, toast, trigger, watch]);


  const handleGenerateDescription = useCallback(async () => {
     // Ensure name is validated first if it's a prerequisite for your schema logic outside Zod
     await trigger(["name"]);
     const currentFormValues = getValues();
     const currentName = currentFormValues.name;
     const currentDescValue = currentFormValues.description;

     const currentAdvType = state.adventureSettings.adventureType;
     const universeNameForAI = currentAdvType === "Immersed" ? state.adventureSettings.universeName : undefined;
     const playerCharacterConceptForAI = (currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original")
                                          ? currentDescValue // Use the current description as the concept for AI
                                          : undefined;


     if (!currentName?.trim()) {
         toast({ title: "Name Required", description: "Please enter a character name before generating AI profile.", variant: "destructive" }); return;
     }
     if (!currentDescValue || currentDescValue.trim().length < 10) {
        let msg = "Description (min 10 chars) is required for AI profile generation.";
        if (currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original") {
            msg = "Original Character Concept (min 10 chars in description box) is required for AI profile.";
        }
        toast({ title: "Input Required", description: msg, variant: "destructive" }); return;
     }

     setError(null); setIsGenerating(true);
     console.log("AI Gen: Sending to AI - Desc:", currentDescValue, "Immersed:", currentAdvType === "Immersed", "Universe:", universeNameForAI, "Concept:", playerCharacterConceptForAI);

     try {
        const aiInput = {
             characterDescription: currentDescValue,
             isImmersedMode: currentAdvType === "Immersed",
             universeName: universeNameForAI,
             playerCharacterConcept: playerCharacterConceptForAI,
        };
        const result: GenerateCharacterDescriptionOutput = await generateCharacterDescription(aiInput);
        console.log("AI Gen: Received from AI:", result);

        // Create a new object for reset to ensure all relevant fields are updated
        const formUpdateData: Partial<FormData> = {
            description: result.detailedDescription || currentDescValue,
            traits: (result.inferredTraits?.join(', ')) || currentFormValues.traits,
            knowledge: (result.inferredKnowledge?.join(', ')) || currentFormValues.knowledge,
            background: result.inferredBackground || currentFormValues.background,
        };
        if (currentAdvType !== "Immersed") {
            formUpdateData.class = result.inferredClass || "Adventurer";
        } else {
            // For Immersed, class might be a specific role or Immersed Protagonist.
            // We might not want to set 'class' field if it's hidden or managed differently.
            // For now, if AI provides it, we'll set it, but the form field is hidden.
            formUpdateData.class = result.inferredClass || "Immersed Protagonist";
        }

        reset({ ...currentFormValues, ...formUpdateData }, { keepDirtyValues: false }); // Overwrite with AI values
        dispatch({ type: "SET_AI_DESCRIPTION", payload: result.detailedDescription });
        toast({ title: "AI Profile Generated!", description: "Character details updated based on AI suggestions."});
        await trigger(); // Re-validate all fields after programmatic changes
     } catch (err) {
       console.error("CharacterCreation: AI generation failed:", err);
       setError("Failed to generate profile. The AI might be busy or encountered an error. Please try again.");
       toast({ title: "AI Generation Failed", description: (err as Error).message || "Unknown error.", variant: "destructive" });
     } finally { setIsGenerating(false); }
   }, [getValues, reset, setValue, trigger, dispatch, toast, state.adventureSettings]);


  const onSubmit = (data: FormData) => {
     console.log("CharacterCreation: onSubmit called. Form Data:", data, "Current Stats:", stats, "Remaining Points:", remainingPoints, "Form IsValid:", formIsValid, "Errors:", errors);
     setError(null);
     if (remainingPoints !== 0) {
         setStatError(`Please allocate all ${TOTAL_STAT_POINTS} stat points. ${remainingPoints > 0 ? `${remainingPoints} point(s) remaining.` : `${Math.abs(remainingPoints)} point(s) over limit.`}`);
         toast({ title: "Stat Allocation Incomplete", description: statError || "Stat allocation issue.", variant: "destructive"}); return;
     }
     setStatError(null);

     // Explicitly trigger validation one last time before submitting
     trigger().then(isFormCurrentlyValid => {
        console.log("CharacterCreation: onSubmit - Post-trigger validation result:", isFormCurrentlyValid, "Current formState.isValid:", formIsValid, "Current errors:", errors);
        if (!isFormCurrentlyValid) { // Use the result from the fresh trigger
            const fieldErrorMessages = Object.entries(errors).map(([key, err]) => err?.message ? `${key}: ${err.message}` : null).filter(Boolean);
            toast({ title: "Validation Error", description: fieldErrorMessages.join('; ') || "Please correct the highlighted fields before proceeding.", variant: "destructive"});
            return;
        }

        const finalName = data.name;
        let finalClass = data.class || "Adventurer"; // Default to Adventurer if class is empty and not Immersed
        if (state.adventureSettings.adventureType === "Immersed") {
            // For Immersed (Original), the 'class' might be derived from the concept or be a general role.
            // If an AI generated profile, it might have inferred a role.
            finalClass = data.class || state.character?.class || state.adventureSettings.playerCharacterConcept || "Immersed Protagonist";
        }

        const finalTraits: string[] = (typeof data.traits === 'string' ? data.traits.split(',') : data.traits || []).map((t: string) => t.trim()).filter(Boolean);
        const finalKnowledge: string[] = (typeof data.knowledge === 'string' ? data.knowledge.split(',') : data.knowledge || []).map((k: string) => k.trim()).filter(Boolean);
        const finalBackground = data.background ?? "";
        const finalDescription = data.description || "";
        // Use the AI-generated description if available and it's the most recent description source
        const finalAiGeneratedDescription = (state.character?.aiGeneratedDescription && state.character.aiGeneratedDescription === finalDescription)
                                            ? state.character.aiGeneratedDescription
                                            : (data.creationType === 'text' || (data.creationType === 'basic' && finalDescription) ? finalDescription : undefined);


        const characterDataToDispatch: Partial<Character> = {
            name: finalName, class: finalClass, description: finalDescription, traits: finalTraits, knowledge: finalKnowledge,
            background: finalBackground, stats: stats, aiGeneratedDescription: finalAiGeneratedDescription,
        };
        console.log("CharacterCreation: Dispatching CREATE_CHARACTER_AND_SETUP with payload:", characterDataToDispatch);
        dispatch({ type: "CREATE_CHARACTER_AND_SETUP", payload: characterDataToDispatch });
        // Toast is now handled in adventureReducer after successful state change
     });
   };


  const handleBackToMenu = () => {
    dispatch({ type: "RESET_GAME" });
  };


  const showCharacterDefinitionForms = useMemo(() => {
    const advType = state.adventureSettings.adventureType;
    const originType = state.adventureSettings.characterOriginType;
    const shouldShow = advType !== "Immersed" || (advType === "Immersed" && originType === "original");
    console.log("CharacterCreation: showCharacterDefinitionForms evaluated to:", shouldShow, "AdvType:", advType, "OriginType:", originType);
    return shouldShow;
  }, [state.adventureSettings.adventureType, state.adventureSettings.characterOriginType]);


  const isProceedButtonDisabled = useMemo(() => {
    const nameValid = !!watch("name")?.trim();
    const generalDisabled = isGenerating || isRandomizing || remainingPoints !== 0 || !!statError;
    const buttonDisabled = generalDisabled || !formIsValid || !nameValid;
    // console.log("CharacterCreation: isProceedButtonDisabled check. GeneralDisabled:", generalDisabled, "FormIsValid:", formIsValid, "NameValid:", nameValid, "Result:", buttonDisabled, "Errors:", errors);
    return buttonDisabled;
  }, [isGenerating, isRandomizing, remainingPoints, statError, formIsValid, errors, watch]);


  // If this screen is reached for an "Immersed (Existing)" character, something is wrong in the flow.
  // AdventureSetup should have bypassed this.
  if (state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "existing" && !showCharacterDefinitionForms) {
    console.error("CharacterCreation: Reached for Immersed (Existing) character. This should be bypassed. Redirecting to MainMenu.");
    // useEffect(() => { // Use effect to avoid direct dispatch during render
    //    dispatch({ type: "RESET_GAME" });
    //    toast({title: "Flow Error", description: "Redirected due to incorrect character creation path.", variant: "destructive"});
    // }, [dispatch, toast]);
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
            <CardboardCard className="w-full max-w-md text-center">
                <CardHeader><CardTitle className="text-2xl flex items-center justify-center gap-2"><Loader2 className="w-6 h-6 animate-spin"/> Loading Error</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">An unexpected error occurred in the character creation flow.</p>
                    <p className="text-xs text-muted-foreground mt-2">Please return to the Main Menu and try again.</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleBackToMenu} className="w-full" variant="outline">Back to Main Menu</Button>
                </CardFooter>
            </CardboardCard>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl" ref={formRef}>
            <CardboardCard className="shadow-xl border-2 border-foreground/20">
                <CardHeader className="border-b border-foreground/10 pb-4">
                    <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
                        <User className="w-7 h-7" /> Create Your Adventurer
                    </CardTitle>
                     {state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "original" && (
                        <p className="text-sm text-center text-muted-foreground mt-1"> Mode: Immersed (Original Character) in <span className="font-semibold">{state.adventureSettings.universeName || "chosen universe"}</span> <br/>Your Initial Concept: <span className="italic">{state.adventureSettings.playerCharacterConcept || 'Your Concept'}</span> </p>
                    )}
                     {(state.adventureSettings.adventureType === "Randomized" || state.adventureSettings.adventureType === "Custom") && (
                         <p className="text-sm text-center text-muted-foreground mt-1"> Mode: {state.adventureSettings.adventureType} Adventure </p>
                     )}
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {error && ( <Alert variant="destructive" className="mb-4"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}

                    {showCharacterDefinitionForms ? (
                        <Tabs value={creationType} onValueChange={(value) => setCreationType(value as "basic" | "text")} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="basic">Basic Fields</TabsTrigger>
                                <TabsTrigger value="text">Text Description (AI Assist)</TabsTrigger>
                            </TabsList>
                            <TabsContent value="basic" className="space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50">
                                <BasicCharacterForm register={register as UseFormRegister<any>} errors={errors as FieldErrors<any>} adventureType={state.adventureSettings.adventureType} />
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
                            <AlertTitle>Character Profile Information</AlertTitle>
                            <AlertDescription>
                                Core details for this character type are typically AI-generated or pre-defined for this adventure mode.
                                Please allocate stats below.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Separator />

                    {/* Stat Allocation Section */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                            <h3 className="text-xl font-semibold flex items-center gap-1.5"><TrendingUp className="w-5 h-5"/>Allocate Stats ({stats.strength + stats.stamina + stats.wisdom} / {TOTAL_STAT_POINTS} Points)</h3>
                             <p className={`text-sm font-medium ${statError ? 'text-destructive' : (remainingPoints === 0 ? 'text-green-600' : 'text-muted-foreground')}`}>
                                {statError ? ( <span className="flex items-center gap-1"> <AlertCircle className="h-4 w-4" /> {statError} </span>
                                ) : remainingPoints === 0 ? ( <span className="flex items-center gap-1 text-green-600"> <CheckCircle className="h-4 w-4" /> All points allocated! </span>
                                ) : ( `${remainingPoints} point(s) remaining.` )}
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
                                label="Wisdom"
                                statKey="wisdom"
                                value={stats.wisdom}
                                onChange={(key, val) => handleStatChange({...stats, [key]: val})}
                                Icon={HandDrawnWisdomIcon}
                                disabled={isGenerating || isRandomizing}
                                remainingPoints={remainingPoints}
                            />
                        </div>
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-foreground/10">
                     <Button type="button" onClick={handleBackToMenu} variant="outline" aria-label="Back to Main Menu" className="w-full sm:w-auto">
                        <LogOut className="mr-2 h-4 w-4" /> Back to Main Menu
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
                                        disabled={isRandomizing || isGenerating || !showCharacterDefinitionForms}
                                    >
                                        <RotateCcw className={`mr-2 h-4 w-4 ${isRandomizing ? 'animate-spin' : ''}`} />
                                        {isRandomizing ? 'Randomizing...' : 'Randomize All'}
                                        {randomizationComplete && <CheckCircle className="absolute right-2 h-4 w-4 text-green-500 opacity-100 transition-opacity duration-300" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Generate random character details (name, class, traits, etc., if applicable) and stats.</p>
                                    {!showCharacterDefinitionForms && <p className="text-xs text-muted-foreground">(Character details are pre-defined for this mode.)</p>}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button
                            type="submit"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
                            disabled={isProceedButtonDisabled}
                            aria-label="Save character and proceed to adventure setup"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Proceed to Adventure Setup
                        </Button>
                    </div>
                </CardFooter>
            </CardboardCard>
        </form>
    </div>
  );
}
