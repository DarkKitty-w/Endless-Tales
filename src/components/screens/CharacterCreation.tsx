// src/components/screens/CharacterCreation.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGame } from "@/context/GameContext";
import type { Character, CharacterStats } from "@/types/game-types"; // Import centralized types
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Slider } from "@/components/ui/slider";
import { Wand2, Dices, User, Save, RotateCcw, Info, ShieldQuestion, CheckCircle } from "lucide-react"; // Added checkCircle
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "@/components/icons/HandDrawnIcons";
import { generateCharacterDescription, type GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import StatRadarChart from "@/components/game/StatRadarChart"; // Import StatRadarChart as default
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants"; // Import from constants file

// --- Zod Schema for Validation ---
const baseCharacterSchema = z.object({
  name: z.string().min(1, "Character name is required.").max(50, "Name too long (max 50)."),
});

const commaSeparatedMaxItems = (max: number, message: string) =>
  z.string()
   .refine(val => val === undefined || val === "" || val.split(',').map(s => s.trim()).filter(Boolean).length <= max, { message })
   .optional()
   .transform(val => val || "");


const basicCreationSchema = baseCharacterSchema.extend({
  creationType: z.literal("basic"),
  class: z.string().min(1, "Class is required.").max(30, "Class name too long (max 30).").default("Adventurer"),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed (comma-separated)."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed (comma-separated)."),
  background: z.string().max(100, "Background too long (max 100).").optional().transform(val => val || ""),
});

