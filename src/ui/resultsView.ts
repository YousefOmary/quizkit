import { PRODUCT_NAME, TIMINGS } from '../product/config.js';
import { MISSION_XP } from '../product/progress.js';
import type { RoundReward } from '../product/recordResult.js';
import type { DailyMeta, GameSession, ModeStats } from '../product/types.js';
import { clearChildren, h } from './dom.js';
import { icon } from './icons.js';

/** Completed-round presentation and actions. */
export interface ResultsCtx {
  session: GameSession;
  category: string;
  stats: ModeStats;
  dailyMeta: DailyMeta;
  /** What this round just earned; null when reviewing an old result. */
  reward: RoundReward | null;
  onCopy: () => Promise<boolean>;
  onAgain: () => void;
  onMenu: () => void;
  onRetry?: () => Promise<boolean>;
}

/** Render the spoiler-free result card and resolved five-stop route. */
export function renderResultsView(root: HTMLElement, ctx: ResultsCtx): void {
  const state = ctx.session.quiz;
  const correct = state.answers.filter((answer) => answer.correct).length;
  const score = h('strong', { className: 'result-score', text: '0' });
  const copy = h('button', { className: 'primary-action copy-result', attrs: { type: 'button' } }, [
    icon('route'), document.createTextNode('Copy spoiler-free result'),
  ]);
  const toast = h('div', { className: 'toast', text: '', attrs: { role: 'status', hidden: '' } });
  copy.addEventListener('click', () => void ctx.onCopy().then((copied) => {
    toast.textContent = copied ? 'Result copied — ready to paste' : 'Couldn’t copy — try again';
    toast.removeAttribute('hidden');
    setTimeout(() => toast.setAttribute('hidden', ''), TIMINGS.toast);
  }));
  const headline = correct === state.answers.length
    ? 'Perfect route!'
    : correct === state.answers.length - 1 ? 'One stop from perfect' : correct >= 3 ? 'Strong finish' : 'Keep exploring';
  const stops = state.answers.map((answer, index) => {
    const status = answer.skipped ? 'skipped' : answer.correct ? 'correct' : 'wrong';
    const label = answer.skipped ? 'Skipped' : answer.correct ? 'Correct' : 'Incorrect';
    return h('span', {
      className: `route-stop ${status}`,
      attrs: { role: 'img', 'aria-label': `Question ${index + 1}: ${label}` },
    }, [icon(answer.skipped ? 'route' : answer.correct ? 'check' : 'wrong')]);
  });
  const actions: HTMLElement[] = [copy];
  if (ctx.onRetry) {
    const retry = h('button', { className: 'rewarded-retry', attrs: { type: 'button' } }, [
      icon('route'), h('span', {}, [h('strong', { text: 'Retry one missed question' }), h('small', { text: 'Optional rewarded practice · assisted' })]),
    ]);
    retry.addEventListener('click', () => void ctx.onRetry!().then((started) => {
      if (!started) {
        toast.textContent = 'Retry unavailable — your game is unchanged';
        toast.removeAttribute('hidden');
      }
    }));
    actions.push(retry);
  }
  actions.push(
    h('button', { className: 'secondary-action', text: 'Play another', onClick: ctx.onAgain, attrs: { type: 'button' } }),
    h('button', { className: 'text-action', text: `Back to ${PRODUCT_NAME}`, onClick: ctx.onMenu, attrs: { type: 'button' } }),
  );
  const screen = h('main', { className: 'screen results screen-enter' }, [
    h('div', { className: 'result-mark' }, [icon(correct === state.answers.length ? 'spark' : 'pin')]),
    h('span', { className: 'eyebrow', text: ctx.session.kind === 'daily' ? `ATLAS SPRINT #${state.dayNumber}` : `${ctx.category} PRACTICE` }),
    h('h1', { text: headline }),
    h('p', { className: 'result-copy', text: `${correct} of ${state.answers.length} correct${ctx.session.assisted ? ' · Assisted practice' : ''}` }),
    score,
    h('span', { className: 'score-caption', text: 'TOTAL POINTS' }),
    h('div', { className: 'result-route', attrs: { 'aria-label': 'Five-stop result route' } }, [
      h('i', { className: 'result-route-line', attrs: { 'aria-hidden': 'true' } }), ...stops,
    ]),
    ...(ctx.reward ? [rewardRows(ctx.reward)] : []),
    h('div', { className: 'result-stats' }, [
      resultStat('Current streak', String(ctx.dailyMeta.current), 'streak'),
      resultStat('Personal best', String(ctx.dailyMeta.best), 'award'),
      resultStat('Best score', ctx.stats.bestScore.toLocaleString(), 'spark'),
    ]),
    ...(ctx.session.kind === 'daily' ? [h('p', { className: 'daily-lock', text: 'Today’s shared route is complete.' })] : []),
    ...actions,
    toast,
  ]);
  clearChildren(root);
  root.appendChild(screen);
  countUp(score, state.score);
}

/** The XP, level-up, expedition, and journal-stamp lines earned. */
function rewardRows(reward: RoundReward): HTMLElement {
  const rows: HTMLElement[] = [
    h('div', { className: 'reward-row xp' }, [
      h('b', { text: `+${reward.xpGained} XP` }),
      h('span', { text: `Level ${reward.level.level} ${reward.title} · ${reward.level.into}/${reward.level.need} to next` }),
    ]),
  ];
  if (reward.level.level > reward.levelBefore) {
    rows.push(h('div', { className: 'reward-row level-up' }, [
      h('b', {}, [icon('level'), document.createTextNode('Level up!')]),
      h('span', { text: `You’re now a Level ${reward.level.level} ${reward.title}` }),
    ]));
  }
  for (const mission of reward.missionsCompleted) {
    rows.push(h('div', { className: 'reward-row mission' }, [
      h('b', {}, [icon('target'), document.createTextNode('Expedition stamp')]),
      h('span', { text: `${mission.label} · +${MISSION_XP} XP` }),
    ]));
  }
  for (const achievement of reward.achievementsUnlocked) {
    rows.push(h('div', { className: 'reward-row achievement' }, [
      h('b', {}, [icon(achievement.icon), document.createTextNode('Journal stamp')]),
      h('span', { text: achievement.name }),
    ]));
  }
  return h('div', { className: 'reward-rows', attrs: { 'aria-label': 'Progress earned' } }, rows);
}

function resultStat(label: string, value: string, iconName: 'streak' | 'award' | 'spark'): HTMLElement {
  return h('div', {}, [icon(iconName), h('span', {}, [h('strong', { text: value }), h('small', { text: label })])]);
}

function countUp(element: HTMLElement, target: number): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'reduced') {
    element.textContent = target.toLocaleString();
    return;
  }
  const start = performance.now();
  const frame = (now: number): void => {
    const progress = Math.min((now - start) / TIMINGS.countUp, 1);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = Math.round(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
