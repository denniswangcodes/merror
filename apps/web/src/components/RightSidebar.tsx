'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, UserRoundPlus, Users, X } from 'lucide-react';
import { getTierProgress } from '@merror/shared';
import type { FriendshipItem, PublicUser } from '@merror/shared';
import { useAuth } from '@/context/auth.context';
import { friendsApi } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';

type FriendUser = Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl' | 'totalPoints'>;
type FriendshipWithUsers = FriendshipItem & { userA?: FriendUser; userB?: FriendUser };

function personFor(friendship: FriendshipWithUsers, userId?: string): FriendUser | undefined {
  if (friendship.userA?.id === userId) return friendship.userB;
  return friendship.userA;
}

export function RightSidebar({ locale }: { locale: string }) {
  const { user } = useAuth();
  const [friendships, setFriendships] = useState<FriendshipWithUsers[]>([]);
  const [pending, setPending] = useState<FriendshipWithUsers[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const refreshFriends = () => {
      setLoading(true);
      Promise.all([friendsApi.getFriends(), friendsApi.getPending()])
      .then(([friends, requests]) => {
        setFriendships(friends as FriendshipWithUsers[]);
        setPending(requests as FriendshipWithUsers[]);
      })
      .catch(() => {
        setFriendships([]);
        setPending([]);
      })
      .finally(() => setLoading(false));
    };
    refreshFriends();
    window.addEventListener('merror:friends-changed', refreshFriends);
    return () => window.removeEventListener('merror:friends-changed', refreshFriends);
  }, [user]);

  const friends = useMemo(() => [...friendships]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((friendship) => personFor(friendship, user?.id))
    .filter((friend): friend is FriendUser => Boolean(friend)), [friendships, user]);

  const requests = useMemo(() => pending
    .map((friendship) => ({ friendship, person: personFor(friendship, user?.id) }))
    .filter((item): item is { friendship: FriendshipWithUsers; person: FriendUser } => Boolean(item.person)), [pending, user]);

  const handleRequest = async (friendship: FriendshipWithUsers, accept: boolean) => {
    setBusyId(friendship.id);
    try {
      if (accept) {
        await friendsApi.accept(friendship.id);
        setFriendships((current) => [{ ...friendship, status: 'ACCEPTED' }, ...current]);
      } else {
        await friendsApi.remove(friendship.id);
      }
      setPending((current) => current.filter((item) => item.id !== friendship.id));
      window.dispatchEvent(new Event('merror:friends-changed'));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <section className="h-full pb-5">
        {user && <ImpactCard locale={locale} points={user.totalPoints} />}
        <SidebarHeading />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl px-2 py-2">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-16" /></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="h-full pb-5">
      {user && <ImpactCard locale={locale} points={user.totalPoints} />}
      <SidebarHeading />

      {requests.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            Friend requests · {requests.length}
          </p>
          <div className="space-y-1">
            {requests.slice(0, 2).map(({ friendship, person }) => (
              <div key={friendship.id} className="flex items-center gap-2 rounded-xl bg-surface px-2 py-2">
                <Avatar displayName={person.displayName} username={person.username} avatarUrl={person.avatarUrl} size={34} />
                <Link href={`/${locale}/profile/${person.username}`} className="min-w-0 flex-1 truncate text-xs font-semibold text-text-primary no-underline hover:text-accent">
                  {person.displayName || person.username}
                </Link>
                <button disabled={busyId === friendship.id} onClick={() => handleRequest(friendship, true)} aria-label={`Accept ${person.displayName || person.username}'s request`} className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white transition-opacity hover:opacity-85 disabled:opacity-50">
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button disabled={busyId === friendship.id} onClick={() => handleRequest(friendship, false)} aria-label={`Decline ${person.displayName || person.username}'s request`} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface-raised text-text-muted transition-colors hover:text-text-primary disabled:opacity-50">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {friends.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center">
          <UserRoundPlus className="mx-auto h-6 w-6 text-text-muted" />
          <p className="m-0 mt-2 text-sm font-semibold text-text-primary">Build your circle</p>
          <p className="m-0 mt-1 text-xs leading-relaxed text-text-muted">Connect with people you appreciate.</p>
          <Link href={`/${locale}/friends`} className="mt-2 inline-block text-xs font-semibold text-accent no-underline">Find people</Link>
        </div>
      ) : (
        <div className="mb-5 space-y-0.5">
          {friends.slice(0, 6).map((friend) => (
            <div key={friend.id} className="flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-surface">
              <Avatar displayName={friend.displayName} username={friend.username} avatarUrl={friend.avatarUrl} size={34} />
              <Link href={`/${locale}/profile/${friend.username}`} className="min-w-0 flex-1 no-underline">
                <p className="m-0 truncate text-xs font-semibold text-text-primary">{friend.displayName || friend.username}</p>
                <p className="m-0 truncate text-[10px] text-text-muted">{friend.totalPoints} lumens</p>
              </Link>
              <Link href={`/${locale}/give/${friend.id}`} className="rounded-lg border border-border bg-surface-raised px-2.5 py-1 text-[11px] font-semibold text-accent no-underline transition-colors hover:border-border-strong hover:bg-background">
                Reflect
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ImpactCard({ locale, points }: { locale: string; points: number }) {
  const progress = getTierProgress(points);
  return (
    <Link href={`/${locale}/points`} className="mb-5 block rounded-2xl border border-border bg-surface p-3 no-underline transition-colors hover:border-border-strong">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted"><Sparkles className="h-3.5 w-3.5" /> Your impact</span>
        <span className="text-[11px] font-bold text-text-primary">{progress.tier.label}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-background">
        <div className="brand-gradient-bg h-full rounded-full transition-all" style={{ width: `${progress.progress}%` }} />
      </div>
      <p className="m-0 mt-2 text-[11px] text-text-muted">
        {progress.pointsToNext > 0 ? `${progress.pointsToNext} lumens to the next level` : 'Top status achieved'}
      </p>
    </Link>
  );
}

function SidebarHeading() {
  return (
    <div className="mb-3 px-1">
      <h2 className="m-0 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
        <Users className="h-3.5 w-3.5" /> Your Circle
      </h2>
    </div>
  );
}
