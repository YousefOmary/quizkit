/**
 * Deterministic randomness. Same seed ⇒ same sequence, on every platform.
 * This is what makes the daily quiz identical for every player.
 */

/** A deterministic random generator: each call returns a float in [0, 1). */
export type Rng = () => number;

/**
 * FNV-1a 32-bit string hash.
 * Input: any string. Output: unsigned 32-bit integer, stable forever.
 */
export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * mulberry32 seeded PRNG.
 * Input: 32-bit seed. Output: an Rng producing a repeatable sequence.
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seeded Fisher–Yates shuffle.
 * Input: items + rng. Output: a NEW shuffled array; input is not mutated.
 */
export function shuffled<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}
