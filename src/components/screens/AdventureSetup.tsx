
// src/components/screens/AdventureSetup.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Swords, Dices, Skull, Heart, Play, ArrowLeft, Settings, Globe, ScrollText, ShieldAlert, Sparkles, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  
  // Adventure type is now read directly from context
  const adventureType = state.adventureSettings.adventureType;

  const [permanentDeath, setPermanentDeath] = useState<boolean>(state.adventureSettings.permanentDeath);
  const [worldType, setWorldType] = useState<string>(state.adventureSettings.worldType ?? "");
  const [mainQuestline, setMainQuestline] = useState<string>(state.adventureSettings.mainQuestline ?? "");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(state.adventureSettings.difficulty ?? "Normal");
  const [universeName, setUniverseName] = useState<string>(state.adventureSettings.universeName ?? "");
  const [playerCharacterConcept, setPlayerCharacterConcept] = useState<string>(state.adventureSettings.playerCharacterConcept ?? "");
  const [customError, setCustomError] = useState<string | null>(null);

  // Effect to update local state if context changes (e.g., loading a game that jumps to this screen)
  useEffect(() => {
    setPermanentDeath(state.adventureSettings.permanentDeath);
    setWorldType(state.adventureSettings.worldType ?? "");
    setMainQuestline(state.adventureSettings.mainQuestline ?? "");
    setDifficulty(state.adventureSettings.difficulty ?? "Normal");
    setUniverseName(state.adventureSettings.universeName ?? "");
    setPlayerCharacterConcept(state.adventureSettings.playerCharacterConcept ?? "");
  }, [state.adventureSettings]);


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
            title: "Adventure Type Missing",
            description: "Adventure type was not selected. Please return to the main menu.",
            variant: "destructive",
         });
        dispatch({ type: "SET_GAME_STATUS", payload: "MainMenu" }); // Send user back if type is missing
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
      adventureType, // This is now from context, but we pass it to ensure reducer has it
      permanentDeath,
      difficulty: finalDifficulty,
      ...(adventureType === "Custom" && { worldType, mainQuestline }),
      ...(adventureType === "Immersed" && { universeName, playerCharacterConcept }),
    };

    // Dispatch SET_ADVENTURE_SETTINGS to update any changes made on this screen (like difficulty/permadeath)
    dispatch({ type: "SET_ADVENTURE_SETTINGS", payload: settingsPayload });
    // Then START_GAMEPLAY which will use the settings from the context
    dispatch({ type: "START_GAMEPLAY" });

    let descriptionToast = `Get ready for a randomized ${finalDifficulty} journey.`;
    if (adventureType === "Custom") {
      descriptionToast = `Get ready for a custom journey in ${worldType} with quest "${mainQuestline}" (${finalDifficulty}).`;
    } else if (adventureType === "Immersed") {
      descriptionToast = `Get ready for an immersed journey in the universe of ${universeName} as ${playerCharacterConcept} (${finalDifficulty}).`;
    }

    toast({
        title: "Adventure Starting!",
        description: descriptionToast,
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

  if (!adventureType) {
    // This case should ideally not be reached if the flow from MainMenu is correct
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
             <CardboardCard className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center justify-center gap-2"><AlertTriangle className="w-6 h-6 text-destructive"/> Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Adventure type not selected. Please return to the main menu.</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => dispatch({ type: "RESET_GAME" })} className="w-full">
                        Back to Main Menu
                    </Button>
                </CardFooter>
             </CardboardCard>
        </div>
    );
  }

  const getAdventureTypeIcon = () => {
    switch(adventureType) {
        case "Randomized": return <Dices className="w-5 h-5"/>;
        case "Custom": return <Swords className="w-5 h-5"/>;
        case "Immersed": return <Sparkles className="w-5 h-5"/>;
        default: return <Settings className="w-5 h-5"/>;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-xl shadow-xl border-2 border-foreground/20">
        <CardHeader className="border-b border-foreground/10 pb-4">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <Settings className="w-7 h-7"/> Adventure Setup
          </CardTitle>
           <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1.5 mt-1">
            Selected Type: {getAdventureTypeIcon()} <span className="font-medium">{adventureType}</span>
           </p>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          {/* Adventure Type specific inputs are now conditional */}
          {adventureType === "Custom" && (
            <div className="space-y-4 border-t border-foreground/10 pt-6 mt-0"> {/* Removed redundant mt-6 */}
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
          {adventureType === "Immersed" && (
            <div className="space-y-4 border-t border-foreground/10 pt-6 mt-0">
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
                       placeholder="e.g., A young Jedi Padawan, A hobbit on an unexpected journey"
                        className={customError && !playerCharacterConcept.trim() ? 'border-destructive' : ''}
                   />
                </div>
            </div>
          )}
          {adventureType === "Randomized" && (
             <div className="space-y-4 pt-2 text-center">
                 <p className="text-sm text-muted-foreground italic">A unique world, quests, and challenges will be generated based on your character.</p>
             </div>
          )}

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
            disabled={
                (adventureType === 'Custom' && (!worldType.trim() || !mainQuestline.trim())) ||
                (adventureType === 'Immersed' && (!universeName.trim() || !playerCharacterConcept.trim()))
            }
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

