# FESTIVA integration evidence

Generated 2026-11-21T18:00:46.758Z by `npm run integrations:evidence`, FESTIVA 1.2.0 (commit ecb8b7c), Node v24.15.0, win32 10.0.26200.

Every secret value was replaced with [redacted] before this file was written. A result marked LOCAL TEST DOUBLE, OFFLINE DOCUMENT or LOCAL CHECK is not evidence of a live connection.

**Checks that reached a live service and passed: 4.**

| Check | Result | Target | Host | Detail | Time (UTC) |
| --- | --- | --- | --- | --- | --- |
| Sarvam translate | PASS | LIVE SERVICE | api.sarvam.ai | sarvam-translate:v1 answered (request 20261121_9a10f48c-96cb-4e17-93b1-a762fb3a2cce) | 2026-11-21T18:00:42.782Z |
| Sarvam speech-to-text | PASS | LIVE SERVICE | api.sarvam.ai | saaras:v4 answered (request 20261121_27a4b800-8cb4-4cc5-8970-d38011b2e5e0; transcript of silence is "हाँ।") | 2026-11-21T18:00:42.994Z |
| Flagsmith | PASS | LIVE SERVICE | edge.api.flagsmith.com | local evaluation; 8 of 10 FESTIVA flags on; onboarding variant guided (none); config issues: new_gift_circle_onboarding_enabled is on but its value is not "guided" or "single_page"; guided onboarding used and no exposure recorded | 2026-11-21T18:00:43.642Z |
| NudgeBee Event Webhook | PASS | LIVE SERVICE | self-hosted NudgeBee Community (AWS) | Accepted by NudgeBee (HTTP 200); then Accepted by NudgeBee (HTTP 200) | 2026-11-21T18:00:45.728Z |
| NudgeBee GraphQL (read-only) | SKIP | NOT CONFIGURED |  | NUDGEBEE_API_URL or NUDGEBEE_API_TOKEN is not set | 2026-11-21T18:00:45.729Z |
| Sarvam attribution receipts | PASS | LOCAL CHECK |  | a receipt signed with a key derived from SARVAM_API_KEY verifies, and a tampered one is refused | 2026-11-21T18:00:46.276Z |
