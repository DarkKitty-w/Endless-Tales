// src/components/gameplay/NarrationDisplay.tsx
"use client";

import React, { useRef, useEffect, useCallback } from "react";
import type { StoryLogEntry } from "@/types/adventure-types";
import type { NarrateAdventureOutput } from "@/ai/flows/narrate-adventure";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "@/components/game/CardboardCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookCopy, CalendarClock, Loader2, Dices, Info, GitBranch, Hammer, Save } from "lucide-react"; // Added Hammer, Save

interface NarrationDisplayProps {
    storyLog: StoryLogEntry[];
    isLoading: boolean;
    isAssessingDifficulty: boolean;
    isRollingDice: boolean;
    isGeneratingSkillTree: boolean;
    isGeneratingInventoryImages?: boolean; // Optional, depending on implementation
    isEnding: boolean;
    isSaving: boolean;
    isCraftingLoading: boolean;
    diceResult: number | null;
    diceType: string;
    error: string | null;
    branchingChoices: NarrateAdventureOutput['branchingChoices'];
    handlePlayerAction: (action: string) => void;
    isInitialLoading: boolean;
}

export function NarrationDisplay({
    storyLog,
    isLoading,
    isAssessingDifficulty,
    isRollingDice,
    isGeneratingSkillTree,
    isGeneratingInventoryImages,
    isEnding,
    isSaving,
    isCraftingLoading,
    diceResult,
    diceType,
    error,
    branchingChoices,
    handlePlayerAction,
    isInitialLoading
}: NarrationDisplayProps) {
    const scrollEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
          scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        }, 100);
     }, []);

     // Scroll to bottom effect
     useEffect(() => {
         scrollToBottom();
     }, [storyLog, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, diceResult, error, branchingChoices, scrollToBottom, isCraftingLoading, isGeneratingInventoryImages]);


    // Helper function to render dynamic content at the end of the scroll area
    const renderDynamicContent = () => {
        const busy = isLoading || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isEnding || isSaving || isCraftingLoading || isGeneratingInventoryImages;

        // Display skeleton loaders during initial narration generation
        if (isInitialLoading && !storyLog.length) {
            return (
                <div className="space-y-4 py-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
            );
        }

        // Consolidated Loading Indicator
        if (busy && !isInitialLoading) {
            let loadingText = "Thinking...";
            let LoadingIcon = Loader2;
            let iconAnimation = "animate-spin";
            if (isGeneratingSkillTree) loadingText = "Generating skill tree...";
            else if (isSaving) { loadingText = "Saving progress..."; LoadingIcon = Save; iconAnimation="animate-pulse"; }
            else if (isEnding) { loadingText = "Ending and summarizing..."; LoadingIcon = BookCopy; iconAnimation="animate-pulse"; }
            else if (isAssessingDifficulty) loadingText = "Assessing difficulty...";
            else if (isRollingDice) { loadingText = `Rolling ${diceType}...`; LoadingIcon = Dices; iconAnimation="animate-spin"; }
            else if (isCraftingLoading) { loadingText = "Crafting..."; LoadingIcon = Hammer; iconAnimation="animate-spin"; }
            // Add condition for image generation if needed
            // else if (isGeneratingInventoryImages) { loadingText = "Generating item images..."; LoadingIcon = Image; iconAnimation="animate-pulse"; }

            return (
                <div className="flex items-center justify-center py-4 text-muted-foreground animate-pulse">
                    <LoadingIcon className={`h-5 w-5 mr-2 ${iconAnimation}`} />
                    <span>{loadingText}</span>
                </div>
            );
        }

        // Dice Result (flashy animation)
        if (diceResult !== null && diceType !== "None") {
            return (
                <div key={`dice-${Date.now()}`} className="flex items-center justify-center py-2 text-accent font-semibold italic animate-fade-in-out">
                    <Dices className="h-5 w-5 mr-2" /> Rolled {diceResult} on {diceType}!
                </div>
            );
        }

        // Error Display
        if (error) {
            return (
                <Alert variant="destructive" className="my-2">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }

        // Display branching choices
        if (!busy && branchingChoices && branchingChoices.length > 0 && storyLog.length > 0) { // Only show after first log entry
            return (
                <div className="py-2 mt-2 space-y-2 border-t border-dashed border-foreground/10 pt-3">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5"><GitBranch className="w-4 h-4"/> Choose your path...</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {branchingChoices.map((choice, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-left justify-start h-auto py-1.5"
                                onClick={() => {
                                    // setPlayerInput(choice.text); // Optional: prefill input - handled in parent
                                    handlePlayerAction(choice.text);
                                }}
                                disabled={busy}
                            >
                                <div className="flex flex-col items-start w-full">
                                    <span className="font-medium text-foreground">{choice.text}</span>
                                    {choice.consequenceHint && <p className="text-xs text-muted-foreground whitespace-normal">{choice.consequenceHint}</p>}
                                </div>
                            </Button>
                        ))}
                    </div>
                </div>
            );
        }

        // Default idle state (no specific loading or choices)
        if (!busy && storyLog.length > 0) {
            return <p className="py-2 text-muted-foreground italic text-center text-xs">What will you do next?</p>;
        }

        // Initial state before first narration
        if (storyLog.length === 0 && !isInitialLoading && !busy) {
            return <p className="py-2 text-muted-foreground italic">Initializing your adventure...</p>;
        }

        return null; // Should not happen often
    };

    return (
        <CardboardCard className="flex-1 flex flex-col overflow-hidden mb-4 border-2 border-foreground/20 shadow-inner min-h-0">
            <CardHeader className="flex-none border-b border-foreground/10 py-3 px-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BookCopy className="w-4 h-4" /> Story Log
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-2 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                <ScrollArea className="h-full pr-3"> {/* Use full height */}
                    {storyLog.length > 0 ? (
                        storyLog.map((log, index) => (
                            <div key={`log-${index}`} className="mb-3 pb-3 border-b border-border/50 last:border-b-0">
                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <CalendarClock className="w-3 h-3" /> Turn {index + 1}
                                    <span className="ml-auto text-xs">({new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                                </p>
                                <p className="text-sm whitespace-pre-wrap mt-1 leading-relaxed">{log.narration}</p>
                            </div>
                        ))
                    ) : (
                        isInitialLoading ? <Skeleton className="h-12 w-full mt-2" /> : (
                            <p className="text-sm text-muted-foreground italic mt-4">Your adventure begins now. Type your first action below.</p>
                        )
                    )}
                    {renderDynamicContent()} {/* Render loading, dice, errors, or choices here */}
                    <div ref={scrollEndRef} />
                </ScrollArea>
            </CardContent>
        </CardboardCard>
    );
}
