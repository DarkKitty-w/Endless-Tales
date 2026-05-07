// src/components/gameplay/TradeDialog.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { ScrollArea } from '../../components/ui/scroll-area';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Loader2, Handshake, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import type { InventoryItem } from '../../types/inventory-types';
import { getQualityColor, cn } from "../../lib/utils";
import { logger } from "../../lib/logger";

interface TradeDialogProps {
    isOpen: boolean;
    onClose: () => void;
    /** The current player's peer ID */
    currentPlayerId: string;
    /** The target player's peer ID */
    targetPlayerId: string;
    /** The target player's name (for display) */
    targetPlayerName: string;
    /** The current player's inventory */
    inventory: InventoryItem[];
    /** Callback when trade is completed */
    onTradeComplete: (fromPeerId: string, toPeerId: string, items: string[]) => void;
}

export function TradeDialog({ 
    isOpen, 
    onClose,
    currentPlayerId,
    targetPlayerId,
    targetPlayerName,
    inventory,
    onTradeComplete 
}: TradeDialogProps) {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleItemToggle = useCallback((itemName: string) => {
        if (isProcessing) return;
        setSelectedItems(prev =>
            prev.includes(itemName)
                ? prev.filter(name => name !== itemName)
                : [...prev, itemName]
        );
        setError(null);
    }, [isProcessing]);

    const handleTradeClick = () => {
        if (selectedItems.length === 0) {
            setError("Please select at least one item to trade.");
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            // Trade from current player to target player
            onTradeComplete(currentPlayerId, targetPlayerId, selectedItems);
            
            // Close dialog after processing
            onClose();
        } catch (error) {
            logger.error("TradeDialog: Error during trade", error instanceof Error ? error.message : String(error));
            setError("An unexpected error occurred during the trade.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Reset local state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedItems([]);
            setError(null);
            setIsProcessing(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Handshake className="w-5 h-5" />
                        Trade with {targetPlayerName}
                    </DialogTitle>
                    <DialogDescription>
                        Select items from your inventory to trade with {targetPlayerName}.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 min-h-[300px]">
                    <h4 className="text-sm font-medium mb-2">Your Items to Trade</h4>
                    <ScrollArea className="h-[250px] border rounded-md p-2 bg-muted/30">
                        {inventory.length > 0 ? (
                            <div className="space-y-1">
                                {inventory.map((item, index) => {
                                    const itemId = `trade-item-${index}-${item.name.replace(/\s+/g, '-')}`;
                                    const isSelected = selectedItems.includes(item.name);
                                    return (
                                        <div key={itemId} className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                role="checkbox"
                                                aria-checked={isSelected}
                                                data-state={isSelected ? 'checked' : 'unchecked'}
                                                onClick={() => handleItemToggle(item.name)}
                                                className={cn(
                                                    "flex items-center justify-center w-4 h-4 rounded-sm border border-primary text-primary ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
                                                    isProcessing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                                )}
                                                disabled={isProcessing}
                                                aria-label={`Select ${item.name} for trade`}
                                            >
                                                {isSelected && <CheckCircle className="w-3 h-3" />}
                                            </button>
                                            <span
                                                className={`text-sm flex-1 cursor-pointer ${getQualityColor(item.quality)}`}
                                                onClick={() => handleItemToggle(item.name)}
                                            >
                                                {item.name} {item.quality && item.quality !== "Common" ? `(${item.quality})` : ''}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic text-center py-4">Your inventory is empty.</p>
                        )}
                    </ScrollArea>
                    {selectedItems.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-2">
                            {selectedItems.length} item(s) selected to trade
                        </div>
                    )}
                </div>

                {/* Trade Summary */}
                {selectedItems.length > 0 && (
                    <div className="bg-muted/50 p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Trade Summary</h4>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-blue-600">
                                {currentPlayerId} → {targetPlayerName}
                            </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Giving: {selectedItems.join(', ')}
                        </div>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" disabled={isProcessing} onClick={onClose}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button 
                        type="button" 
                        onClick={handleTradeClick} 
                        disabled={isProcessing || selectedItems.length === 0}
                    >
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Handshake className="mr-2 h-4 w-4" />
                        Complete Trade
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
