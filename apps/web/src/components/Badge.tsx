'use client';

import { FEEDBACK_TYPE_META } from '@merror/shared';
import type { FeedbackType } from '@merror/shared';
import { useTheme } from '@/context/theme.context';

export function Badge({ type }: { type: FeedbackType }) {
  const { theme } = useTheme();
  const meta = FEEDBACK_TYPE_META[type];
  const isDark = theme === 'dark';

  return (
    <span
      className="text-xs font-semibold px-2.5 py-0.5 rounded-md whitespace-nowrap"
      style={{
        background: isDark ? meta.darkBg ?? meta.bg : meta.bg,
        color: isDark ? meta.darkTextColor ?? meta.textColor : meta.textColor,
      }}
    >
      {meta.label}
    </span>
  );
}
