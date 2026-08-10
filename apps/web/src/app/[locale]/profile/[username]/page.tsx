'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { FeedCard } from '@/components/FeedCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/Toast';
import { useAuth } from '@/context/auth.context';
import { usersApi, friendsApi } from '@/lib/api';
import type { PublicUser, FeedbackItem, FriendshipItem } from '@merror/shared';

type FriendStatus = 'none' | 'pending' | 'friends';

export default function PublicProfilePage(): JSX.Element {
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
    return <div className="px-4 py-8 text-center text-text-muted text-sm">Loading profile...</div>;
  }

  const received = (profile.feedbackReceived || []) as FeedbackItem[];
  const given = (profile.feedbackGiven || []) as FeedbackItem[];
  const items = tab === 'received' ? received : given;

  const friendBtnVariant = friendStatus === 'friends' ? 'destructive' : friendStatus === 'pending' ? 'secondary' : 'secondary';
  const friendBtnLabel = friendStatus === 'friends' ? 'Remove Friend' : friendStatus === 'pending' ? 'Request Sent' : 'Add Friend';

  return (
    <div className="pb-8">
      <button
        onClick={() => router.back()}
        className="text-accent text-[13px] mt-6 mb-4 flex items-center gap-1 bg-none border-none cursor-pointer p-0 font-medium"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back
      </button>

      <ProfileHeader
        displayName={profile.displayName}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        bio={profile.bio}
        totalPoints={profile.totalPoints}
        locale={locale}
        actions={
          me && me.id !== profile.id && (
            <>
              <Button size="sm" onClick={() => router.push(`/${locale}/give/${profile.id}`)}>
                Give Feedback
              </Button>
              <Button
                variant={friendBtnVariant}
                size="sm"
                disabled={friendStatus === 'pending'}
                onClick={friendStatus !== 'pending' ? handleFriendToggle : undefined}
              >
                {friendBtnLabel}
              </Button>
            </>
          )
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-border mt-8 mb-3.5">
        {(['received', 'given'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 py-3 text-[13px] capitalize transition-colors ${
              tab === t ? 'font-bold brand-gradient-text' : 'font-normal text-text-muted'
            }`}
          >
            {t} ({t === 'received' ? received.length : given.length})
            {tab === t && (
              <motion.span
                layoutId="public-profile-tab-indicator"
                className="brand-gradient-bg absolute left-0 right-0 -bottom-px h-0.5"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      <div>
        {items.length === 0 ? (
          <p className="text-sm text-text-muted text-center mt-8">No public {tab} feedback yet</p>
        ) : (
          items.map((item, index) => <FeedCard key={item.id} item={item} locale={locale} index={index} />)
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
