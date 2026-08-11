// ─────────────────────────────
// Enum types
// ─────────────────────────────
export type FeedbackType = 'COMPLIMENT' | 'HELPFUL_ACT' | 'MEMORY' | 'ENCOURAGEMENT' | 'COMMUNITY_SERVICE' | 'ENVIRONMENTAL_ACT';
export type FeedbackStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type FriendStatus = 'PENDING' | 'ACCEPTED';
export type Role = 'USER' | 'ADMIN';

// ─────────────────────────────
// Domain types (no passwordHash)
// ─────────────────────────────
export interface PublicUser {
  id: string;
  email?: string;
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
  receiverId: string | null;
  /** Free-text name for a journal entry about someone who isn't on Merror yet (receiverId is null). */
  recipientName?: string | null;
  type: FeedbackType;
  message: string;
  imageUrl?: string | null;
  points: number;
  isPublic: boolean;
  status?: FeedbackStatus;
  reviewedAt?: string | Date | null;
  createdAt: string | Date;
  giver?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl'>;
  receiver?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl'> | null;
  likeCount?: number;
  commentCount?: number;
  likedByMe?: boolean;
}

export interface CommentItem {
  id: string;
  feedbackId: string;
  userId: string;
  message: string;
  createdAt: string | Date;
  user?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl'>;
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

export type NotificationType = 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'FEEDBACK_RECEIVED' | 'FEEDBACK_APPROVED' | 'FEEDBACK_REJECTED' | 'FEEDBACK_LIKED' | 'FEEDBACK_COMMENTED';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  fromUserId: string | null;
  referenceId: string | null;
  read: boolean;
  createdAt: string | Date;
  fromUser?: Pick<PublicUser, 'id' | 'displayName' | 'username' | 'avatarUrl'> | null;
  feedback?: Pick<FeedbackItem, 'id' | 'type' | 'message' | 'imageUrl' | 'status'> | null;
}
