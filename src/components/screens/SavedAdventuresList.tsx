
// src/components/screens/SavedAdventuresList.tsx
"use client";

import React from "react";
import { useGame } from "../../context/GameContext"; // Import main context hook
import type { SavedAdventure, Character, Reputation, NpcRelationships } from "../../types/game-types"; // Import types from central location
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/game/CardboardCard";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { FolderClock, ArrowLeft, Trash2, Play, Info, BookOpenText, Package, ShieldQuestion, Star, HeartPulse, Zap, ThumbsUp, ThumbsDown, Award, Users } from "lucide-react"; // Added Award, Thumbs icons, Users icon
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "../../hooks/use-toast";

// Helper to render reputation summary
const renderReputationSummary = (reputation: Reputation | undefined): string => {
    if (!reputation) return 'None';
    const entries = Object.entries(reputation);
    if (entries.length === 0) return 'None';
    // Show first 2 factions for brevity
    return entries.slice(0, 2).map(([faction, score]) => `${faction}: ${score}`).join(', ') + (entries.length > 2 ? '...' : '');
};

// Helper to render NPC relationship summary
const renderNpcRelationshipSummary = (relationships: NpcRelationships | undefined): string => {
    if (!relationships) return 'None';
    const entries = Object.entries(relationships);
    if (entries.length === 0) return 'None';
    // Show first 2 NPCs for brevity
    return entries.slice(0, 2).map(([npc, score]) => `${npc}: ${score}`).join(', ') + (entries.length > 2 ? '...' : '');
};


export function SavedAdventuresList() {
  const { state, dispatch } = useGame();
  const { savedAdventures } = state;
  const { toast } = useToast();

  const handleLoad = (adventure: SavedAdventure) => {
    dispatch({ type: "LOAD_ADVENTURE", payload: adventure });
    toast({ title: "Loading Adventure...", description: "Resuming your journey." });
  };

  const handleDelete = (id: string, characterName: string) => {
     dispatch({ type: "DELETE_ADVENTURE", payload: id });
     toast({ title: "Adventure Deleted", description: `Removed the saved game for ${characterName}.`, variant: "destructive" });
  };

  const handleBack = () => {
    dispatch({ type: "SET_GAME_STATUS", payload: "MainMenu" });
  };

  const sortedAdventures = [...savedAdventures].sort((a, b) => b.saveTimestamp - a.saveTimestamp); // Show newest first

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-2xl shadow-xl border-2 border-foreground/20">
        <CardHeader className="border-b border-foreground/10 pb-4">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <FolderClock className="w-7 h-7"/> Saved Adventures
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {sortedAdventures.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>No Saved Games</AlertTitle>
              <AlertDescription>
                You haven't saved any adventures yet. Start a new game and save your progress!
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[60vh] pr-3"> {/* Adjust height as needed */}
              <div className="space-y-4">
                {sortedAdventures.map((adventure) => {
                    const char: Character | undefined = adventure.character; // Ensure character exists
                    const currentStage = char?.skillTreeStage ?? 0;
                    const stageData = char?.skillTree?.stages[currentStage];
                    const stageName = stageData?.stageName ?? `Stage ${currentStage}`;

                    return (
                      <CardboardCard key={adventure.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card/60 border border-foreground/10">
                        <div className="flex-1 min-w-0">
                           {/* Character Name and Level */}
                           <div className="flex items-center justify-between">
                              <p className="text-lg font-semibold truncate" title={adventure.characterName}>{adventure.characterName}</p>
                              <span className="text-sm font-bold text-primary ml-2 flex-shrink-0">Lvl {char?.level ?? '?'}</span>
                           </div>

                          {/* Class, Skill Stage, Resources */}
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1" title="Class">
                                    <ShieldQuestion className="w-3 h-3"/> {char?.class || 'Unknown'}
                                </div>
                                <div className="flex items-center gap-0.5" title={`Skill Stage: ${stageName}`}>
                                    <Star className="w-3 h-3"/> {stageName} ({currentStage}/4)
                                </div>
                                <div className="flex items-center gap-1" title="Stamina">
                                    <HeartPulse className="w-3 h-3 text-green-600" /> {char?.currentStamina ?? '?'}/{char?.maxStamina ?? '?'}
                                </div>
                                {(char?.maxMana ?? 0) > 0 && (
                                    <div className="flex items-center gap-1" title="Mana">
                                        <Zap className="w-3 h-3 text-blue-500" /> {char?.currentMana ?? '?'}/{char?.maxMana ?? '?'}
                                    </div>
                                )}
                          </div>

                          {/* XP, Reputation, and Relationships */}
                           <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                                <div className="flex items-center gap-1" title="Experience Points">
                                    <Award className="w-3 h-3 text-yellow-500" /> {char?.xp ?? '?'}/{char?.xpToNextLevel ?? '?'} XP
                                </div>
                                 <div className="flex items-center gap-1" title="Reputation">
                                    <ThumbsUp className="w-3 h-3" /> Rep: {renderReputationSummary(char?.reputation)}
                                </div>
                                <div className="flex items-center gap-1" title="NPC Relationships">
                                    <Users className="w-3 h-3" /> Rel: {renderNpcRelationshipSummary(char?.npcRelationships)}
                                </div>
                            </div>

                           {/* Save Info */}
                           <p className="text-sm text-muted-foreground mt-1">
                            Saved {formatDistanceToNow(new Date(adventure.saveTimestamp), { addSuffix: true })}
                          </p>
                           <p className="text-xs text-muted-foreground mt-1">
                            {adventure.statusBeforeSave === 'AdventureSummary' ? 'Finished' : 'In Progress'} | {adventure.adventureSettings.adventureType} ({adventure.adventureSettings.permanentDeath ? 'Permadeath' : 'Respawn'})
                          </p>
                            {adventure.inventory && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                    <Package className="w-3 h-3"/> {adventure.inventory.length} item(s)
                                </p>
                            )}
                            {adventure.statusBeforeSave === 'AdventureSummary' && adventure.adventureSummary && (
                                <p className="text-xs text-muted-foreground italic mt-1 border-t pt-1 line-clamp-2">
                                    Summary: {adventure.adventureSummary}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleLoad(adventure)}
                            className="bg-accent hover:bg-accent/90 text-accent-foreground"
                          >
                            {adventure.statusBeforeSave === 'AdventureSummary' ? <BookOpenText className="mr-1 h-4 w-4"/> : <Play className="mr-1 h-4 w-4"/>}
                            {adventure.statusBeforeSave === 'AdventureSummary' ? 'View' : 'Load'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Saved Game?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the saved adventure for "{adventure.characterName}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(adventure.id, adventure.characterName)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardboardCard>
                    );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter className="flex justify-start pt-6 border-t border-foreground/10">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main Menu
          </Button>
        </CardFooter>
      </CardboardCard>
    </div>
  );
}
