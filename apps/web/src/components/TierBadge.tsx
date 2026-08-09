'use client';

import Link from 'next/link';
import { Star, Crown, type LucideIcon } from 'lucide-react';
import { getTier } from '@merror/shared';
import { useTheme } from '@/context/theme.context';
import { cn } from '@/lib/utils';

const TIER_ICON: Record<string, LucideIcon> = {
  'Shining Star': Star,
  'Merror Legend': Crown,
};

export function TierBadge({ points, locale }: { points: number; locale?: string }) {
  const { theme } = useTheme();
  const tier = getTier(points);
  const isDark = theme === 'dark';
  const isLegend = tier.label === 'Merror Legend';
  const Icon = TIER_ICON[tier.label];

  const inner = (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full text-[10.5px] font-semibold leading-none tracking-wide',
        isLegend && 'shadow-[0_0_10px_-3px_rgba(251,191,36,0.5)]'
      )}
      style={{
        background: isDark ? tier.darkBg ?? tier.bg : tier.bg,
        color: isDark ? tier.darkColor ?? tier.color : tier.color,
        border: `1px solid ${isDark ? tier.darkBorder ?? tier.border : tier.border}`,
        padding: '4px 9px',
      }}
    >
      {Icon && <Icon className="h-2.5 w-2.5 shrink-0" fill="currentColor" strokeWidth={0} />}
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
