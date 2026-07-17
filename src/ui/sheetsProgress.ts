import type { ModeId } from '../engine/types.js';
import { ACHIEVEMENTS } from '../product/achievements.js';
import { MODE_INFO } from '../product/config.js';
import { CATEGORIES } from '../product/countries.js';
import { masteryTier, type ProgressState } from '../product/progress.js';
import { getStats } from '../product/stats.js';
import type { DailyMeta, StatsBook } from '../product/types.js';
import { h } from './dom.js';
import { showSheet, type CloseSheet } from './sheets.js';

const MODE_IDS = Object.keys(MODE_INFO) as ModeId[];

/** Every region and mode at a glance, with region mastery tiers. */
export function showStats(book: StatsBook, dailyMeta: DailyMeta): CloseSheet {
  const sections = CATEGORIES.map((category) => {
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
        h('h3', { text: `${category.icon} ${category.name}` }),
        h('span', { className: 'mastery-chip', text: masteryTier(correctInCategory) }),
      ]),
      h('div', { className: 'stats-row stats-head' }, [
        h('span', { className: 'stats-row-mode', text: 'Mode' }),
        h('span', { text: 'Played' }), h('span', { text: 'Acc.' }), h('span', { text: 'Best' }),
      ]),
      ...rows,
    ]);
  });
  return showSheet('Your stats', [
    h('p', { className: 'sheet-intro', text: `Daily streak ${dailyMeta.current} · best ${dailyMeta.best}. Region mastery grows with every correct answer.` }),
    ...sections,
  ], () => undefined);
}

/** All achievements with earned state and dates. */
export function showAchievements(progress: ProgressState): CloseSheet {
  const earned = Object.keys(progress.achievements).length;
  const rows = ACHIEVEMENTS.map((def) => {
    const date = progress.achievements[def.id];
    return h('div', { className: `award-row${date ? ' earned' : ''}` }, [
      h('span', { className: 'award-icon', text: def.icon, attrs: { 'aria-hidden': 'true' } }),
      h('div', { className: 'award-copy' }, [
        h('strong', { text: def.name }),
        h('p', { text: date ? `${def.description} · Earned ${date}` : def.description }),
      ]),
      h('span', { className: 'award-state', text: date ? '✓' : '·' }),
    ]);
  });
  return showSheet('Achievements', [
    h('p', { className: 'sheet-intro', text: `${earned} of ${ACHIEVEMENTS.length} earned. All progress lives on this device.` }),
    h('div', { className: 'award-list' }, rows),
  ], () => undefined);
}
