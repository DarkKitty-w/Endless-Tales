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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse>;

  generateContentStream(params: {
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string>;
}

export type ProviderType = 'gemini' | 'openai' | 'claude' | 'deepseek' | 'webllm';

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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        contents,
        config,
        userApiKey: this.getApiKey(),
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI request failed');
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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        contents,
        config,
        userApiKey: this.getApiKey(),
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI streaming request failed');
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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const messages = [{ role: 'user', content: contents }];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
        messages,
        temperature: config?.temperature,
        top_p: config?.topP,
        response_format: config?.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI request failed');
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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-4o',
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
      throw new Error(error.error?.message || 'OpenAI streaming request failed');
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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Claude API key not configured');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: contents }],
        temperature: config?.temperature,
        top_p: config?.topP,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude request failed');
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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Claude API key not configured');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: contents }],
        temperature: config?.temperature,
        top_p: config?.topP,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude streaming request failed');
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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('DeepSeek API key not configured');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
        messages: [{ role: 'user', content: contents }],
        temperature: config?.temperature,
        top_p: config?.topP,
        response_format: config?.responseMimeType === 'application/json' ? { type: 'json_object' } : undefined,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'DeepSeek request failed');
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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('DeepSeek API key not configured');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'deepseek-chat',
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
      throw new Error(error.error?.message || 'DeepSeek streaming request failed');
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

let webllmEngineCreator: any = null;
let webllmLoadAttempted = false;
let webllmAvailable = false;
let webllmLoadPromise: Promise<any> | null = null;

async function loadWebLLM(): Promise<any> {
  if (webllmEngineCreator) return webllmEngineCreator;
  if (webllmLoadPromise) return webllmLoadPromise;

  webllmLoadAttempted = true;
  console.log('[WebLLM] Attempting to load @mlc-ai/web-llm...');

  webllmLoadPromise = (async () => {
    try {
      const module = await import('@mlc-ai/web-llm');
      webllmEngineCreator = module.CreateWebWorkerMLCEngine;
      webllmAvailable = true;
      console.log('[WebLLM] Package loaded successfully');
      return webllmEngineCreator;
    } catch (e) {
      console.warn('[WebLLM] Package not available:', e);
      webllmAvailable = false;
      throw e;
    } finally {
      webllmLoadPromise = null;
    }
  })();

  return webllmLoadPromise;
}

export function isWebLLMAvailable(): boolean {
  if (!webllmLoadAttempted) {
    loadWebLLM().catch(() => {});
  }
  return webllmAvailable;
}

interface WebLLMEngine {
  reload: (modelId: string, config?: any) => Promise<void>;
  chat: {
    completions: {
      create: (params: any) => Promise<any>;
      createStream: (params: any) => AsyncIterable<any>;
    };
  };
}

class WebLLMProvider implements AIProvider {
  private static engine: WebLLMEngine | null = null;
  private static currentModel: string = '';
  private static loadingPromise: Promise<WebLLMEngine> | null = null;
  private static persistence: 'temporary' | 'persistent' = 'temporary';
  private static progressCallback: ((progress: number, text: string) => void) | null = null;

  constructor(private options?: { model?: string; persistence?: 'temporary' | 'persistent'; onProgress?: (progress: number, text: string) => void }) {
    if (options?.persistence) {
      WebLLMProvider.persistence = options.persistence;
    }
    if (options?.onProgress) {
      WebLLMProvider.progressCallback = options.onProgress;
    }
  }

