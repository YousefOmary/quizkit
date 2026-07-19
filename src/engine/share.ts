import type { AnswerRecord, QuizState } from './types.js';

/** A spoiler-free Wordle-style token: never contains a prompt or answer. */
export function shareToken(answer: AnswerRecord): string {
  if (answer.skipped) return '🟨';
  return answer.correct ? '🟩' : '⬛';
}

/**
 * Build the compact result-card copy used by the viral Daily loop.
 * It includes only the event number, correctness pattern, and personal
 * streaks. Questions, inputs, correct answers, scores, and pack data are
 * deliberately unavailable to this formatter.
 */
export function shareText(
  name: string,
  state: QuizState,
  currentStreak = 0,
  bestStreak = currentStreak,
): string {
  const correct = state.answers.filter((answer) => answer.correct).length;
  const label = state.kind === 'daily' ? `${name} #${state.dayNumber}` : `${name} Practice`;
  const grid = state.answers.map(shareToken).join('');
  const streaks = `Route streak ${currentStreak} · Best ${bestStreak}`;
  return `${label} · ${correct}/${state.answers.length} ${grid}\n${streaks}`;
}
