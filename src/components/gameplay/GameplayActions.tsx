// src/components/gameplay/GameplayActions.tsx
"use client";

import React from "react";
import { Button } from "../ui/button";
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
import { Save, ArrowLeft, Skull, Settings, RefreshCw } from "lucide-react";

interface GameplayActionsProps {
    onSave: () => void;
    onAbandon: () => void;
    onEnd: () => void;
    onSettings: () => void;
    onChangeClass: () => void; // new prop
    disabled: boolean;
    isMobile: boolean;
    currentAdventureId: string | null;
}

export function GameplayActions({
    onSave,
    onAbandon,
    onEnd,
    onSettings,
    onChangeClass,
    disabled,
    isMobile,
    currentAdventureId
}: GameplayActionsProps) {
    return (
        <div className={`flex-none flex flex-wrap gap-2 mt-4 ${isMobile ? 'justify-center' : 'md:justify-start'}`}>
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
            <Button variant="destructive" size="sm" onClick={onEnd} disabled={disabled}>
                <Skull className="mr-1 h-4 w-4" /> End Adventure
            </Button>
            <Button variant="outline" size="sm" onClick={onChangeClass} disabled={disabled}>
                <RefreshCw className="mr-1 h-4 w-4" /> Change Class
            </Button>
            {!isMobile && (
                <Button variant="ghost" size="sm" onClick={onSettings}>
                    <Settings className="w-4 h-4 mr-1.5" /> Settings
                </Button>
            )}
        </div>
    );
}