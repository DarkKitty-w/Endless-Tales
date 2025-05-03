// src/components/screens/AdventureSetup.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Import Input
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Swords, Dices, Skull, Heart, Play, ArrowLeft, Settings, Globe, ScrollText, BarChart } from "lucide-react"; // Added icons
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert"; // Import Alert

export function AdventureSetup() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [adventureType, setAdventureType] = useState<"Randomized" | "Custom" | null>(state.adventureSettings.adventureType);
  const [permanentDeath, setPermanentDeath] = useState<boolean>(state.adventureSettings.permanentDeath);
  // State for custom adventure parameters
  const [worldType, setWorldType] = useState<string>(state.adventureSettings.worldType ?? "");
  const [mainQuestline, setMainQuestline] = useState<string>(state.adventureSettings.mainQuestline ?? "");
  const [difficulty, setDifficulty] = useState<string>(state.adventureSettings.difficulty ?? "Normal");
  const [customError, setCustomError] = useState<string | null>(null);

  const validateCustomSettings = (): boolean => {
     if (adventureType === "Custom") {
        if (!worldType.trim()) {
            setCustomError("Please specify a World Type.");
            return false;
        }
        if (!mainQuestline.trim()) {
             setCustomError("Please specify a Main Questline.");
             return false;
        }
        if (!difficulty.trim()) {
             setCustomError("Please specify a Difficulty.");
             return false;
        }
     }
     setCustomError(null); // Clear error if validation passes
     return true;
  };


  const handleStartAdventure = () => {
     setCustomError(null); // Clear previous errors

    if (!adventureType) {
        toast({
            title: "Selection Required",
            description: "Please select an adventure type.",
            variant: "destructive",
         });
        return;
    }

     // Validate custom settings if Custom type is selected
     if (adventureType === "Custom" && !validateCustomSettings()) {
         toast({
             title: "Custom Settings Required",
             description: customError || "Please fill in all custom adventure details.",
             variant: "destructive",
          });
         return;
     }

    const settingsPayload = {
      adventureType,
      permanentDeath,
      ...(adventureType === "Custom" && { worldType, mainQuestline, difficulty }),
    };

    dispatch({ type: "SET_ADVENTURE_SETTINGS", payload: settingsPayload });
    dispatch({ type: "START_GAMEPLAY" }); // This action will set the status to Gameplay

    const description = adventureType === "Custom"
      ? `Get ready for a custom journey in ${worldType} with quest "${mainQuestline}" (${difficulty}).`
      : `Get ready for a randomized journey.`;

    toast({
        title: "Adventure Starting!",
        description: description,
    });
  };

   const handleBack = () => {
    dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
  };

   // Update local state when adventure type changes
   useEffect(() => {
      if (adventureType) {
         setCustomError(null); // Clear errors when changing type
      }
   }, [adventureType]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-lg shadow-xl border-2 border-foreground/20">
        <CardHeader className="border-b border-foreground/10 pb-4">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <Settings className="w-7 h-7"/> Adventure Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Adventure Type Selection */}
          <div className="space-y-4">
            <Label className="text-xl font-semibold flex items-center gap-2"><Settings className="w-5 h-5"/>Select Adventure Type</Label>
            <RadioGroup
              value={adventureType ?? ""}
              onValueChange={(value) => setAdventureType(value as "Randomized" | "Custom")}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              aria-label="Adventure Type"
            >
              <Label htmlFor="randomized" className="flex flex-col items-center justify-center p-4 border-2 rounded-md cursor-pointer hover:bg-accent/10 data-[state=checked]:bg-accent/20 data-[state=checked]:border-accent transition-colors">
                 <RadioGroupItem value="Randomized" id="randomized" className="sr-only" aria-label="Randomized Adventure" />
                 <Dices className="w-8 h-8 mb-2 text-primary" />
                 <span className="font-medium">Randomized</span>
                 <p className="text-sm text-muted-foreground text-center mt-1">Generate a unique world, quests, and challenges.</p>
              </Label>
               <Label htmlFor="custom" className="flex flex-col items-center justify-center p-4 border-2 rounded-md cursor-pointer hover:bg-accent/10 data-[state=checked]:bg-accent/20 data-[state=checked]:border-accent transition-colors">
                 <RadioGroupItem value="Custom" id="custom" className="sr-only" aria-label="Custom Adventure" />
                 <Swords className="w-8 h-8 mb-2 text-primary" />
                 <span className="font-medium">Custom</span>
                 <p className="text-sm text-muted-foreground text-center mt-1">Define world type, main quest, and difficulty.</p>
              </Label>
            </RadioGroup>

             {/* Custom Adventure Parameter Inputs - Conditionally Rendered */}
             {adventureType === "Custom" && (
                <div className="space-y-4 border-t border-foreground/10 pt-6 mt-6">
                   <h3 className="text-lg font-medium mb-3 border-b pb-2">Customize Your Adventure</h3>
                    {customError && (
                        <Alert variant="destructive">
                            <AlertDescription>{customError}</AlertDescription>
                        </Alert>
                    )}
                   <div className="space-y-2">
                       <Label htmlFor="worldType" className="flex items-center gap-1"><Globe className="w-4 h-4"/> World Type</Label>
                       <Input
                           id="worldType"
                           value={worldType}
                           onChange={(e) => setWorldType(e.target.value)}
                           placeholder="e.g., Forgotten Kingdom, Sci-Fi Metropolis"
                           className={customError && !worldType.trim() ? 'border-destructive' : ''}
                        />
                    </div>
                   <div className="space-y-2">
                        <Label htmlFor="mainQuestline" className="flex items-center gap-1"><ScrollText className="w-4 h-4"/> Main Questline (Goal)</Label>
                       <Input
                           id="mainQuestline"
                           value={mainQuestline}
                           onChange={(e) => setMainQuestline(e.target.value)}
                           placeholder="e.g., Find the Lost Artifact, Overthrow the AI Overlord"
                            className={customError && !mainQuestline.trim() ? 'border-destructive' : ''}
                       />
                    </div>
                   <div className="space-y-2">
                       <Label htmlFor="difficulty" className="flex items-center gap-1"><BarChart className="w-4 h-4"/> Difficulty</Label>
                       <Input
                           id="difficulty"
                           value={difficulty}
                           onChange={(e) => setDifficulty(e.target.value)}
                           placeholder="e.g., Easy, Normal, Hard, Nightmare"
                           className={customError && !difficulty.trim() ? 'border-destructive' : ''}
                       />
                    </div>
                </div>
            )}
          </div>

          {/* Permanent Death Option */}
          <div className="space-y-4 border-t border-foreground/10 pt-6">
            <Label className="text-xl font-semibold flex items-center gap-2"><Skull className="w-5 h-5"/>Choose Challenge Mode</Label>
            <div className="flex items-center justify-between space-x-2 p-4 border-2 rounded-md bg-card/50">
              <div className="flex flex-col">
                 <Label htmlFor="permanent-death" className="font-medium flex items-center gap-1 cursor-pointer">
                    {permanentDeath ? <Skull className="w-4 h-4 text-destructive"/> : <Heart className="w-4 h-4 text-green-600"/>}
                    {permanentDeath ? "Permanent Death" : "Respawn Enabled"}
                 </Label>
                 <p className="text-sm text-muted-foreground pr-2">
                   {permanentDeath ? "Your adventure ends permanently if you die." : "You can respawn at a checkpoint before death."}
                 </p>
              </div>
              <Switch
                id="permanent-death"
                checked={permanentDeath}
                onCheckedChange={setPermanentDeath}
                aria-label={`Toggle ${permanentDeath ? 'Permanent Death off' : 'Permanent Death on'}`}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-foreground/10">
           <Button variant="outline" onClick={handleBack}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Character
           </Button>
          <Button
            onClick={handleStartAdventure}
            disabled={!adventureType} // Only disable if no type is selected
            className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
            aria-label="Start Adventure"
           >
            <Play className="mr-2 h-4 w-4" /> Start Adventure
          </Button>
        </CardFooter>
      </CardboardCard>
    </div>
  );
}
