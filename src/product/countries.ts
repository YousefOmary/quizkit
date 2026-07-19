import { COUNTRY_RECORDS, LANDMARK_RECORDS } from './contentData.js';
import type {
  AtomicFact, Category, ContentPackId, CountryRecord, Difficulty,
} from './types.js';

export { COUNTRY_RECORDS, LANDMARK_RECORDS } from './contentData.js';

export const CONTENT_SOURCES = {
  unM49: 'https://unstats.un.org/unsd/methodology/m49/overview/',
  iso3166: 'https://www.iso.org/iso-3166-country-codes.html',
  factbookArea: 'https://www.cia.gov/the-world-factbook/about/archives/2025/field/area/country-comparison/',
  factbookCountries: 'https://www.cia.gov/the-world-factbook/about/archives/2025/countries/',
  unesco: 'https://whc.unesco.org/en/list/',
} as const;

const VERIFIED_ON = '2026-07-19';
const UN_EDITION = 'UN M49 / ISO 3166 live snapshot, 2026-07-19';
const FACTBOOK_EDITION = 'CIA World Factbook 2025 archive; cross-checked against the final January 2026 snapshot';
const UNESCO_EDITION = 'UNESCO World Heritage List snapshot, 2026-07-19';

/** Frozen launch manifest: exactly six packs and 100 verified facts per pack. */
export const PACK_MANIFEST: ReadonlyArray<{
  id: ContentPackId;
  name: string;
  factCount: 100;
  frozen: true;
  sourceUrl: string;
}> = [
  { id: 'countries-core-v1', name: 'Countries', factCount: 100, frozen: true, sourceUrl: CONTENT_SOURCES.unM49 },
  { id: 'flags-shapes-v1', name: 'Flags & Shapes', factCount: 100, frozen: true, sourceUrl: CONTENT_SOURCES.iso3166 },
  { id: 'capitals-cities-v1', name: 'Capitals & Cities', factCount: 100, frozen: true, sourceUrl: CONTENT_SOURCES.factbookCountries },
  { id: 'landmarks-v1', name: 'Landmarks', factCount: 100, frozen: true, sourceUrl: CONTENT_SOURCES.unesco },
  { id: 'nature-v1', name: 'Nature', factCount: 100, frozen: true, sourceUrl: CONTENT_SOURCES.factbookArea },
  { id: 'map-sense-v1', name: 'Map Sense', factCount: 100, frozen: true, sourceUrl: CONTENT_SOURCES.unM49 },
];

function baseFact(
  id: string,
  packId: ContentPackId,
  difficulty: Difficulty,
  data: Omit<AtomicFact, 'id' | 'packId' | 'difficulty' | 'verifiedOn' | 'verification'>,
): AtomicFact {
  return { id, packId, difficulty, verifiedOn: VERIFIED_ON, verification: 'verified', ...data };
}

function countryAliases(name: string): string[] {
  const aliases: Record<string, string[]> = {
    'United States': ['USA', 'US', 'United States of America'],
    'United Kingdom': ['UK', 'Great Britain'],
    'South Korea': ['Republic of Korea', 'Korea, South'],
    'United Arab Emirates': ['UAE'],
    'Türkiye': ['Turkey'],
    Czechia: ['Czech Republic'],
  };
  return aliases[name] ?? [];
}

const COUNTRY_FACTS = COUNTRY_RECORDS.map((country) => baseFact(
  `countries-core-v1:${country.iso3.toLowerCase()}`, 'countries-core-v1', country.difficulty,
  {
    prompt: `Which UN M49 region includes ${country.name}?`,
    canonicalAnswer: country.region,
    acceptedVariants: [],
    explanation: `${country.name} is grouped in ${country.region} by the UN M49 standard.`,
    statementTemplate: `{answer} is the UN M49 region that includes ${country.name}.`,
    sourceUrl: CONTENT_SOURCES.unM49, sourceEdition: UN_EDITION,
    ambiguityNote: 'UN statistical grouping; it does not imply a political position.',
    localeNote: 'Uses the UN short-form English country name.',
  },
));

const FLAG_FACTS = COUNTRY_RECORDS.map((country) => baseFact(
  `flags-shapes-v1:${country.iso3.toLowerCase()}`, 'flags-shapes-v1', country.difficulty,
  {
    prompt: 'Which country does this flag represent?',
    canonicalAnswer: country.name,
    acceptedVariants: countryAliases(country.name),
    explanation: `This is the national flag identified by ISO 3166 code ${country.iso2.toUpperCase()} for ${country.name}.`,
    statementTemplate: `This is the flag of {answer}.`,
    sourceUrl: CONTENT_SOURCES.iso3166, sourceEdition: UN_EDITION,
    ambiguityNote: 'Sovereign UN members only; no disputed or dependency flags.',
    localeNote: 'Country name follows the launch English display-name registry.',
    visual: { kind: 'flag', code: country.iso2, alt: `National flag of ${country.name}` },
  },
));

const CAPITAL_FACTS = COUNTRY_RECORDS.map((country) => baseFact(
  `capitals-cities-v1:${country.iso3.toLowerCase()}`, 'capitals-cities-v1', country.difficulty,
  {
    prompt: `What is the capital of ${country.name}?`,
    canonicalAnswer: country.capital,
    acceptedVariants: country.accepted,
    explanation: `${country.capital} is the capital of ${country.name}.`,
    statementTemplate: `{answer} is the capital of ${country.name}.`,
    sourceUrl: CONTENT_SOURCES.factbookCountries, sourceEdition: FACTBOOK_EDITION,
    ambiguityNote: 'Countries with split or disputed capital arrangements are excluded from the launch set.',
    localeNote: 'Common unambiguous transliterations and diacritic-free input are accepted.',
  },
));

