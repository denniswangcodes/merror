'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserRound } from 'lucide-react';
import { FeedCard } from '@/components/FeedCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/Toast';
import { SafetyMenu } from '@/components/SafetyMenu';
import { useAuth } from '@/context/auth.context';
import { usersApi, friendsApi } from '@/lib/api';
import type { PublicUser, FeedbackItem, FriendshipItem } from '@merror/shared';

type FriendStatus = 'none' | 'pending' | 'friends';

export default function PublicProfilePage(): JSX.Element {
  const params = useParams<{ locale: string; username: string }>();
  const { locale, username } = params;
  const router = useRouter();
  const { user: me, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<PublicUser & {
    feedbackReceived?: FeedbackItem[];
    feedbackGiven?: FeedbackItem[];
  } | null>(null);
  const [tab, setTab] = useState<'received' | 'given'>('received');
  const [toast, setToast] = useState<string | null>(null);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [friendshipId, setFriendshipId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !me) return;
    usersApi.getByUsername(username).then(setProfile).catch(() => router.push(`/${locale}/feed`));
  }, [username, locale, router, authLoading, !!me]);

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

  if (!authLoading && !me) {
    return (
      <div className="flex flex-col items-center px-4 py-16 text-center">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
          <UserRound className="h-9 w-9 text-accent" />
        </div>
        <h1 className="m-0 font-display text-xl font-bold text-text-primary">@{username} is on Merror</h1>
        <p className="mt-2 max-w-xs text-sm text-text-muted">
          Join Merror to see their profile — you&apos;ll automatically connect with each other.
        </p>
        <div className="mt-6 flex gap-2">
          <Button size="md" onClick={() => router.push(`/${locale}/signup?ref=${encodeURIComponent(username)}`)}>
            Sign up &amp; connect
          </Button>
          <Button variant="secondary" size="md" onClick={() => router.push(`/${locale}/login?ref=${encodeURIComponent(username)}`)}>
            Log in
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="px-4 py-8 text-center text-text-muted text-sm">Loading profile...</div>;
  }

  const received = (profile.feedbackReceived || []) as FeedbackItem[];
  const given = (profile.feedbackGiven || []) as FeedbackItem[];
  const items = tab === 'received' ? received : given;

  const friendBtnVariant = friendStatus === 'friends' ? 'destructive' : friendStatus === 'pending' ? 'secondary' : 'secondary';
  const friendBtnLabel = friendStatus === 'friends' ? 'Unfriend' : friendStatus === 'pending' ? 'Request Sent' : 'Add Friend';

  return (
    <div className="pb-8 pt-6">
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
                Reflect
              </Button>
              <Button
                variant={friendBtnVariant}
                size="sm"
                disabled={friendStatus === 'pending'}
                onClick={friendStatus !== 'pending' ? handleFriendToggle : undefined}
              >
                {friendBtnLabel}
              </Button>
              <SafetyMenu userId={profile.id} onBlocked={() => router.push(`/${locale}/feed`)} />
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
