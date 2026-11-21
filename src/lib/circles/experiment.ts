import path from "node:path";
import { identityFor, trackFlagsmithEvent } from "../integrations/flagsmith";
import { dataDir, readJsonFile, updateJsonFile } from "../server/json-store";

/**
 * The Gift Circle onboarding experiment: guided steps (A) against a single
 * page (B). Events are anonymous: the visitor's random browser identifier is
 * hashed before storage, and no names or circle content are recorded.
 *
 * Results are counts of what actually happened. FESTIVA does not extrapolate,
 * and it says when there is not enough data to compare variants.
 */

export const EXPERIMENT_EVENTS = ["onboarding_started", "circle_created", "invite_created", "invite_opened", "participant_joined", "preference_submitted"] as const;
export type ExperimentEventName = (typeof EXPERIMENT_EVENTS)[number];
export type Variant = "guided" | "single_page";

export interface ExperimentEvent {
  at: string;
  name: ExperimentEventName;
  variant: Variant;
  assignedBy: "flagsmith" | "local-hash" | "none";
  identity: string;
  circleId: string | null;
  ms: number | null;
}

const file = () => path.join(dataDir(), "experiment-events.json");
const MAX = 50_000;

export async function recordExperimentEvent(event: Omit<ExperimentEvent, "at" | "identity"> & { anonymousId: string }): Promise<void> {
  // Only people enrolled in the experiment are counted.
  if (event.assignedBy === "none") return;
  const stored: ExperimentEvent = {
    at: new Date().toISOString(),
    name: event.name,
    variant: event.variant,
    assignedBy: event.assignedBy,
    identity: identityFor(event.anonymousId),
    circleId: event.circleId,
    ms: event.ms,
  };
  await updateJsonFile<ExperimentEvent[], null>(file(), [], (current) => ({ next: [...current, stored].slice(-MAX), result: null }));
  if (event.assignedBy === "flagsmith") {
    trackFlagsmithEvent(event.name === "onboarding_started" ? "$exposure" : `gift_circle_${event.name}`, event.anonymousId, { variant: event.variant });
  }
}

export interface VariantResult {
  variant: Variant;
  started: number;
  created: number;
  completionRate: number | null;
  medianMsToCreate: number | null;
  circlesWithInvite: number;
  invitesOpened: number;
  joins: number;
  joinConversion: number | null;
  participantsWithPreference: number;
  preferenceCompletion: number | null;
}

export interface ExperimentSummary {
  variants: VariantResult[];
  minimumPerVariant: number;
  sufficient: boolean;
  /** Two-proportion z-test on completion rate; only computed when both variants have enough starts. */
  completionTest: { z: number; pValue: number } | null;
  assignment: Record<string, number>;
  totalEvents: number;
  firstEventAt: string | null;
  lastEventAt: string | null;
}

const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
};

/** Standard normal CDF (Abramowitz and Stegun 7.1.26), accurate to about 1e-7. */
function normalCdf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(x * x) / 2);
  return x >= 0 ? (1 + y) / 2 : (1 - y) / 2;
}

export function summarise(events: ExperimentEvent[], minimumPerVariant = 30): ExperimentSummary {
  const variants: VariantResult[] = (["guided", "single_page"] as const).map((variant) => {
    const own = events.filter((e) => e.variant === variant);
    const starters = new Set(own.filter((e) => e.name === "onboarding_started").map((e) => e.identity));
    const creations = own.filter((e) => e.name === "circle_created");
    const creators = new Set(creations.filter((e) => starters.has(e.identity)).map((e) => e.identity));
    const circles = new Set(creations.map((e) => e.circleId).filter(Boolean));
    const invited = new Set(own.filter((e) => e.name === "invite_created" && circles.has(e.circleId)).map((e) => e.circleId));
    const opened = own.filter((e) => e.name === "invite_opened" && circles.has(e.circleId));
    const joins = own.filter((e) => e.name === "participant_joined" && circles.has(e.circleId));
    const joiners = new Set(joins.map((e) => e.identity));
    const withPreference = new Set(own.filter((e) => e.name === "preference_submitted" && joiners.has(e.identity) && circles.has(e.circleId)).map((e) => e.identity));
    return {
      variant,
      started: starters.size,
      created: creators.size,
      completionRate: starters.size ? creators.size / starters.size : null,
      medianMsToCreate: median(creations.filter((e) => e.ms !== null && starters.has(e.identity)).map((e) => e.ms!)),
      circlesWithInvite: invited.size,
      invitesOpened: opened.length,
      joins: joins.length,
      joinConversion: opened.length ? Math.min(1, joins.length / opened.length) : null,
      participantsWithPreference: withPreference.size,
      preferenceCompletion: joiners.size ? withPreference.size / joiners.size : null,
    };
  });

  const [a, b] = variants;
  const sufficient = a.started >= minimumPerVariant && b.started >= minimumPerVariant;
  let completionTest: ExperimentSummary["completionTest"] = null;
  if (sufficient) {
    const pooled = (a.created + b.created) / (a.started + b.started);
    const se = Math.sqrt(pooled * (1 - pooled) * (1 / a.started + 1 / b.started));
    if (se > 0) {
      const z = (a.created / a.started - b.created / b.started) / se;
      completionTest = { z: Math.round(z * 1000) / 1000, pValue: Math.round(2 * (1 - normalCdf(Math.abs(z))) * 10000) / 10000 };
    }
  }
  const assignment: Record<string, number> = {};
  for (const e of events.filter((e) => e.name === "onboarding_started")) assignment[e.assignedBy] = (assignment[e.assignedBy] ?? 0) + 1;
  return {
    variants,
    minimumPerVariant,
    sufficient,
    completionTest,
    assignment,
    totalEvents: events.length,
    firstEventAt: events[0]?.at ?? null,
    lastEventAt: events.at(-1)?.at ?? null,
  };
}

export async function experimentSummary(): Promise<ExperimentSummary> {
  return summarise(await readJsonFile<ExperimentEvent[]>(file(), []));
}
