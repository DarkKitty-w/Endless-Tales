// src/components/game/CharacterDisplay.tsx
"use client";

import { useGame } from "@/context/GameContext";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "@/components/icons/HandDrawnIcons";
import { User, ShieldQuestion, Star, Zap, HeartPulse, Workflow } from "lucide-react"; // Added Zap, HeartPulse, Workflow
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress"; // Import Progress
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CharacterDisplay() {
  const { state } = useGame();
  const { character } = state;

  if (!character) {
    return null; // Don't display if no character exists
  }

   // Find the current stage name
   const currentStageName = character.skillTree && character.skillTreeStage >= 0 && character.skillTree.stages[character.skillTreeStage]
       ? character.skillTree.stages[character.skillTreeStage]?.stageName ?? `Stage ${character.skillTreeStage}`
       : "Potential"; // Default to "Potential" for stage 0

  // Helper to render stars based on stage
  const renderStageStars = (stage: number) => {
    const stars = [];
    // Stage 0 = 0 stars filled, Stage 1 = 1 star, ..., Stage 4 = 4 stars
    const filledStars = Math.max(0, stage); // Ensure stage isn't negative
    const totalStars = 4; // Max stages represented by stars

    for (let i = 0; i < totalStars; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < filledStars ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground/30'}`}
          aria-label={i < filledStars ? "Stage achieved" : "Stage not achieved"}
        />
      );
    }
    return stars;
  };


  return (
    <CardboardCard className="mb-4 sticky top-4 bg-card/90 backdrop-blur-sm z-10 border-2 border-foreground/20">
      <CardHeader className="pb-2 pt-4 border-b border-foreground/10">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <User className="w-5 h-5 text-primary"/> {character.name || "Unnamed Adventurer"}
        </CardTitle>
         {/* Display class, background, traits, and knowledge using Badges */}
         <div className="flex flex-wrap gap-1 mt-2">
             {character.class && (
                 <Badge variant="default" className="text-xs bg-purple-200 dark:bg-purple-800/60 border-purple-400 dark:border-purple-600 text-purple-900 dark:text-purple-100 flex items-center gap-1">
                     <ShieldQuestion className="w-3 h-3"/> {character.class}
                 </Badge>
             )}
            {character.background && (
              <Badge variant="secondary" className="text-xs">BG: {character.background}</Badge>
            )}
            {character.traits.length > 0 && character.traits.map((trait, index) => (
                <Badge key={`trait-${index}`} variant="outline" className="text-xs">{trait}</Badge>
            ))}
             {character.knowledge.length > 0 && character.knowledge.map((k, index) => (
                <Badge key={`knowledge-${index}`} variant="outline" className="text-xs bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700">{k}</Badge>
            ))}
         </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        {/* Stats Display */}
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div className="flex flex-col items-center">
             <TooltipProvider delayDuration={100}>
                 <Tooltip>
                     <TooltipTrigger> <HandDrawnStrengthIcon className="w-6 h-6 mb-1 text-destructive" /> </TooltipTrigger>
                     <TooltipContent>Strength</TooltipContent>
                 </Tooltip>
             </TooltipProvider>
            <span className="text-sm font-medium">STR</span>
            <span className="text-lg font-bold">{character.stats.strength}</span>
          </div>
          <div className="flex flex-col items-center">
             <TooltipProvider delayDuration={100}>
                 <Tooltip>
                     <TooltipTrigger> <HandDrawnStaminaIcon className="w-6 h-6 mb-1 text-green-600" /> </TooltipTrigger>
                     <TooltipContent>Stamina (Base)</TooltipContent>
                 </Tooltip>
             </TooltipProvider>
            <span className="text-sm font-medium">STA</span>
            <span className="text-lg font-bold">{character.stats.stamina}</span>
          </div>
          <div className="flex flex-col items-center">
             <TooltipProvider delayDuration={100}>
                 <Tooltip>
                     <TooltipTrigger> <HandDrawnAgilityIcon className="w-6 h-6 mb-1 text-blue-500" /> </TooltipTrigger>
                     <TooltipContent>Agility</TooltipContent>
                 </Tooltip>
             </TooltipProvider>
            <span className="text-sm font-medium">AGI</span>
            <span className="text-lg font-bold">{character.stats.agility}</span>
          </div>
        </div>

        {/* Resource Bars */}
        <div className="space-y-3 mt-4">
          {/* Stamina Bar */}
          <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger className="w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <HeartPulse className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400">Stamina</span>
                      <span className="ml-auto text-xs font-mono text-muted-foreground">{character.currentStamina} / {character.maxStamina}</span>
                    </div>
                    <Progress
                        value={(character.currentStamina / character.maxStamina) * 100}
                        className="h-2 bg-green-100 dark:bg-green-900/50 [&>div]:bg-green-500"
                        aria-label={`Stamina ${character.currentStamina} of ${character.maxStamina}`}
                    />
                </TooltipTrigger>
                <TooltipContent>
                    <p>Represents physical energy for demanding actions.</p>
                </TooltipContent>
              </Tooltip>
          </TooltipProvider>

          {/* Mana Bar - Only show if maxMana > 0 */}
          {character.maxMana > 0 && (
               <TooltipProvider delayDuration={100}>
                   <Tooltip>
                     <TooltipTrigger className="w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Mana</span>
                          <span className="ml-auto text-xs font-mono text-muted-foreground">{character.currentMana} / {character.maxMana}</span>
                        </div>
                        <Progress
                            value={(character.currentMana / character.maxMana) * 100}
                            className="h-2 bg-blue-100 dark:bg-blue-900/50 [&>div]:bg-blue-500"
                            aria-label={`Mana ${character.currentMana} of ${character.maxMana}`}
                        />
                     </TooltipTrigger>
                     <TooltipContent>
                         <p>Represents magical or special energy for abilities.</p>
                     </TooltipContent>
                   </Tooltip>
               </TooltipProvider>
          )}
        </div>


        {/* Skill Tree Stage Display */}
        {character.skillTree && (
             <div className="mt-4 pt-4 border-t border-foreground/10">
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger className="w-full text-center">
                             <p className="text-sm font-medium mb-1 flex items-center justify-center gap-1.5">
                                 <Workflow className="w-4 h-4 text-purple-600"/> Skill Progression
                             </p>
                             <div className="flex justify-center items-center gap-1">
                                {renderStageStars(character.skillTreeStage)}
                             </div>
                              <p className="text-base font-semibold text-foreground mt-1">
                                  {currentStageName}
                              </p>
                               <p className="text-xs text-muted-foreground">
                                  ({character.skillTree.className} - Stage {character.skillTreeStage}/4)
                              </p>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Your current stage in the {character.skillTree.className} skill tree.</p>
                            <p>Progress further to unlock new stages and skills.</p>
                        </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                 {/* List AVAILABLE skills for the current stage (from skillTree) */}
                 {character.skillTreeStage >= 0 && character.skillTree.stages[character.skillTreeStage]?.skills.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-dashed border-foreground/10 text-center">
                        <p className="text-xs font-semibold mb-1.5">Skills Available at Stage {character.skillTreeStage}:</p>
                        <div className="flex flex-wrap justify-center gap-1">
                         {character.skillTree.stages[character.skillTreeStage].skills.map(skill => {
                            const isLearned = character.learnedSkills.some(ls => ls.name === skill.name);
                            return (
                                <TooltipProvider key={skill.name} delayDuration={100}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Badge
                                               variant={isLearned ? "default" : "outline"}
                                               className={`text-xs font-medium cursor-help ${
                                                   isLearned
                                                       ? 'bg-primary/80 text-primary-foreground border-primary' // Learned style
                                                       : 'border-dashed border-muted-foreground/50 text-muted-foreground' // Not learned style
                                               }`}
                                             >
                                                {skill.name}
                                                {isLearned ? ' ✓' : ''}
                                             </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-semibold">{skill.name}</p>
                                            <p className="text-xs text-muted-foreground">{skill.description}</p>
                                            {(skill.staminaCost || skill.manaCost) && (
                                                <p className="text-xs mt-1">
                                                    Cost:
                                                    {skill.staminaCost && <span className="text-green-600"> {skill.staminaCost} STA</span>}
                                                    {skill.manaCost && <span className="text-blue-600"> {skill.manaCost} Mana</span>}
                                                </p>
                                            )}
                                            {!isLearned && <p className="text-xs text-destructive italic mt-1">(Not Learned)</p>}
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            );
                         })}
                        </div>
                    </div>
                 )}
             </div>
         )}

         {/* Separator before Description */}
         <Separator className="my-3"/>

         {/* Description Display */}
         <div className="text-xs text-muted-foreground italic">
             {character.aiGeneratedDescription ? (
                 <>
                     <strong className="not-italic text-foreground/80">AI Profile:</strong> {character.aiGeneratedDescription.length > 150 ? character.aiGeneratedDescription.substring(0, 150) + "..." : character.aiGeneratedDescription}
                 </>
             ) : character.description ? (
                 <>
                     <strong className="not-italic text-foreground/80">Description:</strong> {character.description.length > 150 ? character.description.substring(0, 150) + "..." : character.description}
                 </>
             ) : (
                 "No description available."
             )}
         </div>

      </CardContent>
    </CardboardCard>
  );
}
