// src/components/gameplay/CraftingDialog.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogFooter,
} from "../../components/ui/dialog";
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Hammer, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { InventoryItem } from '../../types/inventory-types';
import { getQualityColor, cn } from "../../lib/utils";
import { logger } from "../../lib/logger";

interface CraftingDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    inventory: InventoryItem[];
    onCraft: (goal: string, ingredients: string[]) => Promise<void>;
}

// Common crafting materials by category
const MATERIAL_CATEGORIES = {
    'Metal': ['iron ore', 'copper', 'gold', 'silver', 'steel', 'bronze', 'ingot', 'metal'],
    'Wood': ['wood', 'oak', 'pine', 'branch', 'log', 'timber', 'plank'],
    'Leather': ['leather', 'hide', 'skin', 'pelt'],
    'Cloth': ['cloth', 'silk', 'linen', 'cotton', 'wool', 'fabric'],
    'Gem': ['gem', 'ruby', 'sapphire', 'emerald', 'diamond', 'crystal', 'stone', 'amethyst'],
    'Herb': ['herb', 'plant', 'flower', 'mushroom', 'root', 'leaf', 'berry'],
    'Liquid': ['water', 'oil', 'potion', 'elixir', 'juice', 'wine'],
    'Mineral': ['salt', 'sulfur', 'coal', 'dust', 'powder', 'clay']
};

// Function to guess what materials might be needed based on crafting goal
const guessRequiredMaterials = (goal: string): string[] => {
    const goalLower = goal.toLowerCase();
    const guessedMaterials: string[] = [];
    
    // Check each category for matches
    Object.entries(MATERIAL_CATEGORIES).forEach(([category, keywords]) => {
        // If goal mentions the category or related words
        if (keywords.some(keyword => goalLower.includes(keyword))) {
            guessedMaterials.push(category);
        }
    });
    
    // Specific item type guesses
    if (goalLower.includes('sword') || goalLower.includes('blade') || goalLower.includes('dagger')) {
        guessedMaterials.push('Metal');
    }
    if (goalLower.includes('bow') || goalLower.includes('staff') || goalLower.includes('wand')) {
        guessedMaterials.push('Wood');
    }
    if (goalLower.includes('armor') || goalLower.includes('shield') || goalLower.includes('boots')) {
        if (goalLower.includes('leather')) guessedMaterials.push('Leather');
        else guessedMaterials.push('Metal');
    }
    if (goalLower.includes('potion') || goalLower.includes('elixir') || goalLower.includes('tonic')) {
        guessedMaterials.push('Herb', 'Liquid');
    }
    if (goalLower.includes('ring') || goalLower.includes('amulet') || goalLower.includes('necklace')) {
        guessedMaterials.push('Gem', 'Metal');
    }
    
    return [...new Set(guessedMaterials)]; // Remove duplicates
};

