'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Trophy, Gift, HandHeart, Check, UserRound, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/auth.context';
import { usersApi, friendsApi } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { TierBadge } from '@/components/TierBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type SlimUser = {
  id: string;
  displayName: string | null;
  username: string;
  avatarUrl: string | null;
  totalPoints: number;
};

const SECTION_LABEL = 'text-xs font-semibold text-text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5';

// ─── Profile widget ──────────────────────────────────────────────────────────
function ProfileWidget({ locale }: { locale: string }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="pb-5">
      <p className={SECTION_LABEL}>
        <UserRound className="h-3.5 w-3.5" />
        Profile
      </p>
      <Link href={`/${locale}/profile`} className="flex flex-col items-center text-center no-underline group gap-2">
        <Avatar
          displayName={user.displayName}
          username={user.username}
          avatarUrl={user.avatarUrl}
          size={72}
        />
        <div>
          <p className="font-bold text-base text-text-primary group-hover:text-accent transition-colors m-0 leading-tight">
            {user.displayName || user.username}
          </p>
          <p className="text-xs text-text-muted m-0 mt-0.5">@{user.username}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <TierBadge points={user.totalPoints} />
          <span className="text-xs text-text-secondary font-medium">{user.totalPoints} pts</span>
        </div>
      </Link>
    </div>
  );
}

// ─── Leaderboard widget ───────────────────────────────────────────────────────
const RANK_COLORS = [
  'text-amber-500 dark:text-amber-400',
  'text-zinc-400 dark:text-zinc-500',
  'text-orange-700 dark:text-orange-500',
];

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
      <p className={SECTION_LABEL}>
        <Trophy className="h-3.5 w-3.5" />
        Leaderboard
      </p>
      {loading ? (
        <div className="space-y-2.5 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-5 h-4" />
              <Skeleton className="w-7 h-7 rounded-full" />
              <Skeleton className="flex-1 h-3" />
            </div>
          ))}
        </div>
      ) : (
        <ol className="flex-1 flex flex-col">
          {filledLeaders.map((u, i) => (
            <li key={i} className="flex items-center gap-2 flex-1">
              <span className={cn('w-5 text-xs font-bold text-center shrink-0', i < 3 ? RANK_COLORS[i] : 'text-text-muted')}>
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
                    <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                      {u.displayName || u.username}
                    </p>
                  </div>
                  <span className="text-sm text-text-muted font-medium shrink-0">{u.totalPoints}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-background border border-dashed border-border" />
                  <div className="flex-1 h-2.5 rounded bg-background" />
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
      <p className={SECTION_LABEL}>
        <TrendingUp className="h-3.5 w-3.5" />
        Your week
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-accent/10 rounded-xl p-2.5 text-center flex flex-col items-center gap-0.5">
          <HandHeart className="h-3.5 w-3.5 text-accent" />
          <p className="text-xl font-bold text-accent m-0">
            {stats == null ? '—' : stats.given}
          </p>
          <p className="text-[11px] text-accent/70 font-medium m-0">given</p>
        </div>
        <div className="bg-success/10 rounded-xl p-2.5 text-center flex flex-col items-center gap-0.5">
          <Gift className="h-3.5 w-3.5 text-success" />
          <p className="text-xl font-bold text-success m-0">
            {stats == null ? '—' : stats.received}
          </p>
          <p className="text-[11px] text-success/70 font-medium m-0">received</p>
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
      <p className={SECTION_LABEL}>People you may know</p>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="flex-1 h-3" />
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
                  <p className="text-xs font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                    {u.displayName || u.username}
                  </p>
                  <div className="mt-0.5">
                    <TierBadge points={u.totalPoints} />
                  </div>
                </div>
              </Link>
              <Button
                variant={sent.has(u.id) ? 'secondary' : 'primary'}
                size="sm"
                disabled={sent.has(u.id)}
                onClick={() => handleAdd(u.id)}
                className="shrink-0 px-2.5 py-1 text-[11px]"
              >
                {sent.has(u.id) ? (
                  <>
                    <Check className="h-3 w-3" /> Sent
                  </>
                ) : (
                  'Add'
                )}
              </Button>
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
    <div className="pb-4 h-full flex flex-col gap-1 overflow-y-auto no-scrollbar">
      <ProfileWidget locale={locale} />
      <WeekStatsWidget />
      <LeaderboardWidget locale={locale} />
      <SuggestionsWidget locale={locale} />
    </div>
  );
}
