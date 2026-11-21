import React from 'react';

export const TitleLogoSvg: React.FC<{ className?: string }> = ({
  className = 'w-full max-w-[440px]',
}) => {
  return (
    <svg
      viewBox="0 0 460 128"
      role="img"
      aria-label="Weltreise-Atlas"
      className={className}
    >
      {/* Compass Emblem Badge */}
      <g transform="translate(56, 64)">
        <circle cx="0" cy="0" r="46" fill="#182B3A" />
        <circle cx="0" cy="0" r="40" fill="#FBF7ED" stroke="#D97706" strokeWidth="3" />
        {/* Compass points */}
        <polygon points="0,-32 7,-7 0,0 -7,-7" fill="#E85D3F" />
        <polygon points="0,32 7,7 0,0 -7,7" fill="#182B3A" />
        <polygon points="32,0 7,7 0,0 7,-7" fill="#D97706" />
        <polygon points="-32,0 -7,7 0,0 -7,-7" fill="#4B6A82" />
        <circle cx="0" cy="0" r="5" fill="#FBF7ED" stroke="#182B3A" strokeWidth="2.5" />
      </g>

      {/* Bespoke Display Typography Lockup */}
      <text
        x="118"
        y="62"
        fontFamily="Fredoka, ui-rounded, sans-serif"
        fontWeight="700"
        fontSize="42"
        fill="#182B3A"
        letterSpacing="-0.5"
      >
        Weltreise-Atlas
      </text>

      {/* Decorative underline banner */}
      <path
        d="M120 75 Q240 71 395 76"
        stroke="#E85D3F"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      <text
        x="120"
        y="102"
        fontFamily="Nunito, sans-serif"
        fontWeight="700"
        fontSize="17"
        fill="#475569"
      >
        Flaggen, Länder &amp; Hauptstädte entdecken
      </text>
    </svg>
  );
};
