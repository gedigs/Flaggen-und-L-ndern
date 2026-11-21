import React, { useEffect, useMemo, useRef, useState } from 'react';
import blankWorldSvgRaw from '../assets/BlankMap-World_gray.svg?raw';
import { Country } from '../data/countries';
import {
  CONTINENT_VIEWBOXES,
  MAP_HEIGHT,
  MAP_WIDTH,
  ViewBoxRect,
  getCountryMapPosition,
} from '../data/worldMapGeometry';
import { ContinentFilter } from '../game/rules';
import { FlagSvg } from './FlagSvg';

interface WorldMapBaseProps {
  countries: Country[];
  focusContinent: ContinentFilter;
  onFocusContinentChange?: (continent: ContinentFilter) => void;
  className?: string;
}

interface ExplorerMapProps extends WorldMapBaseProps {
  mode: 'explore';
  discoveredIds: string[];
  selectedCountryId?: string | null;
  onSelectCountry: (country: Country) => void;
}

interface QuizMapProps extends WorldMapBaseProps {
  mode: 'quiz';
  candidateOptions: Country[];
  targetCountryId: string;
  answeredId: string | null;
  eliminatedIds: string[];
  onSelectOption: (countryId: string) => void;
}

export type WorldMapProps = ExplorerMapProps | QuizMapProps;

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function extractSvgInnerMarkup(rawSvg: string): string {
  const start = rawSvg.indexOf('>');
  const end = rawSvg.lastIndexOf('</svg>');
  if (start === -1 || end === -1 || end <= start) return '';
  return rawSvg.slice(start + 1, end);
}