const LANDMARK_FACTS = LANDMARK_RECORDS.map((landmark) => baseFact(
  `landmarks-v1:${landmark.id}`, 'landmarks-v1', landmark.difficulty,
  {
    prompt: `Which country is ${landmark.name} in?`,
    canonicalAnswer: landmark.country,
    acceptedVariants: countryAliases(landmark.country),
    explanation: `${landmark.name} is a UNESCO World Heritage property in ${landmark.country}.`,
    statementTemplate: `${landmark.name} is in {answer}.`,
    sourceUrl: CONTENT_SOURCES.unesco, sourceEdition: UNESCO_EDITION,
    ambiguityNote: 'Single-state properties only; transboundary and disputed-location properties are excluded.',
    localeNote: 'Uses UNESCO’s English property title and State Party location.',
  },
));

const NATURE_FACTS = COUNTRY_RECORDS.map((country) => baseFact(
  `nature-v1:${country.iso3.toLowerCase()}`, 'nature-v1', country.difficulty,
  {
    prompt: `Which country has a total area of ${country.area.toLocaleString('en-US')} km²?`,
    canonicalAnswer: country.name,
    acceptedVariants: countryAliases(country.name),
    explanation: `${country.name} has a total area of ${country.area.toLocaleString('en-US')} km², including inland water.`,
    statementTemplate: `{answer} has a total area of ${country.area.toLocaleString('en-US')} km².`,
    sourceUrl: CONTENT_SOURCES.factbookArea, sourceEdition: FACTBOOK_EDITION,
    ambiguityNote: 'Total area includes land and inland water; all 100 launch values are distinct.',
    localeNote: 'Values use square kilometres and en-US thousands separators.',
  },
));

const MAP_FACTS = COUNTRY_RECORDS.map((country) => baseFact(
  `map-sense-v1:${country.iso3.toLowerCase()}`, 'map-sense-v1', country.difficulty,
  {
    prompt: `Which UN M49 subregion includes ${country.name}?`,
    canonicalAnswer: country.subregion,
    acceptedVariants: [],
    explanation: `${country.name} is grouped in ${country.subregion} by UN M49.`,
    statementTemplate: `{answer} is the UN M49 subregion that includes ${country.name}.`,
    sourceUrl: CONTENT_SOURCES.unM49, sourceEdition: UN_EDITION,
    ambiguityNote: 'UN statistical grouping; it does not imply a political position.',
    localeNote: 'Uses the English UN M49 subregion label.',
  },
));

/** The 600 atomic launch facts; ordering and ids are frozen for v1. */
export const CONTENT_FACTS: readonly AtomicFact[] = [
  ...COUNTRY_FACTS, ...FLAG_FACTS, ...CAPITAL_FACTS,
  ...LANDMARK_FACTS, ...NATURE_FACTS, ...MAP_FACTS,
];

function facts(packId: ContentPackId): readonly AtomicFact[] {
  return CONTENT_FACTS.filter((fact) => fact.packId === packId);
}

/** World Mix is a composition; the six underlying launch pack ids stay independent and frozen. */
export const CATEGORIES: readonly Category[] = [
  { id: 'world-mix', name: 'World Mix', icon: 'world', accent: '#c44a2d', packId: 'world-mix-v1', facts: CONTENT_FACTS, countries: COUNTRY_RECORDS },
  { id: 'countries', name: 'Countries', icon: 'world', accent: '#1f6e8c', packId: 'countries-core-v1', facts: facts('countries-core-v1'), countries: COUNTRY_RECORDS },
  { id: 'flags', name: 'Flags & Shapes', icon: 'flag', accent: '#c44a2d', packId: 'flags-shapes-v1', facts: facts('flags-shapes-v1'), countries: COUNTRY_RECORDS },
  { id: 'capitals', name: 'Capitals & Cities', icon: 'pin', accent: '#b37916', packId: 'capitals-cities-v1', facts: facts('capitals-cities-v1'), countries: COUNTRY_RECORDS },
  { id: 'landmarks', name: 'Landmarks', icon: 'spark', accent: '#815a9c', packId: 'landmarks-v1', facts: facts('landmarks-v1'), countries: COUNTRY_RECORDS },
  { id: 'nature', name: 'Nature', icon: 'route', accent: '#287a5a', packId: 'nature-v1', facts: facts('nature-v1'), countries: COUNTRY_RECORDS },
  { id: 'map-sense', name: 'Map Sense', icon: 'map', accent: '#1f6e8c', packId: 'map-sense-v1', facts: facts('map-sense-v1'), countries: COUNTRY_RECORDS },
];

/** Resolve a topic, falling back to the one-tap World Mix. */
export function getCategory(id: string): Category {
  return CATEGORIES.find((category) => category.id === id) ?? CATEGORIES[0]!;
}

/** Country lookup used by validation and accessible flag labels. */
export function getCountry(iso3: string): CountryRecord | undefined {
  return COUNTRY_RECORDS.find((country) => country.iso3 === iso3);
}
