export type LogoVariant = 'geometric-v' | 'shield-check' | 'dynamic-bars';

export interface VotexaLogoProps {
  variant?: LogoVariant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

export function VotexaLogo({
  variant = 'geometric-v',
  size = 'md',
  showWordmark = true,
  className = '',
  wordmarkClassName = ''
}: VotexaLogoProps) {
  // Dimensions
  const sizeMap = {
    sm: { icon: 24, text: 'text-base', gap: 'gap-2' },
    md: { icon: 32, text: 'text-lg', gap: 'gap-2.5' },
    lg: { icon: 44, text: 'text-2xl', gap: 'gap-3' },
    xl: { icon: 64, text: 'text-3xl', gap: 'gap-4' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const iconSize = currentSize.icon;

  const renderIcon = () => {
    switch (variant) {
      /* ======================================================================
         OPTION 1: THE GEOMETRIC V-CHECK (CIVIC MONOGRAM)
         Crisp, high-tech monogram fusing the letter 'V' and an official checkmark
         ====================================================================== */
      case 'geometric-v':
        return (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 drop-shadow-sm"
          >
            <defs>
              <linearGradient id="vGradLeft" x1="6" y1="8" x2="24" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="vGradRight" x1="18" y1="42" x2="44" y2="6" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="60%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
              <linearGradient id="vGradAccent" x1="16" y1="20" x2="32" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            {/* Background pill / squircle container */}
            <rect width="48" height="48" rx="12" fill="url(#vGradLeft)" fillOpacity="0.08" />
            {/* Left downward arm of the V */}
            <path
              d="M10 12L22 36C22.6 37.2 24.2 37.5 25.1 36.6L27 34.5L16.5 13.5C16.1 12.6 15.1 12 14.1 12H10Z"
              fill="url(#vGradLeft)"
            />
            {/* Right upward check wing of the V */}
            <path
              d="M21.5 35.5L39.2 10.8C39.7 10.1 40.5 9.7 41.3 9.7H43C44.1 9.7 44.7 10.9 44 11.8L25.8 37.2C24.9 38.4 23.1 38.4 22.2 37.2L18.5 32L21.5 27.8L21.5 35.5Z"
              fill="url(#vGradRight)"
            />
            {/* Embedded checkmark tick accent dot / spark */}
            <circle cx="36" cy="12" r="3" fill="url(#vGradAccent)" />
          </svg>
        );

      /* ======================================================================
         OPTION 2: THE TRUST SHIELD (CRYPTOGRAPHIC SECURITY & BALLOT)
         A sleek cryptographic shield with an integrated golden check ballot
         ====================================================================== */
      case 'shield-check':
        return (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 drop-shadow-sm"
          >
            <defs>
              <linearGradient id="shieldGrad" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
              <linearGradient id="shieldBorder" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
              <linearGradient id="shieldGold" x1="14" y1="24" x2="36" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            {/* Outer Shield Shell */}
            <path
              d="M24 5L38 10.5V22C38 31.5 32 39.5 24 43C16 39.5 10 31.5 10 22V10.5L24 5Z"
              fill="url(#shieldGrad)"
              stroke="url(#shieldBorder)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Top Ballot Slot */}
            <rect x="18" y="14" width="12" height="2.5" rx="1.25" fill="#64748B" />
            {/* Golden Checkmark / Ballot Mark */}
            <path
              d="M17 25.5L22 30.5L32 19.5"
              stroke="url(#shieldGold)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );

      /* ======================================================================
         OPTION 3: THE DYNAMIC PULSE (TALLY BARS & VICTORY PODIUM)
         Ascending tally columns forming a modern 'V' silhouette and results podium
         ====================================================================== */
      case 'dynamic-bars':
      default:
        return (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 drop-shadow-sm"
          >
            <defs>
              <linearGradient id="barBlue" x1="11" y1="18" x2="11" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="barIndigo" x1="24" y1="12" x2="24" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818CF8" />
                <stop offset="100%" stopColor="#4F46E5" />
              </linearGradient>
              <linearGradient id="barAmber" x1="37" y1="6" x2="37" y2="38" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="#1E293B" fillOpacity="0.05" />
            {/* Bar 1 (Left - 18px) */}
            <rect x="7" y="20" width="8" height="18" rx="4" fill="url(#barBlue)" />
            {/* Bar 2 (Middle - 26px) */}
            <rect x="20" y="12" width="8" height="26" rx="4" fill="url(#barIndigo)" />
            {/* Bar 3 (Right - 32px Victory Bar) */}
            <rect x="33" y="6" width="8" height="32" rx="4" fill="url(#barAmber)" />
            {/* Star badge atop the winning bar */}
            <circle cx="37" cy="6" r="3" fill="#FDE68A" />
          </svg>
        );
    }
  };

  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      {renderIcon()}
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
