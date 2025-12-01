
// src/components/gameplay/MobileSheet.tsx
"use client";

import React from 'react';
import type { Character, Reputation, NpcRelationships } from '../../types/game-types';
import type { InventoryItem } from '../../types/inventory-types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';
import { Progress } from '../../components/ui/progress';
import { Label } from "../../components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '../../components/ui/tooltip';
import { User, Settings, Backpack, Workflow, Award, Users, HeartPulse, CalendarClock, Milestone, Loader2 } from 'lucide-react';
import { CharacterDisplay } from "../../components/game/CharacterDisplay";
import { InventoryDisplay } from "../../components/game/InventoryDisplay";
import { SkillTreeDisplay } from "../../components/game/SkillTreeDisplay";
import { useGame } from "../../context/GameContext";

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
    const { state } = useGame();
    const showSkillsTab = state.adventureSettings.adventureType !== "Immersed";

    return (
        <TooltipProvider>
            <div className="md:hidden flex justify-between items-center mb-2 border-b pb-2">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="sm"><User className="w-4 h-4 mr-1.5" /> Profile</Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] p-0 flex flex-col">
                        <SheetHeader className="p-4 border-b">
                            <SheetTitle>Character & Progression</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="flex-grow p-4">
                            <CharacterDisplay />
                            <Separator className="my-4" />
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
                     <Sheet>
                        <SheetTrigger asChild>
                             <Button variant="ghost" size="sm">
                                <Backpack className="w-4 h-4 mr-1.5"/>{showSkillsTab ? "Inv. & Skills" : "Inventory"}
                             </Button>
                        </SheetTrigger>
                         <SheetContent side="bottom" className="h-[70vh] p-0 flex flex-col">
                             <SheetHeader className="p-4 border-b">
                                 <SheetTitle>{showSkillsTab ? "Inventory & Skills" : "Inventory"}</SheetTitle>
                             </SheetHeader>
                             <div className="flex-grow overflow-hidden">
                                 {showSkillsTab ? (
                                     <Tabs defaultValue="inventory" className="flex-grow flex flex-col h-full">
                                        <TabsList className="grid w-full grid-cols-2 h-12 flex-none">
                                            <TabsTrigger value="inventory" className="text-xs sm:text-sm"><Backpack className="w-4 h-4 mr-1"/>Inventory</TabsTrigger>
                                            <TabsTrigger value="skills" className="text-xs sm:text-sm"><Workflow className="w-4 h-4 mr-1"/>Skills</TabsTrigger>
                                        </TabsList>
                                        <div className="flex-grow overflow-hidden">
                                            <TabsContent value="inventory" className="h-full m-0">
                                                <InventoryDisplay />
                                            </TabsContent>
                                            <TabsContent value="skills" className="h-full m-0">
                                            {character.skillTree && !isGeneratingSkillTree ? (
                                                 <SkillTreeDisplay skillTree={character.skillTree} learnedSkills={character.learnedSkills} currentStage={character.skillTreeStage}/>
                                             ) : (
                                                 <div className="flex items-center justify-center h-full text-muted-foreground italic p-4">
                                                     {isGeneratingSkillTree ? <><Loader2 className="h-4 w-4 animate-spin mr-2"/>Generating skill tree...</> : "No skill tree available."}
                                                 </div>
                                             )}
                                            </TabsContent>
                                        </div>
                                     </Tabs>
                                 ) : (
                                     <InventoryDisplay />
                                 )}
                             </div>
                       </SheetContent>
                    </Sheet>
                    <Button variant="ghost" size="icon" onClick={onSettingsOpen}>
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Button>
                 </div>
            </div>
        </TooltipProvider>
    );
}
