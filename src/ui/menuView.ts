import type { ModeId } from '../engine/types.js';
import { CATEGORIES } from '../product/countries.js';
import { MODE_INFO, PRODUCT_NAME } from '../product/config.js';
import type { CategoryId, DailyMeta, GameSession, ModeStats } from '../product/types.js';
import { clearChildren, h } from './dom.js';

/** Progression summary the home hub displays. */
export interface JourneyState {
  level: number;
  title: string;
  xpInto: number;
  xpNeed: number;
  missions: Array<{ label: string; progress: number; target: number }>;
  awardsEarned: number;
  awardsTotal: number;
}

/** Selected home data that can update without rebuilding the screen. */
export interface HomeState {
  categoryId: CategoryId;
  modeId: ModeId;
  dailyStatus: 'new' | 'resume' | 'done';
  stats: ModeStats;
  dailyMeta: DailyMeta;
  active: GameSession | null;
  journey: JourneyState;
}

/** Home navigation callbacks. */
export interface HomeActions {
  onSelection: (categoryId: CategoryId, modeId: ModeId) => void;
  onDaily: () => void;
  onPractice: () => void;
  onContinue: () => void;
  onSettings: () => void;
  onHelp: () => void;
  onStats: () => void;
  onAwards: () => void;
}

/** Targeted home updates for daily state and selected-combo stats. */
export interface HomeHandle {
  update: (state: HomeState) => void;
}

