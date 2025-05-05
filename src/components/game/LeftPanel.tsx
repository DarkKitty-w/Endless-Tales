// src/components/game/LeftPanel.tsx
"use client";

import React, { useState } from "react";
import {
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
import {
    Tooltip, TooltipContent, TooltipTrigger
} from "@/components/ui/tooltip";
import {
    Award, Users, HeartPulse, CalendarClock, Milestone, Backpack, Workflow, Loader2
} from "lucide-react";

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
        <div className="hidden md:flex flex-col w-80 lg:w-96 p-4 border-r border-foreground/10 overflow-y-auto bg-card/50 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
            {/* Character Display */}
            <CharacterDisplay />

            {/* Progression Card */}
            <CardboardCard className="mb-4 bg-card/90 backdrop-blur-sm">
                <CardHeader className="pb-2 pt-4 border-b border-foreground/10">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Milestone className="w-5 h-5"/> Progression
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 pb-4 text-sm space-y-3">
                    {/* Level and XP */}
                    <Tooltip>
                        <TooltipTrigger className="w-full cursor-help">
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

            {/* Inventory/Skills Tabs */}
            <Tabs defaultValue="inventory" className="flex-grow flex flex-col min-h-0"> {/* Ensure tabs can grow and shrink */}
                <TabsList className="flex-none">
                    <TabsTrigger value="inventory" className="flex items-center" aria-label="Open Inventory">
                       <Backpack className="w-4 h-4 mr-1.5"/> Inventory
                    </TabsTrigger>
                    <TabsTrigger value="skills" className="flex items-center" aria-label="Open Skill Tree">
                       <Workflow className="w-4 h-4 mr-1.5"/> Skills
                    </TabsTrigger>
                </TabsList>
                <div className="flex-grow overflow-hidden"> {/* Make content area scrollable */}
                    <TabsContent value="inventory" className="h-full">
                        <InventoryDisplay />
                    </TabsContent>
                    <TabsContent value="skills" className="h-full">
                        {character.skillTree && !isGeneratingSkillTree ? (
                            <SkillTreeDisplay skillTree={character.skillTree} learnedSkills={character.learnedSkills}  currentStage={character.skillTreeStage}/>
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground italic">
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
