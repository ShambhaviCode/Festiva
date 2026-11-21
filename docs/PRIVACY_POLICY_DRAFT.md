# FESTIVA privacy policy: DRAFT

> **Draft for legal review. Not in force.** Written by the project from what the software actually does, as a starting point for a lawyer. Replace every `[bracketed]` item, and have it reviewed against the law of each country where FESTIVA is offered (see [LEGAL_REVIEW.md](LEGAL_REVIEW.md)) before publishing.

Last updated: [date]. Operator: [legal name, address]. Contact for privacy questions: [email]. [Data Protection Officer or designated contact, if required.]

## 1. What this policy covers

The FESTIVA website and its features: the festival guide (Discover, Journeys, Taste, Wear, Shop, Wishes, Play, Sound), Intelligence, the Matchmaker, saved plans and sharing, accounts, and Gift Circle.

## 2. What we collect, and why

| What | When | Why | Where it is kept |
| --- | --- | --- | --- |
| Saved festivals, wishlists, favourites, game scores, display preferences, plans | When you use those features | To remember your choices | Your browser only, unless you sign in |
| Email address | If you create an account [when enabled] | To sign you in | Our authentication provider [Supabase] |
| Plans you save while signed in | When you save | To let you open them on other devices | Our database, readable only by you |
| A shared plan | Only when you press "Create share link" | So people with the link can view it | Our server or database, until you revoke it |
| Questions to Intelligence | When you ask | To answer them | Not stored; sent to [AI provider] only if one is connected |
| Gift Circle: the name you choose, your language, preferences, wishlist, contribution commitments, Secret Santa match | When you create or join a circle | To run the circle for its members | Our server [or database], until the organiser deletes the circle |
| Voice recordings | Only after you tick the consent box | To transcribe your preference | Not stored. Sent to Sarvam AI for transcription, then discarded |
| A random browser identifier, hashed | When you use Gift Circle | To choose features and the set-up version you see, and to count set-up steps | Hashed before it reaches Flagsmith or our counters. Not counted if your browser sends Do Not Track or Global Privacy Control |
| Product events (for example "plan shared") | When you use features | To understand which features are used | Our server; no cookies, no identifiers |
| Technical measurements (request counts, timings, error codes) | Always | To keep the service reliable | Our server; may be sent to our monitoring tools [Prometheus, NudgeBee]. No names, preferences or recordings |

We do not sell personal data, show advertising, or use third-party trackers.

## 3. Lawful basis [to be confirmed by counsel]

- **Consent** for voice recordings and for Gift Circle preferences you choose to share.
- **Performance of a service you asked for** for accounts, saved plans, sharing and running a circle.
- **Legitimate interests / reasonable purposes** for security, rate limiting and reliability measurements.

## 4. Who receives data

| Recipient | What | Why |
| --- | --- | --- |
| Sarvam AI | Voice recordings, text to translate, preference text to structure | Speech recognition, translation and suggestions, only when you use them |
| Flagsmith | A hashed browser identifier and, if enabled, set-up events | Feature flags and the set-up experiment |
| NudgeBee | Operational alerts (service, error type, counts) | Incident response; no personal data |
| [Hosting provider, e.g. Vercel] | All traffic in transit | Hosting |
| [Supabase] | Account email, saved plans, shared plans, circles | Database and sign-in |
| [AI provider, if connected] | Questions and relevant guide entries | Answering questions |

[Describe where each provider stores data and the transfer mechanism, for example India, the EU or the US.]

## 5. Voice recordings

Voice input is off unless Sarvam AI is connected. Each recording needs your consent. It is held in memory only while it is being transcribed, never written to disk or logs, and then discarded. You review and can correct the transcript before anything is saved; only the transcript you approve is kept. Sarvam AI's own terms apply to what it receives: [link].

## 6. Children

FESTIVA's guide, games and greeting cards need no personal information. Accounts and Gift Circle are intended for adults; a parent or guardian should join a circle on a child's behalf. [If children will use Gift Circle directly, describe the verifiable parental consent mechanism required by the DPDP Rules, 2025 before enabling it.] The Matchmaker's age-group question collects no data about individuals.

## 7. How long we keep data

- Browser data: until you clear it.
- Gift Circle: until the organiser deletes the circle [or: automatically N days after the celebration date, to be decided].
- Shared plans: until revoked [or: automatic expiry, to be decided].
- Accounts: until you delete your account [deletion process to be described].
- Technical logs: [N] days.

## 8. Your rights

[List rights under applicable law, for example access, correction, erasure, grievance redressal, nominating another person, and withdrawal of consent; how to exercise them; response times; and how to complain to the Data Protection Board of India or another regulator.]

In the product today you can: delete your preferences and wishlist items, leave a circle, have the organiser delete a circle, revoke share links, and clear browser storage.

## 9. Security

Circle access uses private keys stored only as one-way hashes; invitation tokens travel after the `#` in links, which browsers do not send to servers; database rows are protected with Row Level Security; provider keys stay on the server; provider attribution is signed by the server. No system is perfectly secure: [breach notification commitments].

## 10. Changes and contact

[How changes are announced.] Questions: [email].
