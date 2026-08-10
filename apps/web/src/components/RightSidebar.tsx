'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, UserRoundPlus } from 'lucide-react';
import { useAuth } from '@/context/auth.context';
import { friendsApi } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import type { FriendshipItem, PublicUser } from '@merror/shared';

type FriendUser = Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl' | 'totalPoints'>;
type FriendshipWithUsers = FriendshipItem & { userA?: FriendUser; userB?: FriendUser };

export function RightSidebar({ locale }: { locale: string }) {
  const { user } = useAuth();
  const [friendships, setFriendships] = useState<FriendshipWithUsers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    friendsApi.getFriends()
      .then((data) => setFriendships(data as FriendshipWithUsers[]))
      .catch(() => setFriendships([]))
      .finally(() => setLoading(false));
  }, [user]);

  const friends = useMemo(() => friendships.map((friendship) => {
    if (friendship.userA?.id === user?.id) return friendship.userB;
    return friendship.userA;
  }).filter((friend): friend is FriendUser => Boolean(friend)), [friendships, user]);

  return (
    <section className="h-full pb-5">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <h2 className="m-0 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
          <Users className="h-3.5 w-3.5" /> Friends
        </h2>
        <Link href={`/${locale}/friends`} className="text-[11px] font-semibold text-text-muted no-underline hover:text-text-primary transition-colors">View all</Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl px-2 py-2">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      ) : friends.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center">
          <UserRoundPlus className="mx-auto h-6 w-6 text-text-muted" />
          <p className="m-0 mt-2 text-sm font-semibold text-text-primary">Build your circle</p>
          <Link href={`/${locale}/friends`} className="mt-1 inline-block text-xs font-medium text-accent no-underline">Find friends</Link>
        </div>
      ) : (
        <div className="space-y-0.5">
          {friends.slice(0, 12).map((friend) => (
            <Link
              key={friend.id}
              href={`/${locale}/profile/${friend.username}`}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 no-underline transition-colors hover:bg-surface"
            >
              <Avatar displayName={friend.displayName} username={friend.username} avatarUrl={friend.avatarUrl} size={38} />
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate text-sm font-semibold text-text-primary">{friend.displayName || friend.username}</p>
                <p className="m-0 truncate text-[11px] text-text-muted">@{friend.username}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
