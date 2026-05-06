"use client";

import React, { useState } from "react";
import type { InteractionRequest, PendingInteraction } from "../../types/multiplayer-types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Gift, Swords, MessageSquare, X, ArrowRight, ArrowLeft } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";

interface InteractionDialogProps {
  isOpen: boolean;
  interaction: InteractionRequest | PendingInteraction | null;
  isTarget: boolean; // true if current player is the target of the interaction
  inventory?: any[]; // Current player's inventory for trade selection
  onAccept?: (selectedItems?: string[]) => void;
  onDecline?: () => void;
  onClose?: () => void;
}

export function InteractionDialog({ 
  isOpen, 
  interaction, 
  isTarget, 
  inventory = [],
  onAccept, 
  onDecline, 
  onClose 
}: InteractionDialogProps) {
  const [isResponding, setIsResponding] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [tradeStep, setTradeStep] = useState<'confirm' | 'select'>('confirm');

  if (!isOpen || !interaction) return null;

  const getIcon = () => {
    switch (interaction.type) {
      case 'gift': return <Gift className="h-6 w-6 text-yellow-500" />;
      case 'trade': return <MessageSquare className="h-6 w-6 text-blue-500" />;
      case 'duel': return <Swords className="h-6 w-6 text-red-500" />;
      default: return <MessageSquare className="h-6 w-6 text-gray-500" />;
    }
  };

  const getTitle = () => {
    switch (interaction.type) {
      case 'gift': return 'Gift Offer';
      case 'trade': return 'Trade Request';
      case 'duel': return 'Duel Challenge';
      default: return 'Interaction Request';
    }
  };

  const getDescription = () => {
    if ('details' in interaction && interaction.details) {
      return interaction.details;
    }
    switch (interaction.type) {
      case 'gift': return 'Someone wants to give you a gift.';
      case 'trade': return 'Someone wants to trade with you.';
      case 'duel': return 'Someone challenges you to a duel!';
      default: return 'You have a new interaction request.';
    }
  };

  const toggleItemSelection = (itemName: string) => {
    setSelectedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(i => i !== itemName)
        : [...prev, itemName]
    );
  };

  const handleAccept = () => {
    if (interaction.type === 'trade' && isTarget && tradeStep === 'confirm') {
      // For trade, target needs to select items
      setTradeStep('select');
      return;
    }
    setIsResponding(true);
    onAccept?.(selectedItems);
    setTimeout(() => setIsResponding(false), 1000);
  };

  const handleDecline = () => {
    setIsResponding(true);
    onDecline?.();
    setTimeout(() => setIsResponding(false), 1000);
  };

  const handleTradeConfirm = () => {
    setIsResponding(true);
    onAccept?.(selectedItems);
    setTimeout(() => setIsResponding(false), 1000);
  };

  const handleBack = () => {
    setTradeStep('confirm');
    setSelectedItems([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center gap-3">
          {getIcon()}
          <div>
            <CardTitle>{getTitle()}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isTarget ? 'Incoming request' : 'Waiting for response...'}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{getDescription()}</p>
          {'initiatedBy' in interaction && (
            <p className="text-xs text-muted-foreground mt-2">
              Initiated by: {interaction.initiatedBy}
            </p>
          )}
          
          {!isTarget && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Waiting for the other player to respond...
              </p>
            </div>
          )}

          {/* Trade item selection */}
          {isTarget && interaction.type === 'trade' && tradeStep === 'select' && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Select items to trade:</h4>
              <ScrollArea className="h-48 w-full rounded-md border p-2">
                {inventory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items in inventory.</p>
                ) : (
                  inventory.map((item, index) => (
                    <div key={item.name ? `item-${item.name}-${index}` : `item-fallback-${index}`} className="flex items-center space-x-2 py-2">
                      <Checkbox 
                        id={`item-${item.name || index}`}
                        checked={selectedItems.includes(item.name)}
                        onCheckedChange={() => toggleItemSelection(item.name)}
                      />
                      <Label htmlFor={`item-${item.name || index}`} className="text-sm cursor-pointer">
                        {item.name} {item.quantity > 1 && `(${item.quantity})`}
                      </Label>
                    </div>
                  ))
                )}
              </ScrollArea>
              {selectedItems.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Selected: {selectedItems.join(', ')}
                </p>
              )}
            </div>
          )}
        </CardContent>
        {isTarget && (
          <CardFooter className="flex gap-2 justify-end">
            {tradeStep === 'select' ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={isResponding}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  onClick={handleTradeConfirm}
                  disabled={isResponding || selectedItems.length === 0}
                >
                  Confirm Trade
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleDecline}
                  disabled={isResponding}
                >
                  Decline
                </Button>
                <Button 
                  onClick={handleAccept}
                  disabled={isResponding}
                >
                  Accept
                </Button>
              </>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}