// src/components/gameplay/NarrationDisplay.tsx
"use client";

import React, { useRef, useEffect, useCallback, useMemo, memo } from "react";
import type { StoryLogEntry } from "../../types/adventure-types";
import type { NarrateAdventureOutput } from "../../ai/flows/narrate-adventure";
import { ScrollArea } from "../../components/ui/scroll-area";
import { CardboardCard, CardContent, CardHeader, CardTitle } from "../../components/game/CardboardCard";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { BookCopy, CalendarClock, Loader2, Dices, Info, GitBranch, Hammer, Save, ShieldAlert, RefreshCw } from "lucide-react";
import { sanitizeAIContent } from "../../lib/utils";

type LoadingPhase =
  | { type: 'idle' }
  | { type: 'initial-loading' }
  | { type: 'narrating' }
  | { type: 'assessing' }
  | { type: 'rolling-dice' }
  | { type: 'generating-skill-tree' }
  | { type: 'ending' }
  | { type: 'saving' }
  | { type: 'crafting' };

interface NarrationDisplayProps {
    storyLog: StoryLogEntry[];
    loadingPhase: LoadingPhase;
    diceResult: number | null;
    diceType: string;
    error: string | null;
    errorRawResponse?: string | null; // ERR-11: Raw AI response for debugging
    branchingChoices: NarrateAdventureOutput['branchingChoices'];
    onChoiceClick: (action: string) => void;
    isInitialLoading: boolean;
    onRetryNarration: () => void;
    isStreaming?: boolean;
    streamingText?: string;
    pendingGuestAction?: string | null;
    isConnected?: boolean;
    isMultiplayerHost?: boolean;
}

interface ChoiceButtonProps {
  choice: { text: string; consequenceHint?: string };
  onClick: (text: string) => void;
  busy: boolean;
}

const ChoiceButton = memo(function ChoiceButton({ choice, onClick, busy }: ChoiceButtonProps) {
  const handleClick = useCallback(() => {
    onClick(choice.text);
  }, [onClick, choice.text]);

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-left justify-start h-auto py-1.5 whitespace-normal"
      onClick={handleClick}
      disabled={busy}
    >
      <div className="flex flex-col items-start w-full">
        <span className="font-medium text-foreground">{choice.text}</span>
        {choice.consequenceHint && (
          <p className="text-xs text-muted-foreground whitespace-normal">{choice.consequenceHint}</p>
        )}
      </div>
    </Button>
  );
});

