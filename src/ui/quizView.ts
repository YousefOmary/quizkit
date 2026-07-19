import type { AnswerInput, Presented } from '../engine/types.js';
import type { Lifelines } from '../product/types.js';
import { clearChildren, h } from './dom.js';
import { createKeyboard, type KeyboardHandle } from './keyboard.js';
import { applyReveal, type RevealData } from './quizReveal.js';
import { atlasIcon } from './icons.js';

/** Data needed to build one question screen. */
export interface QuizViewCtx {
  category: string;
  mode: string;
  index: number;
  total: number;
  score: number;
  timerTotal: number;
  presented: Presented;
  lifelines: Lifelines;
  onAnswer: (input: AnswerInput) => void;
  onLifeline: (kind: keyof Lifelines) => void;
  onPause: () => void;
  onHelp: () => void;
}

/** Targeted controls; no full screen rerender is needed per interaction. */
export interface QuizViewHandle {
  setTimer: (left: number) => void;
  reveal: (data: RevealData, score: number) => void;
  eliminate: (indices: number[]) => void;
  updateLifelines: (lifelines: Lifelines) => void;
  destroy: () => void;
}

function lifelineButton(
  key: keyof Lifelines,
  label: string,
  onClick: (key: keyof Lifelines) => void,
): HTMLButtonElement {
  return h('button', {
    className: 'lifeline',
    text: label,
    onClick: () => onClick(key),
    attrs: { type: 'button', 'data-lifeline': key },
  });
}

/** Render a question once and return fine-grained update controls. */
export function renderQuizView(root: HTMLElement, ctx: QuizViewCtx): QuizViewHandle {
  let keyboard: KeyboardHandle | null = null;
  const optionButtons: HTMLButtonElement[] = [];
  const answerArea = ctx.presented.kind === 'choice'
    ? h('div', { className: 'options' }, ctx.presented.options.map((label, index) => {
        const button = h('button', {
          className: 'option',
          text: label,
          onClick: () => ctx.onAnswer(index),
          attrs: { type: 'button' },
        });
        optionButtons.push(button);
        return button;
      }))
    : (keyboard = createKeyboard((value) => ctx.onAnswer(value))).root;
  const score = h('strong', { className: 'score-value', text: String(ctx.score) });
  const timerBar = h('div', { className: 'timer-bar' });
  const timerText = h('span', { className: 'timer-text', text: `${ctx.timerTotal}s` });
  const feedback = h('section', { className: 'feedback', attrs: { 'aria-live': 'polite', hidden: '' } });
  const combo = h('div', { className: 'combo-pop', attrs: { 'aria-live': 'polite', hidden: '' } });
  const lifelines = [
    lifelineButton('fifty', '50:50', ctx.onLifeline),
    lifelineButton('skip', 'Skip', ctx.onLifeline),
    lifelineButton('time', '+10 sec', ctx.onLifeline),
  ];
  if (ctx.presented.kind === 'text' || ctx.presented.options.length <= 2) {
    lifelines[0]!.disabled = true;
    lifelines[0]!.setAttribute('aria-label', '50:50 — needs four choices');
  }
  if (!ctx.timerTotal) lifelines[2]!.disabled = true;
  const screen = h('main', { className: 'screen quiz screen-enter' }, [
    h('header', { className: 'play-header' }, [
      h('button', { className: 'icon-btn', onClick: ctx.onPause, attrs: { type: 'button', 'aria-label': 'Pause quiz' } }, [atlasIcon('back')]),
      h('div', { className: 'play-heading' }, [
        h('strong', { text: ctx.category }),
        h('span', { text: ctx.mode }),
      ]),
      h('button', { className: 'icon-btn', onClick: ctx.onHelp, attrs: { type: 'button', 'aria-label': 'How to play' } }, [atlasIcon('help')]),
    ]),
    h('div', { className: 'progress-row' }, [
      h('span', { text: `Question ${ctx.index + 1} of ${ctx.total}` }),
      h('span', {}, [h('span', { text: 'Score ' }), score]),
    ]),
    h('div', { className: 'question-progress' }, [h('i', {
      attrs: { style: `width:${((ctx.index + 1) / ctx.total) * 100}%` },
    })]),
    ...(ctx.timerTotal ? [h('div', { className: 'timer-row' }, [
      h('div', { className: 'timer-track' }, [timerBar]), timerText,
    ])] : []),
    h('section', { className: 'question-card' }, [
      h('span', { className: 'route-mark', attrs: { 'aria-hidden': 'true' } }, [atlasIcon('waypoint')]),
      h('span', { className: 'eyebrow', text: ctx.mode }),
      h('h1', { className: 'prompt', text: ctx.presented.prompt }),
    ]),
    answerArea,
    h('div', { className: 'lifelines', attrs: { 'aria-label': 'Lifelines' } }, lifelines),
    feedback,
    combo,
  ]);
  clearChildren(root);
  root.appendChild(screen);

  const updateLifelines = (used: Lifelines): void => {
    (Object.keys(used) as Array<keyof Lifelines>).forEach((key, index) => {
      if (!used[key]) return;
      lifelines[index]!.disabled = true;
      lifelines[index]!.classList.add('used');
      lifelines[index]!.setAttribute('aria-label', `${lifelines[index]!.textContent} used`);
    });
  };
  updateLifelines(ctx.lifelines);
  return {
    setTimer: (left) => {
      timerBar.style.transform = `scaleX(${Math.max(0, Math.min(left / ctx.timerTotal, 1))})`;
      timerText.textContent = `${Math.ceil(left)}s`;
      timerBar.classList.toggle('urgent', left <= 5);
    },
    eliminate: (indices) => indices.forEach((index) => {
      const button = optionButtons[index];
      if (button) { button.disabled = true; button.classList.add('eliminated'); }
    }),
    updateLifelines,
    reveal: (data, totalScore) => applyReveal(screen, optionButtons, keyboard, feedback, combo, score, data, totalScore),
    destroy: () => keyboard?.destroy(),
  };
}
