import type { AnswerInput, Judgement } from '../engine/types.js';
import type { KeyboardHandle } from './keyboard.js';
import { h } from './dom.js';
import { atlasIcon } from './icons.js';

/** Feedback applied in-place after the engine judges an answer. */
export interface RevealData {
  input: AnswerInput;
  judgement: Judgement;
  points: number;
  multiplier: number;
  skipped?: boolean;
}

/** Apply answer states, explanation, score, and combo without rerendering. */
export function applyReveal(
  screen: HTMLElement,
  buttons: HTMLButtonElement[],
  keyboard: KeyboardHandle | null,
  feedback: HTMLElement,
  combo: HTMLElement,
  score: HTMLElement,
  data: RevealData,
  totalScore: number,
): void {
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === data.judgement.correctIndex) button.classList.add('correct');
    else if (index === data.input) button.classList.add('wrong');
  });
  keyboard?.disable();
  const good = data.judgement.correct;
  const label = data.skipped ? 'Skipped' : good ? 'Correct' : 'Not quite';
  feedback.className = `feedback ${good ? 'good' : 'bad'}`;
  feedback.removeAttribute('hidden');
  feedback.replaceChildren(
    h('strong', { className: 'feedback-label' }, [atlasIcon(data.skipped ? 'waypoint' : good ? 'check' : 'close'), document.createTextNode(label)]),
    h('p', { text: `Answer: ${data.judgement.correctAnswer}` }),
    ...(data.judgement.explanation
      ? [h('p', { className: 'explanation', text: data.judgement.explanation })]
      : []),
    h('span', {
      className: 'points',
      text: good ? `+${data.points} · ×${data.multiplier.toFixed(1)} combo` : '+0',
    }),
  );
  score.textContent = String(totalScore);
  screen.classList.add(good ? 'flash-good' : 'flash-bad', 'route-revealed');
  if (good && data.multiplier > 1) {
    combo.textContent = `×${data.multiplier.toFixed(1)} COMBO`;
    combo.removeAttribute('hidden');
  }
}
