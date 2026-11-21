import { randomUUID } from "node:crypto";
import path from "node:path";
import { dataDir, readJsonFile, updateJsonFile } from "../server/json-store";

/**
 * Append-only audit trail for administrative and operational actions:
 * sign-ins, controlled tests, runbook proposals, approvals, rejections,
 * executions and reversals, and alert deliveries to NudgeBee.
 *
 * Entries describe *what* happened and *who* did it, never participant
 * content. The newest 2,000 entries are kept.
 */

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  outcome: "ok" | "rejected" | "failed" | "info";
  detail: string;
}

const MAX = 2000;
const file = () => path.join(dataDir(), "ops-audit.json");

export async function audit(entry: Omit<AuditEntry, "id" | "at">): Promise<AuditEntry> {
  const full: AuditEntry = { ...entry, detail: entry.detail.slice(0, 500), id: randomUUID(), at: new Date().toISOString() };
  await updateJsonFile<AuditEntry[], null>(file(), [], (current) => ({ next: [...current, full].slice(-MAX), result: null }));
  if (process.env.NODE_ENV !== "test") console.info(JSON.stringify({ scope: "festiva.audit", action: full.action, actor: full.actor, outcome: full.outcome }));
  return full;
}

export async function auditLog(limit = 200): Promise<AuditEntry[]> {
  const entries = await readJsonFile<AuditEntry[]>(file(), []);
  return entries.slice(-limit).reverse();
}
