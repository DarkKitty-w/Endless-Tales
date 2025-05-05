// src/components/gameplay/ClassChangeDialog.tsx
"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Character } from '@/types/character-types';

interface ClassChangeDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    character: Character | null;
    pendingClassChange: string | null;
    onConfirm: (newClass: string) => void;
}

export function ClassChangeDialog({
    isOpen,
    onOpenChange,
    character,
    pendingClassChange,
    onConfirm
}: ClassChangeDialogProps) {

    if (!character || !pendingClassChange) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Class Change Suggestion</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your actions suggest you might be more suited to the **{pendingClassChange}** class.
                        Changing class will reset your current skill progression ({character.class} Stage {character.skillTreeStage})
                        and grant you the starting skills of a {pendingClassChange}. Do you wish to change?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => onOpenChange(false)}>Stay as {character.class}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onConfirm(pendingClassChange)}>Become a {pendingClassChange}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
