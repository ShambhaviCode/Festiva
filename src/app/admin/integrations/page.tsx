"use client";

import { useState, type ReactNode } from "react";
import {
  AdminFrame,
  adminFetch,
  StateBadge,
  when,
} from "@/components/admin/AdminFrame";
import type { CapabilityStatus } from "@/lib/integrations/status";
import type { ExperimentSummary } from "@/lib/circles/experiment";

interface Data {
  sarvam: {
    state: string;
    baseUrl: string;
    models: Record<string, string> | null;
    capabilities: { id: string; label: string; detail: string }[];
    languages: {
      tag: string;
      name: string;
      nativeName: string;
      script: string;
      direction: string;
      availability: string;
    }[];
    status: Record<string, CapabilityStatus>;
  };
  flagsmith: {
    state: string;
    mode: string | null;
    apiUrl: string | null;
    refreshSeconds: number | null;
    eventsEnabled: boolean;
    environmentFetchedAt: string | null;
    lastError: string | null;
    keyKind: string | null;
    evaluation: {
      source: string;
      reason: string | null;
      evaluatedAt: string;
      onboarding: {
        variant: string;
        inExperiment: boolean;
        assignedBy: string;
      };
      config: Record<string, number>;
      configIssues: string[];
    };
    flags: {
      key: string;
      value: boolean;
      default: boolean;
      controls: string;
      whenOff: string;
    }[];
    remoteConfig: { key: string; defaults: Record<string, number> };
    experiment: ExperimentSummary;
    status: Record<string, CapabilityStatus>;
  };
  nudgebee: {
    state: string;
    configured: { eventWebhook: boolean; api: boolean };
    appUrl: string | null;
    prerequisites: { label: string; met: boolean | null; detail: string }[];
    status: Record<string, CapabilityStatus>;
  };
}

function Section({
  title,
  state,
  children,
  id,
}: {
  title: string;
  state: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <section
      className="rule border-t py-10"
      aria-labelledby={id}
      data-testid={`integration-${id}`}
    >
      <div className="flex flex-wrap items-center gap-4">
        <h2 id={id} className="display-2">
          {title}
        </h2>
        <StateBadge state={state} />
      </div>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8">
        {children}
      </div>
    </section>
  );
}

