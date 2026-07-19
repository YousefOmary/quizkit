# Atlas Sprint — design proposal

## Executive decision

Make Atlas Sprint the best short-session **world-knowledge game**, not a generic trivia container. Keep the Atlas name and geography promise, broaden far beyond capitals and area comparisons, and put an instant, personalized five-question run ahead of configuration.

Recommended product sentence: **“Five questions. One quick trip around the world.”**

Target outcome: a first-time player reaches a question in one tap; a returning player resumes in one tap; players who care about format, region, or timer can customize in one compact sheet.

### Audit basis

The proposal follows a local production build inspection of the light and dark home screens, How to Play, Settings, stats, awards, all four gameplay formats, answer feedback, pause/save, Daily timing, lifelines, and the completed-round screen. The audit was performed at the actual 520 px game shell and at a phone viewport. The current state is functional and coherent; the issues below are visual/product issues actually visible in those screens.

## 1. Vibe-coded red-flag audit

**Honest current state: 60% of a premium commercial release.** The hierarchy and interaction basics are better than a prototype, but the asset language, typography, and home information density still reveal a code-first build.

### Severity 1 — remove before flagship positioning

1. **Platform emoji are primary art, progression rewards, and result graphics.** Country flags are injected into question and comparison labels (`src/product/countries.ts:7`, `src/product/packs.ts:24`, `src/product/packs.ts:51`, `src/product/packs.ts:65`); achievements use footsteps, compass, graduation-cap, “100”, rocket, fire, satellite, target, and map emoji (`src/product/achievements.ts:25`, `src/product/achievements.ts:31`, `src/product/achievements.ts:34`, `src/product/achievements.ts:37`, `src/product/achievements.ts:40`, `src/product/achievements.ts:43`, `src/product/achievements.ts:46`, `src/product/achievements.ts:49`, `src/product/achievements.ts:52`); the result grid and progression rows use colored-square and fire/target emoji (`src/ui/resultsView.ts:25`, `src/ui/resultsView.ts:56`, `src/ui/resultsView.ts:86`, `src/ui/resultsView.ts:92`). This is the strongest “vibe-coded” tell because appearance changes by OS and the icon styles do not belong to one brand.
2. **The opening screen asks the player to understand the whole product before playing.** It stacks Continue, Daily, four regions, four formats, Start, level/XP, three goals, three stats, and two secondary destinations in one scroll (`src/ui/menuView.ts:99`, `src/ui/menuView.ts:109`, `src/ui/menuView.ts:111`, `src/ui/menuView.ts:115`, `src/ui/menuView.ts:119`, `src/ui/menuView.ts:120`, `src/ui/menuView.ts:127`, `src/ui/menuView.ts:129`, `src/ui/menuView.ts:132`). It is organized, but it reads as a dashboard rather than an irresistible game opening.
3. **There is no owned type system.** The entire product relies on Avenir/Segoe/system fallbacks (`src/styles/base.css:15`). The heavy rounded rendering looks materially different across Windows, Android, and Apple devices, so screenshots do not share a stable brand voice.

### Severity 2 — conspicuous commercial-polish gaps

4. **Brand and UI symbols come from several unrelated languages.** The visible brand is a letter “A”, the favicon is a compass-like inline shape, Settings is a gear emoji, region icons are geometric Unicode, and mode icons mix letters and symbols (`src/ui/menuView.ts:101`, `src/ui/menuView.ts:105`, `src/ui/menuView.ts:106`, `src/product/countries.ts:6`, `src/product/countries.ts:16`, `src/product/countries.ts:26`, `src/product/countries.ts:36`, `src/product/config.ts:27`, `index.html:16`). None is individually unusable; together they feel assembled rather than art-directed.
5. **The visual grammar is a familiar “rounded cards + pills + shadow” application template.** Daily, mode, stats, level, goal, and link components repeat the same rounded-rectangle treatment with limited material contrast (`src/styles/home.css:14`, `src/styles/home.css:31`, `src/styles/home.css:45`, `src/styles/home.css:53`, `src/styles/home.css:64`, `src/styles/home.css:72`, `src/styles/home.css:83`, `src/styles/home.css:92`). A game needs one memorable object or spatial metaphor, not only well-spaced cards.
6. **Motion is competent but generic.** Screen entrance is an 8 px rise/fade; feedback is a full-screen color flash; combo is a scale/rotate pop; results use standard confetti (`src/styles/motion.css:1`, `src/styles/motion.css:7`, `src/styles/motion.css:8`, `src/styles/motion.css:10`, `src/styles/motion.css:11`, `src/ui/resultsView.ts:118`). The motion does not yet express travel, routes, discovery, or map movement.
7. **Share/installation metadata does not look launch-ready.** The favicon is an inline generic SVG and the head has no Open Graph or Twitter image/title metadata (`index.html:9`, `index.html:10`, `index.html:14`, `index.html:16`, `index.html:20`). Shared links will not carry a controlled commercial preview.

