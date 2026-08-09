'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/auth.context';
import { feedbackApi, usersApi } from '@/lib/api';
import { timeAgo } from '@merror/shared';
import type { FeedbackItem, PaginatedResponse } from '@merror/shared';

export default function OwnProfilePage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const router = useRouter();
  const { user, loading, logout, refreshUser } = useAuth();
  const [tab, setTab] = useState<'received' | 'given'>('received');
  const [received, setReceived] = useState<FeedbackItem[]>([]);
  const [given, setGiven] = useState<FeedbackItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    feedbackApi.getReceived().then((r) => setReceived((r as PaginatedResponse<FeedbackItem>).data));
    feedbackApi.getGiven().then((r) => setGiven((r as PaginatedResponse<FeedbackItem>).data));
    setBio(user.bio || '');
    setDisplayName(user.displayName || '');
  }, [user]);

  if (loading) {
    return <div className="px-4 py-8 text-center text-text-muted text-sm">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-text-secondary mb-4">You&apos;re not logged in.</p>
        <Button onClick={() => router.push(`/${locale}/login`)}>Login</Button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await usersApi.updateProfile({ displayName, bio });
      await refreshUser();
      setEditing(false);
    } catch { /* noop */ }
    setSaving(false);
  };

  const items = tab === 'received' ? received : given;

  return (
    <div className="pb-8">
      <ProfileHeader
        displayName={user.displayName}
        username={user.username}
        avatarUrl={user.avatarUrl}
        bio={editing ? undefined : user.bio}
        totalPoints={user.totalPoints}
        locale={locale}
        actions={
          !editing && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => { await logout(); router.push(`/${locale}/login`); }}
              >
                Logout
              </Button>
            </>
          )
        }
      >
        {editing && (
          <div className="mb-4 text-left max-w-md mx-auto lg:mx-0 flex flex-col gap-3">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-secondary">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                rows={3}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] text-text-primary placeholder:text-text-muted resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </div>
            <div className="flex gap-2 mt-1">
              <Button onClick={handleSave} loading={saving} className="flex-1">
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={() => setEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </ProfileHeader>

      {/* Tabs */}
      <div className="flex border-b border-border mt-8 mb-3.5">
        {(['received', 'given'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 py-3 text-[13px] capitalize transition-colors ${
              tab === t ? 'font-bold text-accent' : 'font-normal text-text-muted'
            }`}
          >
            {t} ({t === 'received' ? received.length : given.length})
            {tab === t && (
              <motion.span
                layoutId="profile-tab-indicator"
                className="absolute left-0 right-0 -bottom-px h-0.5 bg-accent"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      <div>
        {items.length === 0 ? (
          <p className="text-sm text-text-muted text-center mt-8">No {tab} feedback yet</p>
        ) : (
          items.map((item) => {
            const otherUser = tab === 'received'
              ? (item as FeedbackItem & { giver?: { displayName: string | null; username: string; avatarUrl: string | null } }).giver
              : (item as FeedbackItem & { receiver?: { displayName: string | null; username: string; avatarUrl: string | null } }).receiver;
            return (
              <div key={item.id} className="bg-surface rounded-2xl border border-border p-3.5 mb-2.5">
                <div className="flex items-center gap-2 mb-2">
                  {otherUser && (
                    <Avatar displayName={otherUser.displayName} username={otherUser.username} avatarUrl={otherUser.avatarUrl} size={28} />
                  )}
                  {otherUser && (
                    <span className="font-semibold text-[13px] text-text-secondary">{otherUser.displayName || otherUser.username}</span>
                  )}
                  <Badge type={item.type} />
                  <span className="text-[11px] text-text-muted ml-auto">{timeAgo(item.createdAt)}</span>
                </div>
                <p className="text-sm text-text-secondary m-0 leading-relaxed">
                  &ldquo;{item.message}&rdquo;
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