function Requests({ status }: { status: Record<string, CapabilityStatus> }) {
  const entries = Object.entries(status);
  if (entries.length === 0)
    return (
      <p className="note">
        No requests have been made yet, so nothing has been verified.
      </p>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] text-left text-[0.92rem]">
        <thead>
          <tr className="rule border-b">
            <th className="py-2 pr-4 font-semibold">Capability</th>
            <th className="py-2 pr-4 font-semibold">Last request</th>
            <th className="py-2 pr-4 font-semibold">Result</th>
            <th className="py-2 pr-4 font-semibold">Last success</th>
            <th className="py-2 font-semibold">Successes / failures</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, c]) => (
            <tr key={name} className="rule border-b align-top">
              <td className="py-2 pr-4">{name.replace(/_/g, " ")}</td>
              <td className="py-2 pr-4">{when(c.last?.at)}</td>
              <td
                className={`py-2 pr-4 ${c.last?.ok ? "text-emerald" : "text-vermilion"}`}
              >
                {c.last
                  ? `${c.last.ok ? "OK" : "Failed"}: ${c.last.detail}${c.last.ms !== null ? `, ${c.last.ms} ms` : ""}${c.last.controlledTest ? " (controlled test)" : ""}`
                  : "—"}
              </td>
              <td className="py-2 pr-4">{when(c.lastSuccess?.at)}</td>
              <td className="py-2">
                {c.successes} / {c.failures}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TestButton({
  action,
  label,
  onDone,
}: {
  action: string;
  label: string;
  onDone: () => void;
}) {
  const [result, setResult] = useState<{
    ok: boolean;
    detail: string;
    data?: unknown;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <button
        type="button"
        className="btn btn-plum btn-sm"
        disabled={busy}
        data-testid={`test-${action}`}
        onClick={async () => {
          setBusy(true);
          const response = await adminFetch<{
            ok: boolean;
            detail: string;
            data?: unknown;
          }>("/api/admin/integrations", {
            method: "POST",
            body: JSON.stringify({ action }),
          });
          setResult(
            response.data ?? { ok: false, detail: response.error ?? "Failed" },
          );
          setBusy(false);
          onDone();
        }}
      >
        {busy ? "Running…" : label}
      </button>
      {result && (
        <div
          className={`mt-3 rounded-lg border px-4 py-3 ${result.ok ? "border-emerald/40" : "border-vermilion/40"}`}
          role="status"
          data-testid={`result-${action}`}
        >
          <p className={result.ok ? "text-emerald" : "text-vermilion"}>
            {result.detail}
          </p>
          {result.data !== undefined && (
            <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words text-[0.8rem]">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

const pct = (v: number | null) =>
  v === null ? "—" : `${Math.round(v * 1000) / 10}%`;
const secs = (ms: number | null) =>
  ms === null ? "—" : `${Math.round(ms / 100) / 10} s`;

export default function IntegrationsPage() {
  return (
    <AdminFrame<Data> endpoint="/api/admin/integrations">
      {(data, reload) => (
        <div className="[&_code]:[overflow-wrap:anywhere] [&_th]:whitespace-nowrap">
          <h1 className="display-1">Integrations</h1>
          <p className="lede mt-3 max-w-3xl">
            Each status below comes from requests this server has actually made.
            A configured key alone is shown as unverified; secrets are never
            displayed.
          </p>

          <Section title="Sarvam AI" state={data.sarvam.state} id="sarvam">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-semibold">What FESTIVA uses it for</h3>
                <ul className="mt-2 grid gap-2">
                  {data.sarvam.capabilities.map((c) => (
                    <li key={c.id}>
                      <span className="font-semibold">{c.label}.</span>{" "}
                      <span className="note">{c.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">Configuration</h3>
                {data.sarvam.models ? (
                  <ul className="mt-2 grid gap-1">
                    <li>Endpoint: {data.sarvam.baseUrl}</li>
                    {Object.entries(data.sarvam.models).map(([k, v]) => (
                      <li key={k}>
                        {k}: <code>{v}</code>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-2 grid gap-2" data-testid="sarvam-setup">
                    <p>Not configured. To connect:</p>
                    <ol className="list-decimal pl-5">
                      <li>
                        Create an API key in the Sarvam dashboard
                        (dashboard.sarvam.ai).
                      </li>
                      <li>
                        Set SARVAM_API_KEY in this server&rsquo;s environment
                        (never with a NEXT_PUBLIC_ prefix) and restart.
                      </li>
                      <li>Return here and run the connection test.</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
            <TestButton
              action="test_sarvam"
              label="Run connection test (one short translation)"
              onDone={reload}
            />
            <Requests status={data.sarvam.status} />
            <details>
              <summary className="cursor-pointer font-semibold">
                Language coverage ({data.sarvam.languages.length} languages)
              </summary>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[30rem] text-left text-[0.9rem]">
                  <thead>
                    <tr className="rule border-b">
                      <th className="py-1 pr-3">Tag</th>
                      <th className="py-1 pr-3">Language</th>
                      <th className="py-1 pr-3">Script</th>
                      <th className="py-1">Speech and translation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sarvam.languages.map((l) => (
                      <tr key={l.tag} className="rule border-b">
                        <td className="py-1 pr-3">
                          <code>{l.tag}</code>
                        </td>
                        <td className="py-1 pr-3">
                          <span
                            lang={l.tag}
                            dir={l.direction === "auto" ? "auto" : l.direction}
                          >
                            {l.nativeName}
                          </span>{" "}
                          <span className="note">{l.name}</span>
                        </td>
                        <td className="py-1 pr-3">{l.script}</td>
                        <td className="py-1">
                          {l.availability === "available"
                            ? "Sarvam"
                            : "Typing only"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </Section>

          <Section
            title="Flagsmith"
            state={data.flagsmith.state}
            id="flagsmith"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-semibold">Evaluation</h3>
                <ul className="mt-2 grid gap-1">
                  <li>
                    Mode:{" "}
                    {data.flagsmith.mode
                      ? `${data.flagsmith.mode} evaluation${data.flagsmith.keyKind ? `, ${data.flagsmith.keyKind} key` : ""}`
                      : "not configured"}
                  </li>
                  {data.flagsmith.apiUrl && (
                    <li>API: {data.flagsmith.apiUrl}</li>
                  )}
                  <li>
                    Values in use come from:{" "}
                    <strong data-testid="flag-source">
                      {data.flagsmith.evaluation.source}
                    </strong>
                    {data.flagsmith.evaluation.reason
                      ? `, because ${data.flagsmith.evaluation.reason.toLowerCase()}`
                      : ""}
                  </li>
                  <li>
                    Last evaluated:{" "}
                    {when(data.flagsmith.evaluation.evaluatedAt)}
                  </li>
                  {data.flagsmith.mode === "local" && (
                    <li>
                      Environment document last refreshed:{" "}
                      {when(data.flagsmith.environmentFetchedAt)}
                    </li>
                  )}
                  <li>
                    Experiment events sent to Flagsmith:{" "}
                    {data.flagsmith.eventsEnabled ? "yes" : "no"}
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold">How quickly a change shows up</h3>
                <p className="mt-2">
                  {data.flagsmith.mode === "local"
                    ? `The server refreshes the Flagsmith environment every ${data.flagsmith.refreshSeconds} seconds; browsers re-check every 10 seconds. A flag change appears within about ${(data.flagsmith.refreshSeconds ?? 15) + 10} seconds, with no redeploy.`
                    : data.flagsmith.mode === "remote"
                      ? "Each evaluation calls Flagsmith, cached for 5 seconds; browsers re-check every 10 seconds. A change appears within about 15 seconds."
                      : data.flagsmith.mode === "offline"
                        ? "Flags come from a saved environment document. Changes in Flagsmith do not reach this server until the document is replaced."
                        : "Without Flagsmith, the defaults below apply and cannot be changed at runtime."}
                </p>
                {!data.flagsmith.mode && (
                  <ol
                    className="mt-3 list-decimal pl-5"
                    data-testid="flagsmith-setup"
                  >
                    <li>
                      Create a project and environment in Flagsmith and add the
                      flags listed below.
                    </li>
                    <li>
                      Copy the environment&rsquo;s server-side key (it starts
                      with ser.) into FLAGSMITH_ENVIRONMENT_KEY and restart.
                    </li>
                    <li>
                      Run the connection test, then toggle a flag and watch it
                      change here.
                    </li>
                  </ol>
                )}
              </div>
            </div>
            <TestButton
              action="test_flagsmith"
              label="Evaluate flags now"
              onDone={reload}
            />
            <div className="overflow-x-auto">
              <table
                className="w-full min-w-[48rem] text-left text-[0.92rem]"
                data-testid="flag-table"
              >
                <thead>
                  <tr className="rule border-b">
                    <th className="py-2 pr-4">Flag</th>
                    <th className="py-2 pr-4">Now</th>
                    <th className="py-2 pr-4">Default</th>
                    <th className="py-2">When off</th>
                  </tr>
                </thead>
                <tbody>
                  {data.flagsmith.flags.map((f) => (
                    <tr key={f.key} className="rule border-b align-top">
                      <td className="py-2 pr-4">
                        <code>{f.key}</code>
                        <p className="note text-[0.85rem]">{f.controls}</p>
                      </td>
                      <td
                        className={`py-2 pr-4 font-semibold ${f.value ? "text-emerald" : "text-vermilion"}`}
                        data-testid={`flag-${f.key}`}
                      >
                        {f.value ? "On" : "Off"}
                      </td>
                      <td className="py-2 pr-4">{f.default ? "On" : "Off"}</td>
                      <td className="py-2 text-[0.9rem]">{f.whenOff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-semibold">
                Remote configuration (
                <code>{data.flagsmith.remoteConfig.key}</code>)
              </h3>
              <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                {Object.entries(data.flagsmith.evaluation.config).map(
                  ([k, v]) => (
                    <li key={k}>
                      <code>{k}</code>: {v}
                      {data.flagsmith.remoteConfig.defaults[k] !== v ? (
                        <span className="note">
                          {" "}
                          (default {data.flagsmith.remoteConfig.defaults[k]})
                        </span>
                      ) : null}
                    </li>
                  ),
                )}
              </ul>
              {data.flagsmith.evaluation.configIssues.length > 0 && (
                <ul
                  className="mt-3 list-disc pl-5 text-vermilion"
                  data-testid="config-issues"
                >
                  {data.flagsmith.evaluation.configIssues.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              )}
              <p className="note mt-2 text-[0.85rem]">
                Each value is checked against its allowed range before use;
                anything invalid falls back to its default. Secrets never go in
                remote configuration.
              </p>
            </div>
            <div data-testid="experiment">
              <h3 className="font-semibold">
                Experiment: guided steps (A) or a single page (B) for creating a
                circle
              </h3>
              <p className="mt-1">
                {data.flagsmith.experiment.totalEvents === 0
                  ? "No experiment events recorded yet."
                  : `${data.flagsmith.experiment.totalEvents} events between ${when(data.flagsmith.experiment.firstEventAt)} and ${when(data.flagsmith.experiment.lastEventAt)}. Assigned by: ${Object.entries(
                      data.flagsmith.experiment.assignment,
                    )
                      .map(
                        ([k, v]) =>
                          `${k === "local-hash" ? "FESTIVA's local fallback" : k} ${v}`,
                      )
                      .join(", ")}.`}
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[44rem] text-left text-[0.92rem]">
                  <thead>
                    <tr className="rule border-b">
                      <th className="py-2 pr-4">Measure</th>
                      {data.flagsmith.experiment.variants.map((v) => (
                        <th key={v.variant} className="py-2 pr-4">
                          {v.variant === "guided"
                            ? "A, guided"
                            : "B, single page"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        [
                          "Started onboarding (sample size)",
                          (v) => String(v.started),
                        ],
                        ["Created a circle", (v) => String(v.created)],
                        ["Onboarding completion", (v) => pct(v.completionRate)],
                        [
                          "Median time to create",
                          (v) => secs(v.medianMsToCreate),
                        ],
                        [
                          "Circles with an invitation",
                          (v) => String(v.circlesWithInvite),
                        ],
                        [
                          "Invitations opened / joins",
                          (v) => `${v.invitesOpened} / ${v.joins}`,
                        ],
                        ["Join conversion", (v) => pct(v.joinConversion)],
                        [
                          "Joiners who added a preference",
                          (v) =>
                            `${v.participantsWithPreference} (${pct(v.preferenceCompletion)})`,
                        ],
                      ] as [
                        string,
                        (v: ExperimentSummary["variants"][number]) => string,
                      ][]
                    ).map(([label, fn]) => (
                      <tr key={label} className="rule border-b">
                        <td className="py-2 pr-4">{label}</td>
                        {data.flagsmith.experiment.variants.map((v) => (
                          <td
                            key={v.variant}
                            className="py-2 pr-4 tabular-nums"
                          >
                            {fn(v)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3" data-testid="experiment-verdict">
                {data.flagsmith.experiment.sufficient &&
                data.flagsmith.experiment.completionTest
                  ? `Completion rates differ with z = ${data.flagsmith.experiment.completionTest.z}, p = ${data.flagsmith.experiment.completionTest.pValue} (two-proportion test). Treat this as one signal, not a decision.`
                  : `Not enough data to compare: each variant needs at least ${data.flagsmith.experiment.minimumPerVariant} people who started onboarding. These are raw counts only.`}
              </p>
            </div>
            <Requests status={data.flagsmith.status} />
          </Section>

          <Section title="NudgeBee" state={data.nudgebee.state} id="nudgebee">
            <p className="max-w-3xl">
              NudgeBee is an AI SRE and CloudOps platform. FESTIVA sends it
              alert events through NudgeBee&rsquo;s documented Event Webhook and
              can read them back through its GraphQL API. NudgeBee investigates
              in its own interface; FESTIVA&rsquo;s runbooks still need approval
              here.
            </p>
            <div>
              <h3 className="font-semibold">
                Prerequisites, as this server can see them
              </h3>
              <ul
                className="mt-3 grid gap-3"
                data-testid="nudgebee-prerequisites"
              >
                {data.nudgebee.prerequisites.map((p) => (
                  <li key={p.label} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className={`mt-1 inline-block h-3 w-3 shrink-0 rounded-full ${p.met === true ? "bg-emerald" : p.met === false ? "bg-vermilion" : "bg-gold"}`}
                    />
                    <span>
                      <span className="font-semibold">{p.label}.</span>{" "}
                      <span className="note">
                        {p.met === true
                          ? "Met."
                          : p.met === false
                            ? "Missing."
                            : "Partly met."}
                      </span>{" "}
                      {p.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-start gap-6">
              <TestButton
                action="test_nudgebee_webhook"
                label="Send a labelled test event"
                onDone={reload}
              />
              <TestButton
                action="list_nudgebee_events"
                label="Read FESTIVA events from NudgeBee"
                onDone={reload}
              />
              {data.nudgebee.appUrl && (
                <a
                  href={data.nudgebee.appUrl}
                  className="btn btn-line btn-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open NudgeBee
                </a>
              )}
            </div>
            <Requests status={data.nudgebee.status} />
          </Section>
        </div>
      )}
    </AdminFrame>
  );
}
