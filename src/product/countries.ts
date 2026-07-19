import type { Category } from './types.js';

/**
 * Curated product content checked against the final CIA World Factbook archive.
 * Two-letter marks are deliberately text monograms, not platform-rendered flags.
 */
export const CATEGORIES: Category[] = [
  {
    id: 'americas', name: 'Americas', icon: 'americas', accent: '#ff6b4a', facts: [
      { name: 'Canada', flag: 'CA', capital: 'Ottawa', area: 9_984_670 },
      { name: 'United States', flag: 'US', capital: 'Washington, D.C.', accepted: ['Washington DC', 'Washington'], area: 9_833_517 },
      { name: 'Brazil', flag: 'BR', capital: 'Brasília', accepted: ['Brasilia'], area: 8_515_770 },
      { name: 'Argentina', flag: 'AR', capital: 'Buenos Aires', area: 2_780_400 },
      { name: 'Mexico', flag: 'MX', capital: 'Mexico City', area: 1_964_375 },
      { name: 'Peru', flag: 'PE', capital: 'Lima', area: 1_285_216 },
      { name: 'Colombia', flag: 'CO', capital: 'Bogotá', accepted: ['Bogota'], area: 1_138_910 },
      { name: 'Chile', flag: 'CL', capital: 'Santiago', area: 756_102 },
      { name: 'Venezuela', flag: 'VE', capital: 'Caracas', area: 912_050 },
      { name: 'Bolivia', flag: 'BO', capital: 'Sucre', area: 1_098_581 },
      { name: 'Ecuador', flag: 'EC', capital: 'Quito', area: 283_561 },
      { name: 'Paraguay', flag: 'PY', capital: 'Asunción', accepted: ['Asuncion'], area: 406_752 },
      { name: 'Uruguay', flag: 'UY', capital: 'Montevideo', area: 176_215 },
      { name: 'Guyana', flag: 'GY', capital: 'Georgetown', area: 214_969 },
      { name: 'Suriname', flag: 'SR', capital: 'Paramaribo', area: 163_820 },
      { name: 'Cuba', flag: 'CU', capital: 'Havana', area: 110_860 },
      { name: 'Guatemala', flag: 'GT', capital: 'Guatemala City', area: 108_889 },
      { name: 'Costa Rica', flag: 'CR', capital: 'San José', accepted: ['San Jose'], area: 51_100 },
      { name: 'Panama', flag: 'PA', capital: 'Panama City', area: 75_420 },
      { name: 'Dominican Republic', flag: 'DO', capital: 'Santo Domingo', area: 48_670 },
    ],
  },
  {
    id: 'europe', name: 'Europe', icon: 'europe', accent: '#7759f4', facts: [
      { name: 'France', flag: 'FR', capital: 'Paris', area: 643_801 },
      { name: 'Spain', flag: 'ES', capital: 'Madrid', area: 505_370 },
      { name: 'Germany', flag: 'DE', capital: 'Berlin', area: 357_022 },
      { name: 'Poland', flag: 'PL', capital: 'Warsaw', accepted: ['Warszawa'], area: 312_685 },
      { name: 'Italy', flag: 'IT', capital: 'Rome', accepted: ['Roma'], area: 301_340 },
      { name: 'Greece', flag: 'GR', capital: 'Athens', area: 131_957 },
      { name: 'United Kingdom', flag: 'GB', capital: 'London', area: 243_610 },
      { name: 'Ireland', flag: 'IE', capital: 'Dublin', area: 70_273 },
      { name: 'Portugal', flag: 'PT', capital: 'Lisbon', area: 92_090 },
      { name: 'Netherlands', flag: 'NL', capital: 'Amsterdam', area: 41_543 },
      { name: 'Belgium', flag: 'BE', capital: 'Brussels', area: 30_528 },
      { name: 'Switzerland', flag: 'CH', capital: 'Bern', area: 41_277 },
      { name: 'Austria', flag: 'AT', capital: 'Vienna', area: 83_871 },
      { name: 'Czechia', flag: 'CZ', capital: 'Prague', area: 78_867 },
      { name: 'Hungary', flag: 'HU', capital: 'Budapest', area: 93_028 },
      { name: 'Romania', flag: 'RO', capital: 'Bucharest', area: 238_391 },
      { name: 'Sweden', flag: 'SE', capital: 'Stockholm', area: 450_295 },
      { name: 'Norway', flag: 'NO', capital: 'Oslo', area: 323_802 },
      { name: 'Finland', flag: 'FI', capital: 'Helsinki', area: 338_145 },
      { name: 'Denmark', flag: 'DK', capital: 'Copenhagen', area: 43_094 },
    ],
  },
  {
    id: 'asia', name: 'Asia', icon: 'asia', accent: '#e2a600', facts: [
      { name: 'Mongolia', flag: 'MN', capital: 'Ulaanbaatar', accepted: ['Ulan Bator'], area: 1_564_116 },
      { name: 'Thailand', flag: 'TH', capital: 'Bangkok', area: 513_120 },
      { name: 'Japan', flag: 'JP', capital: 'Tokyo', area: 377_915 },
      { name: 'Vietnam', flag: 'VN', capital: 'Hanoi', accepted: ['Ha Noi'], area: 331_210 },
      { name: 'South Korea', flag: 'KR', capital: 'Seoul', area: 99_720 },
      { name: 'Jordan', flag: 'JO', capital: 'Amman', area: 89_342 },
      { name: 'China', flag: 'CN', capital: 'Beijing', area: 9_596_960 },
      { name: 'India', flag: 'IN', capital: 'New Delhi', area: 3_287_263 },
      { name: 'Indonesia', flag: 'ID', capital: 'Jakarta', area: 1_904_569 },
      { name: 'Philippines', flag: 'PH', capital: 'Manila', area: 300_000 },
      { name: 'Malaysia', flag: 'MY', capital: 'Kuala Lumpur', area: 329_847 },
      { name: 'Singapore', flag: 'SG', capital: 'Singapore', area: 719 },
      { name: 'Nepal', flag: 'NP', capital: 'Kathmandu', area: 147_181 },
      { name: 'Bangladesh', flag: 'BD', capital: 'Dhaka', area: 148_460 },
      { name: 'Pakistan', flag: 'PK', capital: 'Islamabad', area: 796_095 },
      { name: 'Sri Lanka', flag: 'LK', capital: 'Sri Jayewardenepura Kotte', accepted: ['Sri Jayawardenepura Kotte', 'Kotte'], area: 65_610 },
      { name: 'Saudi Arabia', flag: 'SA', capital: 'Riyadh', area: 2_149_690 },
      { name: 'United Arab Emirates', flag: 'AE', capital: 'Abu Dhabi', area: 83_600 },
      { name: 'Oman', flag: 'OM', capital: 'Muscat', area: 309_500 },
      { name: 'Cambodia', flag: 'KH', capital: 'Phnom Penh', area: 181_035 },
    ],
  },
  {
    id: 'africa', name: 'Africa', icon: 'africa', accent: '#00a77b', facts: [
      { name: 'Ethiopia', flag: 'ET', capital: 'Addis Ababa', area: 1_104_300 },
      { name: 'Egypt', flag: 'EG', capital: 'Cairo', area: 1_001_450 },
      { name: 'Nigeria', flag: 'NG', capital: 'Abuja', area: 923_768 },
      { name: 'Kenya', flag: 'KE', capital: 'Nairobi', area: 580_367 },
      { name: 'Ghana', flag: 'GH', capital: 'Accra', area: 238_533 },
      { name: 'Senegal', flag: 'SN', capital: 'Dakar', area: 196_722 },
      { name: 'South Africa', flag: 'ZA', capital: 'Pretoria', accepted: ['Cape Town', 'Bloemfontein'], area: 1_219_090 },
      { name: 'Morocco', flag: 'MA', capital: 'Rabat', area: 716_550 },
      { name: 'Algeria', flag: 'DZ', capital: 'Algiers', area: 2_381_740 },
      { name: 'Tunisia', flag: 'TN', capital: 'Tunis', area: 163_610 },
      { name: 'Uganda', flag: 'UG', capital: 'Kampala', area: 241_038 },
      { name: 'Tanzania', flag: 'TZ', capital: 'Dodoma', area: 947_300 },
      { name: 'Rwanda', flag: 'RW', capital: 'Kigali', area: 26_338 },
      { name: 'Angola', flag: 'AO', capital: 'Luanda', area: 1_246_700 },
      { name: 'Zambia', flag: 'ZM', capital: 'Lusaka', area: 752_618 },
      { name: 'Zimbabwe', flag: 'ZW', capital: 'Harare', area: 390_757 },
      { name: 'Botswana', flag: 'BW', capital: 'Gaborone', area: 581_730 },
      { name: 'Namibia', flag: 'NA', capital: 'Windhoek', area: 824_292 },
      { name: 'Madagascar', flag: 'MG', capital: 'Antananarivo', area: 587_041 },
      { name: 'Mozambique', flag: 'MZ', capital: 'Maputo', area: 799_380 },
    ],
  },
];

/** Resolve a region, falling back to the first product category. */
export function getCategory(id: string): Category {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0]!;
}