### Severity 3 — refinement and accessibility risks

8. **Some secondary text is too small for an all-ages game.** Home labels, descriptions, goals, and footer reach `.62rem`–`.72rem` (`src/styles/home.css:11`, `src/styles/home.css:12`, `src/styles/home.css:42`, `src/styles/home.css:43`, `src/styles/home.css:61`, `src/styles/home.css:62`, `src/styles/home.css:83`, `src/styles/home.css:89`, `src/styles/home.css:98`); Settings and stats repeat `.62rem`–`.68rem` text (`src/styles/sheets.css:27`, `src/styles/sheets.css:31`, `src/styles/sheets.css:33`, `src/styles/sheets.css:38`, `src/styles/sheets.css:39`). These are legible on a good phone but not comfortably broad-appeal.
9. **Disabled lifelines communicate state mainly by fading and strike-through.** The `.42` opacity treatment is visibly weak on the play screen (`src/styles/quiz.css:34`, `src/styles/quiz.css:36`). Keep the text readable and add a distinct “Used” or unavailable state.
10. **A few lines sound like interface filler.** “Same facts, new challenge,” “Trust your gut,” and “A very quiet focus tone” are harmless but generic (`src/ui/menuView.ts:116`, `src/product/config.ts:29`, `src/ui/sheets.ts:83`). Prefer concrete value: “Two choices,” “No timer,” “Ambient sound.” “New facts unlocked” also implies an unlock that did not occur (`src/ui/resultsView.ts:43`).

### Specifically not observed

- No gratuitous stock-photo art or CDN asset dependency.
- No flat decorative gradient treatment; the current product is predominantly solid surfaces.
- Correct/wrong answers are not encoded by hue alone: text, borders, and check/cross marks are present (`src/styles/quiz.css:27`, `src/styles/quiz.css:30`, `src/styles/quiz.css:31`). Preserve that strength.
- Reduced-motion handling already exists (`src/styles/motion.css:14`). Preserve it.

## 2. Visual direction

### Direction A — Cartographer’s desk (recommended)

Premium editorial travel, not classroom worksheet and not faux-vintage explorer cosplay.

- **Wordmark:** custom “Atlas Sprint” lettering with a clipped compass notch in the A and one route-line flourish under Sprint. The compact mark is the same compass notch, not a separate icon.
- **Light palette:** parchment `#F7F2E8`, paper `#FFFCF6`, ink `#16212B`, route coral `#C44A2D`, sea `#1F6E8C`, success `#287A5A`, error `#B33A3A`.
- **Dark palette:** night map `#0F1820`, raised surface `#172630`, warm text `#F5EFE5`, route `#FF795B`, sea `#6BC0D6`, success `#6DBA87`, error `#FF827A`.
- **Type:** self-host **Bricolage Grotesque** WOFF2 for display/score and **Atkinson Hyperlegible Next** WOFF2 for questions and controls. Use tabular numerals for time and score. Ship only required weights and glyph subsets.
- **Icon language:** one 2 px rounded-stroke SVG set with route-like terminals. Region marks are simplified map/compass abstractions. Achievement art is a restrained set of stamped badges. Flags may remain factual content, but render owned SVG flag assets from an offline atlas rather than OS emoji.
- **Spatial motif:** a route ribbon connects Daily, run progress, and results. A compact map grid or contour texture appears only in hero/celebration moments; ordinary question cards stay quiet.
- **Motion:** a route draws between questions; answer reveal places a precise “pin” on the route; streak/combo accelerates the line; the result route resolves into a five-stop itinerary. Favor 160–240 ms transitions, one 500–700 ms reward beat, and no perpetual breathing animation.

