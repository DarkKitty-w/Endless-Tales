"use client";

import React from "react";
import { useGame } from "../../context/GameContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Sparkles,
  Trash2,
  Loader2,
  Wifi,
  WifiOff,
  Cpu,
} from "lucide-react";
import { isWebLLMAvailable, WebLLMProvider, clearWebLLMCache, type ProviderType } from "../../ai/ai-router";
import { useToast } from "../../hooks/use-toast";

const PROVIDER_LABELS: Record<ProviderType, string> = {
  gemini: "Gemini",
  openai: "OpenAI",
  claude: "Claude",
  deepseek: "DeepSeek",
  openrouter: "OpenRouter",
  webllm: "Local AI",
};

const PROVIDER_ICONS: Record<ProviderType, React.ReactNode> = {
  gemini: <Sparkles className="h-3 w-3" />,
  openai: <Sparkles className="h-3 w-3" />,
  claude: <Sparkles className="h-3 w-3" />,
  deepseek: <Sparkles className="h-3 w-3" />,
  openrouter: <Sparkles className="h-3 w-3" />,
  webllm: <Cpu className="h-3 w-3" />,
};

export const AIStatusPanel = React.memo(function AIStatusPanel() {
  const { state } = useGame();
  const { toast } = useToast();
  const { aiProvider, providerApiKeys } = state;

  const [webllmAvailable, setWebllmAvailable] = React.useState(false);
  const [hardwareInfo, setHardwareInfo] = React.useState<{ webgpu: boolean; memory: number } | null>(null);
  const [isClearing, setIsClearing] = React.useState(false);
  const [webllmProgress, setWebllmProgress] = React.useState<{ progress: number; text: string } | null>(null);

  useEffect(() => {
    const check = async () => {
      const available = isWebLLMAvailable();
      setWebllmAvailable(available);
      if (available) {
        const hw = await WebLLMProvider.checkHardware();
        setHardwareInfo(hw);
      }
    };
    check();
  }, []);

  // Register progress callback for WebLLM loading
  useEffect(() => {
    if (aiProvider === 'webllm') {
      const updateProgress = (progress: number, text: string) => {
        setWebllmProgress({ progress, text });
      };
      
      // Use the static method to set the callback
      WebLLMProvider.setProgressCallback(updateProgress);
      
      return () => {
        WebLLMProvider.setProgressCallback(null);
      };
    }
  }, [aiProvider]);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearWebLLMCache();
      toast({ title: "Cache Cleared", description: "Local AI models have been removed." });
      setWebllmProgress(null);
    } catch (error: any) {
      toast({ title: "Clear Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsClearing(false);
    }
  };

  const hasApiKey = aiProvider !== 'webllm' && !!providerApiKeys[aiProvider];
  // With hybrid approach, cloud providers always show as "online" (server has fallback key)
  // The tooltip will show whether user's key is being used or server fallback
  const isOnline = aiProvider === 'webllm' ? webllmAvailable : true;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-md border border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              {isOnline ? (
                <Wifi className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-destructive" />
              )}
              <Badge variant="outline" className="gap-1 text-xs font-normal border-primary/30 bg-primary/5">
                {PROVIDER_ICONS[aiProvider]}
                <span className="capitalize">{PROVIDER_LABELS[aiProvider]}</span>
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1 text-xs">
              <p className="font-medium">{PROVIDER_LABELS[aiProvider]}</p>
              {aiProvider === 'webllm' ? (
                <>
                  {hardwareInfo && (
                    <>
                      <p>WebGPU: {hardwareInfo.webgpu ? '✓ Supported' : '✗ Not supported'}</p>
                      <p>Memory: ~{hardwareInfo.memory} GB</p>
                    </>
                  )}
                  {webllmAvailable ? (
                    <p className="text-green-600">Ready</p>
                  ) : (
                    <p className="text-destructive">Package not installed</p>
                  )}
                </>
              ) : (
                <p>API Key: {hasApiKey ? '✓ Configured' : '✗ Missing'}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>

        {aiProvider === 'webllm' && webllmAvailable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleClearCache}
                disabled={isClearing}
                aria-label="Clear downloaded AI models"
              >
                {isClearing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear downloaded AI models</TooltipContent>
          </Tooltip>
        )}

        {webllmProgress && (
          <div className="w-20">
            <Progress value={webllmProgress.progress} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground truncate">{webllmProgress.text}</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}