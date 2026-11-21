import path from "node:path";
import { dataDir, readJsonFile, updateJsonFile } from "../server/json-store";

/**
 * Operational switches an administrator can change through an approved
 * runbook, and controlled test scenarios for demonstrations.
 *
 * Switches are reversible and narrow: they pause one capability and keep a
 * fallback running (typing instead of voice; FESTIVA's rules instead of an
 * AI model). Nothing here restarts, deletes, deploys or changes credentials.
 *
 * Controlled test scenarios inject a real, bounded fault (added latency, or
 * failing voice requests before they reach Sarvam) so that monitoring and the
 * approval workflow can be shown end to end. Every sample they produce is
 * labelled `controlledTest`, and alerts raised during one say so.
 */

export interface Switch {
  since: string;
  by: string;
  reason: string;
  runbookRunId: string | null;
}

export interface Controls {
  voicePaused: Switch | null;
  aiStructuringPaused: Switch | null;
  tests: {
    latency: { addMs: number; until: string; startedBy: string } | null;
    voiceFailures: { remaining: number; until: string; startedBy: string } | null;
  };
}

const EMPTY: Controls = { voicePaused: null, aiStructuringPaused: null, tests: { latency: null, voiceFailures: null } };
const file = () => path.join(dataDir(), "ops-controls.json");

const cache = globalThis as unknown as { __festivaControls?: { value: Controls; readAt: number } };

export async function getControls(now = Date.now()): Promise<Controls> {
  if (cache.__festivaControls && now - cache.__festivaControls.readAt < 1000) return cache.__festivaControls.value;
  const value = { ...EMPTY, ...(await readJsonFile<Controls>(file(), EMPTY)) };
  value.tests = { ...EMPTY.tests, ...value.tests };
  // Expired test scenarios end on their own.
  if (value.tests.latency && Date.parse(value.tests.latency.until) <= now) value.tests.latency = null;
  if (value.tests.voiceFailures && (Date.parse(value.tests.voiceFailures.until) <= now || value.tests.voiceFailures.remaining <= 0)) value.tests.voiceFailures = null;
  cache.__festivaControls = { value, readAt: now };
  return value;
}

export async function changeControls(change: (current: Controls) => Controls): Promise<Controls> {
  const next = await updateJsonFile<Controls, Controls>(file(), EMPTY, (current) => {
    const value = change({ ...EMPTY, ...current, tests: { ...EMPTY.tests, ...current.tests } });
    return { next: value, result: value };
  });
  cache.__festivaControls = undefined;
  return next;
}

/** Consume one injected voice failure, if a voice-failure test is running. */
export async function takeInjectedVoiceFailure(): Promise<boolean> {
  const controls = await getControls();
  if (!controls.tests.voiceFailures) return false;
  await changeControls((c) =>
    c.tests.voiceFailures ? { ...c, tests: { ...c.tests, voiceFailures: { ...c.tests.voiceFailures, remaining: c.tests.voiceFailures.remaining - 1 } } } : c,
  );
  return true;
}

export async function injectedLatencyMs(): Promise<number> {
  return (await getControls()).tests.latency?.addMs ?? 0;
}
