# Three-minute hackathon demo

One story, told in a single flow: **a family wants to celebrate a festival together, across languages, without chaos.** FESTIVA takes them from learning about the festival, to a plan, to a gift exchange that everyone can join in their own language.

The full ten-minute judge walkthrough is in [DEMO.md](DEMO.md). This is the short version.

## Before you present (10 minutes, once)

1. Start the production build. It is faster than `npm run dev`:
   ```powershell
   npm run build
   npm run start
   ```
2. **Choose your mode, and say it out loud during the demo:**
   - **Live sponsors:** `.env.local` holds your own keys, and `npm run integrations:evidence` passed. See [SPONSOR_EVIDENCE.md](SPONSOR_EVIDENCE.md).
   - **Offline demo:** no keys. Sarvam's voice is not shown: use typing, and say "voice needs Sarvam credentials, which are not connected on this laptop". Never present the local test doubles as the real services.
3. Open three browser windows:
   - **A**, normal: you, as the organiser;
   - **B**, private: Asha, a participant. A phone also works;
   - **C**: `/admin/integrations`, signed in with `FESTIVA_ADMIN_TOKEN` (live mode only).
4. Clear the circle from earlier rehearsals: stop the server, delete the `.festiva-data` folder, and start it again.
5. Secret Santa needs at least three people. During the demo, join a third person in another private window just before you press **Draw names**, or skip the draw.
6. Zoom the browser to 110–125% so the room can read it.

## The script

| Time | Do this | Say this |
| --- | --- | --- |
| **0:00–0:20** | Window A: open `/`. Let the globe turn once. Point at "Upcoming festivals". | "Festivals bring families together, but planning one across languages, cities and budgets is chaos. FESTIVA is one place to understand a celebration, plan it and organise the gifts." |
| **0:20–0:45** | Open **Discover**, then **Meskel**. Show the name in Ge'ez script, the calendar line, the symbols and the "What kind of information this page holds" section. | "We have 46 festivals from 40 countries, including Ethiopia, Ghana, Benin and the Sámi homeland. Every page separates documented history from belief and community practice, shows how the date is set, and says honestly that it has not yet been reviewed by a cultural expert." |
| **0:45–1:25** | Open **Diwali** and press **Plan Diwali with the Matchmaker**. Set 12 people and tick **Under 5** and **Over 65**. Enter a ₹24,000 budget. Choose **With its religious rites** and **A full day**. Finish the wizard. | "The festival is already filled in. The Matchmaker is deterministic: it uses rules and a curated guide, with no invented facts. Because toddlers are coming, there is a quiet-time block and no alcohol. Because we keep the rites, prayer is in the schedule. And the budget adds up to the rupee." Scroll to the schedule and the budget. |
| **1:25–1:50** | Press **Start a Gift Circle from this plan**. Show the prefilled festival, date, budget and group size. Enter your name and choose **Hindi**. Press **Create the circle**, then **Create invitation link**, then **Copy link**. | "One click carries the plan into a gift exchange. The invitation token sits after the hash in the link, so no server ever logs it." |
| **1:50–2:25** | Window B: paste the link. Join as **Asha** in **ಕನ್ನಡ (Kannada)**. **Live:** press **Speak**, give consent, say a preference in Kannada, then **Transcribe with Sarvam**, then **Translate into Hindi for the organiser**. **Offline:** type the preference in Kannada. Save it. | "**Sarvam AI** hears Asha in Kannada and translates for an organiser who reads Hindi. The original is always kept and shown first. Every Sarvam result carries a receipt signed by our server, so nobody can fake 'translated by Sarvam'." |
| **2:25–2:45** | **Live:** in the Flagsmith dashboard, switch off `sarvam_voice_enabled`. Within about 15 seconds, Asha's **Speak** button disables, with no reload. Switch it back on. **Offline:** with three people joined, press **Draw names** in window A: the organiser cannot see who gives to whom. | "**Flagsmith** controls ten features from outside the code, and the server enforces them, not only the buttons. **NudgeBee** gets our alerts, and nothing operational runs without a human approving it." |
| **2:45–3:00** | Open **See the summary**. | "Everyone's words in their own language, the budget, Secret Santa kept secret, and a plan for the day. All 11 modules work offline with no keys, and the tests pass: [numbers from TESTING.md]. Thank you." |

## If you have 30 more seconds

- **NudgeBee (live):**
  1. In window C, open `/admin/operations` and press **Start voice failure test**.
  2. In window B, try voice three times.
  3. Press **Evaluate rules now**: an alert labelled "[Controlled test]" is sent to NudgeBee, and two runbooks wait for approval.
- **Trust:** open `/privacy#children` and point out the voice and children's sections.

## Questions judges may ask

| Question | Honest answer |
| --- | --- |
| "Is the Sarvam, Flagsmith or NudgeBee connection live?" | Only what your latest evidence report shows as **LIVE SERVICE, PASS**. Otherwise: "Implemented to their documented APIs and tested against local test doubles; live verification needs credentials." |
| "Is the cultural content accurate?" | "Researched with cited sources, and each date has a status (checked, projected, rule-based or seasonal). No expert has reviewed it yet, and every page says so. The review workflow is in the repository." |
| "Is it deployed?" | "Not yet. It is ready for Vercel and Supabase, but deploying needs the founder's accounts and approval." |
| "Does it use AI to invent plans?" | "No. Plans come from deterministic rules over a curated guide. AI is used only for speech, translation and optional structuring, and is labelled wherever it appears." |
| "What about children's data?" | "Gift Circle is for adults, and a parent joins on a child's behalf. The Matchmaker's age question stores nothing about individuals. India's DPDP Rules require verifiable parental consent, which is listed for legal review." |
