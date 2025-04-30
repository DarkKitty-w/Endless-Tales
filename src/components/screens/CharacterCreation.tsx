// src/components/screens/CharacterCreation.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGame, type Character } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Slider } from "@/components/ui/slider";
import { Wand2, Brain, Heart, Shield, Dices, User, Save, RotateCcw, Info } from "lucide-react";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "@/components/icons/HandDrawnIcons";
import { generateCharacterDescription } from "@/ai/flows/generate-character-description";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TOTAL_STAT_POINTS = 15; // Total points available for distribution

// --- Zod Schema for Validation ---
const baseCharacterSchema = z.object({
  name: z.string().min(1, "Character name is required."),
});

const basicCreationSchema = baseCharacterSchema.extend({
  traits: z.string().optional(), // Comma-separated
  knowledge: z.string().optional(), // Comma-separated
  background: z.string().optional(),
});

const textCreationSchema = baseCharacterSchema.extend({
  description: z.string().min(10, "Please provide a brief description (at least 10 characters)."),
});

const combinedSchema = z.discriminatedUnion("creationType", [
  basicCreationSchema.extend({ creationType: z.literal("basic") }),
  textCreationSchema.extend({ creationType: z.literal("text") }),
]);

type FormData = z.infer<typeof basicCreationSchema> | z.infer<typeof textCreationSchema>;

