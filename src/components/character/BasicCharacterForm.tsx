"use client";

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShieldQuestion } from 'lucide-react'; // Example icon

// Define a type for the form data this component handles
// This should match the relevant parts of the FormData type in CharacterCreation.tsx
interface BasicFormData {
  name: string;
  class?: string;
  traits?: string;
  knowledge?: string;
  background?: string;
}

interface BasicCharacterFormProps {
  register: UseFormRegister<BasicFormData>; // Use the specific form data type
  errors: FieldErrors<BasicFormData>;
  adventureType: string | null;
}

export function BasicCharacterForm({ register, errors, adventureType }: BasicCharacterFormProps) {
  return (
    <>
      <h3 className="text-lg font-medium mb-3 border-b pb-2">Define Details</h3>
      {/* Name Input */}
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
      {/* Class Input */}
      {adventureType !== "Immersed" && (
        <div className="space-y-2">
          <Label htmlFor="class" className="flex items-center gap-1">
            <ShieldQuestion className="w-4 h-4 text-muted-foreground" /> Class
          </Label>
          <Input
            id="class"
            {...register("class")}
            placeholder="e.g., Warrior, Mage, Rogue"
            className={errors.class ? 'border-destructive' : ''}
            aria-invalid={errors.class ? "true" : "false"}
          />
          {errors.class && <p className="text-sm text-destructive mt-1">{errors.class.message}</p>}
        </div>
      )}
      {/* Traits Input */}
      <div className="space-y-2">
        <Label htmlFor="traits">Traits (comma-separated, max 5)</Label>
        <Input
          id="traits"
          {...register("traits")}
          placeholder="e.g., Brave, Curious, Impulsive"
          className={errors.traits ? 'border-destructive' : ''}
          aria-invalid={errors.traits ? "true" : "false"}
        />
        {errors.traits && <p className="text-sm text-destructive mt-1">{errors.traits.message as string}</p>}
      </div>
      {/* Knowledge Input */}
      <div className="space-y-2">
        <Label htmlFor="knowledge">Knowledge (comma-separated, max 5)</Label>
        <Input
          id="knowledge"
          {...register("knowledge")}
          placeholder="e.g., Magic, History, Herbalism"
          className={errors.knowledge ? 'border-destructive' : ''}
          aria-invalid={errors.knowledge ? "true" : "false"}
        />
        {errors.knowledge && <p className="text-sm text-destructive mt-1">{errors.knowledge.message as string}</p>}
      </div>
      {/* Background Input */}
      <div className="space-y-2">
        <Label htmlFor="background">Background Story (brief)</Label>
        <Input
          id="background"
          {...register("background")}
          placeholder="e.g., Exiled Noble, Village Guard, Mysterious Orphan"
          className={errors.background ? 'border-destructive' : ''}
          aria-invalid={errors.background ? "true" : "false"}
        />
        {errors.background && <p className="text-sm text-destructive mt-1">{errors.background.message}</p>}
      </div>
    </>
  );
}
