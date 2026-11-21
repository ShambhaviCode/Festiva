# Native mobile: status and plan

**Status: not built.** There is no React Native or Expo project in this repository, and nothing has been submitted to an app store.

The build environment could produce and test a web application end to end. It could not build, run or test a native iOS or Android binary, so the brief's fallback applied: a polished responsive web app first, with an architecture a native client can share.

## What exists today

- The web app is responsive and tested at phone size: navigation, the Matchmaker and a game are exercised by touch in `tests/e2e/mobile.spec.ts`, and nine pages are checked for horizontal overflow.
- A web app manifest (`/manifest.webmanifest`) lets it be added to a home screen.
- `src/domain` and `src/data` are pure TypeScript with no React, Next.js or DOM imports.

## What a native app can reuse unchanged

| Module | Path |
| --- | --- |
| Date engine | `src/domain/dates.ts` |
| Budget arithmetic | `src/domain/budget.ts`, `src/domain/currency.ts` |
| Matchmaker engine and schemas | `src/domain/matchmaker/` |
| Search | `src/domain/search.ts`, `src/domain/text.ts` |
| Games logic | `src/domain/games.ts` |
| Greeting composition | `src/domain/wishes.ts` |
| Grounded assistant | `src/domain/intelligence.ts` |
| Curated dataset | `src/data/` |
| Backend | The same Supabase project, schema and RLS policies; the same `/api/intelligence` and `/api/share` endpoints |

## What remains to build

1. Create `apps/mobile` with Expo, Expo Router and TypeScript, and move `src/domain` and `src/data` into a shared workspace package (the `@/` import alias inside them would become a package name).
2. Screens: Discover, festival detail, Matchmaker wizard and plan, Wishes, Play, Sound, Intelligence, Account.
3. Replace browser-only pieces: `localStorage` with AsyncStorage or SQLite; canvas card export with `react-native-skia` or `expo-image-manipulator`; the Three.js globe with `expo-gl` or a static illustration; the Web Share API with `expo-sharing`.
4. Supabase Auth with `expo-secure-store` for session storage and deep links for magic links.
5. Maestro flows for the core journeys; EAS Build and Submit configuration.

Estimated scope: a separate project phase. None of it has been started.
