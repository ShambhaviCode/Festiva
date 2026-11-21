/**
 * FESTIVA feature flags: names, purposes and safe defaults.
 *
 * Shared by the server (which evaluates flags) and the browser (which only
 * receives evaluated values from /api/flags). No secrets live here.
 *
 * Defaults apply when Flagsmith is not configured, when a flag does not exist
 * in the Flagsmith environment, or when Flagsmith cannot be reached. They keep
 * the product usable; every server route enforces the same evaluated values.
 */

export const FLAG_KEYS = [
  "gift_circle_enabled",
  "sarvam_voice_enabled",
  "multilingual_onboarding_enabled",
  "gift_recommendations_enabled",
  "secret_santa_enabled",
  "cultural_context_enabled",
  "group_budget_insights_enabled",
  "premium_gifting_experience_enabled",
  "matchmaker_experiment_enabled",
  "new_gift_circle_onboarding_enabled",
] as const;
export type FlagKey = (typeof FLAG_KEYS)[number];

export const FLAG_INFO: Record<FlagKey, { default: boolean; controls: string; whenOff: string }> = {
  gift_circle_enabled: {
    default: true,
    controls: "The Gift Circle entry point, pages and API",
    whenOff: "Gift Circle disappears from navigation; its pages explain it is paused and its API answers 403.",
  },
  sarvam_voice_enabled: {
    default: true,
    controls: "Voice preference capture through Sarvam speech-to-text",
    whenOff: "The microphone and upload controls are removed and the voice API answers 403. Typing stays available.",
  },
  multilingual_onboarding_enabled: {
    default: true,
    controls: "Language choice when creating or joining a circle",
    whenOff: "Onboarding uses English (India) and hides the language picker.",
  },
  gift_recommendations_enabled: {
    default: true,
    controls: "Gift suggestions generated from preferences",
    whenOff: "Suggestions are hidden and their API answers 403. Wishlists can still be managed by hand.",
  },
  secret_santa_enabled: {
    default: true,
    controls: "Secret Santa assignment generation",
    whenOff: "Assignments cannot be drawn and the API answers 403. Existing assignments stay private but are not shown.",
  },
  cultural_context_enabled: {
    default: true,
    controls: "AI-written cultural suggestions (Sarvam)",
    whenOff: "AI suggestions are hidden. Festival information from FESTIVA's guide is still shown.",
  },
  group_budget_insights_enabled: {
    default: true,
    controls: "Budget insights for the organiser",
    whenOff: "The insights panel is hidden and the server stops computing it. Contributions are still recorded.",
  },
  premium_gifting_experience_enabled: {
    default: false,
    controls: "Elite-tier ideas in gift suggestions",
    whenOff: "Suggestions stop at the Premium tier even if a circle allows Elite.",
  },
  matchmaker_experiment_enabled: {
    default: false,
    controls: "A Matchmaker celebration plan generated inside the circle summary",
    whenOff: "The summary links to the Matchmaker instead of drafting a plan inline.",
  },
  new_gift_circle_onboarding_enabled: {
    default: true,
    controls: "The onboarding experiment (guided steps or single page)",
    whenOff: "Everyone gets the guided onboarding and no experiment exposures are recorded.",
  },
};

export const EXPERIMENT_FLAG: FlagKey = "new_gift_circle_onboarding_enabled";
export const REMOTE_CONFIG_KEY = "gift_circle_config";

export interface RemoteConfig {
  max_participants: number;
  max_recording_seconds: number;
  recommendation_count: number;
  invite_expiry_days: number;
}

export const DEFAULT_CONFIG: RemoteConfig = {
  max_participants: 30,
  // Sarvam's synchronous speech-to-text accepts at most 30 seconds of audio.
  max_recording_seconds: 30,
  recommendation_count: 4,
  invite_expiry_days: 14,
};

export const CONFIG_LIMITS: Record<keyof RemoteConfig, [number, number]> = {
  max_participants: [3, 200],
  max_recording_seconds: [5, 30],
  recommendation_count: [1, 12],
  invite_expiry_days: [1, 60],
};

export type FlagSource = "flagsmith" | "offline-document" | "defaults";

export interface EvaluatedFlags {
  flags: Record<FlagKey, boolean>;
  config: RemoteConfig;
  onboarding: { variant: "guided" | "single_page"; inExperiment: boolean; assignedBy: "flagsmith" | "local-hash" | "none" };
  source: FlagSource;
  /** Why defaults are in use, when they are. */
  reason: string | null;
  evaluatedAt: string;
}

export const DEFAULT_FLAGS: Record<FlagKey, boolean> = Object.fromEntries(FLAG_KEYS.map((k) => [k, FLAG_INFO[k].default])) as Record<FlagKey, boolean>;