function NarrationDisplayInternal({
    storyLog,
    loadingPhase,
    diceResult,
    diceType,
    error,
    errorRawResponse, // ERR-11: Raw AI response for debugging
    branchingChoices,
    onChoiceClick,
    isInitialLoading,
    onRetryNarration,
    isStreaming = false,
    streamingText = '',
    pendingGuestAction = null,
    isConnected = false,
    isMultiplayerHost = false,
}: NarrationDisplayProps) {
    const scrollEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            const scrollAreaElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollAreaElement) {
                scrollAreaElement.scrollTo({ top: scrollAreaElement.scrollHeight, behavior: 'smooth' });
            } else if (scrollEndRef.current) {
                scrollEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
            }
        });
    }, []);

    // PERF-2 Fix: Throttle scrollToBottom during streaming to prevent excessive scroll operations
    const lastScrollTimeRef = useRef<number>(0);
    const throttledScrollToBottom = useCallback(() => {
        const now = Date.now();
        if (now - lastScrollTimeRef.current > 100) {  // Throttle to max 10 scrolls per second
            lastScrollTimeRef.current = now;
            scrollToBottom();
        }
    }, [scrollToBottom]);

    useEffect(() => {
        scrollToBottom();
    }, [storyLog, loadingPhase, diceResult, error, branchingChoices, isInitialLoading, isStreaming, scrollToBottom]);

    // Separate effect for streaming text with throttling
    useEffect(() => {
        if (isStreaming && streamingText) {
            throttledScrollToBottom();
        }
    }, [streamingText, isStreaming, throttledScrollToBottom]);

    // PERF-6 Fix: Memoize displayLog to prevent unnecessary array copies on every render
    const displayLog = useMemo(() => storyLog.slice(-50), [storyLog]);
    const busy = loadingPhase.type !== 'idle' || isStreaming;

    const renderDynamicContent = () => {
        if (diceResult !== null && diceType !== "None") {
            return (
                <div key={`dice-${diceResult}-${diceType}`} className="flex items-center justify-center py-2 text-accent font-semibold italic animate-fade-in-out">
                    <Dices className="h-5 w-5 mr-2" /> Rolled {diceResult} on {diceType}!
                </div>
            );
        }

        if (error && !error.startsWith("Narrator:") && !error.startsWith("Game Master:")) {
            return (
                <Alert variant="destructive" className="my-2">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {error}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onRetryNarration} 
                            className="mt-3 w-full"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" /> Retry AI
                        </Button>
                        {/* ERR-11: Show raw AI response in development mode */}
                        {errorRawResponse && process.env.NODE_ENV === 'development' && (
                            <details className="mt-3 text-xs bg-muted/50 p-2 rounded-md overflow-auto max-h-40">
                                <summary className="cursor-pointer font-medium mb-1">Raw AI Response (Dev Only)</summary>
                                <pre className="whitespace-pre-wrap text-destructive/80">{errorRawResponse}</pre>
                            </details>
                        )}
                    </AlertDescription>
                </Alert>
            );
        }

        if (isStreaming && streamingText) {
            return (
                <div className="py-2 text-sm whitespace-pre-wrap leading-relaxed border-l-2 border-primary/50 pl-3 italic">
                    {streamingText}
                    <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
                </div>
            );
        }

        if (busy && loadingPhase.type !== 'rolling-dice') {
            let loadingText = "Thinking...";
            let LoadingIcon = Loader2;
            let iconAnimation = "animate-spin";

            switch (loadingPhase.type) {
                case 'initial-loading':
                    loadingText = storyLog.length === 0 ? "Loading your adventure's beginning..." : "Thinking...";
                    break;
                case 'narrating':
                    loadingText = "Narrating...";
                    break;
                case 'assessing':
                    loadingText = "Assessing difficulty...";
                    break;
                case 'generating-skill-tree':
                    loadingText = "Generating skill tree...";
                    break;
                case 'ending':
                    loadingText = "Ending and summarizing...";
                    LoadingIcon = BookCopy;
                    iconAnimation = "animate-pulse";
                    break;
                case 'saving':
                    loadingText = "Saving progress...";
                    LoadingIcon = Save;
                    iconAnimation = "animate-pulse";
                    break;
                case 'crafting':
                    loadingText = "Crafting...";
                    LoadingIcon = Hammer;
                    break;
                default:
                    break;
            }

            return (
                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                    <div className="flex items-center animate-pulse">
                        <LoadingIcon className={`h-5 w-5 mr-2 ${iconAnimation}`} />
                        <span>{loadingText}</span>
                    </div>
                    {(isInitialLoading || loadingPhase.type === 'narrating') &&
                     loadingPhase.type !== 'assessing' &&
                     loadingPhase.type !== 'saving' &&
                     loadingPhase.type !== 'ending' &&
                     loadingPhase.type !== 'generating-skill-tree' &&
                     loadingPhase.type !== 'crafting' && (
                        <Button variant="outline" size="sm" onClick={onRetryNarration} className="mt-3">
                            <RefreshCw className="mr-2 h-4 w-4" /> Retry AI
                        </Button>
                    )}
                </div>
            );
        }

        if (Array.isArray(branchingChoices) && branchingChoices.length > 0) {
            return (
                <div className="py-2 mt-2 space-y-2 border-t border-dashed border-foreground/10 pt-3">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1.5">
                        <GitBranch className="w-4 h-4"/> Choose your path...
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {branchingChoices.map((choice, index) => (
                            <ChoiceButton 
                                key={`${choice.text}-${index}`}
                                choice={choice}
                                onClick={onChoiceClick}
                                busy={busy}
                            />
                        ))}
                    </div>
                </div>
            );
        }
        
        if (!isInitialLoading && !busy && storyLog.length === 0 && !error) {
            return <p className="py-4 text-muted-foreground italic text-center text-sm">The story awaits your first command. What will you do?</p>;
        }
        
        if (!busy && !error && storyLog.length > 0 && (!branchingChoices || branchingChoices.length === 0)) {
            return <p className="py-2 text-muted-foreground italic text-center text-xs">What will you do next?</p>;
        }
        
        return null;
    };

    // Show optimistic UI for pending guest action
    const renderPendingGuestAction = () => {
        if (!pendingGuestAction || !isConnected || isMultiplayerHost) return null;
        
        const displayAction = pendingGuestAction.length > 50 
            ? pendingGuestAction.substring(0, 50) + '...' 
            : pendingGuestAction;
        
        return (
            <div className="mb-3 pb-3 border-b border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="italic">Waiting for host to process: "{displayAction}"</span>
                </div>
            </div>
        );
    };

    return (
        <CardboardCard className="flex-1 flex flex-col overflow-hidden mb-4 border-2 border-foreground/20 shadow-inner min-h-0">
            <CardHeader className="flex-none border-b border-foreground/10 py-3 px-4">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BookCopy className="w-4 h-4" /> Story Log
                </CardTitle>
            </CardHeader>
            <ScrollArea 
              ref={scrollAreaRef} 
              className="flex-1 pb-2 scrollbar scrollbar-thumb-primary scrollbar-track-input"
              aria-live="polite"
              aria-atomic="false"
            >
                <CardContent className="px-4 pt-4"> 
                    {isInitialLoading && storyLog.length === 0 && !error ? (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-center py-4 text-muted-foreground">
                                <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                                <span>Loading your adventure's beginning...</span>
                            </div>
                            {(isInitialLoading || loadingPhase.type === 'narrating') && (
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
                    ) : displayLog.length > 0 ? (
                        displayLog.map((log, index) => (
                            <div key={`log-${log.timestamp}-${index}`} className="mb-3 pb-3 border-b border-border/50 last:border-b-0">
                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                    <CalendarClock className="w-3 h-3" /> Turn {log.turnNumber || (storyLog.length - displayLog.length + index + 1)}
                                    <span className="ml-auto text-xs">
                                        ({new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                    </span>
                                </p>
                                {log.narration.startsWith("Narrator:") || log.narration.startsWith("Game Master:") ? (
                                    <Alert variant="default" className="mt-1.5 border-orange-500/50 bg-orange-50 dark:bg-orange-900/20 text-sm">
                                        <ShieldAlert className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        <AlertDescription className="text-orange-700 dark:text-orange-300 whitespace-pre-wrap leading-relaxed">
                                            {sanitizeAIContent(log.narration)}
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <p className="text-sm whitespace-pre-wrap mt-1 leading-relaxed">{sanitizeAIContent(log.narration)}</p>
                                )}
                            </div>
                        ))
                    ) : null}
                    
                    {renderPendingGuestAction()}
                    {renderDynamicContent()}
                    <div ref={scrollEndRef} className="h-1" />
                </CardContent>
            </ScrollArea>
        </CardboardCard>
    );
}

export const NarrationDisplay = React.memo(NarrationDisplayInternal);