'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import { TierBadge } from '@/components/TierBadge';
import { Toast } from '@/components/Toast';
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
    return <div className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">Sign in to see your friends</p>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-8">
      <div className="mb-5">
        <h2 className="text-gray-900 dark:text-white" style={{ fontSize: 22, fontWeight: 700, margin: '0 0 2px' }}>
          Friends
        </h2>
        <p className="text-sm text-gray-500 mt-0 mb-0">Your Merror community</p>
      </div>

      <input
        type="text"
        value={friendSearch}
        onChange={(e) => setFriendSearch(e.target.value)}
        placeholder="Search your friends…"
        className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-base text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 outline-none box-border focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition"
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mt-4 mb-4">
        <button
          onClick={() => setTab('friends')}
          className="flex-1 py-3 border-none bg-none cursor-pointer text-[13px]"
          style={{
            borderBottom: `2px solid ${tab === 'friends' ? '#4F46E5' : 'transparent'}`,
            fontWeight: tab === 'friends' ? 700 : 400,
            color: tab === 'friends' ? '#4F46E5' : '#6B7280',
          }}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setTab('pending')}
          className="flex-1 py-3 border-none bg-none cursor-pointer text-[13px] relative"
          style={{
            borderBottom: `2px solid ${tab === 'pending' ? '#4F46E5' : 'transparent'}`,
            fontWeight: tab === 'pending' ? 700 : 400,
            color: tab === 'pending' ? '#4F46E5' : '#6B7280',
          }}
        >
          Requests
          {pending.length > 0 && (
            <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{pending.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 text-sm mt-8">Loading...</p>
      ) : tab === 'friends' ? (
        <div>
          {friends.length === 0 ? (
            <div className="text-center mt-10">
              <p className="text-gray-400 text-sm mb-1">No friends yet</p>
              <p className="text-gray-300 text-xs">Use the navbar search to find people and add them</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-8">No friends match &ldquo;{friendSearch}&rdquo;</p>
          ) : (
            filteredFriends.map((friendship) => {
              const friend = getFriendUser(friendship);
              if (!friend) return null;
              return (
                <Link
                  key={friendship.id}
                  href={`/${locale}/profile/${friend.username}`}
                  className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[14px] px-3.5 py-3 mb-2.5 no-underline"
                >
                  <Avatar displayName={friend.displayName} username={friend.username} avatarUrl={friend.avatarUrl} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 m-0 truncate">
                      {friend.displayName || friend.username}
                    </p>
                    <p className="text-[12px] text-gray-500 m-0">@{friend.username}</p>
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
            <p className="text-center text-gray-400 text-sm mt-8">No pending requests</p>
          ) : (
            pending.map((friendship) => {
              const requester = friendship.userA;
              if (!requester) return null;
              return (
                <div key={friendship.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[14px] px-3.5 py-3 mb-2.5">
                  <Avatar displayName={requester.displayName} username={requester.username} avatarUrl={requester.avatarUrl} size={44} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 dark:text-gray-200 m-0 truncate">
                      {requester.displayName || requester.username}
                    </p>
                    <p className="text-[12px] text-gray-500 m-0">@{requester.username}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(friendship.id)}
                      className="bg-indigo-600 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(friendship.id)}
                      className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[12px] font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer"
                    >
                      Decline
                    </button>
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
