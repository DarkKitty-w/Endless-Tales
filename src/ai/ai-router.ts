// src/ai/ai-router.ts

export interface GenerateContentConfig {
  responseMimeType?: string;
  responseSchema?: any;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface GenerateContentResponse {
  text: string;
}

export interface AIProvider {
  generateContent(params: {
    model?: string;
    contents: string;
    systemMessage?: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse>;

  generateContentStream(params: {
    model?: string;
    contents: string;
    systemMessage?: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string>;
}

// Helper to build messages array for providers that support system/user separation
export function buildMessages(contents: string, systemMessage?: string): { role: string; content: string }[] {
  const messages: { role: string; content: string }[] = [];
  if (systemMessage) {
    messages.push({ role: 'system', content: systemMessage });
  }
  messages.push({ role: 'user', content: contents });
  return messages;
}

// ✅ Added 'openrouter'
export type ProviderType = 'gemini' | 'openai' | 'claude' | 'deepseek' | 'webllm' | 'openrouter';

export interface AIRouterConfig {
  defaultProvider: ProviderType;
  apiKeys: Partial<Record<ProviderType, string>>;
}

let routerConfig: AIRouterConfig = {
  defaultProvider: 'gemini',
  apiKeys: {},
};

export function configureAIRouter(config: Partial<AIRouterConfig>): void {
  routerConfig = { ...routerConfig, ...config };
}

export function getAIRouterConfig(): AIRouterConfig {
  return { ...routerConfig };
}

// --- Gemini Provider ---
class GeminiProvider implements AIProvider {
  constructor(private apiKey?: string | null) {}

  private getApiKey(): string {
    return this.apiKey || routerConfig.apiKeys.gemini || '';
  }

  async generateContent({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    const effectiveModel = model || 'gemini-2.5-flash';
    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini',
        model: effectiveModel,
        contents,
        config,
        // Send user's API key if available (hybrid approach)
        ...(this.apiKey && { apiKey: this.apiKey }),
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API error: ${error.error || 'Request failed'}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No text returned from AI');
    return { text };
  }

  async *generateContentStream({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const effectiveModel = model || 'gemini-2.5-flash';
    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'gemini',
        model: effectiveModel,
        contents,
        config,
        stream: true,
        // Send user's API key if available (hybrid approach)
        ...(this.apiKey && { apiKey: this.apiKey }),
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API streaming error: ${error.error || 'Streaming request failed'}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) yield text;
          } catch (e) {
            // ignore malformed JSON
          }
        }
      }
    }
  }
}

// --- OpenAI Provider ---
class OpenAIProvider implements AIProvider {
  constructor(private apiKey?: string | null) {}

  private getApiKey(): string {
    return this.apiKey || routerConfig.apiKeys.openai || '';
  }

  async generateContent({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    const effectiveModel = model || 'gpt-4o';

    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        model: effectiveModel,
        contents,
        config,
        // Send user's API key if available (hybrid approach)
        ...(this.apiKey && { apiKey: this.apiKey }),
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error || 'Request failed'}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('No text returned from OpenAI');
    return { text };
  }

  async *generateContentStream({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const effectiveModel = model || 'gpt-4o';

    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'openai',
        model: effectiveModel,
        contents,
        config,
        stream: true,
        // Send user's API key if available (hybrid approach)
        ...(this.apiKey && { apiKey: this.apiKey }),
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API streaming error: ${error.error || 'Streaming request failed'}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }
}

// --- Claude Provider ---
class ClaudeProvider implements AIProvider {
  constructor(private apiKey?: string | null) {}

  private getApiKey(): string {
    return this.apiKey || routerConfig.apiKeys.claude || '';
  }

  async generateContent({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    const effectiveModel = model || 'claude-3-5-sonnet-20241022';

    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'claude',
        model: effectiveModel,
        contents,
        config,
        // Send user's API key if available (hybrid approach)
        ...(this.apiKey && { apiKey: this.apiKey }),
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error || 'Request failed'}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) throw new Error('No text returned from Claude');
    return { text };
  }

  async *generateContentStream({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const effectiveModel = model || 'claude-3-5-sonnet-20241022';

    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'claude',
        model: effectiveModel,
        contents,
        config,
        stream: true,
        // Send user's API key if available (hybrid approach)
        ...(this.apiKey && { apiKey: this.apiKey }),
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API streaming error: ${error.error || 'Streaming request failed'}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta') {
              const text = parsed.delta?.text;
              if (text) yield text;
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }
}

// --- DeepSeek Provider (OpenAI-compatible) ---
class DeepSeekProvider implements AIProvider {
  constructor(private apiKey?: string | null) {}

