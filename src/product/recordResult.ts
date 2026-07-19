import { localDateKey } from '../engine/daily.js';
import type { ProductStore } from '../platform/productStore.js';
import { newlyEarned, type AchievementDef } from './achievements.js';
import { applyMissions, missionsForDate, type MissionDef } from './missions.js';
import {
  applyCounters, levelFromXp, summarizeSession, titleForLevel, xpForRound,
  MISSION_XP, type LevelInfo, type ProgressState,
} from './progress.js';
import { applyDaily, applyRound, getStats, statsKey } from './stats.js';
import type { DailyMeta, GameSession, StatsBook } from './types.js';

/** Everything one finished round earned, for the results screen. */
export interface RoundReward {
  xpGained: number;
  levelBefore: number;
  level: LevelInfo;
  title: string;
  missionsCompleted: MissionDef[];
  achievementsUnlocked: AchievementDef[];
}

/** New persistent state after folding one round. */
export interface RoundOutcome {
  dailyMeta: DailyMeta;
  progress: ProgressState;
  reward: RoundReward;
}

/**
 * Fold and persist a finished round exactly once.
 * The caller guards with session.recorded, and this sets it before saving,
 * so stats, streaks, XP, goals, and achievements can never double-apply.
 */
export async function recordResult(
  store: ProductStore,
  stats: StatsBook,
  dailyMeta: DailyMeta,
  progress: ProgressState,
  session: GameSession,
  now: Date = new Date(),
): Promise<RoundOutcome> {
  const key = statsKey(session.categoryId, session.modeId);
  stats[key] = applyRound(getStats(stats, session.categoryId, session.modeId), session.quiz, !session.assisted);
  const nextDaily = session.kind === 'daily' ? applyDaily(dailyMeta, session.dateKey) : dailyMeta;

  const round = summarizeSession(session);
  const today = localDateKey(now);
  const defs = missionsForDate(today);
  const priorProgress = progress.missionDate === today ? progress.missionProgress : [];
  const fold = applyMissions(defs, priorProgress, round);

  const levelBefore = levelFromXp(progress.xp).level;
  const xpGained = xpForRound(round.score) + fold.completed.length * MISSION_XP;
  const next: ProgressState = {
    ...progress,
    xp: progress.xp + xpGained,
    counters: {
      ...applyCounters(progress.counters, round),
      missions: progress.counters.missions + fold.completed.length,
    },
    missionDate: today,
    missionProgress: fold.progress,
  };
  const unlocked = newlyEarned({ progress: next, bestDailyStreak: nextDaily.best });
  for (const def of unlocked) next.achievements = { ...next.achievements, [def.id]: today };

  session.recorded = true;
  await Promise.all([
    store.saveSession(session),
    store.saveStats(stats),
    store.saveDailyMeta(nextDaily),
    store.saveProgress(next),
  ]);
  const level = levelFromXp(next.xp);
  return {
    dailyMeta: nextDaily,
    progress: next,
    reward: {
      xpGained,
      levelBefore,
      level,
      title: titleForLevel(level.level),
      missionsCompleted: fold.completed,
      achievementsUnlocked: unlocked,
    },
  };
}
