import { audio } from '../audio/audioCore.js';
import { getCategory } from '../product/countries.js';
import type { CategoryId, Settings } from '../product/types.js';

/** Apply persisted appearance/audio preferences to the live shell. */
export function applyPreferences(settings: Settings): void {
  document.documentElement.dataset.theme = settings.theme;
  const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeMeta?.setAttribute('content', settings.theme === 'dark' ? '#101217' : '#f4f2ec');
  applyCategory(settings.categoryId);
  audio.setPreferences(settings.sound, settings.music);
}

/** Apply the selected category accent without rebuilding a screen. */
export function applyCategory(categoryId: CategoryId): void {
  document.documentElement.style.setProperty('--category', getCategory(categoryId).accent);
}
