// src/components/gameplay/MobileSheet.tsx
"use client";

import React from 'react';
import type { Character, Reputation, NpcRelationships } from '@/types/character-types';
import type { InventoryItem } from '@/types/inventory-types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { User, Settings, Backpack, Workflow, Award, Users, HeartPulse, CalendarClock, Milestone, Loader2 } from 'lucide-react';
import { CharacterDisplay } from "@/components/game/CharacterDisplay";
import { InventoryDisplay } from "@/components/game/InventoryDisplay";
import { SkillTreeDisplay } from "@/components/game/SkillTreeDisplay";

interface MobileSheetProps {
    character: Character;
    inventory: InventoryItem[];
    isGeneratingSkillTree: boolean;
    turnCount: number;
    renderReputation: (rep: Reputation | undefined) => React.ReactNode;
    renderNpcRelationships: (rels: NpcRelationships | undefined) => React.ReactNode;
    onSettingsOpen: () => void;
}

export function MobileSheet({
    character,
    inventory,
    isGeneratingSkillTree,
    turnCount,
    renderReputation,
    renderNpcRelationships,
    onSettingsOpen
}: MobileSheetProps) {
    return (
        <TooltipProvider> {/* Wrap with TooltipProvider */}
            <div className="md:hidden flex justify-between items-center mb-2 border-b pb-2">
                {/* Mobile Profile Trigger (Character + Progression) */}
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="sm"><User className="w-4 h-4 mr-1.5" /> Profile</Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] p-0 flex flex-col">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle>Character & Progression</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="flex-grow p-4">
                            {/* Display Character Info */}
                            <CharacterDisplay />
                            <Separator className="my-4" />
                            {/* Display Progression Info */}
                            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Milestone className="w-4 h-4" /> Progression</h3>
                            <div className="space-y-3 text-sm">
                                <Tooltip>
                                    <TooltipTrigger className="w-full cursor-help text-left">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-medium flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Level:</span>
                                            <span className="font-bold text-base">{character.level}</span>
                                            <span className="ml-auto font-medium text-muted-foreground">XP:</span>
                                            <span className="font-mono text-muted-foreground">{character.xp} / {character.xpToNextLevel}</span>
                                        </div>
                                        <Progress value={(character.xp / character.xpToNextLevel) * 100} className="h-2 bg-yellow-100 dark:bg-yellow-900/50 [&>div]:bg-yellow-500" />
                                    </TooltipTrigger>
                                    <TooltipContent><p>Experience Points</p><p className="text-xs text-muted-foreground">({character.xpToNextLevel - character.xp} needed)</p></TooltipContent>
                                </Tooltip>
                                <Separator />
                                <div className="space-y-1"><Label className="text-sm font-medium flex items-center gap-1 mb-1"><Users className="w-3.5 h-3.5" /> Reputation:</Label>{renderReputation(character.reputation)}</div>
                                <Separator />
                                <div className="space-y-1"><Label className="text-sm font-medium flex items-center gap-1 mb-1"><HeartPulse className="w-3.5 h-3.5" /> Relationships:</Label>{renderNpcRelationships(character.npcRelationships)}</div>
                                <Separator />
                                <div className="flex justify-between items-center"><Label className="text-sm font-medium flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5" /> Turn:</Label><span className="font-bold text-base">{turnCount}</span></div>
                            </div>
                        </ScrollArea>
                    </SheetContent>
                </Sheet>
                <div className="flex gap-1">
                    {/* Mobile Inventory/Skills Trigger */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon"><Backpack className="w-5 h-5" /></Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col">
                            <Tabs defaultValue="inventory" className="h-full flex flex-col">
                                <TabsList className="flex-none border-b">
                                    <TabsTrigger value="inventory" className="flex-1"><Backpack className="w-4 h-4 mr-1.5" /> Inventory</TabsTrigger>
                                    <TabsTrigger value="skills" className="flex-1"><Workflow className="w-4 h-4 mr-1.5" /> Skills</TabsTrigger>
                                </TabsList>
                                <div className="flex-grow overflow-hidden">
                                    <TabsContent value="inventory" className="h-full m-0"><InventoryDisplay /></TabsContent>
                                    <TabsContent value="skills" className="h-full m-0">
                                        {character.skillTree && !isGeneratingSkillTree ? (
                                            <SkillTreeDisplay skillTree={character.skillTree} learnedSkills={character.learnedSkills} currentStage={character.skillTreeStage} />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground italic p-4">
                                                {isGeneratingSkillTree ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : ""}
                                                {isGeneratingSkillTree ? "Generating skill tree..." : "No skill tree available."}
                                            </div>
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </SheetContent>
                    </Sheet>
                    {/* Mobile Settings Trigger */}
                    <Sheet>
                        <SheetTrigger asChild><Button variant="ghost" size="icon" onClick={onSettingsOpen}><Settings className="w-5 h-5" /></Button></SheetTrigger>
                        {/* SettingsPanel content is rendered via the parent component */}
                    </Sheet>
                </div>
            </div>
        </TooltipProvider>
    );
}
    