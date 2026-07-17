import type { Category } from './types.js';

/** Curated product content, checked against the CIA World Factbook 2025 archive. */
export const CATEGORIES: Category[] = [
  {
    id: 'americas', name: 'Americas', icon: '◉', accent: '#ff6b4a', facts: [
      { name: 'Canada', flag: '🇨🇦', capital: 'Ottawa', area: 9_984_670 },
      { name: 'United States', flag: '🇺🇸', capital: 'Washington, D.C.', accepted: ['Washington DC', 'Washington'], area: 9_833_517 },
      { name: 'Brazil', flag: '🇧🇷', capital: 'Brasília', accepted: ['Brasilia'], area: 8_515_770 },
      { name: 'Argentina', flag: '🇦🇷', capital: 'Buenos Aires', area: 2_780_400 },
      { name: 'Mexico', flag: '🇲🇽', capital: 'Mexico City', area: 1_964_375 },
      { name: 'Peru', flag: '🇵🇪', capital: 'Lima', area: 1_285_216 },
    ],
  },
  {
    id: 'europe', name: 'Europe', icon: '✦', accent: '#7759f4', facts: [
      { name: 'France', flag: '🇫🇷', capital: 'Paris', area: 643_801 },
      { name: 'Spain', flag: '🇪🇸', capital: 'Madrid', area: 505_370 },
      { name: 'Germany', flag: '🇩🇪', capital: 'Berlin', area: 357_022 },
      { name: 'Poland', flag: '🇵🇱', capital: 'Warsaw', accepted: ['Warszawa'], area: 312_685 },
      { name: 'Italy', flag: '🇮🇹', capital: 'Rome', accepted: ['Roma'], area: 301_340 },
      { name: 'Greece', flag: '🇬🇷', capital: 'Athens', area: 131_957 },
    ],
  },
  {
    id: 'asia', name: 'Asia', icon: '◆', accent: '#e2a600', facts: [
      { name: 'Mongolia', flag: '🇲🇳', capital: 'Ulaanbaatar', accepted: ['Ulan Bator'], area: 1_564_116 },
      { name: 'Thailand', flag: '🇹🇭', capital: 'Bangkok', area: 513_120 },
      { name: 'Japan', flag: '🇯🇵', capital: 'Tokyo', area: 377_915 },
      { name: 'Vietnam', flag: '🇻🇳', capital: 'Hanoi', area: 331_210 },
      { name: 'South Korea', flag: '🇰🇷', capital: 'Seoul', area: 99_720 },
      { name: 'Jordan', flag: '🇯🇴', capital: 'Amman', area: 89_342 },
    ],
  },
  {
    id: 'africa', name: 'Africa', icon: '▲', accent: '#00a77b', facts: [
      { name: 'Ethiopia', flag: '🇪🇹', capital: 'Addis Ababa', area: 1_104_300 },
      { name: 'Egypt', flag: '🇪🇬', capital: 'Cairo', area: 1_001_450 },
      { name: 'Nigeria', flag: '🇳🇬', capital: 'Abuja', area: 923_768 },
      { name: 'Kenya', flag: '🇰🇪', capital: 'Nairobi', area: 580_367 },
      { name: 'Ghana', flag: '🇬🇭', capital: 'Accra', area: 238_533 },
      { name: 'Senegal', flag: '🇸🇳', capital: 'Dakar', area: 196_722 },
    ],
  },
];

/** Resolve a region, falling back to the first product category. */
export function getCategory(id: string): Category {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0]!;
}
