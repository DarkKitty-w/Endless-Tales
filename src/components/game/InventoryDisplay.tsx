// src/components/game/InventoryDisplay.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useGame } from "../../context/GameContext";
import type { ItemQuality } from "../../types/game-types";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Backpack, PackageSearch, Package, Info, Weight, Gem, Sparkles, HeartCrack, ShieldCheck, Sword, Shield, FlaskConical, BookOpen, Key, Shirt, Apple } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { getQualityColor } from "../../lib/utils";
import { Button } from "../../components/ui/button";

type ItemCategory = 'All' | 'Weapon' | 'Armor' | 'Consumable' | 'Material' | 'Other';

const categoryConfig: Record<ItemCategory, { icon: React.ReactNode; color: string }> = {
  'All': { icon: <Package className="w-4 h-4" />, color: 'text-foreground' },
  'Weapon': { icon: <Sword className="w-4 h-4" />, color: 'text-red-500' },
  'Armor': { icon: <Shirt className="w-4 h-4" />, color: 'text-blue-500' },
  'Consumable': { icon: <Apple className="w-4 h-4" />, color: 'text-green-500' },
  'Material': { icon: <Gem className="w-4 h-4" />, color: 'text-purple-500' },
  'Other': { icon: <Package className="w-4 h-4" />, color: 'text-gray-500' },
};

const categorizeItem = (itemName: string): ItemCategory => {
  const lowerName = itemName.toLowerCase();
  if (lowerName.includes('sword') || lowerName.includes('dagger') || lowerName.includes('axe') || lowerName.includes('bow') || lowerName.includes('weapon')) return 'Weapon';
  if (lowerName.includes('shield') || lowerName.includes('armor') || lowerName.includes('robe') || lowerName.includes('chestplate') || lowerName.includes('helmet') || lowerName.includes('boots')) return 'Armor';
  if (lowerName.includes('potion') || lowerName.includes('flask') || lowerName.includes('bread') || lowerName.includes('food') || lowerName.includes('apple') || lowerName.includes('consumable')) return 'Consumable';
  if (lowerName.includes('ore') || lowerName.includes('ingot') || lowerName.includes('leather') || lowerName.includes('cloth') || lowerName.includes('material') || lowerName.includes('herb')) return 'Material';
  return 'Other';
};

export function InventoryDisplay() {
  const { state } = useGame();
  const { inventory } = state;
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('All');

  const categorizedItems = useMemo(() => {
    const items = inventory.map(item => ({
      ...item,
      category: categorizeItem(item.name),
    }));
    
    if (activeCategory === 'All') return items;
    return items.filter(item => item.category === activeCategory);
  }, [inventory, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<ItemCategory, number> = {
      'All': inventory.length,
      'Weapon': 0,
      'Armor': 0,
      'Consumable': 0,
      'Material': 0,
      'Other': 0,
    };
    
    inventory.forEach(item => {
      const cat = categorizeItem(item.name);
      counts[cat]++;
    });
    
    return counts;
  }, [inventory]);

  const getItemIcon = (itemName: string) => {
     const lowerName = itemName.toLowerCase();
     if (lowerName.includes('sword') || lowerName.includes('dagger') || lowerName.includes('axe')) return <Sword className="w-4 h-4" />;
     if (lowerName.includes('shield')) return <Shield className="w-4 h-4" />;
     if (lowerName.includes('potion') || lowerName.includes('flask')) return <FlaskConical className="w-4 h-4" />;
     if (lowerName.includes('book') || lowerName.includes('tome') || lowerName.includes('scroll')) return <BookOpen className="w-4 h-4" />;
     if (lowerName.includes('key')) return <Key className="w-4 h-4" />;
     if (lowerName.includes('clothes') || lowerName.includes('armor') || lowerName.includes('robe') || lowerName.includes('chestplate')) return <Shirt className="w-4 h-4" />;
     if (lowerName.includes('bread') || lowerName.includes('food') || lowerName.includes('apple')) return <Apple className="w-4 h-4" />;
     return <Package className="w-4 h-4" />;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Category Tabs */}
      <div className="flex gap-1 p-2 border-b border-foreground/10 overflow-x-auto">
        {(Object.keys(categoryConfig) as ItemCategory[]).map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1 text-xs h-7"
            onClick={() => setActiveCategory(cat)}
          >
            {categoryConfig[cat].icon}
            <span>{cat}</span>
            {categoryCounts[cat] > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {categoryCounts[cat]}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-grow p-4">
        {categorizedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-4">
              <PackageSearch className="w-8 h-8 mb-2 opacity-50"/>
              <p className="text-sm italic">
                {activeCategory === 'All' ? 'Your backpack is empty.' : `No ${activeCategory.toLowerCase()} items.`}
              </p>
          </div>
        ) : (
          <TooltipProvider delayDuration={100}>
             <ul className="space-y-2">
                {categorizedItems.map((item, index) => (
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

export default React.memo(InventoryDisplay);
