// src/components/screens/AdventureSetup.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Swords, Dices, Skull, Heart, Play, ArrowLeft, Settings, Globe, ScrollText, ShieldAlert, Sparkles } from "lucide-react"; // Added Sparkles for Immersed
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import type { AdventureSettings, DifficultyLevel, AdventureType } from "@/types/adventure-types";
import { VALID_ADVENTURE_DIFFICULTY_LEVELS } from "@/lib/constants";

export function AdventureSetup() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [adventureType, setAdventureType] = useState<AdventureType>(state.adventureSettings.adventureType);
  const [permanentDeath, setPermanentDeath] = useState<boolean>(state.adventureSettings.permanentDeath);
  const [worldType, setWorldType] = useState<string>(state.adventureSettings.worldType ?? "");
  const [mainQuestline, setMainQuestline] = useState<string>(state.adventureSettings.mainQuestline ?? "");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(state.adventureSettings.difficulty ?? "Normal");
  const [universeName, setUniverseName] = useState<string>(state.adventureSettings.universeName ?? "");
  const [playerCharacterConcept, setPlayerCharacterConcept] = useState<string>(state.adventureSettings.playerCharacterConcept ?? "");
  const [customError, setCustomError] = useState<string | null>(null);

  const validateSettings = (): boolean => {
     if (adventureType === "Custom") {
        if (!worldType.trim()) {
            setCustomError("Please specify a World Type for Custom Adventure.");
            return false;
        }
        if (!mainQuestline.trim()) {
             setCustomError("Please specify a Main Questline for Custom Adventure.");
             return false;
        }
     } else if (adventureType === "Immersed") {
        if (!universeName.trim()) {
            setCustomError("Please specify the Universe Name for Immersed Adventure.");
            return false;
        }
        if (!playerCharacterConcept.trim()) {
            setCustomError("Please specify your Character Concept for Immersed Adventure.");
            return false;
        }
     }
     setCustomError(null);
     return true;
  };


  const handleStartAdventure = () => {
     setCustomError(null);

    if (!adventureType) {
        toast({
            title: "Selection Required",
            description: "Please select an adventure type.",
            variant: "destructive",
         });
        return;
    }

     if (!validateSettings()) {
         toast({
             title: `${adventureType} Settings Required`,
             description: customError || `Please fill in all ${adventureType.toLowerCase()} adventure details.`,
             variant: "destructive",
          });
         return;
     }

     const finalDifficulty = VALID_ADVENTURE_DIFFICULTY_LEVELS.includes(difficulty) ? difficulty : "Normal";

    const settingsPayload: Partial<AdventureSettings> = {
      adventureType,
      permanentDeath,
      difficulty: finalDifficulty,
      ...(adventureType === "Custom" && { worldType, mainQuestline }),
      ...(adventureType === "Immersed" && { universeName, playerCharacterConcept }),
    };

    dispatch({ type: "SET_ADVENTURE_SETTINGS", payload: settingsPayload });
    dispatch({ type: "START_GAMEPLAY" });

    let description = `Get ready for a randomized ${finalDifficulty} journey based on your character.`;
    if (adventureType === "Custom") {
      description = `Get ready for a custom journey in ${worldType} with quest "${mainQuestline}" (${finalDifficulty}).`;
    } else if (adventureType === "Immersed") {
      description = `Get ready for an immersed journey in the universe of ${universeName} as ${playerCharacterConcept} (${finalDifficulty}).`;
    }


    toast({
        title: "Adventure Starting!",
        description: description,
    });
  };

   const handleBack = () => {
    dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
  };

   useEffect(() => {
      if (adventureType) {
         setCustomError(null);
      }
   }, [adventureType]);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-xl shadow-xl border-2 border-foreground/20"> {/* Increased max-width */}
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
              onValueChange={(value) => setAdventureType(value as AdventureType)}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4" // Adjusted to 3 columns
              aria-label="Adventure Type"
            >
              <Label htmlFor="randomized" className="flex flex-col items-center justify-center p-4 border-2 rounded-md cursor-pointer hover:bg-accent/10 data-[state=checked]:bg-accent/20 data-[state=checked]:border-accent transition-colors">
                 <RadioGroupItem value="Randomized" id="randomized" className="sr-only" aria-label="Randomized Adventure" />
                 <Dices className="w-8 h-8 mb-2 text-primary" />
                 <span className="font-medium">Randomized</span>
                 <p className="text-xs text-muted-foreground text-center mt-1">Generate a unique world based on your character.</p>
              </Label>
               <Label htmlFor="custom" className="flex flex-col items-center justify-center p-4 border-2 rounded-md cursor-pointer hover:bg-accent/10 data-[state=checked]:bg-accent/20 data-[state=checked]:border-accent transition-colors">
                 <RadioGroupItem value="Custom" id="custom" className="sr-only" aria-label="Custom Adventure" />
                 <Swords className="w-8 h-8 mb-2 text-primary" />
                 <span className="font-medium">Custom</span>
                 <p className="text-xs text-muted-foreground text-center mt-1">Define world type and main quest.</p>
              </Label>
              <Label htmlFor="immersed" className="flex flex-col items-center justify-center p-4 border-2 rounded-md cursor-pointer hover:bg-accent/10 data-[state=checked]:bg-accent/20 data-[state=checked]:border-accent transition-colors">
                 <RadioGroupItem value="Immersed" id="immersed" className="sr-only" aria-label="Immersed Adventure" />
                 <Sparkles className="w-8 h-8 mb-2 text-primary" /> {/* Icon for Immersed */}
                 <span className="font-medium">Immersed</span>
                 <p className="text-xs text-muted-foreground text-center mt-1">Enter a known universe (film, book, etc.).</p>
              </Label>
            </RadioGroup>

             {/* Custom Adventure Parameter Inputs */}
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
                </div>
            )}
            {/* Immersed Adventure Parameter Inputs */}
            {adventureType === "Immersed" && (
                <div className="space-y-4 border-t border-foreground/10 pt-6 mt-6">
                   <h3 className="text-lg font-medium mb-3 border-b pb-2">Immersed Adventure Details</h3>
                    {customError && (
                        <Alert variant="destructive">
                            <AlertDescription>{customError}</AlertDescription>
                        </Alert>
                    )}
                   <div className="space-y-2">
                       <Label htmlFor="universeName" className="flex items-center gap-1"><Sparkles className="w-4 h-4"/> Universe Name</Label>
                       <Input
                           id="universeName"
                           value={universeName}
                           onChange={(e) => setUniverseName(e.target.value)}
                           placeholder="e.g., Star Wars, Lord of the Rings, Harry Potter"
                           className={customError && !universeName.trim() ? 'border-destructive' : ''}
                        />
                    </div>
                   <div className="space-y-2">
                        <Label htmlFor="playerCharacterConcept" className="flex items-center gap-1"><ScrollText className="w-4 h-4"/> Your Character Concept</Label>
                       <Input
                           id="playerCharacterConcept"
                           value={playerCharacterConcept}
                           onChange={(e) => setPlayerCharacterConcept(e.target.value)}
                           placeholder="e.g., A young Jedi Padawan, A hobbit on an unexpected journey, A new student at Hogwarts"
                            className={customError && !playerCharacterConcept.trim() ? 'border-destructive' : ''}
                       />
                    </div>
                </div>
            )}
          </div>

           {/* Difficulty Selection - Always visible */}
           <div className="space-y-4 border-t border-foreground/10 pt-6">
                <Label htmlFor="difficulty-select" className="text-xl font-semibold flex items-center gap-2"><ShieldAlert className="w-5 h-5"/>Select Difficulty</Label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as DifficultyLevel)}>
                    <SelectTrigger id="difficulty-select" className="w-full">
                        <SelectValue placeholder="Select difficulty..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Easy">Easy - Fewer challenges, more forgiving.</SelectItem>
                        <SelectItem value="Normal">Normal - A balanced experience.</SelectItem>
                        <SelectItem value="Hard">Hard - Tougher encounters, requires strategy.</SelectItem>
                        <SelectItem value="Nightmare">Nightmare - Extreme challenge, for veterans.</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Difficulty affects challenge level, AI behavior, and potential events.</p>
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
            disabled={!adventureType || (adventureType === 'Custom' && (!worldType.trim() || !mainQuestline.trim())) || (adventureType === 'Immersed' && (!universeName.trim() || !playerCharacterConcept.trim()))}
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