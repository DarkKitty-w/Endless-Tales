// src/components/screens/ResetDataDialog.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Loader2, ShieldAlert } from "lucide-react";
import { resetAllLocalData } from "../../lib/data-reset";

interface ResetDataDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResetDataDialog = React.memo(function ResetDataDialog({ isOpen, onOpenChange }: ResetDataDialogProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirmReset = () => {
    setIsResetting(true);
    try {
      const result = resetAllLocalData();
      if (result.failedKeys.length > 0) {
        window.location.reload();
        return;
      }
      // Full reload guarantees every consumer re-reads a clean storage state.
      window.location.href = "/";
    } finally {
      setIsResetting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShieldAlert className="w-5 h-5 text-destructive" /> Reset All Data
            </DialogTitle>
            <DialogDescription>
              Permanently remove everything Endless Tales stores in this browser.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>This action deletes:</p>
            <ul className="list-disc space-y-1 pl-4">
              <li>All saved adventures</li>
              <li>Theme and display settings</li>
              <li>Saved AI provider keys and model preferences</li>
            </ul>
            <p>
              Back up your adventures first via JSON export on the Saved Adventures
              screen — this cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
              Reset All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This wipes all saved adventures, settings, and stored API keys from this
              browser. Exported backup files are not affected. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>Keep My Data</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isResetting}
              onClick={(event) => {
                event.preventDefault();
                handleConfirmReset();
              }}
            >
              {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Yes, Delete Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});