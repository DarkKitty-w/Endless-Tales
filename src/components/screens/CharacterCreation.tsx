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
import { initialCharacterState, initialCharacterStats as defaultInitialStats } from "@/context/game-initial-state";
import { BasicCharacterForm } from "@/components/character/BasicCharacterForm";
import { TextCharacterForm } from "@/components/character/TextCharacterForm";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnMagicIcon as HandDrawnWisdomIcon } from "@/components/icons/HandDrawnIcons"; // Re-using MagicIcon for Wisdom
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
  if (currentGlobalAdventureType === "Immersed") {
    if (currentGlobalCharacterOriginType === "original" && data.creationType === "text") {
      if (!data.description || data.description.trim().length < 10) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Description (min 10 chars) is required for AI profile generation (Immersed Original).", path: ["description"] });
      }
    }
    return;
  }
  if (data.creationType === "basic") {
    if (!data.class || data.class.trim() === "") {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Class is required for Randomized/Custom adventures.", path: ["class"] });
    }
  } else if (data.creationType === "text") {
    if (!data.description || data.description.trim().length < 10) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Description (min 10 chars) is required for AI profile generation (Randomized/Custom).", path: ["description"] });
    }
  }
});

type FormData = z.infer<typeof combinedSchema>;

const staticDefaultValues: FormData = {
    creationType: "basic", name: "", class: "", traits: "", knowledge: "", background: "", description: "",
};