### Direction B — Modern field guide

More playful and all-ages: cream cards, cobalt/leaf accents, bold cut-paper continent shapes, and soft sticker-like fact illustrations. It is friendlier but risks educational-app territory and needs more illustration production.

**Recommendation:** Direction A. It best supports the name, works in light and dark, feels adult without excluding children, and replaces the template/card impression with an owned travel metaphor.

### Production rules

- All fonts, SVGs, textures, flag atlases, social cards, and sounds ship locally; no runtime CDN.
- Use a 4/8 px spacing system with only 8, 12, 16, 24, and 32 px gaps in the normal shell.
- Use four text roles: display, question, control, metadata. Do not create a new size per component.
- Reserve shadows for hero, active answer, and modal elevation. Most list rows use border or tonal separation, not both.
- The mark, favicon, manifest icons, and social preview must come from the same master artwork.

## 3. Opening screen and mode selection

### Reject the mode → format → genre funnel

That funnel makes taxonomy the player’s first task. Three decisions before the first question are too much friction for a game promising a sprint. It also exaggerates the importance of formats: most players want “a good round,” not a rules-engine configuration.

### Recommended home

Above the fold:

1. Brand/level strip with Settings.
2. One dominant context-aware action:
   - unfinished session: **Continue — Question 3 of 5**;
   - returning player: **Play — World Mix · Pick One** using the last successful setup;
   - first session: **Play — World Mix · Pick One**.
3. A smaller **Today’s Route** card with status and time expectation.
4. A quiet **Customize** button.

Progress, goals, stats, awards, and mastery move to a Journey tab/sheet reached from the level strip. Do not put three daily chores on the opening screen.

### Concrete flows

```text
Home → Play → Question 1 → five-question run → Results → Play another / Home
Home → Today’s Route → canonical timed Daily → Results → Share / Home
Home → Customize → one sheet: Topic · Format · Timer → Start
Home → level strip → Journey: mastery · awards · stats
```

The Customize sheet is one screen, not a wizard:

- **Topic:** World Mix, then regions or topic packs.
- **Format:** Mix (when supported), Pick One, True/False, Type It, Larger.
- **Pace:** Relaxed or 15 seconds. Daily remains fixed at 15 seconds.
- Show the estimated length: “5 questions · about 60 seconds.”

### Daily decision to make now

Today’s current pack follows the selected region/format. Before launch, change Daily to one canonical route definition per date so the product can honestly say everyone receives the same challenge. Freeze the chosen daily manifest and seed contract before live players exist. If pack-specific Dailies are intentionally retained, label sharing with pack and format so scores are not implied to be globally comparable.

## 4. Should Atlas Sprint broaden beyond geography?

### Recommendation: broaden within world knowledge; do not add unrelated genres

Sport, general science, entertainment, and miscellaneous trivia would increase nominal topic breadth but weaken the Atlas promise, multiply editorial QA, and turn a distinctive product into a familiar quiz shell. Geography is already broad: place, language, nature, borders, flags, landmarks, population, climate, and human culture can support years of play.

The correct expansion is:

- **Core geography:** capitals, flags, country outlines, map location, neighbors, relative position, area/population ranges.
- **Places and landmarks:** UNESCO sites, cities, monuments, natural wonders.
- **Planet and nature:** rivers, mountains, deserts, oceans, biomes, records.
- **People and culture:** official languages, currencies, globally recognizable traditions; avoid stereotype-based questions.

Exclude volatile politics, disputed-border “gotchas,” obscure spelling traps, and culturally loaded rankings.

### Realistic launch content plan

Launch only when World Mix can run 20 sessions without obvious repetition.

