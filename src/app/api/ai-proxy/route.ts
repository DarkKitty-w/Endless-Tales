// src/app/api/ai-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Simple in-memory rate limiting (per-process, resets on server restart)
// For production, use a proper rate limiting solution like Redis
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

function getClientIp(request: NextRequest): string {
  // Try to get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfIp = request.headers.get('cf-connecting-ip');
  
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIp) return realIp;
  if (cfIp) return cfIp;
  return 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    // New window
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
  }
  
  record.count++;
  return { allowed: true };
}

// Validate and sanitize input
function validateInput(body: any): { valid: boolean; error?: string } {
  // Check required fields
  if (!body.provider) {
    return { valid: false, error: 'Missing provider field' };
  }
  
  // Validate provider
  const validProviders = ['gemini', 'openai', 'claude', 'deepseek', 'openrouter', 'webllm'];
  if (!validProviders.includes(body.provider)) {
    return { valid: false, error: 'Invalid provider' };
  }
  
  // Validate contents
  if (!body.contents && body.provider !== 'webllm') {
    return { valid: false, error: 'Missing contents field' };
  }
  
  // Check contents size (max 100KB)
  const contentsStr = typeof body.contents === 'string' ? body.contents : JSON.stringify(body.contents);
  if (contentsStr.length > 100 * 1024) {
    return { valid: false, error: 'Contents too large (max 100KB)' };
  }
  
  // Validate model if provided
  if (body.model && typeof body.model !== 'string') {
    return { valid: false, error: 'Invalid model field' };
  }
  
  // Validate config if provided
  if (body.config && typeof body.config !== 'object') {
    return { valid: false, error: 'Invalid config field' };
  }
  
  return { valid: true };
}

// Sanitize error messages for production
function sanitizeErrorMessage(error: any): string {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // In development, return detailed error
    return error instanceof Error ? error.message : String(error);
  }
  
  // In production, use generic messages
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Check for common error patterns and return generic messages
    if (message.includes('api key') || message.includes('unauthorized') || message.includes('401')) {
      return 'Authentication failed. Please check your API configuration.';
    }
    if (message.includes('quota') || message.includes('billing') || message.includes('429')) {
      return 'Service temporarily unavailable due to quota limits.';
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'Too many requests. Please try again later.';
    }
    if (message.includes('invalid') && message.includes('request')) {
      return 'Invalid request. Please check your input.';
    }
  }
  
  return 'An error occurred while processing your request. Please try again.';
}

export async function POST(request: NextRequest) {
  try {
    // Check content length for payload size limit (SEC-10)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 100 * 1024) {  // 100KB limit
      return NextResponse.json(
        { error: 'Request too large (max 100KB)' },
        { status: 413 }
      );
    }

    // Check rate limit (SEC-2)
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    const body = await request.json();
    
    // Validate input (SEC-2)
    const validation = validateInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid request' },
        { status: 400 }
      );
    }
    
    const { provider, model, contents, config, userApiKey, stream, systemMessage } = body;

    // Determine which API key to use
    const apiKey = userApiKey || getServerApiKey(provider);
    
    if (!apiKey && provider !== 'webllm') {
      // SEC-9: Use generic error message in production
      const isDev = process.env.NODE_ENV === 'development';
      const errorMessage = isDev 
        ? `API key not configured. Please check your settings.`
        : `API key not configured. Please check your settings.`;
      return NextResponse.json(
        { error: errorMessage },
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
    console.error('AI Proxy error:', error);
    // SEC-4: Sanitize error messages before returning to client
    const sanitizedMessage = sanitizeErrorMessage(error);
    return NextResponse.json(
      { error: sanitizedMessage },
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
    console.error('Gemini API error:', response.status, errorText);
    // SEC-4: Sanitize error messages
    const sanitizedMessage = process.env.NODE_ENV === 'development' 
      ? `Gemini API error: ${response.status}` 
      : 'AI service error. Please try again.';
    return NextResponse.json(
      { error: sanitizedMessage },
      { status: response.status }
    );
  }

  if (stream) {
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = new TextDecoder().decode(value, { stream: true });
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.trim()) {
                controller.enqueue(encoder.encode(`data: ${line}\n\n`));
              }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (e) {
          console.error('Streaming error:', e);
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
    console.error(`${providerName} API error:`, response.status, error);
    // SEC-4: Sanitize error messages
    const sanitizedMessage = process.env.NODE_ENV === 'development' 
      ? `${providerName} API error: ${error.error?.message || response.status}`
      : 'AI service error. Please try again.';
    return NextResponse.json(
      { error: sanitizedMessage },
      { status: response.status }
    );
  }

  if (stream) {
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = new TextDecoder().decode(value, { stream: true });
            const lines = text.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const data = trimmed.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: content }] } }] })}\n\n`));
                  }
                } catch (e) {
                  // ignore malformed JSON
                }
              }
            }
          }
        } catch (e) {
          console.error('Streaming error:', e);
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
    console.error('Claude API error:', response.status, error);
    // SEC-4: Sanitize error messages
    const sanitizedMessage = process.env.NODE_ENV === 'development' 
      ? `Claude API error: ${error.error?.message || response.status}`
      : 'AI service error. Please try again.';
    return NextResponse.json(
      { error: sanitizedMessage },
      { status: response.status }
    );
  }

  if (stream) {
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const text = new TextDecoder().decode(value, { stream: true });
            const lines = text.split('\n');
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                const data = trimmed.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  break;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.type === 'content_block_delta') {
                    const text = parsed.delta?.text;
                    if (text) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] })}\n\n`));
                    }
                  }
                } catch (e) {
                  // ignore malformed JSON
                }
              }
            }
          }
        } catch (e) {
          console.error('Streaming error:', e);
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