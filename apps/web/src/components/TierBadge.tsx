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
    ? 'backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_0_7px_rgba(94,234,212,0.4),0_0_14px_rgba(167,139,250,0.32),0_0_26px_rgba(255,255,255,0.85)] before:absolute before:inset-y-0 before:left-[-45%] before:w-[38%] before:skew-x-[-18deg] before:bg-gradient-to-r before:from-transparent before:via-white/80 before:to-transparent before:content-[""] hover:before:left-[115%] before:transition-[left] before:duration-700'
    : isLuminary
      ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_0_8px_rgba(255,241,196,0.95),0_0_16px_rgba(250,204,21,0.55),0_0_26px_rgba(202,138,4,0.4)]'
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
