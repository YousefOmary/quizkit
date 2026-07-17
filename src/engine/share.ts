import type { QuizState } from './types.js';

/**
 * Spoiler-free share text: a Wordle-style emoji grid plus a headline.
 * Reveals correctness pattern and score — never the questions or answers.
 */

/**
 * Build the share string for a finished round.
 * Input: the theme's shareTemplate (placeholders: {name} {day} {correct}
 * {total} {score}), the game's display name, and the finished state.
 * Output: headline line + emoji grid line (🟩 correct / 🟥 wrong).
 * For free play, {day} renders as 'free'.
 */
export function shareText(template: string, name: string, state: QuizState): string {
  const correct = state.answers.filter((a) => a.correct).length;
  const dayLabel = state.kind === 'daily' ? String(state.dayNumber) : 'free';
  const headline = template
    .replace('{name}', name)
    .replace('{day}', dayLabel)
    .replace('{correct}', String(correct))
    .replace('{total}', String(state.answers.length))
    .replace('{score}', String(state.score));
  const grid = state.answers.map((a) => (a.correct ? '🟩' : '🟥')).join('');
  return `${headline}\n${grid}`;
}
