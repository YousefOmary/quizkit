import { copyText } from './clipboard.js';

/** How a share attempt ended, for user feedback. */
export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed';

/**
 * Share text through the native share sheet when available, falling back
 * to the clipboard. Input: the share text. Output: what actually happened —
 * 'cancelled' means the player dismissed the native sheet (show nothing).
 */
export async function shareOrCopy(text: string): Promise<ShareOutcome> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled';
      /* NotAllowedError etc. — fall through to the clipboard */
    }
  }
  return (await copyText(text)) ? 'copied' : 'failed';
}
