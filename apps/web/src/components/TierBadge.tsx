import Link from 'next/link';
import { getTier } from '@merror/shared';

export function TierBadge({ points, locale }: { points: number; locale?: string }) {
  const tier = getTier(points);
  const isLegend = points >= 100;

  const inner = (
    <span
      style={{
        background: tier.bg,
        color: tier.color,
        fontSize: 11,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 50,
        letterSpacing: '0.03em',
        display: 'inline-flex',
        alignItems: 'center',
        gap: isLegend ? 4 : 0,
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
      }}
    >
      {isLegend && <span style={{ fontSize: 8, opacity: 0.8 }}>✦</span>}
      {tier.label}
    </span>
  );

  if (locale) {
    return (
      <Link
        href={`/${locale}/points`}
        style={{ textDecoration: 'none' }}
        className="hover:opacity-75 transition-opacity"
      >
        {inner}
      </Link>
    );
  }

  return inner;
}
