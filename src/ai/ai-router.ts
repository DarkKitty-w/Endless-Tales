import { logger, generateRequestId, setRequestId, setTraceId, getTraceId } from '@/lib/logger';
import { protectUserAction, PROMPT_INJECTION_DEFENSE } from '@/lib/prompt-injection-protection';
// src/ai/ai-router.ts

// --- Type Definitions ---

// WebLLM type definitions (minimal, as the library doesn't export proper types)
// Using Function type for flexibility since the actual MLCEngine type is complex
interface WebLLMModule {
  CreateMLCEngine: Function;
  CreateWebWorkerMLCEngine?: Function;
  prebuiltAppConfig: {
    model_list: Array<{ model_id: string }>;
  };
}

// Type for WebLLM engine with chat completions
interface WebLLMEngineWithChat {
  chat: {
    completions: {
      create: (params: Record<string, unknown>) => Promise<WebLLMChatResponse> | AsyncIterable<WebLLMStreamChunk>;
    };
  };
}

interface WebLLMChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

interface WebLLMStreamChunk {
  choices?: Array<{ delta?: { content?: string } }>;
}

// WebLLMEngine represents the engine instance - using unknown but will be type-asserted when used
type WebLLMEngine = unknown;

// Response schema type for AI providers
export interface ResponseSchemaProperty {
  type: string;
  description?: string;
  items?: ResponseSchemaProperty;
  properties?: Record<string, ResponseSchemaProperty>;
}

export interface ResponseSchema {
  type: string;
  properties?: Record<string, ResponseSchemaProperty>;
  required?: string[];
}

export interface GenerateContentConfig {
  responseMimeType?: string;
  responseSchema?: ResponseSchema;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
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
    requestId?: string;
    traceId?: string;
  }): Promise<GenerateContentResponse>;

  generateContentStream(params: {
    model?: string;
    contents: string;
    systemMessage?: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
    requestId?: string;
    traceId?: string;
  }): AsyncIterable<string>;
}

// Client-side timeout for AI requests. Keep this aligned with the server proxy
// timeout; OpenRouter/free models can be slow but still complete successfully.
const AI_TIMEOUT = 180000;
function getSignalWithTimeout(signal?: AbortSignal): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(AI_TIMEOUT);
  if (signal) {
    return AbortSignal.any([signal, timeoutSignal]);
  }
  return timeoutSignal;
}

async function readProxyError(response: Response): Promise<{ error: string; requestId?: string; traceId?: string; rawResponse?: string }> {
  const text = await response.text();
  if (!text) return { error: `AI proxy request failed with status ${response.status}` };
  try {
    const parsed = JSON.parse(text);
    const details = parsed.rawResponse ? ` Details: ${String(parsed.rawResponse).substring(0, 500)}` : '';
    return {
      error: `${parsed.error || `AI proxy request failed with status ${response.status}`}${details}`,
      requestId: parsed.requestId,
      traceId: parsed.traceId,
      rawResponse: parsed.rawResponse,
    };
  } catch {
    return { error: text.substring(0, 500), rawResponse: text.substring(0, 1000) };
  }
}

// ✅ Added 'openrouter'
export type ProviderType = 'gemini' | 'openai' | 'claude' | 'deepseek' | 'webllm' | 'openrouter';

export interface AIRouterConfig {
  defaultProvider: ProviderType;
  apiKeys: Partial<Record<ProviderType, string>>;
  models: Partial<Record<ProviderType, string>>;
}

let routerConfig: AIRouterConfig = {
  defaultProvider: 'gemini',
  apiKeys: {},
  models: {},
};

export function configureAIRouter(config: Partial<AIRouterConfig>): void {
  routerConfig = { ...routerConfig, ...config };
}

export function getAIRouterConfig(): AIRouterConfig {
  return { ...routerConfig };
}

// --- Shared helpers for proxy-based providers ---
//
// All HTTP providers (Gemini, OpenAI, Claude, DeepSeek, OpenRouter) talk to the
// same Next.js proxy route (`/api/ai-proxy`) and share the request/response
// lifecycle. The abstract `ProxyAIProvider` below centralizes that lifecycle so
// each concrete provider only declares what makes it unique: its identifier,
// default model, and how to read text out of (non-)streaming responses.

/** Parameters accepted by every `generateContent` call. */
export interface GenerateContentParams {
  model?: string;
  contents: string;
  systemMessage?: string;
  config?: GenerateContentConfig;
  signal?: AbortSignal;
  requestId?: string;
  traceId?: string;
}

/**
 * Resolves the correlation ids used for logging/tracing across an AI request.
 * Reuses the caller-provided ids when available, otherwise generates new ones
 * and publishes them to the logger context.
 */
