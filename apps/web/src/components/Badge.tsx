import { FEEDBACK_TYPE_META } from '@merror/shared';
import type { FeedbackType } from '@merror/shared';

export function Badge({ type }: { type: FeedbackType }) {
  const meta = FEEDBACK_TYPE_META[type];
  const classMap: Record<FeedbackType, string> = {
    COMPLIMENT: 'bg-blue-100 text-blue-700',
    HELPFUL_ACT: 'bg-green-100 text-green-700',
    MEMORY: 'bg-purple-100 text-purple-700',
  };

  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${classMap[type]}`}>
      {meta.label}
    </span>
  );
}
