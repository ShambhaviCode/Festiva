"use client";

import { useState } from "react";
import { AdminFrame, adminFetch, when } from "@/components/admin/AdminFrame";
import type { OpsEvent, RuleDefinition } from "@/lib/ops/alerts";
import type { AuditEntry } from "@/lib/ops/audit";
import type { Controls } from "@/lib/ops/controls";
import type { Proposal, RunbookId, RunbookInfo } from "@/lib/ops/runbooks";

interface Data {
  telemetry: { window: string; requests: number; serverErrors: number; circleRequests: number; circleP95Ms: number | null; voiceAttempts: number; voiceFailures: number; processingFailures: number; controlledTestSamples: number };
  rules: RuleDefinition[];
  active: Record<string, string>;
  events: OpsEvent[];
  lastEvaluatedAt: string | null;
  proposals: Proposal[];
  runbooks: Record<RunbookId, RunbookInfo>;
  controls: Controls;
  audit: AuditEntry[];
  nudgebee: { eventWebhook: boolean; appUrl: string | null };
}

function Decision({ proposal, runbook, onDone }: { proposal: Proposal; runbook: RunbookInfo; onDone: () => void }) {
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function decide(approve: boolean) {
    if (approve && !window.confirm(`Approve and run "${runbook.title}" now?\n\n${runbook.effect}`)) return;
    setBusy(true);
    const result = await adminFetch("/api/admin/ops", { method: "POST", body: JSON.stringify({ action: "decide", proposalId: proposal.id, approve, note }) });
    setBusy(false);
    if (result.error) setError(result.error);
    else onDone();
  }
  return (
    <div className="mt-3 grid gap-2">
      <label htmlFor={`note-${proposal.id}`} className="field-label">
        Your reason (recorded in the audit trail)
      </label>
      <input id={`note-${proposal.id}`} className="field max-w-xl" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Checked the evidence; Sarvam is returning 503s" data-testid="approval-note" />
      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn btn-plum btn-sm" disabled={busy || note.trim().length < 5} onClick={() => decide(true)} data-testid="approve">
          Approve and run
        </button>
        <button type="button" className="btn btn-line btn-sm" disabled={busy || note.trim().length < 5} onClick={() => decide(false)}>
          Reject
        </button>
      </div>
      {error && <p className="text-vermilion">{error}</p>}
    </div>
  );
}