function resolveCorrelationIds(passedRequestId?: string, passedTraceId?: string): { requestId: string; traceId: string } {
  const requestId = passedRequestId || generateRequestId();
  setRequestId(requestId);

  let traceId = passedTraceId || getTraceId();
  if (!traceId) {
    traceId = generateRequestId();
    setTraceId(traceId);
  }

  return { requestId, traceId };
}

/** Number of decoded chunks to buffer before flushing them into the SSE line parser. */
const STREAM_CHUNK_FLUSH_THRESHOLD = 10;

/** Mutable holder so nested stream parsing can report how much text was received. */
interface StreamAccumulator {
  text: string;
}

abstract class ProxyAIProvider implements AIProvider {
  constructor(protected apiKey?: string | null) {}

  /** Provider identifier sent to the AI proxy route. */
  protected abstract get providerKey(): ProviderType;

  /** Human-readable provider name used in error messages and logs. */
  protected abstract get displayName(): string;

  /** Model used when the caller does not request a specific one. */
  protected abstract get defaultModelName(): string;

  /** Reads the completion text from a non-streaming proxy response body. */
  protected abstract extractResponseText(data: unknown): string | undefined;

  /** Reads the incremental text from one parsed SSE data payload. */
  protected abstract extractStreamText(parsed: unknown): string | undefined;

  /** Name used in the "No text returned from ..." error message. */
  protected get textSourceName(): string {
    return this.displayName;
  }

  /** Whether SSE lines are trimmed before matching the "data: " prefix. */
  protected get trimStreamLines(): boolean {
    return true;
  }

  /** Whether the provider sends the OpenAI-style "[DONE]" stream sentinel. */
  protected get streamHasDoneMarker(): boolean {
    return true;
  }

  /** Whether to log streaming start/completion lifecycle events. */
  protected get logsStreamLifecycle(): boolean {
    return false;
  }

  private getApiKey(): string {
    return this.apiKey || routerConfig.apiKeys[this.providerKey] || '';
  }

  /** Context attached to error logs; providers may add their own fields. */
  protected getInputContext(contents: string, systemMessage: string | undefined, config?: GenerateContentConfig): Record<string, unknown> {
    return {
      contentLength: contents.length,
      config: config
        ? {
            temperature: config.temperature,
            topP: config.topP,
            topK: config.topK,
          }
        : undefined,
    };
  }

  private buildProxyRequestBody(options: {
    model: string;
    contents: string;
    systemMessage: string;
    config?: GenerateContentConfig;
    requestId: string;
    traceId: string;
    stream?: boolean;
  }): Record<string, unknown> {
    return {
      provider: this.providerKey,
      model: options.model,
      contents: options.contents,
      systemMessage: options.systemMessage,
      config: options.config,
      apiKey: this.getApiKey(),
      requestId: options.requestId,
      traceId: options.traceId,
      ...(options.stream ? { stream: true } : {}),
    };
  }

  /**
   * Parses SSE lines and yields the extracted text deltas.
   * Resolves to `true` when the provider signaled the end of the stream.
   */
  private async *parseStreamLines(lines: string[], accumulated: StreamAccumulator): AsyncGenerator<string, boolean, void> {
    for (const line of lines) {
      const candidate = this.trimStreamLines ? line.trim() : line;
      if (!candidate.startsWith('data: ')) continue;

      const data = candidate.slice(6);
      if (this.streamHasDoneMarker && data === '[DONE]') return true;

      try {
        const parsed = JSON.parse(data);
        const text = this.extractStreamText(parsed);
        if (text) {
          accumulated.text += text;
          yield text;
        }
      } catch {
        // Ignore malformed JSON lines (keep-alives, partial payloads, ...)
      }
    }
    return false;
  }

