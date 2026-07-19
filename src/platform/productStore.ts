import type { StorageAdapter } from './StorageAdapter.js';
import { PRODUCT_ID } from '../product/config.js';
import { defaultDailyMeta, defaultSettings } from '../product/defaults.js';
import { defaultProgress, type ProgressState } from '../product/progress.js';
import type { DailyMeta, GameSession, Settings, StatsBook } from '../product/types.js';

/** Additive, guarded persistence for Atlas Sprint product data. */
export class ProductStore {
  constructor(private readonly adapter: StorageAdapter) {}

  private key(suffix: string): string {
    return `quizkit:${PRODUCT_ID}:v1:${suffix}`;
  }

  private async read<T>(suffix: string, fallback: T): Promise<T> {
    const raw = await this.adapter.get(this.key(suffix));
    if (!raw) return fallback;
    try {
      return { ...fallback, ...(JSON.parse(raw) as T) };
    } catch {
      return fallback;
    }
  }

  private async write(suffix: string, value: unknown): Promise<void> {
    await this.adapter.set(this.key(suffix), JSON.stringify(value));
  }

  /** Load preferences with additive defaults for future migrations. */
  loadSettings(): Promise<Settings> {
    return this.read('settings', defaultSettings());
  }

  /** Persist preferences. */
  saveSettings(settings: Settings): Promise<void> {
    return this.write('settings', settings);
  }

  /** Load all per-topic/mode stats. */
  loadStats(): Promise<StatsBook> {
    return this.read('stats', {});
  }

  /** Persist all per-topic/mode stats. */
  saveStats(stats: StatsBook): Promise<void> {
    return this.write('stats', stats);
  }

  /** Load the cross-day streak. */
  loadDailyMeta(): Promise<DailyMeta> {
    return this.read('daily-meta', defaultDailyMeta());
  }

  /** Persist the cross-day streak. */
  saveDailyMeta(meta: DailyMeta): Promise<void> {
    return this.write('daily-meta', meta);
  }

  /** Load XP, achievements, and daily-goal progress with additive defaults. */
  async loadProgress(): Promise<ProgressState> {
    const loaded = await this.read('progress', defaultProgress());
    // Nested objects need their own additive merge — a partial old record
    // must never drop counter keys added by later versions.
    return {
      ...loaded,
      counters: { ...defaultProgress().counters, ...loaded.counters },
      achievements: loaded.achievements ?? {},
      missionProgress: Array.isArray(loaded.missionProgress) ? loaded.missionProgress : [],
    };
  }

  /** Persist progression. */
  saveProgress(progress: ProgressState): Promise<void> {
    return this.write('progress', progress);
  }

  /** Load a round by its explicit key. */
  async loadSession(key: string): Promise<GameSession | null> {
    const raw = await this.adapter.get(this.key(`session:${key}`));
    if (!raw) return null;
    try {
      const value = JSON.parse(raw) as GameSession;
      return value.version === 1 && Array.isArray(value.quiz?.questions) ? value : null;
    } catch {
      return null;
    }
  }

  /** Autosave a complete resumable session. */
  async saveSession(session: GameSession): Promise<void> {
    await this.write(`session:${session.key}`, session);
    await this.adapter.set(this.key('active-session'), session.key);
  }

  /** Load the most recently active session. */
  async loadActiveSession(): Promise<GameSession | null> {
    const key = await this.adapter.get(this.key('active-session'));
    return key ? this.loadSession(key) : null;
  }
}
