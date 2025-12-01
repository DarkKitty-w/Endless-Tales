
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
import { Loader2, Hammer, CheckCircle, Square } from 'lucide-react';
import type { InventoryItem } from '../../types/inventory-types';
import { getQualityColor, cn } from "../../lib/utils";

interface CraftingDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    inventory: InventoryItem[];
    onCraft: (goal: string, ingredients: string[]) => Promise<void>; // Make async
}

export function CraftingDialog({ isOpen, onOpenChange, inventory, onCraft }: CraftingDialogProps) {
    const [craftingGoal, setCraftingGoal] = useState("");
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [isCraftingLoading, setIsCraftingLoading] = useState(false);
    const [craftingError, setCraftingError] = useState<string | null>(null);

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
            // Success/Error toasts and state resets are handled in the parent component's onCraft callback
        } catch (error) {
            // Error handling/toast is likely done in parent, but can add fallback here
            console.error("CraftingDialog: Error during craft attempt", error);
            setCraftingError("An unexpected error occurred during crafting.");
        } finally {
            setIsCraftingLoading(false);
            // Don't reset state here, parent might need it for toast/log
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
                                        {inventory.map((item) => (
                                            <div key={item.name} className="flex items-center gap-2">
                                                <button
                                                     type="button"
                                                     role="checkbox"
                                                     aria-checked={selectedIngredients.includes(item.name)}
                                                     data-state={selectedIngredients.includes(item.name) ? 'checked' : 'unchecked'}
                                                     onClick={() => !isCraftingLoading && handleIngredientToggle(item.name)}
                                                     className={cn(
                                                         "flex items-center justify-center w-4 h-4 rounded-sm border border-primary text-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                                                         isCraftingLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                                     )}
                                                     disabled={isCraftingLoading}
                                                     aria-label={`Select ${item.name}`}
                                                >
                                                      {selectedIngredients.includes(item.name) && <CheckCircle className="w-3 h-3"/>}
                                                 </button>
                                                <Label
                                                    htmlFor={`ingredient-${item.name}-${Math.random()}`} // Ensure unique ID
                                                    className={`text-sm flex-1 cursor-pointer ${getQualityColor(item.quality)}`}
                                                    onClick={() => !isCraftingLoading && handleIngredientToggle(item.name)}
                                                >
                                                    {item.name} {item.quality && item.quality !== "Common" ? `(${item.quality})` : ''}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic text-center py-4">Inventory is empty.</p>
                                )}
                            </ScrollArea>
                            <p className="text-xs text-muted-foreground mt-1">Select the items you want to use.</p>
                        </div>
                    </div>
                    {craftingError && (
                        <Alert variant="destructive" className="col-span-4">
                            <AlertDescription>{craftingError}</AlertDescription>
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
