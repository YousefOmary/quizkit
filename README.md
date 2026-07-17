# Atlas Sprint

Atlas Sprint is a polished, offline-first mobile geography game built with
vanilla TypeScript and the DOM. Pick a world region, choose one of four quiz
modes, and complete a deterministic daily route or an unlimited practice run.

## Product features

- Multiple choice, true/false, type-answer, and higher/lower modes
- Daily routes per region and mode, with a same-day completion guard
- Exact in-progress resume, including timer and lifelines
- 50:50, Skip, and +10-second lifelines
- Time bonuses, combo multipliers, route stats, and daily streaks
- Light/dark themes and gesture-gated procedural Web Audio
- Fully local PWA assets, service-worker caching, no ads or server claims

The bundled content is one curated dataset of 24 countries across the
Americas, Europe, Asia, and Africa. Capitals and total-area figures were
checked against the CIA World Factbook 2025 archive.

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
src/engine/    pure quiz state, seeded RNG, scoring, normalization, sharing
src/modes/     the four unchanged rules modules
src/product/   Atlas Sprint content, packs, settings, sessions, and stats
src/ui/        semantic DOM screens, timer lifecycle, and mobile keyboard
src/audio/     one shared procedural audio graph
src/platform/  guarded web/native storage adapters
tests/         deterministic engine, scoring, stats, and save/restore tests
```
