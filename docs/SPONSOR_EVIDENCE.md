# Sponsor integrations: set-up and evidence guide

How to connect Sarvam AI, Flagsmith and NudgeBee with **your own** accounts and produce evidence that the connections are real. You run this on your own computer; it takes about 20 minutes.

## What has and has not been proven

| Sponsor | Code status | Proven against the real service? |
| --- | --- | --- |
| Sarvam AI | Implemented: speech to text, translation, structuring, signed receipts | **Yes**, 20 November 2026: LIVE SERVICE, PASS ([report](evidence/integration-evidence-2026-11-20-live.md)) |
| Flagsmith | Implemented: official SDK, ten server-enforced flags, remote configuration, A/B experiment | **Yes**, 20 November 2026: LIVE SERVICE, PASS ([report](evidence/integration-evidence-2026-11-20-live.md)) |
| NudgeBee | Implemented: Event Webhook delivery, GraphQL read-back, alert rules, approval-gated runbooks | **Yes**, 21 November 2026: LIVE SERVICE, PASS on a self-hosted NudgeBee Community install ([report](evidence/integration-evidence-2026-11-21-live.md)) |

What *has* been proven is that FESTIVA's provider code sends the documented request shapes and handles every response correctly against **local test doubles**: canned imitations of each API in `tests/stubs/provider-stubs.mjs`. Those results are always labelled **LOCAL TEST DOUBLE** and must never be presented as live. A sample is in [evidence/SAMPLE-local-test-doubles.md](evidence/SAMPLE-local-test-doubles.md).

## Rules for credentials

- Keys go only in `.env.local` in the FESTIVA folder. That file is ignored by Git and excluded from the release ZIP.
- Never paste a key into a chat, an issue, a screenshot or a commit. The evidence reports redact every secret automatically; check them before sharing anyway.
- Every sponsor variable is server-only. Never give one a `NEXT_PUBLIC_` prefix.
- All three services have free tiers or credit. Do not upgrade a plan to make the demo work; if a free limit is reached, the app falls back and says so.

## 1. Get the credentials

### Sarvam AI
1. Sign in at <https://dashboard.sarvam.ai> and create an API key. New accounts receive free credit; check the current amount on Sarvam's pricing page.
2. In `.env.local`: `SARVAM_API_KEY=<your key>`.

### Flagsmith
1. Sign up at <https://app.flagsmith.com> (the free plan includes 50,000 requests a month). Create a project, for example "FESTIVA", which comes with Development and Production environments.
2. In the Development environment, create these flags. Each is **enabled** unless marked otherwise:
   - `gift_circle_enabled`;
   - `sarvam_voice_enabled`;
   - `multilingual_onboarding_enabled`;
   - `gift_recommendations_enabled`;
   - `secret_santa_enabled`;
   - `cultural_context_enabled`;
   - `group_budget_insights_enabled`;
   - `premium_gifting_experience_enabled` (**disabled**);
   - `matchmaker_experiment_enabled` (**disabled**);
   - `new_gift_circle_onboarding_enabled`: make it multivariate with variations `guided` and `single_page`, 50/50, and the control value `guided`.
3. Optional: create `gift_circle_config` with the value `{"max_participants":30,"max_recording_seconds":30,"recommendation_count":4,"invite_expiry_days":14}`.
4. Go to **Environment settings → Keys** and create a **server-side key**, which starts with `ser.`.
5. In `.env.local`: `FLAGSMITH_ENVIRONMENT_KEY=ser.<…>` and `FLAGSMITH_REFRESH_SECONDS=5` (for a fast demo).

### NudgeBee
1. You need a NudgeBee workspace: either NudgeBee Cloud (ask NudgeBee or the hackathon organisers for access) or a self-hosted install. Self-hosting needs a Kubernetes cluster; see [NUDGEBEE_DEMO.md](NUDGEBEE_DEMO.md), and do not create paid infrastructure without deciding to.
2. Go to **Admin → Integrations → Webhooks** and add an **Event Webhook**. Copy its URL and token.
3. In `.env.local`: `NUDGEBEE_EVENT_WEBHOOK_URL=<url>` and `NUDGEBEE_EVENT_WEBHOOK_TOKEN=<token>`.
4. Optional, to read events back: go to **avatar → API Tokens**, create a Platform token limited to Events, then set `NUDGEBEE_API_URL=<your NudgeBee base URL>` and `NUDGEBEE_API_TOKEN=<token>`.

