import React from 'react';
import { ActiveSession, formatReadout } from '../game/rules';

interface GameHudProps {
  session: ActiveSession;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
}

function HeartSocket({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-200"
      aria-hidden="true"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? '#E85D3F' : '#E5DEC9'}
        stroke="#182B3A"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {filled && (
        <path
          d="M6.8 6.8c-.9.8-1.4 1.9-1.3 3.1"
          stroke="#FFF5F2"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}

export const GameHud: React.FC<GameHudProps> = ({
  session,
  muted,
  onToggleMute,
  onPause,
  onRestart,
}) => {
  const total = session.questions.length;
  const stationNumber = Math.min(session.currentIndex + 1, total);

  return (
    <header className="w-full max-w-5xl mx-auto px-3 sm:px-4 pt-3 pb-2 flex flex-wrap items-center justify-between gap-2 sm:gap-3 pointer-events-auto">
      {/* Left: Station Progress */}
      <div className="flex items-center gap-2.5 sm:gap-3 bg-[#FFFDF7] border-2 border-[#D6CBB5] rounded-2xl px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-[0_3px_0_#D6CBB5]">
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#64748B] leading-none">
            Station
          </span>
          <span className="font-display font-bold text-base sm:text-xl text-[#182B3A] tabular-nums leading-tight">
            {stationNumber} / {total}
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1.5" aria-hidden="true">
          {session.questions.map((q, idx) => {
            const record = session.records[idx];
            let dotColor = 'bg-[#E5DEC9] border-[#C9BEA6]';
            if (record) {
              dotColor = record.isCorrect
                ? 'bg-[#15803D] border-[#14532D]'
                : 'bg-[#DC2626] border-[#991B1B]';
            } else if (idx === session.currentIndex) {
              dotColor = 'bg-[#E85D3F] border-[#9A3412] scale-125';
            }
            return (
              <span
                key={q.id}
                className={`w-2.5 h-2.5 rounded-full border transition-transform duration-150 ${dotColor}`}
              />
            );
          })}
        </div>
      </div>

      {/* Center: Hearts, Streak & Score */}
      <div className="flex items-center gap-2.5 sm:gap-5 bg-[#FFFDF7] border-2 border-[#D6CBB5] rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-[0_3px_0_#D6CBB5]">
        <div
          className="flex items-center gap-0.5 sm:gap-1"
          aria-label={`Leben: ${session.hearts} von ${session.maxHearts}`}
        >
          {Array.from({ length: session.maxHearts }).map((_, idx) => (
            <HeartSocket key={idx} filled={idx < session.hearts} />
          ))}
        </div>

        <div className="h-5 sm:h-6 w-px bg-[#E5DEC9]" aria-hidden="true" />

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] leading-none">
              Serie
            </span>
            <span className="font-display font-bold text-lg text-[#B45309] tabular-nums leading-tight">
              {formatReadout(session.streak)}x
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#64748B] leading-none">
              Punkte
            </span>
            <span
              data-testid="hud-score"
              className="font-display font-bold text-base sm:text-xl text-[#182B3A] tabular-nums leading-tight"
            >
              {formatReadout(session.score)}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Compact Utility Icon Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onToggleMute();
          }}
          aria-label={muted ? 'Ton einschalten (Taste M)' : 'Ton stummschalten (Taste M)'}
          title={muted ? 'Ton an [M]' : 'Ton aus [M]'}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FFFDF7] border-2 border-[#D6CBB5] shadow-[0_3px_0_#D6CBB5] hover:bg-[#FAF3E3] active:translate-y-0.5 flex items-center justify-center text-[#182B3A] transition-transform duration-150 cursor-pointer"
        >
          {muted ? (
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#E5DEC9" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#FDE68A" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onRestart();
          }}
          aria-label="Runde neu starten (Taste R)"
          title="Neu starten [R]"
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FFFDF7] border-2 border-[#D6CBB5] shadow-[0_3px_0_#D6CBB5] hover:bg-[#FAF3E3] active:translate-y-0.5 flex items-center justify-center text-[#182B3A] transition-transform duration-150 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            onPause();
          }}
          aria-label="Spiel pausieren (Taste Esc oder P)"
          title="Pause [Esc]"
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#FFFDF7] border-2 border-[#D6CBB5] shadow-[0_3px_0_#D6CBB5] hover:bg-[#FAF3E3] active:translate-y-0.5 flex items-center justify-center text-[#182B3A] transition-transform duration-150 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1.5" />
            <rect x="14" y="5" width="4" height="14" rx="1.5" />
          </svg>
        </button>
      </div>
    </header>
  );
};
