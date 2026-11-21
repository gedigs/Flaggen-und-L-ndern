import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES } from '../data/countries';
import {
  CONTINENT_VIEWBOXES,
  COUNTRY_SVG_POSITIONS,
  MAP_HEIGHT,
  MAP_WIDTH,
  getCountryMapPosition,
} from '../data/worldMapGeometry';
import {
  advanceSessionStep,
  applyHintToSession,
  buildQuizDeck,
  calculatePoints,
  createInitialSession,
  createRoundSnapshot,
  filterCountriesByContinent,
  formatReadout,
  getHintEliminatedIds,
  mergeDiscoveredStamps,
  submitAnswerToSession,
} from './rules';

function createDeterministicRng(seed = 42): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

test('dataset includes all 195 recognized sovereign states with unique IDs, flags, and SVG groups', () => {
  assert.equal(COUNTRIES.length, 195);
  const ids = new Set(COUNTRIES.map((c) => c.id));
  const names = new Set(COUNTRIES.map((c) => c.name));
  assert.equal(ids.size, 195, 'Country IDs must be unique');
  assert.equal(names.size, 195, 'Country names must be unique');

  const svgContent = fs.readFileSync(
    path.resolve(process.cwd(), 'src/assets/BlankMap-World_gray.svg'),
    'utf8'
  );

  for (const c of COUNTRIES) {
    assert.ok(c.capital.trim().length > 0, `Missing capital for ${c.id}`);
    assert.ok(c.clue.trim().length > 0, `Missing clue for ${c.id}`);
    assert.ok(c.fact.trim().length > 0, `Missing fact for ${c.id}`);

    const flagPath = path.resolve(process.cwd(), `public/flags/${c.id.toLowerCase()}.svg`);
    assert.ok(fs.existsSync(flagPath), `Missing SVG flag asset for ${c.id}: ${flagPath}`);

    const groupToken = `id="${c.id.toLowerCase()}"`;
    assert.ok(svgContent.includes(groupToken), `Missing SVG group ${groupToken} in BlankMap`);
  }
});

test('filterCountriesByContinent filters accurately and preserves all 195 on Alle', () => {
  assert.equal(filterCountriesByContinent(COUNTRIES, 'Alle').length, 195);
  const europe = filterCountriesByContinent(COUNTRIES, 'Europa');
  assert.equal(europe.length, 44);
  assert.ok(europe.every((c) => c.continent === 'Europa'));
  assert.equal(filterCountriesByContinent(COUNTRIES, 'Asien').length, 48);
  assert.equal(filterCountriesByContinent(COUNTRIES, 'Afrika').length, 54);
  assert.equal(filterCountriesByContinent(COUNTRIES, 'Nordamerika').length, 23);
  assert.equal(filterCountriesByContinent(COUNTRIES, 'Südamerika').length, 12);
  assert.equal(filterCountriesByContinent(COUNTRIES, 'Ozeanien').length, 14);
});

test('buildQuizDeck builds 4 unique options including target for Oceania and all continents', () => {
  const rng = createDeterministicRng(7);
  const deck = buildQuizDeck(COUNTRIES, 'Ozeanien', 'mixed', 10, rng);
  assert.equal(deck.length, 10);
  for (const q of deck) {
    assert.equal(q.options.length, 4);
    const ids = new Set(q.options.map((o) => o.id));
    assert.equal(ids.size, 4);
    assert.ok(ids.has(q.target.id));
  }
});

test('buildQuizDeck assigns exact question types per mode including map mode', () => {
  const rng = createDeterministicRng(11);
  const flagDeck = buildQuizDeck(COUNTRIES, 'Alle', 'flags', 6, rng);
  assert.ok(flagDeck.every((q) => q.type === 'flag-to-country'));

  const capDeck = buildQuizDeck(COUNTRIES, 'Alle', 'capitals', 6, rng);
  assert.ok(capDeck.every((q) => q.type === 'country-to-capital'));

  const matchDeck = buildQuizDeck(COUNTRIES, 'Alle', 'matchFlag', 6, rng);
  assert.ok(matchDeck.every((q) => q.type === 'country-to-flag'));

  const mapDeck = buildQuizDeck(COUNTRIES, 'Alle', 'map', 6, rng);
  assert.ok(mapDeck.every((q) => q.type === 'map-locate'));

  const mixedDeck = buildQuizDeck(COUNTRIES, 'Alle', 'mixed', 6, rng);
  assert.equal(mixedDeck[0].type, 'flag-to-country');
  assert.equal(mixedDeck[1].type, 'country-to-capital');
  assert.equal(mixedDeck[2].type, 'country-to-flag');
  assert.equal(mixedDeck[3].type, 'map-locate');
});

