// src/components/screens/HelpDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { CircleHelp, Keyboard } from "lucide-react";

interface HelpDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS: Array<{ keys: string; description: string }> = [
  { keys: "Ctrl/Cmd + S", description: "Save your adventure" },
  { keys: "Ctrl/Cmd + Enter", description: "Submit your action" },
  { keys: "Ctrl/Cmd + Space", description: "Suggest an action" },
  { keys: "Ctrl/Cmd + H", description: "Open crafting" },
  { keys: "Escape", description: "Close dialogs and panels" },
];

export const HelpDialog = React.memo(function HelpDialog({ isOpen, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CircleHelp className="w-5 h-5" /> How to Play
          </DialogTitle>
          <DialogDescription>
            Everything you need to start your first adventure.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow max-h-[60vh] pr-3">
          <div className="space-y-4 text-sm">
            <section className="space-y-1">
              <h3 className="font-semibold">1. Pick an AI provider</h3>
              <p className="text-muted-foreground leading-snug">
                Open <strong>Settings</strong> (gear icon) and choose an AI provider.
                Cloud providers are bring-your-own-key: paste your API key for the
                provider you select. WebLLM runs locally in your browser without a key
                but is experimental.
              </p>
            </section>
            <Separator />
            <section className="space-y-1">
              <h3 className="font-semibold">2. Start an adventure</h3>
              <p className="text-muted-foreground leading-snug">
                Use <strong>Start New Adventure</strong> to pick a mode:
                <strong> Randomized</strong> jumps straight into a rule-enforced RPG run,
                <strong> Custom</strong> lets you shape genre, tone, magic and tech,
                <strong> Immersed</strong> drops you into existing fictional universes,
                and <strong> Co-op</strong> hosts a private P2P session for friends via
                invite codes or QR codes.
              </p>
            </section>
            <Separator />
            <section className="space-y-1">
              <h3 className="font-semibold">3. Create your character</h3>
              <p className="text-muted-foreground leading-snug">
                Allocate STR/STA/WIS points, choose a class, and describe your hero.
                The AI generates a profile; skills unlock as you level up during play.
              </p>
            </section>
            <Separator />
            <section className="space-y-1">
              <h3 className="font-semibold">4. Play and progress</h3>
              <p className="text-muted-foreground leading-snug">
                Type any action — the narrator resolves it, assesses difficulty, and
                awards XP. Craft items, trade with party members, explore map
                locations, build NPC relationships, and earn faction reputation.
                Your adventures stay in this browser and can be backed up with JSON
                export/import from the Saved Adventures screen.
              </p>
            </section>
            <Separator />
            <section className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Keyboard className="w-4 h-4" /> Keyboard Shortcuts
              </h3>
              <ul className="space-y-1.5">
                {SHORTCUTS.map(({ keys, description }) => (
                  <li key={keys} className="flex items-center justify-between gap-2">
                    <span className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {keys}
                    </span>
                    <span className="text-muted-foreground text-right">{description}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
});