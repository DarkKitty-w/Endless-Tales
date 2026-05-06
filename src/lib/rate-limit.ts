import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// SEC-4 Fix: Rate limiting for AI proxy endpoint
// Uses a simple in-memory store if Redis is not configured

// Create a simple in-memory store for rate limiting
// Note: This works for single-instance deployments. For multi-instance, use Redis.
const ipRequests = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of ipRequests.entries()) {
    if (now > value.resetTime) {
      ipRequests.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Rate limit configuration
const RATE_LIMIT_REQUESTS = 10; // requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = ipRequests.get(ip);

  if (!entry || now > entry.resetTime) {
    // First request or window expired
    ipRequests.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return {
      success: true,
      limit: RATE_LIMIT_REQUESTS,
      remaining: RATE_LIMIT_REQUESTS - 1,
      reset: now + RATE_LIMIT_WINDOW,
    };
  }

  // Increment count
  entry.count++;
  ipRequests.set(ip, entry);

  if (entry.count > RATE_LIMIT_REQUESTS) {
    return {
      success: false,
      limit: RATE_LIMIT_REQUESTS,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  return {
    success: true,
    limit: RATE_LIMIT_REQUESTS,
    remaining: Math.max(0, RATE_LIMIT_REQUESTS - entry.count),
    reset: entry.resetTime,
  };
}