export function CharacterCreation() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [creationType, setCreationType] = useState<"basic" | "text">("basic");

  const calculateRemainingPoints = useCallback((currentStats: CharacterStats): number => {
    const allocatedTotal = currentStats.strength + currentStats.stamina + currentStats.wisdom; // Updated stats
    return TOTAL_STAT_POINTS - allocatedTotal;
  }, []);

  const [stats, setStats] = useState<CharacterStats>(() => {
    const characterStats = state.character?.stats;
    const initial = characterStats ? { ...defaultInitialStats, ...characterStats } : { ...defaultInitialStats };
     if (initial.strength + initial.stamina + initial.wisdom > TOTAL_STAT_POINTS || // Updated stats
         initial.strength < MIN_STAT_VALUE || initial.stamina < MIN_STAT_VALUE || initial.wisdom < MIN_STAT_VALUE ) { // Updated stats
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
     defaultValues: staticDefaultValues,
   });
   const { errors, isValid: formIsValid, isDirty, dirtyFields } = formState;

   useEffect(() => {
    currentGlobalAdventureType = state.adventureSettings.adventureType;
    currentGlobalCharacterOriginType = state.adventureSettings.characterOriginType;

    const formSnapshot = getValues();
    const newFormValues: Partial<FormData> = {
        creationType: creationType,
        name: dirtyFields.name ? formSnapshot.name : state.character?.name || staticDefaultValues.name,
        class: (currentGlobalAdventureType === "Immersed")
                ? ""
                : (dirtyFields.class ? formSnapshot.class : state.character?.class || staticDefaultValues.class || "Adventurer"),
        traits: dirtyFields.traits ? formSnapshot.traits : state.character?.traits?.join(', ') || staticDefaultValues.traits,
        knowledge: dirtyFields.knowledge ? formSnapshot.knowledge : state.character?.knowledge?.join(', ') || staticDefaultValues.knowledge,
        background: dirtyFields.background ? formSnapshot.background : state.character?.background || staticDefaultValues.background,
        description: dirtyFields.description ? formSnapshot.description : (state.character?.aiGeneratedDescription || state.character?.description || staticDefaultValues.description),
    };
     if (currentGlobalAdventureType === "Immersed" && currentGlobalCharacterOriginType === "original" &&
         !dirtyFields.description && state.adventureSettings.playerCharacterConcept &&
         newFormValues.description !== state.adventureSettings.playerCharacterConcept) {
         newFormValues.description = state.adventureSettings.playerCharacterConcept;
     }

    if (!_.isEqual(_.pick(formSnapshot, Object.keys(newFormValues) as (keyof FormData)[]), newFormValues)) {
        reset(newFormValues as FormData, { keepDirtyValues: true });
    }
    trigger();
  }, [
    state.character, state.adventureSettings.adventureType, state.adventureSettings.characterOriginType,
    state.adventureSettings.playerCharacterConcept, creationType,
    reset, getValues, dirtyFields, trigger,
  ]);

  const handleStatChange = useCallback((newStats: CharacterStats) => {
    const newRemaining = calculateRemainingPoints(newStats);
    setStats(newStats);
    setRemainingPoints(newRemaining);

    if (newRemaining < 0) {
        setStatError(`${Math.abs(newRemaining)} point(s) over limit.`);
    } else if (newRemaining > 0) {
        setStatError(null); // Clear error if points are remaining but not over limit
    } else { // newRemaining === 0
        setStatError(null);
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
    setIsRandomizing(false);
  }, [handleStatChange]);

 const randomizeAll = useCallback(async () => {
     setIsRandomizing(true);
     setRandomizationComplete(false);
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
     const dataToSet: Partial<FormData> = {
        creationType: currentCreationTypeForRandom, name: name,
        class: "", traits: "", knowledge: "", background: "", description: ""
     };
     const currentAdvType = state.adventureSettings.adventureType;
     if (currentCreationTypeForRandom === 'basic') {
         dataToSet.class = (currentAdvType === "Immersed") ? "" : randomClasses[Math.floor(Math.random() * randomClasses.length)];
         dataToSet.traits = randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1).join(', ');
         dataToSet.knowledge = randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1).join(', ');
         dataToSet.background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
     } else {
         let desc = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
         if (currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original") {
             desc = `Concept for ${state.adventureSettings.universeName || 'chosen universe'}: A ${randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)]} named ${name}. ${desc}`;
         }
         dataToSet.description = desc;
         dataToSet.class = (currentAdvType === "Immersed") ? "" : "Adventurer";
     }
     reset(dataToSet as FormData);
     randomizeStats();
     await new Promise(res => setTimeout(res, 200));
     setIsRandomizing(false);
     setRandomizationComplete(true);
     toast({ title: "Character Randomized!", description: `Created a new character: ${name}` });
     setTimeout(() => setRandomizationComplete(false), 1200);
     trigger();
 }, [creationType, randomizeStats, reset, state.adventureSettings.adventureType, state.adventureSettings.characterOriginType, state.adventureSettings.universeName, toast, trigger, watch]);

  const handleGenerateDescription = useCallback(async () => {
     await trigger(["name", "description"]);
     const currentName = getValues("name");
     const currentDescValue = getValues("description");
     const currentAdvType = state.adventureSettings.adventureType;
     const universeNameForAI = currentAdvType === "Immersed" ? state.adventureSettings.universeName : undefined;
     const playerCharacterConceptForAI = (currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original")
                                          ? currentDescValue
                                          : undefined;
     if (!currentName?.trim()) {
         toast({ title: "Name Required", description: "Please enter a character name.", variant: "destructive" }); return;
     }
     if (!currentDescValue || currentDescValue.length < 10) {
        let msg = "Description (min 10 chars) required for AI profile generation.";
        if (currentAdvType === "Immersed" && state.adventureSettings.characterOriginType === "original") {
            msg = "Original Character Concept (min 10 chars in description box) required for AI profile.";
        }
        toast({ title: "Input Required", description: msg, variant: "destructive" }); return;
     }
     setError(null); setIsGenerating(true);
     try {
        const aiInput = {
             characterDescription: currentDescValue, isImmersedMode: currentAdvType === "Immersed",
             universeName: universeNameForAI, playerCharacterConcept: playerCharacterConceptForAI,
        };
        const result: GenerateCharacterDescriptionOutput = await generateCharacterDescription(aiInput);
        setValue("description", result.detailedDescription || currentDescValue, { shouldValidate: true, shouldDirty: true });
        if (currentAdvType !== "Immersed") {
            setValue("class", result.inferredClass || "Adventurer", { shouldValidate: true, shouldDirty: true });
        } else {
            setValue("class", "", { shouldValidate: true, shouldDirty: true });
        }
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
     } finally { setIsGenerating(false); }
   }, [getValues, setValue, trigger, dispatch, toast, state.adventureSettings]);

  const onSubmit = (data: FormData) => {
     setError(null);
     if (remainingPoints !== 0) {
         setStatError(`Please allocate all ${TOTAL_STAT_POINTS} stat points. ${remainingPoints > 0 ? `${remainingPoints} point(s) remaining.` : `${Math.abs(remainingPoints)} point(s) over limit.`}`);
         toast({ title: "Stat Allocation Incomplete", description: statError || "Stat points issue.", variant: "destructive"}); return;
     }
     setStatError(null);
     if (!formIsValid) {
         const fieldErrorMessages = Object.entries(errors).map(([key, err]) => err?.message ? `${key}: ${err.message}` : null).filter(Boolean);
         toast({ title: "Validation Error", description: fieldErrorMessages.join('; ') || "Please correct the highlighted fields.", variant: "destructive"});
         return;
     }
     const finalName = data.name;
     let finalClass = (state.adventureSettings.adventureType === "Immersed") ? (data.class || state.adventureSettings.playerCharacterConcept || "Immersed Protagonist") : (data.class || "Adventurer");
     const finalTraits: string[] = data.traits?.split(',').map((t: string) => t.trim()).filter(Boolean) ?? [];
     const finalKnowledge: string[] = data.knowledge?.split(',').map((k: string) => k.trim()).filter(Boolean) ?? [];
     const finalBackground = data.background ?? "";
     const finalDescription = data.description || "";
     const finalAiGeneratedDescription = (isGenerating || getValues("description") !== (state.character?.aiGeneratedDescription || state.character?.description)) ? getValues("description") : state.character?.aiGeneratedDescription;
     const characterDataToDispatch: Partial<Character> = {
         name: finalName, class: finalClass, description: finalDescription, traits: finalTraits, knowledge: finalKnowledge,
         background: finalBackground, stats: stats, aiGeneratedDescription: finalAiGeneratedDescription,
     };
     dispatch({ type: "CREATE_CHARACTER_AND_SETUP", payload: characterDataToDispatch });
     toast({ title: "Character Ready!", description: `Welcome, ${finalName}. Proceed to adventure setup!` });
   };

  const handleBackToMenu = () => { dispatch({ type: "RESET_GAME" }); };

  const showCharacterDefinitionForms = useMemo(() => {
    const advType = state.adventureSettings.adventureType;
    const originType = state.adventureSettings.characterOriginType;
    return advType !== "Immersed" || (advType === "Immersed" && originType === "original");
  }, [state.adventureSettings.adventureType, state.adventureSettings.characterOriginType]);

  const isProceedButtonDisabled = useMemo(() => {
    const nameValid = !!watch("name")?.trim();
    const generalDisabled = isGenerating || isRandomizing || remainingPoints !== 0 || !!statError;
    return generalDisabled || !formIsValid || !nameValid;
  }, [isGenerating, isRandomizing, remainingPoints, statError, formIsValid, errors, watch]);

  if (state.adventureSettings.adventureType === "Immersed" && state.adventureSettings.characterOriginType === "existing" && !showCharacterDefinitionForms) {
    return ( <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background"> <CardboardCard className="w-full max-w-md text-center"> <CardHeader><CardTitle className="text-2xl flex items-center justify-center gap-2"><Loader2 className="w-6 h-6 animate-spin"/> Preparing Character</CardTitle></CardHeader> <CardContent><p className="text-muted-foreground">Loading details for {state.adventureSettings.playerCharacterConcept || "your character"}...</p><p className="text-xs text-muted-foreground mt-2">(If this screen persists, please return to the Main Menu.)</p></CardContent> <CardFooter><Button onClick={handleBackToMenu} className="w-full" variant="outline">Back to Main Menu</Button></CardFooter> </CardboardCard> </div> );
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
                        <p className="text-sm text-center text-muted-foreground mt-1"> Mode: Immersed (Original Character) in <span className="font-semibold">{state.adventureSettings.universeName || "chosen universe"}</span> <br/>Initial Concept/Role: <span className="italic">{state.adventureSettings.playerCharacterConcept || 'Your Concept'}</span> </p>
                    )}
                     {(state.adventureSettings.adventureType === "Randomized" || state.adventureSettings.adventureType === "Custom") && (
                         <p className="text-sm text-center text-muted-foreground mt-1"> Mode: {state.adventureSettings.adventureType} Adventure </p>
                     )}
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {error && ( <Alert variant="destructive" className="mb-4"> <AlertCircle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle> <AlertDescription>{error}</AlertDescription> </Alert> )}
                    {showCharacterDefinitionForms ? (
                        <Tabs value={creationType} onValueChange={(value) => setCreationType(value as "basic" | "text")} className="w-full">
                            <TabsList className="grid w-full grid-cols-2"> <TabsTrigger value="basic">Basic Fields</TabsTrigger> <TabsTrigger value="text">Text Description (AI Assist)</TabsTrigger> </TabsList>
                            <TabsContent value="basic" className="space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50">
                                <BasicCharacterForm register={register as UseFormRegister<any>} errors={errors as FieldErrors<any>} adventureType={state.adventureSettings.adventureType} />
                            </TabsContent>
                            <TabsContent value="text" className="space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50">
                                <TextCharacterForm register={register as UseFormRegister<any>} errors={errors as FieldErrors<any>} onGenerateDescription={handleGenerateDescription} isGenerating={isGenerating} watchedName={watch("name")} watchedDescription={watch("description")} />
                            </TabsContent>
                        </Tabs>
                    ) : ( <Alert> <User className="h-4 w-4" /> <AlertTitle>Character Profile Information</AlertTitle> <AlertDescription> Core details for this character type are typically AI-generated or pre-defined for this adventure mode. Please allocate stats below. </AlertDescription> </Alert> )}
                    <Separator />
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
                            <StatAllocationInput label="Strength" statKey="strength" value={stats.strength} onChange={(key, val) => handleStatChange({...stats, [key]: val})} Icon={HandDrawnStrengthIcon} disabled={isGenerating || isRandomizing} remainingPoints={remainingPoints}/>
                            <StatAllocationInput label="Stamina" statKey="stamina" value={stats.stamina} onChange={(key, val) => handleStatChange({...stats, [key]: val})} Icon={HandDrawnStaminaIcon} disabled={isGenerating || isRandomizing} remainingPoints={remainingPoints}/>
                            <StatAllocationInput label="Wisdom" statKey="wisdom" value={stats.wisdom} onChange={(key, val) => handleStatChange({...stats, [key]: val})} Icon={HandDrawnWisdomIcon} disabled={isGenerating || isRandomizing} remainingPoints={remainingPoints}/>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-foreground/10">
                     <Button type="button" onClick={handleBackToMenu} variant="outline" aria-label="Back to Main Menu" className="w-full sm:w-auto"> <LogOut className="mr-2 h-4 w-4" /> Back to Main Menu </Button>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <TooltipProvider> <Tooltip> <TooltipTrigger asChild>
                            <Button type="button" onClick={randomizeAll} variant="secondary" aria-label="Randomize All Character Fields and Stats" className="relative overflow-hidden w-full sm:w-auto" disabled={isRandomizing || isGenerating || !showCharacterDefinitionForms} >
                                <RotateCcw className={`mr-2 h-4 w-4 ${isRandomizing ? 'animate-spin' : ''}`} />
                                {isRandomizing ? 'Randomizing...' : 'Randomize All'}
                                {randomizationComplete && <CheckCircle className="absolute right-2 h-4 w-4 text-green-500 opacity-100 transition-opacity duration-300" />}
                            </Button>
                        </TooltipTrigger> <TooltipContent><p>Generate a random character name, details (if applicable), and stats.</p> {!showCharacterDefinitionForms && <p className="text-xs text-muted-foreground">(Character details are pre-defined for this mode.)</p>}</TooltipContent> </Tooltip> </TooltipProvider>
                        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto" disabled={isProceedButtonDisabled} aria-label="Save character and proceed" >
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
