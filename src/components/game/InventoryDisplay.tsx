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

  // Remove CardboardCard wrapper, as it will be within TabsContent
  return (
    <div className="h-full flex flex-col"> {/* Use flex to fill height */}
      {/* Optional: If you still want a header-like element */}
      {/* <div className="p-4 border-b">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Backpack className="w-5 h-5" /> Backpack
        </h3>
      </div> */}
      <ScrollArea className="flex-grow p-4"> {/* Use flex-grow and add padding */}
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
                    <div className="flex flex-col items-center p-1 border border-foreground/10 rounded-sm bg-background/50 hover:bg-accent/10 transition-colors aspect-square justify-center cursor-help">
                       <div className="relative w-12 h-12 mb-1">
                           {item.imageDataUri ? (
                              <Image
                                  src={item.imageDataUri} // Use the actual imageDataUri from context
                                  alt={item.name}
                                  layout="fill"
                                  objectFit="contain" // Use contain to see the whole item
                                  className="rounded-sm"
                                  unoptimized // Important for data URIs or external URLs like Picsum
                                  // Optionally add a hint for AI image generation if needed later
                                  data-ai-hint={item.name.toLowerCase().replace(/ /g, '_')} // Example hint: rusty_sword
                              />
                              ) : (
                              // Skeleton loader while image is potentially generating or missing
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
    </div>
  );
}
