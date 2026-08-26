// src/components/screens/OnboardingDialog.tsx
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
import { Button } from "../ui/button";
import { Sparkles } from "lucide-react";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ONBOARDING_SEEN_KEY = "endlessTales_onboardingSeen";

/** True when this browser has not completed onboarding yet. Client-side only. */
export function hasCompletedOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_SEEN_KEY) === "true";
  } catch {
    return true;
  }
}

export const OnboardingDialog = React.memo(function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Endless Tales",
      description:
        "An AI-powered text adventure where your choices shape the story. Here is what you should know before your first quest.",
      body: (
        <ul className="list-disc space-y-1 pl-4 text-muted-foreground text-sm">
          <li>Play solo in Randomized, Custom or Immersed modes.</li>
          <li>Or team up with friends in private P2P Co-op sessions.</li>
          <li>Your saves stay local to this browser — no account needed.</li>
        </ul>
      ),
    },
    {
      title: "Bring Your Own Key",
      description:
        "Cloud AI providers (Gemini, OpenAI, Claude, DeepSeek, OpenRouter) require your own API key.",
      body: (
        <p className="text-muted-foreground text-sm">
          Open <strong className="text-foreground">Settings</strong> (gear icon) to pick a
          provider and paste your key. Keys stay in this browser and can be cleared anytime.
          Prefer no key at all? The experimental WebLLM provider runs locally on your device.
        </p>
      ),
    },
    {
      title: "You're ready!",
      description:
        "Pick a mode under Start New Adventure, create your character, and type what you do — the narrator handles the rest.",
      body: (
        <p className="text-muted-foreground text-sm">
          You can revisit this guidance anytime via the{" "}
          <strong className="text-foreground">Help</strong> button at the bottom of the menu.
        </p>
      ),
    },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      try {
        localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
      } catch {
        // Storage unavailable: skip silently so the dialog still closes.
      }
      setStep(0);
      onOpenChange(false);
    } else {
      setStep(step + 1);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          try {
            localStorage.setItem(ONBOARDING_SEEN_KEY, "true");
          } catch {
            // Ignore storage failures; dismissal still marks onboarding as done.
          }
          setStep(0);
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="w-[90vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-primary" />
            {current.title}
          </DialogTitle>
          <DialogDescription>{current.description}</DialogDescription>
        </DialogHeader>
        <div>{current.body}</div>
        <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
          <span className="text-xs text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Skip
            </Button>
            <Button size="sm" onClick={handleNext}>
              {isLast ? "Get Started" : "Next"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});