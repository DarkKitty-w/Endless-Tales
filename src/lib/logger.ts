/**
 * Logger utility that only logs in development mode
 * Use this instead of console.log to avoid exposing internal state in production
 */

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface Logger {
  log: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  info: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

const isDev = process.env.NODE_ENV === 'development';

const createLogger = (): Logger => {
  const shouldLog = (level: LogLevel): boolean => {
    if (!isDev && level !== 'error') {
      // In production, only allow error logs
      return false;
    }
    return isDev;
  };

  return {
    log: (...args: any[]) => {
      if (shouldLog('log')) {
        console.log(...args);
      }
    },
    warn: (...args: any[]) => {
      if (shouldLog('warn')) {
        console.warn(...args);
      }
    },
    error: (...args: any[]) => {
      // Always log errors, even in production
      console.error(...args);
    },
    info: (...args: any[]) => {
      if (shouldLog('info')) {
        console.info(...args);
      }
    },
    debug: (...args: any[]) => {
      if (shouldLog('debug')) {
        console.debug(...args);
      }
    },
  };
};

export const logger = createLogger();

// Helper function for one-off usage
export const devLog = (...args: any[]) => {
  if (isDev) {
    console.log(...args);
  }
};
