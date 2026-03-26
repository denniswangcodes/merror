'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { TierBadge } from '@/components/TierBadge';
import { Toast } from '@/components/Toast';
import { useAuth } from '@/context/auth.context';
import { usersApi, friendsApi } from '@/lib/api';
import { timeAgo } from '@merror/shared';
import type { PublicUser, FeedbackItem, FriendshipItem } from '@merror/shared';

type FriendStatus = 'none' | 'pending' | 'friends';

export default function PublicProfilePage() {
  const params = useParams<{ locale: string; username: string }>();
  const { locale, username } = params;
  const router = useRouter();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState<PublicUser & {
    feedbackReceived?: FeedbackItem[];
    feedbackGiven?: FeedbackItem[];
  } | null>(null);
  const [tab, setTab] = useState<'received' | 'given'>('received');
  const [toast, setToast] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);

  useEffect(() => {
    usersApi.getByUsername(username).then(setProfile).catch(() => router.push(`/${locale}/feed`));
  }, [username, locale, router]);

  useEffect(() => {
    if (!me || !profile) return;
    Promise.all([friendsApi.getFriends(), friendsApi.getPending()])
      .then(([allFriends, pending]) => {
        const friends = allFriends as (FriendshipItem & { userA?: PublicUser; userB?: PublicUser })[];
        const pendings = pending as (FriendshipItem & { userA?: PublicUser; userB?: PublicUser })[];
        const match = friends.find(
          (f) => f.userA?.id === profile.id || f.userB?.id === profile.id,
        );
        if (match) { setFriendStatus('friends'); setFriendshipId(match.id); return; }
        const pendingMatch = pendings.find(
          (f) => f.userA?.id === me.id && f.userB?.id === profile.id,
        );
        if (pendingMatch) { setFriendStatus('pending'); setFriendshipId(pendingMatch.id); }
      })
      .catch(() => {});
  }, [me, profile]);

  const handleFriendToggle = async () => {
    if (!profile) return;
    try {
      if (friendStatus === 'friends' || friendStatus === 'pending') {
        if (friendshipId) await friendsApi.remove(friendshipId);
        setFriendStatus('none');
        setFriendshipId(null);
        setToast(friendStatus === 'friends' ? 'Friend removed' : 'Request cancelled');
      } else {
        const result = await friendsApi.sendRequest(profile.id) as FriendshipItem;
        setFriendStatus('pending');
        setFriendshipId(result?.id ?? null);
        setToast(`Friend request sent to ${profile.displayName || profile.username}!`);
      }
    } catch (e) {
      setToast((e as Error).message);
    }
  };

  if (!profile) {
    return <div className="px-4 py-8 text-center text-gray-400 text-sm">Loading profile...</div>;
  }

  const received = (profile.feedbackReceived || []) as FeedbackItem[];
  const given = (profile.feedbackGiven || []) as FeedbackItem[];
  const items = tab === 'received' ? received : given;

  const friendBtnLabel = friendStatus === 'friends' ? 'Remove Friend' : friendStatus === 'pending' ? 'Request Sent' : 'Add Friend';
  const friendBtnClass = friendStatus === 'friends'
    ? 'bg-white dark:bg-transparent text-red-500 border-[1.5px] border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950'
    : friendStatus === 'pending'
    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-[1.5px] border-gray-200 dark:border-gray-700 cursor-default'
    : 'bg-white dark:bg-transparent text-indigo-600 dark:text-indigo-400 border-[1.5px] border-indigo-600 dark:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950';

  return (
    <div className="pb-8">
      <button
        onClick={() => router.back()}
        className="text-indigo-600 text-[13px] mt-6 mb-4 flex items-center gap-1 bg-none border-none cursor-pointer p-0"
      >
        ← Back
      </button>

      <div className="pt-2 text-center lg:text-left lg:flex lg:items-start lg:gap-8">
        <div className="flex justify-center lg:justify-start mb-3 lg:mb-0 lg:flex-shrink-0">
          <Avatar displayName={profile.displayName} username={profile.username} avatarUrl={profile.avatarUrl} size={80} />
        </div>
        <div className="flex-1">
          <h2 className="text-gray-900 dark:text-white" style={{ fontSize: 22, fontWeight: 700, margin: '0 0 2px' }}>
            {profile.displayName || profile.username}
          </h2>
          <p className="text-[13px] text-gray-500 mt-0 mb-2">@{profile.username}</p>
          {profile.bio && <p className="text-[14px] text-gray-600 mb-3">{profile.bio}</p>}

          <div className="flex justify-center lg:justify-start items-center gap-2.5 mb-4">
            <span className="font-bold text-xl text-indigo-600">{profile.totalPoints}</span>
            <span className="text-xs text-gray-400">points</span>
            <TierBadge points={profile.totalPoints} />
          </div>

          {me && me.id !== profile.id && (
            <div className="flex gap-2.5 mb-5 justify-center lg:justify-start">
              <button
                onClick={() => router.push(`/${locale}/give/${profile.id}`)}
                className="bg-indigo-600 text-white border-none rounded-[10px] px-5 py-2.5 font-semibold text-[13px] cursor-pointer hover:bg-indigo-700 transition-colors"
              >
                Give Feedback
              </button>
              <button
                onClick={friendStatus !== 'pending' ? handleFriendToggle : undefined}
                className={`rounded-[10px] px-5 py-2.5 font-semibold text-[13px] transition-colors ${friendBtnClass}`}
              >
                {friendBtnLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-3.5">
        {(['received', 'given'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-3 border-none bg-none cursor-pointer text-[13px] capitalize"
            style={{
              borderBottom: `2px solid ${tab === t ? '#4F46E5' : 'transparent'}`,
              fontWeight: tab === t ? 700 : 400,
              color: tab === t ? '#4F46E5' : '#6B7280',
            }}
          >
            {t} ({t === 'received' ? received.length : given.length})
          </button>
        ))}
      </div>

      <div>
        {items.length === 0 ? (
          <p className="text-[14px] text-gray-400 text-center mt-8">No public {tab} feedback yet</p>
        ) : (
          items.map((item) => {
            const other = tab === 'received'
              ? (item as FeedbackItem & { giver?: PublicUser }).giver
              : (item as FeedbackItem & { receiver?: PublicUser }).receiver;
            return (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-[14px] border border-gray-200 dark:border-gray-800 p-3.5 mb-2.5">
                <div className="flex items-center gap-2 mb-2">
                  {other && (
                    <Link href={`/${locale}/profile/${other.username}`} className="flex items-center gap-2 no-underline">
                      <Avatar displayName={other.displayName} username={other.username} avatarUrl={other.avatarUrl} size={28} />
                      <span className="font-semibold text-[13px] text-gray-700 dark:text-gray-300">{other.displayName || other.username}</span>
                    </Link>
                  )}
                  <Badge type={item.type} />
                  <span className="text-[11px] text-gray-400 ml-auto">{timeAgo(item.createdAt)}</span>
                </div>
                <p className="text-[14px] text-gray-700 dark:text-gray-300 m-0 leading-relaxed">
                  &ldquo;{item.message}&rdquo;
                </p>
              </div>
            );
          })
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
