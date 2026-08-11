'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareProfileButtonProps {
  username: string;
  displayName: string | null;
  locale: string;
}

export function ShareProfileButton({ username, displayName, locale }: ShareProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/${locale}/profile/${username}` : '';

  const nativeShare = async () => {
    const shareData = {
      title: 'Merror',
      text: `Add me on Merror and let's exchange some good vibes — I'm @${username}.`,
      url: profileUrl,
    };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => {});
    } else {
      await copyLink();
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(profileUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Share2 className="h-3.5 w-3.5" /> Share Profile
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Share your profile"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 font-display text-lg font-bold text-text-primary">Share your profile</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-text-muted" />
              </button>
            </div>

            <p className="m-0 mb-4 text-sm text-text-muted">
              Anyone who scans this or opens your link can add {displayName || `@${username}`} and start exchanging reflections on Merror.
            </p>

            <div className="mb-4 flex justify-center rounded-2xl border border-border bg-white p-4">
              <QRCodeSVG value={profileUrl} size={176} bgColor="#ffffff" fgColor="#111111" level="M" includeMargin={false} />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
              <span className="flex-1 truncate text-xs text-text-secondary">{profileUrl}</span>
              <button
                onClick={copyLink}
                className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent hover:bg-accent/10"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <Button size="sm" className="mt-4 w-full" onClick={nativeShare}>
              <Share2 className="h-3.5 w-3.5" /> Share link
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