  async generateContent({
    model,
    contents,
    systemMessage,
    config,
    signal,
    requestId: passedRequestId,
    traceId: passedTraceId,
  }: GenerateContentParams): Promise<GenerateContentResponse> {
    const effectiveModel = model || this.defaultModelName;
    const { requestId, traceId } = resolveCorrelationIds(passedRequestId, passedTraceId);

    // SEC-6 Fix: Apply prompt injection protection
    const protectedContents = protectUserAction(contents);
    const enhancedSystemMessage = systemMessage
      ? `${systemMessage}\n${PROMPT_INJECTION_DEFENSE}`
      : PROMPT_INJECTION_DEFENSE;

    logger.info('AI request initiated', 'ai-router', {
      requestId,
      traceId,
      provider: this.providerKey,
      model: effectiveModel,
      contentLength: contents.length,
    });

    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        this.buildProxyRequestBody({
          model: effectiveModel,
          contents: protectedContents.sanitized,
          systemMessage: enhancedSystemMessage,
          config,
          requestId,
          traceId,
        })
      ),
      signal: getSignalWithTimeout(signal),
    });

    if (!response.ok) {
      const error = await readProxyError(response);
      // OBS-9 Fix: Include more context in error logs for reproducibility
      logger.error('AI request failed', 'ai-router', {
        requestId,
        traceId,
        provider: this.providerKey,
        model: effectiveModel,
        error: error.error,
        inputContext: this.getInputContext(contents, systemMessage, config),
        operation: 'generateContent',
      });
      throw new Error(error.error || `${this.displayName} API error: Request failed`);
    }

    const data = await response.json();
    const text = this.extractResponseText(data);
    if (!text) throw new Error(`No text returned from ${this.textSourceName}`);

    logger.info('AI request completed', 'ai-router', {
      requestId,
      traceId,
      responseLength: text.length,
    });

    return { text };
  }

  async *generateContentStream({
    model,
    contents,
    systemMessage,
    config,
    signal,
    requestId: passedRequestId,
    traceId: passedTraceId,
  }: GenerateContentParams): AsyncIterable<string> {
    const effectiveModel = model || this.defaultModelName;
    const { requestId, traceId } = resolveCorrelationIds(passedRequestId, passedTraceId);

    // SEC-6 Fix: Apply prompt injection protection
    const protectedContents = protectUserAction(contents);
    const enhancedSystemMessage = systemMessage
      ? `${systemMessage}\n${PROMPT_INJECTION_DEFENSE}`
      : PROMPT_INJECTION_DEFENSE;

    logger.info('AI streaming request initiated', 'ai-router', {
      requestId,
      traceId,
      provider: this.providerKey,
      model: effectiveModel,
      contentLength: contents.length,
    });

    const response = await fetch('/api/ai-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        this.buildProxyRequestBody({
          model: effectiveModel,
          contents: protectedContents.sanitized,
          systemMessage: enhancedSystemMessage,
          config,
          requestId,
          traceId,
          stream: true,
        })
      ),
      signal: getSignalWithTimeout(signal),
    });

    if (!response.ok) {
      const error = await readProxyError(response);
      // OBS-9 Fix: Include more context in error logs for reproducibility
      logger.error('AI streaming request failed', 'ai-router', {
        requestId,
        traceId,
        provider: this.providerKey,
        model: effectiveModel,
        error: error.error,
        inputContext: this.getInputContext(contents, systemMessage, config),
        operation: 'generateContentStream',
      });
      throw new Error(error.error || `${this.displayName} API streaming error: Streaming request failed`);
    }

    // ERR-4 Fix: Track accumulated text for error reporting
    const accumulated: StreamAccumulator = { text: '' };

    try {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      if (this.logsStreamLifecycle) {
        logger.info('AI streaming started', 'ai-router', { requestId, traceId });
      }

      const decoder = new TextDecoder();
      const pendingChunks: string[] = [];
      let buffer = '';
      let streamEnded = false;

      while (!streamEnded) {
        const { done, value } = await reader.read();
        if (done) break;

        // PERF-4 Fix: Collect chunks in array and join periodically to reduce string allocations
        pendingChunks.push(decoder.decode(value, { stream: true }));
        if (pendingChunks.length < STREAM_CHUNK_FLUSH_THRESHOLD) continue;

        buffer += pendingChunks.join('');
        pendingChunks.length = 0;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        streamEnded = yield* this.parseStreamLines(lines, accumulated);
      }

      // Process any remaining chunks; at end of stream there is no next line to wait for
      if (pendingChunks.length > 0) {
        buffer += pendingChunks.join('');
      }
      yield* this.parseStreamLines(buffer.split('\n'), accumulated);

      if (this.logsStreamLifecycle) {
        logger.info('AI streaming completed', 'ai-router', {
          requestId,
          traceId,
          accumulatedLength: accumulated.text.length,
        });
      }
    } catch (error) {
      // ERR-4 Fix: Include accumulated text in error
      const errorMessage = error instanceof Error ? error.message : 'Stream processing error';
      throw new Error(`${errorMessage}\n\nPartial response received: ${accumulated.text.substring(0, 500)}`);
    }
  }
}

// --- Minimal shapes of the provider response payloads we consume ---

interface GeminiResponseBody {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
}

interface OpenAICompatibleResponseBody {
  choices?: Array<{ message?: { content?: string } }>;
}

interface OpenAICompatibleStreamPayload {
  choices?: Array<{ delta?: { content?: string } }>;
}

interface ClaudeResponseBody {
  content?: Array<{ text?: string }>;
}

interface ClaudeStreamPayload {
  type?: string;
  delta?: { text?: string };
}

class GeminiProvider extends ProxyAIProvider {
  protected get providerKey(): ProviderType { return 'gemini'; }
  protected get displayName() { return 'Gemini'; }
  protected get defaultModelName() { return 'gemini-2.5-flash'; }
  protected override get textSourceName() { return 'AI'; }

