import { audio } from '../audio/audioCore.js';
import { localDateKey } from '../engine/daily.js';
import { shareText } from '../engine/share.js';
import type { ModeId } from '../engine/types.js';
import { analytics } from '../platform/analytics.js';
import type { ProductStore } from '../platform/productStore.js';
import { ACHIEVEMENTS } from '../product/achievements.js';
import { getCategory } from '../product/countries.js';
import { PRODUCT_NAME } from '../product/config.js';
import { missionsForDate } from '../product/missions.js';
import { levelFromXp, titleForLevel, type ProgressState } from '../product/progress.js';
import { createSession, sessionKey } from '../product/session.js';
import { recordResult, type RoundReward } from '../product/recordResult.js';
import { getStats } from '../product/stats.js';
import type { CategoryId, DailyMeta, GameSession, Settings, StatsBook } from '../product/types.js';
import { renderMenuView, type HomeHandle, type HomeState, type JourneyState } from './menuView.js';
import { PlaySession } from './playSession.js';
import { applyCategory, applyPreferences, watchSystemTheme } from './preferences.js';
import { renderResultsView } from './resultsView.js';
import { shareOrCopy } from './share.js';
import { showHowTo, showNewQuizConfirm, showPause, showSettings } from './sheets.js';
import { showAchievements, showStats } from './sheetsProgress.js';

