import { audio } from '../audio/audioCore.js';
import { shareText } from '../engine/share.js';
import type { ModeId } from '../engine/types.js';
import type { ProductStore } from '../platform/productStore.js';
import { getCategory } from '../product/countries.js';
import { PRODUCT_NAME } from '../product/config.js';
import { createSession, sessionKey } from '../product/session.js';
import { recordResult } from '../product/recordResult.js';
import { getStats } from '../product/stats.js';
import type { CategoryId, DailyMeta, GameSession, Settings, StatsBook } from '../product/types.js';
import { copyText } from './clipboard.js';
import { renderMenuView, type HomeHandle, type HomeState } from './menuView.js';
import { PlaySession } from './playSession.js';
import { applyCategory, applyPreferences } from './preferences.js';
import { renderResultsView } from './resultsView.js';
import { showHowTo, showNewQuizConfirm, showPause, showSettings } from './sheets.js';

/** Product-level navigation, persistence, and meta progression. */
export class App {
  private settings!: Settings;
  private stats!: StatsBook;
  private dailyMeta!: DailyMeta;
  private home: HomeHandle | null = null;
  private player: PlaySession | null = null;
  constructor(
    private readonly root: HTMLElement,
    private readonly store: ProductStore,
  ) {}
  /** Load additive saves and enter the standalone product. */
  async init(): Promise<void> {
    [this.settings, this.stats, this.dailyMeta] = await Promise.all([
      this.store.loadSettings(), this.store.loadStats(), this.store.loadDailyMeta(),
    ]);
    applyPreferences(this.settings);
    window.addEventListener('pagehide', () => this.player?.pause());
    await this.showHome();
    if (!this.settings.onboardingSeen) {
      showHowTo(() => {
        this.settings.onboardingSeen = true;
        void this.store.saveSettings(this.settings);
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
    });
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
    if (!session.recorded) {
      this.dailyMeta = await recordResult(this.store, this.stats, this.dailyMeta, session);
    }
    const category = getCategory(session.categoryId);
    renderResultsView(this.root, {
      session,
      category: category.name,
      stats: getStats(this.stats, session.categoryId, session.modeId),
      dailyMeta: this.dailyMeta,
      onShare: () => copyText(shareText(
        '{name} · Day {day} · {correct}/{total} · {score} pts', PRODUCT_NAME, session.quiz,
      )),
      onAgain: () => this.newPractice(session.categoryId, session.modeId),
      onMenu: () => void this.showHome(),
    });
  }
  private openSettings(): void {
    showSettings(this.settings, (next) => {
      this.settings = next;
      applyPreferences(this.settings);
      void this.store.saveSettings(next);
    }, () => undefined);
  }
}
