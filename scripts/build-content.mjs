import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const factbookRepo = process.argv[2];
if (!factbookRepo) throw new Error('Usage: node scripts/build-content.mjs /path/to/factbook-repo');

const root = resolve(import.meta.dirname, '..');
const countries = JSON.parse(readFileSync(resolve(root, 'node_modules/world-countries/countries.json'), 'utf8'));

// Exactly 100 unambiguous UN members: 50 Foundation, 35 Explorer, 15 Expert.
const tiers = {
  foundation: [
    'CAN','USA','MEX','BRA','ARG','CHL','PER','COL','ECU','URY',
    'GBR','FRA','DEU','ESP','ITA','PRT','NLD','BEL','CHE','AUT','POL','GRC','IRL','NOR','SWE','FIN','DNK','ISL','CZE','HUN',
    'RUS','UKR','TUR','EGY','NGA','KEN','ETH','MAR','GHA','DZA',
    'CHN','JPN','IND','IDN','KOR','THA','VNM','PHL','AUS','NZL',
  ],
  explorer: [
    'PRY','CRI','CUB','DOM','GTM','PAN','JAM','GUY',
    'ROU','BGR','HRV','SRB','SVK','SVN','EST','LVA','LTU','BLR',
    'KAZ','MNG','UZB','SAU','ARE','JOR','IRN','IRQ','PAK','BGD','NPL','MYS','SGP','KHM','LAO',
    'TUN','SEN',
  ],
  expert: ['BHR','OMN','QAT','KWT','KGZ','TJK','TKM','BRN','BTN','MDV','BWA','NAM','MOZ','MDG','MUS'],
};

const factbookNames = {
  ARE: 'United Arab Emirates', BLR: 'Belarus', BRN: 'Brunei', CZE: 'Czechia', DOM: 'Dominican Republic',
  GBR: 'United Kingdom', KOR: 'Korea, South', LAO: 'Laos', MDV: 'Maldives', MYS: 'Malaysia',
  RUS: 'Russia', TUR: 'Turkey (Turkiye)', USA: 'United States', VNM: 'Vietnam',
};
const displayNames = {
  CZE: 'Czechia', DOM: 'Dominican Republic', GBR: 'United Kingdom', KOR: 'South Korea',
  RUS: 'Russia', TUR: 'Türkiye', USA: 'United States', ARE: 'United Arab Emirates',
};
const capitalAliases = {
  CHL: ['Santiago de Chile'], MEX: ['Ciudad de Mexico'],
  MNG: ['Ulan Bator'], POL: ['Warszawa'], USA: ['Washington'],
};
const capitalOverrides = { MNG: 'Ulaanbaatar' };
const subregionOverrides = {
  AUT: 'Western Europe', CZE: 'Eastern Europe', HUN: 'Eastern Europe', POL: 'Eastern Europe',
  SVK: 'Eastern Europe', SVN: 'Southern Europe', BGR: 'Eastern Europe', ROU: 'Eastern Europe',
  HRV: 'Southern Europe', SRB: 'Southern Europe', CAN: 'Northern America', USA: 'Northern America',
  MEX: 'Central America',
};

function plain(html) {
  return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')
    .replace(/&([aeiouy])(acute|grave|circ|uml|tilde);/gi, '$1')
    .replace(/&ccedil;/gi, 'c').replace(/&ntilde;/gi, 'n').replace(/&oslash;/gi, 'o')
    .replace(/&nbsp;/g, ' ').replace(/&rsquo;/g, '’').replace(/&amp;/g, '&');
}

function normalized(value) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function fieldValue(doc, name) {
  const field = doc.result.data.fields.nodes.find((node) => node.name === name);
  if (!field) throw new Error(`${doc.result.data.country.name}: missing ${name}`);
  return plain(field.data);
}

function factbookRecord(fileName) {
  const raw = execFileSync('git', ['show', `HEAD:country-jsons/${fileName}.json`], {
    cwd: factbookRepo, encoding: 'utf8', maxBuffer: 12 * 1024 * 1024,
  });
  return JSON.parse(raw);
}