  // The Gemini SSE payloads are not whitespace-padded, so trimming is skipped
  protected override get trimStreamLines() { return false; }

  protected override get logsStreamLifecycle() { return true; }

  protected extractResponseText(data: unknown): string | undefined {
    return (data as GeminiResponseBody)?.candidates?.[0]?.content?.parts?.[0]?.text;
  }

  protected extractStreamText(parsed: unknown): string | undefined {
    return (parsed as GeminiResponseBody)?.candidates?.[0]?.content?.parts?.[0]?.text;
  }

  protected override getInputContext(contents: string, systemMessage: string | undefined, config?: GenerateContentConfig): Record<string, unknown> {
    return {
      contentLength: contents.length,
      systemMessageLength: systemMessage?.length || 0,
      config: config
        ? {
            responseMimeType: config.responseMimeType,
            temperature: config.temperature,
            topP: config.topP,
            topK: config.topK,
          }
        : undefined,
    };
  }
}

/** Providers speaking the OpenAI chat-completions wire format through the proxy. */
abstract class OpenAICompatibleProvider extends ProxyAIProvider {
  protected extractResponseText(data: unknown): string | undefined {
    return (data as OpenAICompatibleResponseBody)?.choices?.[0]?.message?.content;
  }

  protected extractStreamText(parsed: unknown): string | undefined {
    return (parsed as OpenAICompatibleStreamPayload)?.choices?.[0]?.delta?.content;
  }
}

class OpenAIProvider extends OpenAICompatibleProvider {
  protected get providerKey(): ProviderType { return 'openai'; }
  protected get displayName() { return 'OpenAI'; }
  protected get defaultModelName() { return 'gpt-4o'; }
}

class DeepSeekProvider extends OpenAICompatibleProvider {
  protected get providerKey(): ProviderType { return 'deepseek'; }
  protected get displayName() { return 'DeepSeek'; }
  protected get defaultModelName() { return 'deepseek-chat'; }
}

class OpenRouterProvider extends OpenAICompatibleProvider {
  protected get providerKey(): ProviderType { return 'openrouter'; }
  protected get displayName() { return 'OpenRouter'; }

  protected get defaultModelName() {
    return routerConfig.models.openrouter || 'z-ai/glm-4.5-air:free';
  }
}

class ClaudeProvider extends ProxyAIProvider {
  protected get providerKey(): ProviderType { return 'claude'; }
  protected get displayName() { return 'Claude'; }
  protected get defaultModelName() { return 'claude-3-5-sonnet-20241022'; }

  // Claude streams do not send the "[DONE]" sentinel; they emit typed events instead
  protected override get streamHasDoneMarker() { return false; }

  protected extractResponseText(data: unknown): string | undefined {
    return (data as ClaudeResponseBody)?.content?.[0]?.text;
  }

  protected extractStreamText(parsed: unknown): string | undefined {
    const payload = parsed as ClaudeStreamPayload;
    return payload?.type === 'content_block_delta' ? payload.delta?.text : undefined;
  }
}

// --- WebLLM Provider (Local AI) - Optional, lazy-loaded ---

let webllmModule: WebLLMModule | null = null;
let webllmLoadAttempted = false;
let webllmAvailable = false;
let webllmLoadPromise: Promise<WebLLMModule> | null = null;

async function loadWebLLM(): Promise<WebLLMModule> {
  if (typeof window === 'undefined') {
    throw new Error('[WebLLM] Can only be loaded in the browser');
  }

  // Check for cached module
  const cached = getCachedModule();
  if (cached) {
    logger.log('[WebLLM] Returning cached module');
    return cached;
  }

  // If already loading, return the existing promise
  if (webllmLoadPromise) {
    logger.log('[WebLLM] Load already in progress, waiting...');
    return webllmLoadPromise;
  }

  webllmLoadAttempted = true;
  logger.log('[WebLLM] Attempting to load @mlc-ai/web-llm...');

  // Start loading with retry logic
  webllmLoadPromise = retryLoadModule(1);

  // Clear promise on failure
  webllmLoadPromise.catch(() => {
    webllmLoadPromise = null;
  });

  return webllmLoadPromise;
}

export function isWebLLMAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  logger.log('[WebLLM] isWebLLMAvailable called', 'ai-router', { currentState: webllmAvailable });
  if (!webllmLoadAttempted) {
    logger.log('[WebLLM] Triggering background load...', 'ai-router');
    loadWebLLM().catch(() => {});
  }
  return webllmAvailable;
}

// Store progress callback in module-level variable instead of as static class property
// This avoids the private property access issue
let webllmProgressCallback: ((progress: number, text: string) => void) | null = null;

// BUG-7 Fix: Module-level variables to track the current engine instance
// This allows the static clearCache() method to work while avoiding race conditions
let currentWebLLMEngine: WebLLMEngine | null = null;
let currentWebLLMModel: string = '';

