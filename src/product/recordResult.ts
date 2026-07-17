import type { ProductStore } from '../platform/productStore.js';
import { applyDaily, applyRound, getStats, statsKey } from './stats.js';
import type { DailyMeta, GameSession, StatsBook } from './types.js';

/** Fold and persist a finished round exactly once. */
export async function recordResult(
  store: ProductStore,
  stats: StatsBook,
  dailyMeta: DailyMeta,
  session: GameSession,
): Promise<DailyMeta> {
  const key = statsKey(session.categoryId, session.modeId);
  stats[key] = applyRound(getStats(stats, session.categoryId, session.modeId), session.quiz);
  const nextDaily = session.kind === 'daily'
    ? applyDaily(dailyMeta, session.dateKey)
    : dailyMeta;
  session.recorded = true;
  await Promise.all([
    store.saveSession(session),
    store.saveStats(stats),
    store.saveDailyMeta(nextDaily),
  ]);
  return nextDaily;
}
