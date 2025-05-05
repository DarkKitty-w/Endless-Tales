"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGame } from "@/context/GameContext";
import type { Character } from "@/types/game-types"; // Import centralized types
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Wand2, RotateCcw, User, Save, Info, ShieldQuestion, CheckCircle, AlertCircle } from "lucide-react"; // Simplified icons, added AlertCircle
import { generateCharacterDescription, type GenerateCharacterDescriptionOutput } from "@/ai/flows/generate-character-description";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { StatAllocationInput } from "@/components/game/StatAllocationInput"; // Import the new input component
import { TOTAL_STAT_POINTS, MIN_STAT_VALUE, MAX_STAT_VALUE } from "@/lib/constants"; // Import from constants file
import type { CharacterStats } from "@/types/character-types"; // Import from specific types file
import { initialCharacterState } from "@/context/game-initial-state"; // Import initialCharacterState
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
  // Initialize stats correctly based on context or defaults
  const [stats, setStats] = useState<CharacterStats>(() => {
      // Use initialCharacterState's stats as a base, then merge with saved stats if available
      return state.character?.stats ? { ...initialCharacterState.stats, ...state.character.stats } : { ...initialCharacterState.stats };
  });

   // Calculate initial remaining points based ONLY on the 3 allocated stats
   const calculateInitialRemainingPoints = (currentStats: CharacterStats): number => {
     const allocatedTotal = currentStats.strength + currentStats.stamina + currentStats.agility;
     return TOTAL_STAT_POINTS - allocatedTotal;
   };

  const [remainingPoints, setRemainingPoints] = useState<number>(() => calculateInitialRemainingPoints(stats));
  const [isRandomizing, setIsRandomizing] = useState(false); // State for randomization animation
  const [randomizationComplete, setRandomizationComplete] = useState(false); // State for checkmark
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statError, setStatError] = useState<string | null>(null); // Specific error for stats


  // Determine the current schema based on the selected tab
  const currentSchema = creationType === "basic" ? basicCreationSchema : textCreationSchema;

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, trigger } = useForm<FormData>({
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
   const handleStatChange = useCallback((statName: keyof Pick<CharacterStats, 'strength' | 'stamina' | 'agility'>, value: number) => {
     const clampedValue = Math.max(MIN_STAT_VALUE, Math.min(MAX_STAT_VALUE, value));

     setStats(prevStats => {
         // Create tentative stats including the change
         const tentativeStats = { ...prevStats, [statName]: clampedValue };
         // Calculate total ONLY for the 3 adjustable stats
         const currentAllocatedTotal = tentativeStats.strength + tentativeStats.stamina + tentativeStats.agility;
         const newRemaining = TOTAL_STAT_POINTS - currentAllocatedTotal;

          setRemainingPoints(newRemaining); // Always update remaining points display

          if (newRemaining < 0) {
             setStatError(`Cannot exceed ${TOTAL_STAT_POINTS} total points for allocated stats.`);
             // Optionally prevent the update if over budget, or allow it and show error
             // To prevent update: return prevStats;
              return tentativeStats; // Allow the state update to show the invalid allocation temporarily
          } else {
             setStatError(null); // Clear stat error if valid
             return tentativeStats; // Return the valid updated stats
          }
     });
   }, [setStats, setRemainingPoints]);


   // --- Randomize Stats ---
   const randomizeStats = useCallback(() => {
       setStatError(null); // Clear previous stat error
       let pointsLeft = TOTAL_STAT_POINTS;
       // Start with minimums ONLY for the allocated stats
       let newAllocatedStats: Pick<CharacterStats, 'strength' | 'stamina' | 'agility'> = {
           strength: MIN_STAT_VALUE,
           stamina: MIN_STAT_VALUE,
           agility: MIN_STAT_VALUE,
       };
       pointsLeft -= (MIN_STAT_VALUE * 3);

       const allocatedStatKeys: (keyof typeof newAllocatedStats)[] = ['strength', 'stamina', 'agility'];

       // Distribute remaining points randomly among the allocated stats
       while (pointsLeft > 0) {
           const availableKeys = allocatedStatKeys.filter(key => newAllocatedStats[key] < MAX_STAT_VALUE);
           if (availableKeys.length === 0) break; // Safety break if all stats reach max
           const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
           newAllocatedStats[randomKey]++;
           pointsLeft--;
       }

       // Keep the other stats (Intellect, Wisdom, Charisma) at their initial/default values
       const finalStats: CharacterStats = {
           ...initialCharacterState.stats, // Start with the base defaults for all stats
           ...newAllocatedStats, // Override the allocated ones
       };

       setStats(finalStats);
        // Recalculate remaining points based on the final allocated stats
        const finalAllocatedTotal = allocatedStatKeys.reduce((sum, key) => sum + finalStats[key], 0);
        setRemainingPoints(TOTAL_STAT_POINTS - finalAllocatedTotal);

   }, [setStats, setRemainingPoints]);


 // --- Randomize All ---
 const randomizeAll = useCallback(async () => {
     setIsRandomizing(true); // Start animation
     setRandomizationComplete(false); // Hide checkmark initially
     await new Promise(res => setTimeout(res, 300)); // Wait for visual effect

     // Reset errors
     setError(null);
     setStatError(null);

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

 }, [creationType, reset, setValue, randomizeStats, trigger]);


  // Watch form values for dynamic checks
  const watchedName = watch("name");
  const watchedDescription = watch("description");


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
         // Ensure AI values are valid or use defaults
         const inferredClass = result.inferredClass || "Adventurer";
         const inferredTraits = (result.inferredTraits && result.inferredTraits.length > 0) ? result.inferredTraits.join(', ') : "";
         const inferredKnowledge = (result.inferredKnowledge && result.inferredKnowledge.length > 0) ? result.inferredKnowledge.join(', ') : "";
         const inferredBackground = result.inferredBackground || "";

          // Directly update the fields in the "Basic Fields" tab
          setValue("class", inferredClass, { shouldValidate: true, shouldDirty: true });
          setValue("traits", inferredTraits, { shouldValidate: true, shouldDirty: true });
          setValue("knowledge", inferredKnowledge, { shouldValidate: true, shouldDirty: true });
          setValue("background", inferredBackground, { shouldValidate: true, shouldDirty: true });

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
    setError(null);
    setStatError(null);

    // Check remaining points exactly equals 0
     if (remainingPoints !== 0) {
        setStatError(`You must allocate exactly ${TOTAL_STAT_POINTS} stat points. ${remainingPoints > 0 ? `${remainingPoints} remaining.` : `${Math.abs(remainingPoints)} over allocated.`}`);
        toast({ title: "Stat Allocation Error", description: `You have ${remainingPoints > 0 ? `${remainingPoints} points` : `${Math.abs(remainingPoints)} too many points`} allocated. Total must be ${TOTAL_STAT_POINTS}.`, variant: "destructive" });
        return;
     }
     // Individual stat bounds check (redundant if slider is used, but good safety)
     if (Object.entries(stats).some(([key, val]) => ['strength', 'stamina', 'agility'].includes(key) && (val < MIN_STAT_VALUE || val > MAX_STAT_VALUE))) {
         setStatError(`Allocated stats (STR, STA, AGI) must be between ${MIN_STAT_VALUE} and ${MAX_STAT_VALUE}.`);
         return;
     }


    let characterData: Partial<Character>;

    if (data.creationType === 'text') {
        // When submitting from text mode, take the text description directly,
        // AND also take the (potentially AI-populated or user-edited) basic fields.
        const currentClass = watch("class") || "Adventurer"; // Use inferred/edited or default
        const currentTraits = watch("traits")?.split(',').map(t => t.trim()).filter(Boolean) ?? [];
        const currentKnowledge = watch("knowledge")?.split(',').map(k => k.trim()).filter(Boolean) ?? [];
        const currentBackground = watch("background") || "";
        const currentDescription = watch("description"); // Get the potentially AI-updated description

        characterData = {
          name: data.name,
          description: currentDescription, // Use the value from the form field
          class: currentClass,
          traits: currentTraits,
          knowledge: currentKnowledge,
          background: currentBackground,
          stats: stats, // Use the full stats object (including non-allocated ones)
          aiGeneratedDescription: state.character?.aiGeneratedDescription, // Get from existing state if AI generated
        };
    } else { // Basic creation (data.creationType === 'basic')
        const traitsArray = data.traits?.split(',').map(t => t.trim()).filter(Boolean) ?? [];
        const knowledgeArray = data.knowledge?.split(',').map(k => k.trim()).filter(Boolean) ?? [];
        const currentClass = data.class?.trim() ?? "Adventurer";
        const currentBackground = data.background?.trim() ?? "";

        // Construct a simple description string from basic fields *only if description field is empty*
        // If the user switched from text -> basic after AI gen, keep the description
        let finalDescription = watch("description");
        if (!finalDescription) {
             finalDescription = `A ${currentClass} ${currentBackground ? `with a background as a ${currentBackground}` : ''}, possessing traits like ${traitsArray.join(', ') || 'none'} and knowledge of ${knowledgeArray.join(', ') || 'nothing specific'}.`;
        }

        characterData = {
            name: data.name,
            class: currentClass,
            description: finalDescription, // Use existing description or the constructed one
            traits: traitsArray,
            knowledge: knowledgeArray,
            background: currentBackground,
            stats: stats, // Use the full stats object
            aiGeneratedDescription: state.character?.aiGeneratedDescription, // Get from existing state if AI generated
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

  // Update sliders and remaining points when character data changes (e.g., loading)
   useEffect(() => {
       // When stats state changes externally (like from loading), recalculate remaining points
       const newRemaining = calculateInitialRemainingPoints(stats);
       setRemainingPoints(newRemaining);
       // Clear or set stat error based on the recalculated points
       if (newRemaining !== 0) {
           setStatError(`You must allocate exactly ${TOTAL_STAT_POINTS} points. ${newRemaining > 0 ? `${newRemaining} remaining.` : `${Math.abs(newRemaining)} over allocated.`}`);
       } else {
           setStatError(null);
       }
   }, [stats]); // Only re-run when the 'stats' object reference changes


  // Clear statError when remaining points become 0
  useEffect(() => {
    if (remainingPoints === 0 && statError) { // Only clear if there *is* an error
        setStatError(null);
    }
  }, [remainingPoints, statError]); // Depend on both


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
                    {error && ( // Show general errors if they exist
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
                                            disabled={isGenerating || !watchedName || !!errors.description || !watchedDescription || (watchedDescription?.length ?? 0) < 10}
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
                    <Separator />
                     <div className="space-y-4">
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                             <h3 className="text-xl font-semibold">Allocate Stats ({TOTAL_STAT_POINTS} Total Points)</h3>
                         </div>

                         {/* Display Stat Error */}
                         {statError && (
                             <Alert variant="destructive" className="mt-2 py-2 px-3 text-sm">
                                 <AlertCircle className="h-4 w-4" /> {/* Use AlertCircle */}
                                 <AlertDescription>{statError}</AlertDescription>
                             </Alert>
                         )}

                         {/* Stat Inputs (Grid) */}
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <StatAllocationInput
                                  label="Strength"
                                  statKey="strength"
                                  value={stats.strength}
                                  onChange={handleStatChange}
                                  Icon={HandDrawnStrengthIcon} // Pass icon component
                                  iconColor="text-destructive" // Pass color
                              />
                              <StatAllocationInput
                                  label="Stamina"
                                  statKey="stamina"
                                  value={stats.stamina}
                                  onChange={handleStatChange}
                                  Icon={HandDrawnStaminaIcon} // Pass icon component
                                  iconColor="text-green-600" // Pass color
                              />
                              <StatAllocationInput
                                  label="Agility"
                                  statKey="agility"
                                  value={stats.agility}
                                  onChange={handleStatChange}
                                   Icon={HandDrawnAgilityIcon} // Pass icon component
                                  iconColor="text-blue-500" // Pass color
                              />
                         </div>


                         {/* Remaining Points Indicator - moved into its own div for clarity */}
                         <div className="text-center pt-2 min-h-[2.5rem]">
                              <p className={`text-sm font-medium ${remainingPoints > 0 ? 'text-primary' : remainingPoints < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                 {remainingPoints === 0 ? "All points allocated!" : `${remainingPoints} points remaining.`}
                             </p>
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
                         disabled={isGenerating || remainingPoints !== 0 || isRandomizing || !!statError} // Disable if generating, points remain, randomizing, or stat error exists
                         aria-label="Save character and proceed to adventure setup"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {remainingPoints !== 0 || statError ? 'Invalid Allocation' : 'Proceed to Adventure Setup'}
                    </Button>
                </CardFooter>
            </CardboardCard>
        </form>
    </div>
  );
}
