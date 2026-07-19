/** Small, locally-authored atlas/waypoint icon family. */
export type AtlasIconName =
  | 'americas' | 'europe' | 'asia' | 'africa'
  | 'choice' | 'boolean' | 'type' | 'compare'
  | 'help' | 'settings' | 'back' | 'close' | 'streak'
  | 'check' | 'waypoint' | 'target' | 'award' | 'level';

const PATHS: Record<AtlasIconName, string[]> = {
  americas: ['M7 3.5 4.5 7l2 2-1 3 3 2-.5 4.5 3.5 2 2-4.5 3-2-2-4 1-4-2.5-3.5Z', 'M15 5.5 19 7l.5 4-3 2-2-2.5'],
  europe: ['M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z'],
  asia: ['M3.5 17.5 9 9l3 4 3.5-6 5 10.5', 'M6 6.5h.01M18.5 4.5v3M17 6h3'],
  africa: ['M12 3 18.5 8.5 16 16l-4 5-5.5-7L6 8z', 'M9 9.5l6 5M15 9.5l-6 5'],
  choice: ['M4 5h16v14H4z', 'M8 9h8M8 13h5'],
  boolean: ['M4 6h7v12H4zM13 6h7v12h-7z', 'm6 12 1.5 1.5L10 10m5-1 3 6m0-6-3 6'],
  type: ['M5 6h14M12 6v12M8 18h8'],
  compare: ['M7 5v14m0 0-3-3m3 3 3-3M17 19V5m0 0-3 3m3-3 3 3'],
  help: ['M9.5 9a2.8 2.8 0 1 1 4.6 2.1c-1.4 1-2.1 1.5-2.1 3', 'M12 18h.01', 'M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Z'],
  settings: ['M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z', 'M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4'],
  back: ['m14.5 5-7 7 7 7', 'M8 12h11'],
  close: ['M6 6l12 12M18 6 6 18'],
  streak: ['M12.5 3.5c1 4-3 5-3 8 0 1.2.8 2.2 2 2.8-.2-2 1-3.3 2.8-4.8 1 1.8 2.7 3.5 2.7 6.2A5.5 5.5 0 0 1 5.5 15c0-4 3.2-6.6 7-11.5Z'],
  check: ['m5 12 4 4L19 6'],
  waypoint: ['M5 18c3-7 11-5 14-12', 'M16 6h3v3', 'M5 18h.01'],
  target: ['M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0Z', 'M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z', 'M12 12h.01'],
  award: ['M12 3 15 8l5 .8-3.6 3.8.8 5.4-5.2-2.4L6.8 18l.8-5.4L4 8.8 9 8Z'],
  level: ['M5 18h14M7 18V9h4v9m2 0V5h4v13'],
};

export function atlasIcon(name: string, className = 'atlas-icon'): HTMLSpanElement {
  const resolved = (name in PATHS ? name : 'waypoint') as AtlasIconName;
  const span = document.createElement('span');
  span.className = className;
  span.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  for (const data of PATHS[resolved]) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', data);
    svg.appendChild(path);
  }
  span.appendChild(svg);
  return span;
}
