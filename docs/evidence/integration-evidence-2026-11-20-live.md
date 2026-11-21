# FESTIVA integration evidence

Generated 2026-11-20T16:16:37.839Z by `npm run integrations:evidence`, FESTIVA 1.2.0 (commit unknown), Node v24.15.0, win32 10.0.26200.

Every secret value was replaced with [redacted] before this file was written. A result marked LOCAL TEST DOUBLE, OFFLINE DOCUMENT or LOCAL CHECK is not evidence of a live connection.

**Checks that reached a live service and passed: 3.**

| Check | Result | Target | Host | Detail | Time (UTC) |
| --- | --- | --- | --- | --- | --- |
| Sarvam translate | PASS | LIVE SERVICE | api.sarvam.ai | sarvam-translate:v1 answered (request 20261120_f792759c-5aca-4dfc-a35e-c5e97c774d28) | 2026-11-20T16:16:32.967Z |
| Sarvam speech-to-text | PASS | LIVE SERVICE | api.sarvam.ai | saaras:v4 answered (request 20261120_eb738f4f-bf9b-4a93-b648-bb7cdf14c1f2; transcript of silence is "हाँ।") | 2026-11-20T16:16:33.320Z |
| Flagsmith | PASS | LIVE SERVICE | edge.api.flagsmith.com | local evaluation; 8 of 10 FESTIVA flags on; onboarding variant guided (none); config issues: new_gift_circle_onboarding_enabled is on but its value is not "guided" or "single_page"; guided onboarding used and no exposure recorded | 2026-11-20T16:16:34.930Z |
| NudgeBee Event Webhook | SKIP | NOT CONFIGURED |  | NUDGEBEE_EVENT_WEBHOOK_URL is not set | 2026-11-20T16:16:37.175Z |
| NudgeBee GraphQL (read-only) | SKIP | NOT CONFIGURED |  | NUDGEBEE_API_URL or NUDGEBEE_API_TOKEN is not set | 2026-11-20T16:16:37.176Z |
| Sarvam attribution receipts | PASS | LOCAL CHECK |  | a receipt signed with a key derived from SARVAM_API_KEY verifies, and a tampered one is refused | 2026-11-20T16:16:37.273Z |
