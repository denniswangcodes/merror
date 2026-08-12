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
    color: '#6F3B12', bg: '#F3E5D3', mobileBg: '#F3E5D3', border: '#D2AF84',
    darkColor: '#F3D7B3', darkBg: '#3B2A1D', darkBorder: '#725136',
  },
  {
    id: 'bright-spark', label: 'Beacon', tagline: 'Kindness people notice', minPoints: 10, nextTierAt: 50,
    color: '#344054', bg: '#E7EAEE', mobileBg: '#E7EAEE', border: '#B6BEC9',
    darkColor: '#EEF1F4', darkBg: '#303741', darkBorder: '#626C79',
  },
  {
    id: 'beacon', label: 'Luminary', tagline: 'A light in your community', minPoints: 50, nextTierAt: 100,
    color: '#694D08', bg: '#F1E6BF', mobileBg: '#F1E6BF', border: '#CDB565',
    darkColor: '#F3E7B9', darkBg: '#403717', darkBorder: '#80703A',
  },
  {
    id: 'luminary', label: 'Solaria', tagline: 'A legacy that keeps shining', minPoints: 100, nextTierAt: null,
    color: '#43346B', bg: 'linear-gradient(118deg, rgba(255,255,255,0.99) 0%, rgba(240,255,253,0.95) 22%, rgba(255,255,255,0.97) 42%, rgba(230,224,254,0.9) 60%, rgba(255,255,255,0.99) 79%, rgba(206,248,242,0.9) 100%)', mobileBg: '#F1F7F8', border: '#A89BE2',
    darkColor: '#FFFFFF', darkBg: 'linear-gradient(118deg, rgba(255,255,255,0.44) 0%, rgba(94,234,212,0.22) 24%, rgba(255,255,255,0.4) 48%, rgba(167,139,250,0.26) 72%, rgba(255,255,255,0.44) 100%)', darkBorder: '#D6D2EC',
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
  ENCOURAGEMENT: {
    label: 'Encouragement', color: '#C2410C', bg: '#FFEDD5', textColor: '#9A3412',
    darkColor: '#FDBA74', darkBg: '#7C2D12', darkTextColor: '#FFEDD5',
  },
  COMMUNITY_SERVICE: {
    label: 'Community Care', color: '#0F766E', bg: '#CCFBF1', textColor: '#115E59',
    darkColor: '#5EEAD4', darkBg: '#134E4A', darkTextColor: '#CCFBF1',
  },
  ENVIRONMENTAL_ACT: {
    label: 'Earth Care', color: '#4D7C0F', bg: '#ECFCCB', textColor: '#3F6212',
    darkColor: '#BEF264', darkBg: '#365314', darkTextColor: '#ECFCCB',
  },
};

// Client-side compression targets and the server-side validation cap share these values so a
// photo that passes compression on web/mobile is guaranteed to pass the API's MaxLength check.
export const MAX_AVATAR_IMAGE_CHARS = 700_000; // ~500KB binary after base64 overhead
export const MAX_REFLECTION_IMAGE_CHARS = 1_800_000; // ~1.3MB binary after base64 overhead
export const IMAGE_VALUE_PATTERN = /^(https?:\/\/\S+|data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*)$/;

export function getAvatarInitials(displayName: string | null, username: string): string {
  const name = displayName || username;
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
