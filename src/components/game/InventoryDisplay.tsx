// src/components/game/InventoryDisplay.tsx
"use client";

import { useGame } from "@/context/GameContext";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Backpack, PackageSearch } from "lucide-react";
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function InventoryDisplay() {
  const { state } = useGame();
  const { inventory } = state;

  return (
    <CardboardCard className="mb-4 bg-card/90 backdrop-blur-sm sticky top-[calc(100vh-250px)] max-h-[250px] overflow-hidden flex flex-col"> {/* Adjust top offset and max-height */}
      <CardHeader className="pb-2 pt-4 flex-shrink-0">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Backpack className="w-5 h-5" /> Backpack
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 pt-2 flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-3"> {/* pr-3 to avoid scrollbar overlap */}
          {inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-4">
                <PackageSearch className="w-8 h-8 mb-2 opacity-50"/>
                <p className="text-sm italic">Your backpack is empty.</p>
            </div>
          ) : (
            <TooltipProvider delayDuration={100}>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {inventory.map((item, index) => (
                  <Tooltip key={`${item.name}-${index}`}>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center p-1 border border-foreground/10 rounded-sm bg-background/50 hover:bg-accent/10 transition-colors aspect-square justify-center">
                         <div className="relative w-12 h-12 mb-1">
                             {item.imageDataUri ? (
                                <Image
                                    src={item.imageDataUri}
                                    alt={item.name}
                                    layout="fill"
                                    objectFit="contain" // Use contain to see the whole item
                                    className="rounded-sm"
                                    unoptimized // Necessary for external URLs like picsum
                                />
                                ) : (
                                // Skeleton loader while image is potentially generating
                                <Skeleton className="w-full h-full rounded-sm" />
                                )}
                         </div>
                         <p className="text-xs text-center truncate w-full px-1">{item.name}</p>
                      </div>
                    </TooltipTrigger>
                     <TooltipContent side="bottom">
                         <p className="font-semibold">{item.name}</p>
                         {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                         {!item.imageDataUri && <p className="text-xs text-muted-foreground italic">(Image loading...)</p>}
                     </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          )}
        </ScrollArea>
      </CardContent>
    </CardboardCard>
  );
}
