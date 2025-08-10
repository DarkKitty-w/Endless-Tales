
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
import { BookCopy, CalendarClock, Loader2, Dices, Info, GitBranch, Hammer, Save, ShieldAlert, RefreshCw } from "lucide-react"; // Added RefreshCw

interface NarrationDisplayProps {
    storyLog: StoryLogEntry[];
    isLoading: boolean; // General loading (AI narration)
    isAssessingDifficulty: boolean;
    isRollingDice: boolean;
    isGeneratingSkillTree: boolean;
    isEnding: boolean;
    isSaving: boolean;
    isCraftingLoading: boolean;
    diceResult: number | null;
    diceType: string;
    error: string | null;
    branchingChoices: NarrateAdventureOutput['branchingChoices'];
    handlePlayerAction: (action: string) => void;
    isInitialLoading: boolean; // Specifically for the first narration load
    onRetryNarration: () => void; // New prop for retry
}

export function NarrationDisplay({
    storyLog,
    isLoading,
    isAssessingDifficulty,
    isRollingDice,
    isGeneratingSkillTree,
    isEnding,
    isSaving,
    isCraftingLoading,
    diceResult,
    diceType,
    error,
    branchingChoices,
    handlePlayerAction,
    isInitialLoading,
    onRetryNarration, // New prop
}: NarrationDisplayProps) {
    const scrollEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            const scrollAreaElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollAreaElement) {
                scrollAreaElement.scrollTo({ top: scrollAreaElement.scrollHeight, behavior: 'smooth' });
            } else if (scrollEndRef.current) {
                 scrollEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        }, 150);
     }, []);

     useEffect(() => {
         scrollToBottom();
     }, [storyLog, isLoading, isEnding, isSaving, isAssessingDifficulty, isRollingDice, isGeneratingSkillTree, diceResult, error, branchingChoices, isCraftingLoading, isInitialLoading, scrollToBottom]);


    const renderDynamicContent = () => {
        const busy = isLoading || isAssessingDifficulty || isRollingDice || isGeneratingSkillTree || isEnding || isSaving || isCraftingLoading;
        const anyLoading = isInitialLoading || isLoading;

        if (diceResult !== null && diceType !== "None") {
            return (
                <div key={`dice-${Date.now()}`} className="flex items-center justify-center py-2 text-accent font-semibold italic animate-fade-in-out">
                    <Dices className="h-5 w-5 mr-2" /> Rolled {diceResult} on {diceType}!
                </div>
            );
        }

        if (error && !error.startsWith("Narrator:") && !error.startsWith("Game Master:")) { // Only show actual system errors
            return (
                <Alert variant="destructive" className="my-2">
                     <Info className="h-4 w-4" />
                     <AlertTitle>Error</AlertTitle>
                     <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }

        if (anyLoading && !isRollingDice) { // Show loading indicator if isInitialLoading or isLoading is true
            let loadingText = "Thinking...";
            let LoadingIcon = Loader2;
            let iconAnimation = "animate-spin";
            if (isInitialLoading && storyLog.length === 0) loadingText = "Loading your adventure's beginning...";
            else if (isGeneratingSkillTree) loadingText = "Generating skill tree...";
            else if (isSaving) { loadingText = "Saving progress..."; LoadingIcon = Save; iconAnimation="animate-pulse"; }
            else if (isEnding) { loadingText = "Ending and summarizing..."; LoadingIcon = BookCopy; iconAnimation="animate-pulse"; }
            else if (isAssessingDifficulty) loadingText = "Assessing difficulty...";
            else if (isCraftingLoading) { loadingText = "Crafting..."; LoadingIcon = Hammer; iconAnimation="animate-spin"; }
            
            return (
                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                    <div className="flex items-center animate-pulse">
                        <LoadingIcon className={`h-5 w-5 mr-2 ${iconAnimation}`} />
                        <span>{loadingText}</span>
                    </div>
                    {(isInitialLoading || isLoading) && !isAssessingDifficulty && !isSaving && !isEnding && !isGeneratingSkillTree && !isCraftingLoading && (
                        <Button variant="outline" size="sm" onClick={onRetryNarration} className="mt-3">
                            <RefreshCw className="mr-2 h-4 w-4" /> Retry AI
                        </Button>
                    )}
                </div>
            );
        }

        // Always render branching choices if available, even if busy with other minor things (not initial loading)
        if (Array.isArray(branchingChoices) && branchingChoices.length > 0) {
            return (
                <div className="py-2 mt-2 space-y-2 border-t border-dashed border-foreground/10 pt-3">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5"><GitBranch className="w-4 h-4"/> Choose your path...</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {branchingChoices.map((choice, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-left justify-start h-auto py-1.5 whitespace-normal"
                                onClick={() => handlePlayerAction(choice.text)}
                                disabled={busy} // Disable if any other loading state is true
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
        
        if (!isInitialLoading && !isLoading && storyLog.length === 0 && !error) {
            return <p className="py-4 text-muted-foreground italic text-center text-sm">The story awaits your first command. What will you do?</p>;
        }
        
        if (!busy && !error && storyLog.length > 0 && (!branchingChoices || branchingChoices.length === 0)) {
            return <p className="py-2 text-muted-foreground italic text-center text-xs">What will you do next?</p>;
        }

        return null;
    };

    return (
        <CardboardCard className="flex-1 flex flex-col overflow-hidden mb-4 border-2 border-foreground/20 shadow-inner min-h-0">
            <CardHeader className="flex-none border-b border-foreground/10 py-3 px-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BookCopy className="w-4 h-4" /> Story Log
                </CardTitle>
            </CardHeader>
            <ScrollArea ref={scrollAreaRef} className="flex-1 pb-2 scrollbar scrollbar-thumb-primary scrollbar-track-input">
                <CardContent className="px-4 pt-4"> 
                    {isInitialLoading && storyLog.length === 0 && !error ? ( // Show skeletons only if initial loading AND log is empty AND no error
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-center py-4 text-muted-foreground">
                                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                                <span>Loading your adventure's beginning...</span>
                            </div>
                             {(isInitialLoading || isLoading) && ( // Show retry button during initial loading as well
                                <div className="text-center">
                                    <Button variant="outline" size="sm" onClick={onRetryNarration} className="mt-2">
                                        <RefreshCw className="mr-2 h-4 w-4" /> Retry AI
                                    </Button>
                                </div>
                            )}
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                    ) : storyLog.length > 0 ? (
                        storyLog.map((log, index) => (
                            <div key={`log-${index}-${log.timestamp}`} className="mb-3 pb-3 border-b border-border/50 last:border-b-0">
                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <CalendarClock className="w-3 h-3" /> Turn {log.turnNumber || index + 1}
                                    <span className="ml-auto text-xs">({new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                                </p>
                                 {log.narration.startsWith("Narrator:") || log.narration.startsWith("Game Master:") ? (
                                     <Alert variant="default" className="mt-1.5 border-orange-500/50 bg-orange-50 dark:bg-orange-900/20 text-sm">
                                         <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                         <AlertDescription className="text-orange-700 dark:text-orange-300 whitespace-pre-wrap leading-relaxed">
                                             {log.narration}
                                         </AlertDescription>
                                     </Alert>
                                 ) : (
                                     <p className="text-sm whitespace-pre-wrap mt-1 leading-relaxed">{log.narration}</p>
                                 )}
                            </div>
                        ))
                    ) : null }
                    
                    {renderDynamicContent()}
                    <div ref={scrollEndRef} className="h-1" />
                 </CardContent>
            </ScrollArea>
        </CardboardCard>
    );
}
