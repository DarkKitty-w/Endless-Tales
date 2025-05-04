// src/components/screens/SettingsPanel.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Palette, Moon, Sun, Paintbrush } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Theme {
    name: string;
    id: string;
    light: Record<string, string>; // CSS variable -> HSL value
    dark: Record<string, string>;
}

// --- Define Color Themes ---
const THEMES: Theme[] = [
    {
        name: "Cardboard",
        id: "cardboard",
        light: {
            "--background": "20 15% 95%",
            "--foreground": "20 10% 20%",
            "--card": "30 20% 92%",
            "--card-foreground": "20 10% 20%",
            "--popover": "30 20% 92%",
            "--popover-foreground": "20 10% 20%",
            "--primary": "0 0% 50%",
            "--primary-foreground": "0 0% 100%",
            "--secondary": "30 15% 80%",
            "--secondary-foreground": "20 10% 20%",
            "--muted": "30 15% 85%",
            "--muted-foreground": "0 0% 45%",
            "--accent": "20 60% 50%", // Burnt Orange
            "--accent-foreground": "0 0% 100%",
            "--destructive": "0 84.2% 60.2%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "20 10% 75%",
            "--input": "20 10% 80%",
            "--ring": "20 60% 50%",
        },
        dark: {
            "--background": "20 10% 10%",
            "--foreground": "20 5% 95%",
            "--card": "20 10% 15%",
            "--card-foreground": "20 5% 95%",
            "--popover": "20 10% 15%",
            "--popover-foreground": "20 5% 95%",
            "--primary": "0 0% 70%",
            "--primary-foreground": "0 0% 10%",
            "--secondary": "30 10% 25%",
            "--secondary-foreground": "20 5% 95%",
            "--muted": "30 10% 20%",
            "--muted-foreground": "0 0% 63.9%",
            "--accent": "20 60% 50%", // Burnt Orange
            "--accent-foreground": "0 0% 100%",
            "--destructive": "0 62.8% 30.6%",
            "--destructive-foreground": "0 0% 98%",
            "--border": "20 10% 30%",
            "--input": "20 10% 35%",
            "--ring": "20 60% 50%",
        }
    },
    {
        name: "Ocean Depths",
        id: "ocean",
        light: {
             "--background": "210 40% 98%",
             "--foreground": "210 30% 15%",
             "--card": "210 40% 94%",
             "--card-foreground": "210 30% 15%",
             "--popover": "210 40% 94%",
             "--popover-foreground": "210 30% 15%",
             "--primary": "210 60% 45%", // Deep Blue
             "--primary-foreground": "0 0% 100%",
             "--secondary": "180 40% 85%", // Tealish Gray
             "--secondary-foreground": "210 30% 15%",
             "--muted": "210 40% 90%",
             "--muted-foreground": "210 15% 45%",
             "--accent": "185 70% 50%", // Cyan/Teal
             "--accent-foreground": "210 30% 15%",
             "--destructive": "0 84.2% 60.2%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "210 20% 75%",
             "--input": "210 20% 80%",
             "--ring": "185 70% 50%",
         },
         dark: {
             "--background": "210 30% 10%",
             "--foreground": "210 20% 95%",
             "--card": "210 30% 15%",
             "--card-foreground": "210 20% 95%",
             "--popover": "210 30% 15%",
             "--popover-foreground": "210 20% 95%",
             "--primary": "210 70% 65%", // Lighter Deep Blue
             "--primary-foreground": "210 30% 10%",
             "--secondary": "180 30% 25%", // Dark Tealish Gray
             "--secondary-foreground": "210 20% 95%",
             "--muted": "210 30% 20%",
             "--muted-foreground": "210 15% 63.9%",
             "--accent": "185 60% 60%", // Brighter Cyan/Teal
             "--accent-foreground": "210 30% 10%",
             "--destructive": "0 62.8% 30.6%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "210 20% 30%",
             "--input": "210 20% 35%",
             "--ring": "185 60% 60%",
         }
    },
    {
        name: "Forest Canopy",
        id: "forest",
         light: {
             "--background": "120 10% 96%",
             "--foreground": "120 20% 10%",
             "--card": "110 15% 93%",
             "--card-foreground": "120 20% 10%",
             "--popover": "110 15% 93%",
             "--popover-foreground": "120 20% 10%",
             "--primary": "120 50% 35%", // Forest Green
             "--primary-foreground": "0 0% 100%",
             "--secondary": "40 30% 80%", // Light Brown/Beige
             "--secondary-foreground": "120 20% 10%",
             "--muted": "110 15% 90%",
             "--muted-foreground": "120 10% 45%",
             "--accent": "90 60% 55%", // Leaf Green
             "--accent-foreground": "120 20% 10%",
             "--destructive": "0 84.2% 60.2%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "110 10% 75%",
             "--input": "110 10% 80%",
             "--ring": "90 60% 55%",
         },
         dark: {
             "--background": "120 20% 8%",
             "--foreground": "110 10% 94%",
             "--card": "120 20% 12%",
             "--card-foreground": "110 10% 94%",
             "--popover": "120 20% 12%",
             "--popover-foreground": "110 10% 94%",
             "--primary": "120 60% 55%", // Brighter Forest Green
             "--primary-foreground": "120 20% 8%",
             "--secondary": "40 25% 20%", // Dark Brown
             "--secondary-foreground": "110 10% 94%",
             "--muted": "120 20% 15%",
             "--muted-foreground": "110 10% 63.9%",
             "--accent": "90 50% 65%", // Brighter Leaf Green
             "--accent-foreground": "120 20% 8%",
             "--destructive": "0 62.8% 30.6%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "110 10% 25%",
             "--input": "110 10% 30%",
             "--ring": "90 50% 65%",
         }
    },
    {
         name: "Mystic Scroll",
         id: "scroll",
         light: {
             "--background": "35 40% 94%", // Parchment
             "--foreground": "35 15% 20%", // Dark Ink Brown
             "--card": "35 45% 90%",
             "--card-foreground": "35 15% 20%",
             "--popover": "35 45% 90%",
             "--popover-foreground": "35 15% 20%",
             "--primary": "50 60% 50%", // Gold/Yellow Ochre
             "--primary-foreground": "35 15% 20%",
             "--secondary": "0 40% 85%", // Muted Red/Terracotta
             "--secondary-foreground": "35 15% 20%",
             "--muted": "35 40% 92%",
             "--muted-foreground": "35 10% 45%",
             "--accent": "280 50% 60%", // Purple/Violet
             "--accent-foreground": "0 0% 100%",
             "--destructive": "0 84.2% 60.2%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "35 15% 70%",
             "--input": "35 15% 75%",
             "--ring": "280 50% 60%",
         },
         dark: {
             "--background": "35 15% 12%", // Dark Parchment/Brown
             "--foreground": "35 25% 92%", // Light Ink Beige
             "--card": "35 15% 18%",
             "--card-foreground": "35 25% 92%",
             "--popover": "35 15% 18%",
             "--popover-foreground": "35 25% 92%",
             "--primary": "50 70% 70%", // Brighter Gold
             "--primary-foreground": "35 15% 12%",
             "--secondary": "0 30% 30%", // Dark Terracotta
             "--secondary-foreground": "35 25% 92%",
             "--muted": "35 15% 22%",
             "--muted-foreground": "35 10% 63.9%",
             "--accent": "280 60% 75%", // Brighter Purple
             "--accent-foreground": "35 15% 12%",
             "--destructive": "0 62.8% 30.6%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "35 15% 35%",
             "--input": "35 15% 40%",
             "--ring": "280 60% 75%",
         }
    },
    {
         name: "Nightshade",
         id: "nightshade",
         light: { // Keep light mode less extreme, more like a twilight
             "--background": "240 10% 90%",
             "--foreground": "240 20% 10%",
             "--card": "240 15% 85%",
             "--card-foreground": "240 20% 10%",
             "--popover": "240 15% 85%",
             "--popover-foreground": "240 20% 10%",
             "--primary": "260 60% 55%", // Deep Purple
             "--primary-foreground": "0 0% 100%",
             "--secondary": "300 30% 75%", // Muted Magenta/Pinkish
             "--secondary-foreground": "240 20% 10%",
             "--muted": "240 15% 88%",
             "--muted-foreground": "240 10% 45%",
             "--accent": "150 50% 50%", // Vibrant Teal/Green
             "--accent-foreground": "240 20% 10%",
             "--destructive": "0 84.2% 60.2%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "240 10% 70%",
             "--input": "240 10% 75%",
             "--ring": "150 50% 50%",
         },
         dark: {
             "--background": "240 20% 6%", // Very Dark Blue/Black
             "--foreground": "240 10% 95%", // Light Gray
             "--card": "240 20% 10%",
             "--card-foreground": "240 10% 95%",
             "--popover": "240 20% 10%",
             "--popover-foreground": "240 10% 95%",
             "--primary": "260 70% 70%", // Brighter Deep Purple
             "--primary-foreground": "240 20% 6%",
             "--secondary": "300 40% 25%", // Dark Magenta
             "--secondary-foreground": "240 10% 95%",
             "--muted": "240 20% 12%",
             "--muted-foreground": "240 10% 63.9%",
             "--accent": "150 60% 65%", // Brighter Teal
             "--accent-foreground": "240 20% 6%",
             "--destructive": "0 62.8% 30.6%",
             "--destructive-foreground": "0 0% 98%",
             "--border": "240 10% 20%",
             "--input": "240 10% 25%",
             "--ring": "150 60% 65%",
         }
    }
];

