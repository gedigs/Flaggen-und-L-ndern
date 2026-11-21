import { useCallback, useEffect, useState } from 'react';
import { soundEngine } from './audio/soundEffects';
import { GameHud } from './components/GameHud';
import { LernAtlas } from './components/LernAtlas';
import { GameOverModal, PauseModal } from './components/Modals';
import { QuizStage } from './components/QuizStage';
import { TitleScreen } from './components/TitleScreen';
import { COUNTRIES } from './data/countries';
import {
  ActiveSession,
  ContinentFilter,
  GameState,
  QUESTIONS_PER_ROUND,
  QuizMode,
  RoundSummarySnapshot,
  advanceSessionStep,
  applyHintToSession,
  createInitialSession,
  createRoundSnapshot,
  mergeDiscoveredStamps,
  submitAnswerToSession,
} from './game/rules';

const STORAGE_STAMPS_KEY = 'weltreise_atlas_stamps_v1';
const STORAGE_BEST_SCORE_KEY = 'weltreise_atlas_best_score_v1';

function loadStoredStamps(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_STAMPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function loadStoredBestScore(): number {
  try {
    const raw = localStorage.getItem(STORAGE_BEST_SCORE_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export default function App() {
  const [continent, setContinent] = useState<ContinentFilter>('Alle');
  const [mode, setMode] = useState<QuizMode>('mixed');
  const [discoveredIds, setDiscoveredIds] = useState<string[]>(() =>
    loadStoredStamps()
  );
  const [bestScore, setBestScore] = useState<number>(() => loadStoredBestScore());
  const [muted, setMuted] = useState<boolean>(false);

  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'playing';
      }
    }
    return 'title';
  });

  const [session, setSession] = useState<ActiveSession>(() =>
    createInitialSession(COUNTRIES, 'Alle', 'mixed', QUESTIONS_PER_ROUND)
  );

  const [snapshot, setSnapshot] = useState<RoundSummarySnapshot | null>(null);

  // Sync body dataset state for accessibility & automated checks
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const startNewRound = useCallback(
    (targetContinent: ContinentFilter = continent, targetMode: QuizMode = mode) => {
      blurActiveElement();
      soundEngine.playClick();
      const freshSession = createInitialSession(
        COUNTRIES,
        targetContinent,
        targetMode,
        QUESTIONS_PER_ROUND
      );
      setContinent(targetContinent);
      setMode(targetMode);
      setSession(freshSession);
      setSnapshot(null);
      document.body.dataset.state = 'playing';
      setGameState('playing');
    },
    [continent, mode]
  );

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      soundEngine.setMuted(next);
      return next;
    });
  }, []);

  const handleSelectAnswer = useCallback((countryId: string) => {
    setSession((prev) => {
      const updated = submitAnswerToSession(prev, countryId);
      if (updated === prev) return prev;
      if (updated.lastAnswerCorrect) {
        soundEngine.playCorrect(updated.streak);
      } else {
        soundEngine.playWrong();
      }
      return updated;
    });
  }, []);

  const handleRequestHint = useCallback(() => {
    setSession((prev) => {
      const updated = applyHintToSession(prev);
      if (updated !== prev) {
        soundEngine.playHint();
      }
      return updated;
    });
  }, []);

  const handleNextQuestion = useCallback(() => {
    const step = advanceSessionStep(session);
    if (step.finished) {
      const finalSnapshot = createRoundSnapshot(session, step.isVictory, bestScore);
      setSnapshot(finalSnapshot);

      const updatedBest = Math.max(bestScore, session.score);
      setBestScore(updatedBest);
      try {
        localStorage.setItem(STORAGE_BEST_SCORE_KEY, String(updatedBest));
      } catch {
        // Ignore storage errors
      }

      const mergedStamps = mergeDiscoveredStamps(
        discoveredIds,
        session.newlyDiscoveredIds
      );
      setDiscoveredIds(mergedStamps);
      try {
        localStorage.setItem(STORAGE_STAMPS_KEY, JSON.stringify(mergedStamps));
      } catch {
        // Ignore storage errors
      }

      if (step.isVictory) {
        soundEngine.playVictory();
      } else {
        soundEngine.playGameOver();
      }
      document.body.dataset.state = 'gameover';
      setGameState('gameover');
    } else {
      soundEngine.playClick();
      setSession(step.nextSession);
    }
  }, [session, bestScore, discoveredIds]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      if (gameState === 'title') {
        if (e.key === 'Enter' || e.key === ' ') {
          // Only trigger start via keyboard if not focused on a selector button
          if (
            !(target instanceof HTMLButtonElement) ||
            target.dataset.start === 'true'
          ) {
            e.preventDefault();
            startNewRound();
          }
        }
        return;
      }

      if (gameState === 'playing') {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setGameState('paused');
          return;
        }
        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          startNewRound();
          return;
        }
        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          handleRequestHint();
          return;
        }
        if (['1', '2', '3', '4'].includes(e.key) && session.answeredId === null) {
          const idx = Number(e.key) - 1;
          const q = session.questions[session.currentIndex];
          const option = q?.options[idx];
          if (option && !session.eliminatedIds.includes(option.id)) {
            e.preventDefault();
            handleSelectAnswer(option.id);
          }
          return;
        }
        if ((e.key === 'Enter' || e.key === ' ') && session.answeredId !== null) {
          e.preventDefault();
          handleNextQuestion();
        }
        return;
      }

      if (gameState === 'paused') {
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          setGameState('playing');
        }
        return;
      }

      if (gameState === 'gameover') {
        if (e.key === 'Enter') {
          e.preventDefault();
          startNewRound();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    gameState,
    session,
    startNewRound,
    handleToggleMute,
    handleRequestHint,
    handleSelectAnswer,
    handleNextQuestion,
  ]);

  if (gameState === 'title') {
    return (
      <TitleScreen
        continent={continent}
        mode={mode}
        bestScore={bestScore}
        discoveredCount={discoveredIds.length}
        onSelectContinent={(c) => {
          soundEngine.playClick();
          setContinent(c);
        }}
        onSelectMode={(m) => {
          soundEngine.playClick();
          setMode(m);
        }}
        onStartGame={() => startNewRound(continent, mode)}
        onOpenAtlas={() => {
          soundEngine.playClick();
          setGameState('atlas');
        }}
      />
    );
  }

  if (gameState === 'atlas') {
    return (
      <LernAtlas
        discoveredIds={discoveredIds}
        onBack={() => {
          soundEngine.playClick();
          setGameState('title');
        }}
        onStartContinentQuiz={(chosenContinent) => {
          startNewRound(chosenContinent, mode);
        }}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#F5EFE1] overflow-x-hidden">
      {/* Subtle Cartographic Map Grid Background */}
      <svg
        aria-hidden="true"
        className="fixed inset-0 w-full h-full pointer-events-none opacity-35"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id="atlas-grid"
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 96 0 L 0 0 0 96"
              fill="none"
              stroke="#D6CBB5"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#atlas-grid)" />
      </svg>

      {/* Active Play Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <GameHud
          session={session}
          muted={muted}
          onToggleMute={handleToggleMute}
          onPause={() => {
            soundEngine.playClick();
            setGameState('paused');
          }}
          onRestart={() => startNewRound()}
        />

        <QuizStage
          session={session}
          onSelectAnswer={handleSelectAnswer}
          onRequestHint={handleRequestHint}
          onNextQuestion={handleNextQuestion}
        />
      </div>

      {gameState === 'paused' && (
        <PauseModal
          onResume={() => {
            soundEngine.playClick();
            setGameState('playing');
          }}
          onRestart={() => startNewRound()}
          onQuitToTitle={() => {
            soundEngine.playClick();
            setGameState('title');
          }}
        />
      )}

      {gameState === 'gameover' && snapshot && (
        <GameOverModal
          snapshot={snapshot}
          onPlayAgain={() => startNewRound()}
          onQuitToTitle={() => {
            soundEngine.playClick();
            setGameState('title');
          }}
        />
      )}
    </div>
  );
}
