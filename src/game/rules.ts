import { Continent, Country } from '../data/countries';

export type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'atlas';

export type QuizMode = 'mixed' | 'flags' | 'capitals' | 'matchFlag' | 'map';

export type ContinentFilter = 'Alle' | Continent;

export type QuestionType =
  | 'flag-to-country'
  | 'country-to-capital'
  | 'country-to-flag'
  | 'map-locate';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  target: Country;
  options: Country[];
}

export interface RoundRecord {
  question: QuizQuestion;
  chosenId: string | null;
  isCorrect: boolean;
  usedHintLevel: number;
  pointsEarned: number;
}

export interface ActiveSession {
  mode: QuizMode;
  continent: ContinentFilter;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  streak: number;
  bestStreak: number;
  hearts: number;
  maxHearts: number;
  hintLevel: 0 | 1 | 2;
  eliminatedIds: string[];
  answeredId: string | null;
  lastAnswerCorrect: boolean | null;
  lastPointsEarned: number;
  records: RoundRecord[];
  newlyDiscoveredIds: string[];
}

export interface RoundSummarySnapshot {
  isVictory: boolean;
  score: number;
  bestScore: number;
  correctCount: number;
  totalQuestions: number;
  bestStreak: number;
  heartsRemaining: number;
  records: RoundRecord[];
  newlyDiscoveredIds: string[];
}

export const QUESTIONS_PER_ROUND = 10;
export const MAX_HEARTS = 3;

export function shuffleArray<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function filterCountriesByContinent(
  countries: readonly Country[],
  continent: ContinentFilter
): Country[] {
  if (continent === 'Alle') {
    return [...countries];
  }
  return countries.filter((country) => country.continent === continent);
}

export function pickQuestionType(mode: QuizMode, index: number): QuestionType {
  if (mode === 'flags') return 'flag-to-country';
  if (mode === 'capitals') return 'country-to-capital';
  if (mode === 'matchFlag') return 'country-to-flag';
  if (mode === 'map') return 'map-locate';
  const cycle: QuestionType[] = [
    'flag-to-country',
    'country-to-capital',
    'country-to-flag',
    'map-locate',
  ];
  return cycle[index % cycle.length];
}

export function buildQuizDeck(
  allCountries: readonly Country[],
  continent: ContinentFilter,
  mode: QuizMode,
  desiredCount: number = QUESTIONS_PER_ROUND,
  rng: () => number = Math.random
): QuizQuestion[] {
  const filteredPool = filterCountriesByContinent(allCountries, continent);
  const sourcePool = filteredPool.length > 0 ? filteredPool : [...allCountries];

  const shuffledTargets = shuffleArray(sourcePool, rng);
  const questionCount = Math.min(desiredCount, shuffledTargets.length);

  return shuffledTargets.slice(0, questionCount).map((target, index) => {
    const samePoolDistractors = shuffleArray(
      sourcePool.filter((c) => c.id !== target.id),
      rng
    );

    const distractors: Country[] = samePoolDistractors.slice(0, 3);

    // Fallback to other continents if the chosen continent has fewer than 4 countries
    if (distractors.length < 3) {
      const usedIds = new Set([target.id, ...distractors.map((d) => d.id)]);
      const extraCandidates = shuffleArray(
        allCountries.filter((c) => !usedIds.has(c.id)),
        rng
      );
      for (const candidate of extraCandidates) {
        if (distractors.length >= 3) break;
        distractors.push(candidate);
      }
    }

    const options = shuffleArray([target, ...distractors], rng);
    return {
      id: `q-${index + 1}-${target.id}`,
      type: pickQuestionType(mode, index),
      target,
      options,
    };
  });
}

export function createInitialSession(
  allCountries: readonly Country[],
  continent: ContinentFilter,
  mode: QuizMode,
  desiredCount: number = QUESTIONS_PER_ROUND,
  rng: () => number = Math.random
): ActiveSession {
  const questions = buildQuizDeck(allCountries, continent, mode, desiredCount, rng);
  return {
    mode,
    continent,
    questions,
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    hearts: MAX_HEARTS,
    maxHearts: MAX_HEARTS,
    hintLevel: 0,
    eliminatedIds: [],
    answeredId: null,
    lastAnswerCorrect: null,
    lastPointsEarned: 0,
    records: [],
    newlyDiscoveredIds: [],
  };
}

