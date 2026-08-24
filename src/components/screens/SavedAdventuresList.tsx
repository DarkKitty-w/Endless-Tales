
// src/components/screens/SavedAdventuresList.tsx
"use client";

import React, { useMemo, useRef } from "react";
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
import { FolderClock, ArrowLeft, Trash2, Play, Info, BookOpenText, Package, ShieldQuestion, Star, HeartPulse, Zap, ThumbsUp, Award, Users, HardDrive, ShieldCheck, ShieldAlert, Download, Upload } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "../../hooks/use-toast";
import { validateSavedAdventure } from "../../context/schemas/save-schema";
import { checkSaveSize } from "../../lib/storage-utils";

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

const getSafeSaveTimestamp = (adventure: SavedAdventure): number => {
    return Number.isFinite(adventure.saveTimestamp) && adventure.saveTimestamp > 0
        ? adventure.saveTimestamp
        : 0;
};

const formatSaveAge = (timestamp: number): string => {
    if (!timestamp) return 'at an unknown time';
    try {
        return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
        return 'at an unknown time';
    }
};

const getSaveIntegrity = (adventure: SavedAdventure) => {
    const validation = validateSavedAdventure(adventure);
    const size = checkSaveSize(adventure);
    return { validation, size };
};

const EXPORT_FORMAT = 'endless-tales-save-export';
const EXPORT_FORMAT_VERSION = 1;

type SaveExportEnvelope = {
    type: typeof EXPORT_FORMAT;
    version: number;
    exportedAt: number;
    saves: SavedAdventure[];
};

function downloadJsonFile(filename: string, data: unknown) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function slugifyFilename(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'adventure';
}

function extractImportedSaves(parsed: unknown): { saves: SavedAdventure[]; errors: string[] } {
    let candidates: unknown[] = [];
    if (Array.isArray(parsed)) {
        candidates = parsed;
    } else if (parsed && typeof parsed === 'object') {
        const maybeEnvelope = parsed as Partial<SaveExportEnvelope> & Record<string, unknown>;
        if (maybeEnvelope.type === EXPORT_FORMAT && Array.isArray(maybeEnvelope.saves)) {
            candidates = maybeEnvelope.saves;
        } else if (Array.isArray(maybeEnvelope.savedAdventures)) {
            candidates = maybeEnvelope.savedAdventures as unknown[];
        } else {
            candidates = [parsed];
        }
    }

    const saves: SavedAdventure[] = [];
    const errors: string[] = [];
    candidates.forEach((candidate, index) => {
        const validation = validateSavedAdventure(candidate);
        if (validation.success) {
            saves.push(validation.data);
        } else {
            errors.push(`Entry ${index + 1}: ${validation.error}`);
        }
    });

    return { saves, errors };
}


