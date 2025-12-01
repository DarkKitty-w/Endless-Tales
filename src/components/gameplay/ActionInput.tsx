
// src/components/gameplay/ActionInput.tsx
"use client";

import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { Send, Sparkles, Hammer } from "lucide-react"; // Added Hammer

interface ActionInputProps {
    onSubmit: (input: string) => void;
    onSuggest: () => void;
    onCraft: () => void;
    disabled: boolean;
}

export function ActionInput({ onSubmit, onSuggest, onCraft, disabled }: ActionInputProps) {
    const [playerInput, setPlayerInput] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = playerInput.trim();
        if (trimmedInput && !disabled) {
            onSubmit(trimmedInput);
            setPlayerInput(""); // Clear input after submission
        }
    };

    return (
        <div className="flex-none"> {/* Prevent input area from shrinking */}
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                <Input
                    type="text"
                    value={playerInput}
                    onChange={(e) => setPlayerInput(e.target.value)}
                    placeholder="What do you do? (e.g., look around, use sword, talk to guard)"
                    className="flex-1 text-sm h-10"
                    aria-label="Enter your action or command"
                    disabled={disabled}
                />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground h-10 px-4" aria-label="Send action to narrator" disabled={disabled || !playerInput.trim()}>
                            <Send className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Send Action</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" type="button" onClick={onSuggest} aria-label="Suggest Action" className="h-10 w-10" disabled={disabled}>
                            <Sparkles className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Suggest Action</p></TooltipContent>
                </Tooltip>
                {/* Crafting Button */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" type="button" onClick={onCraft} aria-label="Open Crafting" className="h-10 w-10" disabled={disabled}>
                            <Hammer className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Open Crafting</p></TooltipContent>
                </Tooltip>
            </form>
        </div>
    );
}
