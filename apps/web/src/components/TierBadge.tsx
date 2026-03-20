import { getTier } from '@merror/shared';

export function TierBadge({ points }: { points: number }) {
  const tier = getTier(points);
  return (
    <span
      style={{
        background: tier.bg,
        color: tier.color,
        border: `1px solid ${tier.border}`,
        fontSize: 11,
        fontWeight: 600,
        padding: '2px 10px',
        borderRadius: 20,
        fontFamily: "'DM Sans', sans-serif",
        display: 'inline-block',
      }}
    >
      {tier.label}
    </span>
  );
}