export function calculatePoints(params: {
  isCorrect: boolean;
  nextStreak: number;
  hintLevel: 0 | 1 | 2;
}): number {
  if (!params.isCorrect) return 0;
  const base = 100;
  const streakBonus = Math.min(Math.max(params.nextStreak - 1, 0), 5) * 20;
  const hintPenalty = params.hintLevel === 2 ? 50 : params.hintLevel === 1 ? 25 : 0;
  return Math.max(25, base + streakBonus - hintPenalty);
}

export function getHintEliminatedIds(
  question: QuizQuestion,
  rng: () => number = Math.random
): string[] {
  const wrongOptions = question.options.filter((opt) => opt.id !== question.target.id);
  const shuffledWrong = shuffleArray(wrongOptions, rng);
  return shuffledWrong.slice(0, 2).map((opt) => opt.id);
}

export function applyHintToSession(
  session: ActiveSession,
  rng: () => number = Math.random
): ActiveSession {
  if (session.answeredId !== null) return session;
  const currentQuestion = session.questions[session.currentIndex];
  if (!currentQuestion) return session;

  if (session.hintLevel === 0) {
    return {
      ...session,
      hintLevel: 1,
    };
  }
  if (session.hintLevel === 1) {
    return {
      ...session,
      hintLevel: 2,
      eliminatedIds: getHintEliminatedIds(currentQuestion, rng),
    };
  }
  return session;
}

export function submitAnswerToSession(
  session: ActiveSession,
  chosenCountryId: string
): ActiveSession {
  if (session.answeredId !== null) return session;
  const currentQuestion = session.questions[session.currentIndex];
  if (!currentQuestion) return session;
  if (session.eliminatedIds.includes(chosenCountryId)) return session;

  const isCorrect = chosenCountryId === currentQuestion.target.id;
  const nextStreak = isCorrect ? session.streak + 1 : 0;
  const bestStreak = Math.max(session.bestStreak, nextStreak);
  const nextHearts = isCorrect ? session.hearts : Math.max(0, session.hearts - 1);
  const pointsEarned = calculatePoints({
    isCorrect,
    nextStreak,
    hintLevel: session.hintLevel,
  });

  const record: RoundRecord = {
    question: currentQuestion,
    chosenId: chosenCountryId,
    isCorrect,
    usedHintLevel: session.hintLevel,
    pointsEarned,
  };

  const newlyDiscoveredIds =
    isCorrect && !session.newlyDiscoveredIds.includes(currentQuestion.target.id)
      ? [...session.newlyDiscoveredIds, currentQuestion.target.id]
      : session.newlyDiscoveredIds;

  return {
    ...session,
    score: session.score + pointsEarned,
    streak: nextStreak,
    bestStreak,
    hearts: nextHearts,
    answeredId: chosenCountryId,
    lastAnswerCorrect: isCorrect,
    lastPointsEarned: pointsEarned,
    records: [...session.records, record],
    newlyDiscoveredIds,
  };
}

export function advanceSessionStep(session: ActiveSession): {
  nextSession: ActiveSession;
  finished: boolean;
  isVictory: boolean;
} {
  if (session.hearts <= 0) {
    return {
      nextSession: session,
      finished: true,
      isVictory: false,
    };
  }

  const nextIndex = session.currentIndex + 1;
  if (nextIndex >= session.questions.length) {
    return {
      nextSession: session,
      finished: true,
      isVictory: true,
    };
  }

  return {
    nextSession: {
      ...session,
      currentIndex: nextIndex,
      hintLevel: 0,
      eliminatedIds: [],
      answeredId: null,
      lastAnswerCorrect: null,
      lastPointsEarned: 0,
    },
    finished: false,
    isVictory: false,
  };
}

export function createRoundSnapshot(
  session: ActiveSession,
  isVictory: boolean,
  previousBestScore: number
): RoundSummarySnapshot {
  const bestScore = Math.max(previousBestScore, session.score);
  const correctCount = session.records.filter((r) => r.isCorrect).length;
  return {
    isVictory,
    score: session.score,
    bestScore,
    correctCount,
    totalQuestions: session.questions.length,
    bestStreak: session.bestStreak,
    heartsRemaining: session.hearts,
    records: session.records,
    newlyDiscoveredIds: session.newlyDiscoveredIds,
  };
}

export function mergeDiscoveredStamps(
  existing: readonly string[],
  incoming: readonly string[]
): string[] {
  const set = new Set(existing);
  for (const id of incoming) {
    set.add(id);
  }
  return Array.from(set);
}

export function formatReadout(value: number): string {
  return Math.round(value).toString();
}
