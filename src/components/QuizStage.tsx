import React from 'react';
import { COUNTRIES } from '../data/countries';
import { ActiveSession } from '../game/rules';
import { FlagSvg } from './FlagSvg';
import { WorldMap } from './WorldMap';

interface QuizStageProps {
  session: ActiveSession;
  onSelectAnswer: (countryId: string) => void;
  onRequestHint: () => void;
  onNextQuestion: () => void;
}

const CONFETTI_OFFSETS = [
  { tx: '-54px', ty: '-48px', rot: '-25deg', color: '#E85D3F' },
  { tx: '58px', ty: '-42px', rot: '35deg', color: '#F59E0B' },
  { tx: '-68px', ty: '10px', rot: '-45deg', color: '#10B981' },
  { tx: '66px', ty: '14px', rot: '50deg', color: '#3B82F6' },
  { tx: '-28px', ty: '-64px', rot: '18deg', color: '#F59E0B' },
  { tx: '30px', ty: '-60px', rot: '-22deg', color: '#E85D3F' },
];

export const QuizStage: React.FC<QuizStageProps> = ({
  session,
  onSelectAnswer,
  onRequestHint,
  onNextQuestion,
}) => {
  const question = session.questions[session.currentIndex];
  if (!question) return null;

  const isAnswered = session.answeredId !== null;
  const isLastStep =
    session.hearts <= 0 || session.currentIndex >= session.questions.length - 1;

  const questionHeadline = (() => {
    switch (question.type) {
      case 'flag-to-country':
        return 'Zu welchem Land gehört diese Flagge?';
      case 'country-to-capital':
        return `Wie heißt die Hauptstadt von ${question.target.name}?`;
      case 'country-to-flag':
        return `Welche Flagge gehört zu ${question.target.name}?`;
      case 'map-locate':
        return `Wo liegt ${question.target.name} auf der Weltkarte?`;
    }
  })();

  const questionTypeLabel = (() => {
    switch (question.type) {
      case 'flag-to-country':
        return 'Flaggen-Rätsel';
      case 'country-to-capital':
        return 'Hauptstadt-Suche';
      case 'country-to-flag':
        return 'Flaggen-Zuordnung';
      case 'map-locate':
        return 'Weltkarten-Suche';
    }
  })();

  const mapFocusContinent =
    session.hintLevel >= 1 || isAnswered
      ? question.target.continent
      : session.continent;

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-4 pb-6 pt-2 flex flex-col items-center justify-center gap-4">
      {/* Question Prompt Card */}
      <section
        aria-label="Aktuelle Aufgabe"
        className={`w-full bg-[#FFFDF7] border-2 border-[#D6CBB5] rounded-3xl px-5 sm:px-8 shadow-[0_5px_0_#D6CBB5] flex flex-col items-center text-center ${
          question.type === 'map-locate' ? 'py-4 gap-2.5' : 'py-5 sm:py-6 gap-4'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
          <span>{questionTypeLabel}</span>
          {session.hintLevel >= 1 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[#B45309]">{question.target.continent}</span>
            </>
          )}
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#182B3A] leading-snug text-balance">
          {questionHeadline}
        </h1>

        {/* Prompt Visual Anchor */}
        {question.type === 'flag-to-country' && (
          <div className="w-56 sm:w-68 mx-auto py-1">
            <FlagSvg
              countryId={question.target.id}
              countryName={question.target.name}
              revealLabel={isAnswered}
              className="w-full h-auto"
            />
          </div>
        )}

        {(question.type === 'country-to-capital' ||
          question.type === 'map-locate') && (
          <div className="flex items-center justify-center gap-4 py-0.5">
            <div className={question.type === 'map-locate' ? 'w-20 sm:w-24 shrink-0' : 'w-28 sm:w-32 shrink-0'}>
              <FlagSvg
                countryId={question.target.id}
                countryName={question.target.name}
                revealLabel={true}
              />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                {question.type === 'map-locate' ? 'Reiseziel' : 'Land'}
              </p>
              <p className="font-display font-bold text-xl sm:text-2xl text-[#182B3A] leading-tight">
                {question.target.name}
              </p>
              {question.type === 'map-locate' && (
                <p className="text-xs sm:text-sm font-bold text-[#475569]">
                  Hauptstadt: {question.target.capital}
                </p>
              )}
            </div>
          </div>
        )}

        {question.type === 'country-to-flag' && (
          <p className="text-sm sm:text-base font-bold text-[#475569]">
            Hauptstadt: <span className="text-[#182B3A]">{question.target.capital}</span>
          </p>
        )}

        {/* Hint Bar & Clue Reveal */}
        <div className="w-full flex flex-col items-center gap-2">
          {!isAnswered && (
            <button
              type="button"
              onClick={onRequestHint}
              disabled={session.hintLevel >= 2}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors duration-150 whitespace-nowrap ${
                session.hintLevel >= 2
                  ? 'bg-[#F3EDE0] border-[#D6CBB5] text-[#94A3B8] cursor-not-allowed'
                  : 'bg-[#FEF3C7] hover:bg-[#FDE68A] border-[#D97706] text-[#92400E] cursor-pointer'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>
                {session.hintLevel === 0
                  ? 'Tipp anzeigen [H]'
                  : session.hintLevel === 1
                  ? '50/50 Joker nutzen [H]'
                  : 'Beide Tipps genutzt'}
              </span>
            </button>
          )}

          {session.hintLevel >= 1 && !isAnswered && (
            <p className="max-w-xl text-sm font-semibold text-[#78350F] bg-[#FFFBEB] border border-[#FCD34D] rounded-xl px-4 py-2 animate-pop-in">
              <strong className="font-extrabold">Entdecker-Tipp ({question.target.continent}):</strong>{' '}
              {question.target.clue}
            </p>
          )}
        </div>
      </section>

      {/* Interactive World Map OR 2x2 Tactile Answer Cards */}
      {question.type === 'map-locate' ? (
        <section
          aria-label="Weltkarte zur Auswahl"
          className="w-full flex flex-col gap-3"
        >
          <WorldMap
            mode="quiz"
            countries={COUNTRIES}
            focusContinent={mapFocusContinent}
            candidateOptions={question.options}
            targetCountryId={question.target.id}
            answeredId={session.answeredId}
            eliminatedIds={session.eliminatedIds}
            onSelectOption={onSelectAnswer}
            className="max-h-[380px]"
          />

          {/* Compact 4-option quick-select bar for effortless mobile tapping & keyboard parity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {question.options.map((option, idx) => {
              const isEliminated = session.eliminatedIds.includes(option.id);
              const isChosen = session.answeredId === option.id;
              const isTarget = option.id === question.target.id;

              let btnClass =
                'bg-[#FFFDF7] border-[#D6CBB5] text-[#182B3A] shadow-[0_3px_0_#D6CBB5] hover:bg-[#FAF3E3] cursor-pointer';
              if (isEliminated && !isAnswered) {
                btnClass =
                  'bg-[#EFE9DA] border-[#DDD3BE] text-[#94A3B8] opacity-45 cursor-not-allowed shadow-none';
              } else if (isAnswered) {
                if (isTarget) {
                  btnClass =
                    'bg-[#ECFDF5] border-[#15803D] text-[#14532D] shadow-[0_3px_0_#15803D] cursor-default';
                } else if (isChosen) {
                  btnClass =
                    'bg-[#FEF2F2] border-[#DC2626] text-[#991B1B] shadow-[0_3px_0_#DC2626] cursor-default';
                } else {
                  btnClass =
                    'bg-[#F7F3E9] border-[#E2D9C5] text-[#64748B] opacity-70 shadow-none cursor-default';
                }
              }

              return (
                <button
                  key={option.id}
                  type="button"
                  data-option-index={idx}
                  disabled={isAnswered || isEliminated}
                  onClick={() => onSelectAnswer(option.id)}
                  className={`min-h-[48px] px-3 py-2 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-transform duration-150 ${btnClass}`}
                >
                  <span
                    aria-hidden="true"
                    className="w-6 h-6 rounded-md bg-[#EFE6D2] border border-[#C9BEA6] font-mono-num text-xs text-[#334155] flex items-center justify-center shrink-0"
                  >
                    {idx + 1}
                  </span>
                  <span className="truncate">
                    {isAnswered ? option.name : `Marker ${idx + 1}`}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <section
          aria-label="Antwortmöglichkeiten"
          className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5"
        >
          {question.options.map((option, idx) => {
            const isEliminated = session.eliminatedIds.includes(option.id);
            const isChosen = session.answeredId === option.id;
            const isTarget = option.id === question.target.id;

            let cardClass =
              'bg-[#FFFDF7] border-[#D6CBB5] text-[#182B3A] shadow-[0_4px_0_#D6CBB5] hover:bg-[#FAF3E3] hover:-translate-y-0.5 cursor-pointer';
            let animClass = '';

            if (isEliminated && !isAnswered) {
              cardClass =
                'bg-[#EFE9DA] border-[#DDD3BE] text-[#94A3B8] opacity-45 cursor-not-allowed shadow-none';
            } else if (isAnswered) {
              if (isTarget) {
                cardClass =
                  'bg-[#ECFDF5] border-[#15803D] text-[#14532D] shadow-[0_4px_0_#15803D] cursor-default';
                if (isChosen) {
                  animClass = 'animate-pop-in';
                }
              } else if (isChosen && !isTarget) {
                cardClass =
                  'bg-[#FEF2F2] border-[#DC2626] text-[#991B1B] shadow-[0_4px_0_#DC2626] cursor-default';
                animClass = 'animate-shake-soft';
              } else {
                cardClass =
                  'bg-[#F7F3E9] border-[#E2D9C5] text-[#64748B] opacity-70 shadow-none cursor-default';
              }
            }

            const optionText =
              question.type === 'country-to-capital'
                ? option.capital
                : option.name;

            const ariaLabel =
              question.type === 'country-to-flag'
                ? `Antwort ${idx + 1}: Flagge wählen`
                : `Antwort ${idx + 1}: ${optionText}`;

            return (
              <button
                key={option.id}
                type="button"
                data-option-index={idx}
                disabled={isAnswered || isEliminated}
                onClick={() => onSelectAnswer(option.id)}
                aria-label={ariaLabel}
                className={`relative min-h-[76px] rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-3 text-left transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#182B3A] ${cardClass} ${animClass}`}
              >
                <span
                  aria-hidden="true"
                  className="w-8 h-8 rounded-lg bg-[#EFE6D2] border border-[#C9BEA6] font-mono-num font-bold text-sm text-[#334155] flex items-center justify-center shrink-0"
                >
                  {idx + 1}
                </span>

                {question.type === 'country-to-flag' ? (
                  <div className="flex-1 flex items-center justify-center py-0.5">
                    <div className="w-32 sm:w-36">
                      <FlagSvg
                        countryId={option.id}
                        countryName={option.name}
                        revealLabel={isAnswered}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="flex-1 font-display font-bold text-lg sm:text-xl leading-tight">
                    {optionText}
                  </span>
                )}

                <span className="w-7 h-7 flex items-center justify-center shrink-0" aria-hidden="true">
                  {isAnswered && isTarget && (
                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#15803D]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" fill="#DCFCE7" stroke="currentColor" strokeWidth="2" />
                      <polyline points="8 12.5 11 15.5 16.5 9" />
                    </svg>
                  )}
                  {isAnswered && isChosen && !isTarget && (
                    <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#DC2626]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" fill="#FEE2E2" stroke="currentColor" strokeWidth="2" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                  )}
                </span>

                {isAnswered && isChosen && isTarget && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
                  >
                    {CONFETTI_OFFSETS.map((c, cIdx) => (
                      <span
                        key={cIdx}
                        className="absolute w-2.5 h-2.5 rounded-sm animate-confetti"
                        style={
                          {
                            backgroundColor: c.color,
                            '--tx': c.tx,
                            '--ty': c.ty,
                            '--rot': c.rot,
                          } as React.CSSProperties
                        }
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </section>
      )}

      {/* Educational Feedback Banner (Appears immediately after answering) */}
      {isAnswered && (
        <section
          aria-live="polite"
          className={`w-full rounded-2xl border-2 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pop-in ${
            session.lastAnswerCorrect
              ? 'bg-[#ECFDF5] border-[#15803D] text-[#14532D]'
              : 'bg-[#FFF7ED] border-[#C2410C] text-[#7C2D12]'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-16 shrink-0 pt-0.5">
              <FlagSvg
                countryId={question.target.id}
                countryName={question.target.name}
                revealLabel={true}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-display font-bold text-base sm:text-lg">
                {session.lastAnswerCorrect
                  ? `Richtig! +${session.lastPointsEarned} Punkte`
                  : `Knapp daneben! Richtig ist: ${question.target.name}`}
              </p>
              <p className="text-sm font-bold">
                {question.target.name} · Hauptstadt: {question.target.capital} · {question.target.continent}
              </p>
              <p className="text-xs sm:text-sm font-semibold opacity-90 mt-0.5">
                Wusstest du schon? {question.target.fact}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNextQuestion}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#182B3A] hover:bg-[#0F1E29] active:translate-y-0.5 text-white font-display font-bold text-base whitespace-nowrap shrink-0 cursor-pointer transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#182B3A]"
          >
            {isLastStep ? 'Ergebnis ansehen →' : 'Nächste Station →'}
          </button>
        </section>
      )}
    </main>
  );
};
