// ─────────────────────────────
// Enum types
// ─────────────────────────────
export type FeedbackType = 'COMPLIMENT' | 'HELPFUL_ACT' | 'MEMORY';
export type FriendStatus = 'PENDING' | 'ACCEPTED';
export type Role = 'USER' | 'ADMIN';

// ─────────────────────────────
// Domain types (no passwordHash)
// ─────────────────────────────
export interface PublicUser {
  id: string;
  email: string;
  displayName: string | null;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  qrCode: string;
  role: Role;
  preferredLanguage: string;
  totalPoints: number;
  createdAt: string | Date;
}

export interface FeedbackItem {
  id: string;
  giverId: string;
  receiverId: string;
  type: FeedbackType;
  message: string;
  points: number;
  isPublic: boolean;
  createdAt: string | Date;
  giver?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl'>;
  receiver?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl'>;
}

export interface FriendshipItem {
  id: string;
  userAId: string;
  userBId: string;
  status: FriendStatus;
  createdAt: string | Date;
  userA?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl' | 'totalPoints'>;
  userB?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl' | 'totalPoints'>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}
