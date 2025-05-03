// src/components/game/InventoryDisplay.tsx
"use client";

import { useGame, type ItemQuality } from "@/context/GameContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Backpack, PackageSearch, Package, Info, Weight, Gem, Sparkles, HeartCrack, ShieldCheck } from "lucide-react"; // Added icons
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Helper to get quality color
const getQualityColor = (quality: ItemQuality | undefined): string => {
    switch (quality) {
        case "Poor": return "text-gray-500 dark:text-gray-400";
        case "Common": return "text-foreground";
        case "Uncommon": return "text-green-600 dark:text-green-400";
        case "Rare": return "text-blue-600 dark:text-blue-400";
        case "Epic": return "text-purple-600 dark:text-purple-400";
        case "Legendary": return "text-orange-500 dark:text-orange-400";
        default: return "text-muted-foreground";
    }
};


export function InventoryDisplay() {
  const { state } = useGame();
  const { inventory } = state;

  // Determine appropriate icon based on item name (simple example)
  const getItemIcon = (itemName: string) => {
     const lowerName = itemName.toLowerCase();
     if (lowerName.includes('sword') || lowerName.includes('dagger') || lowerName.includes('axe')) return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 17.5 3 6"/><path d="m21 14-8-8"/><path d="m17 17-5.5-5.5"/><path d="M14 9.5 9.5 5"/><path d="M17 3 7 3"/><path d="M19 5 9 5"/></svg>; // Lucide Sword icon replacement
     if (lowerName.includes('shield')) return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>; // Lucide Shield
     if (lowerName.includes('potion') || lowerName.includes('flask')) return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h8"/><path d="M7 2v4.64a1 1 0 0 0 .4 1l4.24 4.24a1 1 0 0 1 .4 1L11.4 18"/><path d="M8 22h8"/><path d="M7 18h10"/></svg>; // Lucide FlaskConical
     if (lowerName.includes('book') || lowerName.includes('tome') || lowerName.includes('scroll')) return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>; // Lucide Book
     if (lowerName.includes('key')) return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>; // Lucide Key
     if (lowerName.includes('clothes') || lowerName.includes('armor') || lowerName.includes('robe') || lowerName.includes('chestplate')) return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 21c-2.4-2-2.4-6 0-8"/><path d="M10 21c2.4-2 2.4-6 0-8"/><path d="M15 3a1 1 0 0 0-1 1v4.2c0 .4 0 .9-.3 1.3l-2.9 4.1c-.1.2-.2.3-.4.4H8.7c-.2-.1-.3-.2-.4-.4L5.4 9.6c-.3-.4-.3-.9-.3-1.3V4a1 1 0 0 0-1-1"/><path d="M10 11h4"/></svg>; // Lucide Shirt
     if (lowerName.includes('bread') || lowerName.includes('food') || lowerName.includes('apple')) return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 13a2 2 0 0 0-2 2.83 1 1 0 0 1-.83.83 2 2 0 0 0-2.83 2 1 1 0 0 1-.83.83 2 2 0 0 0 0 2.83 1 1 0 0 1 .83.83 2 2 0 0 0 2.83 0 1 1 0 0 1 .83-.83 2 2 0 0 0 0-2.83 1 1 0 0 1-.83-.83 2 2 0 0 0-2.83-2 1 1 0 0 1-.83-.83 2 2 0 0 0-2-2.83 1 1 0 0 1-.83-.83 2 2 0 0 0-2.83 0 1 1 0 0 1-.83.83 2 2 0 0 0 0 2.83 1 1 0 0 1 .83.83 2 2 0 0 0 2 2.83 1 1 0 0 1 .83.83 2 2 0 0 0 2.83 2 1 1 0 0 1 .83.83 2 2 0 0 0 2.83 0 1 1 0 0 1 .83-.83 2 2 0 0 0 2-2.83 1 1 0 0 1 .83-.83 2 2 0 0 0 0-2.83 1 1 0 0 1-.83-.83 2 2 0 0 0-2.83-2 1 1 0 0 1-.83-.83 2 2 0 0 0-2.83 0 1 1 0 0 1-.83.83 2 2 0 0 0-2 2.83 1 1 0 0 1-.83.83 2 2 0 0 0-2.83 2 1 1 0 0 1-.83.83 2 2 0 0 0 0 2.83 1 1 0 0 1 .83.83 2 2 0 0 0 2.83 0 1 1 0 0 1 .83-.83Z"/></svg>; // Lucide Apple (placeholder for food)
     // Default icon
     return <Package className="w-4 h-4" />;
  };

  return (
    <div className="h-full flex flex-col"> {/* Use flex to fill height */}
      <ScrollArea className="flex-grow p-4"> {/* Use flex-grow and add padding */}
        {inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-4">
              <PackageSearch className="w-8 h-8 mb-2 opacity-50"/>
              <p className="text-sm italic">Your backpack is empty.</p>
          </div>
        ) : (
          <TooltipProvider delayDuration={100}>
             <ul className="space-y-2">
                {inventory.map((item, index) => (
                  <li key={`${item.name}-${index}`} className="flex items-center justify-between p-2 border border-foreground/10 rounded-sm bg-background/50 hover:bg-accent/10 transition-colors text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                         {getItemIcon(item.name)}
                         <span className={`truncate ${getQualityColor(item.quality)}`} title={item.name}>{item.name}</span>
                         {item.quality && item.quality !== "Common" && (
                             <Badge variant="outline" className={`text-xs ml-1 py-0 px-1 h-4 border-0 ${getQualityColor(item.quality)} bg-transparent`}>
                                {item.quality}
                             </Badge>
                         )}
                      </div>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <button className="ml-2 p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded-full">
                                 <Info className="w-4 h-4" />
                                 <span className="sr-only">Item Info</span>
                              </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                              <p className={`font-semibold ${getQualityColor(item.quality)}`}>{item.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                              <div className="mt-2 pt-2 border-t border-border/50 text-xs space-y-1">
                                 {item.quality && (
                                    <p className="flex items-center gap-1"><Gem className="w-3 h-3 text-purple-500"/> Quality: <span className={getQualityColor(item.quality)}>{item.quality}</span></p>
                                 )}
                                 {item.weight !== undefined && (
                                     <p className="flex items-center gap-1"><Weight className="w-3 h-3 text-gray-500"/> Weight: {item.weight}</p>
                                 )}
                                  {item.durability !== undefined && (
                                     <p className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-blue-500"/> Durability: {item.durability}%</p>
                                  )}
                                  {item.magicalEffect && (
                                     <p className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-yellow-500"/> Effect: {item.magicalEffect}</p>
                                  )}
                              </div>
                          </TooltipContent>
                      </Tooltip>
                  </li>
                ))}
            </ul>
          </TooltipProvider>
        )}
      </ScrollArea>
    </div>
  );
}
