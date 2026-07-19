import { SOURCE_NOTE } from '../product/config.js';
import { MODE_INFO } from '../product/config.js';
import type { ModeId } from '../engine/types.js';
import { CATEGORIES } from '../product/countries.js';
import type { Settings } from '../product/types.js';
import { h } from './dom.js';
import { icon } from './icons.js';

/** Close function returned by every modal sheet. */
export type CloseSheet = () => void;

/** Build and open a modal bottom sheet. Shared by every dialog. */
export function showSheet(title: string, content: Node[], onDismiss: () => void): CloseSheet {
  const close = (): void => {
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    onDismiss();
  };
  const onKey = (event: KeyboardEvent): void => { if (event.key === 'Escape') close(); };
  const panel = h('section', { className: 'sheet', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': title } }, [
    h('div', { className: 'sheet-handle' }),
    h('div', { className: 'sheet-header' }, [
      h('h2', { text: title }),
      h('button', { className: 'icon-btn', onClick: close, attrs: { type: 'button', 'aria-label': 'Close' } }, [icon('close')]),
    ]),
    ...content,
  ]);
  const overlay = h('div', { className: 'sheet-overlay' }, [panel]);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
  document.body.appendChild(overlay);
  document.addEventListener('keydown', onKey);
  requestAnimationFrame(() => overlay.classList.add('visible'));
  panel.querySelector<HTMLButtonElement>('button')?.focus();
  return close;
}

/** First-run and reusable how-to card. */
export function showHowTo(onDismiss: () => void): CloseSheet {
  const steps = [
    ['1', 'Choose your route', 'Pick a region and one of four ways to play.'],
    ['2', 'Answer, then learn', 'Every reveal shows the answer and a clear explanation.'],
    ['3', 'Use one-shot assists', '50:50, Skip, and +10 seconds each work once per quiz.'],
    ['4', 'Build a combo', 'Fast correct answers score more; streaks raise the multiplier.'],
  ];
  return showSheet('How to play', [
    h('p', { className: 'sheet-intro', text: 'Five questions. One quick trip around the world.' }),
    h('div', { className: 'how-list' }, steps.map(([number, title, copy]) => h('div', { className: 'how-step' }, [
      h('b', { text: number }), h('div', {}, [h('strong', { text: title }), h('p', { text: copy })]),
    ]))),
    h('button', { className: 'primary-action', text: 'Got it', onClick: () => close(), attrs: { type: 'button' } }),
  ], onDismiss);
  function close(): void { document.querySelector<HTMLElement>('.sheet-overlay')?.click(); }
}

