// src/app/api/ai-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model, contents, config, userApiKey, stream, systemMessage } = body;

    // Determine which API key to use
    const apiKey = userApiKey || getServerApiKey(provider);
    
    if (!apiKey && provider !== 'webllm') {
      const providerLabels: Record<string, string> = {
        'gemini': 'Gemini',
        'openai': 'OpenAI',
        'claude': 'Claude',
        'deepseek': 'DeepSeek',
        'openrouter': 'OpenRouter'
      };
      const providerName = providerLabels[provider] || provider;
      return NextResponse.json(
        { error: `${providerName} API key not configured. Please add your ${providerName} API key in Settings.` },
        { status: 401 }
      );
    }

    switch (provider) {
      case 'gemini':
        return handleGemini(model, contents, config, apiKey, stream, systemMessage);
      case 'openai':
        return handleOpenAI(model, contents, config, apiKey, stream, systemMessage);
      case 'claude':
        return handleClaude(model, contents, config, apiKey, stream, systemMessage);
      case 'deepseek':
        return handleDeepSeek(model, contents, config, apiKey, stream, systemMessage);
      case 'openrouter':
        return handleOpenRouter(model, contents, config, apiKey, stream, systemMessage);
      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    logger.error('AI Proxy error:', error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

function getServerApiKey(provider: string): string | undefined {
  switch (provider) {
    case 'gemini': return process.env.GEMINI_API_KEY;
    case 'openai': return process.env.OPENAI_API_KEY;
    case 'claude': return process.env.CLAUDE_API_KEY;
    case 'deepseek': return process.env.DEEPSEEK_API_KEY;
    case 'openrouter': return process.env.OPENROUTER_API_KEY;
    default: return undefined;
  }
}

// --- Gemini Handler ---
async function handleGemini(
  model: string | undefined,
  contents: any,
  config: any,
  apiKey: string,
  stream: boolean,
  systemMessage: string | undefined
) {
  const effectiveModel = model || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${effectiveModel}:${stream ? 'streamGenerateContent' : 'generateContent'}?key=${apiKey}`;

  const body: any = {
    contents: typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : contents,
  };

  // Add system instruction for Gemini
  if (systemMessage) {
    body.systemInstruction = { parts: [{ text: systemMessage }] };
  }

  if (config) {
    body.generationConfig = config;
  }

  if (stream) {
    body.generationConfig = { ...body.generationConfig, stream: true };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Gemini API error:', response.status, errorText);
    return NextResponse.json(
      { error: `Gemini API error: ${response.status}` },
      { status: response.status }
    );
  }

  if (stream) {
    // PERF-12 fix: Pipe streaming response directly without decoding/re-encoding
    // Gemini streaming response is already in SSE format
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } else {
    const data = await response.json();
    return NextResponse.json(data);
  }
}

// --- OpenAI-compatible Handler (OpenAI, DeepSeek, OpenRouter) ---
async function handleOpenAICompatible(
  model: string | undefined,
  contents: any,
  config: any,
  apiKey: string,
  stream: boolean,
  systemMessage: string | undefined,
  baseUrl: string,
  providerName: string
) {
  const effectiveModel = model || 'gpt-4o';
  const url = `${baseUrl}/chat/completions`;

  // Build messages array with system message separation
  const messages: { role: string; content: string }[] = [];
  if (systemMessage) {
    messages.push({ role: 'system', content: systemMessage });
  }
  messages.push({ role: 'user', content: typeof contents === 'string' ? contents : JSON.stringify(contents) });

  const body: any = {
    model: effectiveModel,
    messages,
    stream: stream || false,
  };

  if (config?.temperature) body.temperature = config.temperature;
  if (config?.topP) body.top_p = config.topP;
  if (config?.responseMimeType === 'application/json') {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    logger.error(`${providerName} API error:`, response.status, error);
    return NextResponse.json(
      { error: `${providerName} API error: ${error.error?.message || response.status}` },
      { status: response.status }
    );
  }

  if (stream) {
    // PERF-12 fix: Pipe streaming response directly without decoding/re-encoding
    // OpenAI-compatible APIs return SSE format which we can pass through directly
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } else {
    const data = await response.json();
    return NextResponse.json(data);
  }
}

// --- OpenAI Handler ---
async function handleOpenAI(
  model: string | undefined,
  contents: any,
  config: any,
  apiKey: string,
  stream: boolean,
  systemMessage: string | undefined
) {
  return handleOpenAICompatible(model, contents, config, apiKey, stream, systemMessage, 'https://api.openai.com/v1', 'OpenAI');
}

// --- DeepSeek Handler ---
async function handleDeepSeek(
  model: string | undefined,
  contents: any,
  config: any,
  apiKey: string,
  stream: boolean,
  systemMessage: string | undefined
) {
  return handleOpenAICompatible(model, contents, config, apiKey, stream, systemMessage, 'https://api.deepseek.com/v1', 'DeepSeek');
}

// --- OpenRouter Handler ---
async function handleOpenRouter(
  model: string | undefined,
  contents: any,
  config: any,
  apiKey: string,
  stream: boolean,
  systemMessage: string | undefined
) {
  return handleOpenAICompatible(model, contents, config, apiKey, stream, systemMessage, 'https://openrouter.ai/api/v1', 'OpenRouter');
}

// --- Claude Handler ---
async function handleClaude(
  model: string | undefined,
  contents: any,
  config: any,
  apiKey: string,
  stream: boolean,
  systemMessage: string | undefined
) {
  const effectiveModel = model || 'claude-3-5-sonnet-20241022';
  const url = `https://api.anthropic.com/v1/messages`;

  const body: any = {
    model: effectiveModel,
    max_tokens: config?.maxTokens || 4096,
    stream: stream || false,
  };

  // Claude uses system prompt and messages array
  if (systemMessage) {
    body.system = systemMessage;
  }

  // Claude expects messages array
  body.messages = [{ role: 'user', content: typeof contents === 'string' ? contents : JSON.stringify(contents) }];

  if (config?.temperature) body.temperature = config.temperature;
  if (config?.topP) body.top_p = config.topP;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    logger.error('Claude API error:', response.status, error);
    return NextResponse.json(
      { error: `Claude API error: ${error.error?.message || response.status}` },
      { status: response.status }
    );
  }

  if (stream) {
    // PERF-12 fix: Pipe streaming response directly without decoding/re-encoding
    // Claude streaming response is already in SSE format
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } else {
    const data = await response.json();
    // Transform Claude response to match our expected format
    const transformed = {
      candidates: [{
        content: {
          parts: [{
            text: data.content?.[0]?.text || ''
          }]
        }
      }]
    };
    return NextResponse.json(transformed);
  }
}