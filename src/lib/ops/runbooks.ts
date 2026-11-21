import { randomUUID } from "node:crypto";
import path from "node:path";
import { dataDir, readJsonFile, updateJsonFile } from "../server/json-store";
import { audit } from "./audit";
import { changeControls, getControls, type Controls } from "./controls";

/**
 * Approval-gated runbooks.
 *
 * A runbook is proposed (by FESTIVA's alert rules, by an administrator, or by
 * a NudgeBee workflow), then waits. Nothing runs until a FESTIVA administrator
 * explicitly approves it with a written reason. Every proposal, decision and
 * result is written to the audit trail.
 *
 * Every runbook is narrow and reversible. None restarts a server, deletes
 * data, deploys, rolls back or touches credentials.
 */

export const RUNBOOK_IDS = ["pause_voice_capture", "resume_voice_capture", "pause_ai_structuring", "resume_ai_structuring", "recheck_storage", "end_controlled_tests"] as const;
export type RunbookId = (typeof RUNBOOK_IDS)[number];

export interface RunbookInfo {
  title: string;
  effect: string;
  reversal: RunbookId | null;
  mutates: boolean;
}

export const RUNBOOKS: Record<RunbookId, RunbookInfo> = {
  pause_voice_capture: {
    title: "Pause voice capture",
    effect: "Stops sending recordings to Sarvam. Participants can still type preferences. Nothing is deleted.",
    reversal: "resume_voice_capture",
    mutates: true,
  },
  resume_voice_capture: { title: "Resume voice capture", effect: "Sends recordings to Sarvam again.", reversal: "pause_voice_capture", mutates: true },
  pause_ai_structuring: {
    title: "Use FESTIVA's rules for preference structuring",
    effect: "Stops calling Sarvam's chat model to structure preferences; FESTIVA's own rules are used instead. Transcription and translation are unaffected.",
    reversal: "resume_ai_structuring",
    mutates: true,
  },
  resume_ai_structuring: { title: "Resume AI structuring", effect: "Calls Sarvam's chat model to structure preferences again.", reversal: "pause_ai_structuring", mutates: true },
  recheck_storage: { title: "Re-check storage", effect: "Runs the storage health check again and records the result. Changes nothing.", reversal: null, mutates: false },
  end_controlled_tests: { title: "End controlled tests", effect: "Stops any running controlled test scenario (added latency or injected voice failures).", reversal: null, mutates: true },
};

export type ProposalStatus = "pending" | "rejected" | "executed" | "failed";

export interface Proposal {
  id: string;
  runbook: RunbookId;
  reason: string;
  alertEventId: string | null;
  externalReference: string | null;
  proposedBy: string;
  proposedAt: string;
  status: ProposalStatus;
  decision: { by: string; at: string; approved: boolean; note: string } | null;
  execution: { at: string; outcome: "ok" | "failed"; detail: string } | null;
}

const file = () => path.join(dataDir(), "ops-proposals.json");
const MAX = 300;

export async function proposals(limit = 100): Promise<Proposal[]> {
  return (await readJsonFile<Proposal[]>(file(), [])).slice(-limit).reverse();
}

export async function propose(input: { runbook: RunbookId; reason: string; alertEventId?: string | null; externalReference?: string | null; proposedBy: string }): Promise<Proposal> {
  const proposal: Proposal = {
    id: randomUUID(),
    runbook: input.runbook,
    reason: input.reason.slice(0, 300),
    alertEventId: input.alertEventId ?? null,
    externalReference: input.externalReference?.slice(0, 120) ?? null,
    proposedBy: input.proposedBy,
    proposedAt: new Date().toISOString(),
    status: "pending",
    decision: null,
    execution: null,
  };
  const stored = await updateJsonFile<Proposal[], { proposal: Proposal; added: boolean }>(file(), [], (current) => {
    // One open proposal per runbook is enough; repeated evaluations return the existing one.
    const open = current.find((p) => p.status === "pending" && p.runbook === proposal.runbook);
    if (open) return { next: current, result: { proposal: open, added: false } };
    return { next: [...current, proposal].slice(-MAX), result: { proposal, added: true } };
  });
  if (stored.added) await audit({ actor: input.proposedBy, action: "runbook.proposed", target: input.runbook, outcome: "info", detail: proposal.reason });
  return stored.proposal;
}