- **600 atomic facts minimum**, producing roughly 1,200–1,800 prompts across compatible formats.
- Six launch packs of about 100 facts: Countries, Flags & Shapes, Capitals & Cities, Landmarks, Nature, and Neighbors/Map Sense.
- Difficulty mix per pack: 50% Foundation, 35% Explorer, 15% Expert. First session is Foundation-heavy; difficulty moves one tier only after a meaningful sample of recent answers.
- Each item stores: stable id, pack id, difficulty, canonical answer, accepted variants, explanation, source URL, source edition/date, ambiguity note, and locale note.
- Sources: UN M49/UN member-state records, ISO 3166, the archived CIA World Factbook for stable country facts, UNESCO for World Heritage, and primary national/geographic authorities where needed. Never source a launch fact only from a trivia site.
- QA: schema validation, duplicate/answer-collision checks, accepted-answer normalization tests, and a human editorial pass on every prompt/explanation. Recheck volatile numeric packs on a scheduled content revision, not silently.
- Preserve shipped pack ids. New packs get additive versioned ids. A changed fact set gets a new pack id if it can alter an existing Daily.

If the owner chooses multi-genre anyway, rebrand the umbrella before launch and do not ship a token set of 30 questions per genre. A credible multi-genre launch bar is at least four genres × 300 verified prompts, plus a neutral brand. That is a different product and schedule.

## 5. Addictive loop, without manipulation

### Session loop

- Target 45–90 seconds for five questions.
- Reveal lasts long enough to read one useful explanation; tapping advances after a minimum readable beat.
- Results answer three questions instantly: “How did I do?”, “What did I learn?”, “What can I do next?”
- Primary result action is **Play another** with the same setup. Secondary is **Change route**.

### Progression

- Keep XP and levels, but make the reward a **travel journal**: each completed pack fills a route stamp; mastery comes from demonstrated accuracy, not raw grinding.
- Reward cadence: immediate answer feedback; route progress every question; XP every run; one meaningful badge or journal unlock roughly every 3–5 early runs, widening later.
- Replace three homepage chores with one optional weekly expedition made of normal play. Daily streak remains a personal continuity signal, never a countdown or loss threat.
- Show current and personal-best streak without guilt copy. Missing a day simply starts a new route.
- Daily is one high-quality canonical run, not an obligation wall.

### Near-miss and comeback feel

- At results, say “1 answer from a perfect route” only when literally true.
- If the last question turns a run around, emphasize the earned comeback through route animation, not altered odds.
- Never manipulate question difficulty mid-answer, fabricate scarcity, send fake urgency, beg for ratings/shares, or force social posting.
- Assists remain finite and transparent. Assisted practice can grant learning progress, but competitive bests should be labeled assisted or excluded.

## 6. Ad placement

