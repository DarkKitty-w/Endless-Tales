// src/components/game/SkillTreeDisplay.tsx
"use client";

import React from "react";
import type { SkillTree } from "@/context/GameContext";
import { CardboardCard, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/game/CardboardCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star, Lock, Unlock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SkillTreeDisplayProps {
  skillTree: SkillTree;
  currentStage: number; // Stage the character has achieved (0-4)
}

export function SkillTreeDisplay({ skillTree, currentStage }: SkillTreeDisplayProps) {

  if (!skillTree || !skillTree.stages || skillTree.stages.length !== 4) {
    return (
      <CardboardCard className="m-4">
        <CardHeader>
          <CardTitle>Skill Tree Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Invalid skill tree data provided.</p>
        </CardContent>
      </CardboardCard>
    );
  }

  // Sort stages just in case they are not in order
  const sortedStages = [...skillTree.stages].sort((a, b) => a.stage - b.stage);

  return (
    <ScrollArea className="h-full p-4">
      <TooltipProvider delayDuration={100}>
        <Accordion type="single" collapsible defaultValue={`stage-${currentStage > 0 ? currentStage : 1}`}>
          {sortedStages.map((stageData) => {
            const isUnlocked = stageData.stage <= currentStage;
            const isCurrent = stageData.stage === currentStage;

            return (
              <AccordionItem key={`stage-${stageData.stage}`} value={`stage-${stageData.stage}`} className="mb-3 border-b-0">
                 <AccordionTrigger
                    className={`flex justify-between items-center p-3 rounded-md border-2 ${
                      isCurrent ? 'border-accent bg-accent/10' : isUnlocked ? 'border-primary/30 bg-primary/5' : 'border-muted bg-muted/50'
                    } hover:bg-accent/5 hover:no-underline`}
                 >
                   <div className="flex items-center gap-2">
                     {isUnlocked ? <Unlock className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                     <span className={`font-semibold ${isCurrent ? 'text-accent' : isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                        {stageData.stageName || `Stage ${stageData.stage}`} {/* Display stage name */}
                     </span>
                     {isCurrent && <Badge variant="default" className="text-xs ml-2">Current</Badge>}
                   </div>
                    <div className="flex items-center gap-0.5 mr-2">
                        {[...Array(stageData.stage)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${isUnlocked ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground/30'}`} />
                        ))}
                         {[...Array(4 - stageData.stage)].map((_, i) => (
                            <Star key={`empty-${i}`} className="w-3 h-3 text-muted-foreground/30" />
                        ))}
                    </div>
                 </AccordionTrigger>
                 <AccordionContent className="pt-3 pl-6 pr-2">
                   {isUnlocked ? (
                     stageData.skills.length > 0 ? (
                       <ul className="space-y-2">
                         {stageData.skills.map((skill) => (
                           <li key={skill.name} className="text-sm">
                              <Tooltip>
                                 <TooltipTrigger asChild>
                                    <span className="font-medium cursor-help underline decoration-dotted decoration-muted-foreground/50">
                                        {skill.name}
                                    </span>
                                 </TooltipTrigger>
                                 <TooltipContent side="bottom" align="start">
                                    <p>{skill.description}</p>
                                 </TooltipContent>
                             </Tooltip>
                             {/* <p className="text-xs text-muted-foreground ml-2">- {skill.description}</p> */}
                           </li>
                         ))}
                       </ul>
                     ) : (
                       <p className="text-sm text-muted-foreground italic">No specific skills listed for this stage.</p>
                     )
                   ) : (
                     <p className="text-sm text-muted-foreground italic">Locked. Progress further to unlock.</p>
                   )}
                 </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </TooltipProvider>
    </ScrollArea>
  );
}
