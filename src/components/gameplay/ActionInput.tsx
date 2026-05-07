// src/components/gameplay/ActionInput.tsx
"use client";

import React, { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { Send, Sparkles, Hammer, Loader2 } from "lucide-react";
import { sanitizePlayerAction } from "../../lib/utils";

export interface ActionInputRef {
  setValue: (value: string) => void;
}

interface ActionInputProps {
  onSubmit: (input: string) => void;
  onSuggest: () => void;
  onCraft: () => void;
  disabled: boolean;
  isWaitingForHost?: boolean;
}

const QUICK_ACTIONS = [
  { label: "Look", action: "Look around", icon: "👀" },
  { label: "Inventory", action: "Check inventory", icon: "🎒" },
  { label: "Rest", action: "Rest", icon: "😴" },
  { label: "Status", action: "Check my status", icon: "📊" },
  { label: "Map", action: "Check map", icon: "🗺️" },
  { label: "Skills", action: "Check skills", icon: "⚡" },
];

const ActionInputInternal = forwardRef<ActionInputRef, ActionInputProps>(
  ({ onSubmit, onSuggest, onCraft, disabled, isWaitingForHost = false }, ref) => {
    const [playerInput, setPlayerInput] = useState("");
    const submittingRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useImperativeHandle(ref, () => ({
      setValue: (value: string) => {
        setPlayerInput(value);
      },
    }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedInput = playerInput.trim();
      
      if (trimmedInput && !disabled && !submittingRef.current) {
        const sanitized = sanitizePlayerAction(trimmedInput);
        if (sanitized) {
          // Set submission lock
          submittingRef.current = true;
          
          // Clear any existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          // Release lock after 500ms
          timeoutRef.current = setTimeout(() => {
            submittingRef.current = false;
            timeoutRef.current = null;
          }, 500);
          
          onSubmit(sanitized);
        }
        setPlayerInput("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Escape to clear input
      if (e.key === 'Escape') {
        e.preventDefault();
        setPlayerInput("");
      }
      // Ctrl/Cmd + Enter to submit (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit(e as unknown as React.FormEvent);
      }
      // Ctrl+Space to suggest action
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        if (!disabled) {
          onSuggest();
        }
      }
      // Ctrl+H to open crafting
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        if (!disabled) {
          onCraft();
        }
      }
    };

    // Cleanup timeout on unmount
    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const isSubmitDisabled = disabled || !playerInput.trim() || submittingRef.current;

    return (
      <div className="flex-none">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Input
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            onKeyDown={handleKeyDown}
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
                disabled={isSubmitDisabled}
              >
                {isWaitingForHost && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p>Send Action</p>
                <p className="text-xs opacity-70">Enter</p>
              </div>
            </TooltipContent>
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
            <TooltipContent>
              <div className="text-center">
                <p>Suggest Action</p>
                <p className="text-xs opacity-70">Ctrl+Space</p>
              </div>
            </TooltipContent>
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
            <TooltipContent>
              <div className="text-center">
                <p>Open Crafting</p>
                <p className="text-xs opacity-70">Ctrl+H</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </form>
        
        {/* Quick Action Buttons */}
        <div className="flex gap-1.5 mt-2 flex-wrap" role="group" aria-label="Quick actions">
          {QUICK_ACTIONS.map((quick) => (
            <Tooltip key={quick.label}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => {
                    if (!disabled) {
                      onSubmit(quick.action);
                    }
                  }}
                  disabled={disabled}
                  aria-label={quick.action}
                >
                  <span className="mr-1" role="img" aria-hidden="true">{quick.icon}</span>
                  {quick.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{quick.action}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  }
);

ActionInputInternal.displayName = "ActionInput";

export const ActionInput = React.memo(ActionInputInternal);