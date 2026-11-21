import React from 'react';
import { RoundSummarySnapshot, formatReadout } from '../game/rules';
import { FlagSvg } from './FlagSvg';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuitToTitle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuitToTitle,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Spiel pausiert"
      className="fixed inset-0 z-50 bg-[#182B3A]/65 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md bg-[#FFFDF7] border-2 border-[#182B3A] rounded-3xl p-6 sm:p-7 shadow-[0_8px_0_#182B3A] flex flex-col items-center text-center gap-5 animate-pop-in">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
            Kurze Rast
          </p>
          <h2 className="font-display font-bold text-3xl text-[#182B3A] mt-1">
            Pause
          </h2>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-[#E85D3F] hover:bg-[#D94E30] text-white font-display font-bold text-lg border-2 border-[#9A3412] shadow-[0_3px_0_#9A3412] cursor-pointer"
          >
            Weiterspielen
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 rounded-2xl bg-[#FFFDF7] hover:bg-[#FAF3E3] text-[#182B3A] font-display font-bold text-lg border-2 border-[#D6CBB5] shadow-[0_3px_0_#D6CBB5] cursor-pointer"
          >
            Runde neu starten
          </button>
          <button
            type="button"
            onClick={onQuitToTitle}
            className="w-full py-2.5 rounded-xl text-[#475569] hover:text-[#182B3A] font-bold text-sm cursor-pointer"
          >
            Zurück zum Startmenü
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  snapshot: RoundSummarySnapshot;
  onPlayAgain: () => void;
  onQuitToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  snapshot,
  onPlayAgain,
  onQuitToTitle,
}) => {
  const missedRecords = snapshot.records.filter((r) => !r.isCorrect);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={snapshot.isVictory ? 'Etappe geschafft' : 'Reise beendet'}
      className="fixed inset-0 z-50 bg-[#182B3A]/65 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FFFDF7] border-2 border-[#182B3A] rounded-3xl p-6 sm:p-7 shadow-[0_8px_0_#182B3A] flex flex-col items-center text-center gap-5 animate-pop-in">
        {/* Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-[#FEF3C7] border-2 border-[#D97706] flex items-center justify-center">
          {snapshot.isVictory ? (
            <svg viewBox="0 0 24 24" className="w-9 h-9 text-[#B45309]" fill="currentColor" aria-hidden="true">
              <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-9 h-9 text-[#E85D3F]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#FDE68A" />
            </svg>
          )}
        </div>

        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
            {snapshot.isVictory ? 'Etappe geschafft' : 'Keine Herzen mehr'}
          </p>
          <h2 className="font-display font-bold text-3xl text-[#182B3A] mt-0.5">
            {snapshot.isVictory ? 'Großartige Weltreise!' : 'Gute Übung, Entdecker!'}
          </h2>
        </div>

        {/* 3 Tabular Stat Tiles */}
        <div className="w-full grid grid-cols-3 gap-2.5">
          <div className="bg-[#F6F0E2] border border-[#D6CBB5] rounded-2xl p-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
              Punkte
            </p>
            <p className="font-display font-bold text-2xl text-[#182B3A] tabular-nums">
              {formatReadout(snapshot.score)}
            </p>
            <p className="text-[11px] font-bold text-[#64748B] tabular-nums">
              Best: {formatReadout(snapshot.bestScore)}
            </p>
          </div>

          <div className="bg-[#F6F0E2] border border-[#D6CBB5] rounded-2xl p-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
              Richtig
            </p>
            <p className="font-display font-bold text-2xl text-[#15803D] tabular-nums">
              {snapshot.correctCount} / {snapshot.totalQuestions}
            </p>
            <p className="text-[11px] font-bold text-[#64748B]">Stationen</p>
          </div>

          <div className="bg-[#F6F0E2] border border-[#D6CBB5] rounded-2xl p-3">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
              Beste Serie
            </p>
            <p className="font-display font-bold text-2xl text-[#B45309] tabular-nums">
              {formatReadout(snapshot.bestStreak)}x
            </p>
            <p className="text-[11px] font-bold text-[#64748B] tabular-nums">
              +{snapshot.newlyDiscoveredIds.length} Stempel
            </p>
          </div>
        </div>

        {/* Review missed countries so the child learns every missed pair */}
        {missedRecords.length > 0 && (
          <div className="w-full text-left bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-4 flex flex-col gap-2.5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#9A3412]">
              Zum Merken aus dieser Runde:
            </p>
            <div className="flex flex-col gap-2">
              {missedRecords.map((rec) => (
                <div
                  key={rec.question.id}
                  className="flex items-center gap-3 bg-[#FFFDF7] border border-[#FDBA74] rounded-xl px-3 py-2"
                >
                  <div className="w-12 shrink-0">
                    <FlagSvg
                      countryId={rec.question.target.id}
                      countryName={rec.question.target.name}
                      revealLabel={true}
                    />
                  </div>
                  <div className="text-sm font-bold text-[#182B3A]">
                    {rec.question.target.name}{' '}
                    <span className="font-semibold text-[#64748B]">
                      · Hauptstadt: {rec.question.target.capital}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            data-start="true"
            onClick={onPlayAgain}
            className="flex-1 py-3.5 rounded-2xl bg-[#E85D3F] hover:bg-[#D94E30] text-white font-display font-bold text-lg border-2 border-[#9A3412] shadow-[0_3px_0_#9A3412] cursor-pointer"
          >
            Nochmal spielen
          </button>
          <button
            type="button"
            onClick={onQuitToTitle}
            className="flex-1 py-3.5 rounded-2xl bg-[#FFFDF7] hover:bg-[#FAF3E3] text-[#182B3A] font-display font-bold text-lg border-2 border-[#D6CBB5] shadow-[0_3px_0_#D6CBB5] cursor-pointer"
          >
            Zum Startmenü
          </button>
        </div>
      </div>
    </div>
  );
};
