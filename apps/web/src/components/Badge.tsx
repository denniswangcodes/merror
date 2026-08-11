'use client';

import { FEEDBACK_TYPE_META } from '@merror/shared';
import type { FeedbackType } from '@merror/shared';
import { useTheme } from '@/context/theme.context';
import { Heart, HandHeart, Camera, MessageCircleHeart, Users, Leaf, type LucideIcon } from 'lucide-react';

const ICONS: Record<FeedbackType, LucideIcon> = {
  COMPLIMENT: Heart,
  HELPFUL_ACT: HandHeart,
  MEMORY: Camera,
  ENCOURAGEMENT: MessageCircleHeart,
  COMMUNITY_SERVICE: Users,
  ENVIRONMENTAL_ACT: Leaf,
};

export function Badge({ type }: { type: FeedbackType }) {
  const { theme } = useTheme();
  const meta = FEEDBACK_TYPE_META[type];
  const isDark = theme === 'dark';
  const Icon = ICONS[type];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.06em] whitespace-nowrap ring-1 ring-inset ring-current/15"
      style={{
        background: isDark ? meta.darkBg ?? meta.bg : meta.bg,
        color: isDark ? meta.darkTextColor ?? meta.textColor : meta.textColor,
      }}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} />
      {meta.label}
    </span>
  );
}
