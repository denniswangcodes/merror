'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { FeedCard } from '@/components/FeedCard';
import { ImageCropperModal } from '@/components/ImageCropperModal';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ShareProfileButton } from '@/components/profile/ShareProfileButton';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/auth.context';
import { authApi, clearTokens, feedbackApi, usersApi } from '@/lib/api';
import { readFileAsDataUrl } from '@/lib/image';
import { MAX_AVATAR_IMAGE_CHARS, type FeedbackItem, type PaginatedResponse } from '@merror/shared';

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
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  // undefined = no pending change, null = pending removal, string = pending new avatar
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null | undefined>(undefined);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [avatarCropSrc, setAvatarCropSrc] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    feedbackApi.getReceived().then((result) => setReceived((result as PaginatedResponse<FeedbackItem>).data));
    feedbackApi.getGiven().then((result) => setGiven((result as PaginatedResponse<FeedbackItem>).data));
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
      await usersApi.updateProfile({ displayName, bio, ...(avatarDataUrl !== undefined ? { avatarUrl: avatarDataUrl } : {}) });
      await refreshUser();
      setEditing(false);
      setAvatarDataUrl(undefined);
    } catch { /* noop */ }
    setSaving(false);
  };

  const cancelEditing = () => {
    setEditing(false);
    setAvatarDataUrl(undefined);
  };

  const previewAvatarUrl = avatarDataUrl !== undefined ? avatarDataUrl : user.avatarUrl;

  const handleEditAvatar = () => {
    if (previewAvatarUrl) setAvatarMenuOpen(true);
    else avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarMenuOpen(false);
    setAvatarCropSrc(await readFileAsDataUrl(file));
  };

  const items = tab === 'received' ? received : given;

  return (
    <div className="pb-8 pt-6">
      <header className="mb-4 px-1">
        <h1 className="font-display text-[22px] font-bold text-text-primary m-0 mb-0.5">Your Profile</h1>
        <p className="m-0 text-sm text-text-muted">Your place to settle in and make Merror yours.</p>
      </header>
      <ProfileHeader
        displayName={user.displayName}
        username={user.username}
        avatarUrl={editing ? previewAvatarUrl : user.avatarUrl}
        bio={editing ? undefined : user.bio}
        totalPoints={user.totalPoints}
        locale={locale}
        onEditAvatar={editing ? handleEditAvatar : undefined}
        actions={
          !editing && (
            <>
              <ShareProfileButton username={user.username} displayName={user.displayName} locale={locale} />
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
              <Button
                variant="secondary"
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
              <Button variant="secondary" onClick={cancelEditing} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </ProfileHeader>

      <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFileChange} />

      {avatarMenuOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label="Edit profile photo">
          <div className="w-full max-w-xs rounded-2xl border border-border bg-surface p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="m-0 font-display text-base font-bold text-text-primary">Profile photo</h2>
              <button onClick={() => setAvatarMenuOpen(false)} aria-label="Close"><X className="h-4 w-4 text-text-muted" /></button>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm" onClick={() => avatarInputRef.current?.click()}>Replace photo</Button>
              <Button variant="destructive" size="sm" onClick={() => { setAvatarDataUrl(null); setAvatarMenuOpen(false); }}>Remove photo</Button>
            </div>
          </div>
        </div>
      )}

      {avatarCropSrc && (
        <ImageCropperModal
          imageSrc={avatarCropSrc}
          aspect={1}
          cropShape="round"
          maxPx={512}
          maxChars={MAX_AVATAR_IMAGE_CHARS}
          onCancel={() => { setAvatarCropSrc(null); if (avatarInputRef.current) avatarInputRef.current.value = ''; }}
          onSave={(dataUrl) => { setAvatarDataUrl(dataUrl); setAvatarCropSrc(null); }}
        />
      )}

      <div className="flex border-b border-border mt-8 mb-3.5">
        {(['received', 'given'] as const).map((itemTab) => (
          <button
            key={itemTab}
            onClick={() => setTab(itemTab)}
            className={`relative flex-1 py-3 text-[13px] capitalize transition-colors ${
              tab === itemTab ? 'font-bold brand-gradient-text' : 'font-normal text-text-muted'
            }`}
          >
            {itemTab} ({itemTab === 'received' ? received.length : given.length})
            {tab === itemTab && (
              <motion.span
                layoutId="profile-tab-indicator"
                className="brand-gradient-bg absolute left-0 right-0 -bottom-px h-0.5"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      <div>
        {items.length === 0 ? (
          <p className="text-sm text-text-muted text-center mt-8">No {tab} reflections yet</p>
        ) : (
          items.map((item, index) => <FeedCard key={item.id} item={item} locale={locale} index={index} />)
        )}
      </div>

      <section className="mt-10 border-t border-border pt-6">
        <h2 className="m-0 text-sm font-bold text-text-primary">Account and safety</h2>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium">
          <a href={`/${locale}/community-guidelines`} className="text-text-muted no-underline hover:text-accent">Community Guidelines</a>
          <a href={`/${locale}/privacy`} className="text-text-muted no-underline hover:text-accent">Privacy</a>
          <a href={`/${locale}/terms`} className="text-text-muted no-underline hover:text-accent">Terms</a>
          <a href={`/${locale}/support`} className="text-text-muted no-underline hover:text-accent">Support</a>
        </div>
        {!showDelete ? (
          <Button variant="destructive" size="sm" className="mt-5" onClick={() => setShowDelete(true)}>Delete account</Button>
        ) : (
          <div className="mt-5 max-w-md rounded-2xl border border-danger/25 bg-danger/5 p-4">
            <p className="m-0 text-sm font-bold text-text-primary">Permanently delete your account?</p>
            <p className="mb-4 mt-1 text-xs leading-5 text-text-muted">Your profile, reflections, friendships, and associated content will be permanently removed. This cannot be undone.</p>
            <Input label="Confirm your password" type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} />
            {deleteError && <p className="mb-0 mt-2 text-xs text-danger">{deleteError}</p>}
            <div className="mt-3 flex gap-2">
              <Button variant="destructive" size="sm" loading={deleting} disabled={!deletePassword} onClick={async () => {
                setDeleting(true); setDeleteError('');
                try {
                  await authApi.deleteAccount(deletePassword);
                  clearTokens();
                  router.replace(`/${locale}/signup`);
                } catch (error) {
                  setDeleteError((error as Error).message);
                } finally { setDeleting(false); }
              }}>Delete permanently</Button>
              <Button variant="secondary" size="sm" onClick={() => { setShowDelete(false); setDeletePassword(''); setDeleteError(''); }}>Cancel</Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
