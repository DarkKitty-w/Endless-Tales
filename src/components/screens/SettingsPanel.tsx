// src/components/screens/SettingsPanel.tsx
"use client";

import React from "react";
import { useGame } from "@/context/GameContext"; // Import useGame hook
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
import { THEMES } from "@/lib/themes"; // Import themes from the new location

interface SettingsPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ isOpen, onOpenChange }: SettingsPanelProps) {
    const { state, dispatch } = useGame(); // Use context
    const { selectedThemeId, isDarkMode } = state;

    const toggleThemeMode = () => {
        dispatch({ type: 'SET_DARK_MODE', payload: !isDarkMode });
    };

    const handleThemeChange = (themeId: string) => {
        dispatch({ type: 'SET_THEME_ID', payload: themeId });
    };

    // Theme application logic is now handled in GameProvider via useEffect

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