/** Render the mobile-first home hub once. */
export function renderMenuView(root: HTMLElement, state: HomeState, actions: HomeActions): HomeHandle {
  let current = state;
  const categoryButtons = CATEGORIES.map((category) => h('button', {
    className: 'category-chip',
    onClick: () => actions.onSelection(category.id, current.modeId),
    attrs: { type: 'button', 'data-category': category.id },
  }, [
    h('span', { className: 'category-icon', text: category.icon }),
    h('span', { text: category.name }),
  ]));
  const modeIds = Object.keys(MODE_INFO) as ModeId[];
  const modeButtons = modeIds.map((modeId) => {
    const info = MODE_INFO[modeId];
    return h('button', {
      className: 'mode-card',
      onClick: () => actions.onSelection(current.categoryId, modeId),
      attrs: { type: 'button', 'data-mode': modeId },
    }, [
      h('span', { className: 'mode-icon', text: info.icon }),
      h('span', { className: 'mode-copy' }, [h('strong', { text: info.label }), h('small', { text: info.short })]),
    ]);
  });
  const dailyTitle = h('strong', { className: 'daily-title' });
  const dailyCopy = h('span', { className: 'daily-copy' });
  const dailyButton = h('button', {
    className: 'daily-card',
    onClick: actions.onDaily,
    attrs: { type: 'button' },
  }, [
    h('span', { className: 'daily-kicker', text: 'TODAY’S ROUTE' }),
    dailyTitle,
    dailyCopy,
    h('span', { className: 'daily-go', text: 'Go →' }),
  ]);
  const continueCopy = h('span', { className: 'continue-copy' });
  const continueButton = h('button', {
    className: 'continue-card',
    onClick: actions.onContinue,
    attrs: { type: 'button' },
  }, [h('span', { text: 'Continue' }), continueCopy, h('b', { text: 'Resume →' })]);
  const accuracy = h('strong');
  const played = h('strong');
  const best = h('strong');
  const streak = h('strong');
  const levelBadge = h('span', { className: 'level-badge' });
  const levelTitle = h('strong');
  const levelXp = h('span');
  const xpFill = h('i');
  const goalsList = h('div', { className: 'goals-list' });
  const awardsButton = h('button', {
    className: 'journey-link', onClick: actions.onAwards, attrs: { type: 'button' },
  });
  const screen = h('main', { className: 'screen home screen-enter' }, [
    h('header', { className: 'home-header' }, [
      h('div', { className: 'brand' }, [h('span', { className: 'brand-mark', text: 'A' }), h('div', {}, [
        h('h1', { text: PRODUCT_NAME }), h('p', { text: 'Know the world. Beat the clock.' }),
      ])]),
      h('div', { className: 'header-actions' }, [
        h('button', { className: 'icon-btn', text: '?', onClick: actions.onHelp, attrs: { type: 'button', 'aria-label': 'How to play' } }),
        h('button', { className: 'icon-btn', text: '⚙', onClick: actions.onSettings, attrs: { type: 'button', 'aria-label': 'Settings' } }),
      ]),
    ]),
    continueButton,
    dailyButton,
    h('section', { className: 'home-section' }, [
      h('div', { className: 'section-heading' }, [h('h2', { text: 'Choose a region' }), h('span', { text: '4 routes' })]),
      h('div', { className: 'category-scroll' }, categoryButtons),
    ]),
    h('section', { className: 'home-section' }, [
      h('div', { className: 'section-heading' }, [h('h2', { text: 'Choose a mode' }), h('span', { text: 'Same facts, new challenge' })]),
      h('div', { className: 'mode-grid' }, modeButtons),
    ]),
    h('button', { className: 'primary-action', text: 'Start new practice', onClick: actions.onPractice, attrs: { type: 'button' } }),
    h('section', { className: 'stats-card journey' }, [
      h('div', { className: 'section-heading' }, [h('h2', { text: 'Your journey' }), h('span', { className: 'streak-pill' }, [h('span', { text: '🔥 ' }), streak])]),
      h('div', { className: 'level-row' }, [
        levelBadge,
        h('div', { className: 'level-copy' }, [levelTitle, levelXp]),
      ]),
      h('div', { className: 'xp-track', attrs: { 'aria-hidden': 'true' } }, [xpFill]),
      h('span', { className: 'goals-title', text: 'TODAY’S GOALS' }),
      goalsList,
      h('div', { className: 'stats-grid' }, [
        stat('Accuracy', accuracy), stat('Played', played), stat('Best', best),
      ]),
      h('div', { className: 'journey-links' }, [
        h('button', { className: 'journey-link', text: 'All stats', onClick: actions.onStats, attrs: { type: 'button' } }),
        awardsButton,
      ]),
    ]),
    h('footer', { text: 'Offline · No ads · Your progress stays on this device' }),
  ]);
  clearChildren(root);
  root.appendChild(screen);

  const update = (next: HomeState): void => {
    current = next;
    const category = CATEGORIES.find((item) => item.id === next.categoryId)!;
    document.documentElement.style.setProperty('--category', category.accent);
    categoryButtons.forEach((button) => button.classList.toggle('selected', button.dataset.category === next.categoryId));
    modeButtons.forEach((button) => button.classList.toggle('selected', button.dataset.mode === next.modeId));
    const labels = { new: 'Start daily quiz', resume: 'Resume daily quiz', done: 'View today’s result' };
    dailyTitle.textContent = labels[next.dailyStatus];
    dailyCopy.textContent = `${category.name} · ${MODE_INFO[next.modeId].label} · 5 questions`;
    const showContinue = next.active?.quiz.status === 'playing';
    continueButton.hidden = !showContinue;
    if (showContinue) {
      const activeCategory = CATEGORIES.find((item) => item.id === next.active!.categoryId)!;
      continueCopy.textContent = `${activeCategory.name} · ${MODE_INFO[next.active!.modeId].label} · ${next.active!.quiz.index + 1}/5`;
    }
    accuracy.textContent = `${next.stats.answered ? Math.round(next.stats.correct / next.stats.answered * 100) : 0}%`;
    played.textContent = String(next.stats.played);
    best.textContent = next.stats.bestScore.toLocaleString();
    streak.textContent = String(next.dailyMeta.current);
    const journey = next.journey;
    levelBadge.textContent = `LV ${journey.level}`;
    levelTitle.textContent = journey.title;
    levelXp.textContent = `${journey.xpInto} / ${journey.xpNeed} XP to next level`;
    xpFill.style.width = `${Math.round((journey.xpInto / journey.xpNeed) * 100)}%`;
    awardsButton.textContent = `Awards ${journey.awardsEarned}/${journey.awardsTotal}`;
    goalsList.replaceChildren(...journey.missions.map((mission) => {
      const done = mission.progress >= mission.target;
      return h('div', { className: `goal-row${done ? ' done' : ''}` }, [
        h('span', { className: 'goal-tick', text: done ? '✓' : '○', attrs: { 'aria-hidden': 'true' } }),
        h('span', { className: 'goal-label', text: mission.label }),
        h('span', {
          className: 'goal-count',
          text: `${Math.min(mission.progress, mission.target)}/${mission.target}`,
        }),
      ]);
    }));
  };
  update(state);
  return { update };
}

function stat(label: string, value: HTMLElement): HTMLElement {
  return h('div', { className: 'stat-block' }, [value, h('span', { text: label })]);
}
