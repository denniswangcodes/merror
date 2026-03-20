import { getAvatarInitials } from '@merror/shared';

interface AvatarProps {
  displayName: string | null;
  username: string;
  avatarUrl?: string | null;
  size?: number;
  color?: string;
}

const AVATAR_COLORS = [
  '#4F46E5', '#0D9488', '#7C3AED', '#DC2626', '#EA580C', '#0369A1',
  '#DB2777', '#16A34A', '#D97706', '#7C3AED',
];

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ displayName, username, avatarUrl, size = 40, color }: AvatarProps) {
  const initials = getAvatarInitials(displayName, username);
  const bg = color || stringToColor(username);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName || username}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 600,
        fontSize: size * 0.35,
        flexShrink: 0,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {initials}
    </div>
  );
}
