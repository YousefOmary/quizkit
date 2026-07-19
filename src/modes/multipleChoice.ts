import { withStateHelpers, type GameMode } from '../engine/mode.js';
import { shuffled, type Rng } from '../engine/rng.js';
import type { AnswerInput, Judgement, Presented, PresentedVisual } from '../engine/types.js';

/** One multiple-choice pack question: a prompt, the right answer, 3 wrong. */
export interface McPackQuestion {
  prompt: string;
  correct: string;
  wrong: [string, string, string];
  explanation?: string;
  visual?: PresentedVisual;
}

/** The question pack a multiple-choice theme supplies. */
export interface McPack {
  packId: string;
  questions: McPackQuestion[];
}

/** Runtime question: options pre-shuffled, correct index tracked. */
interface McRuntime {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  visual?: PresentedVisual;
}

/**
 * Build the round: deterministically pick `count` questions from the pack
 * and shuffle each question's 4 options with the same rng.
 * Input: McPack + seeded rng + count. Output: ordered McRuntime[].
 */
function buildQuiz(pack: unknown, rng: Rng, count: number): unknown[] {
  const { questions } = pack as McPack;
  return shuffled(questions, rng)
    .slice(0, Math.min(count, questions.length))
    .map((q): McRuntime => {
      const options = shuffled([q.correct, ...q.wrong], rng);
      return {
        prompt: q.prompt,
        options,
        correctIndex: options.indexOf(q.correct),
        explanation: q.explanation,
        ...(q.visual ? { visual: q.visual } : {}),
      };
    });
}

/** Present: the prompt plus 4 option buttons. */
function present(question: unknown): Presented {
  const q = question as McRuntime;
  return { prompt: q.prompt, kind: 'choice', options: q.options, explanation: q.explanation, visual: q.visual };
}

/**
 * Judge: input is the chosen option index (null = timeout = wrong).
 * Output: correctness + the correct option's text and index.
 */
function judge(question: unknown, input: AnswerInput): Judgement {
  const q = question as McRuntime;
  return {
    correct: input === q.correctIndex,
    correctAnswer: q.options[q.correctIndex]!,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
  };
}

/** Multiple choice: one prompt, 4 options, one correct. */
export const multipleChoiceMode: GameMode = withStateHelpers({
  id: 'multiple-choice',
  buildQuiz,
  present,
  judge,
});
