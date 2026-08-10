'use client';

import Link from 'next/link';
import { Sparkles, Zap, Sun, Gem, type LucideIcon } from 'lucide-react';
import { getTier } from '@merror/shared';
import { useTheme } from '@/context/theme.context';
import { cn } from '@/lib/utils';

const TIER_ICON: Record<string, LucideIcon> = {
  'first-light': Sparkles,
  'bright-spark': Zap,
  beacon: Sun,
  luminary: Gem,
};

export function TierBadge({ points, locale }: { points: number; locale?: string }) {
  const { theme } = useTheme();
  const tier = getTier(points);
  const isDark = theme === 'dark';
  const isLegend = tier.id === 'luminary';
  const Icon = TIER_ICON[tier.id];

  const inner = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg text-[10px] font-extrabold uppercase leading-none tracking-[0.08em] transition-all duration-200',
        isLegend ? 'shadow-[0_0_16px_-4px_rgba(251,191,36,0.7)]' : 'shadow-sm'
      )}
      style={{
        background: isDark ? tier.darkBg ?? tier.bg : tier.bg,
        color: isDark ? tier.darkColor ?? tier.color : tier.color,
        border: `1px solid ${isDark ? tier.darkBorder ?? tier.border : tier.border}`,
        padding: '5px 9px 5px 7px',
      }}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded bg-current/10">
        <Icon className="h-2.5 w-2.5 shrink-0" fill={tier.id === 'beacon' ? 'currentColor' : 'none'} strokeWidth={2.5} />
      </span>
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
