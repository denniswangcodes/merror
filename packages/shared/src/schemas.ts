import { z } from 'zod';

// ─────────────────────────────
// Enums
// ─────────────────────────────
export const FeedbackTypeEnum = z.enum(['COMPLIMENT', 'HELPFUL_ACT', 'MEMORY']);
export const FriendStatusEnum = z.enum(['PENDING', 'ACCEPTED']);
export const RoleEnum = z.enum(['USER', 'ADMIN']);

// ─────────────────────────────
// Auth DTOs
// ─────────────────────────────
export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, 'Username must be lowercase alphanumeric and underscores only'),
  displayName: z.string().min(1).max(60).optional(),
  preferredLanguage: z.string().default('en'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ─────────────────────────────
// Feedback DTOs
// ─────────────────────────────
export const CreateFeedbackSchema = z.object({
  receiverId: z.string().min(1),
  type: FeedbackTypeEnum,
  message: z.string().min(1).max(280),
  isPublic: z.boolean().default(true),
});

// ─────────────────────────────
// Friends DTOs
// ─────────────────────────────
export const FriendRequestSchema = z.object({
  targetUserId: z.string().min(1),
});

// ─────────────────────────────
// Profile Update
// ─────────────────────────────
export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  bio: z.string().max(200).optional(),
  avatarUrl: z.string().url().optional(),
  preferredLanguage: z.string().optional(),
});

// ─────────────────────────────
// Inferred types
// ─────────────────────────────
export type SignupDto = z.infer<typeof SignupSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type CreateFeedbackDto = z.infer<typeof CreateFeedbackSchema>;
export type FriendRequestDto = z.infer<typeof FriendRequestSchema>;
export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
