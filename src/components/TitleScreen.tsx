import React, { useState } from 'react';
import { CONTINENTS, COUNTRIES } from '../data/countries';
import { ContinentFilter, QuizMode } from '../game/rules';
import { TitleLogoSvg } from './TitleLogoSvg';

interface TitleScreenProps {
  continent: ContinentFilter;
  mode: QuizMode;
  bestScore: number;
  discoveredCount: number;
  onSelectContinent: (continent: ContinentFilter) => void;
  onSelectMode: (mode: QuizMode) => void;
  onStartGame: () => void;
  onOpenAtlas: () => void;
}

const MODE_OPTIONS: { value: QuizMode; label: string }[] = [
  { value: 'mixed', label: 'Gemischt' },
  { value: 'flags', label: 'Flaggen' },
  { value: 'capitals', label: 'Hauptstädte' },
  { value: 'matchFlag', label: 'Flagge finden' },
  { value: 'map', label: 'Weltkarte' },
];

const CONTINENT_OPTIONS: { value: ContinentFilter; label: string }[] = [
  { value: 'Alle', label: 'Alle' },
  ...CONTINENTS.map((c) => ({ value: c as ContinentFilter, label: c })),
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  continent,
  mode,
  bestScore,
  discoveredCount,
  onSelectContinent,
  onSelectMode,
  onStartGame,
  onOpenAtlas,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#F7F1E1] flex flex-col justify-between">
      {/* Illustrated Key-Art Backdrop */}
      {!imgError && (
        <img
          src="/src/assets/images/title_atlas_bg_1795232466371.jpg"
          alt="Illustrierter Entdecker-Schreibtisch mit Weltkarte, Kompass und Heißluftballon"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 w-full h-full object-cover object-right select-none pointer-events-none"
        />
      )}

      {/* Soft left-side readability wash so typography stays crisp over calm negative space */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(247,241,225,0.94) 0%, rgba(247,241,225,0.85) 38%, rgba(247,241,225,0.18) 72%, rgba(247,241,225,0) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Left-third Content Composition */}
      <div className="relative z-10 flex-1 flex items-center px-6 sm:px-10 lg:px-16 py-6">
        <div className="w-full max-w-xl flex flex-col gap-5">
          {/* Bespoke Inline SVG Title Emblem */}
          <TitleLogoSvg className="w-full max-w-[420px]" />

          {/* Unboxed Explorer Stats Line */}
          <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-[#475569] tabular-nums">
            <span>{discoveredCount} / {COUNTRIES.length} Reisepass-Stempel</span>
            <span aria-hidden="true">·</span>
            <span>Bestwert: {bestScore} Punkte</span>
          </div>

          {/* Mode Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">
              Spielmodus
            </span>
            <div
              role="group"
              aria-label="Spielmodus wählen"
              className="inline-flex flex-wrap gap-1.5 bg-[#EFE6D2] border border-[#D6CBB5] p-1.5 rounded-2xl w-fit"
            >
              {MODE_OPTIONS.map((opt) => {
                const active = mode === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSelectMode(opt.value)}
                    aria-pressed={active}
                    className={`px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 transition-transform duration-150 cursor-pointer ${
                      active
                        ? 'bg-[#182B3A] text-[#FFFDF7] shadow-sm'
                        : 'text-[#334155] hover:bg-[#FFFDF7]/70'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continent Filter Selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#475569]">
              Reiseziel
            </span>
            <div
              role="group"
              aria-label="Kontinent wählen"
              className="flex flex-wrap gap-1.5"
            >
              {CONTINENT_OPTIONS.map((opt) => {
                const active = continent === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSelectContinent(opt.value)}
                    aria-pressed={active}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
                      active
                        ? 'bg-[#FFFDF7] border-[#182B3A] text-[#182B3A] shadow-[0_2px_0_#182B3A]'
                        : 'bg-[#FFFDF7]/80 border-[#D6CBB5] text-[#475569] hover:bg-[#FFFDF7] hover:text-[#182B3A]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary & Secondary Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              data-start="true"
              onClick={onStartGame}
              className="px-7 py-3.5 rounded-2xl bg-[#E85D3F] hover:bg-[#D94E30] active:translate-y-0.5 text-white font-display font-bold text-xl tracking-wide border-2 border-[#9A3412] shadow-[0_4px_0_#9A3412] transition-transform duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#182B3A]"
            >
              Reise starten
            </button>

            <button
              type="button"
              onClick={onOpenAtlas}
              className="px-5 py-3.5 rounded-2xl bg-[#FFFDF7] hover:bg-[#FAF3E3] active:translate-y-0.5 text-[#182B3A] font-display font-bold text-lg border-2 border-[#D6CBB5] shadow-[0_4px_0_#D6CBB5] transition-transform duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#182B3A]"
            >
              Weltkarte &amp; Atlas
            </button>
          </div>
        </div>
      </div>

      {/* Single Flat Borderless Control-Hint Line */}
      <footer className="relative z-10 px-6 sm:px-10 lg:px-16 pb-4">
        <p className="text-xs sm:text-sm font-bold text-[#475569]">
          Enter Start · 1–4 Antwort wählen · H Tipp · M Ton · Esc Pause
        </p>
      </footer>
    </main>
  );
};
