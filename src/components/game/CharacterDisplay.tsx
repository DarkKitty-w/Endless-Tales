// src/components/game/CharacterDisplay.tsx
"use client";

import { useGame } from "@/context/GameContext";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "@/components/icons/HandDrawnIcons";
import { User, ShieldQuestion } from "lucide-react"; // Import ShieldQuestion for Class
import { Badge } from "@/components/ui/badge";

export function CharacterDisplay() {
  const { state } = useGame();
  const { character } = state;

  if (!character) {
    return null; // Don't display if no character exists
  }

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
        <div className="grid grid-cols-3 gap-2 text-center">
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

         {/* Optional: Display a snippet of the AI description if available */}
         {character.aiGeneratedDescription && (
             <p className="text-xs text-muted-foreground mt-3 italic line-clamp-3 border-t border-foreground/10 pt-2">
                 <strong>AI Profile:</strong> {character.aiGeneratedDescription}
             </p>
          )}
           {/* Display base description if no AI one exists */}
          {!character.aiGeneratedDescription && character.description && (
               <p className="text-xs text-muted-foreground mt-3 italic line-clamp-3 border-t border-foreground/10 pt-2">
                  <strong>Description:</strong> {character.description}
               </p>
          )}
      </CardContent>
    </CardboardCard>
  );
}
