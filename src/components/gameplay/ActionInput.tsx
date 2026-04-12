// src/components/gameplay/ActionInput.tsx
"use client";

import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { Send, Sparkles, Hammer } from "lucide-react";
import { sanitizePlayerAction } from "../../lib/utils";

export interface ActionInputRef {
  setValue: (value: string) => void;
}

interface ActionInputProps {
  onSubmit: (input: string) => void;
  onSuggest: () => void;
  onCraft: () => void;
  disabled: boolean;
}

export const ActionInput = forwardRef<ActionInputRef, ActionInputProps>(
  ({ onSubmit, onSuggest, onCraft, disabled }, ref) => {
    const [playerInput, setPlayerInput] = useState("");

    useImperativeHandle(ref, () => ({
      setValue: (value: string) => {
        setPlayerInput(value);
      },
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedInput = playerInput.trim();
      if (trimmedInput && !disabled) {
        const sanitized = sanitizePlayerAction(trimmedInput);
        if (sanitized) {
          onSubmit(sanitized);
        }
        setPlayerInput("");
      }
    };

    return (
      <div className="flex-none">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Input
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            placeholder="What do you do? (e.g., look around, use sword, talk to guard)"
            className="flex-1 text-sm h-10"
            aria-label="Enter your action or command"
            disabled={disabled}
            maxLength={500}
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 px-4"
                aria-label="Send action to narrator"
                disabled={disabled || !playerInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send Action</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={onSuggest}
                aria-label="Suggest Action"
                className="h-10 w-10"
                disabled={disabled}
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Suggest Action</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={onCraft}
                aria-label="Open Crafting"
                className="h-10 w-10"
                disabled={disabled}
              >
                <Hammer className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Crafting</TooltipContent>
          </Tooltip>
        </form>
      </div>
    );
  }
);

ActionInput.displayName = "ActionInput";