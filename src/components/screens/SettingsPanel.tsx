// src/components/screens/SettingsPanel.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Progress } from "../../components/ui/progress";
import { Palette, Moon, Sun, Paintbrush, CheckCircle, XCircle, Globe, Cpu, Download } from "lucide-react";
import { Separator } from "../../components/ui/separator";
import { cn } from "../../lib/utils";
import { THEMES } from "../../lib/themes";
import { useToast } from "../../hooks/use-toast";
import type { ProviderType } from "../../ai/ai-router";
import { WebLLMProvider, isWebLLMAvailable } from "../../ai/ai-router";
import { logger } from "@/lib/logger";

interface SettingsPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const WEBLLM_MODELS = [
  // 🔥 BEST DEFAULT (balance perf / intelligence)
  { 
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', 
    name: 'Qwen 2.5 1.5B', 
    size: '~1 GB', 
    minMemory: 3,
    recommended: true,
    tier: 'balanced'
  },

  // ⚡ FASTEST (low-end devices / phones)
  { 
    id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC', 
    name: 'TinyLlama 1.1B', 
    size: '~0.7 GB', 
    minMemory: 2,
    tier: 'fast'
  },

  // 🧠 SMARTEST SMALL MODEL
  { 
    id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', 
    name: 'Phi-3 Mini', 
    size: '~2.5 GB', 
    minMemory: 4,
    tier: 'smart'
  },

  // ⚖️ BALANCED OPTIONS
  { 
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', 
    name: 'Llama 3.2 3B', 
    size: '~2 GB', 
    minMemory: 4,
    tier: 'balanced'
  },

  { 
    id: 'Gemma-2B-it-q4f16_1-MLC', 
    name: 'Gemma 2B', 
    size: '~1.5 GB', 
    minMemory: 4,
    tier: 'balanced'
  },

  // ⚠️ HIGH-END ONLY (not for your target devices)
  { 
    id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC', 
    name: 'Mistral 7B', 
    size: '~4 GB', 
    minMemory: 6,
    tier: 'advanced'
  },
];

