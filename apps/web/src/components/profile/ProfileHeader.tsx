import type { ReactNode } from 'react';
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
}: ProfileHeaderProps) {
  return (
    <div className="pt-8 text-center lg:text-left lg:flex lg:items-start lg:gap-8 lg:pt-10">
      <div className="flex justify-center lg:justify-start mb-3 lg:mb-0 lg:flex-shrink-0">
        <Avatar displayName={displayName} username={username} avatarUrl={avatarUrl} size={88} />
      </div>

      <div className="flex-1">
        {children ?? (
          <>
            <h2 className="font-display text-[22px] font-bold text-text-primary m-0 mb-0.5">
              {displayName || username}
            </h2>
            <p className="text-[13px] text-text-muted mt-0 mb-2">@{username}</p>
            {bio && <p className="text-sm text-text-secondary mb-3">{bio}</p>}
          </>
        )}

        <div className="flex justify-center lg:justify-start items-center gap-2.5 mb-4">
          <span className="font-bold text-xl text-accent">{totalPoints}</span>
          <span className="text-xs text-text-muted">points</span>
          <TierBadge points={totalPoints} locale={locale} />
        </div>

        {actions && <div className="flex gap-2 justify-center lg:justify-start mb-2">{actions}</div>}
      </div>
    </div>
  );
}