// --- WebLLM Helper Functions ---

/**
 * Gets the cached engine if available
 */
function getCachedEngine(instance: WebLLMProvider): WebLLMEngine | null {
  // Access the private engine property via a type-safe approach
  const instanceAny = instance as unknown as { engine?: WebLLMEngine };
  return instanceAny.engine || currentWebLLMEngine;
}

/**
 * Loads the WebLLM module, with retry logic
 */
async function loadWebLLMModule(): Promise<WebLLMModule> {
  logger.log('[WebLLM] Loading WebLLM module...', 'ai-router');
  const webllmModule = await loadWebLLM();
  logger.log('[WebLLM] webllm module obtained', 'ai-router', { keys: Object.keys(webllmModule) });

  const CreateMLCEngine = webllmModule.CreateMLCEngine || webllmModule.CreateWebWorkerMLCEngine;
  if (!CreateMLCEngine) {
    logger.error('[WebLLM] webllm module contents', 'ai-router', { module: webllmModule });
    throw new Error('[WebLLM] Engine creator not found in module. Check console for module keys.');
  }

  // Return a properly typed WebLLMModule
  return {
    CreateMLCEngine,
    CreateWebWorkerMLCEngine: webllmModule.CreateWebWorkerMLCEngine,
    prebuiltAppConfig: webllmModule.prebuiltAppConfig,
  };
}

/**
 * Finds an available model from the registry, with fallback logic
 */
function findAvailableModel(
  webllm: WebLLMModule,
  requestedModel?: string,
  fallbackModels: string[] = [
    'TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC',
    'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    'gemma-2b-it-q4f16_1-MLC',
    'Llama-3.2-3B-Instruct-q4f16_1-MLC',
  ]
): string {
  const { prebuiltAppConfig } = webllm;

  if (!prebuiltAppConfig || !Array.isArray(prebuiltAppConfig.model_list)) {
    logger.error('[WebLLM] prebuiltAppConfig is not properly initialized', 'ai-router', { prebuiltAppConfig });
    throw new Error('[WebLLM] Model registry is not initialized. Please try again later.');
  }

  const availableModels: string[] = prebuiltAppConfig.model_list.map((m: { model_id: string }) => m.model_id);
  logger.log('[WebLLM] Available models', 'ai-router', { availableModels });

  let effectiveModel = requestedModel || fallbackModels[0];
  logger.log('[WebLLM] Effective model', 'ai-router', { effectiveModel });

  if (!availableModels.includes(effectiveModel)) {
    logger.warn(`[WebLLM] Model "${effectiveModel}" not found in registry.`);
    const fallback = fallbackModels.find(m => availableModels.includes(m)) || availableModels[0];
    if (!fallback) {
      throw new Error('[WebLLM] No usable model found in WebLLM registry.');
    }
    effectiveModel = fallback;
    logger.log(`[WebLLM] Using fallback model: ${effectiveModel}`);
  }

  return effectiveModel;
}

/**
 * WebLLM engine configuration
 */
