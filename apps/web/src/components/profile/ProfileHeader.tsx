import type { ReactNode } from 'react';
import { Camera } from 'lucide-react';
import { Avatar } from '@/components/Avatar';
import { TierBadge } from '@/components/TierBadge';

interface ProfileHeaderProps {
  displayName: string | null;
  username: string;
  avatarUrl: string | null;
  bio?: string | null;
  totalPoints: number;
  locale: string;
  actions?: ReactNode;
  /** Overrides the default name/username/bio block — used for inline-edit mode. */
  children?: ReactNode;
  /** Shows a camera badge in the avatar's lower-right corner and fires this when clicked — used for inline-edit mode. */
  onEditAvatar?: () => void;
}

export function ProfileHeader({
  displayName,
  username,
  avatarUrl,
  bio,
  totalPoints,
  locale,
  actions,
  children,
  onEditAvatar,
}: ProfileHeaderProps) {
  return (
    <div className="pt-3 text-center lg:text-left lg:flex lg:items-start lg:gap-8 lg:pt-4">
      <div className="flex justify-center lg:justify-start mb-3 lg:mb-0 lg:flex-shrink-0">
        <div className="relative shrink-0" style={{ width: 132, height: 132 }}>
          <Avatar displayName={displayName} username={username} avatarUrl={avatarUrl} size={132} />
          {onEditAvatar && (
            <button
              onClick={onEditAvatar}
              aria-label="Change profile photo"
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-accent text-white shadow-md hover:bg-accent-hover transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 lg:flex lg:min-h-[132px] lg:flex-col">
        {children ? children : (
          <>
            <h2 className="m-0 font-display text-[22px] font-bold text-text-primary">
              {displayName || username}
            </h2>
            {bio && <p className="mb-1 mt-1 text-[13px] leading-5 text-text-secondary">{bio}</p>}
            <p className="mb-2 mt-0 text-xs text-text-muted">@{username}</p>
          </>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:mt-auto lg:justify-between">
          <div className="flex items-center gap-2.5">
            <TierBadge points={totalPoints} locale={locale} />
            <span className="text-sm font-semibold text-text-primary"><span className="tabular-nums">{totalPoints}</span> Lumens</span>
          </div>
          {actions && <div className="flex gap-2 justify-center lg:justify-end">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