/** Product-level navigation, persistence, and meta progression. */
export class App {
  private settings!: Settings;
  private stats!: StatsBook;
  private dailyMeta!: DailyMeta;
  private progress!: ProgressState;
  private home: HomeHandle | null = null;
  private player: PlaySession | null = null;
  constructor(
    private readonly root: HTMLElement,
    private readonly store: ProductStore,
  ) {}
  /** Load additive saves and enter the standalone product. */
  async init(): Promise<void> {
    [this.settings, this.stats, this.dailyMeta, this.progress] = await Promise.all([
      this.store.loadSettings(), this.store.loadStats(), this.store.loadDailyMeta(),
      this.store.loadProgress(),
    ]);
    applyPreferences(this.settings);
    watchSystemTheme(() => this.settings);
    window.addEventListener('pagehide', () => this.player?.pause());
    await this.showHome();
    if (!this.settings.onboardingSeen) {
      showHowTo(() => {
        this.settings.onboardingSeen = true;
        void this.store.saveSettings(this.settings);
        analytics.track({ name: 'onboarding_completed' });
      });
    }
  }
  private async showHome(): Promise<void> {
    this.player?.dispose();
    this.player = null;
    const state = await this.homeState();
    this.home = renderMenuView(this.root, state, {
      onSelection: (categoryId, modeId) => void this.select(categoryId, modeId),
      onDaily: () => void this.startDaily(),
      onPractice: () => void this.requestPractice(),
      onContinue: () => void this.continueActive(),
      onSettings: () => this.openSettings(),
      onHelp: () => showHowTo(() => undefined),
      onStats: () => void showStats(this.stats, this.dailyMeta),
      onAwards: () => void showAchievements(this.progress),
    });
  }
  private journeyState(): JourneyState {
    const level = levelFromXp(this.progress.xp);
    const today = localDateKey();
    const raw = this.progress.missionDate === today ? this.progress.missionProgress : [];
    return {
      level: level.level,
      title: titleForLevel(level.level),
      xpInto: level.into,
      xpNeed: level.need,
      missions: missionsForDate(today).map((def, slot) => ({
        label: def.label, progress: raw[slot] ?? 0, target: def.target,
      })),
      awardsEarned: Object.keys(this.progress.achievements).length,
      awardsTotal: ACHIEVEMENTS.length,
    };
  }
  private async homeState(): Promise<HomeState> {
    const { categoryId, modeId } = this.settings;
    const daily = await this.store.loadSession(sessionKey('daily', categoryId, modeId));
    const active = await this.store.loadActiveSession();
    return {
      categoryId,
      modeId,
      dailyStatus: !daily ? 'new' : daily.quiz.status === 'finished' ? 'done' : 'resume',
      stats: getStats(this.stats, categoryId, modeId),
      dailyMeta: this.dailyMeta,
      active,
      journey: this.journeyState(),
    };
  }
  private async select(categoryId: CategoryId, modeId: ModeId): Promise<void> {
    this.settings.categoryId = categoryId;
    this.settings.modeId = modeId;
    applyCategory(categoryId);
    void this.store.saveSettings(this.settings);
    this.home?.update(await this.homeState());
  }
  private async startDaily(): Promise<void> {
    void audio.unlock();
    const category = getCategory(this.settings.categoryId);
    const key = sessionKey('daily', category.id, this.settings.modeId);
    const saved = await this.store.loadSession(key);
    const session = saved ?? createSession(category, this.settings.modeId, 'daily', this.settings);
    saved?.quiz.status === 'finished' ? await this.showResults(session) : this.play(session);
  }
  private async requestPractice(): Promise<void> {
    const key = sessionKey('free', this.settings.categoryId, this.settings.modeId);
    const saved = await this.store.loadSession(key);
    if (saved?.quiz.status === 'playing') {
      showNewQuizConfirm(() => this.newPractice(), () => undefined);
      return;
    }
    this.newPractice();
  }
  private newPractice(categoryId = this.settings.categoryId, modeId = this.settings.modeId): void {
    void audio.unlock();
    const session = createSession(getCategory(categoryId), modeId, 'free', this.settings);
    this.play(session);
  }
  private async continueActive(): Promise<void> {
    const session = await this.store.loadActiveSession();
    if (!session) return;
    session.quiz.status === 'finished' ? await this.showResults(session) : this.play(session);
  }
  private play(session: GameSession): void {
    this.settings.categoryId = session.categoryId;
    this.settings.modeId = session.modeId;
    applyCategory(session.categoryId);
    void this.store.saveSettings(this.settings);
    void this.store.saveSession(session);
    analytics.track({
      name: 'quiz_started', kind: session.kind, modeId: session.modeId,
      categoryId: session.categoryId, timed: session.quiz.timerSeconds > 0,
    });
    this.player?.dispose();
    this.player = new PlaySession(this.root, session, this.store, {
      onFinish: (finished) => void this.showResults(finished),
      onPause: () => showPause(() => this.player?.resume(), () => void this.showHome()),
      onHelp: () => showHowTo(() => this.player?.resume()),
    });
    this.player.start();
  }
  private async showResults(session: GameSession): Promise<void> {
    this.player?.dispose();
    this.player = null;
    let reward: RoundReward | null = null;
    if (!session.recorded) {
      const outcome = await recordResult(this.store, this.stats, this.dailyMeta, this.progress, session);
      this.dailyMeta = outcome.dailyMeta;
      this.progress = outcome.progress;
      reward = outcome.reward;
      this.trackCompletion(session, reward);
    }
    const category = getCategory(session.categoryId);
    renderResultsView(this.root, {
      session,
      category: category.name,
      stats: getStats(this.stats, session.categoryId, session.modeId),
      dailyMeta: this.dailyMeta,
      reward,
      onShare: () => this.share(session),
      onAgain: () => this.newPractice(session.categoryId, session.modeId),
      onMenu: () => void this.showHome(),
    });
  }
  private trackCompletion(session: GameSession, reward: RoundReward): void {
    const answers = session.quiz.answers;
    analytics.track({
      name: 'quiz_completed', kind: session.kind, modeId: session.modeId,
      categoryId: session.categoryId, score: session.quiz.score,
      correct: answers.filter((answer) => answer.correct).length, total: answers.length,
    });
    for (const mission of reward.missionsCompleted) {
      analytics.track({ name: 'mission_completed', id: mission.id });
    }
    for (const achievement of reward.achievementsUnlocked) {
      analytics.track({ name: 'achievement_unlocked', id: achievement.id });
    }
    if (reward.level.level > reward.levelBefore || reward.achievementsUnlocked.length) {
      audio.milestone();
    }
  }
  private async share(session: GameSession) {
    const template = session.kind === 'daily'
      ? '{name} · Day {day} · {correct}/{total} · {score} pts'
      : '{name} · Practice · {correct}/{total} · {score} pts';
    const outcome = await shareOrCopy(shareText(template, PRODUCT_NAME, session.quiz));
    analytics.track({ name: 'result_shared', kind: session.kind, outcome });
    return outcome;
  }
  private openSettings(): void {
    showSettings(this.settings, (next, key) => {
      this.settings = next;
      applyPreferences(this.settings);
      void this.store.saveSettings(next);
      analytics.track({ name: 'settings_changed', key });
    }, () => undefined);
  }
}