async function execute(runbook: RunbookId, actor: string, proposalId: string, recheck: () => Promise<string>): Promise<{ outcome: "ok" | "failed"; detail: string }> {
  const sw = { since: new Date().toISOString(), by: actor, reason: `Runbook ${runbook}`, runbookRunId: proposalId };
  const set = (patch: (c: Controls) => Controls) => changeControls(patch);
  switch (runbook) {
    case "pause_voice_capture":
      await set((c) => ({ ...c, voicePaused: sw }));
      return { outcome: "ok", detail: "Voice capture paused. Typing remains available." };
    case "resume_voice_capture":
      await set((c) => ({ ...c, voicePaused: null }));
      return { outcome: "ok", detail: "Voice capture resumed." };
    case "pause_ai_structuring":
      await set((c) => ({ ...c, aiStructuringPaused: sw }));
      return { outcome: "ok", detail: "Preference structuring now uses FESTIVA's rules." };
    case "resume_ai_structuring":
      await set((c) => ({ ...c, aiStructuringPaused: null }));
      return { outcome: "ok", detail: "AI structuring resumed." };
    case "recheck_storage":
      return { outcome: "ok", detail: await recheck() };
    case "end_controlled_tests":
      await set((c) => ({ ...c, tests: { latency: null, voiceFailures: null } }));
      return { outcome: "ok", detail: "Controlled tests ended." };
  }
}

export class ApprovalError extends Error {}

/**
 * Approve (and then run) or reject a pending proposal.
 * Approval requires an administrator and a note of at least five characters.
 */
export async function decide(proposalId: string, approved: boolean, note: string, actor: string, recheck: () => Promise<string>): Promise<Proposal> {
  if (note.trim().length < 5) throw new ApprovalError("Write a short reason (at least five characters) for the record.");
  const decided = await updateJsonFile<Proposal[], Proposal>(file(), [], (current) => {
    const index = current.findIndex((p) => p.id === proposalId);
    if (index === -1) throw new ApprovalError("That proposal does not exist.");
    if (current[index].status !== "pending") throw new ApprovalError("That proposal has already been decided.");
    const updated: Proposal = { ...current[index], decision: { by: actor, at: new Date().toISOString(), approved, note: note.trim().slice(0, 300) }, status: approved ? "pending" : "rejected" };
    const next = [...current];
    next[index] = updated;
    return { next, result: updated };
  });
  await audit({ actor, action: approved ? "runbook.approved" : "runbook.rejected", target: decided.runbook, outcome: approved ? "ok" : "rejected", detail: decided.decision!.note });
  if (!approved) return decided;

  let result: { outcome: "ok" | "failed"; detail: string };
  try {
    result = await execute(decided.runbook, actor, decided.id, recheck);
  } catch (error) {
    result = { outcome: "failed", detail: (error as Error).message.slice(0, 200) };
  }
  const finished = await updateJsonFile<Proposal[], Proposal>(file(), [], (current) => {
    const next = current.map((p) => (p.id === decided.id ? { ...p, status: (result.outcome === "ok" ? "executed" : "failed") as ProposalStatus, execution: { at: new Date().toISOString(), ...result } } : p));
    return { next, result: next.find((p) => p.id === decided.id)! };
  });
  await audit({ actor, action: "runbook.executed", target: decided.runbook, outcome: result.outcome === "ok" ? "ok" : "failed", detail: result.detail });
  return finished;
}

export async function controlsSnapshot() {
  return getControls();
}
