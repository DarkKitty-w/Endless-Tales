// src/components/screens/AdventureSetup.tsx
"use client";

import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/game/CardboardCard";
import { Swords, Dices, Skull, Heart, Play, ArrowLeft, Settings } from "lucide-react";

export function AdventureSetup() {
  const { state, dispatch } = useGame();
  const [adventureType, setAdventureType] = useState<"Randomized" | "Custom" | null>(state.adventureSettings.adventureType);
  const [permanentDeath, setPermanentDeath] = useState<boolean>(state.adventureSettings.permanentDeath);

  const handleStartAdventure = () => {
    if (!adventureType) {
        alert("Please select an adventure type.");
        return;
    }
    dispatch({ type: "SET_ADVENTURE_SETTINGS", payload: { adventureType, permanentDeath } });
    dispatch({ type: "START_GAMEPLAY" }); // This action will set the status to Gameplay
  };

   const handleBack = () => {
    dispatch({ type: "SET_GAME_STATUS", payload: "CharacterCreation" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Adventure Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Adventure Type Selection */}
          <div className="space-y-4">
            <Label className="text-xl font-semibold flex items-center gap-2"><Settings className="w-5 h-5"/>Adventure Type</Label>
            <RadioGroup
              value={adventureType ?? ""}
              onValueChange={(value) => setAdventureType(value as "Randomized" | "Custom")}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <Label htmlFor="randomized" className="flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-accent/10 [&:has([data-state=checked])]:bg-accent/20 [&:has([data-state=checked])]:border-accent">
                 <RadioGroupItem value="Randomized" id="randomized" className="sr-only" />
                 <Dices className="w-8 h-8 mb-2 text-primary" />
                 <span className="font-medium">Randomized</span>
                 <p className="text-sm text-muted-foreground text-center mt-1">Generate a unique world, quests, and challenges.</p>
              </Label>
               <Label htmlFor="custom" className="flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-accent/10 [&:has([data-state=checked])]:bg-accent/20 [&:has([data-state=checked])]:border-accent">
                 <RadioGroupItem value="Custom" id="custom" className="sr-only" />
                 <Swords className="w-8 h-8 mb-2 text-primary" />
                 <span className="font-medium">Custom</span>
                 <p className="text-sm text-muted-foreground text-center mt-1">Select world type, quests, difficulty (coming soon!).</p>
              </Label>
            </RadioGroup>
             {adventureType === "Custom" && (
                <p className="text-sm text-center text-muted-foreground">Custom adventure parameters are not yet implemented.</p>
            )}
          </div>

          {/* Permanent Death Option */}
          <div className="space-y-4 border-t pt-6">
            <Label className="text-xl font-semibold flex items-center gap-2"><Skull className="w-5 h-5"/>Challenge Mode</Label>
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-md">
              <div className="flex flex-col">
                 <Label htmlFor="permanent-death" className="font-medium flex items-center gap-1">
                    {permanentDeath ? <Skull className="w-4 h-4 text-destructive"/> : <Heart className="w-4 h-4 text-green-600"/>}
                    {permanentDeath ? "Permanent Death" : "Respawn Enabled"}
                 </Label>
                 <p className="text-sm text-muted-foreground">
                   {permanentDeath ? "Your adventure ends if you die." : "Respawn at a checkpoint before death."}
                 </p>
              </div>
              <Switch
                id="permanent-death"
                checked={permanentDeath}
                onCheckedChange={setPermanentDeath}
                aria-label="Toggle permanent death"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
           <Button variant="outline" onClick={handleBack}>
             <ArrowLeft className="mr-2 h-4 w-4" /> Back to Character
           </Button>
          <Button
            onClick={handleStartAdventure}
            disabled={!adventureType || adventureType === 'Custom'} // Disable if custom is selected (until implemented)
            className="bg-accent hover:bg-accent/90 text-accent-foreground w-full sm:w-auto"
           >
            <Play className="mr-2 h-4 w-4" /> Start Adventure
          </Button>
        </CardFooter>
      </CardboardCard>
    </div>
  );
}