  private async getEngine(modelId: string): Promise<WebLLMEngine> {
    const CreateWebWorkerMLCEngine = await loadWebLLM();
    if (!CreateWebWorkerMLCEngine) {
      throw new Error('WebLLM engine not available');
    }

    const effectiveModel = modelId || 'Llama-3.2-3B-Instruct-q4f16_1-MLC';
    
    if (WebLLMProvider.engine && WebLLMProvider.currentModel === effectiveModel) {
      return WebLLMProvider.engine;
    }

    if (WebLLMProvider.loadingPromise) {
      return WebLLMProvider.loadingPromise;
    }

    WebLLMProvider.loadingPromise = (async () => {
      try {
        const engineConfig: any = {
          initProgressCallback: (report: { progress: number; text: string }) => {
            if (WebLLMProvider.progressCallback) {
              WebLLMProvider.progressCallback(report.progress, report.text);
            }
          },
        };

        if (WebLLMProvider.persistence === 'persistent') {
          engineConfig.appConfig = {
            useIndexedDBCache: true,
          };
        } else {
          engineConfig.appConfig = {
            useIndexedDBCache: false,
          };
        }

        const engine = await CreateWebWorkerMLCEngine(
          new Worker(new URL('@mlc-ai/web-llm/lib/worker.js', import.meta.url), { type: 'module' }),
          effectiveModel,
          engineConfig
        );

        WebLLMProvider.engine = engine as unknown as WebLLMEngine;
        WebLLMProvider.currentModel = effectiveModel;
        return WebLLMProvider.engine;
      } catch (error) {
        WebLLMProvider.loadingPromise = null;
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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): Promise<GenerateContentResponse> {
    const engine = await this.getEngine(model);
    
    const messages = [{ role: 'user', content: contents }];
    
    const response = await engine.chat.completions.create({
      messages,
      temperature: config?.temperature,
      top_p: config?.topP,
      stream: false,
    });

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
    model: string;
    contents: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const engine = await this.getEngine(model);
    
    const messages = [{ role: 'user', content: contents }];
    
    const stream = await engine.chat.completions.createStream({
      messages,
      temperature: config?.temperature,
      top_p: config?.topP,
    });

    for await (const chunk of stream) {
      if (signal?.aborted) break;
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) yield content;
    }
  }

  static async getAvailableModels(): Promise<{ id: string; name: string; size: string }[]> {
    return [
      { id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', name: 'Llama 3.2 3B', size: '~2 GB' },
      { id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', name: 'Phi-3 Mini', size: '~2.5 GB' },
      { id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC', name: 'Mistral 7B', size: '~4 GB' },
      { id: 'Gemma-2B-it-q4f16_1-MLC', name: 'Gemma 2B', size: '~1.5 GB' },
    ];
  }

  static async checkHardware(): Promise<{ webgpu: boolean; memory: number }> {
    const webgpu = 'gpu' in navigator;
    const memory = (navigator as any).deviceMemory || 4;
    return { webgpu, memory };
  }

  static async clearCache(): Promise<void> {
    if (!webllmAvailable) {
      throw new Error('WebLLM not available');
    }
    try {
      // Delete IndexedDB databases used by WebLLM
      const dbs = await indexedDB.databases();
      for (const db of dbs) {
        if (db.name?.includes('webllm') || db.name?.includes('mlc')) {
          indexedDB.deleteDatabase(db.name!);
        }
      }
      // Also clear Cache Storage if used
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          if (name.includes('webllm') || name.includes('mlc')) {
            await caches.delete(name);
          }
        }
      }
      WebLLMProvider.engine = null;
      WebLLMProvider.currentModel = '';
      console.log('[WebLLM] Cache cleared');
    } catch (e) {
      console.error('[WebLLM] Failed to clear cache:', e);
      throw e;
    }
  }
}

export async function clearWebLLMCache(): Promise<void> {
  await WebLLMProvider.clearCache();
}

// Stub provider for when WebLLM is not available
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
    case 'webllm':
      if (webllmAvailable) {
        return new WebLLMProvider();
      } else {
        return new WebLLMStubProvider();
      }
    default:
      throw new Error(`Unsupported AI provider: ${providerType}`);
  }
}

export class GenAIClient {
  private provider: AIProvider;

  constructor(userApiKey?: string | null, options?: any) {
    if (userApiKey) {
      this.provider = getAIProvider(routerConfig.defaultProvider, userApiKey);
    } else {
      if (routerConfig.defaultProvider === 'webllm' && options) {
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
      model: string;
      contents: string;
      config?: GenerateContentConfig;
      signal?: AbortSignal;
    }): Promise<GenerateContentResponse> => {
      return this.provider.generateContent(params);
    },
    generateContentStream: (params: {
      model: string;
      contents: string;
      config?: GenerateContentConfig;
      signal?: AbortSignal;
    }): AsyncIterable<string> => {
      return this.provider.generateContentStream(params);
    },
  };
}

export function getClient(userApiKey?: string | null, options?: any): GenAIClient {
  return new GenAIClient(userApiKey, options);
}

export { WebLLMProvider };