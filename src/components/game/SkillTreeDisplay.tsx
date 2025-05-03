// src/components/game/SkillTreeDisplay.tsx
"use client";

import React from "react";
import type { SkillTree, Skill } from "@/context/GameContext"; // Import Skill type
import { CardboardCard, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/game/CardboardCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star, Lock, Unlock, Sparkles, CheckCircle2, CircleDot } from "lucide-react"; // Added CheckCircle2, CircleDot
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
          <CardTitle>Skill Tree Error</CardTitle>
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
                           <Badge variant="secondary" className="cursor-help text-xs">
                              {skill.name} {skill.type === 'Starter' ? '(Starter)' : ''}
                           </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="start">
                           <p className="font-semibold">{skill.name}</p>
                           <p className="text-xs text-muted-foreground">{skill.description}</p>
                            {skill.staminaCost !== undefined && <p className="text-xs text-green-600">Cost: {skill.staminaCost} Stamina</p>}
                            {skill.manaCost !== undefined && <p className="text-xs text-blue-600">Cost: {skill.manaCost} Mana</p>}
                        </TooltipContent>
                     </Tooltip>
                  ))}
               </div>
            ) : (
               <p className="text-xs text-muted-foreground italic">No skills learned yet beyond starters.</p>
            )}
         </div>


        <Accordion type="single" collapsible defaultValue={defaultOpenStageValue} className="w-full">
          {sortedStages.map((stageData) => {
            const isUnlocked = stageData.stage <= currentStage;
            const isCurrent = stageData.stage === currentStage;

            // Skip rendering Stage 0 trigger if currentStage is > 0, but always show content if needed
             if (stageData.stage === 0 && currentStage > 0) {
                 return null; // Don't show stage 0 accordion item if past it
             }

             // Special rendering for Stage 0 when it's the current stage
             if (stageData.stage === 0 && isCurrent) {
                  return (
                    <div
                        key="stage-0-current"
                        className={`flex justify-between items-center p-3 rounded-md border-2 mb-3 border-accent bg-accent/10`} // Style as current
                    >
                        <div className="flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-accent" /> {/* Icon for beginning */}
                           <span className={`font-semibold text-accent`}>
                              {stageData.stageName || "Potential"}
                           </span>
                           <Badge variant="default" className="text-xs ml-2">Current</Badge>
                        </div>
                        {/* Show 0 stars */}
                        <div className="flex items-center gap-0.5 mr-2">
                            {[...Array(4)].map((_, i) => (
                                <Star key={`empty-${i}`} className="w-3 h-3 text-muted-foreground/30" />
                            ))}
                        </div>
                    </div>
                  );
             }

            // Standard Accordion Item for Stages 1-4
            return (
              <AccordionItem key={`stage-${stageData.stage}`} value={`stage-${stageData.stage}`} className="mb-3 border-b-0">
                 <AccordionTrigger
                    className={`flex justify-between items-center p-3 rounded-md border-2 ${
                      isCurrent ? 'border-accent bg-accent/10' : isUnlocked ? 'border-primary/30 bg-primary/5' : 'border-muted bg-muted/50'
                    } hover:bg-accent/5 hover:no-underline`}
                     disabled={!isUnlocked && !isCurrent} // Disable trigger if not unlocked yet (unless it's the current one somehow?)
                 >
                   <div className="flex items-center gap-2">
                     {isUnlocked ? <Unlock className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                     <span className={`font-semibold ${isCurrent ? 'text-accent' : isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}>
                        {stageData.stageName || `Stage ${stageData.stage}`} {/* Display stage name */}
                     </span>
                     {/* Display 'Current' badge for stages 1-4 */}
                      {isCurrent && <Badge variant="default" className="text-xs ml-1">Current</Badge>}
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
                 <AccordionContent className="pt-3 pl-6 pr-2 pb-4">
                   {isUnlocked ? (
                     stageData.skills && stageData.skills.length > 0 ? (
                       <ul className="space-y-2">
                          <p className="text-xs text-muted-foreground mb-2 italic">Skills potentially available at this stage:</p>
                         {stageData.skills.map((skill) => {
                            const isLearned = learnedSkills.some(ls => ls.name === skill.name);

                           return (
                             <li key={skill.name} className="text-sm flex items-center gap-2">
                                {isLearned ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0"/> : <CircleDot className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0"/>}
                                <Tooltip>
                                   <TooltipTrigger asChild>
                                      <span className={`font-medium ${isLearned ? 'cursor-help underline decoration-dotted decoration-muted-foreground/50' : 'text-muted-foreground italic cursor-help'}`}>
                                          {skill.name}
                                      </span>
                                   </TooltipTrigger>
                                    <TooltipContent side="bottom" align="start">
                                       <p className="font-semibold">{skill.name}</p>
                                       <p className="text-xs text-muted-foreground">{skill.description}</p>
                                        {skill.staminaCost !== undefined && <p className="text-xs text-green-600">Cost: {skill.staminaCost} Stamina</p>}
                                        {skill.manaCost !== undefined && <p className="text-xs text-blue-600">Cost: {skill.manaCost} Mana</p>}
                                       {!isLearned && <p className="text-xs text-destructive italic mt-1">(Not Learned Yet)</p>}
                                    </TooltipContent>
                                </Tooltip>
                             </li>
                           );
                         })}
                       </ul>
                     ) : (
                       <p className="text-sm text-muted-foreground italic">No specific new skills become available at this stage.</p>
                     )
                   ) : (
                     <p className="text-sm text-muted-foreground italic">Locked. Progress further to potentially unlock skills at this stage.</p>
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
