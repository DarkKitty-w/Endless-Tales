// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { getMetricsSnapshot } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

/**
 * OBS-16: Basic health check endpoint for monitoring and uptime probes.
 * Returns service status, uptime, and a snapshot of collected metrics.
 * No sensitive data (keys, user content) is ever included.
 */
export async function GET() {
  const uptimeSeconds = typeof process.uptime === 'function' ? Math.round(process.uptime()) : 0;

  try {
    const metrics = getMetricsSnapshot();
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      environment: process.env.NODE_ENV ?? 'unknown',
      metrics,
    });
  } catch (error) {
    logger.error('Health check failed to build metrics snapshot', 'health', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        uptimeSeconds,
      },
      { status: 200 }
    );
  }
}