interface WebLLMEngineConfig {
  initProgressCallback?: (report: { progress: number; text: string }) => void;
  appConfig?: {
    useIndexedDBCache?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Creates engine configuration for WebLLM
 */
function createEngineConfig(persistence: 'temporary' | 'persistent', webllm: WebLLMModule): WebLLMEngineConfig {
  return {
    initProgressCallback: (report: { progress: number; text: string }) => {
      logger.log(`[WebLLM Progress] ${report.progress}: ${report.text}`);
      if (webllmProgressCallback) {
        webllmProgressCallback(report.progress, report.text);
      }
    },
    appConfig: {
      ...webllm.prebuiltAppConfig,
      useIndexedDBCache: persistence === 'persistent',
    },
  };
}

// --- End WebLLM Helper Functions ---

// --- loadWebLLM Helper Functions ---

/**
 * Gets the cached WebLLM module if available
 */
function getCachedModule(): WebLLMModule | null {
  return webllmModule;
}

/**
 * Attempts to load the WebLLM module with retry logic
 */
async function retryLoadModule(maxRetries: number = 1): Promise<WebLLMModule> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      logger.log(`[WebLLM] Loading @mlc-ai/web-llm (attempt ${attempt + 1})...`);
      const module = await import('@mlc-ai/web-llm');
      logger.log('[WebLLM] Module loaded, keys:', Object.keys(module).join(', '));

      const creator = module.CreateMLCEngine || module.CreateWebWorkerMLCEngine;
      if (!creator) {
        logger.error('[WebLLM] No engine creator found in module keys:', Object.keys(module).join(', '));
        throw new Error('[WebLLM] No engine creator found (expected CreateMLCEngine or CreateWebWorkerMLCEngine)');
      }

      // Create a properly typed WebLLMModule
      const typedModule: WebLLMModule = {
        CreateMLCEngine: module.CreateMLCEngine,
        CreateWebWorkerMLCEngine: module.CreateWebWorkerMLCEngine,
        prebuiltAppConfig: module.prebuiltAppConfig,
      };

      webllmModule = typedModule;
      webllmAvailable = true;
      logger.log('[WebLLM] Engine creator found:', creator.name || 'anonymous');
      return typedModule;
    } catch (e) {
      logger.error(`[WebLLM] Failed to load package (attempt ${attempt + 1}):`, e instanceof Error ? e.message : String(e));
      webllmAvailable = false;

      if (attempt < maxRetries) {
        logger.log(`[WebLLM] Retrying in 500ms...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        throw e;
      }
    }
  }
  throw new Error('[WebLLM] Failed to load module after retries');
}

// --- End loadWebLLM Helper Functions ---

class WebLLMProvider implements AIProvider {
  // BUG-7 Fix: Changed from static to instance properties to avoid race conditions
  private engine: WebLLMEngine | null = null;
  private currentModel: string = '';
  private loadingPromise: Promise<WebLLMEngine> | null = null;
  private persistence: 'temporary' | 'persistent' = 'temporary';

  constructor(private options?: { model?: string; persistence?: 'temporary' | 'persistent'; onProgress?: (progress: number, text: string) => void }) {
    logger.log('[WebLLM Provider] Constructor called with options:', JSON.stringify(options));
    if (options?.persistence) {
      this.persistence = options.persistence;
    }
    if (options?.onProgress) {
      webllmProgressCallback = options.onProgress;
    }
  }

  static setProgressCallback(cb: ((progress: number, text: string) => void) | null) {
    webllmProgressCallback = cb;
  }

  private async getEngine(modelId?: string): Promise<WebLLMEngine> {
    logger.log('[WebLLM] getEngine called with modelId:', modelId);
    logger.log('[WebLLM] Current engine state:', JSON.stringify({
      hasEngine: !!this.engine,
      currentModel: this.currentModel,
      isLoading: !!this.loadingPromise,
    }));

    // Check for cached engine
    const cachedEngine = getCachedEngine(this);
    if (cachedEngine) {
      logger.log('[WebLLM] Reusing existing engine for model:', this.currentModel);
      return cachedEngine;
    }

    if (typeof window === 'undefined') {
      throw new Error('[WebLLM] Engine cannot be created on the server');
    }

    // If already loading, return the existing promise
    if (this.loadingPromise) {
      logger.log('[WebLLM] Engine load already in progress, waiting...');
      return this.loadingPromise;
    }

    // Start loading process
    logger.log('[WebLLM] Starting engine creation...');
    this.loadingPromise = this.createEngine(modelId);

    return this.loadingPromise;
  }

  /**
   * Creates a new WebLLM engine instance
   */
  private async createEngine(modelId?: string): Promise<WebLLMEngine> {
    try {
      // Load WebLLM module
      const webllm = await loadWebLLMModule();

      // Small delay to ensure module is fully initialized
      await new Promise(resolve => setTimeout(resolve, 200));

      // Find available model
      const effectiveModel = findAvailableModel(
        webllm,
        modelId || this.options?.model
      );
      logger.log('[WebLLM] Using model:', effectiveModel);

      // Create engine config
      const engineConfig = createEngineConfig(this.persistence, webllm);

      // Create engine
      logger.log(`[WebLLM] Calling CreateMLCEngine with model: ${effectiveModel}`);
      const engine = await webllm.CreateMLCEngine(effectiveModel, engineConfig);
      logger.log('[WebLLM] CreateMLCEngine returned successfully, engine: ' + String(!!engine));

      // Store engine
      this.engine = engine;
      this.currentModel = effectiveModel;
      // BUG-7 Fix: Also update module-level variables for static clearCache method
      currentWebLLMEngine = engine;
      currentWebLLMModel = effectiveModel;
      logger.log('[WebLLM] Engine stored successfully');
      return engine;
    } catch (error) {
      this.loadingPromise = null;
      logger.error('[WebLLM] Engine creation failed:', error instanceof Error ? error.message : String(error));
      logger.error('[WebLLM] Error details:', JSON.stringify({
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'unknown',
      }));
      throw error;
    } finally {
      this.loadingPromise = null;
    }
  }

  async generateContent({
    model,
    contents,
    systemMessage,
    config,
    signal,
    requestId: passedRequestId,
    traceId: passedTraceId,
  }: {
    model?: string;
    contents: string;
    systemMessage?: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
    requestId?: string;
    traceId?: string;
  }): Promise<GenerateContentResponse> {
    logger.log('[WebLLM] generateContent called');
    
    const { requestId, traceId } = resolveCorrelationIds(passedRequestId, passedTraceId);
    
    logger.info('AI request initiated', 'ai-router', { 
      requestId, 
      traceId,
      provider: 'webllm', 
      model: model || 'auto',
      contentLength: contents.length 
    });
    
    const engine = await this.getEngine(model);
    
    // SEC-6 Fix: Apply prompt injection protection
    const protectedContents = protectUserAction(contents);
    const messages = [{ role: 'user', content: protectedContents.sanitized + '\n\n' + PROMPT_INJECTION_DEFENSE }];
    
    logger.log('[WebLLM] Sending chat completion request...');
    // Type assertion for the engine since we know it has chat.completions.create
    const engineWithChat = engine as WebLLMEngineWithChat;
    
    try {
      const response = await engineWithChat.chat.completions.create({
        messages,
        temperature: config?.temperature,
        top_p: config?.topP,
        stream: false,
      }) as WebLLMChatResponse;
      
      logger.log('[WebLLM] Chat completion response received');
      const text = response.choices?.[0]?.message?.content;
      if (!text) throw new Error('No text returned from WebLLM');
      
      logger.info('AI request completed', 'ai-router', { 
        requestId, 
        traceId,
        responseLength: text.length 
      });
      
      return { text };
    } catch (error) {
      // OBS-9 Fix: Include context in error logs for reproducibility
      logger.error('[WebLLM] AI request failed', 'ai-router', { 
        requestId, 
        traceId,
        provider: 'webllm',
        model: model || 'auto',
        error: error instanceof Error ? error.message : String(error),
        inputContext: {
          contentLength: contents.length,
          config: config ? {
            temperature: config.temperature,
            topP: config.topP,
            topK: config.topK,
          } : undefined,
        },
        operation: 'generateContent',
      });
      throw error;
    }
  }

  async *generateContentStream({
    model,
    contents,
    systemMessage,
    config,
    signal,
    requestId: passedRequestId,
    traceId: passedTraceId,
  }: {
    model?: string;
    contents: string;
    systemMessage?: string;
    config?: GenerateContentConfig;
    signal?: AbortSignal;
    requestId?: string;
    traceId?: string;
  }): AsyncIterable<string> {
    logger.log('[WebLLM] generateContentStream called');
    
    const { requestId, traceId } = resolveCorrelationIds(passedRequestId, passedTraceId);
    
    logger.info('AI streaming request initiated', 'ai-router', { 
      requestId, 
      traceId,
      provider: 'webllm', 
      model: model || 'auto',
      contentLength: contents.length 
    });
    
    const engine = await this.getEngine(model);
    
    // SEC-6 Fix: Apply prompt injection protection
    const protectedContents = protectUserAction(contents);
    const messages = [{ role: 'user', content: protectedContents.sanitized + '\n\n' + PROMPT_INJECTION_DEFENSE }];
    
    logger.log('[WebLLM] Creating streaming chat completion...');
    // Type assertion for the engine
    const engineWithChat = engine as WebLLMEngineWithChat;
    
    // ERR-4 Fix: Track accumulated text for error reporting - declare outside try block
    let accumulatedText = '';
    
    try {
      const stream = await engineWithChat.chat.completions.create({
        messages,
        temperature: config?.temperature,
        top_p: config?.topP,
        stream: true,
      }) as AsyncIterable<WebLLMStreamChunk>;
      
      logger.log('[WebLLM] Stream created');
      
      for await (const chunk of stream) {
        if (signal?.aborted) {
          logger.log('[WebLLM] Stream aborted');
          break;
        }
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          accumulatedText += content; // ERR-4 Fix: Accumulate text
          yield content;
        }
      }
      
      logger.log('[WebLLM] Stream completed');
      logger.info('AI streaming completed', 'ai-router', { 
        requestId, 
        traceId,
        accumulatedLength: accumulatedText.length 
      });
      
    } catch (error) {
      // OBS-9 Fix: Include context in error logs for reproducibility
      const errorMessage = error instanceof Error ? error.message : 'Stream processing error';
      logger.error('[WebLLM] AI streaming request failed', 'ai-router', { 
        requestId, 
        traceId,
        provider: 'webllm',
        model: model || 'auto',
        error: errorMessage,
        inputContext: {
          contentLength: contents.length,
          config: config ? {
            temperature: config.temperature,
            topP: config.topP,
            topK: config.topK,
          } : undefined,
        },
        operation: 'generateContentStream',
        accumulatedText: accumulatedText?.substring(0, 500) || 'none'
      });
      throw new Error(`${errorMessage}\n\nPartial response received: ${accumulatedText?.substring(0, 500) || 'none'}`);
    }
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
    logger.log('[WebLLM] checkHardware called');
    if (typeof window === 'undefined') return { webgpu: false, memory: 0 };
    const webgpu = 'gpu' in navigator;
    // navigator.deviceMemory is not in the standard TypeScript types
    const memory = (navigator as { deviceMemory?: number }).deviceMemory || 4;
    logger.log('[WebLLM] Hardware:', JSON.stringify({ webgpu, memory }));
    return { webgpu, memory };
  }

  static async clearCache(): Promise<void> {
    logger.log('[WebLLM] clearCache called');
    if (typeof window === 'undefined') return;
    try {
      const dbs = await indexedDB.databases();
      logger.log('[WebLLM] IndexedDB databases:', dbs.map(db => db.name).join(', '));
      for (const db of dbs) {
        if (db.name?.includes('webllm') || db.name?.includes('mlc')) {
          logger.log('[WebLLM] Deleting database:', db.name);
          indexedDB.deleteDatabase(db.name!);
        }
      }
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        logger.log('[WebLLM] Cache storage keys:', cacheNames.join(', '));
        for (const name of cacheNames) {
          if (name.includes('webllm') || name.includes('mlc')) {
            logger.log('[WebLLM] Deleting cache:', name);
            await caches.delete(name);
          }
        }
      }
      // BUG-7 Fix: Use module-level variables instead of static properties
      currentWebLLMEngine = null;
      currentWebLLMModel = '';
      logger.log('[WebLLM] Cache cleared');
    } catch (error) {
      logger.error('[WebLLM] Failed to clear cache:', error instanceof Error ? error.message : String(error));
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}

export async function clearWebLLMCache(): Promise<void> {
  logger.log('[WebLLM] clearWebLLMCache called');
  await WebLLMProvider.clearCache();
}

class WebLLMStubProvider implements AIProvider {
  async generateContent({
    requestId: passedRequestId,
    traceId: passedTraceId,
  }: {
    requestId?: string;
    traceId?: string;
  } = {}): Promise<GenerateContentResponse> {
    // OBS-6/7: Log with correlation IDs even for stub
    const requestId = passedRequestId || generateRequestId();
    const traceId = passedTraceId || getTraceId() || generateRequestId();
    
    logger.error('WebLLM is not installed', 'ai-router', { 
      requestId, 
      traceId,
      provider: 'webllm-stub',
      operation: 'generateContent',
    });
    throw new Error('WebLLM is not installed. Please install @mlc-ai/web-llm to use local AI.');
  }
  
  async *generateContentStream({
    requestId: passedRequestId,
    traceId: passedTraceId,
  }: {
    requestId?: string;
    traceId?: string;
  } = {}): AsyncIterable<string> {
    // OBS-6/7: Log with correlation IDs even for stub
    const requestId = passedRequestId || generateRequestId();
    const traceId = passedTraceId || getTraceId() || generateRequestId();
    
    logger.error('WebLLM is not installed', 'ai-router', { 
      requestId, 
      traceId,
      provider: 'webllm-stub',
      operation: 'generateContentStream',
    });
    throw new Error('WebLLM is not installed. Please install @mlc-ai/web-llm to use local AI.');
  }
}

export function getAIProvider(
  providerType: ProviderType = routerConfig.defaultProvider,
  apiKey?: string | null
): AIProvider {
  logger.log('[AI Router] getAIProvider called with:', providerType);
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
      logger.log('[AI Router] Creating WebLLM provider', 'ai-router', { webllmAvailable });
      if (webllmAvailable) {
        return new WebLLMProvider({ onProgress: webllmProgressCallback || undefined });
      } else {
        logger.warn('[AI Router] WebLLM not available, returning stub');
        return new WebLLMStubProvider();
      }
    default:
      throw new Error(`Unsupported AI provider: ${providerType}`);
  }
}

export class GenAIClient {
  private provider: AIProvider;

  constructor(userApiKey?: string | null, options?: { model?: string; persistence?: 'temporary' | 'persistent'; onProgress?: (progress: number, text: string) => void }) {
    logger.log('[GenAIClient] Constructor called');
    if (userApiKey) {
      this.provider = getAIProvider(routerConfig.defaultProvider, userApiKey);
    } else {
      if (routerConfig.defaultProvider === 'webllm' && options) {
        logger.log('[GenAIClient] Creating WebLLM provider', 'ai-router', { options });
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
    generateContent: async (params: GenerateContentParams): Promise<GenerateContentResponse> => {
      logger.log('[GenAIClient] generateContent called');
      return this.provider.generateContent(params);
    },
    generateContentStream: (params: GenerateContentParams): AsyncIterable<string> => {
      logger.log('[GenAIClient] generateContentStream called');
      return this.provider.generateContentStream(params);
    },
  };
}

export function getClient(userApiKey?: string | null, options?: { model?: string; persistence?: 'temporary' | 'persistent'; onProgress?: (progress: number, text: string) => void }): GenAIClient {
  logger.log('[AI Router] getClient called');
  return new GenAIClient(userApiKey, options);
}

export { WebLLMProvider };