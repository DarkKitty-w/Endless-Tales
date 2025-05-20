
// src/components/screens/CharacterCreation.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import _ from 'lodash';
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
import { initialCharacterState, initialCharacterStats } from "@/context/game-initial-state";
import { BasicCharacterForm } from "@/components/character/BasicCharacterForm";
import { TextCharacterForm } from "@/components/character/TextCharacterForm";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnMagicIcon as HandDrawnWisdomIcon } from "@/components/icons/HandDrawnIcons";
import type { AdventureType } from "@/types/adventure-types";

let currentGlobalAdventureType: AdventureType | null = null;
let currentGlobalCharacterOriginType: 'existing' | 'original' | undefined = undefined;

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

const combinedSchema = z.discriminatedUnion("creationType", [
  basicCreationSchema,
  textCreationSchema,
]).superRefine((data, ctx) => {
  const advType = currentGlobalAdventureType;
  const originType = currentGlobalCharacterOriginType;

  if (data.creationType === "basic") {
    if (advType !== "Immersed" && (!data.class || data.class.trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Class is required for Randomized/Custom adventures.", path: ["class"] });
    }
  } else if (data.creationType === "text") {
    const descLength = data.description?.trim().length ?? 0;
    if (descLength < 10) {
      if (advType === "Immersed" && originType === "original") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Original Character Concept (min 10 chars in description box) is required for AI profile.", path: ["description"] });
      } else if (advType !== "Immersed") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Description (min 10 chars) is required for AI profile generation in Randomized/Custom modes.", path: ["description"] });
      }
    }
  }
});

