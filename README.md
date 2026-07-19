# Atlas Sprint

Atlas Sprint is an offline-first world-knowledge game built with vanilla
TypeScript and the DOM. Quick Play starts a relaxed five-question World Mix in
one tap; the canonical Daily is one fair, deterministic, 15-second route for
everyone.

## Product features

- Six frozen launch packs: Countries, Flags & Shapes, Capitals & Cities,
  Landmarks, Nature, and Map Sense
- 600 atomic facts with stable IDs, difficulty tiers, source editions,
  verification dates, and ambiguity/locale notes
- Multiple choice, true/false, type-answer, and higher/lower modes
- One canonical Daily route seeded from `dateKey|packId`, with current and best
  streaks plus compact, spoiler-free sharing
- Exact in-progress resume, timer and lifelines included
- Optional one-question rewarded retry in practice only; assisted rounds cannot
  set competitive bests, and the no-ad adapter remains the default
- Local progression: XP, titles, topic mastery, daily goals, and achievements,
  all collected in the Journey sheet
- Self-hosted Latin WOFF2 fonts, a single SVG UI icon language, 100 bundled SVG
  flags, and fully local PWA/OG assets
- Light/dark/system themes, an in-app motion control, OS reduced-motion support,
  semantic feedback labels, and screen-reader timer announcements
- Service-worker precaching for the complete shell, fonts, and flag atlas; no
  remote runtime requests, accounts, tracking, leaderboards, or challenges

## Content provenance

The launch set uses 100 unambiguous UN member countries and 100 single-state
UNESCO properties. It is generated and editorially frozen by
`scripts/build-content.mjs`. Country groupings use UN M49, codes and flags use
ISO 3166, capitals and total areas are cross-checked against the final CIA World
Factbook archive, and landmark titles/locations use the UNESCO World Heritage
List. Automated checks enforce six 100-fact packs, a 50/35/15 difficulty split,
unique IDs and areas, local flag coverage, approved primary-source domains, and
representative capital fixtures.

## Commands

```sh
npm run typecheck
npm test
npm run build
npm run dev
```

GitHub Pages deployment runs from `.github/workflows/deploy.yml` on pushes to
`main`. Vite uses `base: './'` for project-page and Capacitor compatibility.

## Structure

```text
scripts/       source-verifying launch-content generator
src/engine/    pure quiz state, seeded RNG, scoring, normalization, sharing
src/modes/     the four unchanged rules modules
src/product/   frozen content, packs, sessions, stats, progression, policy
src/ui/        semantic DOM screens, timer lifecycle, sheets, and owned icons
src/audio/     one shared procedural audio graph
src/platform/  storage, haptics, analytics, and monetization adapters
tests/         engine, content, progression, policy, and save/restore checks
```
