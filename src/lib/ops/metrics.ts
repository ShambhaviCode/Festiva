/**
 * Real, in-process telemetry for FESTIVA.
 *
 * - Every instrumented API request records its route, status and duration.
 * - Every call to a sponsor provider records its outcome and duration.
 * - Background-style processing steps (preference structuring) record outcomes.
 *
 * Nothing recorded here contains personal content: only route templates,
 * status codes, error codes, durations and counts.
 *
 * Exposed in Prometheus text format at /api/ops/metrics (token-protected) so a
 * Prometheus server, the NudgeBee agent or any compatible collector can scrape
 * it. The same samples feed FESTIVA's built-in alert rules (alerts.ts).
 *
 * Metrics live in one server process. On multiple instances each exposes its
 * own series; aggregate them in Prometheus.
 */

export interface RequestSample {
  at: number;
  route: string;
  method: string;
  status: number;
  ms: number;
  controlledTest: boolean;
}

export interface ProviderSample {
  at: number;
  provider: string;
  capability: string;
  ok: boolean;
  code: string;
  ms: number;
  controlledTest: boolean;
}

export interface ProcessingSample {
  at: number;
  job: string;
  ok: boolean;
  code: string;
}

const BUCKETS = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10];
const WINDOW_MS = 30 * 60_000;
const MAX_SAMPLES = 20_000;

interface Histogram {
  buckets: number[];
  sum: number;
  count: number;
}

interface Registry {
  startedAt: number;
  requests: RequestSample[];
  providers: ProviderSample[];
  processing: ProcessingSample[];
  requestCounts: Map<string, number>;
  requestHistograms: Map<string, Histogram>;
  providerCounts: Map<string, number>;
  providerHistograms: Map<string, Histogram>;
  processingCounts: Map<string, number>;
  gauges: Map<string, number>;
}

const holder = globalThis as unknown as { __festivaMetrics?: Registry };
const registry: Registry = (holder.__festivaMetrics ??= {
  startedAt: Date.now(),
  requests: [],
  providers: [],
  processing: [],
  requestCounts: new Map(),
  requestHistograms: new Map(),
  providerCounts: new Map(),
  providerHistograms: new Map(),
  processingCounts: new Map(),
  gauges: new Map(),
});

function prune<T extends { at: number }>(list: T[], now: number): void {
  const cutoff = now - WINDOW_MS;
  let drop = 0;
  while (drop < list.length && list[drop].at < cutoff) drop += 1;
  if (list.length - drop > MAX_SAMPLES) drop = list.length - MAX_SAMPLES;
  if (drop > 0) list.splice(0, drop);
}

function observe(map: Map<string, Histogram>, key: string, seconds: number): void {
  const histogram = map.get(key) ?? { buckets: BUCKETS.map(() => 0), sum: 0, count: 0 };
  BUCKETS.forEach((bound, i) => {
    if (seconds <= bound) histogram.buckets[i] += 1;
  });
  histogram.sum += seconds;
  histogram.count += 1;
  map.set(key, histogram);
}

const inc = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1);
const statusClass = (status: number) => `${Math.floor(status / 100)}xx`;

export function recordRequest(sample: Omit<RequestSample, "at"> & { at?: number }): void {
  const at = sample.at ?? Date.now();
  registry.requests.push({ ...sample, at });
  prune(registry.requests, at);
  inc(registry.requestCounts, `${sample.route}|${sample.method}|${statusClass(sample.status)}`);
  observe(registry.requestHistograms, `${sample.route}|${sample.method}`, sample.ms / 1000);
}

export function recordProviderCall(sample: Omit<ProviderSample, "at"> & { at?: number }): void {
  const at = sample.at ?? Date.now();
  registry.providers.push({ ...sample, at });
  prune(registry.providers, at);
  inc(registry.providerCounts, `${sample.provider}|${sample.capability}|${sample.ok ? "success" : "failure"}|${sample.code}`);
  observe(registry.providerHistograms, `${sample.provider}|${sample.capability}`, sample.ms / 1000);
}

export function recordProcessing(sample: Omit<ProcessingSample, "at"> & { at?: number }): void {
  const at = sample.at ?? Date.now();
  registry.processing.push({ ...sample, at });
  prune(registry.processing, at);
  inc(registry.processingCounts, `${sample.job}|${sample.ok ? "success" : "failure"}|${sample.code}`);
}

export function setGauge(name: string, value: number): void {
  registry.gauges.set(name, value);
}

