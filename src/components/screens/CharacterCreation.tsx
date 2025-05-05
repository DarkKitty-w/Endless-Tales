// src/components/screens/CharacterCreation.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGame } from "@/context/GameContext";
import type { Character, CharacterStats } from "@/types/character-types"; // Use specific type file
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Wand2, RotateCcw, User, Save, AlertCircle, CheckCircle } from "lucide-react";
import { generateCharacterDescription, type GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { StatAllocationInput } from "@/components/character/StatAllocationInput"; // Import the new input component
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants"; // Import from constants file
import { initialStats as defaultInitialStats } from "@/context/game-initial-state"; // Import initialStats with alias
import { BasicCharacterForm } from "@/components/character/BasicCharacterForm"; // Import Basic form component
import { TextCharacterForm } from "@/components/character/TextCharacterForm"; // Import Text form component
import { CharacterStatsAllocator } from "@/components/character/CharacterStatsAllocator"; // Import Stats Allocator

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
  // State for stats moved to CharacterStatsAllocator
  const [stats, setStats] = useState<CharacterStats>(() => {
    return state.character?.stats ? { ...defaultInitialStats, ...state.character.stats } : { ...defaultInitialStats };
  });
  const [remainingPoints, setRemainingPoints] = useState<number>(() => calculateRemainingPoints(stats));
  const [statError, setStatError] = useState<string | null>(null);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [randomizationComplete, setRandomizationComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null); // General error

  // --- Stat Allocation Logic ---
  const calculateRemainingPoints = (currentStats: CharacterStats): number => {
    const allocatedTotal = currentStats.strength + currentStats.stamina + currentStats.agility;
    return TOTAL_STAT_POINTS - allocatedTotal;
  };

  const handleStatChange = useCallback((newStats: CharacterStats) => {
    const newRemaining = calculateRemainingPoints(newStats);
    setStats(newStats);
    setRemainingPoints(newRemaining);
    if (newRemaining < 0) {
      setStatError(`1 point over the limit`);
    } else {
      setStatError(null);
    }
  }, []);

  // Determine the current schema based on the selected tab
  const currentSchema = creationType === "basic" ? basicCreationSchema : textCreationSchema;

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, trigger } = useForm<FormData>({
     resolver: zodResolver(currentSchema),
     mode: "onChange",
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

    const finalStats: CharacterStats = {
        ...defaultInitialStats, // Start with the base defaults for all stats
        ...newAllocatedStats,
    };

    handleStatChange(finalStats); // Update stats using the handler
  }, [handleStatChange]);


 // --- Randomize All ---
 const randomizeAll = useCallback(async () => {
     setIsRandomizing(true); // Start animation
     setRandomizationComplete(false); // Hide checkmark initially
     await new Promise(res => setTimeout(res, 300)); // Wait for visual effect

     // Reset errors
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
         // Reset basic fields when randomizing text description
         setValue("class", "Adventurer");
         setValue("traits", "");
         setValue("knowledge", "");
         setValue("background", "");
     }

     randomizeStats(); // Randomize stats

     await new Promise(res => setTimeout(res, 200)); // Allow state to update visually
     setIsRandomizing(false); // End animation
     setRandomizationComplete(true); // Show checkmark
     // Hide checkmark after a delay
     setTimeout(() => setRandomizationComplete(false), 1000);
     trigger(); // Trigger validation after setting values

 }, [creationType, reset, setValue, randomizeStats, trigger, watch]);


  // --- AI Description Generation ---
  const handleGenerateDescription = useCallback(async () => {
     await trigger("description");
     const currentDescValue = watch("description");
     const currentName = watch("name");
     const descError = errors.description;

     if (!currentName || descError || !currentDescValue || currentDescValue.length < 10) {
       setError("Please provide a valid name and description (min 10 chars) before generating.");
       return;
     }

     setError(null);
     setIsGenerating(true);
     try {
        console.log("Calling generateCharacterDescription with:", currentDescValue);
        const result: GenerateCharacterDescriptionOutput = await generateCharacterDescription({ characterDescription: currentDescValue });
        console.log("AI Result:", result);

         // Update the main description field with the AI's elaborated text
         setValue("description", result.detailedDescription || currentDescValue, { shouldValidate: true, shouldDirty: true });

         // Update the BASIC fields based on AI inference
         setValue("class", result.inferredClass || "Adventurer", { shouldValidate: true, shouldDirty: true });
         setValue("traits", (result.inferredTraits && result.inferredTraits.length > 0) ? result.inferredTraits.join(', ') : "", { shouldValidate: true, shouldDirty: true });
         setValue("knowledge", (result.inferredKnowledge && result.inferredKnowledge.length > 0) ? result.inferredKnowledge.join(', ') : "", { shouldValidate: true, shouldDirty: true });
         setValue("background", result.inferredBackground || "", { shouldValidate: true, shouldDirty: true });

         dispatch({ type: "SET_AI_DESCRIPTION", payload: result.detailedDescription });

         // Trigger validation for the updated basic fields AFTER setting them
         setTimeout(() => {
            trigger(["class", "traits", "knowledge", "background", "description"]);
          }, 0); // Use setTimeout to ensure state updates are processed

     } catch (err) {
       console.error("AI generation failed:", err);
       setError("Failed to generate description or infer details. The AI might be busy or encountered an error. Please try again later.");
     } finally {
       setIsGenerating(false);
     }
   }, [watch, trigger, errors.description, setValue, dispatch]);


  // --- Form Submission ---
  const onSubmit = (data: FormData) => {
    setError(null);

    if (remainingPoints !== 0) {
      setStatError(`Cannot proceed: ${remainingPoints > 0 ? `${remainingPoints} points remaining.` : `Points exceed limit.`}`);
      return;
    }
    if (Object.entries(stats).some(([key, val]) => ['strength', 'stamina', 'agility'].includes(key) && (val < MIN_STAT_VALUE || val > MAX_STAT_VALUE))) {
      setStatError(`Stats (STR, STA, AGI) must be between ${MIN_STAT_VALUE} and ${MAX_STAT_VALUE}.`);
      return;
    }
    setStatError(null); // Clear stat error if validation passes


    let characterData: Partial<Character>;

    if (data.creationType === 'text') {
        const currentClass = watch("class") || "Adventurer";
        const currentTraits = watch("traits")?.split(',').map(t => t.trim()).filter(Boolean) ?? [];
        const currentKnowledge = watch("knowledge")?.split(',').map(k => k.trim()).filter(Boolean) ?? [];
        const currentBackground = watch("background") || "";
        const currentDescription = watch("description");

        characterData = {
          name: data.name,
          description: currentDescription,
          class: currentClass,
          traits: currentTraits,
          knowledge: currentKnowledge,
          background: currentBackground,
          stats: stats,
          aiGeneratedDescription: state.character?.aiGeneratedDescription,
        };
    } else {
        const traitsArray = data.traits?.split(',').map(t => t.trim()).filter(Boolean) ?? [];
        const knowledgeArray = data.knowledge?.split(',').map(k => k.trim()).filter(Boolean) ?? [];
        const currentClass = data.class?.trim() || "Adventurer";
        const currentBackground = data.background?.trim() ?? "";

        let finalDescription = watch("description");
        if (!finalDescription) {
             finalDescription = `A ${currentClass} ${currentBackground ? `with a background as a ${currentBackground}` : ''}, known for being ${traitsArray.join(', ') || 'undefined'} and having knowledge of ${knowledgeArray.join(', ') || 'nothing specific'}.`;
        }

        characterData = {
            name: data.name,
            class: currentClass,
            description: finalDescription,
            traits: traitsArray,
            knowledge: knowledgeArray,
            background: currentBackground,
            stats: stats,
            aiGeneratedDescription: state.character?.aiGeneratedDescription,
        };
    }

    dispatch({ type: "CREATE_CHARACTER", payload: characterData });
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
       trigger(); // Validate after schema change
   }, [creationType, reset, watch, setValue, trigger]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl">
            <CardboardCard className="shadow-xl border-2 border-foreground/20">
                <CardHeader className="border-b border-foreground/10 pb-4">
                    <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
                        <User className="w-7 h-7"/> Create Your Adventurer
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Hold On!</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* --- Name Input (Moved to BasicCharacterForm) --- */}
                    {/* <NameInput register={register} errors={errors} /> */}

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
                            <BasicCharacterForm register={register} errors={errors} />
                        </TabsContent>

                        {/* --- Text-Based Creation Content --- */}
                        <TabsContent value="text" className="space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50">
                            <TextCharacterForm
                                register={register}
                                errors={errors}
                                onGenerateDescription={handleGenerateDescription}
                                isGenerating={isGenerating}
                                watchedName={watch("name")} // Pass watched name
                                watchedDescription={watch("description")} // Pass watched description
                            />
                        </TabsContent>
                    </Tabs>

                    {/* --- Stat Allocation --- */}
                    <Separator />
                    <CharacterStatsAllocator
                        stats={stats}
                        remainingPoints={remainingPoints}
                        statError={statError}
                        onStatChange={handleStatChange}
                        isGenerating={isGenerating || isRandomizing}
                    />

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
                                     {/* Checkmark appears briefly after randomizing */}
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
                         disabled={isGenerating || isRandomizing || remainingPoints !== 0} // Disable if generating, randomizing, or points remain
                         aria-label="Save character and proceed to adventure setup"
                      >
                         <Save className="mr-2 h-4 w-4" />
                         {remainingPoints !== 0 ? 'Invalid Allocation' : 'Proceed to Adventure Setup'}
                     </Button>
                 </CardFooter>
            </CardboardCard>
        </form>
    </div>
  );
}
    