test('all 195 countries have explicit positions inside BlankMap-World_gray.svg and continent viewboxes', () => {
  for (const country of COUNTRIES) {
    assert.ok(
      COUNTRY_SVG_POSITIONS[country.id],
      `Missing explicit map coordinates for ${country.id} (${country.name})`
    );
    const pt = getCountryMapPosition(country.id);
    assert.ok(pt.x >= 0 && pt.x <= MAP_WIDTH, `${country.name} x out of bounds: ${pt.x}`);
    assert.ok(pt.y >= 0 && pt.y <= MAP_HEIGHT, `${country.name} y out of bounds: ${pt.y}`);

    const vb = CONTINENT_VIEWBOXES[country.continent];
    assert.ok(
      pt.x >= vb.x && pt.x <= vb.x + vb.w && pt.y >= vb.y && pt.y <= vb.y + vb.h,
      `${country.name} (${country.id}) at (${pt.x}, ${pt.y}) lies outside ${country.continent} viewBox`
    );
  }
  const samoaPt = getCountryMapPosition('WS');
  assert.ok(samoaPt.x > 1300, `Samoa should be on Oceania right side, got x=${samoaPt.x}`);

  for (const [key, vb] of Object.entries(CONTINENT_VIEWBOXES)) {
    assert.ok(vb.w > 0 && vb.h > 0, `ViewBox ${key} must have positive dimensions`);
    assert.ok(vb.x >= 0 && vb.y >= 0, `ViewBox ${key} origin out of bounds`);
  }
});

test('calculatePoints scales with streak and applies hint penalties with minimum floor', () => {
  assert.equal(calculatePoints({ isCorrect: false, nextStreak: 0, hintLevel: 0 }), 0);
  assert.equal(calculatePoints({ isCorrect: true, nextStreak: 1, hintLevel: 0 }), 100);
  assert.equal(calculatePoints({ isCorrect: true, nextStreak: 3, hintLevel: 0 }), 140);
  assert.equal(calculatePoints({ isCorrect: true, nextStreak: 1, hintLevel: 1 }), 75);
  assert.equal(calculatePoints({ isCorrect: true, nextStreak: 1, hintLevel: 2 }), 50);
});

test('getHintEliminatedIds eliminates exactly 2 wrong options and never the target', () => {
  const rng = createDeterministicRng(19);
  const deck = buildQuizDeck(COUNTRIES, 'Alle', 'mixed', 5, rng);
  for (const q of deck) {
    const eliminated = getHintEliminatedIds(q, rng);
    assert.equal(eliminated.length, 2);
    assert.ok(!eliminated.includes(q.target.id));
  }
});

test('session reaches victory after answering all questions correctly', () => {
  const rng = createDeterministicRng(3);
  let session = createInitialSession(COUNTRIES, 'Alle', 'mixed', 3, rng);
  assert.equal(session.questions.length, 3);

  for (let i = 0; i < 3; i++) {
    const targetId = session.questions[session.currentIndex].target.id;
    session = submitAnswerToSession(session, targetId);
    assert.equal(session.lastAnswerCorrect, true);
    const step = advanceSessionStep(session);
    session = step.nextSession;
    if (i < 2) {
      assert.equal(step.finished, false);
    } else {
      assert.equal(step.finished, true);
      assert.equal(step.isVictory, true);
    }
  }

  const snapshot = createRoundSnapshot(session, true, 150);
  assert.equal(snapshot.isVictory, true);
  assert.equal(snapshot.correctCount, 3);
  assert.equal(snapshot.bestStreak, 3);
  assert.ok(snapshot.score > 300);
  assert.equal(snapshot.bestScore, snapshot.score);
});

test('session reaches defeat (Game Over) after 3 wrong answers', () => {
  const rng = createDeterministicRng(9);
  let session = createInitialSession(COUNTRIES, 'Alle', 'mixed', 5, rng);

  for (let i = 0; i < 3; i++) {
    const q = session.questions[session.currentIndex];
    const wrong = q.options.find((o) => o.id !== q.target.id)!;
    session = submitAnswerToSession(session, wrong.id);
    assert.equal(session.lastAnswerCorrect, false);
    assert.equal(session.hearts, 2 - i);
    const step = advanceSessionStep(session);
    session = step.nextSession;
    if (i < 2) {
      assert.equal(step.finished, false);
    } else {
      assert.equal(step.finished, true);
      assert.equal(step.isVictory, false);
    }
  }
});

test('applyHintToSession progresses 0 -> 1 -> 2 and blocks eliminated clicks', () => {
  const rng = createDeterministicRng(15);
  let session = createInitialSession(COUNTRIES, 'Alle', 'mixed', 5, rng);
  session = applyHintToSession(session, rng);
  assert.equal(session.hintLevel, 1);
  assert.equal(session.eliminatedIds.length, 0);

  session = applyHintToSession(session, rng);
  assert.equal(session.hintLevel, 2);
  assert.equal(session.eliminatedIds.length, 2);

  // Clicking an eliminated option is ignored
  const afterElimClick = submitAnswerToSession(session, session.eliminatedIds[0]);
  assert.equal(afterElimClick.answeredId, null);
});

test('mergeDiscoveredStamps deduplicates and formatReadout rounds integers', () => {
  assert.deepEqual(mergeDiscoveredStamps(['DE', 'FR'], ['FR', 'JP']), ['DE', 'FR', 'JP']);
  assert.equal(formatReadout(124.7), '125');
});
