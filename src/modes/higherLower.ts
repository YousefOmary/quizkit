import { withStateHelpers, type GameMode } from '../engine/mode.js';
import { shuffled, type Rng } from '../engine/rng.js';
import type { AnswerInput, Judgement, Presented } from '../engine/types.js';

/** One comparable item: what the player sees + its hidden numeric stat. */
export interface HlItem {
  label: string;
  value: number;
}

/** One higher-lower pack question: two items to compare. */
export interface HlPackQuestion {
  a: HlItem;
  b: HlItem;
}

/** The question pack a higher-lower theme supplies. */
export interface HlPack {
  packId: string;
  /** The question asked for every pair, e.g. 'Which country has more people?' */
  prompt: string;
  /** Optional unit appended to revealed values, e.g. 'people'. */
  unit?: string;
  /** Optional pack-supplied context shown after every reveal. */
  explanation?: string;
  questions: HlPackQuestion[];
}

/** Runtime question: the pair in display order + prompt + unit. */
interface HlRuntime {
  prompt: string;
  unit: string;
  explanation?: string;
  items: [HlItem, HlItem];
}

/**
 * Build the round: deterministically pick `count` pairs and shuffle each
 * pair's display order with the same rng.
 * Input: HlPack + seeded rng + count. Output: ordered HlRuntime[].
 */
function buildQuiz(pack: unknown, rng: Rng, count: number): unknown[] {
  const p = pack as HlPack;
  return shuffled(p.questions, rng)
    .slice(0, Math.min(count, p.questions.length))
    .map((q): HlRuntime => {
      const flip = rng() < 0.5;
      return {
        prompt: p.prompt,
        unit: p.unit ?? '',
        explanation: p.explanation,
        items: flip ? [q.b, q.a] : [q.a, q.b],
      };
    });
}

/** Present: the pack prompt plus the two item labels as buttons. */
function present(question: unknown): Presented {
  const q = question as HlRuntime;
  return { prompt: q.prompt, kind: 'choice', options: [q.items[0].label, q.items[1].label] };
}

/**
 * Judge: input is the chosen item index (null = timeout = wrong). The item
 * with the greater value wins. Output includes both revealed values, e.g.
 * 'India — 1,438,000,000 vs 341,000,000 people'.
 */
function judge(question: unknown, input: AnswerInput): Judgement {
  const q = question as HlRuntime;
  const correctIndex = q.items[0].value >= q.items[1].value ? 0 : 1;
  const winner = q.items[correctIndex]!;
  const loser = q.items[1 - correctIndex]!;
  const unit = q.unit ? ` ${q.unit}` : '';
  const reveal =
    `${winner.label} — ${winner.value.toLocaleString('en-US')}` +
    ` vs ${loser.value.toLocaleString('en-US')}${unit}`;
  return {
    correct: input === correctIndex,
    correctAnswer: reveal,
    correctIndex,
    explanation: q.explanation,
  };
}

/** Higher-lower: two items, hidden stats, pick the greater. */
export const higherLowerMode: GameMode = withStateHelpers({
  id: 'higher-lower',
  buildQuiz,
  present,
  judge,
});
