'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  const gradientId = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6D5BFF" />
          <stop offset="1" stopColor="#FF7A6B" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradientId})`} />
      <path d="M16 6L22 16H10L16 6Z" fill="white" />
      <path d="M16 26L22 16H10L16 26Z" fill="white" fillOpacity="0.38" />
    </svg>
  );
}

export function Logo({ size = 28, showWordmark = true, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark size={size} />
      {showWordmark && (
        <span
          className="font-display font-bold tracking-tight text-text-primary leading-none"
          style={{ fontSize: size * 0.82 }}
        >
          Merror
        </span>
      )}
    </span>
  );
}