/** Persisted theme, audio, haptic, and timer settings. */
export function showSettings(
  settings: Settings,
  onChange: (next: Settings, key: string) => void,
  onDismiss: () => void,
): CloseSheet {
  const local = { ...settings };
  const rows: HTMLElement[] = [];
  const addToggle = (label: string, copy: string, key: 'sound' | 'music' | 'haptics' | 'timer'): void => {
    const button = h('button', { className: 'toggle', attrs: { type: 'button', role: 'switch' } });
    const update = (): void => {
      button.textContent = local[key] ? 'On' : 'Off';
      button.setAttribute('aria-checked', String(local[key]));
      button.classList.toggle('on', local[key]);
    };
    button.addEventListener('click', () => { local[key] = !local[key]; update(); onChange({ ...local }, key); });
    update();
    rows.push(settingRow(label, copy, button));
  };
  const THEME_LABELS = { light: 'Light', dark: 'Dark', system: 'Auto' } as const;
  const theme = h('div', { className: 'segmented' }, (['light', 'dark', 'system'] as const).map((value) => h('button', {
    className: local.theme === value ? 'selected' : '',
    text: THEME_LABELS[value],
    onClick: (event) => {
      local.theme = value;
      (event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button').forEach((button) => button.classList.toggle('selected', button === event.currentTarget));
      onChange({ ...local }, 'theme');
    },
    attrs: { type: 'button' },
  })));
  rows.push(settingRow('Appearance', 'Light, dark, or follow the device.', theme));
  addToggle('Sound effects', 'Procedural taps, reveals, and fanfare.', 'sound');
  addToggle('Ambient music', 'A very quiet focus tone.', 'music');
  addToggle('Vibration', 'Tiny pulses on answers, where supported.', 'haptics');
  addToggle('Practice timer', '15s + speed bonus. The Daily is always timed so scores stay fair.', 'timer');
  return showSheet('Settings', [
    h('div', { className: 'settings-list' }, rows),
    h('p', { className: 'source-note', text: SOURCE_NOTE }),
  ], onDismiss);
}

/** One compact Topic · Format · Pace chooser for practice. */
export function showCustomize(
  settings: Settings,
  onStart: (next: Settings) => void,
  onDismiss: () => void,
): CloseSheet {
  const local = { ...settings };
  let close = (): void => undefined;
  const topicButtons = CATEGORIES.map((category) => h('button', {
    className: `choice-chip${local.categoryId === category.id ? ' selected' : ''}`,
    onClick: (event) => {
      local.categoryId = category.id;
      (event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button')
        .forEach((button) => button.classList.toggle('selected', button === event.currentTarget));
    },
    attrs: { type: 'button' },
  }, [icon(category.icon), document.createTextNode(category.name)]));
  const modeButtons = (Object.keys(MODE_INFO) as ModeId[]).map((modeId) => {
    const info = MODE_INFO[modeId];
    return h('button', {
      className: `format-choice${local.modeId === modeId ? ' selected' : ''}`,
      onClick: (event) => {
        local.modeId = modeId;
        (event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button')
          .forEach((button) => button.classList.toggle('selected', button === event.currentTarget));
      },
      attrs: { type: 'button' },
    }, [icon(info.icon), h('span', {}, [h('strong', { text: info.label }), h('small', { text: info.short })])]);
  });
  const paceButtons = ([false, true] as const).map((timed) => h('button', {
    className: `pace-choice${local.timer === timed ? ' selected' : ''}`,
    onClick: (event) => {
      local.timer = timed;
      (event.currentTarget as HTMLElement).parentElement?.querySelectorAll('button')
        .forEach((button) => button.classList.toggle('selected', button === event.currentTarget));
    },
    attrs: { type: 'button' },
  }, [icon(timed ? 'streak' : 'route'), h('span', {}, [
    h('strong', { text: timed ? '15 seconds' : 'Relaxed' }),
    h('small', { text: timed ? 'Speed bonus' : 'No timer' }),
  ])]));
  close = showSheet('Customize your route', [
    h('p', { className: 'sheet-intro', text: 'Five questions · about 60 seconds' }),
    choiceGroup('Topic', 'Choose a part of the world.', 'topic-grid', topicButtons),
    choiceGroup('Format', 'Choose how answers work.', 'format-grid', modeButtons),
    choiceGroup('Pace', 'Practice can be relaxed or timed.', 'pace-grid', paceButtons),
    h('button', {
      className: 'primary-action', text: 'Start route',
      onClick: () => { close(); onStart({ ...local }); }, attrs: { type: 'button' },
    }),
  ], onDismiss);
  return close;
}

/** Confirm replacing an unfinished practice round. */
export function showNewQuizConfirm(onConfirm: () => void, onDismiss: () => void): CloseSheet {
  let close = (): void => undefined;
  close = showSheet('Start a new quiz?', [
    h('p', { className: 'sheet-intro', text: 'This will replace the unfinished practice route for your current region and mode.' }),
    h('button', { className: 'primary-action danger', text: 'Start new quiz', onClick: () => { close(); onConfirm(); }, attrs: { type: 'button' } }),
    h('button', { className: 'secondary-action', text: 'Keep current quiz', onClick: () => close(), attrs: { type: 'button' } }),
  ], onDismiss);
  return close;
}

/** Pause sheet with explicit resume and save-and-exit actions. */
export function showPause(onResume: () => void, onExit: () => void): CloseSheet {
  let close = (): void => undefined;
  let handled = false;
  close = showSheet('Quiz paused', [
    h('p', { className: 'sheet-intro', text: 'The timer is stopped and your exact place is saved.' }),
    h('button', { className: 'primary-action', text: 'Resume', onClick: () => { handled = true; close(); onResume(); }, attrs: { type: 'button' } }),
    h('button', { className: 'secondary-action', text: 'Save & exit', onClick: () => { handled = true; close(); onExit(); }, attrs: { type: 'button' } }),
  ], () => { if (!handled) onResume(); });
  return close;
}

function settingRow(label: string, copy: string, control: HTMLElement): HTMLElement {
  return h('div', { className: 'setting-row' }, [h('div', {}, [h('strong', { text: label }), h('p', { text: copy })]), control]);
}

function choiceGroup(label: string, copy: string, className: string, choices: HTMLElement[]): HTMLElement {
  return h('fieldset', { className: 'choice-group' }, [
    h('legend', { text: label }), h('p', { text: copy }), h('div', { className }, choices),
  ]);
}