Portal principle: report opportunities at natural gameplay stops and let the host SDK decide whether inventory is ready. CrazyGames explicitly limits midgame ads to breaks such as death/level completion and requires rewarded ads to be opt-in; Poki describes commercial breaks between `gameplayStop` and the player’s next `gameplayStart`. See [CrazyGames ad requirements](https://docs.crazygames.com/requirements/ads/), [CrazyGames video ads](https://docs.crazygames.com/sdk/html5-v2/video-ads/), and [Poki HTML5 SDK guidance](https://sdk.poki.com/html5).

### Interstitial

- Eligible only after a completed results screen when the player taps **Play another**, **Change route**, or returns to play.
- Preserve the existing conservative local gate: no ad before three completed sessions, at least three sessions between requests, and at least eight minutes between shown interstitials (`src/product/adPolicy.ts:8`). This is a strong default even when the portal adds its own cap.
- Pause timer/audio before requesting; resume cleanly on success, cancellation, unavailable fill, or error.
- Never place an interstitial before the first run, between questions, during answer reveal, over celebration, on opening How to Play, or immediately after a rewarded ad.

### Rewarded

- Practice only; never canonical Daily (`src/product/adPolicy.ts:38`).
- Offer only on a paused boundary, never as a live question-screen button. Recommended use: after a timeout or result, **“Watch an ad to retry one missed question”** or **“Start the next practice with one extra assist.”** Mark the run assisted; do not let it set a competitive best.
- One rewarded claim per practice run, with an explicit label before the request. Grant only on verified completion; the existing idempotent ledger is the correct foundation (`src/product/adPolicy.ts:47`).
- Do not show a rewarded button when the adapter is unavailable; the dormant no-op integration must remain a complete game path (`src/platform/monetization.ts:24`).

### Banner and house promotion

- Prefer a portal-owned banner container outside the 520 px game shell on desktop. Do not shrink or cover gameplay to make room.
- Hide external banners on phone-sized play screens. If a portal mandates a mobile banner, show it only on Home/Results with reserved layout space after the first completed session.
- A tasteful internal house card may cross-promote another owned game on Results after three sessions. Never disguise it as a reward or answer option.

## 7. Broad appeal and accessibility

- Minimum 17 px body/question text and 14 px metadata at final CSS size; do not rely on logical canvas scaling.
- Minimum 48 × 48 px touch target, with 8 px separation for adjacent primary controls.
- Keep the existing keyboard/focus-visible foundation (`src/styles/base.css:48`) and ensure all custom sheet controls retain semantic names.
- Correct/wrong always uses icon + label + shape/border; color is reinforcement only.
- Flag questions need a text alternative. Do not make a flag glyph the only clue when screen-reader play is expected.
- Provide a reduce-motion option in Settings in addition to honoring the OS preference.
- Use simple international English; localize dates/numbers; accept common transliterations and diacritic-free answers where unambiguous.
- Content avoids disputed-territory traps, stereotypes, colonial framing, and “obvious to Americans/Europeans” assumptions.
- Keep question generation, fonts, art, and content offline-first. Pre-render/minify local SVG atlases and test startup/play on a low-end Android profile.
- Screen-reader announcements: question number, prompt, remaining time at meaningful thresholds, selected answer, correctness, explanation, and result. Do not announce timer changes every second.

## 8. Future-build constraints

These are acceptance constraints for the later implementation, not changes proposed in this PR:

- Once live, preserve pack ids and Daily seed `hash(dateKey|packId)` (`src/engine/daily.ts:38`). New or materially changed content uses additive, versioned pack ids.
- Preserve storage namespace `quizkit:atlas-sprint:v1:*` and use additive guarded migrations (`src/platform/productStore.ts:11`).
- Daily always remains a fixed 15-second timed format; practice may be relaxed (`src/product/session.ts:34`).
- Keep engine and mode modules pure. Product UI/content may compose them; do not push UI state into the rules engine.
- Ad adapters remain optional/dormant and the no-ad path stays fully functional (`src/platform/monetization.ts:24`).
- Everything works offline with no CDN or remote runtime assets.

## 9. Open decisions for Claude

1. **Product scope:** world knowledge under Atlas (recommended) vs unrelated multi-genre trivia. Trade-off: a stronger brand and achievable editorial quality vs a larger nominal audience and much larger content burden.
2. **Quick Play default:** World Mix + Pick One, relaxed (recommended) vs timed. Relaxed broadens accessibility; timed better matches “Sprint” and produces more score pressure.
3. **Daily definition:** one canonical route for everyone (recommended) vs one Daily per selected pack. Canonical improves sharing and comparability; pack-specific offers choice but fragments the event.
4. **Type pairing:** Bricolage Grotesque + Atkinson Hyperlegible Next (recommended) vs a quieter all-grotesk system. The pairing creates character while keeping question text highly readable; one family is cheaper and calmer.
5. **Home progression:** level strip opens a Journey sheet (recommended) vs a persistent progress card. The sheet protects one-tap simplicity; the card makes progress more visible but recreates dashboard density.
6. **Rewarded value:** one missed-question retry/next-run assist (recommended) vs no rewarded ads at launch. Rewarded improves revenue and voluntary value, but assisted-score rules and portal review add complexity.
7. **Flag rendering:** owned offline SVG atlas (recommended) vs flag emoji. SVG is stable and art-directed; emoji is smaller to ship but remains platform-dependent.
8. **Pre-launch compatibility:** finalize canonical Daily/content revision now (recommended) vs preserve today’s pack behavior. Changing now costs little; changing after a player base exists breaks shared expectations.