const records = [];
for (const [difficulty, codes] of Object.entries(tiers)) {
  for (const cca3 of codes) {
    const index = countries.find((country) => country.cca3 === cca3);
    if (!index?.unMember || index.capital.length !== 1) throw new Error(`${cca3}: not an unambiguous UN member`);
    const doc = factbookRecord(factbookNames[cca3] ?? index.name.common);
    const capital = capitalOverrides[cca3] ?? index.capital[0];
    const capitalField = fieldValue(doc, 'Capital');
    if (!normalized(capitalField).includes(normalized(capital))) {
      throw new Error(`${cca3}: '${capital}' not found in Factbook capital field '${capitalField.slice(0, 100)}'`);
    }
    const areaMatch = fieldValue(doc, 'Area').match(/total\s*:\s*([0-9,]+)\s*sq km/i);
    if (!areaMatch) throw new Error(`${cca3}: total area missing`);
    records.push({
      id: `country-${cca3.toLowerCase()}`,
      name: displayNames[cca3] ?? index.name.common,
      iso2: index.cca2.toLowerCase(), iso3: cca3, capital,
      accepted: capitalAliases[cca3] ?? [], area: Number(areaMatch[1].replaceAll(',', '')),
      region: index.region, subregion: subregionOverrides[cca3] ?? index.subregion, difficulty,
    });
    process.stdout.write('.');
  }
}
process.stdout.write('\n');

const areas = new Map();
for (const record of records) {
  const tied = areas.get(record.area);
  if (tied) throw new Error(`Area tie: ${tied} and ${record.name} (${record.area})`);
  areas.set(record.area, record.name);
}

const landmarks = [
  ['Memphis and its Necropolis – the Pyramid Fields from Giza to Dahshur','Egypt'],
  ['Ancient Thebes with its Necropolis','Egypt'], ['Petra','Jordan'], ['Angkor','Cambodia'],
  ['The Great Wall','China'], ['Taj Mahal','India'], ['Historic Sanctuary of Machu Picchu','Peru'],
  ['Acropolis, Athens','Greece'], ['Archaeological Areas of Pompei, Herculaneum and Torre Annunziata','Italy'],
  ['Historic Centre of Rome','Italy'], ['Mont-Saint-Michel and its Bay','France'],
  ['Palace and Park of Versailles','France'], ['Stonehenge, Avebury and Associated Sites','United Kingdom'],
  ['Tower of London','United Kingdom'], ['Cologne Cathedral','Germany'],
  ['Museumsinsel (Museum Island), Berlin','Germany'], ['Alhambra, Generalife and Albayzín, Granada','Spain'],
  ['Works of Antoni Gaudí','Spain'], ['Monastery of the Hieronymites and Tower of Belém','Portugal'],
  ['Historic Centre of Prague','Czechia'], ['Budapest, including the Banks of the Danube','Hungary'],
  ['Historic Centre of Vienna','Austria'], ['Old City of Dubrovnik','Croatia'],
  ['Historic Centre of Kraków','Poland'], ['Auschwitz Birkenau','Poland'], ['Rila Monastery','Bulgaria'],
  ['Bryggen','Norway'], ['Historic Centre (Old Town) of Tallinn','Estonia'], ['Historic Centre of Riga','Latvia'],
  ['Vilnius Historic Centre','Lithuania'], ['Fortress of Suomenlinna','Finland'],
  ['Royal Domain of Drottningholm','Sweden'], ['Þingvellir National Park','Iceland'],
  ['La Grand-Place, Brussels','Belgium'], ['Mill Network at Kinderdijk-Elshout','Netherlands'],
  ['City of Luxembourg: its Old Quarters and Fortifications','Luxembourg'],
  ['Swiss Alps Jungfrau-Aletsch','Switzerland'], ['Vatican City','Vatican City'],
  ['Monasteries of Meteora','Greece'], ['Monastery of Geghard and the Upper Azat Valley','Armenia'],
  ['Historic Areas of Istanbul','Türkiye'], ['Göreme National Park and the Rock Sites of Cappadocia','Türkiye'],
  ['Persepolis','Iran'], ['Babylon','Iraq'], ['Baalbek','Lebanon'], ['Masada','Israel'],
  ['Hegra Archaeological Site','Saudi Arabia'], ['Al Zubarah Archaeological Site','Qatar'],
  ['Cultural Sites of Al Ain','United Arab Emirates'], ['Land of Frankincense','Oman'],
  ['Samarkand – Crossroad of Cultures','Uzbekistan'], ['Mausoleum of Khoja Ahmed Yasawi','Kazakhstan'],
  ['Kathmandu Valley','Nepal'], ['Ruins of the Buddhist Vihara at Paharpur','Bangladesh'],
  ['Ancient City of Sigiriya','Sri Lanka'], ['Bagan','Myanmar'], ['Town of Luang Prabang','Laos'],
  ['Historic City of Ayutthaya','Thailand'], ['Ha Long Bay - Cat Ba Archipelago','Vietnam'],
  ['Hoi An Ancient Town','Vietnam'], ['Melaka and George Town, Historic Cities of the Straits of Malacca','Malaysia'],
  ['Singapore Botanic Gardens','Singapore'], ['Borobudur Temple Compounds','Indonesia'],
  ['Rice Terraces of the Philippine Cordilleras','Philippines'], ['Historic Monuments of Ancient Kyoto','Japan'],
  ['Itsukushima Shinto Shrine','Japan'], ['Changdeokgung Palace Complex','South Korea'],
  ['Orkhon Valley Cultural Landscape','Mongolia'], ['Sydney Opera House','Australia'],
  ['Te Wāhipounamu – South West New Zealand','New Zealand'], ["Chief Roi Mata's Domain",'Vanuatu'],
  ['Kuk Early Agricultural Site','Papua New Guinea'], ['Rapa Nui National Park','Chile'],
  ['City of Quito','Ecuador'], ['Port, Fortresses and Group of Monuments, Cartagena','Colombia'],
  ['Historic Centre of Salvador de Bahia','Brazil'], ['Brasilia','Brazil'], ['Los Glaciares National Park','Argentina'],
  ['Tiwanaku: Spiritual and Political Centre of the Tiwanaku Culture','Bolivia'],
  ['Pre-Hispanic City of Chichen-Itza','Mexico'], ['Pre-Hispanic City of Teotihuacan','Mexico'],
  ['Tikal National Park','Guatemala'], ['Maya Site of Copan','Honduras'], ['Joya de Cerén Archaeological Site','El Salvador'],
  ['Old Havana and its Fortification System','Cuba'], ['Colonial City of Santo Domingo','Dominican Republic'],
  ['Canadian Rocky Mountain Parks','Canada'], ['Statue of Liberty','United States'], ['Yellowstone National Park','United States'],
  ['Rock-Hewn Churches, Lalibela','Ethiopia'], ['Serengeti National Park','Tanzania'],
  ['Great Zimbabwe National Monument','Zimbabwe'], ['Robben Island','South Africa'], ['Island of Mozambique','Mozambique'],
  ['Stone Town of Zanzibar','Tanzania'], ['Bwindi Impenetrable National Park','Uganda'],
  ['Forts and Castles, Volta, Greater Accra, Central and Western Regions','Ghana'], ['Island of Gorée','Senegal'],
  ['Timbuktu','Mali'], ['Lamu Old Town','Kenya'],
];
if (landmarks.length !== 100) throw new Error(`Expected 100 landmarks, found ${landmarks.length}`);

