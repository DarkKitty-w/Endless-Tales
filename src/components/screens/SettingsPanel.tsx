// src/components/screens/SettingsPanel.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../../components/ui/sheet";
import { Button } from "../../components/ui/button";
import { Switch } from "../../components/ui/switch";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Palette, Moon, Sun, Paintbrush, KeyRound, CheckCircle, XCircle, Globe } from "lucide-react";
import { Separator } from "../../components/ui/separator";
import { cn } from "../../lib/utils";
import { THEMES } from "../../lib/themes";
import { useToast } from "../../hooks/use-toast";
import type { ProviderType } from "../../ai/ai-router";

interface SettingsPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROVIDER_OPTIONS: { value: ProviderType; label: string }[] = [
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'openai', label: 'OpenAI (GPT-4o)' },
  { value: 'claude', label: 'Anthropic Claude' },
  { value: 'deepseek', label: 'DeepSeek' },
];

export function SettingsPanel({ isOpen, onOpenChange }: SettingsPanelProps) {
  const { state, dispatch } = useGame();
  const { selectedThemeId, isDarkMode, userGoogleAiApiKey, aiProvider, providerApiKeys } = state;
  const { toast } = useToast();

  const geminiKeyFromState = providerApiKeys?.gemini ?? userGoogleAiApiKey ?? "";
  const openaiKeyFromState = providerApiKeys?.openai ?? "";
  const claudeKeyFromState = providerApiKeys?.claude ?? "";
  const deepseekKeyFromState = providerApiKeys?.deepseek ?? "";

  const [geminiKey, setGeminiKey] = useState(geminiKeyFromState);
  const [openaiKey, setOpenaiKey] = useState(openaiKeyFromState);
  const [claudeKey, setClaudeKey] = useState(claudeKeyFromState);
  const [deepseekKey, setDeepseekKey] = useState(deepseekKeyFromState);

  useEffect(() => {
    setGeminiKey(providerApiKeys?.gemini ?? userGoogleAiApiKey ?? "");
    setOpenaiKey(providerApiKeys?.openai ?? "");
    setClaudeKey(providerApiKeys?.claude ?? "");
    setDeepseekKey(providerApiKeys?.deepseek ?? "");
  }, [providerApiKeys, userGoogleAiApiKey]);

  const toggleThemeMode = () => {
    dispatch({ type: 'SET_DARK_MODE', payload: !isDarkMode });
  };

  const handleThemeChange = (themeId: string) => {
    dispatch({ type: 'SET_THEME_ID', payload: themeId });
  };

  const handleProviderChange = (provider: ProviderType) => {
    dispatch({ type: 'SET_AI_PROVIDER', payload: provider });
    toast({ title: "Provider Changed", description: `AI provider set to ${PROVIDER_OPTIONS.find(p => p.value === provider)?.label}.` });
  };

  const handleSaveProviderKey = (provider: ProviderType, key: string) => {
    const trimmedKey = key.trim();
    dispatch({
      type: 'SET_PROVIDER_API_KEY',
      payload: { provider, apiKey: trimmedKey || null },
    });
    // Also update legacy key for Gemini for backward compatibility
    if (provider === 'gemini') {
      dispatch({ type: 'SET_USER_API_KEY', payload: trimmedKey || null });
    }
    toast({
      title: trimmedKey ? "API Key Saved" : "API Key Cleared",
      description: `${PROVIDER_OPTIONS.find(p => p.value === provider)?.label} API key ${trimmedKey ? 'saved' : 'cleared'}.`,
    });
  };

  const getKeyStatusIcon = (key: string | undefined) => {
    return key ? (
      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
    ) : (
      <XCircle className="w-3.5 h-3.5 text-destructive" />
    );
  };

  return (
    <SheetContent side="right" className="w-[90vw] sm:w-[450px] flex flex-col">
      <SheetHeader className="p-4 border-b">
        <SheetTitle className="flex items-center gap-2 text-xl">
          <Palette className="w-5 h-5" /> Settings
        </SheetTitle>
        <SheetDescription>Customize your game experience.</SheetDescription>
      </SheetHeader>
      <div className="flex-grow p-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
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
            <Label className="flex items-center gap-1">
              <Paintbrush className="w-4 h-4" /> Color Theme
            </Label>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(theme => {
                const primaryColor = `hsl(${theme.light['--primary']})`;
                const accentColor = `hsl(${theme.light['--accent']})`;
                return (
                  <Button
                    key={theme.id}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start h-auto py-1.5 px-2 text-xs items-center",
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

        {/* AI Provider Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-1 flex items-center gap-2">
            <Globe className="w-4 h-4" /> AI Provider
          </h3>

          <div className="space-y-2">
            <Label htmlFor="ai-provider">Select AI Provider</Label>
            <Select value={aiProvider} onValueChange={(v) => handleProviderChange(v as ProviderType)}>
              <SelectTrigger id="ai-provider">
                <SelectValue placeholder="Choose provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose which AI service to use for narrations and game logic.
            </p>
          </div>

          <Separator className="my-2" />

          {/* API Key Inputs */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">API Keys</h4>
            <p className="text-xs text-muted-foreground">
              Enter your own API keys. They are stored locally in your browser.
            </p>

            {/* Gemini */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="gemini-key" className="text-xs font-medium">
                  Google Gemini
                </Label>
                {getKeyStatusIcon(geminiKey)}
              </div>
              <div className="flex gap-2">
                <Input
                  id="gemini-key"
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="Enter Gemini API Key"
                  className="text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSaveProviderKey('gemini', geminiKey)}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* OpenAI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="openai-key" className="text-xs font-medium">
                  OpenAI
                </Label>
                {getKeyStatusIcon(openaiKey)}
              </div>
              <div className="flex gap-2">
                <Input
                  id="openai-key"
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="Enter OpenAI API Key"
                  className="text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSaveProviderKey('openai', openaiKey)}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* Claude */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="claude-key" className="text-xs font-medium">
                  Anthropic Claude
                </Label>
                {getKeyStatusIcon(claudeKey)}
              </div>
              <div className="flex gap-2">
                <Input
                  id="claude-key"
                  type="password"
                  value={claudeKey}
                  onChange={(e) => setClaudeKey(e.target.value)}
                  placeholder="Enter Claude API Key"
                  className="text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSaveProviderKey('claude', claudeKey)}
                >
                  Save
                </Button>
              </div>
            </div>

            {/* DeepSeek */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="deepseek-key" className="text-xs font-medium">
                  DeepSeek
                </Label>
                {getKeyStatusIcon(deepseekKey)}
              </div>
              <div className="flex gap-2">
                <Input
                  id="deepseek-key"
                  type="password"
                  value={deepseekKey}
                  onChange={(e) => setDeepseekKey(e.target.value)}
                  placeholder="Enter DeepSeek API Key"
                  className="text-sm"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSaveProviderKey('deepseek', deepseekKey)}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>

          {userGoogleAiApiKey && !geminiKey && (
            <p className="text-xs text-muted-foreground italic mt-2">
              Note: A legacy Google API key is present. Save a Gemini key above to override.
            </p>
          )}
        </div>
      </div>
      <SheetFooter className="border-t pt-4 p-3">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </SheetFooter>
    </SheetContent>
  );
}