const textCreationSchema = baseCharacterSchema.extend({
  creationType: z.literal("text"),
  description: z.string().min(10, "Please provide a brief description (at least 10 characters)."), // Removed max limit
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
  // Initialize stats correctly based on context or defaults
   const initialStats = state.character?.stats ?? { strength: 5, stamina: 5, agility: 5 };
   const [stats, setStats] = useState<CharacterStats>(initialStats);
  // Calculate initial remaining points based on the initialized stats
   const initialPoints = TOTAL_STAT_POINTS - (initialStats.strength + initialStats.stamina + initialStats.agility);
  const [remainingPoints, setRemainingPoints] = useState(initialPoints);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [randomizedAllComplete, setRandomizedAllComplete] = useState(false); // Track randomize all animation state


  // Determine the current schema based on the selected tab
  const currentSchema = creationType === "basic" ? basicCreationSchema : textCreationSchema;

  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue, trigger } = useForm<FormData>({
     resolver: zodResolver(currentSchema),
     mode: "onChange",
     defaultValues: { // Populate with existing character data if available, otherwise defaults
        creationType: "basic",
        name: state.character?.name ?? "",
        class: state.character?.class ?? "Adventurer",
        traits: state.character?.traits?.join(', ') ?? "",
        knowledge: state.character?.knowledge?.join(', ') ?? "",
        background: state.character?.background ?? "",
        description: state.character?.description ?? "", // Use main description field
     },
   });


  // --- Stat Allocation Logic ---
 const handleStatChange = useCallback((statName: keyof CharacterStats, value: number) => {
    const clampedValue = Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, value));

    setStats(prevStats => {
        const tentativeStats = { ...prevStats, [statName]: clampedValue };
        const currentTotal = tentativeStats.strength + tentativeStats.stamina + tentativeStats.agility;

        if (currentTotal <= TOTAL_STAT_POINTS) {
            setRemainingPoints(TOTAL_STAT_POINTS - currentTotal);
            return tentativeStats;
        } else {
            // Don't show toast if the value hasn't actually changed due to clamping
            if (tentativeStats[statName] !== prevStats[statName]) {
               toast({
                 title: "Stat Limit Reached",
                 description: `Cannot exceed ${TOTAL_STAT_POINTS} total stat points.`,
                 variant: "destructive",
               });
             }
            setRemainingPoints(TOTAL_STAT_POINTS - (prevStats.strength + prevStats.stamina + prevStats.agility));
            return prevStats;
        }
    });
 }, [toast]);


 const randomizeStats = useCallback(() => {
    let pointsLeft = TOTAL_STAT_POINTS;
    let newStats: CharacterStats = { strength: 0, stamina: 0, agility: 0 };
    const statKeys: (keyof CharacterStats)[] = ['strength', 'stamina', 'agility'];

    // Initialize with minimum values
    statKeys.forEach(key => {
        newStats[key] = MIN_STAT_VALUE;
        pointsLeft -= MIN_STAT_VALUE;
    });

    // Distribute remaining points randomly
    while (pointsLeft > 0) {
        const availableKeys = statKeys.filter(key => newStats[key] < MAX_STAT_VALUE);
        if (availableKeys.length === 0) break; // Should not happen if MAX_STAT_VALUE * 3 > TOTAL_STAT_POINTS
        const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        newStats[randomKey]++;
        pointsLeft--;
    }

    // Final check to ensure correctness - adjust if somehow total is wrong
    const finalTotal = newStats.strength + newStats.stamina + newStats.agility;
    if (finalTotal !== TOTAL_STAT_POINTS) {
        console.error("Stat randomization resulted in an incorrect total:", finalTotal, newStats, "Resetting to 5/5/5.");
        // Simple reset if error occurs, could implement a correction logic instead
        newStats = { strength: 5, stamina: 5, agility: 5 };
        setRemainingPoints(0);
    } else {
       setRemainingPoints(0);
    }


    setStats(newStats);
 }, [setStats, setRemainingPoints]);


  // --- Randomize All ---
  const randomizeAll = useCallback(() => {
    setRandomizedAllComplete(false); // Start animation

    const randomNames = ["Anya", "Borin", "Carys", "Darian", "Elara", "Fendrel", "Gorok"];
    const randomClasses = ["Warrior", "Rogue", "Mage", "Scout", "Scholar", "Wanderer", "Guard", "Tinkerer", "Healer", "Bard", "Adventurer"]; // Added Adventurer
    const randomTraitsPool = ["Brave", "Curious", "Cautious", "Impulsive", "Loyal", "Clever", "Resourceful", "Quiet", "Stern", "Generous", "Optimistic", "Pessimistic"];
    const randomKnowledgePool = ["Herbalism", "Local Lore", "Survival", "Trading", "Ancient Runes", "Beasts", "Smithing", "First Aid", "Storytelling", "Navigation", "History", "Magic"];
    const randomBackgrounds = ["Farmer", "Orphan", "Noble Exile", "Street Urchin", "Acolyte", "Guard", "Merchant's Child", "Hermit", "Former Soldier", "Wanderer"];
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

    // Get current values before reset if needed, or just reset fully
    const currentValues = watch();
    reset(); // Clear form fields first

    // Pick random elements
    const name = randomNames[Math.floor(Math.random() * randomNames.length)];
    setValue("name", name);

    if (creationType === 'basic') {
        const charClass = randomClasses[Math.floor(Math.random() * randomClasses.length)];
        const traits = randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1).join(', '); // 1 to 4 traits
        const knowledge = randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 1).join(', '); // 1 to 4 knowledge areas
        const background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
        setValue("creationType", "basic"); // Ensure type is set
        setValue("class", charClass);
        setValue("traits", traits);
        setValue("knowledge", knowledge);
        setValue("background", background);
        setValue("description", ""); // Clear description if switching to basic
    } else {
         const description = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
         setValue("creationType", "text"); // Ensure type is set
         setValue("description", description);
         // Set basic fields to defaults/empty when randomizing text description
         setValue("class", "Adventurer");
         setValue("traits", "");
         setValue("knowledge", "");
         setValue("background", "");
    }

    randomizeStats(); // Randomize stats as well
    trigger(); // Trigger validation after setting values

    // Show completed animation after a short delay
    setTimeout(() => {
        setRandomizedAllComplete(true);
    }, 700); // Delay matches animation duration


  }, [creationType, reset, setValue, randomizeStats, trigger, watch]); // Removed toast from dependencies


  // Watch form values for dynamic checks
  const watchedName = watch("name");
  const watchedDescription = watch("description");
  // Validate description field directly from form state errors
  const isDescriptionFieldValid = !errors.description && !!watchedDescription && watchedDescription.length >= 10;


  // --- AI Description Generation ---
  const handleGenerateDescription = async () => {
     // Trigger validation for the description field specifically
     await trigger("description");
     // Get the potentially updated description value and error state
     const currentDescValue = watch("description");
     const descError = errors.description;

     if (!watchedName || descError || !currentDescValue || currentDescValue.length < 10) {
       setError("Please provide a valid name and description (min 10 chars) before generating.");
       toast({ title: "Input Required", description: "Valid name and description (min 10 chars) needed.", variant: "destructive"});
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

        // Update the BASIC fields based on AI inference, ONLY if AI provided values
        if (result.inferredClass) {
            setValue("class", result.inferredClass, { shouldValidate: true, shouldDirty: true });
        }
        if (result.inferredTraits && result.inferredTraits.length > 0) {
            setValue("traits", result.inferredTraits.join(', '), { shouldValidate: true, shouldDirty: true });
        }
        if (result.inferredKnowledge && result.inferredKnowledge.length > 0) {
            setValue("knowledge", result.inferredKnowledge.join(', '), { shouldValidate: true, shouldDirty: true });
        }
        if (result.inferredBackground) {
            setValue("background", result.inferredBackground, { shouldValidate: true, shouldDirty: true });
        }

        // Store the raw AI-generated description separately in context if needed for display elsewhere
        dispatch({ type: "SET_AI_DESCRIPTION", payload: result.detailedDescription });

        toast({
          title: "AI Profile Generated!",
          description: "Description updated and basic fields inferred.",
        });

        // Ensure validation is triggered for newly populated fields AFTER setting values
        setTimeout(() => {
          trigger(["class", "traits", "knowledge", "background", "description"]);
        }, 0);

     } catch (err) {
       console.error("AI generation failed:", err);
       setError("Failed to generate description or infer details. The AI might be busy or encountered an error. Please try again later.");
       toast({ title: "AI Error", description: "Could not generate profile.", variant: "destructive"});
     } finally {
       setIsGenerating(false);
     }
   };

  // --- Form Submission ---
  const onSubmit = (data: FormData) => {
    setError(null); // Clear previous errors

     if (remainingPoints !== 0) {
        setError(`You must allocate all ${TOTAL_STAT_POINTS} stat points. ${remainingPoints} remaining.`);
        toast({ title: "Stat Allocation Incomplete", description: `Allocate the remaining ${remainingPoints} points.`, variant: "destructive"});
        return;
     }
     if (stats.strength < MIN_STAT_VALUE || stats.stamina < MIN_STAT_VALUE || stats.agility < MIN_STAT_VALUE ||
         stats.strength > MAX_STAT_VALUE || stats.stamina > MAX_STAT_VALUE || stats.agility > MAX_STAT_VALUE) {
         setError(`Stats must be between ${MIN_STAT_VALUE} and ${MAX_STAT_VALUE}.`);
         toast({ title: "Invalid Stat Value", description: `Ensure all stats are between ${MIN_STAT_VALUE} and ${MAX_STAT_VALUE}.`, variant: "destructive"});
         return;
     }

    let characterData: Partial<Character>;

    if (data.creationType === 'text') {
      // Even in text mode, use the potentially AI-populated basic fields if available
      const currentClass = watch("class");
      const currentTraits = watch("traits")?.split(',').map(t => t.trim()).filter(Boolean) ?? [];
      const currentKnowledge = watch("knowledge")?.split(',').map(k => k.trim()).filter(Boolean) ?? [];
      const currentBackground = watch("background");
      const currentDescription = watch("description"); // Get the potentially AI-updated description

      characterData = {
        name: data.name,
        description: currentDescription, // Use the value from the form field
        class: currentClass || "Adventurer", // Use inferred/edited or default
        traits: currentTraits,
        knowledge: currentKnowledge,
        background: currentBackground || "",
        stats: stats,
        // aiGeneratedDescription is set via dispatch and read from context state later if needed
      };
    } else { // Basic creation (data.creationType === 'basic')
        const traitsArray = data.traits?.split(',').map(t => t.trim()).filter(Boolean) ?? [];
        const knowledgeArray = data.knowledge?.split(',').map(k => k.trim()).filter(Boolean) ?? [];

        // Construct a simple description string from basic fields *only if description field is empty*
        // If the user switched from text -> basic after AI gen, keep the description
        let finalDescription = watch("description");
        if (!finalDescription) {
             finalDescription = `A ${data.class || 'Adventurer'} ${data.background ? `with a background as a ${data.background}` : ''}, possessing traits like ${traitsArray.join(', ') || 'none'} and knowledge of ${knowledgeArray.join(', ') || 'nothing specific'}.`;
        }


        characterData = {
            name: data.name,
            class: data.class?.trim() ?? "Adventurer",
            description: finalDescription, // Use existing description or the constructed one
            traits: traitsArray,
            knowledge: knowledgeArray,
            background: data.background?.trim() ?? "",
            stats: stats,
        };
    }

    // Pass the final character data object to the dispatch
    dispatch({ type: "CREATE_CHARACTER", payload: characterData });
    toast({ title: "Character Created!", description: `Welcome, ${characterData.name}. Prepare your adventure!` });
  };

  // --- Effects ---

   useEffect(() => {
       const newSchema = creationType === 'basic' ? basicCreationSchema : textCreationSchema;
       const currentValues = watch();
       // Reset with new schema and potentially existing values
       reset(currentValues, {
         keepValues: true, // Attempt to keep existing values
         keepDirty: true,
         keepErrors: false,
         keepTouched: false,
         keepIsValid: false,
         keepSubmitCount: false,
       });
        // Need to explicitly set creationType again as reset might overwrite it
       setValue("creationType", creationType);
       trigger(); // Re-validate everything after schema change
   }, [creationType, reset, watch, setValue, trigger]);


  // Update slider max values dynamically based on remaining points
   const getMaxSliderValue = useCallback((statName: keyof CharacterStats) => {
     const otherStatsTotal = Object.entries(stats)
       .filter(([key]) => key !== statName)
       .reduce((sum, [, value]) => sum + (value || MIN_STAT_VALUE), 0);
     const maxAllowed = TOTAL_STAT_POINTS - otherStatsTotal;
     return Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, maxAllowed));
   }, [stats]);


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
                    {/* --- Name Input --- */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-lg font-semibold">Character Name</Label>
                        <Input
                            id="name"
                            {...register("name")}
                            placeholder="e.g., Elara Meadowlight, Grognak the Wanderer"
                            className={`text-base ${errors.name ? 'border-destructive' : ''}`}
                            aria-invalid={errors.name ? "true" : "false"}
                        />
                        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>

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
                             <h3 className="text-lg font-medium mb-3 border-b pb-2">Define Details</h3>
                             {/* Class Input */}
                             <div className="space-y-2">
                                 <Label htmlFor="class" className="flex items-center gap-1">
                                     <ShieldQuestion className="w-4 h-4 text-muted-foreground"/> Class
                                 </Label>
                                <Input
                                    id="class"
                                    {...register("class")}
                                    placeholder="e.g., Warrior, Mage, Rogue"
                                    className={errors.class ? 'border-destructive' : ''}
                                    aria-invalid={errors.class ? "true" : "false"}
                                />
                                {errors.class && <p className="text-sm text-destructive mt-1">{errors.class.message}</p>}
                             </div>
                             {/* Traits Input */}
                             <div className="space-y-2">
                                <Label htmlFor="traits">Traits (comma-separated, max 5)</Label>
                                <Input
                                    id="traits"
                                    {...register("traits")}
                                    placeholder="e.g., Brave, Curious, Impulsive"
                                    className={errors.traits ? 'border-destructive' : ''}
                                    aria-invalid={errors.traits ? "true" : "false"}
                                />
                                {errors.traits && <p className="text-sm text-destructive mt-1">{errors.traits.message as string}</p>}
                             </div>
                             {/* Knowledge Input */}
                             <div className="space-y-2">
                                <Label htmlFor="knowledge">Knowledge (comma-separated, max 5)</Label>
                                <Input
                                    id="knowledge"
                                    {...register("knowledge")}
                                    placeholder="e.g., Magic, History, Herbalism"
                                    className={errors.knowledge ? 'border-destructive' : ''}
                                     aria-invalid={errors.knowledge ? "true" : "false"}
                                 />
                                {errors.knowledge && <p className="text-sm text-destructive mt-1">{errors.knowledge.message as string}</p>}
                             </div>
                             {/* Background Input */}
                             <div className="space-y-2">
                                <Label htmlFor="background">Background Story (brief)</Label>
                                <Input
                                    id="background"
                                    {...register("background")}
                                    placeholder="e.g., Exiled Noble, Village Guard, Mysterious Orphan"
                                     className={errors.background ? 'border-destructive' : ''}
                                     aria-invalid={errors.background ? "true" : "false"}
                                 />
                                {errors.background && <p className="text-sm text-destructive mt-1">{errors.background.message}</p>}
                             </div>
                        </TabsContent>

                        {/* --- Text-Based Creation Content --- */}
                        <TabsContent value="text" className="space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50">
                             <h3 className="text-lg font-medium mb-3 border-b pb-2">Describe Your Character</h3>
                             <div className="space-y-2">
                                <Label htmlFor="description">Appearance, Personality, Backstory (min 10 chars)</Label>
                                <Textarea
                                    id="description"
                                    {...register("description")}
                                    placeholder="Write a short description of your character... The AI can elaborate and infer details for the 'Basic Fields' tab."
                                    rows={4}
                                    className={errors.description ? 'border-destructive' : ''}
                                     aria-invalid={errors.description ? "true" : "false"}
                                 />
                                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                             </div>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                         <Button
                                            type="button"
                                            onClick={handleGenerateDescription}
                                            disabled={isGenerating || !watchedName || !!errors.description || !watchedDescription || watchedDescription.length < 10}
                                            variant="outline"
                                            size="sm"
                                            aria-label="Generate detailed description using AI and infer basic fields"
                                        >
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            {isGenerating ? "Generating..." : "Ask AI for Detailed Profile & Fields"}
                                         </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Let AI expand on your description, updating this field AND inferring details for the 'Basic Fields' tab.</p>
                                        <p className="text-xs text-muted-foreground">Requires a valid name and description (min 10 chars).</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                        </TabsContent>
                    </Tabs>

                    {/* --- Stat Allocation --- */}
                    <div className="space-y-6 border-t border-foreground/10 pt-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                            <h3 className="text-xl font-semibold">Allocate Stats ({TOTAL_STAT_POINTS} Total Points)</h3>
                             <div className="flex items-center gap-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button type="button" onClick={randomizeStats} variant="outline" size="sm" aria-label="Randomize Stat Distribution">
                                                <Dices className="mr-2 h-4 w-4" /> Randomize
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Randomly distribute the {TOTAL_STAT_POINTS} points (min {MIN_STAT_VALUE}, max {MAX_STAT_VALUE} each).</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                             </div>
                        </div>

                        <StatRadarChart
                           stats={stats}
                           setStats={setStats}
                           remainingPoints={remainingPoints}
                           setRemainingPoints={setRemainingPoints}
                        />
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
                                >
                                    <RotateCcw className={`mr-2 h-4 w-4 ${!randomizedAllComplete ? 'animate-spin duration-700' : ''}`} /> {/* Slower animation */}
                                    Randomize Everything
                                     {randomizedAllComplete && <CheckCircle className="ml-2 h-4 w-4 text-green-500 transition-opacity duration-500 opacity-100" />} {/* Show checkmark */}
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
                         disabled={isGenerating || remainingPoints !== 0}
                         aria-label="Save character and proceed to adventure setup"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {remainingPoints > 0 ? `Allocate ${remainingPoints} More Points` : 'Proceed to Adventure Setup'}
                    </Button>
                </CardFooter>
            </CardboardCard>
        </form>
    </div>
  );
}
