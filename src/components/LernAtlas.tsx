import React, { useMemo, useState } from 'react';
import { CONTINENTS, COUNTRIES, Country } from '../data/countries';
import { ContinentFilter } from '../game/rules';
import { FlagSvg } from './FlagSvg';
import { WorldMap } from './WorldMap';

interface LernAtlasProps {
  discoveredIds: string[];
  onBack: () => void;
  onStartContinentQuiz: (continent: ContinentFilter) => void;
}

const ATLAS_TABS: ContinentFilter[] = ['Alle', ...CONTINENTS];

export const LernAtlas: React.FC<LernAtlasProps> = ({
  discoveredIds,
  onBack,
  onStartContinentQuiz,
}) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedContinent, setSelectedContinent] = useState<ContinentFilter>('Alle');
  const [query, setQuery] = useState('');
  const [activeCountry, setActiveCountry] = useState<Country | null>(null);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COUNTRIES.filter((c) => {
      const matchesContinent =
        selectedContinent === 'Alle' || c.continent === selectedContinent;
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.capital.toLowerCase().includes(q);
      return matchesContinent && matchesQuery;
    });
  }, [selectedContinent, query]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F6F0E2] overflow-hidden">
      {/* Atlas Top Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-3 flex flex-wrap items-center justify-between gap-3 border-b border-[#DFD5BE]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-3.5 py-2 rounded-xl bg-[#FFFDF7] border-2 border-[#D6CBB5] shadow-[0_2px_0_#D6CBB5] hover:bg-[#FAF3E3] font-bold text-sm text-[#182B3A] whitespace-nowrap shrink-0 cursor-pointer"
          >
            ← Zurück
          </button>
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-[#182B3A] leading-tight">
              Entdecker Weltkarte &amp; Atlas
            </h1>
            <p className="text-xs sm:text-sm font-bold text-[#64748B] tabular-nums">
              {discoveredIds.length} / {COUNTRIES.length} Reisepass-Stempel entdeckt
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Segmented View Toggle: Weltkarte | Kartenliste */}
          <div
            role="group"
            aria-label="Ansicht wählen"
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#EFE6D2] border border-[#D6CBB5]"
          >
            <button
              type="button"
              onClick={() => setViewMode('map')}
              aria-pressed={viewMode === 'map'}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 ${
                viewMode === 'map'
                  ? 'bg-[#182B3A] text-[#FFFDF7]'
                  : 'text-[#475569] hover:text-[#182B3A]'
              }`}
            >
              Weltkarte
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 ${
                viewMode === 'list'
                  ? 'bg-[#182B3A] text-[#FFFDF7]'
                  : 'text-[#475569] hover:text-[#182B3A]'
              }`}
            >
              Kartenliste
            </button>
          </div>

          <label htmlFor="atlas-search" className="sr-only">
            Land oder Hauptstadt suchen
          </label>
          <input
            id="atlas-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Land oder Hauptstadt..."
            className="flex-1 sm:w-48 px-3.5 py-2 rounded-xl bg-[#FFFDF7] border-2 border-[#D6CBB5] text-sm font-semibold text-[#182B3A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#182B3A]"
          />
          <button
            type="button"
            onClick={() => onStartContinentQuiz(selectedContinent)}
            className="px-4 py-2 rounded-xl bg-[#E85D3F] hover:bg-[#D94E30] text-white font-display font-bold text-sm border-2 border-[#9A3412] shadow-[0_2px_0_#9A3412] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {selectedContinent === 'Alle'
              ? 'Alle üben'
              : `${selectedContinent} üben`}
          </button>
        </div>
      </header>

      {/* Continent Filter Bar */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 overflow-x-auto shrink-0">
        {ATLAS_TABS.map((tab) => {
          const active = selectedContinent === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedContinent(tab)}
              aria-pressed={active}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-bold border whitespace-nowrap shrink-0 cursor-pointer transition-colors duration-150 ${
                active
                  ? 'bg-[#182B3A] border-[#182B3A] text-[#FFFDF7]'
                  : 'bg-[#FFFDF7] border-[#D6CBB5] text-[#475569] hover:text-[#182B3A]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Content Area: Interactive World Map OR Country Card Grid */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8">
        <div className="w-full max-w-6xl mx-auto">
          {viewMode === 'map' ? (
            <div className="flex flex-col gap-3">
              <WorldMap
                mode="explore"
                countries={filteredCountries}
                focusContinent={selectedContinent}
                onFocusContinentChange={setSelectedContinent}
                discoveredIds={discoveredIds}
                selectedCountryId={activeCountry?.id ?? null}
                onSelectCountry={(country) => setActiveCountry(country)}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-bold text-[#475569] px-1">
                <span>
                  {filteredCountries.length} Länder auf der Karte sichtbar
                  {selectedContinent !== 'Alle' ? ` · Fokus: ${selectedContinent}` : ''}
                </span>
                <span>Tipp: Grüne Häkchen zeigen gesammelte Reisepass-Stempel.</span>
              </div>
            </div>
          ) : filteredCountries.length === 0 ? (
            <div className="bg-[#FFFDF7] border-2 border-[#D6CBB5] rounded-3xl p-8 text-center mt-4">
              <p className="font-display font-bold text-xl text-[#182B3A]">
                Kein Land gefunden
              </p>
              <p className="text-sm font-semibold text-[#64748B] mt-1">
                Versuche einen anderen Suchbegriff oder wähle „Alle“.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCountries.map((country) => {
                const stamped = discoveredIds.includes(country.id);
                return (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => setActiveCountry(country)}
                    className="group text-left bg-[#FFFDF7] border-2 border-[#D6CBB5] rounded-2xl p-4 shadow-[0_3px_0_#D6CBB5] hover:border-[#182B3A] hover:-translate-y-0.5 transition-transform duration-150 flex flex-col gap-3 cursor-pointer"
                  >
                    <div className="w-full flex items-start justify-between gap-2">
                      <div className="w-28 shrink-0">
                        <FlagSvg
                          countryId={country.id}
                          countryName={country.name}
                          revealLabel={true}
                        />
                      </div>
                      {stamped && (
                        <span
                          title="Im Quiz gemeistert"
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-[#15803D]"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Stempel
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="font-display font-bold text-lg text-[#182B3A] leading-tight">
                        {country.name}
                      </h2>
                      <p className="text-sm font-bold text-[#475569] mt-0.5">
                        Hauptstadt: <span className="text-[#182B3A]">{country.capital}</span>
                      </p>
                      <p className="text-xs font-bold text-[#64748B] mt-1">
                        {country.continent}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Country Detail Modal */}
      {activeCountry && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Steckbrief ${activeCountry.name}`}
          className="fixed inset-0 z-50 bg-[#182B3A]/60 flex items-center justify-center p-4"
          onClick={() => setActiveCountry(null)}
        >
          <div
            className="w-full max-w-lg bg-[#FFFDF7] border-2 border-[#182B3A] rounded-3xl p-6 shadow-[0_8px_0_#182B3A] flex flex-col gap-4 animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
                  Länder-Steckbrief · {activeCountry.continent}
                </p>
                <h2 className="font-display font-bold text-3xl text-[#182B3A] mt-0.5">
                  {activeCountry.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveCountry(null)}
                aria-label="Dialog schließen"
                className="w-9 h-9 rounded-xl bg-[#EFE6D2] hover:bg-[#E2D5B8] text-[#182B3A] font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="w-56 mx-auto my-1">
              <FlagSvg
                countryId={activeCountry.id}
                countryName={activeCountry.name}
                revealLabel={true}
              />
            </div>

            <div className="bg-[#F6F0E2] border border-[#D6CBB5] rounded-2xl p-4 flex flex-col gap-2">
              <p className="text-base font-extrabold text-[#182B3A]">
                Hauptstadt: {activeCountry.capital}
              </p>
              <p className="text-sm font-semibold text-[#334155]">
                {activeCountry.clue}
              </p>
              <p className="text-sm font-bold text-[#92400E] bg-[#FEF3C7] border border-[#FCD34D] rounded-xl px-3 py-2 mt-1">
                Wusstest du schon? {activeCountry.fact}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveCountry(null)}
                className="px-5 py-2.5 rounded-xl bg-[#182B3A] text-white font-display font-bold text-base cursor-pointer hover:bg-[#0F1E29]"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
