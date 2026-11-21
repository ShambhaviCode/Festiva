import path from "node:path";
import { dataDir, readJsonFile, serialise, writeJsonFile } from "../server/json-store";

/**
 * Evidence of what each sponsor integration has actually done.
 *
 * Every real request records its outcome here (never its content). The admin
 * status panels read this, so "Connected" is shown only after a genuine
 * request has succeeded. Kept in memory and written to the data directory so
 * it survives a restart of a single-instance deployment.
 */

export type IntegrationName = "sarvam" | "flagsmith" | "nudgebee";

export interface Attempt {
  at: string;
  ok: boolean;
  /** Short, content-free description: an HTTP status, an error code, a count. */
  detail: string;
  httpStatus: number | null;
  ms: number | null;
  model: string | null;
  /** True when produced by a deliberate, labelled controlled test. */
  controlledTest: boolean;
}

export interface CapabilityStatus {
  last: Attempt | null;
  lastSuccess: Attempt | null;
  successes: number;
  failures: number;
}

export type StatusBook = Record<IntegrationName, Record<string, CapabilityStatus>>;

const EMPTY: StatusBook = { sarvam: {}, flagsmith: {}, nudgebee: {} };
const store = globalThis as unknown as { __festivaStatus?: { book: StatusBook; loaded: boolean } };
const state = (store.__festivaStatus ??= { book: structuredClone(EMPTY), loaded: false });

const file = () => path.join(dataDir(), "integration-status.json");

async function load(): Promise<void> {
  if (state.loaded) return;
  state.loaded = true;
  try {
    const saved = await readJsonFile<StatusBook>(file(), EMPTY);
    state.book = { ...structuredClone(EMPTY), ...saved };
  } catch {
    state.book = structuredClone(EMPTY);
  }
}

let pending: ReturnType<typeof setTimeout> | null = null;
function persistSoon(): void {
  if (pending) return;
  pending = setTimeout(() => {
    pending = null;
    void serialise(file(), () => writeJsonFile(file(), state.book)).catch(() => undefined);
  }, 250);
  pending.unref?.();
}

export async function recordAttempt(
  integration: IntegrationName,
  capability: string,
  attempt: Omit<Attempt, "at" | "controlledTest"> & { controlledTest?: boolean },
): Promise<void> {
  await load();
  const entry: Attempt = { ...attempt, controlledTest: attempt.controlledTest ?? false, detail: attempt.detail.slice(0, 200), at: new Date().toISOString() };
  const capabilities = state.book[integration];
  const current = capabilities[capability] ?? { last: null, lastSuccess: null, successes: 0, failures: 0 };
  capabilities[capability] = {
    last: entry,
    lastSuccess: entry.ok ? entry : current.lastSuccess,
    successes: current.successes + (entry.ok ? 1 : 0),
    failures: current.failures + (entry.ok ? 0 : 1),
  };
  persistSoon();
}

export async function statusBook(): Promise<StatusBook> {
  await load();
  return structuredClone(state.book);
}

/** Connected means: at least one genuine (non-test-injected) request has succeeded. */
export function hasGenuineSuccess(capabilities: Record<string, CapabilityStatus>): boolean {
  return Object.values(capabilities).some((c) => c.lastSuccess !== null && !c.lastSuccess.controlledTest);
}

export function resetStatusForTests(): void {
  state.book = structuredClone(EMPTY);
  state.loaded = true;
}
