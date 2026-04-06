'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { TierBadge } from '@/components/TierBadge';
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
    return <div className="px-4 py-8 text-center text-gray-400 text-sm">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-gray-500 mb-4">You&apos;re not logged in.</p>
        <button
          onClick={() => router.push(`/${locale}/login`)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm"
        >
          Login
        </button>
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
      <div className="pt-8 text-center lg:text-left lg:flex lg:items-start lg:gap-8 lg:pt-10">
        <div className="flex justify-center lg:justify-start mb-3 lg:mb-0 lg:flex-shrink-0">
          <Avatar displayName={user.displayName} username={user.username} avatarUrl={user.avatarUrl} size={80} />
        </div>

        <div className="flex-1">
          {editing ? (
            <div className="mb-4 text-left max-w-md">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Display Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded-lg text-sm mb-2"
              />
              <label className="block text-xs font-semibold text-gray-500 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 rounded-lg text-sm resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-semibold">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg py-2 text-sm font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-gray-900 dark:text-white" style={{ fontSize: 22, fontWeight: 700, margin: '0 0 2px' }}>
                {user.displayName || user.username}
              </h2>
              <p className="text-[13px] text-gray-500 mt-0 mb-2">@{user.username}</p>
              {user.bio && <p className="text-[14px] text-gray-600 mb-3">{user.bio}</p>}
            </>
          )}

          <div className="flex justify-center lg:justify-start items-center gap-2.5 mb-4">
            <span className="font-bold text-xl text-indigo-600">{user.totalPoints}</span>
            <span className="text-xs text-gray-400">points</span>
            <TierBadge points={user.totalPoints} locale={locale} />
          </div>

          <div className="flex gap-2 justify-center lg:justify-start mb-2">
            <button
              onClick={() => setEditing(true)}
              className="bg-white dark:bg-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-500 rounded-[10px] px-5 py-2.5 font-semibold text-[13px] cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
            >
              Edit Profile
            </button>
            <button
              onClick={async () => { await logout(); router.push(`/${locale}/login`); }}
              className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-[10px] px-5 py-2.5 font-semibold text-[13px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mt-8 mb-3.5">
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
          <p className="text-[14px] text-gray-400 text-center mt-8">No {tab} feedback yet</p>
        ) : (
          items.map((item) => {
            const otherUser = tab === 'received'
              ? (item as FeedbackItem & { giver?: { displayName: string | null; username: string; avatarUrl: string | null } }).giver
              : (item as FeedbackItem & { receiver?: { displayName: string | null; username: string; avatarUrl: string | null } }).receiver;
            return (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-[14px] border border-gray-200 dark:border-gray-800 p-3.5 mb-2.5">
                <div className="flex items-center gap-2 mb-2">
                  {otherUser && (
                    <Avatar displayName={otherUser.displayName} username={otherUser.username} avatarUrl={otherUser.avatarUrl} size={28} />
                  )}
                  {otherUser && (
                    <span className="font-semibold text-[13px] text-gray-700 dark:text-gray-300">{otherUser.displayName || otherUser.username}</span>
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
    </div>
  );
}