### FESTIVA's own tokens
Generate two random values and add them as `FESTIVA_ADMIN_TOKEN` and `FESTIVA_METRICS_TOKEN`. Each must be at least 24 characters.
- **bash:** `openssl rand -base64 32`
- **PowerShell:** `[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Max 256}))`

## 2. Produce the evidence

```bash
npm run integrations:evidence
```

The script makes a few small, real requests through the same provider code the app uses, then:

- prints `PASS`, `FAIL` or `SKIP` for each check;
- writes `evidence/integration-evidence-<date-time>.md` and `.json`. Each report records:
  - when it ran, the FESTIVA version and Git commit, Node.js and the operating system;
  - for each check: the time, the target host, the result and a detail line;
  - the provider's request ID, where it returns one (Sarvam does);
- labels every result with one of these:

| Label | Meaning |
| --- | --- |
| **LIVE SERVICE** | The request went to the provider's real host and succeeded. This is the evidence that counts |
| **LOCAL TEST DOUBLE** | The URL pointed at `localhost` (the stubs). Proves the code path, not the service |
| **NOT CONFIGURED** | The variable is missing; nothing was sent |
| **LOCAL CHECK** | A check inside FESTIVA, such as signing and verifying a Sarvam receipt |

A FAIL comes with the provider's status and error code (for example `auth` for a wrong key, `network` for a blocked connection), so it can be fixed.

What each check does:

- **Sarvam:** translates one short sentence (about 40 characters), then transcribes one second of silence, which should come back empty. Together they cost a fraction of a rupee.
- **Flagsmith:** downloads the environment document and evaluates every FESTIVA flag.
- **NudgeBee:** sends one event labelled `controlled_test=true` (firing, then resolved) and, with an API token, reads it back.

### Recording a live Flagsmith change

```bash
npm run integrations:evidence -- --watch-flag sarvam_voice_enabled
```

For up to three minutes, the script re-evaluates the flag every 5 seconds. While it runs, switch `sarvam_voice_enabled` off and then on again in the Flagsmith dashboard. It stops after two changes, and the report shows each one with the time FESTIVA saw it. If it sees no change in three minutes, it records a FAIL. This proves that remote control works with no redeploy.

### In the running app

1. Run `npm run build` and then `npm run start`.
2. Open `/admin/integrations` and sign in with `FESTIVA_ADMIN_TOKEN`.
3. Press each **Run connection test**. A badge says **Connected** only after a genuine request has succeeded; with stubs it says **Local test double, not the real service**.
4. Take screenshots of this page for the submission, without the browser's address bar if your URL is private.

## 3. Share the evidence

1. Open the newest report in `evidence/`. Check that no secret appears: values are shown as `[redacted]`, and hosts and request IDs are not secret.
2. Copy it into `docs/evidence/` and commit it, or attach it to the submission.
3. Describe each sponsor's status in exactly the words the report supports:
   - "Sarvam: LIVE SERVICE, PASS, 18 November 2026" only if the report says so;
   - otherwise "implemented; verified against local test doubles".

## If something fails

| Result | Likely cause | Fix |
| --- | --- | --- |
| Sarvam FAIL `auth` | Wrong or revoked key | Create a new key; check for spaces in `.env.local` |
| Sarvam FAIL `rate_limited` or `quota` | Free credit used up | Wait, or decide yourself whether to add credit |
| Flagsmith FAIL `auth` | A client key (not `ser.`) or the wrong environment | Use a server-side key from the same environment as the flags |
| Flagsmith PASS but flags show defaults | Flag names differ | Names must match exactly (lower case, underscores) |
| NudgeBee FAIL `network` | Webhook URL unreachable from your network | Check the URL in a browser; a self-hosted NudgeBee must be reachable from your machine |
| Any FAIL `network` behind a company proxy | The proxy blocks the host | Try another network |

The app itself never depends on these services being up: each one falls back to an honest "not configured" or "unavailable" state.
