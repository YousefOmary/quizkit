import { withStateHelpers, type GameMode } from '../engine/mode.js';
import { matchesAnswer } from '../engine/normalize.js';
import { shuffled, type Rng } from '../engine/rng.js';
import type { AnswerInput, Judgement, Presented, PresentedVisual } from '../engine/types.js';

/**
 * One type-answer pack question. acceptedAnswers[0] is the canonical
 * display form; every entry is matched after normalization
 * (case / whitespace / accents / punctuation insensitive).
 */
export interface TaPackQuestion {
  prompt: string;
  acceptedAnswers: string[];
  explanation?: string;
  visual?: PresentedVisual;
}

/** The question pack a type-answer theme supplies. */
export interface TaPack {
  packId: string;
  questions: TaPackQuestion[];
}

/**
 * Build the round: deterministically pick `count` questions.
 * Input: TaPack + seeded rng + count. Output: ordered TaPackQuestion[].
 */
function buildQuiz(pack: unknown, rng: Rng, count: number): unknown[] {
  const { questions } = pack as TaPack;
  return shuffled(questions, rng).slice(0, Math.min(count, questions.length));
}

/** Present: the prompt with a free-text input (no options). */
function present(question: unknown): Presented {
  const q = question as TaPackQuestion;
  return { prompt: q.prompt, kind: 'text', options: [], explanation: q.explanation, visual: q.visual };
}

/**
 * Judge: input is the typed string (null/non-string = timeout = wrong),
 * matched against acceptedAnswers after normalization.
 * Output: correctness + the canonical answer for feedback.
 */
function judge(question: unknown, input: AnswerInput): Judgement {
  const q = question as TaPackQuestion;
  return {
    correct: typeof input === 'string' && matchesAnswer(input, q.acceptedAnswers),
    correctAnswer: q.acceptedAnswers[0] ?? '',
    explanation: q.explanation,
  };
}

/** Type-answer: free text, normalized matching. */
export const typeAnswerMode: GameMode = withStateHelpers({
  id: 'type-answer',
  buildQuiz,
  present,
  judge,
});
