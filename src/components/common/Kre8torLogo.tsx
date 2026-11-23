'use client';

import React from 'react';

interface Kre8torLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Kre8torLogo: React.FC<Kre8torLogoProps> = ({
  size = 'md',
  className = '',
  onClick,
}) => {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none cursor-pointer tracking-tight font-bold text-white ${textSizes[size]} ${className}`}
    >
      <span className="font-serif italic font-black tracking-normal text-white hover:opacity-90 transition-opacity">
        Creator
      </span>
    </div>
  );
};

export default Kre8torLogo;
