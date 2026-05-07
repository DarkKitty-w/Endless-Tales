// src/app/api/ai-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { logger, generateRequestId, getCurrentRequestId, setRequestId, setTraceId, getTraceId } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limit';

// ERR-7 Fix: Timeout for AI requests (30 seconds)
const AI_TIMEOUT = 30000;
function getTimeoutSignal(): AbortSignal {
  return AbortSignal.timeout(AI_TIMEOUT);
}

// Security: Allowed providers to prevent unauthorized access
const ALLOWED_PROVIDERS = ['gemini', 'openai', 'claude', 'deepseek', 'openrouter', 'webllm'];

// SEC-11 Fix: Validate and sanitize model parameters
interface ValidatedConfig {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  responseMimeType?: string;
  candidateCount?: number;
  stopSequences?: string[];
}

function validateModelConfig(config: any): ValidatedConfig | null {
  if (!config || typeof config !== 'object') {
    return {};
  }

  const validated: ValidatedConfig = {};

  // Validate temperature (0 to 2, default providers' range)
  if (config.temperature !== undefined) {
    const temp = Number(config.temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      logger.warn('Invalid temperature value rejected:', config.temperature);
    } else {
      validated.temperature = temp;
    }
  }

  // Validate topP (0 to 1)
  if (config.topP !== undefined) {
    const topP = Number(config.topP);
    if (isNaN(topP) || topP < 0 || topP > 1) {
      logger.warn('Invalid topP value rejected:', config.topP);
    } else {
      validated.topP = topP;
    }
  }

  // Validate maxTokens (reasonable limits: 1 to 100000)
  if (config.maxTokens !== undefined) {
    const maxTokens = parseInt(String(config.maxTokens), 10);
    if (isNaN(maxTokens) || maxTokens < 1 || maxTokens > 100000) {
      logger.warn('Invalid maxTokens value rejected:', config.maxTokens);
    } else {
      validated.maxTokens = maxTokens;
    }
  }

  // Validate candidateCount (1 to 8)
  if (config.candidateCount !== undefined) {
    const count = parseInt(String(config.candidateCount), 10);
    if (isNaN(count) || count < 1 || count > 8) {
      logger.warn('Invalid candidateCount value rejected:', config.candidateCount);
    } else {
      validated.candidateCount = count;
    }
  }

  // Validate responseMimeType (only allow application/json)
  if (config.responseMimeType !== undefined) {
    if (config.responseMimeType === 'application/json') {
      validated.responseMimeType = 'application/json';
    } else {
      logger.warn('Invalid responseMimeType rejected:', config.responseMimeType);
    }
  }

  // Validate stopSequences (max 10 sequences, each max 100 chars)
  if (Array.isArray(config.stopSequences)) {
    const validSequences = config.stopSequences
      .filter((s: unknown) => typeof s === 'string' && s.length <= 100)
      .slice(0, 10);
    if (validSequences.length > 0) {
      validated.stopSequences = validSequences;
    }
  }

  return validated;
}

