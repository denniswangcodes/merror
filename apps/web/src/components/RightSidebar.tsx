'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth.context';
import { usersApi, friendsApi } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { TierBadge } from '@/components/TierBadge';

type SlimUser = {
  id: string;
  displayName: string | null;
  username: string;
  avatarUrl: string | null;
  totalPoints: number;
};

// ─── Profile widget ──────────────────────────────────────────────────────────
function ProfileWidget({ locale }: { locale: string }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="pb-5">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">Profile</p>
      <Link href={`/${locale}/profile`} className="flex flex-col items-center text-center no-underline group gap-2">
        <Avatar
          displayName={user.displayName}
          username={user.username}
          avatarUrl={user.avatarUrl}
          size={72}
        />
        <div>
          <p className="font-bold text-base text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors m-0 leading-tight">
            {user.displayName || user.username}
          </p>
          <p className="text-xs text-gray-400 m-0 mt-0.5">@{user.username}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <TierBadge points={user.totalPoints} locale={locale} />
          <span className="text-xs text-gray-500 font-medium">{user.totalPoints} pts</span>
        </div>
      </Link>
    </div>
  );
}

// ─── Leaderboard widget ───────────────────────────────────────────────────────
function LeaderboardWidget({ locale }: { locale: string }) {
  const [leaders, setLeaders] = useState<SlimUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getLeaderboard()
      .then((data) => setLeaders(data.slice(0, 5)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const SLOTS = 5;
  const filledLeaders = loading ? [] : [
    ...leaders,
    ...Array.from({ length: Math.max(0, SLOTS - leaders.length) }, (_, i) => null as SlimUser | null),
  ];

  return (
    <div className="py-4 flex-1 flex flex-col">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
        Leaderboard
      </p>
      {loading ? (
        <div className="space-y-2.5 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="w-5 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="w-7 h-7 bg-gray-100 dark:bg-gray-800 rounded-full" />
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <ol className="flex-1 flex flex-col">
          {filledLeaders.map((u, i) => (
            <li key={i} className="flex items-center gap-2 flex-1">
              <span className={`w-5 text-xs font-bold text-center shrink-0 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-300'}`}>
                {i + 1}
              </span>
              {u ? (
                <Link href={`/${locale}/profile/${u.username}`} className="flex items-center gap-2 flex-1 min-w-0 group">
                  <Avatar
                    displayName={u.displayName}
                    username={u.username}
                    avatarUrl={u.avatarUrl}
                    size={34}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 transition-colors">
                      {u.displayName || u.username}
                    </p>
                  </div>
                  <span className="text-sm text-gray-400 font-medium shrink-0">{u.totalPoints}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700" />
                  <div className="flex-1 h-2.5 rounded bg-gray-50 dark:bg-gray-800" />
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ─── Your week widget ─────────────────────────────────────────────────────────
function WeekStatsWidget() {
  const [stats, setStats] = useState<{ given: number; received: number } | null>(null);

  useEffect(() => {
    usersApi.getMyStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="py-4 flex flex-col">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
        Your week
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-indigo-50 dark:bg-indigo-950 rounded-xl p-2.5 text-center">
          <p className="text-xl font-bold text-indigo-600">
            {stats == null ? '—' : stats.given}
          </p>
          <p className="text-[11px] text-indigo-400 font-medium mt-0.5">given</p>
        </div>
        <div className="bg-teal-50 dark:bg-teal-950 rounded-xl p-2.5 text-center">
          <p className="text-xl font-bold text-teal-600">
            {stats == null ? '—' : stats.received}
          </p>
          <p className="text-[11px] text-teal-400 font-medium mt-0.5">received</p>
        </div>
      </div>
    </div>
  );
}

// ─── People you may know widget ───────────────────────────────────────────────
function SuggestionsWidget({ locale }: { locale: string }) {
  const [suggestions, setSuggestions] = useState<SlimUser[]>([]);
  const [sent, setSent] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.getSuggestions()
      .then(setSuggestions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = useCallback(async (id: string) => {
    try {
      await friendsApi.sendRequest(id);
      setSent((prev) => new Set(prev).add(id));
    } catch {
      // already sent or error — still mark as sent to prevent double-tap
      setSent((prev) => new Set(prev).add(id));
    }
  }, []);

  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="py-4">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
        People you may know
      </p>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full" />
              <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((u) => (
            <div key={u.id} className="flex items-center gap-2">
              <Link href={`/${locale}/profile/${u.username}`} className="flex items-center gap-2 flex-1 min-w-0 group">
                <Avatar
                  displayName={u.displayName}
                  username={u.username}
                  avatarUrl={u.avatarUrl}
                  size={32}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-indigo-600 transition-colors">
                    {u.displayName || u.username}
                  </p>
                  <div className="mt-0.5">
                    <TierBadge points={u.totalPoints} />
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleAdd(u.id)}
                disabled={sent.has(u.id)}
                className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all ${
                  sent.has(u.id)
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-default'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                }`}
              >
                {sent.has(u.id) ? 'Sent' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Right sidebar ────────────────────────────────────────────────────────────
export function RightSidebar({ locale }: { locale: string }) {
  return (
    <div className="pb-4 h-full flex flex-col divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto no-scrollbar">
      <ProfileWidget locale={locale} />
      <WeekStatsWidget />
      <LeaderboardWidget locale={locale} />
      <SuggestionsWidget locale={locale} />
    </div>
  );
}