export const WorldMap: React.FC<WorldMapProps> = (props) => {
  const { countries, focusContinent, onFocusContinentChange, className = '' } = props;

  const targetBox = CONTINENT_VIEWBOXES[focusContinent] ?? CONTINENT_VIEWBOXES.Alle;
  const [viewBox, setViewBox] = useState<ViewBoxRect>(targetBox);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgLayerRef = useRef<SVGGElement | null>(null);

  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startBox: ViewBoxRect;
    moved: boolean;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    startBox: targetBox,
    moved: false,
  });

  const innerSvgMarkup = useMemo(() => extractSvgInnerMarkup(blankWorldSvgRaw), []);

  const countryByLowerId = useMemo(() => {
    const map = new Map<string, Country>();
    for (const c of countries) {
      map.set(c.id.toLowerCase(), c);
    }
    return map;
  }, [countries]);

  // Mount the authentic Wikimedia BlankMap-World_gray.svg paths once
  useEffect(() => {
    if (svgLayerRef.current && innerSvgMarkup) {
      svgLayerRef.current.innerHTML = innerSvgMarkup;
    }
  }, [innerSvgMarkup]);

  // Smoothly animate viewBox when focusContinent changes
  useEffect(() => {
    const dest = CONTINENT_VIEWBOXES[focusContinent] ?? CONTINENT_VIEWBOXES.Alle;
    let rafId = 0;
    const startBox = { ...viewBox };
    const duration = 240;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      setViewBox({
        x: startBox.x + (dest.x - startBox.x) * ease,
        y: startBox.y + (dest.y - startBox.y) * ease,
        w: startBox.w + (dest.w - startBox.w) * ease,
        h: startBox.h + (dest.h - startBox.h) * ease,
      });
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusContinent]);

  // Dynamic CSS highlighting for country shapes directly inside BlankMap-World_gray.svg
  const dynamicCountryStyles = useMemo(() => {
    const rules: string[] = [
      `.wikimedia-world-map #layer1 { fill: #D5D0C3 !important; stroke: #F7F4EB !important; stroke-width: 0.75px !important; }`,
      `.wikimedia-world-map #layer1 path { transition: fill 150ms ease; }`,
    ];

    if (props.mode === 'explore') {
      for (const c of countries) {
        const lower = c.id.toLowerCase();
        const isStamped = props.discoveredIds.includes(c.id);
        const isSelected = props.selectedCountryId === c.id;
        const isHovered = hoveredId === c.id;

        if (isSelected) {
          rules.push(
            `.wikimedia-world-map #${lower}, .wikimedia-world-map #${lower} path { fill: #E85D3F !important; cursor: pointer; }`
          );
        } else if (isHovered) {
          rules.push(
            `.wikimedia-world-map #${lower}, .wikimedia-world-map #${lower} path { fill: #F59E0B !important; cursor: pointer; }`
          );
        } else if (isStamped) {
          rules.push(
            `.wikimedia-world-map #${lower}, .wikimedia-world-map #${lower} path { fill: #6EE7B7 !important; cursor: pointer; }`
          );
        } else {
          rules.push(
            `.wikimedia-world-map #${lower}, .wikimedia-world-map #${lower} path { fill: #BEB7A4 !important; cursor: pointer; }`
          );
        }
      }
    } else {
      const isAnswered = props.answeredId !== null;
      for (const opt of props.candidateOptions) {
        const lower = opt.id.toLowerCase();
        const isTarget = opt.id === props.targetCountryId;
        const isChosen = props.answeredId === opt.id;
        const isEliminated = props.eliminatedIds.includes(opt.id);

        if (isAnswered) {
          if (isTarget) {
            rules.push(
              `.wikimedia-world-map #${lower}, .wikimedia-world-map #${lower} path { fill: #22C55E !important; }`
            );
          } else if (isChosen) {
            rules.push(
              `.wikimedia-world-map #${lower}, .wikimedia-world-map #${lower} path { fill: #EF4444 !important; }`
            );
          }
        } else if (!isEliminated) {
          rules.push(
            `.wikimedia-world-map #${lower}, .wikimedia-world-map #${lower} path { fill: #FDE68A !important; cursor: pointer; }`
          );
        }
      }
    }

    return rules.join('\n');
  }, [props, countries, hoveredId]);

  const findCountryIdFromTarget = (target: EventTarget | null): string | null => {
    let el = target as Element | null;
    while (el && el !== svgLayerRef.current) {
      if (el.id && /^[a-z]{2}$/.test(el.id)) {
        return el.id.toUpperCase();
      }
      el = el.parentElement;
    }
    return null;
  };

  const handleSvgClick = (e: React.MouseEvent<SVGGElement>) => {
    if (dragRef.current.moved) return;
    const countryId = findCountryIdFromTarget(e.target);
    if (!countryId) return;

    const country = countryByLowerId.get(countryId.toLowerCase());
    if (!country) return;

    if (props.mode === 'explore') {
      props.onSelectCountry(country);
    } else if (
      props.answeredId === null &&
      props.candidateOptions.some((o) => o.id === country.id) &&
      !props.eliminatedIds.includes(country.id)
    ) {
      props.onSelectOption(country.id);
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (props.mode !== 'explore') return;
    const countryId = findCountryIdFromTarget(e.target);
    if (countryId && countryByLowerId.has(countryId.toLowerCase())) {
      setHoveredId(countryId);
    } else if (hoveredId !== null) {
      setHoveredId(null);
    }
  };

  const handleZoom = (factor: number) => {
    setViewBox((prev) => {
      const nextW = clamp(prev.w * factor, 260, MAP_WIDTH);
      const nextH = (nextW / MAP_WIDTH) * MAP_HEIGHT;
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      return {
        x: clamp(cx - nextW / 2, 0, MAP_WIDTH - nextW),
        y: clamp(cy - nextH / 2, 0, MAP_HEIGHT - nextH),
        w: nextW,
        h: nextH,
      };
    });
  };

  const handleResetView = () => {
    if (onFocusContinentChange) {
      onFocusContinentChange('Alle');
    }
    setViewBox(CONTINENT_VIEWBOXES.Alle);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startBox: { ...viewBox },
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !containerRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragRef.current.moved = true;
    }
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const svgDx = (dx / rect.width) * dragRef.current.startBox.w;
    const svgDy = (dy / rect.height) * dragRef.current.startBox.h;

    setViewBox({
      x: clamp(
        dragRef.current.startBox.x - svgDx,
        0,
        Math.max(0, MAP_WIDTH - dragRef.current.startBox.w)
      ),
      y: clamp(
        dragRef.current.startBox.y - svgDy,
        0,
        Math.max(0, MAP_HEIGHT - dragRef.current.startBox.h)
      ),
      w: dragRef.current.startBox.w,
      h: dragRef.current.startBox.h,
    });
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const isZoomedIn = viewBox.w < MAP_WIDTH * 0.9;

  return (
    <div
      ref={containerRef}
      data-testid="interactive-world-map"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`wikimedia-world-map relative w-full aspect-[1405/601] max-h-[540px] rounded-3xl border-2 border-[#C5B89B] bg-[#D4ECF4] shadow-[0_5px_0_#C5B89B] overflow-hidden select-none touch-none ${
        isZoomedIn ? 'cursor-grab active:cursor-grabbing' : ''
      } ${className}`}
    >
      <style>{dynamicCountryStyles}</style>

      {/* Authentic Wikimedia BlankMap-World_gray.svg */}
      <svg
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full block"
        aria-hidden="true"
      >
        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#D4ECF4" />
        <g
          ref={svgLayerRef}
          onClick={handleSvgClick}
          onPointerMove={handleSvgPointerMove}
        />
      </svg>

      {/* Interactive Pin Layer (Exact percentage alignment with BlankMap-World_gray.svg viewBox) */}
      <div className="absolute inset-0 pointer-events-none">
        {props.mode === 'explore' &&
          countries.map((country) => {
            const { x, y } = getCountryMapPosition(country.id);
            const leftPct = ((x - viewBox.x) / viewBox.w) * 100;
            const topPct = ((y - viewBox.y) / viewBox.h) * 100;

            if (leftPct < -3 || leftPct > 103 || topPct < -3 || topPct > 103) {
              return null;
            }

            const isStamped = props.discoveredIds.includes(country.id);
            const isSelected = props.selectedCountryId === country.id;
            const isHovered = hoveredId === country.id;
            const showExpandedFlag =
              isZoomedIn || isHovered || isSelected || countries.length <= 15;

            return (
              <div
                key={country.id}
                style={{
                  left: `${clamp(leftPct, 2, 98)}%`,
                  top: `${clamp(topPct, 4, 96)}%`,
                  zIndex: isHovered || isSelected ? 40 : isStamped ? 15 : 10,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() => props.onSelectCountry(country)}
                  onMouseEnter={() => setHoveredId(country.id)}
                  onMouseLeave={() => setHoveredId((h) => (h === country.id ? null : h))}
                  onFocus={() => setHoveredId(country.id)}
                  onBlur={() => setHoveredId((h) => (h === country.id ? null : h))}
                  aria-label={`${country.name} — Hauptstadt: ${country.capital}${
                    isStamped ? ' (Stempel entdeckt)' : ''
                  }`}
                  className={`group relative flex items-center justify-center transition-transform duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#182B3A] ${
                    showExpandedFlag
                      ? `rounded-lg p-0.5 bg-[#FFFDF7] border-2 shadow-md hover:scale-125 ${
                          isSelected
                            ? 'border-[#E85D3F] scale-120'
                            : isStamped
                            ? 'border-[#15803D]'
                            : 'border-[#182B3A]'
                        }`
                      : `w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 shadow-sm hover:scale-150 ${
                          isStamped
                            ? 'bg-[#15803D] border-[#FFFDF7]'
                            : 'bg-[#FFFDF7] border-[#182B3A]'
                        }`
                  }`}
                >
                  {showExpandedFlag && (
                    <>
                      <div className={isHovered || isSelected ? 'w-9 sm:w-11' : 'w-5 sm:w-6'}>
                        <FlagSvg
                          countryId={country.id}
                          countryName={country.name}
                          revealLabel={false}
                          className="w-full h-auto rounded-sm border-0 shadow-none"
                        />
                      </div>
                      {isStamped && (
                        <span
                          aria-hidden="true"
                          className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#15803D] text-white text-[9px] font-bold flex items-center justify-center border border-white"
                        >
                          ✓
                        </span>
                      )}
                    </>
                  )}
                </button>

                {(isHovered || isSelected) && (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2.5 py-1 rounded-xl bg-[#182B3A] text-[#FFFDF7] text-xs font-bold whitespace-nowrap shadow-md z-50"
                  >
                    {country.name} · {country.capital}
                  </div>
                )}
              </div>
            );
          })}

        {props.mode === 'quiz' && (
          <>
            {props.candidateOptions.map((option, idx) => {
              const { x, y } = getCountryMapPosition(option.id);
              const leftPct = ((x - viewBox.x) / viewBox.w) * 100;
              const topPct = ((y - viewBox.y) / viewBox.h) * 100;

              if (leftPct < 1 || leftPct > 99 || topPct < 2 || topPct > 98) {
                return null;
              }

              const isEliminated = props.eliminatedIds.includes(option.id);
              const isAnswered = props.answeredId !== null;
              const isTarget = option.id === props.targetCountryId;
              const isChosen = props.answeredId === option.id;

              let pinStyle =
                'bg-[#FFFDF7] border-[#182B3A] text-[#182B3A] shadow-[0_3px_0_#182B3A] hover:scale-115 hover:bg-[#FEF3C7] cursor-pointer';
              if (isEliminated && !isAnswered) {
                pinStyle =
                  'bg-[#E2D9C5] border-[#B6AA92] text-[#94A3B8] opacity-40 cursor-not-allowed shadow-none';
              } else if (isAnswered) {
                if (isTarget) {
                  pinStyle =
                    'bg-[#15803D] border-[#14532D] text-white shadow-[0_3px_0_#14532D] scale-115 cursor-default';
                } else if (isChosen) {
                  pinStyle =
                    'bg-[#DC2626] border-[#991B1B] text-white shadow-[0_3px_0_#991B1B] cursor-default';
                } else {
                  pinStyle =
                    'bg-[#F7F3E9] border-[#C9BEA6] text-[#64748B] opacity-75 cursor-default';
                }
              }

              return (
                <div
                  key={option.id}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    zIndex: isTarget && isAnswered ? 35 : 25,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                >
                  <button
                    type="button"
                    data-map-option-index={idx}
                    disabled={isAnswered || isEliminated}
                    onClick={() => props.onSelectOption(option.id)}
                    aria-label={
                      isAnswered
                        ? `Standort ${idx + 1}: ${option.name}`
                        : `Standort ${idx + 1} auf der Weltkarte wählen`
                    }
                    className={`min-w-[38px] h-[38px] sm:min-w-[42px] sm:h-[42px] px-2 rounded-full border-2 font-display font-bold text-base flex items-center justify-center gap-1 transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#182B3A] ${pinStyle}`}
                  >
                    <span>{idx + 1}</span>
                    {isAnswered && isTarget && <span aria-hidden="true">✓</span>}
                    {isAnswered && isChosen && !isTarget && (
                      <span aria-hidden="true">✕</span>
                    )}
                  </button>

                  {isAnswered && (
                    <span
                      className={`pointer-events-none absolute top-full mt-1 px-2 py-0.5 rounded-lg text-[11px] font-extrabold whitespace-nowrap shadow-sm ${
                        leftPct < 15
                          ? 'left-0'
                          : leftPct > 85
                          ? 'right-0'
                          : 'left-1/2 -translate-x-1/2'
                      } ${
                        isTarget
                          ? 'bg-[#14532D] text-white'
                          : 'bg-[#FFFDF7] text-[#182B3A] border border-[#D6CBB5]'
                      }`}
                    >
                      {option.name}
                    </span>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Top-Right Compact Map Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-[#FFFDF7]/95 border border-[#D6CBB5] rounded-xl p-1 shadow-sm">
        <button
          type="button"
          onClick={() => handleZoom(0.72)}
          aria-label="Karte vergrößern"
          title="Vergrößern"
          className="w-8 h-8 rounded-lg hover:bg-[#EFE6D2] font-display font-bold text-lg text-[#182B3A] flex items-center justify-center cursor-pointer"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => handleZoom(1.38)}
          aria-label="Karte verkleinern"
          title="Verkleinern"
          className="w-8 h-8 rounded-lg hover:bg-[#EFE6D2] font-display font-bold text-lg text-[#182B3A] flex items-center justify-center cursor-pointer"
        >
          −
        </button>
        {isZoomedIn && (
          <button
            type="button"
            onClick={handleResetView}
            aria-label="Weltansicht zurücksetzen"
            title="Ganze Welt zeigen"
            className="px-2.5 h-8 rounded-lg bg-[#EFE6D2] hover:bg-[#E2D5B8] font-bold text-xs text-[#182B3A] whitespace-nowrap cursor-pointer"
          >
            Welt
          </button>
        )}
      </div>

      {/* Bottom-Left Subtle Map Helper Caption */}
      <div className="pointer-events-none absolute bottom-2.5 left-3 z-20 hidden sm:block">
        <span className="px-2.5 py-1 rounded-lg bg-[#FFFDF7]/90 border border-[#D6CBB5] text-[11px] font-bold text-[#475569]">
          {props.mode === 'explore'
            ? 'Land oder Flaggen-Pin anklicken zum Entdecken'
            : 'Klicke auf einen der 4 Marker (1–4) oder direkt auf das Land'}
        </span>
      </div>
    </div>
  );
};
