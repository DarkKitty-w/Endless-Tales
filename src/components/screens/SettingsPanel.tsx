// src/components/screens/SettingsPanel.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Palette, Moon, Sun } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SettingsPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ isOpen, onOpenChange }: SettingsPanelProps) {
    // --- Dark Mode State & Logic ---
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check localStorage and system preference on initial load
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
    }, []);

    useEffect(() => {
        // Apply theme class to html element when isDarkMode changes
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // --- Color Theme State & Logic (Placeholder) ---
    // TODO: Implement color customization later

    return (
        <SheetContent side="right" className="w-[90vw] sm:w-[400px] flex flex-col">
            <SheetHeader className="border-b pb-4">
                <SheetTitle className="flex items-center gap-2 text-xl">
                    <Palette className="w-5 h-5" /> Settings
                </SheetTitle>
                <SheetDescription>
                    Customize your game experience.
                </SheetDescription>
            </SheetHeader>
            <div className="flex-grow p-4 space-y-6 overflow-y-auto">
                {/* Appearance Section */}
                <div className="space-y-4">
                     <h3 className="text-lg font-medium border-b pb-1">Appearance</h3>
                     {/* Dark Mode Toggle */}
                     <div className="flex items-center justify-between space-x-2 p-3 border rounded-md bg-muted/30">
                       <Label htmlFor="dark-mode" className="flex items-center gap-2 font-medium cursor-pointer">
                         {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                         <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
                       </Label>
                       <Switch
                         id="dark-mode"
                         checked={isDarkMode}
                         onCheckedChange={toggleTheme}
                         aria-label={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}
                       />
                     </div>

                     {/* Color Theme Selector (Placeholder) */}
                     <div className="space-y-2">
                        <Label>Color Theme</Label>
                        <p className="text-sm text-muted-foreground italic">(Color customization coming soon!)</p>
                         {/* TODO: Add color pickers or palette selection */}
                     </div>
                </div>

                 <Separator />

                {/* Add more settings sections here (e.g., Gameplay, Audio) */}

            </div>
            <SheetFooter className="border-t pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </SheetFooter>
        </SheetContent>
    );
}
