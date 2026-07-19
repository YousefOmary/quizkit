/**
 * Atlas Sprint's single owned UI icon set.
 * Every mark uses the same rounded 2px route-line construction.
 */
export type IconName =
  | 'award'
  | 'back'
  | 'check'
  | 'close'
  | 'compass'
  | 'customize'
  | 'flag'
  | 'help'
  | 'journey'
  | 'level'
  | 'map'
  | 'pin'
  | 'route'
  | 'settings'
  | 'spark'
  | 'streak'
  | 'target'
  | 'type'
  | 'world'
  | 'wrong';

const NS = 'http://www.w3.org/2000/svg';

const PATHS: Record<IconName, string[]> = {
  award: ['M12 3 14.5 7.2 19 8l-3.1 3.4.6 4.6-4.5-2-4.5 2 .6-4.6L5 8l4.5-.8L12 3Z', 'M9 16.5 7.5 22l4.5-2 4.5 2-1.5-5.5'],
  back: ['m15 18-6-6 6-6'],
  check: ['m5 12 4 4L19 6'],
  close: ['M7 7l10 10M17 7 7 17'],
  compass: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'm15.5 8.5-2.1 4.9-4.9 2.1 2.1-4.9 4.9-2.1Z'],
  customize: ['M4 7h8M16 7h4M12 4v6M4 17h4M12 17h8M8 14v6'],
  flag: ['M6 21V4m0 1h10l-2 4 2 4H6'],
  help: ['M9.6 9a2.6 2.6 0 1 1 3.6 2.4c-.9.4-1.2.9-1.2 1.6', 'M12 17h.01', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z'],
  journey: ['M5 4.5c2-.8 4.2-.5 7 1.2v14c-2.8-1.7-5-2-7-1.2v-14Z', 'M19 4.5c-2-.8-4.2-.5-7 1.2v14c2.8-1.7 5-2 7-1.2v-14Z'],
  level: ['m12 3 3 6 6 .9-4.4 4.4 1 6.2-5.6-2.9-5.6 2.9 1-6.2L3 9.9 9 9l3-6Z'],
  map: ['m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z', 'M9 4v14M15 6v14'],
  pin: ['M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z', 'M12 8.2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z'],
  route: ['M5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm14-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M8 15h3c2.5 0 1.5-6 4-6h1'],
  settings: ['M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z', 'M19 13.5v-3l-2-.7-.6-1.4.9-1.9-2.1-2.1-1.9.9-1.4-.6-.7-2h-3l-.7 2-1.4.6-1.9-.9L.1 6.5 3 8.4l-.6 1.4-2 .7v3l2 .7.6 1.4-.9 1.9 2.1 2.1 1.9-.9 1.4.6.7 2h3l.7-2 1.4-.6 1.9.9 2.1-2.1-.9-1.9.6-1.4 2-.7Z'],
  spark: ['M12 3c.7 4.2 2.8 6.3 7 7-4.2.7-6.3 2.8-7 7-.7-4.2-2.8-6.3-7-7 4.2-.7 6.3-2.8 7-7Z', 'M19 17c.2 1.2.8 1.8 2 2-1.2.2-1.8.8-2 2-.2-1.2-.8-1.8-2-2 1.2-.2 1.8-.8 2-2Z'],
  streak: ['M13.5 3.5c.7 3.1-.6 4.2-2 5.7-1-1-1.5-2-1.3-3.5C7.5 8 5.5 10.6 5.5 14A6.5 6.5 0 0 0 18.5 14c0-2.8-1.5-5.5-5-10.5Z', 'M12 12c1.5 1.2 2 2.3 2 3.4a2 2 0 1 1-4 0c0-1.1.7-2.2 2-3.4Z'],
  target: ['M12 3a9 9 0 1 0 9 9', 'M12 7a5 5 0 1 0 5 5', 'M12 12l8-8M16 4h4v4'],
  type: ['M5 5h14M12 5v14M8 19h8'],
  world: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M3 12h18M12 3c2.2 2.4 3.2 5.4 3 9 .2 3.6-.8 6.6-3 9-2.2-2.4-3.2-5.4-3-9-.2-3.6.8-6.6 3-9Z'],
  wrong: ['M7 7l10 10M17 7 7 17'],
};

/** Build a decorative or labelled icon without injecting HTML strings. */
export function icon(name: IconName, label?: string, className = 'ui-icon'): SVGSVGElement {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('class', className);
  if (label) {
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label);
  } else {
    svg.setAttribute('aria-hidden', 'true');
  }
  for (const d of PATHS[name]) {
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }
  return svg;
}

