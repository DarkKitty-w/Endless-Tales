// src/components/screens/SettingsPanel.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/context/GameContext";
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
import { Input } from "@/components/ui/input";
import { Palette, Moon, Sun, Paintbrush, KeyRound, CheckCircle, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { THEMES } from "@/lib/themes";
import { useToast } from "@/hooks/use-toast";

interface SettingsPanelProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ isOpen, onOpenChange }: SettingsPanelProps) {
    const { state, dispatch } = useGame();
    const { selectedThemeId, isDarkMode, userGoogleAiApiKey } = state;
    const [apiKeyInput, setApiKeyInput] = useState(userGoogleAiApiKey || "");
    const { toast } = useToast();

    useEffect(() => {
        setApiKeyInput(userGoogleAiApiKey || "");
    }, [userGoogleAiApiKey]);


    const toggleThemeMode = () => {
        dispatch({ type: 'SET_DARK_MODE', payload: !isDarkMode });
    };

    const handleThemeChange = (themeId: string) => {
        dispatch({ type: 'SET_THEME_ID', payload: themeId });
    };

    const handleSaveApiKey = () => {
        const trimmedKey = apiKeyInput.trim();
        if (trimmedKey) {
            dispatch({ type: 'SET_USER_API_KEY', payload: trimmedKey });
            toast({ title: "API Key Saved", description: "Your Google AI API Key has been saved locally.", variant: "default" });
        } else {
            dispatch({ type: 'SET_USER_API_KEY', payload: null });
            toast({ title: "API Key Cleared", description: "Your Google AI API Key has been cleared.", variant: "default" });
        }
    };

    const handleClearApiKey = () => {
        setApiKeyInput("");
        dispatch({ type: 'SET_USER_API_KEY', payload: null });
        toast({ title: "API Key Cleared", description: "Your Google AI API Key has been cleared.", variant: "default" });
    };


    return (
        <SheetContent side="right" className="w-[90vw] sm:w-[400px] flex flex-col">
            <SheetHeader className="p-4 border-b">
                <SheetTitle className="flex items-center gap-2 text-xl">
                    <Palette className="w-5 h-5" /> Settings
                </SheetTitle>
                <SheetDescription>
                    Customize your game experience.
                </SheetDescription>
            </SheetHeader>
            <div className="flex-grow p-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"> {/* Reduced padding and spacing */}
                {/* Appearance Section */}
                <div className="space-y-4">
                     <h3 className="text-lg font-medium border-b pb-1">Appearance</h3>
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

                     <div className="space-y-2">
                        <Label className="flex items-center gap-1"><Paintbrush className="w-4 h-4"/> Color Theme</Label>
                         <div className="flex flex-wrap gap-2"> {/* Changed from grid to flex-wrap */}
                             {THEMES.map(theme => {
                                const primaryColor = `hsl(${theme.light['--primary']})`;
                                const accentColor = `hsl(${theme.light['--accent']})`;
                                return (
                                 <Button
                                     key={theme.id}
                                     variant="outline"
                                     size="sm"
                                     className={cn(
                                         "justify-start h-auto py-1.5 px-2 text-xs items-center", // Adjusted padding for better fit, items-center
                                         selectedThemeId === theme.id && "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                     )}
                                     onClick={() => handleThemeChange(theme.id)}
                                 >
                                     <div
                                        className="w-4 h-4 rounded-sm mr-2 border shrink-0"
                                        style={{
                                            background: `linear-gradient(to bottom right, ${primaryColor} 0%, ${primaryColor} 50%, ${accentColor} 50%, ${accentColor} 100%)`
                                        }}
                                        aria-hidden="true"
                                     />
                                     {theme.name}
                                 </Button>
                                );
                            })}
                         </div>
                         <p className="text-xs text-muted-foreground">Select a visual theme for the interface.</p>
                     </div>
                </div>

                 <Separator />

                {/* API Key Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-1 flex items-center gap-2">
                        <KeyRound className="w-4 h-4" /> API Configuration
                    </h3>
                    <div className="space-y-2">
                        <Label htmlFor="api-key-input">Google AI API Key</Label>
                        <Input
                            id="api-key-input"
                            type="password"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="Enter your Google GenAI API Key"
                            className="text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            Your API key is stored locally in your browser and is used for AI-powered features.
                            It is not sent to our servers.
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            {userGoogleAiApiKey ? (
                                <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5"/> API Key is set.</span>
                            ) : (
                                <span className="text-xs text-destructive flex items-center gap-1"><XCircle className="w-3.5 h-3.5"/> API Key is not set.</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSaveApiKey} size="sm" className="flex-1">
                            Save API Key
                        </Button>
                        {userGoogleAiApiKey && (
                            <Button onClick={handleClearApiKey} variant="destructive" size="sm">
                                Clear API Key
                            </Button>
                        )}
                    </div>
                     <p className="text-xs text-muted-foreground italic">
                        Note: Currently, the game uses a pre-configured API key for AI interactions.
                        User-provided keys will be enabled for AI calls in a future update.
                    </p>
                </div>


            </div>
            <SheetFooter className="border-t pt-4 p-3"> {/* Added p-3 to footer as well */}
                <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </SheetFooter>
        </SheetContent>
    );
}
