'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { TierBadge } from '@/components/TierBadge';
import { Toast } from '@/components/Toast';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth.context';
import { friendsApi } from '@/lib/api';
import type { FriendshipItem, PublicUser } from '@merror/shared';

type FriendUser = Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl' | 'totalPoints'>;

type FriendshipWithUsers = FriendshipItem & {
  userA?: FriendUser;
  userB?: FriendUser;
};

export default function FriendsPage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<'friends' | 'pending'>('friends');
  const [friends, setFriends] = useState<FriendshipWithUsers[]>([]);
  const [pending, setPending] = useState<FriendshipWithUsers[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Search within existing friends (client-side only)
  const [friendSearch, setFriendSearch] = useState('');

  const getFriendUser = (friendship: FriendshipWithUsers): FriendUser | null => {
    if (!user) return null;
    if (friendship.userA?.id === user.id) return friendship.userB || null;
    return friendship.userA || null;
  };

  const filteredFriends = friendSearch.trim()
    ? friends.filter((f) => {
        const u = getFriendUser(f);
        if (!u) return false;
        const q = friendSearch.toLowerCase();
        return (
          (u.displayName || '').toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q)
        );
      })
    : friends;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([friendsApi.getFriends(), friendsApi.getPending()])
      .then(([f, p]) => {
        setFriends(f as FriendshipWithUsers[]);
        setPending(p as FriendshipWithUsers[]);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleAccept = async (friendshipId: string) => {
    try {
      await friendsApi.accept(friendshipId);
      const accepted = pending.find((f) => f.id === friendshipId);
      if (accepted) {
        setFriends((prev) => [...prev, { ...accepted, status: 'ACCEPTED' }]);
        setPending((prev) => prev.filter((f) => f.id !== friendshipId));
      }
      setToast('Friend request accepted!');
    } catch (e) {
      setToast((e as Error).message);
    }
  };

  const handleDecline = async (friendshipId: string) => {
    try {
      await friendsApi.remove(friendshipId);
      setPending((prev) => prev.filter((f) => f.id !== friendshipId));
      setToast('Request declined');
    } catch (e) {
      setToast((e as Error).message);
    }
  };

  if (authLoading) {
    return <div className="px-4 py-8 text-center text-text-muted text-sm">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-text-secondary mb-4">Sign in to see your friends</p>
        <Button onClick={() => router.push(`/${locale}/login`)}>Login</Button>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-8">
      <div className="mb-5">
        <h2 className="font-display text-[22px] font-bold text-text-primary m-0 mb-0.5">
          Your Friends
        </h2>
        <p className="text-sm text-text-muted mt-0 mb-0">Your Merror community</p>
      </div>

      <Input
        type="text"
        value={friendSearch}
        onChange={(e) => setFriendSearch(e.target.value)}
        placeholder="Search your friends…"
      />

      {/* Tabs */}
      <div className="flex border-b border-border mt-4 mb-4">
        <button
          onClick={() => setTab('friends')}
          className={`relative flex-1 py-3 text-[13px] transition-colors ${
            tab === 'friends' ? 'font-bold text-accent' : 'font-normal text-text-muted'
          }`}
        >
          Friends ({friends.length})
          {tab === 'friends' && (
            <motion.span
              layoutId="friends-tab-indicator"
              className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
        <button
          onClick={() => setTab('pending')}
          className={`relative flex-1 py-3 text-[13px] transition-colors ${
            tab === 'pending' ? 'font-bold text-accent' : 'font-normal text-text-muted'
          }`}
        >
          Requests
          {pending.length > 0 && (
            <span className="ml-1.5 bg-danger text-white text-[10px] rounded-full px-1.5 py-0.5">{pending.length}</span>
          )}
          {tab === 'pending' && (
            <motion.span
              layoutId="friends-tab-indicator"
              className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-center text-text-muted text-sm mt-8">Loading...</p>
      ) : tab === 'friends' ? (
        <div>
          {friends.length === 0 ? (
            <div className="flex flex-col items-center gap-3 text-center py-16">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-text-secondary text-sm mb-1">No friends yet</p>
                <p className="text-text-muted text-xs">Use the navbar search to find people and add them</p>
              </div>
            </div>
          ) : filteredFriends.length === 0 ? (
            <p className="text-center text-text-muted text-sm mt-8">No friends match &ldquo;{friendSearch}&rdquo;</p>
          ) : (
            filteredFriends.map((friendship) => {
              const friend = getFriendUser(friendship);
              if (!friend) return null;
              return (
                <Link
                  key={friendship.id}
                  href={`/${locale}/profile/${friend.username}`}
                  className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-3.5 py-3 mb-2.5 no-underline hover:border-border-strong transition-colors"
                >
                  <Avatar displayName={friend.displayName} username={friend.username} avatarUrl={friend.avatarUrl} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-primary m-0 truncate">
                      {friend.displayName || friend.username}
                    </p>
                    <p className="text-xs text-text-muted m-0">@{friend.username}</p>
                  </div>
                  <TierBadge points={friend.totalPoints} />
                </Link>
              );
            })
          )}
        </div>
      ) : (
        <div>
          {pending.length === 0 ? (
            <p className="text-center text-text-muted text-sm mt-8">No pending requests</p>
          ) : (
            pending.map((friendship) => {
              const requester = friendship.userA;
              if (!requester) return null;
              return (
                <div key={friendship.id} className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-3.5 py-3 mb-2.5">
                  <Avatar displayName={requester.displayName} username={requester.username} avatarUrl={requester.avatarUrl} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-primary m-0 truncate">
                      {requester.displayName || requester.username}
                    </p>
                    <p className="text-xs text-text-muted m-0">@{requester.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(friendship.id)}>
                      Accept
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => handleDecline(friendship.id)}>
                      Decline
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
