// src/app/api/ai-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Server-side API keys (never exposed to client)
const API_KEYS = {
  gemini: process.env.GEMINI_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  claude: process.env.CLAUDE_API_KEY,
  deepseek: process.env.DEEPSEEK_API_KEY,
  openrouter: process.env.OPENROUTER_API_KEY,
};

// Provider configurations
const PROVIDER_CONFIGS = {
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
  },
  claude: {
    baseUrl: 'https://api.anthropic.com/v1',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
  },
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
  },
};

function getEnvVarName(provider) {
  const envVarMap = {
    gemini: 'GEMINI_API_KEY',
    openai: 'OPENAI_API_KEY',
    claude: 'CLAUDE_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
  };
  return envVarMap[provider] || 'API_KEY';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { provider = 'gemini', model, contents, config, stream } = body;

    if (!PROVIDER_CONFIGS[provider]) {
      return NextResponse.json(
        { error: 'Unsupported provider: ' + provider },
        { status: 400 }
      );
    }

    const apiKey = API_KEYS[provider];
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured for provider: ' + provider + '. Please set the ' + getEnvVarName(provider) + ' environment variable.' },
        { status: 500 }
      );
    }

    const providerConfig = PROVIDER_CONFIGS[provider];

    switch (provider) {
      case 'gemini':
        return handleGeminiRequest({ model, contents, config, apiKey, stream });
      case 'openai':
      case 'deepseek':
      case 'openrouter':
        return handleOpenAICompatibleRequest({ provider, model, contents, config, apiKey, stream, baseUrl: providerConfig.baseUrl });
      case 'claude':
        return handleClaudeRequest({ model, contents, config, apiKey, stream });
      default:
        return NextResponse.json(
          { error: 'Unsupported provider: ' + provider },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI Proxy error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleGeminiRequest({ model, contents, config, apiKey, stream }) {
  const endpoint = stream ? 'streamGenerateContent' : 'generateContent';
  const url = `${PROVIDER_CONFIGS.gemini.baseUrl}/models/${model}:${endpoint}?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : contents,
      ...(config && { generationConfig: config }),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    return NextResponse.json(
      { error: 'Gemini API error: ' + response.status },
      { status: response.status }
    );
  }

  if (stream) {
    return createGeminiStreamResponse(response);
  } else {
    const data = await response.json();
    return NextResponse.json(data);
  }
}

async function handleOpenAICompatibleRequest({ provider, model, contents, config, apiKey, stream, baseUrl }) {
  const messages = typeof contents === 'string' 
    ? [{ role: 'user', content: contents }]
    : contents;

  const body = {
    model,
    messages,
    stream: !!stream,
  };

  if (config?.temperature !== undefined) body.temperature = config.temperature;
  if (config?.topP !== undefined) body.top_p = config.topP;
  if (config?.responseMimeType === 'application/json') {
    body.response_format = { type: 'json_object' };
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
    headers['X-Title'] = 'Endless Tales';
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    console.error(`${provider} API error:`, response.status, error);
    return NextResponse.json(
      { error: `${provider} API error: ${error.error?.message || response.status}` },
      { status: response.status }
    );
  }

  if (stream) {
    return createOpenAIStreamResponse(response);
  } else {
    const data = await response.json();
    return NextResponse.json(data);
  }
}

async function handleClaudeRequest({ model, contents, config, apiKey, stream }) {
  const messages = typeof contents === 'string'
    ? [{ role: 'user', content: contents }]
    : contents;

  const body = {
    model,
    max_tokens: 4096,
    messages,
    stream: !!stream,
  };

  if (config?.temperature !== undefined) body.temperature = config.temperature;
  if (config?.topP !== undefined) body.top_p = config.topP;

  const response = await fetch(`${PROVIDER_CONFIGS.claude.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    console.error('Claude API error:', response.status, error);
    return NextResponse.json(
      { error: `Claude API error: ${error.error?.message || response.status}` },
      { status: response.status }
    );
  }

  if (stream) {
    return createClaudeStreamResponse(response);
  } else {
    const data = await response.json();
    return NextResponse.json(data);
  }
}

function createGeminiStreamResponse(response) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            if (line.trim()) {
              controller.enqueue(encoder.encode(`data: ${line}\n\n`));
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (e) {
        console.error('Gemini streaming error:', e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function createOpenAIStreamResponse(response) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              controller.enqueue(encoder.encode(`${trimmed}\n\n`));
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (e) {
        console.error('OpenAI streaming error:', e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function createClaudeStreamResponse(response) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              controller.enqueue(encoder.encode(`${trimmed}\n\n`));
            }
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (e) {
        console.error('Claude streaming error:', e);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
