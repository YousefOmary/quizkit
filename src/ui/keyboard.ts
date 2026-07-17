import { h } from './dom.js';

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

/** Controller for the semantic on-screen type-answer keyboard. */
export interface KeyboardHandle {
  root: HTMLElement;
  disable: () => void;
  destroy: () => void;
  value: () => string;
}

/** Build a real-button keyboard that never summons the native keyboard. */
export function createKeyboard(onSubmit: (value: string) => void): KeyboardHandle {
  let value = '';
  let disabled = false;
  const buttons: HTMLButtonElement[] = [];
  const display = h('input', {
    className: 'type-display',
    attrs: {
      readonly: '',
      inputmode: 'none',
      'aria-label': 'Your answer',
      placeholder: 'Type the capital…',
    },
  });

  const update = (): void => { display.value = value; };
  const press = (key: string): void => {
    if (disabled) return;
    if (key === '⌫') value = value.slice(0, -1);
    else if (key === 'SPACE') value += ' ';
    else if (key === 'ENTER') {
      if (value.trim()) onSubmit(value);
      return;
    } else if (value.length < 32) value += key;
    update();
  };

  const keyButton = (key: string, label = key): HTMLButtonElement => {
    const button = h('button', {
      className: `key key-${key.toLowerCase()}`,
      text: label,
      onClick: () => press(key),
      attrs: { type: 'button', 'aria-label': label },
    });
    buttons.push(button);
    return button;
  };

  const rows = ROWS.map((letters) => h('div', { className: 'key-row' },
    [...letters].map((letter) => keyButton(letter)),
  ));
  rows.push(h('div', { className: 'key-row final-row' }, [
    keyButton('⌫', 'Delete'),
    keyButton('SPACE', 'Space'),
    keyButton('ENTER', 'Enter'),
  ]));
  const root = h('div', { className: 'type-answer' }, [display, h('div', {
    className: 'keyboard',
    attrs: { role: 'group', 'aria-label': 'Answer keyboard' },
  }, rows)]);

  const onKey = (event: KeyboardEvent): void => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (/^[a-z]$/i.test(event.key)) press(event.key.toUpperCase());
    else if (event.key === 'Backspace') press('⌫');
    else if (event.key === ' ') press('SPACE');
    else if (event.key === 'Enter') press('ENTER');
  };
  document.addEventListener('keydown', onKey);
  return {
    root,
    value: () => value,
    disable: () => {
      disabled = true;
      display.disabled = true;
      buttons.forEach((button) => { button.disabled = true; });
    },
    destroy: () => document.removeEventListener('keydown', onKey),
  };
}
