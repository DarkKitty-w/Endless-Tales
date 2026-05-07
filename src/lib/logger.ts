/**
 * Structured Logger utility with JSON output, log levels, and sensitive data redaction
 * Use this instead of console.log to avoid exposing internal state in production
 */

// Log level hierarchy (lower number = more verbose)
const LOG_LEVEL_PRIORITY: Record<string, number> = {
  debug: 0,
  info: 1,
  log: 2,
  warn: 3,
  error: 4,
};

type LogLevel = keyof typeof LOG_LEVEL_PRIORITY;

interface LogEntry {
  timestamp: string;
  severity: LogLevel;
  module?: string;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  traceId?: string;
}

// Sensitive field patterns for redaction
const SENSITIVE_PATTERNS = [
  /apikey/i,
  /api_key/i,
  /password/i,
  /passwd/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /auth/i,
  /credential/i,
  /private_key/i,
];

// Fields that should always be redacted
const SENSITIVE_FIELDS = [
  'apiKey',
  'api_key',
  'password',
  'password',
  'token',
  'secret',
  'authorization',
  'Authorization',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'privateKey',
  'private_key',
];

/**
 * Deep clone and redact sensitive data from an object
 */
function redactSensitiveData(obj: any, depth: number = 0): any {
  // Prevent infinite recursion
  if (depth > 10) return '[Max depth reached]';

  if (obj === null || obj === undefined) return obj;

  // Handle strings - mask if looks like API key
  if (typeof obj === 'string') {
    // Check if string looks like an API key (long alphanumeric)
    if (obj.length > 20 && /^[A-Za-z0-9_\-\.]+$/.test(obj)) {
      return '***REDACTED***';
    }
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item, depth + 1));
  }

  // Handle objects
  if (typeof obj === 'object') {
    const redacted: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Check if key matches sensitive patterns
      const isSensitive = SENSITIVE_FIELDS.includes(key) ||
        SENSITIVE_PATTERNS.some(pattern => pattern.test(key));

      if (isSensitive) {
        redacted[key] = '***REDACTED***';
      } else {
        redacted[key] = redactSensitiveData(value, depth + 1);
      }
    }
    return redacted;
  }

  return obj;
}

/**
 * Sanitize input to prevent log injection attacks
 */
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Truncate very long strings
    const truncated = input.length > 1000 ? input.substring(0, 1000) + '...[truncated]' : input;
    // Escape newlines to prevent log injection
    return truncated.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
  }
  return input;
}

// Get configured log level from environment
function getConfiguredLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  if (envLevel && envLevel in LOG_LEVEL_PRIORITY) {
    return envLevel as LogLevel;
  }
  // Default: 'info' in production, 'debug' in development
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

// Get the numeric priority for a log level
function getLogLevelPriority(level: LogLevel): number {
  return LOG_LEVEL_PRIORITY[level] ?? 99;
}

// Check if a message at the given level should be logged
function shouldLog(level: LogLevel): boolean {
  const configuredLevel = getConfiguredLogLevel();
  const messagePriority = getLogLevelPriority(level);
  const configuredPriority = getLogLevelPriority(configuredLevel);

  return messagePriority >= configuredPriority;
}

// Store for request/trace IDs (can be set per request in server context)
let currentRequestId: string | undefined;
let currentTraceId: string | undefined;

/**
 * Get the current request ID
 */
export function getCurrentRequestId(): string | undefined {
  return currentRequestId;
}

/**
 * Set the request ID for the current context
 */
export function setRequestId(requestId: string): void {
  currentRequestId = requestId;
}

/**
 * Get the current trace ID
 */
export function getTraceId(): string | undefined {
  return currentTraceId;
}

/**
 * Set the trace ID for the current context
 */
export function setTraceId(traceId: string): void {
  currentTraceId = traceId;
}

/**
 * Generate a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format a log entry as structured JSON
 */
function formatLogEntry(
  level: LogLevel,
  message: string,
  module?: string,
  context?: Record<string, any>
): string {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    severity: level,
    message: sanitizeInput(message),
  };

  if (module) {
    entry.module = module;
  }

  if (currentRequestId) {
    entry.requestId = currentRequestId;
  }

  if (currentTraceId) {
    entry.traceId = currentTraceId;
  }

  if (context) {
    // Redact sensitive data and sanitize inputs
    entry.context = redactSensitiveData(sanitizeInput(context));
  }

  return JSON.stringify(entry);
}

interface Logger {
  log: (message: string, module?: string, context?: Record<string, any>) => void;
  warn: (message: string, module?: string, context?: Record<string, any>) => void;
  error: (message: string, module?: string, context?: Record<string, any>) => void;
  info: (message: string, module?: string, context?: Record<string, any>) => void;
  debug: (message: string, module?: string, context?: Record<string, any>) => void;
  // Helper to create a child logger with a fixed module name
  withModule: (module: string) => Logger;
}

const createLogger = (defaultModule?: string): Logger => {
  const createMethod = (level: LogLevel) => {
    return (message: string, module?: string, context?: Record<string, any>) => {
      // Always log errors, check level for others
      if (level !== 'error' && !shouldLog(level)) {
        return;
      }

      const effectiveModule = module || defaultModule;
      const formattedLog = formatLogEntry(level, message, effectiveModule, context);

      // In production, only output errors to console
      // Non-error logs in production should be sent to a logging service or suppressed
      const isProduction = process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        // In production: only log errors to console
        // In a real app, you'd send non-error logs to a logging service
        if (level === 'error') {
          console.error(formattedLog);
        }
        // Optionally: send to logging service
        // sendToLoggingService(formattedLog);
      } else {
        // In development: log everything to console with structured JSON
        switch (level) {
          case 'error':
            console.error(formattedLog);
            break;
          case 'warn':
            console.warn(formattedLog);
            break;
          case 'info':
            console.info(formattedLog);
            break;
          case 'debug':
            console.debug(formattedLog);
            break;
          default:
            console.log(formattedLog);
        }
      }
    };
  };

  const logger: Logger = {
    log: createMethod('log'),
    warn: createMethod('warn'),
    error: createMethod('error'),
    info: createMethod('info'),
    debug: createMethod('debug'),
    withModule: (module: string) => createLogger(module),
  };

  return logger;
};

export const logger = createLogger();

// Helper to generate request IDs
export function generateRequestId(): string {
  return generateUUID();
}

// Helper to create a new trace ID
export function createTraceId(): string {
  return generateUUID();
}
