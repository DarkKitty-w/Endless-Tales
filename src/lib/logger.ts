/**
 * Logger utility that respects NODE_ENV
 * In production, log statements are disabled
 * In development, they pass through to console
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    // Errors are always logged, even in production
    console.error(...args);
  },
  
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
  
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },
};

// For conditional logging with a namespace prefix
export function createLogger(namespace: string) {
  return {
    log: (...args: any[]) => {
      if (isDev) {
        console.log(`[${namespace}]`, ...args);
      }
    },
    
    error: (...args: any[]) => {
      console.error(`[${namespace}]`, ...args);
    },
    
    warn: (...args: any[]) => {
      if (isDev) {
        console.warn(`[${namespace}]`, ...args);
      }
    },
    
    info: (...args: any[]) => {
      if (isDev) {
        console.info(`[${namespace}]`, ...args);
      }
    },
    
    debug: (...args: any[]) => {
      if (isDev) {
        console.debug(`[${namespace}]`, ...args);
      }
    },
  };
}