export default function OperationsPage() {
  const [message, setMessage] = useState<string | null>(null);
  return (
    <AdminFrame<Data> endpoint="/api/admin/ops" refreshMs={15_000}>
      {(data, reload) => {
        const t = data.telemetry;
        const pending = data.proposals.filter((p) => p.status === "pending");
        const decided = data.proposals.filter((p) => p.status !== "pending").slice(0, 15);
        const act = async (body: object, done: string) => {
          const result = await adminFetch("/api/admin/ops", { method: "POST", body: JSON.stringify(body) });
          setMessage(result.error ?? done);
          await reload();
        };
        return (
          <div>
            <h1 className="display-1">Operations</h1>
            <p className="lede mt-3 max-w-3xl">Real telemetry from this server, FESTIVA&rsquo;s alert rules, and every operational action waiting for, or given, human approval.</p>
            {message && (
              <p role="status" className="mt-4 rounded-lg border border-emerald/40 px-4 py-2">
                {message}
              </p>
            )}

            <section className="rule mt-8 border-t py-8" aria-labelledby="telemetry">
              <h2 id="telemetry" className="display-3">
                Last {t.window}
              </h2>
              <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4" data-testid="telemetry">
                {(
                  [
                    ["API requests", t.requests],
                    ["Server errors (5xx)", t.serverErrors],
                    ["Gift Circle requests", t.circleRequests],
                    ["Gift Circle p95", t.circleP95Ms === null ? "—" : `${t.circleP95Ms} ms`],
                    ["Voice transcriptions", t.voiceAttempts],
                    ["Voice failures", t.voiceFailures],
                    ["Structuring failures", t.processingFailures],
                    ["Samples from controlled tests", t.controlledTestSamples],
                  ] as [string, string | number][]
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="note">{label}</dt>
                    <dd className="font-[family-name:var(--font-display)] text-3xl tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="note mt-4 text-[0.85rem]">
                Rules last evaluated {when(data.lastEvaluatedAt)}. Prometheus can scrape the same numbers from /api/ops/metrics. {data.nudgebee.eventWebhook ? "Alert changes are sent to NudgeBee." : "NudgeBee is not configured, so alerts stay here."}
              </p>
            </section>

            <section className="rule border-t py-8" aria-labelledby="approvals">
              <h2 id="approvals" className="display-3">
                Waiting for approval
              </h2>
              {pending.length === 0 ? (
                <p className="note mt-3">Nothing is waiting.</p>
              ) : (
                <ul className="mt-4 grid gap-5" data-testid="pending-proposals">
                  {pending.map((p) => (
                    <li key={p.id} className="rounded-xl border-2 border-saffron p-5">
                      <p className="font-semibold">{data.runbooks[p.runbook].title}</p>
                      <p className="mt-1">{data.runbooks[p.runbook].effect}</p>
                      <p className="note mt-1">
                        Proposed by {p.proposedBy} at {when(p.proposedAt)}: {p.reason}
                        {p.externalReference ? ` (NudgeBee reference ${p.externalReference})` : ""}
                      </p>
                      <Decision proposal={p} runbook={data.runbooks[p.runbook]} onDone={reload} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rule border-t py-8" aria-labelledby="alerts">
              <h2 id="alerts" className="display-3">
                Alerts
              </h2>
              {data.events.length === 0 ? (
                <p className="note mt-3">No alert has fired on this server.</p>
              ) : (
                <ul className="mt-4 grid gap-5" data-testid="alert-events">
                  {data.events.map((e) => (
                    <li key={e.id} id={`event-${e.id}`} className={`rounded-xl border p-5 ${e.status === "firing" ? "border-vermilion/60" : "rule"}`}>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-semibold">
                          {e.controlledTest ? "[Controlled test] " : ""}
                          {e.title}
                        </p>
                        <p className={e.status === "firing" ? "font-semibold text-vermilion" : "note"}>
                          {e.status === "firing" ? `Firing since ${when(e.startsAt)}` : `Resolved ${when(e.endsAt)}`}
                        </p>
                      </div>
                      <p className="note mt-2">Findings from FESTIVA&rsquo;s built-in checks</p>
                      <ul className="mt-1 list-disc pl-5">
                        {e.findings.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                      <details className="mt-2">
                        <summary className="cursor-pointer note">Evidence</summary>
                        <dl className="mt-2 grid gap-1 text-[0.9rem] sm:grid-cols-2">
                          {Object.entries(e.evidence).map(([k, v]) => (
                            <div key={k}>
                              <dt className="inline note">{k.replace(/_/g, " ")}: </dt>
                              <dd className="inline">{v === null ? "n/a" : String(v)}</dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                      <p className="mt-2 text-[0.9rem]">Recommended runbooks: {e.runbooks.map((r) => data.runbooks[r].title).join(", ")}.</p>
                      <p className="note mt-1 text-[0.85rem]">
                        NudgeBee:{" "}
                        {e.deliveries.some((d) => d.attempted)
                          ? e.deliveries
                              .filter((d) => d.attempted)
                              .map((d) => `${d.detail} at ${when(d.at)}`)
                              .join("; ")
                          : "not sent, because the Event Webhook is not configured"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rule border-t py-8" aria-labelledby="controls">
              <h2 id="controls" className="display-3">
                Switches and controlled tests
              </h2>
              <ul className="mt-4 grid gap-2" data-testid="controls">
                <li>Voice capture: {data.controls.voicePaused ? `paused by ${data.controls.voicePaused.by} at ${when(data.controls.voicePaused.since)}` : "running"}</li>
                <li>AI structuring: {data.controls.aiStructuringPaused ? `paused by ${data.controls.aiStructuringPaused.by} at ${when(data.controls.aiStructuringPaused.since)}` : "running"}</li>
                <li>Latency test: {data.controls.tests.latency ? `adding ${data.controls.tests.latency.addMs} ms until ${when(data.controls.tests.latency.until)}` : "off"}</li>
                <li>Voice failure test: {data.controls.tests.voiceFailures ? `${data.controls.tests.voiceFailures.remaining} failure(s) left, until ${when(data.controls.tests.voiceFailures.until)}` : "off"}</li>
              </ul>
              <p className="mt-4 max-w-3xl">
                Controlled tests create a real, bounded fault so monitoring and approvals can be demonstrated. Everything they cause is labelled as a controlled test, here and in NudgeBee. They end on their own after 10 minutes.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-line btn-sm"
                  data-testid="start-latency-test"
                  onClick={() => window.confirm("Add 1.8 seconds to every Gift Circle API request for up to 10 minutes?") && act({ action: "start_test", scenario: "latency", confirm: true }, "Latency test started.")}
                >
                  Start latency test
                </button>
                <button
                  type="button"
                  className="btn btn-line btn-sm"
                  data-testid="start-voice-test"
                  onClick={() => window.confirm("Fail the next 5 voice requests before they reach Sarvam?") && act({ action: "start_test", scenario: "voice_failures", confirm: true }, "Voice failure test started.")}
                >
                  Start voice failure test
                </button>
                <button type="button" className="btn btn-line btn-sm" onClick={() => act({ action: "evaluate" }, "Rules evaluated.")} data-testid="evaluate-rules">
                  Evaluate rules now
                </button>
              </div>
              <div className="mt-6">
                <p className="field-label">Propose a runbook yourself</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(data.runbooks) as RunbookId[]).map((id) => (
                    <button key={id} type="button" className="chip" onClick={() => act({ action: "propose", runbook: id, reason: "Proposed manually from the operations centre" }, `Proposed: ${data.runbooks[id].title}. It still needs approval.`)}>
                      {data.runbooks[id].title}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rule border-t py-8" aria-labelledby="history">
              <h2 id="history" className="display-3">
                Decided runbooks
              </h2>
              {decided.length === 0 ? (
                <p className="note mt-3">None yet.</p>
              ) : (
                <ul className="mt-4 grid gap-3" data-testid="decided-proposals">
                  {decided.map((p) => (
                    <li key={p.id} className="rule border-b pb-3">
                      <span className="font-semibold">{data.runbooks[p.runbook].title}</span>: {p.status}. {p.decision ? `${p.decision.approved ? "Approved" : "Rejected"} by ${p.decision.by} at ${when(p.decision.at)} ("${p.decision.note}").` : ""} {p.execution ? `Result: ${p.execution.detail}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rule border-t py-8" aria-labelledby="rules">
              <h2 id="rules" className="display-3">
                Alert rules
              </h2>
              <ul className="mt-4 grid gap-2">
                {data.rules.map((r) => (
                  <li key={r.name}>
                    <span className="font-semibold">{r.title}</span> <span className="note">({r.severity})</span>: {r.condition}. {data.active[r.name] ? <span className="font-semibold text-vermilion">Firing.</span> : "Not firing."}
                  </li>
                ))}
              </ul>
            </section>

            <section className="rule border-t py-8" aria-labelledby="audit">
              <h2 id="audit" className="display-3">
                Audit trail
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[44rem] text-left text-[0.9rem]" data-testid="audit-log">
                  <thead>
                    <tr className="rule border-b">
                      <th className="py-2 pr-3">When</th>
                      <th className="py-2 pr-3">Who</th>
                      <th className="py-2 pr-3">What</th>
                      <th className="py-2 pr-3">Outcome</th>
                      <th className="py-2">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.audit.map((a) => (
                      <tr key={a.id} className="rule border-b align-top">
                        <td className="py-1 pr-3 whitespace-nowrap">{when(a.at)}</td>
                        <td className="py-1 pr-3">{a.actor}</td>
                        <td className="py-1 pr-3">
                          {a.action} <span className="note">{a.target}</span>
                        </td>
                        <td className="py-1 pr-3">{a.outcome}</td>
                        <td className="py-1">{a.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        );
      }}
    </AdminFrame>
  );
}
