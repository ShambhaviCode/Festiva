# FESTIVA integration evidence

Generated 2026-11-18T02:36:54.299Z by `npm run integrations:evidence`, FESTIVA 1.2.0 (commit ea0454d), Node v22.23.4, linux 6.18.44-fc-v595.

Every secret value was replaced with [redacted] before this file was written. A result marked LOCAL TEST DOUBLE, OFFLINE DOCUMENT or LOCAL CHECK is not evidence of a live connection.

**Checks that reached a live service and passed: 0.**

| Check | Result | Target | Host | Detail | Time (UTC) |
| --- | --- | --- | --- | --- | --- |
| Sarvam translate | PASS | LOCAL TEST DOUBLE | localhost:4010 | sarvam-translate:v1 answered (request stub-tr-1) | 2026-11-18T02:36:54.178Z |
| Sarvam speech-to-text | PASS | LOCAL TEST DOUBLE | localhost:4010 | saaras:v4 answered (request stub-stt-2; transcript of silence is "मुझे हाथ से बनी चीज़ें पसंद है") | 2026-11-18T02:36:54.186Z |
| Flagsmith | PASS | LOCAL TEST DOUBLE | localhost:4010 | local evaluation; 8 of 10 FESTIVA flags on; onboarding variant guided (flagsmith) | 2026-11-18T02:36:54.254Z |
| NudgeBee Event Webhook | PASS | LOCAL TEST DOUBLE | localhost:4010 | Accepted by NudgeBee (HTTP 200); then Accepted by NudgeBee (HTTP 200) | 2026-11-18T02:36:54.273Z |
| NudgeBee GraphQL (read-only) | PASS | LOCAL TEST DOUBLE | localhost:4010 | 2 FESTIVA event(s) returned by NudgeBee | 2026-11-18T02:36:54.280Z |
| Sarvam attribution receipts | PASS | LOCAL CHECK |  | a receipt signed with a key derived from SARVAM_API_KEY verifies, and a tampered one is refused | 2026-11-18T02:36:54.293Z |
