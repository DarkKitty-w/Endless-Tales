// src/components/screens/CharacterCreation.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGame, type Character, type CharacterStats } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Slider } from "@/components/ui/slider";
import { Wand2, Dices, User, Save, RotateCcw, Info } from "lucide-react";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "@/components/icons/HandDrawnIcons";
import { generateCharacterDescription } from "@/ai/flows/generate-character-description";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast"; // Import useToast


const TOTAL_STAT_POINTS = 15; // Total points available for distribution
const MIN_STAT_VALUE = 1; // Minimum value for any stat

// --- Zod Schema for Validation ---
const baseCharacterSchema = z.object({
  name: z.string().min(1, "Character name is required.").max(50, "Name too long (max 50)."),
});

// Custom refinement for comma-separated strings with max items
const commaSeparatedMaxItems = (max: number, message: string) =>
  z.string()
   .refine(val => val === "" || val.split(',').filter(Boolean).length <= max, { message })
   .optional();

const basicCreationSchema = baseCharacterSchema.extend({
  creationType: z.literal("basic"),
  traits: commaSeparatedMaxItems(5, "Max 5 traits allowed."),
  knowledge: commaSeparatedMaxItems(5, "Max 5 knowledge areas allowed."),
  background: z.string().max(100, "Background too long (max 100).").optional(),
});

const textCreationSchema = baseCharacterSchema.extend({
  creationType: z.literal("text"),
  description: z.string().min(10, "Please provide a brief description (at least 10 characters).").max(300, "Description too long (max 300)."),
});

// This combined schema helps if you need to validate the whole form based on the type
const combinedSchema = z.discriminatedUnion("creationType", [
  basicCreationSchema,
  textCreationSchema,
]);

type FormData = z.infer<typeof basicCreationSchema> | z.infer<typeof textCreationSchema>;

