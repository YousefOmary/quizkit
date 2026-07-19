import type { ModeId } from '../engine/types.js';
import { ACHIEVEMENTS } from '../product/achievements.js';
import { MODE_INFO } from '../product/config.js';
import { CATEGORIES } from '../product/countries.js';
import { masteryTier, type ProgressState } from '../product/progress.js';
import { getStats } from '../product/stats.js';
import type { DailyMeta, StatsBook } from '../product/types.js';
import { h } from './dom.js';
import { showSheet, type CloseSheet } from './sheets.js';
import { icon } from './icons.js';
import type { JourneyState } from './menuView.js';

const MODE_IDS = Object.keys(MODE_INFO) as ModeId[];

/** All progression in one intentional destination off the opening screen. */
export function showJourney(
  journey: JourneyState,
  book: StatsBook,
  dailyMeta: DailyMeta,
  progress: ProgressState,
): CloseSheet {
  const earned = Object.keys(progress.achievements).length;
  return showSheet('Your Journey', [
    h('section', { className: 'journey-hero' }, [
      h('span', { className: 'level-badge', text: `LV ${journey.level}` }),
      h('div', {}, [h('h3', { text: journey.title }), h('p', { text: `${journey.xpInto} / ${journey.xpNeed} XP toward the next level` })]),
      h('div', { className: 'xp-track', attrs: { 'aria-hidden': 'true' } }, [h('i', { attrs: { style: `width:${Math.round(journey.xpInto / journey.xpNeed * 100)}%` } })]),
    ]),
    h('div', { className: 'journey-totals' }, [
      journeyTotal('streak', 'Current streak', dailyMeta.current),
      journeyTotal('award', 'Personal best', dailyMeta.best),
      journeyTotal('spark', 'Awards earned', `${earned}/${ACHIEVEMENTS.length}`),
    ]),
    h('section', { className: 'journey-section' }, [
      h('h3', { text: 'This week’s expedition' }),
      h('p', { text: 'Normal play moves these route stamps forward.' }),
      h('div', { className: 'journey-goals' }, journey.missions.map((mission) => {
        const done = mission.progress >= mission.target;
        return h('div', { className: `journey-goal${done ? ' done' : ''}` }, [
          icon(done ? 'check' : 'pin'), h('span', { text: mission.label }),
          h('strong', { text: `${Math.min(mission.progress, mission.target)}/${mission.target}` }),
        ]);
      })),
    ]),
    h('section', { className: 'journey-section' }, [
      h('h3', { text: 'Route mastery' }),
      ...statsSections(book),
    ]),
    h('section', { className: 'journey-section' }, [
      h('h3', { text: 'Journal stamps' }),
      h('p', { text: `${earned} of ${ACHIEVEMENTS.length} earned.` }),
      h('div', { className: 'award-list' }, awardRows(progress)),
    ]),
  ], () => undefined);
}

/** Every topic and mode at a glance, with topic mastery tiers. */
export function showStats(book: StatsBook, dailyMeta: DailyMeta): CloseSheet {
  return showSheet('Your stats', [
    h('p', { className: 'sheet-intro', text: `Daily streak ${dailyMeta.current} · best ${dailyMeta.best}. Topic mastery grows with every correct answer.` }),
    ...statsSections(book),
  ], () => undefined);
}

function statsSections(book: StatsBook): HTMLElement[] {
  return CATEGORIES.map((category) => {
    const correctInCategory = MODE_IDS
      .reduce((sum, modeId) => sum + getStats(book, category.id, modeId).correct, 0);
    const rows = MODE_IDS.map((modeId) => {
      const stats = getStats(book, category.id, modeId);
      const accuracy = stats.answered ? `${Math.round(stats.correct / stats.answered * 100)}%` : '—';
      return h('div', { className: 'stats-row' }, [
        h('span', { className: 'stats-row-mode', text: MODE_INFO[modeId].label }),
        h('span', { text: stats.played ? `${stats.played}×` : '—' }),
        h('span', { text: accuracy }),
        h('span', { text: stats.bestScore ? stats.bestScore.toLocaleString() : '—' }),
      ]);
    });
    return h('section', { className: 'stats-section' }, [
      h('div', { className: 'stats-section-head' }, [
        h('h3', {}, [icon('map'), document.createTextNode(category.name)]),
        h('span', { className: 'mastery-chip', text: masteryTier(correctInCategory) }),
      ]),
      h('div', { className: 'stats-row stats-head' }, [
        h('span', { className: 'stats-row-mode', text: 'Mode' }),
        h('span', { text: 'Played' }), h('span', { text: 'Acc.' }), h('span', { text: 'Best' }),
      ]),
      ...rows,
    ]);
  });
}

/** All achievements with earned state and dates. */
export function showAchievements(progress: ProgressState): CloseSheet {
  const earned = Object.keys(progress.achievements).length;
  return showSheet('Achievements', [
    h('p', { className: 'sheet-intro', text: `${earned} of ${ACHIEVEMENTS.length} earned. All progress lives on this device.` }),
    h('div', { className: 'award-list' }, awardRows(progress)),
  ], () => undefined);
}

function awardRows(progress: ProgressState): HTMLElement[] {
  return ACHIEVEMENTS.map((def) => {
    const date = progress.achievements[def.id];
    return h('div', { className: `award-row${date ? ' earned' : ''}` }, [
      h('span', { className: 'award-icon' }, [icon(def.icon)]),
      h('div', { className: 'award-copy' }, [
        h('strong', { text: def.name }),
        h('p', { text: date ? `${def.description} · Earned ${date}` : def.description }),
      ]),
      h('span', { className: 'award-state', attrs: { 'aria-label': date ? 'Earned' : 'Locked' } }, [
        icon(date ? 'check' : 'pin'),
      ]),
    ]);
  });
}

function journeyTotal(iconName: 'streak' | 'award' | 'spark', label: string, value: string | number): HTMLElement {
  return h('div', {}, [icon(iconName), h('span', {}, [h('small', { text: label }), h('strong', { text: String(value) })])]);
}
