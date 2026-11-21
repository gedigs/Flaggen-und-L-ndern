import { ContinentFilter } from '../game/rules';

export const MAP_WIDTH = 1404.7773;
export const MAP_HEIGHT = 600.81262;

export interface ViewBoxRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Exact (x, y) anchor coordinates inside Wikimedia Commons' BlankMap-World_gray.svg
 * (viewBox 0 0 1404.7773 600.81262), covering all 195 internationally recognized states.
 */
export const COUNTRY_SVG_POSITIONS: Record<string, { x: number; y: number }> = {
  // Europa (44)
  AD: { x: 639, y: 160 }, // Andorra
  AL: { x: 707, y: 167 }, // Albanien
  AT: { x: 681, y: 137 }, // Österreich
  BA: { x: 698, y: 154 }, // Bosnien und Herzegowina
  BE: { x: 650, y: 125 }, // Belgien
  BG: { x: 726, y: 159 }, // Bulgarien
  BY: { x: 732, y: 110 }, // Belarus
  CH: { x: 663, y: 141 }, // Schweiz
  CZ: { x: 689, y: 127 }, // Tschechien
  DE: { x: 671, y: 122 }, // Deutschland
  DK: { x: 668, y: 101 }, // Dänemark
  EE: { x: 721, y: 89 }, // Estland
  ES: { x: 621, y: 172 }, // Spanien
  FI: { x: 720, y: 63 }, // Finnland
  FR: { x: 640, y: 141 }, // Frankreich
  GB: { x: 628, y: 108 }, // Vereinigtes Königreich
  GR: { x: 720, y: 176 }, // Griechenland
  HR: { x: 693, y: 150 }, // Kroatien
  HU: { x: 704, y: 139 }, // Ungarn
  IE: { x: 607, y: 112 }, // Irland
  IS: { x: 581, y: 63 }, // Island
  IT: { x: 680, y: 160 }, // Italien
  LI: { x: 668, y: 139 }, // Liechtenstein
  LT: { x: 716, y: 104 }, // Litauen
  LU: { x: 656, y: 127 }, // Luxemburg
  LV: { x: 718, y: 97 }, // Lettland
  MC: { x: 660, y: 155 }, // Monaco
  MD: { x: 735, y: 140 }, // Moldau
  ME: { x: 704, y: 159 }, // Montenegro
  MK: { x: 713, y: 164 }, // Nordmazedonien
  MT: { x: 687, y: 190 }, // Malta
  NL: { x: 653, y: 117 }, // Niederlande
  NO: { x: 692, y: 65 }, // Norwegen
  PL: { x: 702, y: 118 }, // Polen
  PT: { x: 603, y: 174 }, // Portugal
  RO: { x: 724, y: 144 }, // Rumänien
  RS: { x: 710, y: 153 }, // Serbien
  RU: { x: 768, y: 105 }, // Russland (europäischer Teil / Moskau)
  SE: { x: 693, y: 74 }, // Schweden
  SI: { x: 688, y: 144 }, // Slowenien
  SK: { x: 704, y: 132 }, // Slowakei
  SM: { x: 678, y: 155 }, // San Marino
  UA: { x: 747, y: 133 }, // Ukraine
  VA: { x: 679, y: 164 }, // Vatikanstadt

  // Asien (48)
  AE: { x: 848, y: 242 }, // Vereinigte Arabische Emirate
  AF: { x: 894, y: 199 }, // Afghanistan
  AM: { x: 803, y: 171 }, // Armenien
  AZ: { x: 814, y: 171 }, // Aserbaidschan
  BD: { x: 998, y: 245 }, // Bangladesch
  BH: { x: 834, y: 236 }, // Bahrain
  BN: { x: 1106, y: 332 }, // Brunei
  BT: { x: 994, y: 229 }, // Bhutan
  CN: { x: 1024, y: 186 }, // China
  CY: { x: 759, y: 194 }, // Zypern
  GE: { x: 795, y: 160 }, // Georgien
  ID: { x: 1047, y: 354 }, // Indonesien
  IL: { x: 768, y: 211 }, // Israel
  IN: { x: 964, y: 254 }, // Indien
  IQ: { x: 804, y: 202 }, // Irak
  IR: { x: 841, y: 207 }, // Iran
  JO: { x: 778, y: 211 }, // Jordanien
  JP: { x: 1163, y: 184 }, // Japan
  KG: { x: 916, y: 167 }, // Kirgisistan
  KH: { x: 1063, y: 296 }, // Kambodscha
  KP: { x: 1119, y: 170 }, // Nordkorea
  KR: { x: 1129, y: 188 }, // Südkorea
  KW: { x: 819, y: 219 }, // Kuwait
  KZ: { x: 876, y: 136 }, // Kasachstan
  LA: { x: 1055, y: 270 }, // Laos
  LB: { x: 772, y: 199 }, // Libanon
  LK: { x: 964, y: 318 }, // Sri Lanka
  MM: { x: 1023, y: 266 }, // Myanmar
  MN: { x: 1014, y: 142 }, // Mongolei
  MV: { x: 936, y: 336 }, // Malediven
  MY: { x: 1054, y: 334 }, // Malaysia
  NP: { x: 968, y: 224 }, // Nepal
  OM: { x: 858, y: 259 }, // Oman
  PH: { x: 1132, y: 281 }, // Philippinen
  PK: { x: 905, y: 215 }, // Pakistan
  PS: { x: 772, y: 210 }, // Palästina
  QA: { x: 837, y: 239 }, // Katar
  SA: { x: 815, y: 241 }, // Saudi-Arabien
  SG: { x: 1061, y: 347 }, // Singapur
  SY: { x: 782, y: 195 }, // Syrien
  TH: { x: 1046, y: 293 }, // Thailand
  TJ: { x: 906, y: 177 }, // Tadschikistan
  TL: { x: 1151, y: 393 }, // Osttimor
  TM: { x: 860, y: 176 }, // Turkmenistan
  TR: { x: 767, y: 176 }, // Türkei
  UZ: { x: 875, y: 166 }, // Usbekistan
  VN: { x: 1064, y: 281 }, // Vietnam
  YE: { x: 826, y: 281 }, // Jemen

  // Afrika (54)
  AO: { x: 702, y: 407 }, // Angola
  BF: { x: 621, y: 296 }, // Burkina Faso
  BI: { x: 752, y: 368 }, // Burundi
  BJ: { x: 637, y: 311 }, // Benin
  BW: { x: 728, y: 454 }, // Botswana
  CD: { x: 718, y: 371 }, // Demokratische Republik Kongo
  CF: { x: 714, y: 322 }, // Zentralafrikanische Republik
  CG: { x: 691, y: 356 }, // Republik Kongo
  CI: { x: 605, y: 319 }, // Côte d’Ivoire
  CM: { x: 680, y: 320 }, // Kamerun
  CV: { x: 527, y: 275 }, // Cabo Verde
  DJ: { x: 804, y: 300 }, // Dschibuti
  DZ: { x: 636, y: 226 }, // Algerien
  EG: { x: 752, y: 231 }, // Ägypten
  ER: { x: 793, y: 284 }, // Eritrea
  ET: { x: 795, y: 312 }, // Äthiopien
  GA: { x: 677, y: 356 }, // Gabun
  GH: { x: 624, y: 317 }, // Ghana
  GM: { x: 565, y: 291 }, // Gambia
  GN: { x: 581, y: 308 }, // Guinea
  GQ: { x: 672, y: 345 }, // Äquatorialguinea
  GW: { x: 566, y: 298 }, // Guinea-Bissau
  KE: { x: 785, y: 352 }, // Kenia
  KM: { x: 811, y: 411 }, // Komoren
  LR: { x: 588, y: 323 }, // Liberia
  LS: { x: 743, y: 486 }, // Lesotho
  LY: { x: 698, y: 233 }, // Libyen
  MA: { x: 600, y: 209 }, // Marokko
  MG: { x: 820, y: 439 }, // Madagaskar
  ML: { x: 612, y: 272 }, // Mali
  MR: { x: 583, y: 258 }, // Mauretanien
  MU: { x: 863, y: 444 }, // Mauritius
  MW: { x: 771, y: 411 }, // Malawi
  MZ: { x: 773, y: 437 }, // Mosambik
  NA: { x: 705, y: 457 }, // Namibia
  NE: { x: 661, y: 272 }, // Niger
  NG: { x: 664, y: 310 }, // Nigeria
  RW: { x: 753, y: 361 }, // Ruanda
  SC: { x: 866, y: 369 }, // Seychellen
  SD: { x: 753, y: 281 }, // Sudan
  SL: { x: 579, y: 314 }, // Sierra Leone
  SN: { x: 570, y: 285 }, // Senegal
  SO: { x: 819, y: 329 }, // Somalia
  SS: { x: 753, y: 319 }, // Südsudan
  ST: { x: 658, y: 349 }, // São Tomé und Príncipe
  SZ: { x: 756, y: 473 }, // Eswatini
  TD: { x: 705, y: 282 }, // Tschad
  TG: { x: 632, y: 313 }, // Togo
  TN: { x: 668, y: 199 }, // Tunesien
  TZ: { x: 772, y: 381 }, // Tansania
  UG: { x: 762, y: 347 }, // Uganda
  ZA: { x: 728, y: 481 }, // Südafrika
  ZM: { x: 742, y: 411 }, // Sambia
  ZW: { x: 749, y: 438 }, // Simbabwe

  // Nordamerika (23)
  AG: { x: 373, y: 275 }, // Antigua und Barbuda
  BB: { x: 381, y: 293 }, // Barbados
  BS: { x: 311, y: 239 }, // Bahamas
  BZ: { x: 264, y: 274 }, // Belize
  CA: { x: 315, y: 96 }, // Kanada
  CR: { x: 278, y: 308 }, // Costa Rica
  CU: { x: 304, y: 255 }, // Kuba
  DM: { x: 374, y: 283 }, // Dominica
  DO: { x: 340, y: 267 }, // Dominikanische Republik
  GD: { x: 371, y: 298 }, // Grenada
  GT: { x: 256, y: 280 }, // Guatemala
  HN: { x: 272, y: 287 }, // Honduras
  HT: { x: 329, y: 267 }, // Haiti
  JM: { x: 312, y: 270 }, // Jamaika
  KN: { x: 369, y: 274 }, // St. Kitts und Nevis
  LC: { x: 375, y: 290 }, // St. Lucia
  MX: { x: 219, y: 245 }, // Mexiko
  NI: { x: 275, y: 294 }, // Nicaragua
  PA: { x: 296, y: 314 }, // Panama
  SV: { x: 262, y: 289 }, // El Salvador
  TT: { x: 372, y: 306 }, // Trinidad und Tobago
  US: { x: 245, y: 192 }, // USA
  VC: { x: 374, y: 293 }, // St. Vincent und die Grenadinen

  // Südamerika (12)
  AR: { x: 380, y: 519 }, // Argentinien
  BO: { x: 368, y: 426 }, // Bolivien
  BR: { x: 403, y: 416 }, // Brasilien
  CL: { x: 352, y: 505 }, // Chile
  CO: { x: 324, y: 335 }, // Kolumbien
  EC: { x: 302, y: 360 }, // Ecuador
  GY: { x: 382, y: 330 }, // Guyana
  PE: { x: 317, y: 394 }, // Peru
  PY: { x: 391, y: 457 }, // Paraguay
  SR: { x: 395, y: 335 }, // Suriname
  UY: { x: 409, y: 499 }, // Uruguay
  VE: { x: 353, y: 324 }, // Venezuela

  // Ozeanien (14)
  AU: { x: 1166, y: 467 }, // Australien
  FJ: { x: 1359, y: 434 }, // Fidschi
  FM: { x: 1272, y: 318 }, // Mikronesien
  KI: { x: 1351, y: 347 }, // Kiribati
  MH: { x: 1343, y: 319 }, // Marshallinseln
  NR: { x: 1323, y: 355 }, // Nauru
  NZ: { x: 1272, y: 551 }, // Neuseeland
  PW: { x: 1186, y: 319 }, // Palau
  PG: { x: 1236, y: 385 }, // Papua-Neuguinea
  SB: { x: 1285, y: 390 }, // Salomonen
  TO: { x: 1392, y: 434 }, // Tonga
  TV: { x: 1370, y: 397 }, // Tuvalu
  VU: { x: 1317, y: 425 }, // Vanuatu
  WS: { x: 1392, y: 415 }, // Samoa
};

export function getCountryMapPosition(countryId: string): { x: number; y: number } {
  return COUNTRY_SVG_POSITIONS[countryId] ?? { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };
}

export const CONTINENT_VIEWBOXES: Record<ContinentFilter, ViewBoxRect> = {
  Alle: { x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT },
  Europa: { x: 470, y: 28, w: 400, h: 172 },
  Asien: { x: 630, y: 105, w: 725, h: 310 },
  Afrika: { x: 340, y: 165, w: 790, h: 338 },
  Nordamerika: { x: 25, y: 40, w: 700, h: 300 },
  Südamerika: { x: 50, y: 285, w: 710, h: 304 },
  Ozeanien: { x: 650, y: 260, w: 754, h: 323 },
};
