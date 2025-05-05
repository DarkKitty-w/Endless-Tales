// src/components/gameplay/GameplayActions.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Save, ArrowLeft, Skull, Settings } from "lucide-react";

interface GameplayActionsProps {
    onSave: () => void;
    onAbandon: () => void;
    onEnd: () => void;
    onSettings: () => void;
    disabled: boolean;
    isMobile: boolean; // To conditionally render settings button location
    currentAdventureId: string | null;
}

export function GameplayActions({
    onSave,
    onAbandon,
    onEnd,
    onSettings,
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
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>Abandoning the adventure will end your current progress (unsaved changes lost) and return you to the main menu.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onAbandon} className="bg-destructive hover:bg-destructive/90">Abandon</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button variant="destructive" size="sm" onClick={onEnd} disabled={disabled}>
                <Skull className="mr-1 h-4 w-4" /> End Adventure
            </Button>
            {/* Desktop Settings Button */}
            {!isMobile && (
                <Sheet>
                     <SheetTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={onSettings}>
                            <Settings className="w-4 h-4 mr-1.5" /> Settings
                        </Button>
                    </SheetTrigger>
                    {/* Settings Panel content is rendered via the parent component */}
                </Sheet>
             )}
        </div>
    );
}