interface SettingsPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ isOpen, onOpenChange }: SettingsPanelProps) {
    // --- Dark Mode State & Logic ---
    const [isDarkMode, setIsDarkMode] = useState(false);
    // --- Color Theme State & Logic ---
    const [selectedThemeId, setSelectedThemeId] = useState<string>("cardboard"); // Default to cardboard

    // --- Load settings from localStorage on mount ---
    useEffect(() => {
        const savedTheme = localStorage.getItem('colorTheme') || 'cardboard';
        const savedMode = localStorage.getItem('themeMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        setSelectedThemeId(savedTheme);
        setIsDarkMode(savedMode === 'dark' || (!savedMode && prefersDark));
    }, []);

    // --- Apply theme colors and dark/light mode ---
    const applyTheme = useCallback((themeId: string, isDark: boolean) => {
        const theme = THEMES.find(t => t.id === themeId) || THEMES[0]; // Fallback to cardboard
        const colors = isDark ? theme.dark : theme.light;
        const root = document.documentElement;

        // Apply CSS variables
        Object.entries(colors).forEach(([property, value]) => {
            root.style.setProperty(property, value);
        });

        // Apply dark/light class
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save preferences
        localStorage.setItem('colorTheme', themeId);
        localStorage.setItem('themeMode', isDark ? 'dark' : 'light');
    }, []);

    // Apply theme whenever themeId or isDarkMode changes
    useEffect(() => {
        applyTheme(selectedThemeId, isDarkMode);
    }, [selectedThemeId, isDarkMode, applyTheme]);


    const toggleThemeMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleThemeChange = (themeId: string) => {
        setSelectedThemeId(themeId);
    };

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
                         onCheckedChange={toggleThemeMode}
                         aria-label={`Switch to ${isDarkMode ? 'Light' : 'Dark'} mode`}
                       />
                     </div>

                     {/* Color Theme Selector */}
                     <div className="space-y-2">
                        <Label className="flex items-center gap-1"><Paintbrush className="w-4 h-4"/> Color Theme</Label>
                         <div className="grid grid-cols-3 gap-2">
                             {THEMES.map(theme => (
                                 <Button
                                     key={theme.id}
                                     variant="outline"
                                     size="sm"
                                     className={cn(
                                         "justify-start h-8 text-xs",
                                         selectedThemeId === theme.id && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                     )}
                                     onClick={() => handleThemeChange(theme.id)}
                                 >
                                     {/* Display a color preview */}
                                     <span
                                         className="w-3 h-3 rounded-full mr-2 border"
                                         style={{ backgroundColor: `hsl(${theme.light['--accent']})` }} // Use light accent color for preview
                                     ></span>
                                     {theme.name}
                                 </Button>
                             ))}
                         </div>
                         <p className="text-xs text-muted-foreground">Select a visual theme for the interface.</p>
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
