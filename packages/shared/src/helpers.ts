import type { FeedbackType } from './types';

export interface TierInfo {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export function getTier(points: number): TierInfo {
  if (points >= 100)
    return { label: 'Merror Legend', color: '#92400E', bg: '#FEF3C7', border: '#F59E0B' };
  if (points >= 50)
    return { label: 'Shining Star', color: '#713F12', bg: '#FFFBEB', border: '#EAB308' };
  if (points >= 10)
    return { label: 'Kind Soul', color: '#14532D', bg: '#F0FDF4', border: '#22C55E' };
  return { label: 'New Friend', color: '#374151', bg: '#F9FAFB', border: '#D1D5DB' };
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
  { label: string; color: string; bg: string; textColor: string }
> = {
  COMPLIMENT: { label: 'Compliment', color: '#1D4ED8', bg: '#DBEAFE', textColor: '#1E40AF' },
  HELPFUL_ACT: { label: 'Helpful Act', color: '#15803D', bg: '#DCFCE7', textColor: '#166534' },
  MEMORY: { label: 'Memory', color: '#7E22CE', bg: '#F3E8FF', textColor: '#6B21A8' },
};

export function getAvatarInitials(displayName: string | null, username: string): string {
  const name = displayName || username;
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