const countrySource = records.map((record) => `  ${JSON.stringify(record)},`).join('\n');
const landmarkSource = landmarks.map(([name, country], index) => `  ${JSON.stringify({
  id: `landmark-${String(index + 1).padStart(3, '0')}`,
  name, country, difficulty: index < 50 ? 'foundation' : index < 85 ? 'explorer' : 'expert',
})},`).join('\n');

writeFileSync(resolve(root, 'src/product/contentData.ts'), `/* Generated and editorially frozen by scripts/build-content.mjs. */\nimport type { CountryRecord, LandmarkRecord } from './types.js';\n\nexport const COUNTRY_RECORDS = [\n${countrySource}\n] as const satisfies readonly CountryRecord[];\n\nexport const LANDMARK_RECORDS = [\n${landmarkSource}\n] as const satisfies readonly LandmarkRecord[];\n`);

const flags = records.map((record) => `.fi-${record.iso2} { background-image: url('../../node_modules/flag-icons/flags/4x3/${record.iso2}.svg'); }`).join('\n');
writeFileSync(resolve(root, 'src/styles/flags.css'), `/* Owned offline SVG flag atlas: only the 100 frozen launch flags are bundled. */\n.fi { display:inline-block; width:1.333333em; line-height:1em; background-size:contain; background-position:50%; background-repeat:no-repeat; }\n.fi::before { content:'\\00a0'; }\n${flags}\n`);

console.log(`Generated ${records.length} country records, ${landmarks.length} landmarks, and ${records.length} local flags.`);
