export interface VotexaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

export function VotexaLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  wordmarkClassName = ''
}: VotexaLogoProps) {
  // Dimension definitions
  const sizeMap = {
    sm: { icon: 24, text: 'text-base', gap: 'gap-2' },
    md: { icon: 32, text: 'text-lg', gap: 'gap-2.5' },
    lg: { icon: 44, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 64, text: 'text-3xl', gap: 'gap-4' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const iconSize = currentSize.icon;

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {/* Official Votexa Geometric V-Check Monogram */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="votexaVGradLeft" x1="6" y1="8" x2="24" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <linearGradient id="votexaVGradRight" x1="18" y1="42" x2="44" y2="6" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="60%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>
          <linearGradient id="votexaVGradAccent" x1="16" y1="20" x2="32" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Rounded Container Plate */}
        <rect width="48" height="48" rx="12" fill="url(#votexaVGradLeft)" fillOpacity="0.08" />
        {/* Left downward stroke of the V */}
        <path
          d="M10 12L22 36C22.6 37.2 24.2 37.5 25.1 36.6L27 34.5L16.5 13.5C16.1 12.6 15.1 12 14.1 12H10Z"
          fill="url(#votexaVGradLeft)"
        />
        {/* Right upward check wing of the V */}
        <path
          d="M21.5 35.5L39.2 10.8C39.7 10.1 40.5 9.7 41.3 9.7H43C44.1 9.7 44.7 10.9 44 11.8L25.8 37.2C24.9 38.4 23.1 38.4 22.2 37.2L18.5 32L21.5 27.8L21.5 35.5Z"
          fill="url(#votexaVGradRight)"
        />
        {/* Golden confirmation spark dot */}
        <circle cx="36" cy="12" r="3" fill="url(#votexaVGradAccent)" />
      </svg>

      {showWordmark && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight text-foreground ${currentSize.text} ${wordmarkClassName}`}
            >
              VOTEXA
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
