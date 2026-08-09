import { getAvatarInitials } from '@merror/shared';
import { cn } from '@/lib/utils';

interface AvatarProps {
  displayName: string | null;
  username: string;
  avatarUrl?: string | null;
  size?: number;
  color?: string;
  className?: string;
}

const AVATAR_COLORS = [
  '#6D5BFF', '#0D9488', '#7C3AED', '#E11D48', '#EA580C', '#0369A1',
  '#DB2777', '#16A34A', '#D97706', '#FF7A6B',
];

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ displayName, username, avatarUrl, size = 40, color, className }: AvatarProps) {
  const initials = getAvatarInitials(displayName, username);
  const bg = color || stringToColor(username);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName || username}
        className={cn('rounded-full object-cover shrink-0', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn('rounded-full flex items-center justify-center shrink-0 font-display font-semibold text-white', className)}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}
