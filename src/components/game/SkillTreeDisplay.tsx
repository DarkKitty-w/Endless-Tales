// src/components/game/SkillTreeDisplay.tsx
"use client";

import React from "react";
import type { SkillTree, Skill } from "@/context/GameContext"; // Import Skill type
import { CardboardCard, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/game/CardboardCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star, Lock, Unlock, Sparkles, CheckCircle2, CircleDot, Workflow } from "lucide-react"; // Added CheckCircle2, CircleDot, Workflow
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
  learnedSkills: Skill[]; // Pass the list of actually learned skills
}

export function SkillTreeDisplay({ skillTree, currentStage, learnedSkills }: SkillTreeDisplayProps) {

  if (!skillTree || !skillTree.stages || skillTree.stages.length !== 5) { // Check for 5 stages (0-4)
    return (
      <CardboardCard className="m-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Workflow className="w-5 h-5"/> Skill Tree Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Invalid skill tree data provided.</p>
        </CardContent>
      </CardboardCard>
    );
  }

  // Sort stages just in case they are not in order (0-4)
  const sortedStages = [...skillTree.stages].sort((a, b) => a.stage - b.stage);

   // Find the stage to open by default (the highest unlocked stage)
   const defaultOpenStageValue = `stage-${currentStage}`;


  return (
    <ScrollArea className="h-full p-4">
      <TooltipProvider delayDuration={100}>

        {/* Learned Skills Section */}
         <div className="mb-4 border-b pb-3">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
               <CheckCircle2 className="w-4 h-4 text-primary"/> Learned Skills ({learnedSkills.length})
            </h4>
            {learnedSkills.length > 0 ? (
               <div className="flex flex-wrap gap-1">
                  {learnedSkills.map((skill) => (
                     <Tooltip key={skill.name}>
                        <TooltipTrigger>
                           <Badge variant="secondary" className="cursor-help text-xs py-0.5 px-1.5">
                              {skill.name} {skill.type === 'Starter' ? '(S)' : ''} {/* Shorten Starter */}
                           </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start" className="max-w-xs">
                           <p className="font-semibold">{skill.name} {skill.type === 'Starter' ? '(Starter)' : ''}</p>
                           <p className="text-xs text-muted-foreground">{skill.description}</p>
                            {(skill.staminaCost !== undefined || skill.manaCost !== undefined) && <p className="text-xs mt-1">Cost: {skill.staminaCost && <span className="text-green-600">{skill.staminaCost} STA </span>} {skill.manaCost && <span className="text-blue-600">{skill.manaCost} Mana</span>}</p>}
                        </TooltipContent>
                     </Tooltip>
                  ))}
               </div>
            ) : (
               <p className="text-xs text-muted-foreground italic">No skills learned yet.</p>
            )}
         </div>

        <h3 className="text-base font-semibold mb-2 flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
            <Workflow className="w-4 h-4"/> {skillTree.className} Skill Tree
        </h3>
        <Accordion type="single" collapsible defaultValue={defaultOpenStageValue} className="w-full">
          {sortedStages.map((stageData) => {
            const isUnlocked = stageData.stage <= currentStage;
            const isCurrent = stageData.stage === currentStage;
            const stageIcon = stageData.stage === 0 ? Sparkles : isUnlocked ? Unlock : Lock;
            const stageColor = isCurrent ? 'text-accent' : isUnlocked ? 'text-primary' : 'text-muted-foreground';

            return (
              <AccordionItem key={`stage-${stageData.stage}`} value={`stage-${stageData.stage}`} className="mb-2 border rounded-md overflow-hidden border-border/50">
                 <AccordionTrigger
                    className={`flex justify-between items-center px-3 py-2 ${
                      isCurrent ? 'bg-accent/10 border-l-4 border-accent' : isUnlocked ? 'bg-primary/5' : 'bg-muted/30 opacity-70'
                    } hover:bg-accent/5 hover:no-underline transition-colors`}
                     disabled={!isUnlocked}
                 >
                   <div className="flex items-center gap-2 flex-1 min-w-0">
                     <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="flex items-center gap-2">
                                <stageIcon className={`w-4 h-4 flex-shrink-0 ${isUnlocked ? 'text-green-600' : 'text-muted-foreground'}`} />
                                <span className={`font-semibold truncate ${stageColor}`}>
                                   {stageData.stageName || `Stage ${stageData.stage}`}
                                </span>
                            </span>
                         </TooltipTrigger>
                          <TooltipContent side="top">Stage {stageData.stage}: {stageData.stageName}</TooltipContent>
                     </Tooltip>
                      {/* Display 'Current' badge */}
                      {isCurrent && <Badge variant="default" className="text-xs ml-auto mr-2 py-0 px-1.5 h-5">Current</Badge>}
                   </div>
                    {/* Star rating */}
                    <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
                         <Tooltip>
                             <TooltipTrigger asChild>
                                 <span className="flex items-center gap-0.5">
                                     {[...Array(stageData.stage)].map((_, i) => (
                                         <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-500" />
                                     ))}
                                     {[...Array(4 - stageData.stage)].map((_, i) => (
                                        <Star key={`empty-${i}`} className="w-3 h-3 text-muted-foreground/30" />
                                    ))}
                                 </span>
                            </TooltipTrigger>
                             <TooltipContent side="top">Stage {stageData.stage} / 4 Achieved</TooltipContent>
                         </Tooltip>
                    </div>
                 </AccordionTrigger>
                 <AccordionContent className="pt-3 pl-5 pr-3 pb-4 bg-background">
                   {isUnlocked ? (
                     stageData.skills && stageData.skills.length > 0 ? (
                       <ul className="space-y-2">
                          <p className="text-xs text-muted-foreground mb-2 italic">Skills available at this stage:</p>
                         {stageData.skills.map((skill) => {
                            const isLearned = learnedSkills.some(ls => ls.name === skill.name);

                           return (
                             <li key={skill.name} className="text-sm flex items-start gap-2">
                                {isLearned ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5"/> : <CircleDot className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0 mt-0.5"/>}
                                <Tooltip>
                                   <TooltipTrigger asChild>
                                      <span className={`font-medium ${isLearned ? 'cursor-help ' : 'text-muted-foreground italic cursor-help'}`}>
                                          {skill.name}
                                          {isLearned && <span className="text-green-600 font-normal text-xs"> (Learned)</span>}
                                      </span>
                                   </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start" className="max-w-xs">
                                       <p className="font-semibold">{skill.name}</p>
                                       <p className="text-xs text-muted-foreground">{skill.description}</p>
                                        {(skill.staminaCost !== undefined || skill.manaCost !== undefined) && <p className="text-xs mt-1">Cost: {skill.staminaCost && <span className="text-green-600">{skill.staminaCost} STA </span>} {skill.manaCost && <span className="text-blue-600">{skill.manaCost} Mana</span>}</p>}
                                       {!isLearned && <p className="text-xs text-destructive italic mt-1">(Not Learned Yet)</p>}
                                    </TooltipContent>
                                </Tooltip>
                             </li>
                           );
                         })}
                       </ul>
                     ) : (
                        stageData.stage > 0 ?
                       <p className="text-sm text-muted-foreground italic">No specific new skills become available at this stage.</p> :
                        <p className="text-sm text-muted-foreground italic">This is the starting point. Advance further to unlock skills.</p>
                     )
                   ) : (
                     <p className="text-sm text-muted-foreground italic">Locked. Progress further to unlock this stage.</p>
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
