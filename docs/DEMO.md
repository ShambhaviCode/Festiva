# Judge demonstration script

About 10 minutes. Two browser windows are enough: one normal (organiser and admin), one private (participant). A phone works for the participant.

## 0. Before you start

**Live (needs real credentials; the intended demo)**

```bash
cp .env.example .env.local
# Fill in: FESTIVA_ADMIN_TOKEN, SARVAM_API_KEY, FLAGSMITH_ENVIRONMENT_KEY (ser.…),
# FLAGSMITH_REFRESH_SECONDS=5, NUDGEBEE_EVENT_WEBHOOK_URL, NUDGEBEE_EVENT_WEBHOOK_TOKEN
# (optionally NUDGEBEE_API_URL, NUDGEBEE_API_TOKEN). Set up Flagsmith as in SPONSORS.md.
npm install
npm run integrations:check        # expect PASS for each configured provider
npm run build && npm start        # http://localhost:3000
```

**Rehearsal without credentials (local test doubles, clearly labelled)**

```bash
npm run stubs &                   # canned Sarvam, Flagsmith and NudgeBee on :4010
FESTIVA_ADMIN_TOKEN=demo-admin-token-0123456789abcdef \
SARVAM_API_KEY=stub-sarvam-key SARVAM_API_URL=http://localhost:4010 \
FLAGSMITH_ENVIRONMENT_KEY=ser.stub-flagsmith-key FLAGSMITH_API_URL=http://localhost:4010/api/v1/ FLAGSMITH_REFRESH_SECONDS=5 \
NUDGEBEE_EVENT_WEBHOOK_URL=http://localhost:4010/api/webhooks/event NUDGEBEE_EVENT_WEBHOOK_TOKEN=stub-nudgebee-token \
NUDGEBEE_API_URL=http://localhost:4010 NUDGEBEE_API_TOKEN=sk-nb-stub \
npm start
# Flip a flag in the test double:  curl -XPOST localhost:4010/__stub/flag -d '{"name":"sarvam_voice_enabled","enabled":false}'
```

The admin page shows every provider as "Local test double, not the real service" in this mode.

## 1. Create (Flagsmith experiment)

Organiser window → **Gift Circle** in the header → **Start a gift circle**.

- Expected: either the four-step guided form or the single-page form. Which one is Flagsmith's decision for this browser (`new_gift_circle_onboarding_enabled`).
- Choose Diwali, a date, ₹12,000 total, ₹1,500 per gift, your name, and **Hindi** as your language. **Create the circle**.
- Expected: the organiser page, with you on the ring.

## 2. Invite

**Create invitation link** → **Copy link**.

- Expected: a link ending `#c=…&t=…`. The token is after `#`, so it is never sent to a server or logged.

## 3. Speak (Sarvam)

Participant window → open the link → name **Asha**, language **ಕನ್ನಡ (Kannada)** → **Join the circle**.

- **Speak** → tick the consent box → **Record**, say something like *"ನನಗೆ ಕೈಯಿಂದ ಮಾಡಿದ ಉಡುಗೊರೆಗಳು ಇಷ್ಟ"* ("I like handmade gifts") → **Stop** → **Transcribe with Sarvam**.
- Expected: the transcript in Kannada script, "Transcribed by Sarvam saaras:v4, heard as Kannada".

## 4. Understand

- Correct a word in the transcript.
- **Translate into Hindi for the organiser**. Expected: a separate, editable Hindi box labelled as a Sarvam translation.
- **Review details** → the kinds of gift, likes and materials are filled in ("Suggested by Sarvam's model") → adjust → **Save preference**.
- Expected card: Kannada original first, "then corrected by the participant", Hindi translation beneath, labelled.

## 5. Organise

Organiser window (refreshes by itself every 10 s):

- **Preferences**: Asha's card, original first.
- **Gift ideas** → Asha: ideas from FESTIVA's guide, each with its reasons, no prices.
- Add a third person (another private window), then **Draw names**. Expected: "drawn … for 3 people"; nobody's match is visible to the organiser. Asha's page shows only who she gives to.
- Asha: commit ₹3,000. Organiser **Budget**: committed, still to raise, even share, all adding up exactly.

## 6. Control (Flagsmith)

In Flagsmith (or the test double), turn **`sarvam_voice_enabled`** off.

- Expected within about `FLAGSMITH_REFRESH_SECONDS` + 10 s, without reloading: Asha's **Speak** button disables with "Voice input is switched off"; typing still works. The voice API now answers 403.
- `/admin/integrations` → the flag table shows it Off, source "flagsmith".
- Turn it back on. Optionally turn off `gift_circle_enabled`: the header link disappears and the pages say Gift Circle is paused.

## 7. Operate (NudgeBee)

Admin window → `/admin/operations` → sign in with `FESTIVA_ADMIN_TOKEN`.

- **Start voice failure test** (controlled test: the next five voice requests fail before reaching Sarvam).
- In Asha's window, try to transcribe three times. Each fails with a clear message; typing still works.
- **Evaluate rules now**. Expected:
  - Alert "[Controlled test] Voice transcription is failing", with findings and evidence (attempts, failures, codes).
  - "NudgeBee: Accepted by NudgeBee (HTTP 200)". In NudgeBee, **Troubleshoot → All Events** shows the event, labelled `controlled_test=true`; open it to see NudgeBee's investigation.
  - **Waiting for approval**: "Pause voice capture" and "End controlled tests". Nothing has run.
- On "End controlled tests", write a reason and **Approve and run**. Expected: "executed", and the audit trail shows proposed → approved → executed with your session.
- `/admin/integrations` → NudgeBee → **Read FESTIVA events from NudgeBee** lists NudgeBee's copy (with an API token).

For a real (not controlled) signal, use an invalid `SARVAM_API_KEY`: failures then carry the `auth` code and the alert is not labelled as a test.

## 8. Complete

Organiser → **See the summary**: everyone's words in their own languages with translations, Secret Santa status, budget, and a link to plan the day in the Matchmaker (or an inline plan when `matchmaker_experiment_enabled` is on). **Print or save as PDF**.

## If something fails during the demo

- Sarvam down: typing keeps working; the voice alert fires; pause voice through the runbook.
- Flagsmith unreachable: defaults apply and `/admin/integrations` says why.
- NudgeBee unreachable: alerts stay in the operations centre; delivery failures are shown and audited.