export function SavedAdventuresList() {
  const { state, dispatch } = useGame();
  const { savedAdventures } = state;
  const { toast } = useToast();
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleLoad = (adventure: SavedAdventure) => {
    const validation = validateSavedAdventure(adventure);
    if (!validation.success) {
      toast({
        title: "Save Cannot Be Loaded",
        description: `This save failed integrity validation: ${validation.error}`,
        variant: "destructive",
        duration: 8000,
      });
      return;
    }

    dispatch({ type: "LOAD_ADVENTURE", payload: validation.data });
    toast({ title: "Loading Adventure...", description: "Resuming your journey." });
  };

  const handleDelete = (id: string, characterName: string) => {
     dispatch({ type: "DELETE_ADVENTURE", payload: id });
     toast({ title: "Adventure Deleted", description: `Removed the saved game for ${characterName}.`, variant: "destructive" });
  };

  const handleBack = () => {
    dispatch({ type: "SET_GAME_STATUS", payload: "MainMenu" });
  };

  const buildExportEnvelope = (saves: SavedAdventure[]): SaveExportEnvelope => ({
    type: EXPORT_FORMAT,
    version: EXPORT_FORMAT_VERSION,
    exportedAt: Date.now(),
    saves,
  });

  const handleExportAll = () => {
    const validSaves = savedAdventures.filter(save => validateSavedAdventure(save).success);
    if (validSaves.length === 0) {
      toast({ title: "No Valid Saves to Export", description: "There are no valid local saves available to export.", variant: "destructive" });
      return;
    }

    downloadJsonFile(`endless-tales-saves-${new Date().toISOString().slice(0, 10)}.json`, buildExportEnvelope(validSaves));
    const skipped = savedAdventures.length - validSaves.length;
    toast({
      title: "Saves Exported",
      description: skipped > 0
        ? `Exported ${validSaves.length} valid save(s). Skipped ${skipped} invalid save(s).`
        : `Exported ${validSaves.length} save(s).`,
    });
  };

  const handleExportOne = (adventure: SavedAdventure) => {
    const validation = validateSavedAdventure(adventure);
    if (!validation.success) {
      toast({ title: "Cannot Export Save", description: validation.error, variant: "destructive" });
      return;
    }

    const filename = `endless-tales-${slugifyFilename(adventure.characterName)}-${adventure.id}.json`;
    downloadJsonFile(filename, buildExportEnvelope([validation.data]));
    toast({ title: "Save Exported", description: `Exported ${adventure.characterName}.` });
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const { saves: importedSaves, errors } = extractImportedSaves(parsed);

      if (importedSaves.length === 0) {
        toast({
          title: "Import Failed",
          description: errors[0] || "No valid Endless Tales saves were found in this file.",
          variant: "destructive",
          duration: 9000,
        });
        return;
      }

      const mergedById = new Map<string, SavedAdventure>();
      savedAdventures.forEach(save => mergedById.set(save.id, save));
      let replacedCount = 0;
      importedSaves.forEach(save => {
        if (mergedById.has(save.id)) replacedCount++;
        mergedById.set(save.id, save);
      });

      const merged = Array.from(mergedById.values()).sort((a, b) => getSafeSaveTimestamp(b) - getSafeSaveTimestamp(a));
      dispatch({ type: "LOAD_SAVED_ADVENTURES", payload: merged });

      toast({
        title: "Saves Imported",
        description: `Imported ${importedSaves.length} save(s)${replacedCount ? `, replaced ${replacedCount}` : ''}${errors.length ? `, skipped ${errors.length} invalid` : ''}.`,
        duration: 8000,
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: error instanceof SyntaxError ? "This file is not valid JSON." : "Could not read this save file.",
        variant: "destructive",
      });
    }
  };

  const sortedAdventures = useMemo(() => {
    return [...savedAdventures].sort((a, b) => getSafeSaveTimestamp(b) - getSafeSaveTimestamp(a));
  }, [savedAdventures]); // Only recalculate when savedAdventures changes

  // PERF-5: Validate/measure each save once per savedAdventures change instead of
  // re-running the zod schema + size check on every render of this screen.
  const integrityById = useMemo(() => {
    const map = new Map<string, ReturnType<typeof getSaveIntegrity>>();
    for (const adventure of sortedAdventures) {
      map.set(adventure.id, getSaveIntegrity(adventure));
    }
    return map;
  }, [sortedAdventures]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <CardboardCard className="w-full max-w-2xl shadow-xl border-2 border-foreground/20">
        <CardHeader className="border-b border-foreground/10 pb-4">
          <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
            <FolderClock className="w-7 h-7"/> Saved Adventures
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Alert className="border-primary/30 bg-primary/5">
            <HardDrive className="h-4 w-4" />
            <AlertTitle>Local saves only</AlertTitle>
            <AlertDescription>
              Adventures are saved in this browser on this device. They are not uploaded to an account or cloud service. Use export/import once available to move or back up saves.
            </AlertDescription>
          </Alert>

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
                    const integrity = integrityById.get(adventure.id) ?? getSaveIntegrity(adventure);
                    const isValidSave = integrity.validation.success;
                    const timestamp = getSafeSaveTimestamp(adventure);

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
                            Saved {formatSaveAge(timestamp)}
                          </p>
                           <p className="text-xs text-muted-foreground mt-1">
                            {adventure.statusBeforeSave === 'AdventureSummary' ? 'Finished' : 'In Progress'} | {adventure.adventureSettings?.adventureType ?? 'Unknown'} ({adventure.adventureSettings?.permanentDeath ? 'Permadeath' : 'Respawn'})
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span className={`inline-flex items-center gap-1 ${isValidSave ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                              {isValidSave ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                              {isValidSave ? 'Integrity OK' : 'Needs repair'}
                            </span>
                            <span>{integrity.size.sizeFormatted}</span>
                            {integrity.size.isApproachingLimit && !integrity.size.isTooLarge && (
                              <span className="text-yellow-600 dark:text-yellow-400">Large save</span>
                            )}
                            {integrity.size.isTooLarge && (
                              <span className="text-destructive">Too large to persist reliably</span>
                            )}
                          </div>
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
                            variant="outline"
                            size="sm"
                            onClick={() => handleExportOne(adventure)}
                            disabled={!isValidSave}
                            title={isValidSave ? `Export ${adventure.characterName}` : integrity.validation.error}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleLoad(adventure)}
                            disabled={!isValidSave}
                            title={isValidSave ? undefined : integrity.validation.error}
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
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-foreground/10">
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Main Menu
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleImportClick}>
              <Upload className="mr-2 h-4 w-4" /> Import Saves
            </Button>
            <Button variant="secondary" onClick={handleExportAll} disabled={savedAdventures.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export All
            </Button>
          </div>
        </CardFooter>
      </CardboardCard>
    </div>
  );
}

export default React.memo(SavedAdventuresList);