type FormData = z.infer<typeof combinedSchema>;

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
    const characterContextStats = state.character?.stats;
    const initial = characterContextStats ? { ...initialCharacterStats, ...characterContextStats } : { ...initialCharacterStats };
    if (initial.strength + initial.stamina + initial.wisdom > TOTAL_STAT_POINTS ||
        initial.strength < MIN_STAT_VALUE || initial.stamina < MIN_STAT_VALUE || initial.wisdom < MIN_STAT_VALUE ) {
      console.warn("CharacterCreation: Initial stats from context were invalid or exceeded total. Resetting.");
      return { ...initialCharacterStats };
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
     defaultValues: staticDefaultValues,
   });
   const { errors, isValid: formIsValid, isDirty, dirtyFields } = formState;

   useEffect(() => {
    currentGlobalAdventureType = state.adventureSettings.adventureType;
    currentGlobalCharacterOriginType = state.adventureSettings.characterOriginType;
    console.log("CharacterCreation: Zod context updated - AdvType:", currentGlobalAdventureType, "OriginType:", currentGlobalCharacterOriginType);
    if (formRef.current) { // Only trigger if form is mounted
        trigger();
    }
  }, [state.adventureSettings.adventureType, state.adventureSettings.characterOriginType, trigger]);

  useEffect(() => {
    console.log("CharacterCreation: Form sync useEffect. AdventureType:", state.adventureSettings.adventureType, "Origin:", state.adventureSettings.characterOriginType, "Tab:", creationType, "Character in context:", !!state.character, "isRandomizing:", isRandomizing, "isGenerating:", isGenerating);

    if (isRandomizing || isGenerating) {
      console.log("CharacterCreation: Form sync: Bailing out: randomization/generation in progress.");
      return;
    }

    const currentFormSnapshot = getValues();
    const newFormValues: Partial<FormData> = { creationType }; // Always reflect current tab

    const isImmersedMode = state.adventureSettings.adventureType === "Immersed";
    const isOriginalCharacterImmersed = isImmersedMode && state.adventureSettings.characterOriginType === "original";
    const isImmersedExistingCharacter = isImmersedMode && state.adventureSettings.characterOriginType === 'existing';

    if (state.character && !isDirty) { // If there's a character in context and form is not dirty, populate from it
        console.log("CharacterCreation: Form sync: Populating from state.character as form is not dirty.");
        newFormValues.name = state.character.name || "";
        newFormValues.class = state.character.class || "";
        newFormValues.traits = state.character.traits?.join(', ') || "";
        newFormValues.knowledge = state.character.knowledge?.join(', ') || "";
        newFormValues.background = state.character.background || "";
        newFormValues.description = state.character.aiGeneratedDescription || state.character.description || "";
    } else { // No character in context, or form is dirty
        console.log("CharacterCreation: Form sync: No state.character or form is dirty. Using current form values or defaults.");
        newFormValues.name = currentFormSnapshot.name || staticDefaultValues.name;
        newFormValues.description = currentFormSnapshot.description || staticDefaultValues.description;
        newFormValues.traits = currentFormSnapshot.traits || staticDefaultValues.traits;
        newFormValues.knowledge = currentFormSnapshot.knowledge || staticDefaultValues.knowledge;
        newFormValues.background = currentFormSnapshot.background || staticDefaultValues.background;
    }

    // Specific logic for Immersed Original Character concept to prefill description
    if (isOriginalCharacterImmersed && state.adventureSettings.playerCharacterConcept && !currentFormSnapshot.description) {
        newFormValues.description = state.adventureSettings.playerCharacterConcept;
    }

    // Class field logic based on adventure type
    if (isImmersedMode) { // For any Immersed mode (Existing or Original)
        newFormValues.class = state.character?.class || ""; // Use AI generated class or keep empty
    } else { // Randomized or Custom
        newFormValues.class = currentFormSnapshot.class || "Adventurer"; // Default if empty
    }

    // Only reset if newValues significantly differ from current snapshot or if creationType changed
    const relevantKeys: (keyof FormData)[] = ['name', 'class', 'traits', 'knowledge', 'background', 'description', 'creationType'];
    let needsReset = false;
    for (const key of relevantKeys) {
        if (newFormValues[key] !== undefined && newFormValues[key] !== currentFormSnapshot[key]) {
            needsReset = true;
            break;
        }
    }
    
    if (needsReset) {
        console.log("CharacterCreation: Form sync: Calling reset with new values:", newFormValues);
        reset(newFormValues, { keepDirtyValues: true }); // keepDirty: true to preserve user edits if not explicitly overwritten
        trigger(); // Re-trigger validation
    }

  }, [
    state.character, state.adventureSettings.adventureType, state.adventureSettings.characterOriginType,
    state.adventureSettings.playerCharacterConcept, creationType,
    reset, getValues, trigger, staticDefaultValues, isRandomizing, isGenerating, isDirty
  ]);


  const handleStatChange = useCallback((newStats: CharacterStats) => {
    const newRemaining = calculateRemainingPoints(newStats);
    setStats(newStats);
    setRemainingPoints(newRemaining);
    if (newRemaining < 0) {
      setStatError(`${Math.abs(newRemaining)} point(s) over limit.`);
    } else if (newRemaining > 0) {
      setStatError(`${newRemaining} point(s) remaining.`);
    } else {
      setStatError(null); // All points allocated
    }
  }, [calculateRemainingPoints]);

  const randomizeStats = useCallback(() => {
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
    // Ensure total points constraint is met exactly (distribute/claw back any tiny differences)
    let currentTotal = newAllocatedStats.strength + newAllocatedStats.stamina + newAllocatedStats.wisdom;
    if (currentTotal !== TOTAL_STAT_POINTS) {
        let diff = TOTAL_STAT_POINTS - currentTotal;
        const sortedByVal = allocatedStatKeys.sort((a,b) => newAllocatedStats[a] - newAllocatedStats[b]);
        while(diff !== 0 && sortedByVal.length > 0) {
            const keyToAdjust = diff > 0 ? sortedByVal[0] : sortedByVal[sortedByVal.length -1];
            const change = Math.sign(diff);
            if ((change > 0 && newAllocatedStats[keyToAdjust] < MAX_STAT_VALUE) || (change < 0 && newAllocatedStats[keyToAdjust] > MIN_STAT_VALUE)) {
                newAllocatedStats[keyToAdjust] += change;
                diff -= change;
            } else { // Cannot adjust this key further
                if (diff > 0) sortedByVal.shift(); else sortedByVal.pop();
            }
        }
    }
    const finalStats: CharacterStats = { ...initialCharacterStats, ...newAllocatedStats };
    handleStatChange(finalStats);
  }, [handleStatChange]);

 const randomizeAll = useCallback(async () => {
     setIsRandomizing(true);
     setRandomizationComplete(false);
     setError(null);
     console.log("CharacterCreation: Randomize All button clicked. Active Tab (creationType state):", creationType);

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

     const name = randomNames[Math.floor(Math.random() * randomNames.length)];
     const currentAdvType = state.adventureSettings.adventureType;
     const isImmersedOriginal = currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original";

     // Use setValue for each field to ensure UI updates
     setValue("name", name, { shouldDirty: true, shouldValidate: true });

     if (creationType === 'basic') {
         console.log("Randomize All: Basic tab is active. Randomizing basic fields.");
         const rClass = (currentAdvType !== "Immersed")
                           ? randomClasses[Math.floor(Math.random() * randomClasses.length)]
                           : "";
         setValue("class", rClass, { shouldDirty: true, shouldValidate: true });

         const rTraits = randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2).join(', ');
         setValue("traits", rTraits, { shouldDirty: true, shouldValidate: true });

         const rKnowledge = randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1).join(', ');
         setValue("knowledge", rKnowledge, { shouldDirty: true, shouldValidate: true });

         const rBackground = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
         setValue("background", rBackground, { shouldDirty: true, shouldValidate: true });

         const rDesc = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
         setValue("description", rDesc, { shouldDirty: true, shouldValidate: true });
     } else { // Text tab is active
         console.log("Randomize All: Text tab is active. Randomizing description and suggested basic fields.");
         let desc = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
         if (isImmersedOriginal && state.adventureSettings.playerCharacterConcept) {
             desc = `An original character for ${state.adventureSettings.universeName || 'chosen universe'}: A ${randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)]} named ${name}. ${desc}`;
         }
         setValue("description", desc, { shouldDirty: true, shouldValidate: true });

         // Pre-fill basic fields as suggestions if text tab is active
         setValue("class", (currentAdvType !== "Immersed") ? "Adventurer" : "", { shouldDirty: true, shouldValidate: true });
         setValue("traits", randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) +1).join(', '), { shouldDirty: true, shouldValidate: true });
         setValue("knowledge", randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random()*2)).join(', '), { shouldDirty: true, shouldValidate: true });
         setValue("background", randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)], { shouldDirty: true, shouldValidate: true });
     }
     
     setValue("creationType", creationType, { shouldDirty: true, shouldValidate: true }); // Ensure creationType is also part of the form state

     randomizeStats();

     await new Promise(res => setTimeout(res, 50)); // Small delay for state to propagate

     setIsRandomizing(false);
     setRandomizationComplete(true);
     toast({ title: "Character Randomized!", description: `Created a new character: ${name}. Review and adjust as needed.` });
     setTimeout(() => setRandomizationComplete(false), 1200);
     trigger(); // Trigger validation for the whole form
 }, [creationType, randomizeStats, setValue, state.adventureSettings.adventureType, state.adventureSettings.characterOriginType, state.adventureSettings.universeName, state.adventureSettings.playerCharacterConcept, toast, trigger]);


  const handleGenerateDescription = useCallback(async () => {
     await trigger(["name", "description"]); // Validate relevant fields first
     const currentFormValues = getValues();
     const currentName = currentFormValues.name;
     const currentDescValue = currentFormValues.description;

     const currentAdvType = state.adventureSettings.adventureType;
     const universeNameForAI = currentAdvType === "Immersed" ? state.adventureSettings.universeName : undefined;
     const playerCharacterConceptForAI = (currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original")
                                          ? currentDescValue
                                          : undefined;

     if (!currentName?.trim()) {
         toast({ title: "Name Required", description: "Please enter a character name.", variant: "destructive" }); return;
     }
     const minDescLength = (currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original") ? 10 : 10;
     if (!currentDescValue || currentDescValue.trim().length < minDescLength) {
        let msg = `Description (min ${minDescLength} chars) is required for AI profile generation.`;
        if (currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original") {
            msg = `Original Character Concept (min ${minDescLength} chars in description box) is required.`;
        }
        toast({ title: "Input Required", description: msg, variant: "destructive" }); return;
     }

     setError(null); setIsGenerating(true);
     try {
        const aiInput = {
             characterDescription: currentDescValue,
             isImmersedMode: currentAdvType === "Immersed",
             universeName: universeNameForAI,
             playerCharacterConcept: playerCharacterConceptForAI,
        };
        const result: GenerateCharacterDescriptionOutput = await generateCharacterDescription(aiInput);
        
        setValue("description", result.detailedDescription || currentDescValue, {shouldDirty: true, shouldValidate: true});
        setValue("traits", (result.inferredTraits?.join(', ')) || currentFormValues.traits, {shouldDirty: true, shouldValidate: true});
        setValue("knowledge", (result.inferredKnowledge?.join(', ')) || currentFormValues.knowledge, {shouldDirty: true, shouldValidate: true});
        setValue("background", result.inferredBackground || currentFormValues.background, {shouldDirty: true, shouldValidate: true});

        if (currentAdvType !== "Immersed") {
            setValue("class", result.inferredClass || "Adventurer", {shouldDirty: true, shouldValidate: true});
        } else {
             // For Immersed, class is often a role, handled by AI or concept.
             // If BasicCharacterForm is visible (Immersed Original), its class field is hidden.
             // We set the form value so it's part of data, even if not displayed.
            setValue("class", result.inferredClass || "Immersed Protagonist", {shouldDirty: true, shouldValidate: true});
        }
        
        dispatch({ type: "SET_AI_DESCRIPTION", payload: result.detailedDescription });
        toast({ title: "AI Profile Generated!", description: "Character details updated."});
        await trigger();
     } catch (err) {
       console.error("CharacterCreation: AI generation failed:", err);
       setError("Failed to generate profile. The AI might be busy or encountered an error.");
       toast({ title: "AI Generation Failed", description: (err as Error).message || "Unknown error.", variant: "destructive" });
     } finally { setIsGenerating(false); }
   }, [getValues, setValue, trigger, dispatch, toast, state.adventureSettings]);


  const onSubmit = (data: FormData) => {
     console.log("CharacterCreation: onSubmit called. Form Data:", data, "Current Stats:", stats, "Remaining Points:", remainingPoints, "Form IsValid:", formIsValid, "Errors:", errors);
     setError(null);
     if (remainingPoints !== 0) {
         setStatError(`Please allocate all ${TOTAL_STAT_POINTS} stat points. ${remainingPoints > 0 ? `${remainingPoints} point(s) remaining.` : `${Math.abs(remainingPoints)} point(s) over limit.`}`);
         toast({ title: "Stat Allocation Incomplete", description: statError || "Stat allocation issue.", variant: "destructive"}); return;
     }
     setStatError(null);

     trigger().then(isFormCurrentlyValid => {
        console.log("CharacterCreation: onSubmit - Post-trigger validation result:", isFormCurrentlyValid, "Current formState.isValid:", formIsValid, "Current errors:", errors);
        if (!isFormCurrentlyValid) {
            const fieldErrorMessages = Object.entries(errors).map(([key, err]) => err?.message ? `${key}: ${err.message}` : null).filter(Boolean);
            toast({ title: "Validation Error", description: fieldErrorMessages.join('; ') || "Please correct the highlighted fields.", variant: "destructive"});
            return;
        }

        const finalName = data.name;
        let finalClass = data.class || "Adventurer";
        if (state.adventureSettings.adventureType === "Immersed") {
            finalClass = data.class || state.character?.class || state.adventureSettings.playerCharacterConcept || "Immersed Protagonist";
        }

        const finalTraits: string[] = (typeof data.traits === 'string' ? data.traits.split(',') : data.traits || []).map((t: string) => t.trim()).filter(Boolean);
        const finalKnowledge: string[] = (typeof data.knowledge === 'string' ? data.knowledge.split(',') : data.knowledge || []).map((k: string) => k.trim()).filter(Boolean);
        const finalBackground = data.background ?? "";
        const finalDescription = data.description || "";
        const finalAiGeneratedDescription = state.character?.aiGeneratedDescription === finalDescription ? state.character.aiGeneratedDescription : undefined;

        const characterDataToDispatch: Partial<Character> = {
            name: finalName, class: finalClass, description: finalDescription, traits: finalTraits, knowledge: finalKnowledge,
            background: finalBackground, stats: stats, aiGeneratedDescription: finalAiGeneratedDescription,
        };
        dispatch({ type: "CREATE_CHARACTER_AND_SETUP", payload: characterDataToDispatch });
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
    let specificSchemaValid = formIsValid; // Assume valid unless specific checks fail for modes

    if (state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "original") {
        if (creationType === 'text' && (!watch("description") || watch("description")!.trim().length < 10)) {
            specificSchemaValid = false;
        }
    } else if (state.adventureSettings.adventureType !== "Immersed") {
        if (creationType === 'basic' && !watch("class")?.trim()) {
            specificSchemaValid = false;
        }
        if (creationType === 'text' && (!watch("description") || watch("description")!.trim().length < 10)) {
            specificSchemaValid = false;
        }
    }
    
    const buttonDisabled = generalDisabled || !nameValid || !specificSchemaValid;
    console.log("CharacterCreation: isProceedButtonDisabled check. GeneralDisabled:", generalDisabled, "NameValid:", nameValid, "SpecificSchemaValid:", specificSchemaValid, "formIsValid (overall):", formIsValid, "Result:", buttonDisabled, "Errors:", errors);
    return buttonDisabled;
  }, [isGenerating, isRandomizing, remainingPoints, statError, formIsValid, errors, watch, state.adventureSettings.adventureType, state.adventureSettings.characterOriginType, creationType]);


  if (state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "existing" && !showCharacterDefinitionForms) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
            <CardboardCard className="w-full max-w-md text-center">
                <CardHeader><CardTitle className="text-2xl flex items-center justify-center gap-2"><Loader2 className="w-6 h-6 animate-spin"/> Loading Character...</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Preparing your adventure as {state.adventureSettings.playerCharacterConcept} in {state.adventureSettings.universeName}.</p>
                    <p className="text-xs text-muted-foreground mt-2">You should be taken to the game shortly.</p>
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
                        <p className="text-sm text-center text-muted-foreground mt-1"> Mode: Immersed (Original Character) in <span className="font-semibold">{state.adventureSettings.universeName || "chosen universe"}</span> <br/>Your Initial Concept: <span className="italic">{state.adventureSettings.playerCharacterConcept || watch("description")}</span> </p>
                    )}
                     {(state.adventureSettings.adventureType === "Randomized" || state.adventureSettings.adventureType === "Custom") && (
                         <p className="text-sm text-center text-muted-foreground mt-1"> Mode: {state.adventureSettings.adventureType} Adventure </p>
                     )}
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {error && ( <Alert variant="destructive" className="mb-4"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}

                    {showCharacterDefinitionForms ? (
                        <Tabs value={creationType} onValueChange={(value) => {
                            setCreationType(value as "basic" | "text");
                            setValue("creationType", value as "basic" | "text"); // Sync with RHF
                            trigger(); // Re-validate when tab changes
                        }} className="w-full">
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
                            <AlertTitle>Stat Allocation Only</AlertTitle>
                            <AlertDescription>
                                Character details are pre-defined or AI-generated for this mode. Please allocate stats.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Separator />

                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                            <h3 className="text-xl font-semibold flex items-center gap-1.5"><TrendingUp className="w-5 h-5"/>Allocate Stats ({stats.strength + stats.stamina + stats.wisdom} / {TOTAL_STAT_POINTS} Points)</h3>
                             <p className={`text-sm font-medium ${statError && remainingPoints !==0 ? 'text-destructive' : (remainingPoints === 0 ? 'text-green-600' : 'text-muted-foreground')}`}>
                                {(statError && remainingPoints !==0) ? ( <span className="flex items-center gap-1"> <AlertCircle className="h-4 w-4" /> {statError} </span>
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
                                    <p>Generate random character details and stats.</p>
                                    {!showCharacterDefinitionForms && <p className="text-xs text-muted-foreground">(Character details pre-defined/AI-gen for this mode.)</p>}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button
                            type="submit"
                            className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
                            disabled={isProceedButtonDisabled}
                            aria-label="Save character and proceed"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === 'existing'
                                ? "Start Adventure"
                                : "Proceed to Adventure Setup"
                            }
                        </Button>
                    </div>
                </CardFooter>
            </CardboardCard>
        </form>
    </div>
  );
}