// --- Component ---
export function CharacterCreation() {
  const { dispatch } = useGame();
  const { toast } = useToast(); // Get toast function
  const [creationType, setCreationType] = useState<"basic" | "text">("basic");
  const [stats, setStats] = useState<CharacterStats>({ strength: 5, stamina: 5, agility: 5 });
  const [remainingPoints, setRemainingPoints] = useState(TOTAL_STAT_POINTS - 15); // Initial remaining points
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const currentSchema = creationType === "basic" ? basicCreationSchema : textCreationSchema;

  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue, trigger } = useForm<FormData>({
     resolver: zodResolver(currentSchema),
     mode: "onChange", // Validate on change for better feedback
     defaultValues: {
       creationType: "basic", // Set initial type for resolver
       name: "",
       traits: "",
       knowledge: "",
       background: "",
       description: "",
     },
   });

   // Watch the description field in text mode
   const textDescription = watch("description");
   const currentName = watch("name"); // Watch name for enabling AI generation

  // --- Stat Allocation Logic ---
 const handleStatChange = useCallback((statName: keyof CharacterStats, value: number) => {
    setStats(prevStats => {
        const tentativeStats = { ...prevStats, [statName]: value };
        const currentTotal = tentativeStats.strength + tentativeStats.stamina + tentativeStats.agility;

        if (currentTotal <= TOTAL_STAT_POINTS) {
            setRemainingPoints(TOTAL_STAT_POINTS - currentTotal);
            return tentativeStats;
        } else {
            // If exceeding total, don't update the state (keeps the slider visually stuck)
            // Optionally, provide feedback via toast or inline message
             toast({
               title: "Stat Limit Reached",
               description: `Cannot exceed ${TOTAL_STAT_POINTS} total stat points.`,
               variant: "destructive",
             });
            return prevStats; // Return previous stats
        }
    });
}, [toast]); // Add toast dependency


  const randomizeStats = useCallback(() => {
    let pointsToDistribute = TOTAL_STAT_POINTS;
    let str = MIN_STAT_VALUE;
    let stam = MIN_STAT_VALUE;
    let agi = MIN_STAT_VALUE;
    pointsToDistribute -= (MIN_STAT_VALUE * 3); // Subtract minimums

    // Distribute remaining points randomly
    const randStr = Math.floor(Math.random() * (pointsToDistribute + 1));
    str += randStr;
    pointsToDistribute -= randStr;

    const randStam = Math.floor(Math.random() * (pointsToDistribute + 1));
    stam += randStam;
    pointsToDistribute -= randStam;

    agi += pointsToDistribute; // Assign the rest to agility

    // Shuffle assignments for more variability
    const finalStats = [str, stam, agi];
    for (let i = finalStats.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalStats[i], finalStats[j]] = [finalStats[j], finalStats[i]]; // Swap
    }

    const newStats: CharacterStats = {
        strength: finalStats[0],
        stamina: finalStats[1],
        agility: finalStats[2],
    };

    setStats(newStats);
    setRemainingPoints(0); // Should always be 0 after full distribution
     toast({ title: "Stats Randomized", description: `Distributed ${TOTAL_STAT_POINTS} points.` });
  }, [toast]);


  // --- Randomize All ---
  const randomizeAll = useCallback(() => {
    // Basic examples, could be expanded with more options
    const randomNames = ["Anya", "Borin", "Carys", "Darian", "Elara", "Fendrel", "Gorok"];
    const randomTraitsPool = ["Brave", "Curious", "Cautious", "Impulsive", "Loyal", "Clever", "Resourceful", "Quiet"];
    const randomKnowledgePool = ["Herbalism", "Local Lore", "Survival", "Trading", "Ancient Runes", "Beasts", "Smithing"];
    const randomBackgrounds = ["Farmer", "Orphan", "Noble Exile", "Street Urchin", "Acolyte", "Guard", "Merchant's Child"];
    const randomDescriptions = [
      "A weary traveler with keen eyes and a rough, patched cloak, seeking forgotten paths.",
      "A cheerful youth from a small village, always eager for adventure, perhaps a bit naively.",
      "A stern-faced individual, marked by a faded scar across their brow, rarely speaking of their past.",
      "A bookish scholar, more comfortable with dusty tomes than drawn swords, muttering about forgotten lore.",
      "A nimble rogue with quick fingers and even quicker wit, always looking for an opportunity.",
    ];

    reset(); // Clear form fields first

    // Pick random elements
    const name = randomNames[Math.floor(Math.random() * randomNames.length)];
    setValue("name", name);

    if (creationType === 'basic') {
        const traits = randomTraitsPool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1).join(', '); // 1-3 random traits
        const knowledge = randomKnowledgePool.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1).join(', '); // 1-3 random knowledge
        const background = randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)];
        setValue("traits", traits);
        setValue("knowledge", knowledge);
        setValue("background", background);
         setValue("description", ""); // Clear description if switching to basic
    } else {
         const description = randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)];
         setValue("description", description);
         // Clear basic fields if switching to text
         setValue("traits", "");
         setValue("knowledge", "");
         setValue("background", "");
    }

    randomizeStats(); // Randomize stats as well
     toast({ title: "Character Randomized!", description: `Created a new character: ${name}` });
     trigger(); // Trigger validation after setting values
  }, [creationType, reset, setValue, randomizeStats, toast, trigger]);


  // --- AI Description Generation ---
  const handleGenerateDescription = async () => {
      // Also require a name for context, though AI doesn't explicitly use it in the prompt
     if (!currentName || !textDescription || textDescription.length < 10) {
       setError("Please provide a name and a brief description (at least 10 characters) before generating.");
       toast({ title: "Input Required", description: "Name and description needed for AI generation.", variant: "destructive"});
       return;
     }
     setError(null);
     setIsGenerating(true);
     try {
       const result = await generateCharacterDescription({ characterDescription: textDescription });
        // Store the AI description in the game state context
        dispatch({ type: "SET_AI_DESCRIPTION", payload: result.detailedDescription });
        toast({
          title: "AI Description Generated",
          description: "A detailed profile has been added to your character's context.",
        });
     } catch (err) {
       console.error("AI generation failed:", err);
       setError("Failed to generate description. The AI might be busy. Please try again later.");
       toast({ title: "AI Error", description: "Could not generate description.", variant: "destructive"});
     } finally {
       setIsGenerating(false);
     }
   };

  // --- Form Submission ---
  const onSubmit = (data: FormData) => {
    setError(null); // Clear previous errors

    // Ensure total stat points are used
     if (remainingPoints > 0) {
        setError(`You must allocate all ${TOTAL_STAT_POINTS} stat points. ${remainingPoints} remaining.`);
        toast({ title: "Stat Allocation Incomplete", description: `Allocate the remaining ${remainingPoints} points.`, variant: "destructive"});
        return; // Prevent submission
     }


    let characterData: Partial<Character>;

    if (data.creationType === 'text') { // Text-based creation
      characterData = {
        name: data.name,
        description: data.description, // User's short description
        stats: stats,
        // AI description is handled separately by handleGenerateDescription and stored in context
         traits: [], // Explicitly empty for text-based, could be derived by AI later
         knowledge: [],
         background: '', // Explicitly empty
      };
    } else { // Basic creation (data.creationType === 'basic')
        const traitsArray = data.traits?.split(',').map(t => t.trim()).filter(Boolean) ?? [];
        const knowledgeArray = data.knowledge?.split(',').map(k => k.trim()).filter(Boolean) ?? [];
        // Combine basic fields into a simple description string
        const basicDescription = `A ${data.background || 'person'} with traits like ${traitsArray.join(', ') || 'none'} and knowledge of ${knowledgeArray.join(', ') || 'nothing specific'}.`;

        characterData = {
            name: data.name,
            description: basicDescription, // Use the combined string as the base description
            traits: traitsArray,
            knowledge: knowledgeArray,
            background: data.background?.trim() ?? "",
            stats: stats,
        };
    }

    // Dispatch the character creation action, which moves to the next screen
    dispatch({ type: "CREATE_CHARACTER", payload: characterData });
    toast({ title: "Character Created!", description: `Welcome, ${characterData.name}. Prepare your adventure!` });
  };

  // --- Effects ---

   // Update resolver when creationType changes
   useEffect(() => {
       // Re-register with the new schema and trigger validation
       reset(watch(), { // Pass current form values to reset
           keepDirty: true,
           keepErrors: false, // Clear previous errors
           keepTouched: false,
           keepIsValid: false,
       });
       trigger(); // Re-validate based on the new schema
   }, [creationType, reset, trigger, watch]);


  // Reset validation state when component mounts if needed (optional)
  // useEffect(() => {
  //   reset();
  // }, [reset]);

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
                        setValue("creationType", newType); // Explicitly set creationType for resolver
                        setCreationType(newType); // Update local state for UI
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Fields</TabsTrigger>
                            <TabsTrigger value="text">Text Description</TabsTrigger>
                        </TabsList>

                        {/* --- Basic Creation Content --- */}
                        <TabsContent value="basic" className="space-y-4 pt-4 border rounded-md p-4 mt-2 bg-card/50">
                             <h3 className="text-lg font-medium mb-3 border-b pb-2">Define Details</h3>
                             <div className="space-y-2">
                                <Label htmlFor="traits">Traits (comma-separated, max 5)</Label>
                                <Input
                                    id="traits"
                                    {...register("traits")}
                                    placeholder="e.g., Brave, Curious, Impulsive"
                                    className={errors.traits ? 'border-destructive' : ''}
                                    aria-invalid={errors.traits ? "true" : "false"}
                                />
                                {errors.traits && <p className="text-sm text-destructive mt-1">{errors.traits.message}</p>}
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="knowledge">Knowledge (comma-separated, max 5)</Label>
                                <Input
                                    id="knowledge"
                                    {...register("knowledge")}
                                    placeholder="e.g., Magic, History, Herbalism"
                                    className={errors.knowledge ? 'border-destructive' : ''}
                                     aria-invalid={errors.knowledge ? "true" : "false"}
                                 />
                                {errors.knowledge && <p className="text-sm text-destructive mt-1">{errors.knowledge.message}</p>}
                             </div>
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
                                <Label htmlFor="description">Appearance, Personality, Backstory (min 10, max 300 chars)</Label>
                                <Textarea
                                    id="description"
                                    {...register("description")}
                                    placeholder="Write a short description of your character..."
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
                                            disabled={isGenerating || !currentName || !textDescription || textDescription.length < 10}
                                            variant="outline"
                                            size="sm"
                                            aria-label="Generate detailed description using AI"
                                        >
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            {isGenerating ? "Generating..." : "Ask AI for Detailed Profile"}
                                         </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Let AI expand on your description for a richer character profile (optional, stored separately).</p>
                                        <p>Requires a name and description first.</p>
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
                                <span className={`text-base font-medium ${remainingPoints !== 0 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                                    Points Remaining: {remainingPoints}
                                </span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button type="button" onClick={randomizeStats} variant="outline" size="sm" aria-label="Randomize Stat Distribution">
                                                <Dices className="mr-2 h-4 w-4" /> Randomize
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Randomly distribute the {TOTAL_STAT_POINTS} points (min {MIN_STAT_VALUE} each).</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                             </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {(['strength', 'stamina', 'agility'] as const).map((statName) => (
                                <div key={statName} className="space-y-3">
                                    <Label htmlFor={statName} className="flex items-center gap-2 capitalize text-lg font-medium">
                                         {statName === 'strength' && <HandDrawnStrengthIcon className="w-5 h-5 text-destructive" />}
                                         {statName === 'stamina' && <HandDrawnStaminaIcon className="w-5 h-5 text-green-600" />}
                                         {statName === 'agility' && <HandDrawnAgilityIcon className="w-5 h-5 text-blue-500" />}
                                         {statName} <span className="text-foreground font-bold">({stats[statName]})</span>
                                    </Label>
                                    <Slider
                                        id={statName}
                                        min={MIN_STAT_VALUE}
                                        // Calculate max dynamically based on other stats to respect TOTAL_STAT_POINTS
                                         max={TOTAL_STAT_POINTS - Object.entries(stats)
                                             .filter(([key]) => key !== statName)
                                             .reduce((sum, [, value]) => sum + (value || MIN_STAT_VALUE), 0)
                                             + (stats[statName] || MIN_STAT_VALUE) - MIN_STAT_VALUE
                                         }
                                        step={1}
                                        value={[stats[statName]]}
                                        onValueChange={(value) => handleStatChange(statName, value[0])}
                                        aria-label={`${statName} allocation slider`}
                                        className="w-full"
                                        disabled={isGenerating} // Disable while AI is working
                                    />
                                     <p className="text-xs text-muted-foreground text-center">Min: {MIN_STAT_VALUE}</p>
                                </div>
                            ))}
                        </div>

                    </div>

                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-foreground/10">
                     <TooltipProvider>
                        <Tooltip>
                             <TooltipTrigger asChild>
                                <Button type="button" onClick={randomizeAll} variant="secondary" aria-label="Randomize All Character Fields and Stats">
                                    <RotateCcw className="mr-2 h-4 w-4" /> Randomize Everything
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
                         disabled={isGenerating || remainingPoints !== 0} // Disable if generating or points remaining
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
