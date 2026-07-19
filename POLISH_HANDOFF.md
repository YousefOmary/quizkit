# Atlas Sprint polish handoff

**Honest state assessment — 84% shipped:** the mustard/dark product system, hierarchy, question flow, feedback, progression, settings, and results already feel cohesive; the remaining hobby-project tells are platform emoji/symbols in core identity surfaces and a shared link with no authored social card.

## Hard constraints

- This is a visual/feel pass only. Do not change quiz logic, scoring, question selection, generators, seeds, solvers, mode behavior, data facts, persistence semantics, ads, or analytics.
- Do not change pack ids such as `americas-capitals-mc-v1`, or the daily seed `hash(dateKey|packId)`.
- Keep every `quizkit:atlas-sprint:v1:*` storage key; migrations may only be additive.
- Daily remains always 15-second timed. Keep the engine and modes pure. Keep ad/analytics adapters dormant no-ops.
- `public/sw.js` must retain `ignoreVary: true`. If any asset or the service worker changes, add the local asset to the precache and bump `CACHE` from its current version (`public/sw.js:1-20`).
- Offline-first: no CDN, remote font, remote image, or runtime asset fetch. Ship every new font/image in the repo.
- Every animation must have a useful static end state and respect `prefers-reduced-motion`; preserve the existing global guard in `src/styles/motion.css:13-15`.
- Preserve the existing motion and result celebration; this is refinement, not a redesign (`src/styles/motion.css:1-10`, `src/ui/resultsView.ts:73-91`).

## Ordered passes

### Pass 1 — Replace platform emoji and generic glyphs with one Atlas icon language

This is the highest-visibility tell. The live home uses text symbols for regions and modes, an emoji gear and flame, while questions use OS-rendered country flags. Those values originate in `src/product/countries.ts:4-45`, `src/product/config.ts:26-32`, and are inserted as text in `src/ui/menuView.ts:49-66` and `src/ui/menuView.ts:99-122`. Gameplay prompts concatenate flags in `src/product/packs.ts:24-66`; result/streak surfaces repeat the flame in `src/ui/resultsView.ts:56` and `src/product/achievements.ts:43`.

- Create a tiny repo-local SVG component/sprite with a consistent 2 px rounded-stroke, geometric “atlas/route” vocabulary for region, mode, settings, streak, back, and help marks. Reuse the existing category accent colors; do not import an icon library.
- Replace flag emoji in prompts/comparison labels with a deliberately drawn, compact country token: two-letter ISO-style monogram or simplified locally-authored flag tile. Keep country names and facts unchanged.
- Keep share-result emoji grids as text because they are an external sharing convention, not UI artwork (`src/ui/resultsView.ts:32-56`).
- Update `src/styles/home.css:43-65`, `src/styles/base.css:67-71`, and the question/prompt styles only as needed so all new marks share optical size, baseline, and selected-state treatment.

**Acceptance check:** on macOS, Windows, Android, and iOS screenshots, home, settings entry points, gameplay prompts, results, All stats, and Awards contain no OS emoji artwork or mismatched text-symbol icons; every icon remains crisp at 1× and 2×, and screen-reader labels still name the action rather than the art.

### Pass 2 — Make the shared link look published

`index.html:9-20` has a good description and favicon but no Open Graph or Twitter metadata.

- Add canonical, `og:title`, `og:description`, `og:type`, `og:url`, `og:image`, image dimensions/alt, and `twitter:card/title/description/image` tags to `index.html`.
- Author a local 1200×630 `public/og.png` using the existing monogram, mustard/dark palette, “Know the world. Beat the clock.” line, and one route motif. Do not use a screenshot or remote asset.
- Add `./og.png` to `CORE` and bump the service-worker cache version while retaining the current dynamic hashed-asset caching and `ignoreVary: true` behavior (`public/sw.js:1-20`).

**Acceptance check:** Facebook/Discord/Slack/Twitter validators resolve a 1200×630 card with the correct absolute GitHub Pages URL; the page still boots fully offline after one visit and `og.png` is served from the new cache when offline.

### Pass 3 — Give the existing feedback one authored travel motif

The live answer reveal and result state are already clear and animated; do not replace them. Add one lightweight product-specific layer around them: a route-line draw or waypoint stamp when an answer locks, and a short destination-stamp settle on result entry. Wire it through the existing reveal host in `src/ui/quizView.ts:61-127`, the existing timing tokens in `src/product/config.ts:20-23`, and the current result mark/confetti in `src/ui/resultsView.ts:29-54`.

- Keep layout, answer timing, score count-up, confetti, audio, and all state transitions unchanged.
- Use CSS transforms/opacity or a small inline SVG; do not add canvas, a dependency, or per-frame DOM churn.
- Under reduced motion, show the final stamp/route state immediately and suppress travel/draw motion.

**Acceptance check:** correct, incorrect, timeout, skip, and final-result captures each have a distinct but restrained visual response; rapid answers never overlap animation, the timer remains readable, and reduced-motion mode shows no travel or confetti animation.

### Pass 4 — Tighten the expanded journey surfaces

The current home now includes level, XP, goals, All stats, and Awards below the core play controls (`src/ui/menuView.ts:87-125`). Keep that progression feature, but unify its density with the earlier region/mode cards.

- Normalize icon/text baselines, section spacing, and numeric alignment across the journey card, goals, stats sheet, and awards sheet in `src/styles/home.css` and the sheet styles.
- Give zero-state goals and locked awards an authored empty state using the same route/waypoint shapes from Pass 1; do not introduce characters, mascots, or more copy.
- Preserve the current Avenir-first stack in `src/styles/base.css:1-17`; only ship a local font if visual QA proves cross-platform metrics break the layout.

**Acceptance check:** at 320×568, 390×844, and 768×1024, no section clips or looks like a separate design system; zero progress, partial progress, and unlocked-award states are visually intentional, and the Start action remains above the fold on a common phone viewport.

## Finish

1. Run the existing test/build commands and keep them green.
2. Manually replay all four modes in light/dark and reduced-motion settings; capture home, settings/help, correct, incorrect, timeout, result, stats, awards, and offline reload at phone and tablet widths.
3. Verify no network request targets a CDN or remote asset, and verify the bumped service worker upgrades cleanly from the prior cache.
4. Diff storage, pack ids, seeds, timers, engine/mode modules, and adapters; the polish PR must not alter them.
5. Finish only when portal-sized screenshots look authored, social validators pass, keyboard/focus states remain visible, and the installed/offline build matches the online build.
