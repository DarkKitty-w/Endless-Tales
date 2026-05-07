// src/components/gameplay/GameplayActions.tsx
"use client";

import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Save, ArrowLeft, Skull, Settings, RefreshCw, Sparkles } from "lucide-react";
import type { ProviderType } from "../../ai/ai-router";

interface GameplayActionsProps {
    onSave: () => void;
    onAbandon: () => void;
    onEnd: () => void;
    onSettings: () => void;
    onChangeClass: () => void;
    disabled: boolean;
    isMobile: boolean;
    currentAdventureId: string | null;
    aiProvider: ProviderType;
}

const PROVIDER_LABELS: Record<ProviderType, string> = {
    gemini: "Gemini",
    openai: "OpenAI",
    claude: "Claude",
    deepseek: "DeepSeek",
    openrouter: "OpenRouter",
    webllm: "Local AI",
};

export function GameplayActions({
    onSave,
    onAbandon,
    onEnd,
    onSettings,
    onChangeClass,
    disabled,
    isMobile,
    currentAdventureId,
    aiProvider,
}: GameplayActionsProps) {
    return (
        <div className={`flex-none flex flex-wrap gap-2 mt-4 items-center ${isMobile ? 'justify-center' : 'md:justify-start'}`}>
            <Button variant="secondary" size="sm" onClick={onSave} disabled={disabled || !currentAdventureId}>
                <Save className="mr-1 h-4 w-4" /> Save Game
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={disabled}>
                        <ArrowLeft className="mr-1 h-4 w-4" /> Abandon
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Abandoning the adventure will end your current progress (unsaved changes lost) and return you to the main menu.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onAbandon} className="bg-destructive hover:bg-destructive/90">
                            Abandon
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={disabled}>
                        <Skull className="mr-1 h-4 w-4" /> End Adventure
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>End Adventure Permanently?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will <span className="font-semibold">permanently end</span> the adventure. 
                            Unlike "Abandon" which returns you to the main menu, this action completes the adventure 
                            and you will not be able to continue this playthrough. Make sure you have saved your progress.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onEnd} className="bg-destructive hover:bg-destructive/90">
                            End Adventure
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" size="sm" onClick={onChangeClass} disabled={disabled}>
                <RefreshCw className="mr-1 h-4 w-4" /> Change Class
            </Button>
            
            {/* AI Provider Indicator */}
            <Badge variant="outline" className="ml-0 sm:ml-2 gap-1 text-xs font-normal border-primary/30 bg-primary/5">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="capitalize">{PROVIDER_LABELS[aiProvider] || aiProvider}</span>
            </Badge>

            {!isMobile && (
                <Button variant="ghost" size="sm" onClick={onSettings}>
                    <Settings className="w-4 h-4 mr-1.5" /> Settings
                </Button>
            )}
        </div>
    );
}