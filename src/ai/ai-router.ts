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
  }): Promise<GenerateContentResponse>;

  generateContentStream(params: {
    model: string;
    contents: string;
    config?: GenerateContentConfig;
  }): AsyncIterable<string>;
}

export type ProviderType = 'gemini' | 'openai' | 'claude' | 'deepseek';

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
  }: {
    model: string;
    contents: string;
    config?: GenerateContentConfig;
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
  }: {
    model: string;
    contents: string;
    config?: GenerateContentConfig;
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
  }: {
    model: string;
    contents: string;
    config?: GenerateContentConfig;
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
  }: {
    model: string;
    contents: string;
    config?: GenerateContentConfig;
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
  }: {
    model: string;
    contents: string;
    config?: GenerateContentConfig;
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
  }: {
    model: string;
    contents: string;
    config?: GenerateContentConfig;
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
  }: {
    model: string;
    contents: string;
    config?: GenerateContentConfig;
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
  }: {
    model: string;
    contents: string;
    config?: GenerateContentConfig;
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
    default:
      throw new Error(`Unsupported AI provider: ${providerType}`);
  }
}

export class GenAIClient {
  private provider: AIProvider;

  constructor(userApiKey?: string | null) {
    // If an explicit user API key is passed, use it with the default provider.
    // Otherwise, use the configured provider with its own stored key.
    if (userApiKey) {
      this.provider = getAIProvider(routerConfig.defaultProvider, userApiKey);
    } else {
      this.provider = getAIProvider(routerConfig.defaultProvider);
    }
  }

  models = {
    generateContent: async (params: {
      model: string;
      contents: string;
      config?: GenerateContentConfig;
    }): Promise<GenerateContentResponse> => {
      return this.provider.generateContent(params);
    },
    generateContentStream: (params: {
      model: string;
      contents: string;
      config?: GenerateContentConfig;
    }): AsyncIterable<string> => {
      return this.provider.generateContentStream(params);
    },
  };
}

export function getClient(userApiKey?: string | null): GenAIClient {
  return new GenAIClient(userApiKey);
}