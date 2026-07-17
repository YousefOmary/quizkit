import { MODE_INFO, PRODUCT_NAME, TIMINGS } from '../product/config.js';
import type { DailyMeta, GameSession, ModeStats } from '../product/types.js';
import { clearChildren, h } from './dom.js';

/** Completed-round presentation and actions. */
export interface ResultsCtx {
  session: GameSession;
  category: string;
  stats: ModeStats;
  dailyMeta: DailyMeta;
  onShare: () => Promise<boolean>;
  onAgain: () => void;
  onMenu: () => void;
}

/** Render results, celebrate, and count the score up. */
export function renderResultsView(root: HTMLElement, ctx: ResultsCtx): void {
  const state = ctx.session.quiz;
  const correct = state.answers.filter((answer) => answer.correct).length;
  const gridText = state.answers.map((answer) => answer.correct ? '🟩' : '🟥').join('');
  const score = h('strong', { className: 'result-score', text: '0' });
  const share = h('button', { className: 'primary-action', text: 'Share result', attrs: { type: 'button' } });
  const toast = h('div', { className: 'toast', text: 'Copied to clipboard', attrs: { role: 'status', hidden: '' } });
  share.addEventListener('click', () => void ctx.onShare().then((ok) => {
    toast.textContent = ok ? 'Copied to clipboard' : 'Couldn’t copy — try again';
    toast.removeAttribute('hidden');
    setTimeout(() => toast.setAttribute('hidden', ''), TIMINGS.toast);
  }));
  const headline = correct === state.answers.length
    ? 'Perfect route!'
    : correct >= 3 ? 'Strong finish!' : 'New facts unlocked';
  const screen = h('main', { className: 'screen results screen-enter' }, [
    h('div', { className: 'result-mark', text: correct === state.answers.length ? '★' : '✓' }),
    h('span', { className: 'eyebrow', text: `${ctx.category} · ${MODE_INFO[ctx.session.modeId].label}` }),
    h('h1', { text: headline }),
    h('p', { className: 'result-copy', text: `${correct} of ${state.answers.length} correct` }),
    score,
    h('span', { className: 'score-caption', text: 'TOTAL POINTS' }),
    h('div', { className: 'share-grid', text: gridText, attrs: { 'aria-label': `${correct} correct out of ${state.answers.length}` } }),
    h('div', { className: 'result-stats' }, [
      resultStat('Best', ctx.stats.bestScore.toLocaleString()),
      resultStat('Accuracy', `${ctx.stats.answered ? Math.round(ctx.stats.correct / ctx.stats.answered * 100) : 0}%`),
      resultStat('Daily', `${ctx.dailyMeta.current} 🔥`),
    ]),
    ...(ctx.session.kind === 'daily' ? [h('p', { className: 'daily-lock', text: 'Today’s route is complete. A new one arrives at midnight.' })] : []),
    share,
    h('button', { className: 'secondary-action', text: 'New practice', onClick: ctx.onAgain, attrs: { type: 'button' } }),
    h('button', { className: 'text-action', text: `Back to ${PRODUCT_NAME}`, onClick: ctx.onMenu, attrs: { type: 'button' } }),
    toast,
  ]);
  clearChildren(root);
  root.appendChild(screen);
  countUp(score, state.score);
  confetti(screen);
}

function resultStat(label: string, value: string): HTMLElement {
  return h('div', {}, [h('strong', { text: value }), h('span', { text: label })]);
}

function countUp(element: HTMLElement, target: number): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

function confetti(parent: HTMLElement): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors = ['#ff6b4a', '#7759f4', '#f7c948', '#00a77b'];
  const layer = h('div', { className: 'confetti', attrs: { 'aria-hidden': 'true' } });
  for (let index = 0; index < 28; index += 1) {
    const piece = h('i', { attrs: { style: `--x:${(index * 37) % 100}%;--d:${(index % 7) * 70}ms;--r:${index * 47}deg;background:${colors[index % colors.length]}` } });
    layer.appendChild(piece);
  }
  parent.appendChild(layer);
  setTimeout(() => layer.remove(), 2400);
}
