import Image from 'next/image';
import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ width = 100, height = 40, className = '' }) => {
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src="/blinkchat.jpg"
        alt="BlinkChat Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
};

export default Logo;
