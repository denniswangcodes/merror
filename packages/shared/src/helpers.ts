import type { FeedbackType } from './types';

export interface TierInfo {
  id: 'first-light' | 'bright-spark' | 'beacon' | 'luminary';
  label: string;
  tagline: string;
  minPoints: number;
  nextTierAt: number | null;
  color: string;
  bg: string;
  mobileBg: string;
  border: string;
  darkColor?: string;
  darkBg?: string;
  darkBorder?: string;
}

export const TIERS: readonly TierInfo[] = [
  {
    id: 'first-light', label: 'Spark', tagline: 'Every impact starts somewhere', minPoints: 0, nextTierAt: 10,
    color: '#92400E', bg: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)', mobileBg: '#FFF1E3', border: '#D6A06A',
    darkColor: '#FED7AA', darkBg: 'linear-gradient(135deg, #78350F 0%, #451A03 100%)', darkBorder: '#C26A2E',
  },
  {
    id: 'bright-spark', label: 'Beacon', tagline: 'Kindness people notice', minPoints: 10, nextTierAt: 50,
    color: '#475569', bg: 'linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)', mobileBg: '#F1F5F9', border: '#A8B2C1',
    darkColor: '#F1F5F9', darkBg: 'linear-gradient(135deg, #64748B 0%, #334155 100%)', darkBorder: '#94A3B8',
  },
  {
    id: 'beacon', label: 'Luminary', tagline: 'A light in your community', minPoints: 50, nextTierAt: 100,
    color: '#A16207', bg: 'linear-gradient(135deg, #FFFBEB 0%, #FDE68A 100%)', mobileBg: '#FFF7D6', border: '#EAB308',
    darkColor: '#FEF3C7', darkBg: 'linear-gradient(135deg, #A16207 0%, #713F12 100%)', darkBorder: '#EAB308',
  },
  {
    id: 'luminary', label: 'Solaria', tagline: 'A legacy that keeps shining', minPoints: 100, nextTierAt: null,
    color: '#5B21B6', bg: 'linear-gradient(135deg, #ECFEFF 0%, #C4B5FD 48%, #99F6E4 100%)', mobileBg: '#DDFBF7', border: 'rgba(109, 40, 217, 0.48)',
    darkColor: '#ECFEFF', darkBg: 'linear-gradient(135deg, #5B21B6 0%, #0F766E 100%)', darkBorder: '#67E8F9',
  },
] as const;

export function getTier(points: number): TierInfo {
  return [...TIERS].reverse().find((tier) => points >= tier.minPoints) ?? TIERS[0];
}

export function getTierProgress(points: number) {
  const tier = getTier(points);
  if (tier.nextTierAt === null) return { tier, progress: 100, pointsToNext: 0 };
  const span = tier.nextTierAt - tier.minPoints;
  const earned = Math.max(0, points - tier.minPoints);
  return {
    tier,
    progress: Math.min(100, Math.round((earned / span) * 100)),
    pointsToNext: Math.max(0, tier.nextTierAt - points),
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

export function formatReflectionDate(date: Date | string): string {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${month}/${day}/${value.getFullYear()}`;
}

export const FEEDBACK_TYPE_META: Record<FeedbackType, {
  label: string;
  color: string;
  bg: string;
  textColor: string;
  darkColor?: string;
  darkBg?: string;
  darkTextColor?: string;
}> = {
  COMPLIMENT: {
    label: 'Kind Word', color: '#1D4ED8', bg: '#DBEAFE', textColor: '#1E40AF',
    darkColor: '#93C5FD', darkBg: '#1E3A5F', darkTextColor: '#DBEAFE',
  },
  HELPFUL_ACT: {
    label: 'Helping Hand', color: '#15803D', bg: '#DCFCE7', textColor: '#166534',
    darkColor: '#86EFAC', darkBg: '#14532D', darkTextColor: '#DCFCE7',
  },
  MEMORY: {
    label: 'Shared Moment', color: '#7E22CE', bg: '#F3E8FF', textColor: '#6B21A8',
    darkColor: '#D8B4FE', darkBg: '#581C87', darkTextColor: '#F3E8FF',
  },
};

export function getAvatarInitials(displayName: string | null, username: string): string {
  const name = displayName || username;
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
