'use client';

import Link from 'next/link';
import { getTier } from '@merror/shared';
import { useTheme } from '@/context/theme.context';

export function TierBadge({ points, locale }: { points: number; locale?: string }) {
  const { theme } = useTheme();
  const tier = getTier(points);
  const isDark = theme === 'dark';
  const isSolaria = tier.id === 'luminary';
  const isLuminary = tier.id === 'beacon';
  const tierEffect = isSolaria
    ? 'backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_7px_rgba(255,255,255,0.9),0_0_14px_rgba(94,234,212,0.48),0_0_22px_rgba(167,139,250,0.38)] before:absolute before:inset-y-0 before:left-[-45%] before:w-[38%] before:skew-x-[-18deg] before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent before:content-[""] hover:before:left-[115%] before:transition-[left] before:duration-700'
    : isLuminary
      ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_0_7px_rgba(234,179,8,0.34),0_3px_12px_rgba(161,98,7,0.18)]'
      : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]';

  const inner = (
    <span
      className={`relative inline-flex items-center overflow-hidden whitespace-nowrap rounded-full text-xs font-semibold leading-none tracking-[-0.01em] transition-all duration-200 ${tierEffect}`}
      style={{
        background: isDark ? tier.darkBg ?? tier.bg : tier.bg,
        color: isDark ? tier.darkColor ?? tier.color : tier.color,
        border: `1px solid ${isDark ? tier.darkBorder ?? tier.border : tier.border}`,
        padding: '7px 12px',
      }}
    >
      {tier.label}
    </span>
  );

  if (locale) {
    return (
      <Link href={`/${locale}/points`} className="no-underline hover:opacity-80 transition-opacity">
        {inner}
      </Link>
    );
  }

  return inner;
}