export function SettingsPanel({ isOpen, onOpenChange }: SettingsPanelProps) {
  const { state, dispatch } = useGame();
  const { selectedThemeId, isDarkMode, userGoogleAiApiKey, aiProvider, providerApiKeys } = state;
  const { toast } = useToast();

  const geminiKeyFromState = providerApiKeys?.gemini ?? userGoogleAiApiKey ?? "";
  const openaiKeyFromState = providerApiKeys?.openai ?? "";
  const claudeKeyFromState = providerApiKeys?.claude ?? "";
  const deepseekKeyFromState = providerApiKeys?.deepseek ?? "";
  const openrouterKeyFromState = providerApiKeys?.openrouter ?? "";

  const [geminiKey, setGeminiKey] = useState(geminiKeyFromState);
  const [openaiKey, setOpenaiKey] = useState(openaiKeyFromState);
  const [claudeKey, setClaudeKey] = useState(claudeKeyFromState);
  const [deepseekKey, setDeepseekKey] = useState(deepseekKeyFromState);
  const [openrouterKey, setOpenrouterKey] = useState(openrouterKeyFromState);

  // WebLLM state
  const [webllmSupported, setWebllmSupported] = useState(false);
  const [webllmChecking, setWebllmChecking] = useState(true);
  const [webllmModel, setWebllmModel] = useState('Llama-3.2-3B-Instruct-q4f16_1-MLC');
  const [webllmPersistence, setWebllmPersistence] = useState<'temporary' | 'persistent'>('temporary');
  const [webllmProgress, setWebllmProgress] = useState<{ progress: number; text: string } | null>(null);
  const [webllmLoading, setWebllmLoading] = useState(false);
  const [hardwareInfo, setHardwareInfo] = useState<{ webgpu: boolean; memory: number } | null>(null);

  useEffect(() => {
    setGeminiKey(providerApiKeys?.gemini ?? userGoogleAiApiKey ?? "");
    setOpenaiKey(providerApiKeys?.openai ?? "");
    setClaudeKey(providerApiKeys?.claude ?? "");
    setDeepseekKey(providerApiKeys?.deepseek ?? "");
    setOpenrouterKey(providerApiKeys?.openrouter ?? "");
  }, [providerApiKeys, userGoogleAiApiKey]);

  // Poll for WebLLM availability until it loads
  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    const checkAvailability = () => {
      const available = isWebLLMAvailable();
      logger.log('[SettingsPanel] WebLLM available check:', available);
      
      if (mounted) {
        setWebllmSupported(available);
        if (available) {
          setWebllmChecking(false);
          WebLLMProvider.checkHardware().then(info => {
            logger.log('[SettingsPanel] Hardware info:', info);
            setHardwareInfo(info);
          });
          clearInterval(interval);
        }
      }
    };

    checkAvailability();
    interval = setInterval(checkAvailability, 500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const toggleThemeMode = () => {
    dispatch({ type: 'SET_DARK_MODE', payload: !isDarkMode });
  };

  const handleThemeChange = (themeId: string) => {
    dispatch({ type: 'SET_THEME_ID', payload: themeId });
  };

  const handleProviderChange = (provider: ProviderType) => {
    dispatch({ type: 'SET_AI_PROVIDER', payload: provider });
    const label = providerOptions.find(p => p.value === provider)?.label;
    toast({ title: "Provider Changed", description: `AI provider set to ${label}.` });
  };

  const handleSaveProviderKey = (provider: ProviderType, key: string) => {
    const trimmedKey = key.trim();
    dispatch({
      type: 'SET_PROVIDER_API_KEY',
      payload: { provider, apiKey: trimmedKey || null },
    });
    if (provider === 'gemini') {
      dispatch({ type: 'SET_USER_API_KEY', payload: trimmedKey || null });
    }
    toast({
      title: trimmedKey ? "API Key Saved" : "API Key Cleared",
      description: `${providerOptions.find(p => p.value === provider)?.label} API key ${trimmedKey ? 'saved' : 'cleared'}.`,
    });
  };

  const handleDownloadModel = useCallback(async () => {
    setWebllmLoading(true);
    setWebllmProgress({ progress: 0, text: 'Starting download...' });

    try {
      const provider = new WebLLMProvider({
        model: webllmModel,
        persistence: webllmPersistence,
        onProgress: (progress, text) => {
          setWebllmProgress({ progress: progress * 100, text });
        },
      });

      // Trigger model load with a simple test prompt
      await provider.generateContent({
        model: webllmModel,
        contents: 'Hello',
      });

      toast({ title: "Model Ready", description: `${webllmModel} loaded successfully.` });
      setWebllmProgress(null);
    } catch (error: any) {
      logger.error('[WebLLM] Download error:', error);

      // Provide a helpful error message
      let errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes("reading 'find'") || errorMessage.includes('undefined')) {
        errorMessage = `Model "${webllmModel}" not found in WebLLM registry. Try a different model.`;
      }

      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
      setWebllmProgress(null);
    } finally {
      setWebllmLoading(false);
    }
  }, [webllmModel, webllmPersistence, toast]);

  const getKeyStatusIcon = (key: string | undefined) => {
    return key ? (
      <CheckCircle className="w-3.5 h-3.5 text-green-600" />
    ) : (
      <XCircle className="w-3.5 h-3.5 text-destructive" />
    );
  };

  const recommendedModel = WEBLLM_MODELS.find(m => hardwareInfo && hardwareInfo.memory >= m.minMemory)?.id || WEBLLM_MODELS[0].id;

  const providerOptions = useMemo(() => {
    const options: { value: ProviderType; label: string }[] = [
      { value: 'gemini', label: 'Google Gemini' },
      { value: 'openai', label: 'OpenAI (GPT-4o)' },
      { value: 'claude', label: 'Anthropic Claude' },
      { value: 'deepseek', label: 'DeepSeek' },
      { value: 'openrouter', label: 'OpenRouter' },
    ];
    if (webllmSupported) {
      options.push({ value: 'webllm', label: 'WebLLM (Local AI)' });
    }
    return options;
  }, [webllmSupported]);

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
                {providerOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {webllmChecking && !webllmSupported && (
              <p className="text-xs text-muted-foreground mt-1">
                Checking for local AI support...
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Choose which AI service to use for narrations and game logic.
            </p>
          </div>

          {/* WebLLM Configuration */}
          {aiProvider === 'webllm' && webllmSupported && (
            <div className="space-y-4 p-3 border rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <h4 className="text-sm font-medium">Local AI Configuration</h4>
              </div>
              
              {/* Hardware Info */}
              {hardwareInfo && (
                <div className="text-xs space-y-1">
                  <p className={hardwareInfo.webgpu ? 'text-green-600' : 'text-destructive'}>
                    {hardwareInfo.webgpu ? '✓ WebGPU supported' : '✗ WebGPU not supported'}
                  </p>
                  <p>Device Memory: ~{hardwareInfo.memory} GB</p>
                  {hardwareInfo.memory < 4 && (
                    <p className="text-yellow-600">Low memory – consider smaller models.</p>
                  )}
                </div>
              )}

              {/* Model Selection */}
              <div className="space-y-2">
                <Label className="text-xs">Model</Label>
                <Select value={webllmModel} onValueChange={setWebllmModel}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WEBLLM_MODELS.map(model => (
                      <SelectItem key={model.id} value={model.id} className="text-xs">
                        {model.name} ({model.size})
                        {hardwareInfo && hardwareInfo.memory < model.minMemory && ' ⚠️'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {recommendedModel && (
                  <p className="text-xs text-muted-foreground">
                    Recommended: {WEBLLM_MODELS.find(m => m.id === recommendedModel)?.name}
                  </p>
                )}
              </div>

              {/* Persistence */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs">Save Model Permanently</Label>
                  <p className="text-[10px] text-muted-foreground">
                    {webllmPersistence === 'persistent' 
                      ? 'Model saved in browser storage.' 
                      : 'Model deleted when you close the tab.'}
                  </p>
                </div>
                <Switch
                  checked={webllmPersistence === 'persistent'}
                  onCheckedChange={(v) => setWebllmPersistence(v ? 'persistent' : 'temporary')}
                />
              </div>

              {/* Download Progress */}
              {webllmProgress && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{webllmProgress.text}</span>
                    <span>{Math.round(webllmProgress.progress)}%</span>
                  </div>
                  <Progress value={webllmProgress.progress} className="h-2" />
                </div>
              )}

              {/* Download Button */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadModel}
                disabled={webllmLoading}
                className="w-full"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                {webllmLoading ? 'Downloading...' : 'Download Model'}
              </Button>
              <p className="text-[10px] text-muted-foreground">
                Models run locally in your browser. First download may take several minutes.
              </p>
            </div>
          )}

          {aiProvider === 'webllm' && !webllmSupported && !webllmChecking && (
            <div className="p-3 border rounded-md bg-muted/30">
              <p className="text-sm text-muted-foreground">
                WebLLM is not available. Please install the @mlc-ai/web-llm package to use local AI.
              </p>
            </div>
          )}

          {aiProvider !== 'webllm' && (
            <>
              <Separator className="my-2" />

              {/* API Key Inputs */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">API Keys</h4>
                <p className="text-xs text-muted-foreground">
                  Enter your API key to use your own quota. If not provided, the server's key will be used as fallback.
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

                {/* OpenRouter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="openrouter-key" className="text-xs font-medium">
                      OpenRouter
                    </Label>
                    {getKeyStatusIcon(openrouterKey)}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="openrouter-key"
                      type="password"
                      value={openrouterKey}
                      onChange={(e) => setOpenrouterKey(e.target.value)}
                      placeholder="Enter OpenRouter API Key"
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSaveProviderKey('openrouter', openrouterKey)}
                    >
                      Save
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    OpenRouter gives access to many models. The default is openai/gpt-3.5-turbo.
                  </p>
                </div>
              </div>

              {userGoogleAiApiKey && !geminiKey && (
                <p className="text-xs text-muted-foreground italic mt-2">
                  Note: A legacy Google API key is present. Save a Gemini key above to override.
                </p>
              )}
            </>
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