export async function POST(request: NextRequest) {
  // Generate or extract request ID and trace ID for correlation
  const body = await request.json();
  const { provider, model, contents, config: rawConfig, stream, systemMessage, requestId: clientRequestId, traceId: clientTraceId } = body;
  
  // Use client-provided requestId or generate a new one
  const requestId = clientRequestId || generateRequestId();
  setRequestId(requestId);
  
  // For traceId, use client-provided or generate a new one (traceId persists across related requests)
  const traceId = clientTraceId || generateRequestId(); // In production, use a proper trace ID generation
  setTraceId(traceId);
  
  // Log the incoming request with requestId and traceId
  logger.info('AI Proxy request received', 'ai-proxy', { 
    requestId, 
    traceId,
    provider, 
    model,
    stream,
    contentLength: typeof contents === 'string' ? contents.length : JSON.stringify(contents).length
  });

  // SEC-4 Fix: Apply rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
  const rateLimitResult = checkRateLimit(clientIp);
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.reset),
          'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
        }
      }
    );
  }

  try {
    // SEC-5 Fix: Validate provider input
    if (!provider || !ALLOWED_PROVIDERS.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid or missing provider parameter.' },
        { status: 400 }
      );
    }

    // SEC-11 Fix: Validate and sanitize model parameters
    const config = validateModelConfig(rawConfig);

    // Only use server-side API keys (security fix: no client-side API keys)
    const apiKey = getServerApiKey(provider) as string;
    
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
        { error: `${providerName} API key not configured. Please contact the administrator.` },
        { status: 401 }
      );
    }

    switch (provider) {
      case 'gemini':
        return handleGemini(model as string | undefined, contents, config as any, apiKey, stream, systemMessage as string | undefined);
      case 'openai':
        return handleOpenAI(model as string | undefined, contents, config as any, apiKey, stream, systemMessage as string | undefined);
      case 'claude':
        return handleClaude(model as string | undefined, contents, config as any, apiKey, stream, systemMessage as string | undefined);
      case 'deepseek':
        return handleDeepSeek(model as string | undefined, contents, config as any, apiKey, stream, systemMessage as string | undefined);
      case 'openrouter':
        return handleOpenRouter(model as string | undefined, contents, config as any, apiKey, stream, systemMessage as string | undefined);
      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400 }
        );
    }
  } catch (error: unknown) {
    const requestId = getCurrentRequestId();
    const traceId = getTraceId();
    
    logger.error('AI Proxy error:', 'ai-proxy', { 
      error: error instanceof Error ? error.message : String(error),
      requestId,
      traceId
    });
    
    // ERR-7 Fix: Handle timeout errors with specific message
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'AI request timed out. Please try again later.', requestId, traceId },
        { status: 504 }
      );
    }
    
    // ERR-9 Fix: Differentiate network errors from API errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error (connection refused, DNS failure, etc.)
      logger.error('Network error in AI Proxy:', 'ai-proxy', { 
        message: error instanceof Error ? error.message : String(error),
        requestId,
        traceId
      });
      return NextResponse.json(
        { error: 'Network connection failed. Please check your internet connection and try again.', requestId, traceId },
        { status: 503 }
      );
    }
    
    // ERR-9 Fix: Check for AbortError (request was aborted)
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'AI request was cancelled. Please try again.', requestId, traceId },
        { status: 499 }
      );
    }
    
    // SEC-3 Fix: Sanitize error messages sent to clients
    // Only return generic error messages, log detailed errors server-side only
    return NextResponse.json(
      { error: 'AI request failed. Please try again later.', requestId, traceId },
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
  
  const requestId = getCurrentRequestId();
  const traceId = getTraceId();

  const body: any = {
    contents: typeof contents === 'string' ? [{ parts: [{ text: contents }] }] : contents,
  };

  // Add system instruction for Gemini
  if (systemMessage) {
    body.systemInstruction = { parts: [{ text: systemMessage }] };
  }

  // SEC-11 Fix: Use validated config parameters only
  if (config && Object.keys(config).length > 0) {
    const generationConfig: any = {};
    
    if (config.temperature !== undefined) generationConfig.temperature = config.temperature;
    if (config.topP !== undefined) generationConfig.topP = config.topP;
    if (config.maxTokens !== undefined) generationConfig.maxOutputTokens = config.maxTokens;
    if (config.candidateCount !== undefined) generationConfig.candidateCount = config.candidateCount;
    if (config.stopSequences !== undefined) generationConfig.stopSequences = config.stopSequences;
    
    if (Object.keys(generationConfig).length > 0) {
      body.generationConfig = generationConfig;
    }
  }

  if (stream) {
    body.generationConfig = { ...body.generationConfig, stream: true };
  }

  // OBS-10 Fix: Log outgoing request details
  const requestStartTime = Date.now();
  logger.info('Gemini API request', 'ai-proxy', {
    requestId,
    traceId,
    provider: 'gemini',
    model: effectiveModel,
    stream,
    promptLength: typeof contents === 'string' ? contents.length : JSON.stringify(contents).length,
    config: body.generationConfig ? { ...body.generationConfig, apiKey: undefined } : undefined
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    // ERR-7 Fix: Add timeout signal
    signal: getTimeoutSignal(),
  });

  const duration = Date.now() - requestStartTime;

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'AI request failed. Please try again later.';
    
    try {
      const errorJson = JSON.parse(errorText);
      // Gemini error structure: { error: { message, status, code } }
      if (errorJson.error?.message) {
        const geminiError = errorJson.error.message.toLowerCase();
        if (geminiError.includes('api key') || geminiError.includes('invalid')) {
          errorMessage = 'Gemini API key invalid. Please contact the administrator.';
        } else if (geminiError.includes('quota') || geminiError.includes('exceeded')) {
          errorMessage = 'Gemini quota exceeded. Please try again later.';
        } else if (geminiError.includes('rate limit')) {
          errorMessage = 'Gemini rate limit exceeded. Please try again later.';
        } else {
          errorMessage = 'Gemini request failed. Please try again later.';
        }
      }
    } catch {
      // If we can't parse the error, use the generic message
    }
    
    // OBS-10 Fix: Log API error with context
    logger.error('Gemini API error', 'ai-proxy', {
      requestId,
      traceId,
      status: response.status,
      duration,
      error: errorText.substring(0, 500), // Truncate to avoid log overload
      provider: 'gemini',
      model: effectiveModel
    });
    
    // SEC-3 Fix: Sanitize error messages sent to clients
    return NextResponse.json(
      { error: errorMessage, requestId, traceId },
      { status: 500 }
    );
  }

  // OBS-10 Fix: Log successful response
  logger.info('Gemini API response', 'ai-proxy', {
    requestId,
    traceId,
    status: response.status,
    duration,
    provider: 'gemini',
    model: effectiveModel,
    stream
  });

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
    // ERR-2 Fix: Preserve raw response text when parsing
    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      
      // OBS-10 Fix: Log response details
      const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      logger.info('Gemini API response parsed', 'ai-proxy', {
        requestId,
        traceId,
        responseLength: extractedText.length,
        candidateCount: data.candidates?.length || 0
      });
      
      return NextResponse.json(data);
    } catch (parseError) {
      logger.error('Failed to parse Gemini response as JSON', 'ai-proxy', {
        requestId,
        traceId,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        rawResponse: responseText.substring(0, 500)
      });
      return NextResponse.json(
        { 
          error: 'Invalid response from Gemini API (not valid JSON)', 
          requestId,
          traceId,
          rawResponse: responseText.substring(0, 1000) // Include first 1000 chars for debugging
        },
        { status: 500 }
      );
    }
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
  
  const requestId = getCurrentRequestId();
  const traceId = getTraceId();

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

  // SEC-11 Fix: Use validated config parameters only
  if (config) {
    if (config.temperature !== undefined) body.temperature = config.temperature;
    if (config.topP !== undefined) body.top_p = config.topP;
    if (config.maxTokens !== undefined) body.max_tokens = config.maxTokens;
    if (config.responseMimeType === 'application/json') {
      body.response_format = { type: 'json_object' };
    }
    if (config.stopSequences !== undefined) body.stop = config.stopSequences;
  }

  // OBS-10 Fix: Log outgoing request details (mask API key in logs)
  const requestStartTime = Date.now();
  logger.info(`${providerName} API request`, 'ai-proxy', {
    requestId,
    traceId,
    provider: providerName.toLowerCase(),
    model: effectiveModel,
    stream,
    messageCount: messages.length,
    promptLength: JSON.stringify(messages).length
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    // ERR-7 Fix: Add timeout signal
    signal: getTimeoutSignal(),
  });

  const duration = Date.now() - requestStartTime;

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'AI request failed. Please try again later.';
    
    try {
      const errorJson = JSON.parse(errorText);
      // OpenAI-compatible error structure: { error: { message, type, code } }
      if (errorJson.error?.message) {
        const providerError = errorJson.error.message.toLowerCase();
        const providerType = providerName.toLowerCase();
        
        if (providerError.includes('api key') || providerError.includes('invalid') || providerError.includes('incorrect')) {
          errorMessage = `${providerName} API key invalid. Please contact the administrator.`;
        } else if (providerError.includes('quota') || providerError.includes('exceeded')) {
          errorMessage = `${providerName} quota exceeded. Please try again later.`;
        } else if (providerError.includes('rate limit')) {
          errorMessage = `${providerName} rate limit exceeded. Please try again later.`;
        } else if (providerError.includes('model') && providerError.includes('not found')) {
          errorMessage = `${providerName} model not found. Please contact the administrator.`;
        } else {
          errorMessage = `${providerName} request failed. Please try again later.`;
        }
      }
    } catch {
      // If we can't parse the error, use the generic message
    }
    
    // OBS-10 Fix: Log API error with context
    logger.error(`${providerName} API error`, 'ai-proxy', {
      requestId,
      traceId,
      status: response.status,
      duration,
      error: errorText.substring(0, 500),
      provider: providerName.toLowerCase(),
      model: effectiveModel
    });
    
    // SEC-3 Fix: Sanitize error messages sent to clients
    return NextResponse.json(
      { error: errorMessage, requestId, traceId },
      { status: 500 }
    );
  }

  // OBS-10 Fix: Log successful response
  logger.info(`${providerName} API response`, 'ai-proxy', {
    requestId,
    traceId,
    status: response.status,
    duration,
    provider: providerName.toLowerCase(),
    model: effectiveModel,
    stream
  });

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
    // ERR-2 Fix: Preserve raw response text when parsing
    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      
      // OBS-10 Fix: Log response details
      const extractedText = data.choices?.[0]?.message?.content || '';
      logger.info(`${providerName} API response parsed`, 'ai-proxy', {
        requestId,
        traceId,
        responseLength: extractedText.length,
        choiceCount: data.choices?.length || 0
      });
      
      return NextResponse.json(data);
    } catch (parseError) {
      logger.error(`Failed to parse ${providerName} response as JSON`, 'ai-proxy', {
        requestId,
        traceId,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        rawResponse: responseText.substring(0, 500)
      });
      return NextResponse.json(
        { 
          error: `Invalid response from ${providerName} API (not valid JSON)`, 
          requestId,
          traceId,
          rawResponse: responseText.substring(0, 1000)
        },
        { status: 500 }
      );
    }
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
  const requestId = getCurrentRequestId();
  const traceId = getTraceId();
  
  const body: any = {
    model: effectiveModel,
    stream: stream || false,
  };

  // SEC-11 Fix: Use validated config parameters only
  if (config) {
    if (config.maxTokens !== undefined) body.max_tokens = config.maxTokens;
    else body.max_tokens = 4096;  // Default
    
    if (config.temperature !== undefined) body.temperature = config.temperature;
    if (config.topP !== undefined) body.top_p = config.topP;
    if (config.stopSequences !== undefined) body.stop_sequences = config.stopSequences;
  } else {
    body.max_tokens = 4096;  // Default
  }

  // Claude uses system prompt and messages array
  if (systemMessage) {
    body.system = systemMessage;
  }

  // Claude expects messages array
  body.messages = [{ role: 'user', content: typeof contents === 'string' ? contents : JSON.stringify(contents) }];

  // OBS-10 Fix: Log outgoing request details
  const requestStartTime = Date.now();
  logger.info('Claude API request', 'ai-proxy', {
    requestId,
    traceId,
    provider: 'claude',
    model: effectiveModel,
    stream,
    messageCount: body.messages.length,
    promptLength: JSON.stringify(body.messages).length
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
    // ERR-7 Fix: Add timeout signal
    signal: getTimeoutSignal(),
  });

  const duration = Date.now() - requestStartTime;

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'AI request failed. Please try again later.';
    
    try {
      const errorJson = JSON.parse(errorText);
      // Claude error structure: { type: "error", error: { type, message } }
      if (errorJson.error?.message) {
        const claudeError = errorJson.error.message.toLowerCase();
        
        if (claudeError.includes('api key') || claudeError.includes('invalid') || claudeError.includes('unauthorized')) {
          errorMessage = 'Claude API key invalid. Please contact the administrator.';
        } else if (claudeError.includes('quota') || claudeError.includes('exceeded')) {
          errorMessage = 'Claude quota exceeded. Please try again later.';
        } else if (claudeError.includes('rate limit')) {
          errorMessage = 'Claude rate limit exceeded. Please try again later.';
        } else if (claudeError.includes('model') && claudeError.includes('not found')) {
          errorMessage = 'Claude model not found. Please contact the administrator.';
        } else {
          errorMessage = 'Claude request failed. Please try again later.';
        }
      }
    } catch {
      // If we can't parse the error, use the generic message
    }
    
    // OBS-10 Fix: Log API error with context
    logger.error('Claude API error', 'ai-proxy', {
      requestId,
      traceId,
      status: response.status,
      duration,
      error: errorText.substring(0, 500),
      provider: 'claude',
      model: effectiveModel
    });
    
    // SEC-3 Fix: Sanitize error messages sent to clients
    return NextResponse.json(
      { error: errorMessage, requestId, traceId },
      { status: 500 }
    );
  }

  // OBS-10 Fix: Log successful response
  logger.info('Claude API response', 'ai-proxy', {
    requestId,
    traceId,
    status: response.status,
    duration,
    provider: 'claude',
    model: effectiveModel,
    stream
  });

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
    // ERR-2 Fix: Preserve raw response text when parsing
    const responseText = await response.text();
    try {
      const data = JSON.parse(responseText);
      
      // OBS-10 Fix: Log response details
      const extractedText = data.content?.[0]?.text || '';
      logger.info('Claude API response parsed', 'ai-proxy', {
        requestId,
        traceId,
        responseLength: extractedText.length,
      });
      
      // Transform Claude response to match our expected format
      const transformed = {
        candidates: [{
          content: {
            parts: [{
              text: extractedText
            }]
          }
        }]
      };
      return NextResponse.json(transformed);
    } catch (parseError) {
      logger.error('Failed to parse Claude response as JSON', 'ai-proxy', {
        requestId,
        traceId,
        error: parseError instanceof Error ? parseError.message : String(parseError),
        rawResponse: responseText.substring(0, 500)
      });
      return NextResponse.json(
        { 
          error: 'Invalid response from Claude API (not valid JSON)', 
          requestId,
          traceId,
          rawResponse: responseText.substring(0, 1000)
        },
        { status: 500 }
      );
    }
  }
}