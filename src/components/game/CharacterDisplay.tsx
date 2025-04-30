// src/components/game/CharacterDisplay.tsx
"use client";

import { useGame } from "@/context/GameContext";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { HandDrawnStrengthIcon, HandDrawnStaminaIcon, HandDrawnAgilityIcon } from "@/components/icons/HandDrawnIcons";
import { Brain, BookOpen, User, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CharacterDisplay() {
  const { state } = useGame();
  const { character } = state;

  if (!character) {
    return null; // Don't display if no character exists
  }

  return (
    <CardboardCard className="mb-4 sticky top-4 bg-card/90 backdrop-blur-sm z-10">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <User className="w-5 h-5"/> {character.name}
        </CardTitle>
         {/* Display simplified background/traits/knowledge */}
         <div className="flex flex-wrap gap-1 mt-2">
            {character.background && <Badge variant="secondary">{character.background}</Badge>}
            {character.traits.map((trait, index) => (
                <Badge key={`trait-${index}`} variant="outline">{trait}</Badge>
            ))}
             {character.knowledge.map((k, index) => (
                <Badge key={`knowledge-${index}`} variant="outline">{k}</Badge>
            ))}
         </div>
      </CardHeader>
      <CardContent className="pb-4">
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
             <p className="text-xs text-muted-foreground mt-3 italic line-clamp-2">
                 {character.aiGeneratedDescription}
             </p>
         )}
      </CardContent>
    </CardboardCard>
  );
}
