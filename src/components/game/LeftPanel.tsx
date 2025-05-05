// src/components/game/LeftPanel.tsx
"use client";

import React from "react";
import type {
    Character, Reputation, NpcRelationships, InventoryItem, SkillTree, Skill
} from "@/types/game-types";
import { CharacterDisplay } from "@/components/game/CharacterDisplay";
import { InventoryDisplay } from "@/components/game/InventoryDisplay";
import { SkillTreeDisplay } from "@/components/game/SkillTreeDisplay";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Award, Users, HeartPulse, CalendarClock, Milestone, Backpack, Workflow, Loader2, User, BarChartBig // Added User, BarChartBig
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LeftPanelProps {
    character: Character;
    inventory: InventoryItem[];
    isGeneratingSkillTree: boolean;
    turnCount: number;
    renderReputation: (rep: Reputation | undefined) => React.ReactNode;
    renderNpcRelationships: (rels: NpcRelationships | undefined) => React.ReactNode;
}

export function LeftPanel({
    character,
    inventory,
    isGeneratingSkillTree,
    turnCount,
    renderReputation,
    renderNpcRelationships
}: LeftPanelProps) {
    return (
        <div className="hidden md:flex flex-col w-80 lg:w-96 p-4 border-r border-foreground/10 bg-card/50 h-full">
            {/* Main Tabs for Left Panel Sections */}
            <Tabs defaultValue="character" className="flex-grow flex flex-col min-h-0 h-full">
                <TabsList className="flex-none grid w-full grid-cols-4 h-12">
                    <TabsTrigger value="character" className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <User className="w-4 h-4"/> Character
                    </TabsTrigger>
                    <TabsTrigger value="progression" className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <Milestone className="w-4 h-4"/> Progression
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <Backpack className="w-4 h-4"/> Inventory
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="flex items-center gap-1.5 text-xs sm:text-sm">
                        <Workflow className="w-4 h-4"/> Skills
                    </TabsTrigger>
                </TabsList>

                {/* Tab Content Area */}
                <div className="flex-grow overflow-hidden mt-2">
                    {/* Character Tab */}
                    <TabsContent value="character" className="h-full m-0">
                         <ScrollArea className="h-full pr-3">
                            <CharacterDisplay />
                        </ScrollArea>
                    </TabsContent>

                    {/* Progression Tab */}
                    <TabsContent value="progression" className="h-full m-0">
                         <ScrollArea className="h-full pr-3">
                            <CardboardCard className="bg-transparent shadow-none border-0">
                                {/* Removed CardHeader */}
                                <CardContent className="pt-4 pb-4 text-sm space-y-3">
                                    {/* Level and XP */}
                                    <Tooltip>
                                        <TooltipTrigger className="w-full cursor-help text-left">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium flex items-center gap-1"><Award className="w-3.5 h-3.5"/> Level:</span>
                                                <span className="font-bold text-base">{character.level}</span>
                                                <span className="ml-auto font-medium text-muted-foreground">XP:</span>
                                                <span className="font-mono text-muted-foreground">{character.xp} / {character.xpToNextLevel}</span>
                                            </div>
                                            <Progress
                                                value={(character.xp / character.xpToNextLevel) * 100}
                                                className="h-2 bg-yellow-100 dark:bg-yellow-900/50 [&>div]:bg-yellow-500"
                                                aria-label={`Experience points ${character.xp} of ${character.xpToNextLevel}`}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Experience Points</p>
                                            <p className="text-xs text-muted-foreground">({character.xpToNextLevel - character.xp} needed for next level)</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Separator />
                                    {/* Reputation */}
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium flex items-center gap-1 mb-1"><Users className="w-3.5 h-3.5"/> Reputation:</Label>
                                        {renderReputation(character.reputation)}
                                    </div>

                                    <Separator />
                                    {/* Relationships */}
                                    <div className="space-y-1">
                                        <Label className="text-sm font-medium flex items-center gap-1 mb-1"><HeartPulse className="w-3.5 h-3.5"/> Relationships:</Label>
                                        {renderNpcRelationships(character.npcRelationships)}
                                    </div>

                                    <Separator />
                                     {/* Turn Count */}
                                    <div className="flex justify-between items-center">
                                         <Label className="text-sm font-medium flex items-center gap-1"><CalendarClock className="w-3.5 h-3.5"/> Turn:</Label>
                                         <span className="font-bold text-base">{turnCount}</span>
                                    </div>
                                </CardContent>
                            </CardboardCard>
                         </ScrollArea>
                    </TabsContent>

                    {/* Inventory Tab */}
                    <TabsContent value="inventory" className="h-full m-0">
                        {/* InventoryDisplay handles its own scrolling */}
                        <InventoryDisplay />
                    </TabsContent>

                    {/* Skills Tab */}
                    <TabsContent value="skills" className="h-full m-0">
                        {/* SkillTreeDisplay handles its own scrolling */}
                        {character.skillTree && !isGeneratingSkillTree ? (
                            <SkillTreeDisplay skillTree={character.skillTree} learnedSkills={character.learnedSkills}  currentStage={character.skillTreeStage}/>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground italic p-4">
                                {isGeneratingSkillTree ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Generating skill tree...
                                    </>
                                ) : (
                                     "No skill tree available."
                                )}
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
