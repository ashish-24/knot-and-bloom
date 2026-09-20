import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'dark' | 'light' | 'colored';
  showSubtitle?: boolean;
}

export default function Logo({ className = '', variant = 'dark', showSubtitle = true }: LogoProps) {
  const textClass =
    variant === 'light' ? 'text-cream-100' : variant === 'colored' ? 'text-brand-800' : 'text-charcoal-900';
  const subtitleClass =
    variant === 'light' ? 'text-cream-300' : variant === 'colored' ? 'text-terracotta-600' : 'text-charcoal-600';
  const strokeClass =
    variant === 'light' ? '#fdfbf7' : variant === 'colored' ? '#425540' : '#1d1b19';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <div className="relative flex items-center">
        {/* SVG Botanical Branch + Wordmark */}
        <svg
          viewBox="0 0 280 80"
          className="h-10 sm:h-12 w-auto overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Sprouting Botanical Branch from the 'K' stem */}
          <path
            d="M 28 55 C 28 35, 20 22, 10 10"
            stroke={strokeClass}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Leaves sprouting off branch */}
          <path
            d="M 16 28 C 10 24, 6 25, 4 30 C 8 34, 14 33, 16 28 Z"
            fill={strokeClass}
          />
          <path
            d="M 20 20 C 14 14, 9 14, 8 20 C 13 22, 18 22, 20 20 Z"
            fill={strokeClass}
          />
          <path
            d="M 10 10 C 6 4, 10 1, 16 2 C 16 8, 14 10, 10 10 Z"
            fill={strokeClass}
          />
          <path
            d="M 24 38 C 30 36, 36 39, 38 44 C 32 45, 26 42, 24 38 Z"
            fill={strokeClass}
          />

          {/* Wordmark: Romi */}
          <text
            x="28"
            y="62"
            fill={strokeClass}
            fontFamily="Playfair Display, Georgia, serif"
            fontSize="54"
            fontWeight="400"
            letterSpacing="1"
          >
            Romi
          </text>

          {/* Ampersand & Knot Accent */}
          <text
            x="170"
            y="42"
            fill={variant === 'colored' ? '#c86847' : strokeClass}
            fontFamily="Inter, sans-serif"
            fontSize="20"
            fontWeight="300"
            fontStyle="italic"
          >
            & Knot
          </text>
        </svg>
      </div>

      {showSubtitle && (
        <span
          className={`text-[8px] sm:text-[9.5px] font-light tracking-[0.08em] uppercase border-t border-b border-current py-0.5 px-1.5 mt-1 max-w-full truncate text-center block ${subtitleClass}`}
        >
          — Romi.ka handcraft With love —
        </span>
      )}
    </div>
  );
}