// --- Component ---
export function CharacterCreation() {
  const { dispatch } = useGame();
  const [creationType, setCreationType] = useState<"basic" | "text">("basic");
  const [stats, setStats] = useState({ strength: 5, stamina: 5, agility: 5 });
  const [remainingPoints, setRemainingPoints] = useState(TOTAL_STAT_POINTS - 15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSchema = creationType === "basic" ? basicCreationSchema : textCreationSchema;
  const { register, handleSubmit, control, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      name: "",
      traits: "",
      knowledge: "",
      background: "",
      description: "",
    },
  });

  const textDescription = watch("description"); // Watch description for AI generation button

  // --- Stat Allocation Logic ---
  const handleStatChange = (statName: keyof typeof stats, value: number) => {
    const newStats = { ...stats, [statName]: value };
    const currentTotal = newStats.strength + newStats.stamina + newStats.agility;

    if (currentTotal <= TOTAL_STAT_POINTS) {
      setStats(newStats);
      setRemainingPoints(TOTAL_STAT_POINTS - currentTotal);
    } else {
      // Optionally provide feedback or prevent exceeding the limit
      // This basic implementation just prevents the state update if total exceeds
    }
  };

  const randomizeStats = useCallback(() => {
    let points = TOTAL_STAT_POINTS;
    let str = 1, stam = 1, agi = 1; // Ensure minimum of 1
    points -= 3;

    str += Math.floor(Math.random() * (points + 1));
    points -= (str - 1);
    stam += Math.floor(Math.random() * (points + 1));
    points -= (stam - 1);
    agi += points; // Assign remaining points

    // Shuffle for more randomness
    const randomized = [str, stam, agi].sort(() => Math.random() - 0.5);
    const newStats = { strength: randomized[0], stamina: randomized[1], agility: randomized[2] };
    setStats(newStats);
    setRemainingPoints(0); // Should always be 0 after distribution
  }, []);


  // --- Randomize All ---
  const randomizeAll = () => {
    // Basic examples, could be expanded with more options
    const randomNames = ["Anya", "Borin", "Carys", "Darian", "Elara"];
    const randomTraits = ["Brave", "Curious", "Cautious", "Impulsive", "Loyal"];
    const randomKnowledge = ["Herbalism", "Local Lore", "Survival", "Trading", "None"];
    const randomBackgrounds = ["Farmer", "Orphan", "Noble Exile", "Street Urchin", "Acolyte"];
    const randomDescriptions = [
      "A weary traveler with keen eyes and a rough cloak.",
      "A cheerful youth, always eager for adventure, perhaps naively so.",
      "A stern individual, marked by a past they rarely speak of.",
      "A scholar type, more comfortable with books than battles.",
    ];

    reset(); // Clear form fields

    setValue("name", randomNames[Math.floor(Math.random() * randomNames.length)]);

    if (creationType === 'basic') {
        setValue("traits", randomTraits[Math.floor(Math.random() * randomTraits.length)]);
        setValue("knowledge", randomKnowledge[Math.floor(Math.random() * randomKnowledge.length)]);
        setValue("background", randomBackgrounds[Math.floor(Math.random() * randomBackgrounds.length)]);
    } else {
         setValue("description", randomDescriptions[Math.floor(Math.random() * randomDescriptions.length)]);
    }

    randomizeStats();
  };

  // --- AI Description Generation ---
  const handleGenerateDescription = async () => {
     if (!textDescription || textDescription.length < 10) {
       setError("Please provide a brief description (at least 10 characters) before generating.");
       return;
     }
     setError(null);
     setIsGenerating(true);
     try {
       const result = await generateCharacterDescription({ characterDescription: textDescription });
       // Add the generated description to the context or potentially a field
       // For now, we'll dispatch it to context
        dispatch({ type: "SET_AI_DESCRIPTION", payload: result.detailedDescription });
        // Optionally update the form description field? Or show it elsewhere.
        // setValue("description", result.detailedDescription); // This might override user input style
        alert("AI generated a detailed description! It's stored in the game state.");
     } catch (err) {
       console.error("AI generation failed:", err);
       setError("Failed to generate description. Please try again.");
     } finally {
       setIsGenerating(false);
     }
   };

  // --- Form Submission ---
  const onSubmit = (data: FormData) => {
    let characterData: Partial<Character>;

    if ('description' in data) { // Text-based creation
      characterData = {
        name: data.name,
        description: data.description, // User's short description
        stats: stats,
         // AI description is handled separately by handleGenerateDescription
         // We'll pull it from context when starting the game
         traits: [], // Derived by AI or left empty
         knowledge: [],
         background: '',
      };
    } else { // Basic creation
      characterData = {
        name: data.name,
        description: `Traits: ${data.traits || 'None'}. Knowledge: ${data.knowledge || 'None'}. Background: ${data.background || 'None'}.`,
        traits: data.traits?.split(',').map(t => t.trim()).filter(Boolean) ?? [],
        knowledge: data.knowledge?.split(',').map(k => k.trim()).filter(Boolean) ?? [],
        background: data.background ?? "",
        stats: stats,
      };
    }

    dispatch({ type: "CREATE_CHARACTER", payload: characterData });
  };

  // Update schema on tab change
   useEffect(() => {
    reset(undefined, { keepValues: true }); // Reset validation state but keep values
   }, [creationType, reset]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl">
            <CardboardCard className="shadow-xl">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">Create Your Character</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <Info className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {/* Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-lg font-semibold">Character Name</Label>
                        <Input id="name" {...register("name")} placeholder="e.g., Elara Meadowlight" className="text-base"/>
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>

                    {/* Creation Type Tabs */}
                    <Tabs value={creationType} onValueChange={(value) => setCreationType(value as "basic" | "text")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Creation</TabsTrigger>
                            <TabsTrigger value="text">Text-Based Creation</TabsTrigger>
                        </TabsList>

                        {/* Basic Creation Content */}
                        <TabsContent value="basic" className="space-y-4 pt-4">
                             <div className="space-y-2">
                                <Label htmlFor="traits">Traits (comma-separated)</Label>
                                <Input id="traits" {...register("traits")} placeholder="e.g., Brave, Curious, Cautious" />
                                {errors.traits && <p className="text-sm text-destructive">{errors.traits.message}</p>}
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="knowledge">Knowledge (comma-separated)</Label>
                                <Input id="knowledge" {...register("knowledge")} placeholder="e.g., Magic, History, Herbalism" />
                                {errors.knowledge && <p className="text-sm text-destructive">{errors.knowledge.message}</p>}
                             </div>
                             <div className="space-y-2">
                                <Label htmlFor="background">Background Story</Label>
                                <Input id="background" {...register("background")} placeholder="e.g., Soldier, Royalty, Farmer" />
                                {errors.background && <p className="text-sm text-destructive">{errors.background.message}</p>}
                             </div>
                        </TabsContent>

                        {/* Text-Based Creation Content */}
                        <TabsContent value="text" className="space-y-4 pt-4">
                             <div className="space-y-2">
                                <Label htmlFor="description">Character Description</Label>
                                <Textarea
                                    id="description"
                                    {...register("description")}
                                    placeholder="Write a short description of your character's appearance, personality, and backstory..."
                                    rows={4}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                             </div>
                            <Button
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={isGenerating || !textDescription || textDescription.length < 10}
                                variant="outline"
                                size="sm"
                            >
                                <Wand2 className="mr-2 h-4 w-4" />
                                {isGenerating ? "Generating..." : "Generate Detailed Description (AI)"}
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Optionally, let AI expand on your description for a richer profile (stored separately).
                            </p>
                        </TabsContent>
                    </Tabs>

                    {/* Stat Allocation */}
                    <div className="space-y-4 border-t border-border pt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-semibold">Allocate Stats</h3>
                            <span className="text-sm font-medium text-primary">Points Remaining: {remainingPoints}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(['strength', 'stamina', 'agility'] as const).map((statName) => (
                                <div key={statName} className="space-y-2">
                                    <Label htmlFor={statName} className="flex items-center gap-2 capitalize text-base">
                                         {statName === 'strength' && <HandDrawnStrengthIcon className="w-5 h-5 text-destructive" />}
                                         {statName === 'stamina' && <HandDrawnStaminaIcon className="w-5 h-5 text-green-600" />}
                                         {statName === 'agility' && <HandDrawnAgilityIcon className="w-5 h-5 text-blue-500" />}
                                         {statName} ({stats[statName]})
                                    </Label>
                                     <Controller
                                        name={`stats.${statName}` as any} // Controller needs a name, even if handled manually
                                        control={control}
                                        render={({ field }) => (
                                            <Slider
                                                id={statName}
                                                min={1}
                                                max={TOTAL_STAT_POINTS - 2} // Max possible value for one stat leaving 1 for others
                                                step={1}
                                                value={[stats[statName]]}
                                                onValueChange={(value) => handleStatChange(statName, value[0])}
                                                aria-label={`${statName} slider`}
                                            />
                                        )}
                                     />
                                </div>
                            ))}
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button type="button" onClick={randomizeStats} variant="outline" size="sm" className="mt-2">
                                        <Dices className="mr-2 h-4 w-4" /> Randomize Stats
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Randomly distribute the {TOTAL_STAT_POINTS} points.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-border">
                     <Button type="button" onClick={randomizeAll} variant="secondary">
                        <RotateCcw className="mr-2 h-4 w-4" /> Randomize All
                     </Button>
                     <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto" disabled={isGenerating}>
                        <Save className="mr-2 h-4 w-4" /> Proceed to Adventure Setup
                    </Button>
                </CardFooter>
            </CardboardCard>
        </form>
    </div>
  );
}
