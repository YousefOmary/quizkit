import { audio } from '../audio/audioCore.js';
import { haptics } from '../platform/haptics.js';
import { getCategory } from '../product/countries.js';
import type { CategoryId, Settings } from '../product/types.js';

const DARK_QUERY = '(prefers-color-scheme: dark)';

/** Resolve the theme preference ('system' follows the device). */
function resolveTheme(theme: Settings['theme']): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

/** Apply persisted appearance/audio/haptic preferences to the live shell. */
export function applyPreferences(settings: Settings): void {
  const theme = resolveTheme(settings.theme);
  document.documentElement.dataset.theme = theme;
  const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeMeta?.setAttribute('content', theme === 'dark' ? '#101217' : '#f4f2ec');
  applyCategory(settings.categoryId);
  audio.setPreferences(settings.sound, settings.music);
  haptics.setEnabled(settings.haptics);
}

/**
 * Re-apply preferences when the device theme flips while 'system' is
 * selected. Call once at startup; reads settings lazily via the getter.
 */
export function watchSystemTheme(getSettings: () => Settings): void {
  if (typeof matchMedia !== 'function') return;
  matchMedia(DARK_QUERY).addEventListener('change', () => {
    if (getSettings().theme === 'system') applyPreferences(getSettings());
  });
}

/** Apply the selected category accent without rebuilding a screen. */
export function applyCategory(categoryId: CategoryId): void {
  document.documentElement.style.setProperty('--category', getCategory(categoryId).accent);
}
