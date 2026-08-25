/**
 * Lightweight in-memory metrics collection (OBS-3).
 *
 * Counters and duration histograms for critical operations (AI calls, save/load,
 * multiplayer events). The snapshot is JSON-serializable so it can be exposed on
 * the /api/health endpoint or logged. Metrics never contain user content, only
 * operation names, labels, counts, and timings.
 */

type MetricLabels = Record<string, string | number | boolean | undefined>;

interface CounterEntry {
  help: string;
  values: Map<string, number>;
}

interface HistogramEntry {
  help: string;
  counts: Map<string, number>;
  sums: Map<string, number>;
  maxes: Map<string, number>;
}

const counters = new Map<string, CounterEntry>();
const histograms = new Map<string, HistogramEntry>();

function labelKey(labels?: MetricLabels): string {
  if (!labels) return '';
  return Object.keys(labels)
    .sort()
    .map((k) => `${k}=${String(labels[k])}`)
    .join(',');
}

/** Increment a named counter by `value` (default 1). */
export function incrementCounter(name: string, labels?: MetricLabels, value = 1): void {
  let entry = counters.get(name);
  if (!entry) {
    entry = { help: name, values: new Map() };
    counters.set(name, entry);
  }
  const key = labelKey(labels);
  entry.values.set(key, (entry.values.get(key) ?? 0) + value);
}

/** Record a duration in milliseconds for a named operation. */
export function observeDuration(name: string, durationMs: number, labels?: MetricLabels): void {
  let entry = histograms.get(name);
  if (!entry) {
    entry = { help: name, counts: new Map(), sums: new Map(), maxes: new Map() };
    histograms.set(name, entry);
  }
  const key = labelKey(labels);
  entry.counts.set(key, (entry.counts.get(key) ?? 0) + 1);
  entry.sums.set(key, (entry.sums.get(key) ?? 0) + durationMs);
  const currentMax = entry.maxes.get(key) ?? 0;
  if (durationMs > currentMax) entry.maxes.set(key, durationMs);
}

/**
 * Time an async operation and record its duration.
 * The operation result is passed through unchanged; failures are rethrown
 * after being recorded with outcome="error".
 */
export async function timed<T>(
  name: string,
  labels: MetricLabels | undefined,
  operation: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await operation();
    observeDuration(name, Date.now() - start, { ...labels, outcome: 'success' });
    return result;
  } catch (error) {
    observeDuration(name, Date.now() - start, { ...labels, outcome: 'error' });
    throw error;
  }
}

/** Snapshot of all collected metrics, safe to log or expose as JSON. */
export function getMetricsSnapshot(): Record<string, any> {
  const snapshot: Record<string, any> = { counters: {}, durations: {} };

  for (const [name, entry] of counters.entries()) {
    snapshot.counters[name] = Object.fromEntries(entry.values);
  }

  for (const [name, entry] of histograms.entries()) {
    const series: Record<string, { count: number; totalMs: number; avgMs: number; maxMs: number }> = {};
    const keys = new Set([...entry.counts.keys(), ...entry.sums.keys()]);
    for (const key of keys) {
      const count = entry.counts.get(key) ?? 0;
      const total = entry.sums.get(key) ?? 0;
      series[key] = {
        count,
        totalMs: Math.round(total),
        avgMs: count > 0 ? Math.round(total / count) : 0,
        maxMs: Math.round(entry.maxes.get(key) ?? 0),
      };
    }
    snapshot.durations[name] = series;
  }

  return snapshot;
}

/** Reset all metrics (mainly useful for tests). */
export function resetMetrics(): void {
  counters.clear();
  histograms.clear();
}
