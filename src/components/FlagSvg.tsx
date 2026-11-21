import React, { useState } from 'react';

interface FlagSvgProps {
  countryId: string;
  countryName?: string;
  revealLabel?: boolean;
  className?: string;
}

export const FlagSvg: React.FC<FlagSvgProps> = ({
  countryId,
  countryName,
  revealLabel = false,
  className = 'w-full h-auto',
}) => {
  const [hasError, setHasError] = useState(false);
  const code = countryId.toLowerCase();
  const label =
    revealLabel && countryName ? `Flagge von ${countryName}` : 'Länderflagge';

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={label}
        className={`aspect-[4/3] rounded-lg border border-black/15 bg-[#EFE6D2] flex items-center justify-center font-display font-bold text-xs text-[#475569] shadow-sm select-none ${className}`}
      >
        {countryId.toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={`/flags/${code}.svg`}
      alt={label}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`aspect-[4/3] object-cover rounded-lg border border-black/15 bg-white shadow-sm select-none ${className}`}
    />
  );
};