export function CraftingDialog({ isOpen, onOpenChange, inventory, onCraft }: CraftingDialogProps) {
    const [craftingGoal, setCraftingGoal] = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [isCraftingLoading, setIsCraftingLoading] = useState(false);
    const [craftingError, setCraftingError] = useState<string | null>(null);
    const [guessedMaterials, setGuessedMaterials] = useState<string[]>([]);

    // Update guessed materials when crafting goal changes
    useEffect(() => {
        if (craftingGoal.trim()) {
            const guessed = guessRequiredMaterials(craftingGoal);
            setGuessedMaterials(guessed);
        } else {
            setGuessedMaterials([]);
        }
    }, [craftingGoal]);

    const handleIngredientToggle = (itemName: string) => {
        setSelectedIngredients(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
    };

    const handleCraftClick = async () => {
        if (!craftingGoal.trim() || selectedIngredients.length === 0) {
            setCraftingError("Please specify a goal and select ingredients.");
            return;
        }
        setIsCraftingLoading(true);
        setCraftingError(null);
        try {
            await onCraft(craftingGoal, selectedIngredients);
        } catch (error) {
            logger.error("CraftingDialog: Error during craft attempt", 'crafting-dialog', { error: String(error) });
            setCraftingError("An unexpected error occurred during crafting.");
        } finally {
            setIsCraftingLoading(false);
        }
    };

    // Reset local state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setCraftingGoal("");
            setSelectedIngredients([]);
            setCraftingError(null);
            setIsCraftingLoading(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Hammer className="w-5 h-5" />Attempt Crafting</DialogTitle>
                    <DialogDescription>
                        Combine items from your inventory to create something new. The AI will determine the outcome based on your knowledge, skills, and the ingredients used.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Crafting Goal Input */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="crafting-goal" className="text-right col-span-1">
                            Goal
                        </Label>
                        <Input
                            id="crafting-goal"
                            value={craftingGoal}
                            onChange={(e) => setCraftingGoal(e.target.value)}
                            placeholder="e.g., Healing Poultice, Sharp Dagger"
                            className="col-span-3"
                            disabled={isCraftingLoading}
                        />
                    </div>
                    {/* Ingredient Selection */}
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right col-span-1 mt-2">
                            Ingredients
                        </Label>
                        <div className="col-span-3">
                            <ScrollArea className="h-40 border rounded-md p-2 bg-muted/30">
                                {inventory.length > 0 ? (
                                    <div className="space-y-1">
                                        {inventory.map((item, index) => {
                                            const ingredientId = `ingredient-${index}-${item.name.replace(/\s+/g, '-')}`;
                                            const isSelected = selectedIngredients.includes(item.name);
                                            return (
                                                <div key={ingredientId} className={cn(
                                                    "flex items-center gap-2 p-1 rounded transition-colors",
                                                    isSelected ? "bg-accent/20" : "hover:bg-muted"
                                                )}>
                                                    <button
                                                        type="button"
                                                        role="checkbox"
                                                        aria-checked={isSelected}
                                                        data-state={isSelected ? 'checked' : 'unchecked'}
                                                        onClick={() => !isCraftingLoading && handleIngredientToggle(item.name)}
                                                        className={cn(
                                                            "flex items-center justify-center w-4 h-4 rounded-sm border border-primary text-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                                            isSelected ? 'bg-primary text-primary-foreground' : 'bg-background',
                                                            isCraftingLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                                        )}
                                                        disabled={isCraftingLoading}
                                                        aria-label={`Select ${item.name}`}
                                                    >
                                                        {isSelected ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3 opacity-30" />}
                                                    </button>
                                                    <Label
                                                        htmlFor={ingredientId}
                                                        className={cn(
                                                            `text-sm flex-1 cursor-pointer`,
                                                            getQualityColor(item.quality),
                                                            isSelected && "font-medium"
                                                        )}
                                                        onClick={() => !isCraftingLoading && handleIngredientToggle(item.name)}
                                                    >
                                                        {item.name} {item.quality && item.quality !== "Common" ? `(${item.quality})` : ''}
                                                        {isSelected && <span className="ml-1 text-xs text-muted-foreground">(selected)</span>}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic text-center py-4">Inventory is empty. Cannot craft.</p>
                                )}
                            </ScrollArea>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-muted-foreground">
                                    {selectedIngredients.length > 0 
                                        ? `Selected ${selectedIngredients.length} ingredient(s)` 
                                        : "Select the items you want to use."}
                                </p>
                                {selectedIngredients.length > 0 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => setSelectedIngredients([])}
                                        disabled={isCraftingLoading}
                                    >
                                        Clear selection
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Material Feedback Section */}
                    {craftingGoal.trim() && guessedMaterials.length > 0 && (
                        <div className="col-span-4 p-3 bg-muted/30 rounded-md border border-dashed">
                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                Suggested Materials for &quot;{craftingGoal}&quot;:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {guessedMaterials.map((material) => {
                                    // Find items in inventory that match this material category
                                    const matchingItems = inventory.filter(item => {
                                        const categoryKeywords = MATERIAL_CATEGORIES[material as keyof typeof MATERIAL_CATEGORIES] || [];
                                        return categoryKeywords.some(keyword => 
                                            item.name.toLowerCase().includes(keyword)
                                        );
                                    });
                                    const hasMaterial = matchingItems.length > 0;
                                    
                                    return (
                                        <div
                                            key={material}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                                                hasMaterial 
                                                    ? 'bg-green-500/10 text-green-600 border border-green-500/30' 
                                                    : 'bg-red-500/10 text-red-600 border border-red-500/30'
                                            }`}
                                            title={hasMaterial 
                                                ? `Found: ${matchingItems.map(i => i.name).join(', ')}` 
                                                : `No ${material.toLowerCase()} items in inventory`
                                            }
                                        >
                                            {hasMaterial ? (
                                                <CheckCircle className="w-3 h-3" />
                                            ) : (
                                                <XCircle className="w-3 h-3" />
                                            )}
                                            <span>{material}</span>
                                            {hasMaterial && (
                                                <span className="text-[10px] opacity-70">
                                                    ({matchingItems.length})
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {guessedMaterials.some(material => {
                                const matchingItems = inventory.filter(item => {
                                    const categoryKeywords = MATERIAL_CATEGORIES[material as keyof typeof MATERIAL_CATEGORIES] || [];
                                    return categoryKeywords.some(keyword => 
                                        item.name.toLowerCase().includes(keyword)
                                    );
                                });
                                return matchingItems.length === 0;
                            }) && (
                                <p className="text-xs text-red-600 mt-2">
                                    ⚠️ Some suggested materials are missing from your inventory.
                                </p>
                            )}
                        </div>
                    )}
                    {craftingError && (
                        <Alert variant="destructive" className="col-span-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-1">
                                    <p className="font-medium">Crafting Failed</p>
                                    <p className="text-sm">{craftingError}</p>
                                    {craftingError?.includes('materials') || craftingError?.includes('ingredients') ? (
                                        <p className="text-xs mt-1">Tip: Try selecting different ingredients or check if you have the required materials.</p>
                                    ) : null}
                                </div>
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isCraftingLoading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={handleCraftClick} disabled={isCraftingLoading || !craftingGoal.trim() || selectedIngredients.length === 0}>
                        {isCraftingLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Attempt Craft
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}