  private getApiKey(): string {
    return this.apiKey || routerConfig.apiKeys.deepseek || '';
  }

  async generateContent({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    const effectiveModel = model || 'deepseek-chat';

    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'deepseek',
        model: effectiveModel,
        contents,
        config,
        // Send user's API key if available (hybrid approach)
        ...(this.apiKey && { apiKey: this.apiKey }),
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepSeek API error: ${error.error || 'Request failed'}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('No text returned from DeepSeek');
    return { text };
  }

  async *generateContentStream({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const effectiveModel = model || 'deepseek-chat';

    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'deepseek',
        model: effectiveModel,
        contents,
        config,
        stream: true,
        // Send user's API key if available (hybrid approach)
        ...(this.apiKey && { apiKey: this.apiKey }),
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`DeepSeek API streaming error: ${error.error || 'Streaming request failed'}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }
}

// --- OpenRouter Provider (OpenAI-compatible) ---
class OpenRouterProvider implements AIProvider {
  constructor(private apiKey?: string | null) {}

  private getApiKey(): string {
    return this.apiKey || routerConfig.apiKeys.openrouter || '';
  }

  async generateContent({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    const effectiveModel = model || 'z-ai/glm-4.5-air:free';
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('OpenRouter API key not configured. Please add your OpenRouter API key in Settings.');

    const messages = [{ role: 'user', content: contents }];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'Endless Tales',
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages,
        temperature: config?.temperature,
        top_p: config?.topP,
        response_format: config?.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API error: ${error.error?.message || 'Request failed'}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('No text returned from OpenRouter');
    return { text };
  }

  async *generateContentStream({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const effectiveModel = model || 'z-ai/glm-4.5-air:free';
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('OpenRouter API key not configured');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'Endless Tales',
      },
      body: JSON.stringify({
        model: effectiveModel,
        messages: [{ role: 'user', content: contents }],
        temperature: config?.temperature,
        top_p: config?.topP,
        stream: true,
        response_format: config?.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenRouter API streaming error: ${error.error?.message || 'Streaming request failed'}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6);
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch (e) {
            // ignore
          }
        }
      }
    }
  }
}

// --- WebLLM Provider (Local AI) - Optional, lazy-loaded ---

// --- WebLLM Provider (Local AI) - Optional, lazy-loaded ---

let webllmModule: any = null; // <-- CHANGED: Store the whole module
let webllmLoadAttempted = false;
let webllmAvailable = false;
let webllmLoadPromise: Promise<any> | null = null;
let webllmLoadRetried = false;

async function loadWebLLM(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('[WebLLM] Can only be loaded in the browser');
  }

  if (webllmModule) { // <-- CHANGED: Return the module
    console.log('[WebLLM] Returning cached module');
    return webllmModule;
  }
  if (webllmLoadPromise) {
    console.log('[WebLLM] Load already in progress, waiting...');
    return webllmLoadPromise;
  }

  webllmLoadAttempted = true;
  console.log('[WebLLM] Attempting to load @mlc-ai/web-llm...');

  webllmLoadPromise = (async () => {
    try {
      const module = await import('@mlc-ai/web-llm');
      console.log('[WebLLM] Module loaded, keys:', Object.keys(module));
      
      // Verify the creator exists, but save the WHOLE module
      const creator = module.CreateMLCEngine || module.CreateWebWorkerMLCEngine;
      if (!creator) {
        console.error('[WebLLM] No engine creator found in module keys:', Object.keys(module));
        throw new Error('[WebLLM] No engine creator found (expected CreateMLCEngine or CreateWebWorkerMLCEngine)');
      }
      
      webllmModule = module; // <-- CHANGED: Save the whole module into cache
      webllmAvailable = true;
      console.log('[WebLLM] Engine creator found:', creator.name || 'anonymous');
      return module;
    } catch (e) {
      console.error('[WebLLM] Failed to load package:', e);
      webllmAvailable = false;
      // Retry once after a short delay (network flakiness)
      if (!webllmLoadRetried) {
        webllmLoadRetried = true;
        console.log('[WebLLM] Retrying import once after 500ms...');
        webllmLoadPromise = null;
        await new Promise(resolve => setTimeout(resolve, 500));
        return loadWebLLM();
      }
      throw e;
    } finally {
      if (!webllmModule) { // <-- CHANGED: Check module instead of creator
        webllmLoadPromise = null;
      }
    }
  })();

  return webllmLoadPromise;
}

export function isWebLLMAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  console.log('[WebLLM] isWebLLMAvailable called, current state:', webllmAvailable);
  if (!webllmLoadAttempted) {
    console.log('[WebLLM] Triggering background load...');
    loadWebLLM().catch(() => {});
  }
  return webllmAvailable;
}

class WebLLMProvider implements AIProvider {
  private static engine: any = null;
  private static currentModel: string = '';
  private static loadingPromise: Promise<any> | null = null;
  private static persistence: 'temporary' | 'persistent' = 'temporary';
  static progressCallback: ((progress: number, text: string) => void) | null = null;

  constructor(private options?: { model?: string; persistence?: 'temporary' | 'persistent'; onProgress?: (progress: number, text: string) => void }) {
    console.log('[WebLLM Provider] Constructor called with options:', options);
    if (options?.persistence) {
      WebLLMProvider.persistence = options.persistence;
    }
    if (options?.onProgress) {
      WebLLMProvider.progressCallback = options.onProgress;
    }
  }

  private async getEngine(modelId?: string): Promise<any> {
    console.log('[WebLLM] getEngine called with modelId:', modelId);
    console.log('[WebLLM] Current engine state:', {
      hasEngine: !!WebLLMProvider.engine,
      currentModel: WebLLMProvider.currentModel,
      isLoading: !!WebLLMProvider.loadingPromise,
    });

    if (WebLLMProvider.engine) {
      console.log('[WebLLM] Reusing existing engine for model:', WebLLMProvider.currentModel);
      return WebLLMProvider.engine;
    }

    if (typeof window === 'undefined') {
      throw new Error('[WebLLM] Engine cannot be created on the server');
    }

    console.log('[WebLLM] Loading WebLLM module...');
    const webllm = await loadWebLLM();
    console.log('[WebLLM] webllm module obtained, keys:', Object.keys(webllm));

    const CreateMLCEngine = webllm.CreateMLCEngine || webllm.CreateWebWorkerMLCEngine;
    if (!CreateMLCEngine) {
      console.error('[WebLLM] webllm module contents:', webllm);
      throw new Error('[WebLLM] Engine creator not found in module. Check console for module keys.');
    }

    const { prebuiltAppConfig } = webllm;
    console.log('[WebLLM] prebuiltAppConfig:', prebuiltAppConfig);
    console.log('[WebLLM] prebuiltAppConfig.model_list:', prebuiltAppConfig?.model_list);

    // Wait a bit for internal initialization
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!prebuiltAppConfig || !Array.isArray(prebuiltAppConfig.model_list)) {
      console.error('[WebLLM] prebuiltAppConfig is not properly initialized:', prebuiltAppConfig);
      throw new Error('[WebLLM] Model registry is not initialized. Please try again later.');
    }

    const availableModels: string[] = prebuiltAppConfig.model_list.map((m: any) => m.model_id);
    console.log('[WebLLM] Available models:', availableModels);
    console.log('[WebLLM] Available models count:', availableModels.length);

    const fallbackModels = [
      'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
      'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
      'gemma-2b-it-q4f16_1-MLC',
      'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    ];
    console.log('[WebLLM] Fallback models:', fallbackModels);

    // Use the model selected in settings (passed via options) or fallback
    let effectiveModel = this.options?.model || fallbackModels[0];
    console.log('[WebLLM] Effective model from options:', effectiveModel);
    console.log('[WebLLM] Is requested model in available list?', availableModels.includes(effectiveModel));

    if (!availableModels.includes(effectiveModel)) {
      console.warn(`[WebLLM] Model "${effectiveModel}" not found in registry.`);
      const fallback = fallbackModels.find(m => availableModels.includes(m)) || availableModels[0];
      if (!fallback) {
        throw new Error('[WebLLM] No usable model found in WebLLM registry.');
      }
      effectiveModel = fallback;
      console.log(`[WebLLM] Using fallback model: ${effectiveModel}`);
    }

    if (WebLLMProvider.loadingPromise) {
      console.log('[WebLLM] Engine load already in progress, waiting...');
      return WebLLMProvider.loadingPromise;
    }

    console.log('[WebLLM] Starting engine creation for model:', effectiveModel);
    WebLLMProvider.loadingPromise = (async () => {
      try {
        const engineConfig: any = {
          initProgressCallback: (report: { progress: number; text: string }) => {
            console.log(`[WebLLM Progress] ${report.progress}: ${report.text}`);
            if (WebLLMProvider.progressCallback) {
              WebLLMProvider.progressCallback(report.progress, report.text);
            }
          },
          appConfig: {
            ...webllm.prebuiltAppConfig,
            useIndexedDBCache: WebLLMProvider.persistence === 'persistent',
          },
        };

        console.log('[WebLLM] engineConfig.appConfig:', engineConfig.appConfig);
        console.log('[WebLLM] engineConfig.appConfig.model_list exists?', !!engineConfig.appConfig.model_list);
        console.log('[WebLLM] engineConfig.appConfig.model_list length:', engineConfig.appConfig.model_list?.length);

        console.log(`[WebLLM] Calling CreateMLCEngine with model: ${effectiveModel}`);
        const engine = await CreateMLCEngine(effectiveModel, engineConfig);
        console.log('[WebLLM] CreateMLCEngine returned successfully, engine:', !!engine);

        WebLLMProvider.engine = engine;
        WebLLMProvider.currentModel = effectiveModel;
        console.log('[WebLLM] Engine stored successfully');
        return engine;
      } catch (error) {
        WebLLMProvider.loadingPromise = null;
        console.error('[WebLLM] Engine creation failed:', error);
        console.error('[WebLLM] Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        throw error;
      } finally {
        WebLLMProvider.loadingPromise = null;
      }
    })();

    return WebLLMProvider.loadingPromise;
  }

  async generateContent({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    console.log('[WebLLM] generateContent called');
    const engine = await this.getEngine(model);
    const messages = [{ role: 'user', content: contents }];
    console.log('[WebLLM] Sending chat completion request...');
    const response = await engine.chat.completions.create({
      messages,
      temperature: config?.temperature,
      top_p: config?.topP,
      stream: false,
    });
    console.log('[WebLLM] Chat completion response received');
    const text = response.choices?.[0]?.message?.content;
    if (!text) throw new Error('No text returned from WebLLM');
    return { text };
  }

  async *generateContentStream({
    model,
    contents,
    config,
    signal,
  }: {
    model?: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    console.log('[WebLLM] generateContentStream called');
    const engine = await this.getEngine(model);
    const messages = [{ role: 'user', content: contents }];
    console.log('[WebLLM] Creating streaming chat completion...');
    const stream = await engine.chat.completions.create({
      messages,
      temperature: config?.temperature,
      top_p: config?.topP,
      stream: true,
    });
    console.log('[WebLLM] Stream created');
    for await (const chunk of stream) {
      if (signal?.aborted) {
        console.log('[WebLLM] Stream aborted');
        break;
      }
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) yield content;
    }
    console.log('[WebLLM] Stream completed');
  }

  static async getAvailableModels(): Promise<{ id: string; name: string; size: string }[]> {
    return [
      { id: 'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC', name: 'TinyLlama 1.1B', size: '~0.7 GB (Fastest)' },
      { id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', name: 'Qwen 2.5 1.5B', size: '~1 GB 🔥 Best Lightweight' },
      { id: 'gemma-2b-it-q4f16_1-MLC', name: 'Gemma 2B', size: '~1.5 GB' },
      { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 3B', size: '~2 GB' },
      { id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', name: 'Phi-3 Mini', size: '~2.5 GB (Smartest)' },
      { id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC', name: 'Mistral 7B', size: '~4 GB ⚠️ Heavy' },
      { id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC', name: 'Llama 3.1 8B', size: '~5 GB' },
      { id: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC', name: 'Qwen Coder 1.5B', size: '~1 GB' },
      { id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC', name: 'SmolLM2 1.7B', size: '~1 GB' },
    ];
  }

  static async checkHardware(): Promise<{ webgpu: boolean; memory: number }> {
    console.log('[WebLLM] checkHardware called');
    if (typeof window === 'undefined') return { webgpu: false, memory: 0 };
    const webgpu = 'gpu' in navigator;
    const memory = (navigator as any).deviceMemory || 4;
    console.log('[WebLLM] Hardware:', { webgpu, memory });
    return { webgpu, memory };
  }

  static async clearCache(): Promise<void> {
    console.log('[WebLLM] clearCache called');
    if (typeof window === 'undefined') return;
    try {
      const dbs = await indexedDB.databases();
      console.log('[WebLLM] IndexedDB databases:', dbs.map(db => db.name));
      for (const db of dbs) {
        if (db.name?.includes('webllm') || db.name?.includes('mlc')) {
          console.log('[WebLLM] Deleting database:', db.name);
          indexedDB.deleteDatabase(db.name!);
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log('[WebLLM] Cache storage keys:', cacheNames);
        for (const name of cacheNames) {
          if (name.includes('webllm') || name.includes('mlc')) {
            console.log('[WebLLM] Deleting cache:', name);
            await caches.delete(name);
          }
        }
      }
      WebLLMProvider.engine = null;
      WebLLMProvider.currentModel = '';
      console.log('[WebLLM] Cache cleared');
    } catch (error: unknown) {
      console.error('[WebLLM] Failed to clear cache:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(String(error));
      }
    }
  }
}

export async function clearWebLLMCache(): Promise<void> {
  console.log('[WebLLM] clearWebLLMCache called');
  await WebLLMProvider.clearCache();
}

class WebLLMStubProvider implements AIProvider {
  async generateContent(): Promise<GenerateContentResponse> {
    throw new Error('WebLLM is not installed. Please install @mlc-ai/web-llm to use local AI.');
  }
  async *generateContentStream(): AsyncIterable<string> {
    throw new Error('WebLLM is not installed. Please install @mlc-ai/web-llm to use local AI.');
  }
}

export function getAIProvider(
  providerType: ProviderType = routerConfig.defaultProvider,
  apiKey?: string | null
): AIProvider {
  console.log('[AI Router] getAIProvider called with:', providerType);
  const effectiveApiKey = apiKey ?? routerConfig.apiKeys[providerType];

  switch (providerType) {
    case 'gemini':
      return new GeminiProvider(effectiveApiKey);
    case 'openai':
      return new OpenAIProvider(effectiveApiKey);
    case 'claude':
      return new ClaudeProvider(effectiveApiKey);
    case 'deepseek':
      return new DeepSeekProvider(effectiveApiKey);
    case 'openrouter':
      return new OpenRouterProvider(effectiveApiKey);
    case 'webllm':
      console.log('[AI Router] Creating WebLLM provider, webllmAvailable:', webllmAvailable);
      if (webllmAvailable) {
        return new WebLLMProvider({ onProgress: WebLLMProvider.progressCallback || undefined });
      } else {
        console.warn('[AI Router] WebLLM not available, returning stub');
        return new WebLLMStubProvider();
      }
    default:
      throw new Error(`Unsupported AI provider: ${providerType}`);
  }
}

export class GenAIClient {
  private provider: AIProvider;

  constructor(userApiKey?: string | null, options?: any) {
    console.log('[GenAIClient] Constructor called');
    if (userApiKey) {
      this.provider = getAIProvider(routerConfig.defaultProvider, userApiKey);
    } else {
      if (routerConfig.defaultProvider === 'webllm' && options) {
        console.log('[GenAIClient] Creating WebLLM provider with options:', options);
        if (webllmAvailable) {
          this.provider = new WebLLMProvider(options);
        } else {
          this.provider = new WebLLMStubProvider();
        }
      } else {
        this.provider = getAIProvider(routerConfig.defaultProvider);
      }
    }
  }

  models = {
    generateContent: async (params: {
      model?: string;
      contents: string;
      config?: GenerateContentConfig;
      signal?: AbortSignal;
    }): Promise<GenerateContentResponse> => {
      console.log('[GenAIClient] generateContent called');
      return this.provider.generateContent(params);
    },
    generateContentStream: (params: {
      model?: string;
      contents: string;
      config?: GenerateContentConfig;
      signal?: AbortSignal;
    }): AsyncIterable<string> => {
      console.log('[GenAIClient] generateContentStream called');
      return this.provider.generateContentStream(params);
    },
  };
}

export function getClient(userApiKey?: string | null, options?: any): GenAIClient {
  console.log('[AI Router] getClient called');
  return new GenAIClient(userApiKey, options);
}

export { WebLLMProvider };