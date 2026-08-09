import type { FeedbackType } from './types';

export interface TierInfo {
  label: string;
  color: string;
  bg: string;
  border: string;
  /** Optional dark-mode variants — consumed by apps/web only; apps/mobile has no dark theme. */
  darkColor?: string;
  darkBg?: string;
  darkBorder?: string;
}

export function getTier(points: number): TierInfo {
  if (points >= 100)
    // Premium treatment: dark charcoal + gold, like a foil/verified badge — reads as the
    // top tier at a glance instead of blending in as "just another pastel pill".
    return {
      label: 'Merror Legend',
      color: '#FBBF24',
      bg: '#18181B',
      border: 'rgba(251, 191, 36, 0.4)',
      darkColor: '#FCD34D',
      darkBg: '#27272A',
      darkBorder: 'rgba(252, 211, 77, 0.45)',
    };
  if (points >= 50)
    return {
      label: 'Shining Star',
      color: '#B45309',
      bg: '#FFFBEB',
      border: '#FDE68A',
      darkColor: '#FBBF24',
      darkBg: 'rgba(245, 158, 11, 0.14)',
      darkBorder: 'rgba(245, 158, 11, 0.35)',
    };
  if (points >= 10)
    return {
      label: 'Kind Soul',
      color: '#047857',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      darkColor: '#34D399',
      darkBg: 'rgba(16, 185, 129, 0.14)',
      darkBorder: 'rgba(16, 185, 129, 0.35)',
    };
  return {
    label: 'New Friend',
    color: '#52525B',
    bg: '#F4F4F5',
    border: '#E4E4E7',
    darkColor: '#A1A1AA',
    darkBg: 'rgba(161, 161, 170, 0.12)',
    darkBorder: 'rgba(161, 161, 170, 0.25)',
  };
}

export function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export const FEEDBACK_TYPE_META: Record<
  FeedbackType,
  {
    label: string;
    color: string;
    bg: string;
    textColor: string;
    /** Optional dark-mode variants — consumed by apps/web only; apps/mobile has no dark theme. */
    darkColor?: string;
    darkBg?: string;
    darkTextColor?: string;
  }
> = {
  COMPLIMENT: {
    label: 'Compliment',
    color: '#1D4ED8',
    bg: '#DBEAFE',
    textColor: '#1E40AF',
    darkColor: '#60A5FA',
    darkBg: 'rgba(59, 130, 246, 0.16)',
    darkTextColor: '#93C5FD',
  },
  HELPFUL_ACT: {
    label: 'Helpful Act',
    color: '#15803D',
    bg: '#DCFCE7',
    textColor: '#166534',
    darkColor: '#4ADE80',
    darkBg: 'rgba(34, 197, 94, 0.16)',
    darkTextColor: '#86EFAC',
  },
  MEMORY: {
    label: 'Memory',
    color: '#7E22CE',
    bg: '#F3E8FF',
    textColor: '#6B21A8',
    darkColor: '#C084FC',
    darkBg: 'rgba(168, 85, 247, 0.16)',
    darkTextColor: '#D8B4FE',
  },
};

export function getAvatarInitials(displayName: string | null, username: string): string {
  const name = displayName || username;
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
