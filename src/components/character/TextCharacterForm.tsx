
// src/components/character/TextCharacterForm.tsx
"use client";

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Label } from "../ui/label";
import { Input } from "../ui/input"; // Need Input for name
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Wand2 } from "lucide-react";

// Define a type for the form data this component handles
interface TextFormData {
  name: string;
  description?: string;
}

interface TextCharacterFormProps {
  register: UseFormRegister<TextFormData>; // Use the specific form data type
  errors: FieldErrors<TextFormData>;
  onGenerateDescription: () => void;
  isGenerating: boolean;
  watchedName: string; // Receive watched name
  watchedDescription?: string; // Receive watched description
}

export function TextCharacterForm({
  register,
  errors,
  onGenerateDescription,
  isGenerating,
  watchedName,
  watchedDescription,
}: TextCharacterFormProps) {
  return (
    <>
      <h3 className="text-lg font-medium mb-3 border-b pb-2">Describe Your Character</h3>
       {/* Name Input - Moved here as it's common */}
       <div className="space-y-2">
            <Label htmlFor="name" className="text-lg font-semibold">Character Name</Label>
            <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Elara Meadowlight, Grognak the Wanderer"
                className={`text-base ${errors.name ? 'border-destructive' : ''}`}
                aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
        </div>
      <div className="space-y-2">
        <Label htmlFor="description">Appearance, Personality, Backstory (min 10 chars)</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Write a short description of your character... The AI can elaborate and infer details for the 'Basic Fields' tab."
          rows={4}
          className={errors.description ? 'border-destructive' : ''}
          aria-invalid={errors.description ? "true" : "false"}
        />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={onGenerateDescription}
              disabled={isGenerating || !watchedName || !!errors.description || !watchedDescription || (watchedDescription?.length ?? 0) < 10}
              variant="outline"
              size="sm"
              aria-label="Generate detailed description using AI and infer basic fields"
            >
              <Wand2 className={`mr-2 h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? "Generating..." : "Ask AI for Detailed Profile & Fields"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Let AI expand on your description, updating this field AND inferring details for the 'Basic Fields' tab.</p>
            <p className="text-xs text-muted-foreground">Requires a valid name and description (min 10 chars).</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