export function samples(sinceMs: number, now = Date.now()) {
  const cutoff = now - sinceMs;
  return {
    requests: registry.requests.filter((s) => s.at >= cutoff),
    providers: registry.providers.filter((s) => s.at >= cutoff),
    processing: registry.processing.filter((s) => s.at >= cutoff),
  };
}

export function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
}

const escapeLabel = (value: string) => value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/"/g, '\\"');
const labels = (pairs: Record<string, string>) =>
  `{${Object.entries(pairs)
    .map(([k, v]) => `${k}="${escapeLabel(v)}"`)
    .join(",")}}`;

/** Prometheus text exposition format, version 0.0.4. */
export function renderPrometheus(): string {
  const lines: string[] = [];
  lines.push("# HELP festiva_process_start_time_seconds Start time of this FESTIVA server process.");
  lines.push("# TYPE festiva_process_start_time_seconds gauge");
  lines.push(`festiva_process_start_time_seconds ${Math.floor(registry.startedAt / 1000)}`);

  lines.push("# HELP festiva_http_requests_total API requests handled, by route template, method and status class.");
  lines.push("# TYPE festiva_http_requests_total counter");
  for (const [key, value] of registry.requestCounts) {
    const [route, method, status] = key.split("|");
    lines.push(`festiva_http_requests_total${labels({ route, method, status })} ${value}`);
  }

  lines.push("# HELP festiva_http_request_duration_seconds API request duration.");
  lines.push("# TYPE festiva_http_request_duration_seconds histogram");
  for (const [key, h] of registry.requestHistograms) {
    const [route, method] = key.split("|");
    BUCKETS.forEach((bound, i) => lines.push(`festiva_http_request_duration_seconds_bucket${labels({ route, method, le: String(bound) })} ${h.buckets[i]}`));
    lines.push(`festiva_http_request_duration_seconds_bucket${labels({ route, method, le: "+Inf" })} ${h.count}`);
    lines.push(`festiva_http_request_duration_seconds_sum${labels({ route, method })} ${h.sum.toFixed(6)}`);
    lines.push(`festiva_http_request_duration_seconds_count${labels({ route, method })} ${h.count}`);
  }

  lines.push("# HELP festiva_provider_requests_total Calls to external providers (Sarvam, Flagsmith, NudgeBee), by outcome.");
  lines.push("# TYPE festiva_provider_requests_total counter");
  for (const [key, value] of registry.providerCounts) {
    const [provider, capability, outcome, code] = key.split("|");
    lines.push(`festiva_provider_requests_total${labels({ provider, capability, outcome, code })} ${value}`);
  }

  lines.push("# HELP festiva_provider_request_duration_seconds Duration of calls to external providers.");
  lines.push("# TYPE festiva_provider_request_duration_seconds histogram");
  for (const [key, h] of registry.providerHistograms) {
    const [provider, capability] = key.split("|");
    BUCKETS.forEach((bound, i) => lines.push(`festiva_provider_request_duration_seconds_bucket${labels({ provider, capability, le: String(bound) })} ${h.buckets[i]}`));
    lines.push(`festiva_provider_request_duration_seconds_bucket${labels({ provider, capability, le: "+Inf" })} ${h.count}`);
    lines.push(`festiva_provider_request_duration_seconds_sum${labels({ provider, capability })} ${h.sum.toFixed(6)}`);
    lines.push(`festiva_provider_request_duration_seconds_count${labels({ provider, capability })} ${h.count}`);
  }

  lines.push("# HELP festiva_processing_steps_total Preference-processing steps, by outcome.");
  lines.push("# TYPE festiva_processing_steps_total counter");
  for (const [key, value] of registry.processingCounts) {
    // `step`, not `job`: Prometheus reserves `job` for the scrape job.
    const [step, outcome, code] = key.split("|");
    lines.push(`festiva_processing_steps_total${labels({ step, outcome, code })} ${value}`);
  }

  for (const [name, value] of registry.gauges) {
    lines.push(`# TYPE ${name} gauge`);
    lines.push(`${name} ${value}`);
  }
  return `${lines.join("\n")}\n`;
}

export function resetMetricsForTests(): void {
  registry.requests.length = 0;
  registry.providers.length = 0;
  registry.processing.length = 0;
  registry.requestCounts.clear();
  registry.requestHistograms.clear();
  registry.providerCounts.clear();
  registry.providerHistograms.clear();
  registry.processingCounts.clear();
  registry.gauges.clear();
}
