/** Shared between the browser tracker and the server endpoint. */
export const EVENT_NAMES = [
  "page_view",
  "festival_view",
  "matchmaker_start",
  "matchmaker_complete",
  "plan_saved",
  "plan_shared",
  "greeting_created",
  "returning_visit",
  "referral_visit",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];
