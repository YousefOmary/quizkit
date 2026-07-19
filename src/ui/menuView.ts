import { MODE_INFO, PRODUCT_NAME } from '../product/config.js';
import { getCategory } from '../product/countries.js';
import type { DailyMeta, GameSession, Settings } from '../product/types.js';
import { clearChildren, h } from './dom.js';
import { icon } from './icons.js';

/** Progression summary kept behind the compact Journey strip. */
export interface JourneyState {
  level: number;
  title: string;
  xpInto: number;
  xpNeed: number;
  missions: Array<{ label: string; progress: number; target: number }>;
  awardsEarned: number;
  awardsTotal: number;
}

/** Home data that can update without rebuilding the screen. */
export interface HomeState {
  settings: Settings;
  dailyStatus: 'new' | 'resume' | 'done';
  dailyMeta: DailyMeta;
  active: GameSession | null;
  journey: JourneyState;
}

/** Home navigation callbacks. */
export interface HomeActions {
  onQuickPlay: () => void;
  onDaily: () => void;
  onCustomize: () => void;
  onJourney: () => void;
  onSettings: () => void;
  onHelp: () => void;
}

/** Targeted home updates for resumed sessions and Daily state. */
export interface HomeHandle {
  update: (state: HomeState) => void;
}

/** Render the one-tap opening screen. */
export function renderMenuView(root: HTMLElement, state: HomeState, actions: HomeActions): HomeHandle {
  let current = state;
  const quickKicker = h('span', { className: 'quick-kicker' });
  const quickTitle = h('strong', { className: 'quick-title' });
  const quickCopy = h('span', { className: 'quick-copy' });
  const quickButton = h('button', {
    className: 'quick-card', onClick: actions.onQuickPlay,
    attrs: { type: 'button' },
  }, [
    h('span', { className: 'quick-route', attrs: { 'aria-hidden': 'true' } }, [icon('route')]),
    quickKicker, quickTitle, quickCopy,
    h('span', { className: 'quick-go' }, [document.createTextNode('Set off'), icon('back')]),
  ]);
  const dailyTitle = h('strong', { className: 'daily-title' });
  const dailyCopy = h('span', { className: 'daily-copy' });
  const dailyButton = h('button', {
    className: 'daily-card', onClick: actions.onDaily,
    attrs: { type: 'button', 'aria-label': 'Play Today’s Route' },
  }, [
    h('span', { className: 'daily-icon' }, [icon('pin')]),
    h('span', { className: 'daily-main' }, [
      h('span', { className: 'daily-kicker', text: 'TODAY’S ROUTE' }), dailyTitle, dailyCopy,
    ]),
    h('span', { className: 'daily-arrow' }, [icon('back')]),
  ]);
  const levelBadge = h('span', { className: 'level-badge' });
  const levelTitle = h('strong');
  const levelXp = h('span');
  const xpFill = h('i');
  const currentStreak = h('strong');
  const bestStreak = h('strong');
  const journeyButton = h('button', {
    className: 'journey-strip', onClick: actions.onJourney,
    attrs: { type: 'button', 'aria-label': 'Open your Journey' },
  }, [
    levelBadge,
    h('span', { className: 'level-copy' }, [levelTitle, levelXp]),
    h('span', { className: 'journey-chevron' }, [icon('journey')]),
    h('span', { className: 'xp-track', attrs: { 'aria-hidden': 'true' } }, [xpFill]),
  ]);
  const screen = h('main', { className: 'screen home screen-enter' }, [
    h('header', { className: 'home-header' }, [
      h('div', { className: 'brand' }, [
        h('span', { className: 'brand-mark' }, [icon('compass')]),
        h('div', {}, [h('h1', { text: PRODUCT_NAME }), h('p', { text: 'Five questions. One quick trip.' })]),
      ]),
      h('div', { className: 'header-actions' }, [
        h('button', { className: 'icon-btn', onClick: actions.onHelp, attrs: { type: 'button', 'aria-label': 'How to play' } }, [icon('help')]),
        h('button', { className: 'icon-btn', onClick: actions.onSettings, attrs: { type: 'button', 'aria-label': 'Settings' } }, [icon('settings')]),
      ]),
    ]),
    journeyButton,
    quickButton,
    dailyButton,
    h('button', {
      className: 'customize-action', onClick: actions.onCustomize,
      attrs: { type: 'button' },
    }, [icon('customize'), h('span', {}, [h('strong', { text: 'Customize' }), h('small', { text: 'Topic · Format · Pace' })])]),
    h('section', { className: 'streaks-card', attrs: { 'aria-label': 'Daily streaks' } }, [
      h('div', {}, [icon('streak'), h('span', {}, [h('small', { text: 'CURRENT STREAK' }), currentStreak])]),
      h('div', {}, [icon('award'), h('span', {}, [h('small', { text: 'PERSONAL BEST' }), bestStreak])]),
    ]),
    h('footer', { text: 'Offline-first · Progress stays on this device' }),
  ]);
  clearChildren(root);
  root.appendChild(screen);

  const update = (next: HomeState): void => {
    current = next;
    const active = next.active?.quiz.status === 'playing' ? next.active : null;
    const selectedCategory = getCategory(active?.categoryId ?? next.settings.categoryId);
    const selectedMode = active?.modeId ?? next.settings.modeId;
    quickKicker.textContent = active ? 'CONTINUE YOUR ROUTE' : 'QUICK PLAY';
    quickTitle.textContent = active ? `Question ${active.quiz.index + 1} of 5` : 'Play now';
    quickCopy.textContent = `${selectedCategory.name} · ${MODE_INFO[selectedMode].label} · ${active ? 'Resume' : next.settings.timer ? '15 seconds' : 'Relaxed'}`;
    quickButton.setAttribute('aria-label', active ? `Continue question ${active.quiz.index + 1} of 5` : `Play ${selectedCategory.name}, ${MODE_INFO[selectedMode].label}, ${next.settings.timer ? 'timed' : 'relaxed'}`);
    const labels = { new: 'Start today’s shared route', resume: 'Resume today’s route', done: 'View today’s result' };
    const copies = { new: '5 questions · 15 seconds each', resume: 'Your exact place is saved', done: 'Route logged · Share anytime' };
    dailyTitle.textContent = labels[next.dailyStatus];
    dailyCopy.textContent = copies[next.dailyStatus];
    const journey = next.journey;
    levelBadge.textContent = `LV ${journey.level}`;
    levelTitle.textContent = journey.title;
    levelXp.textContent = `${journey.xpInto} / ${journey.xpNeed} XP`;
    xpFill.style.width = `${Math.round((journey.xpInto / journey.xpNeed) * 100)}%`;
    currentStreak.textContent = String(next.dailyMeta.current);
    bestStreak.textContent = String(next.dailyMeta.best);
  };
  update(current);
  return { update };
}
