// src/components/game/CharacterDisplay.tsx
"use client";

import { useGame } from "@/context/GameContext";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "@/components/icons/HandDrawnIcons";
import { User, ShieldQuestion, Star } from "lucide-react"; // Added Star for skill stage
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator"; // Import Separator

export function CharacterDisplay() {
  const { state } = useGame();
  const { character } = state;

  if (!character) {
    return null; // Don't display if no character exists
  }

   // Find the current stage name
   const currentStageName = character.skillTree && character.skillTreeStage > 0
       ? character.skillTree.stages.find(s => s.stage === character.skillTreeStage)?.stageName ?? `Stage ${character.skillTreeStage}`
       : "Stage 0"; // Display "Stage 0" if no tree or stage 0


  // Helper to render stars based on stage
  const renderStageStars = (stage: number) => {
    const stars = [];
    for (let i = 0; i < 4; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${i < stage ? 'fill-yellow-400 text-yellow-500' : 'text-muted-foreground/50'}`}
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
             {character.traits.length === 0 && character.knowledge.length === 0 && !character.background && (
                 <Badge variant="outline" className="text-xs italic">No details provided</Badge>
             )}
         </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        {/* Stats Display */}
        <div className="grid grid-cols-3 gap-2 text-center mb-4">
          <div className="flex flex-col items-center">
            <HandDrawnStrengthIcon className="w-6 h-6 mb-1 text-destructive" />
            <span className="text-sm font-medium">STR</span>
            <span className="text-lg font-bold">{character.stats.strength}</span>
          </div>
          <div className="flex flex-col items-center">
            <HandDrawnStaminaIcon className="w-6 h-6 mb-1 text-green-600" />
            <span className="text-sm font-medium">STA</span>
            <span className="text-lg font-bold">{character.stats.stamina}</span>
          </div>
          <div className="flex flex-col items-center">
            <HandDrawnAgilityIcon className="w-6 h-6 mb-1 text-blue-500" />
            <span className="text-sm font-medium">AGI</span>
            <span className="text-lg font-bold">{character.stats.agility}</span>
          </div>
        </div>

        {/* Skill Tree Stage Display */}
        {character.skillTree && (
             <div className="mt-3 pt-3 border-t border-foreground/10">
                 <p className="text-sm font-medium text-center mb-1">Skill Progression</p>
                 <div className="flex justify-center items-center gap-1">
                    {renderStageStars(character.skillTreeStage)}
                 </div>
                  <p className="text-xs text-muted-foreground text-center mt-1 font-semibold">
                      {currentStageName} ({character.skillTreeStage}/4)
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-0.5">
                      {character.skillTree.className} Tree
                  </p>
                 {/* Optionally list skills for the current stage */}
                 {character.skillTreeStage > 0 && character.skillTree.stages[character.skillTreeStage - 1]?.skills.length > 0 && (
                    <div className="mt-2 text-center">
                        <p className="text-xs font-semibold">Skills:</p>
                        <div className="flex flex-wrap justify-center gap-1 mt-1">
                         {character.skillTree.stages[character.skillTreeStage - 1].skills.map(skill => (
                            <Badge key={skill.name} variant="secondary" className="text-xs">{skill.name}</Badge>
                         ))}
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
                     <strong>AI Profile:</strong> {character.aiGeneratedDescription.length > 150 ? character.aiGeneratedDescription.substring(0, 150) + "..." : character.aiGeneratedDescription}
                 </>
             ) : character.description ? (
                 <>
                     <strong>Description:</strong> {character.description.length > 150 ? character.description.substring(0, 150) + "..." : character.description}
                 </>
             ) : (
                 "No description available."
             )}
         </div>

      </CardContent>
    </CardboardCard>
  );
}
