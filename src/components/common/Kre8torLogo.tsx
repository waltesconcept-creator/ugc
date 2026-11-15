'use client';

import React from 'react';

interface Kre8torLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
}

export const Kre8torIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ${className}`}
    >
      <defs>
        {/* Dynamic Electric Orange & Amber Gradients */}
        <linearGradient id="kre8tor-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff7a00" />
          <stop offset="50%" stopColor="#ff5500" />
          <stop offset="100%" stopColor="#d93800" />
        </linearGradient>
        <linearGradient id="kre8tor-grad-secondary" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffb020" />
          <stop offset="100%" stopColor="#ff5500" />
        </linearGradient>
        <linearGradient id="kre8tor-grad-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#262626" />
          <stop offset="100%" stopColor="#0f0f0f" />
        </linearGradient>
        <filter id="kre8tor-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded container with dark glass finish & subtle orange border */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="13"
        fill="url(#kre8tor-grad-dark)"
        stroke="rgba(255, 107, 0, 0.35)"
        strokeWidth="1.5"
      />

      {/* Glow backing */}
      <g filter="url(#kre8tor-glow)" opacity="0.35">
        <path
          d="M24 10C19.5 10 16 13.5 16 18C16 21.5 19 23.5 24 25.5C29 27.5 32 29.5 32 33C32 37.5 28.5 41 24 41C19.5 41 16 37.5 16 33"
          stroke="#ff6b00"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* Interlocking Futuristic '8' / Infinity Loop for KRE8TOR */}
      {/* Top Loop */}
      <circle
        cx="24"
        cy="18"
        r="7"
        stroke="url(#kre8tor-grad-primary)"
        strokeWidth="3.8"
        strokeLinecap="round"
      />

      {/* Bottom Loop */}
      <circle
        cx="24"
        cy="31"
        r="8"
        stroke="url(#kre8tor-grad-secondary)"
        strokeWidth="3.8"
        strokeLinecap="round"
      />

      {/* Central Nexus Intersection Core */}
      <circle cx="24" cy="24.5" r="2.2" fill="#ffffff" />

      {/* Creative Spark Accent at Upper-Right Apex */}
      <polygon
        points="34,11 35.5,14.5 39,16 35.5,17.5 34,21 32.5,17.5 29,16 32.5,14.5"
        fill="#ffb020"
      />
    </svg>
  );
};

export const Kre8torLogo: React.FC<Kre8torLogoProps> = ({
  size = 'md',
  showWordmark = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 26,
    md: 32,
    lg: 40,
    xl: 52,
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <Kre8torIcon size={iconSizes[size]} />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-wider text-white ${textSizes[size]}`}>
            KRE<span className="text-orange-500 drop-shadow-[0_0_12px_rgba(255,107,0,0.5)]">8</span>TOR
          </div>
          {size !== 'sm' && (
            <span className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase mt-0.5">
              Creator Network
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Kre8torLogo;
