'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, NotebookPen, Send } from 'lucide-react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Card } from './ui/Card';
import { SafetyMenu } from './SafetyMenu';
import { useAuth } from '@/context/auth.context';
import { feedbackApi } from '@/lib/api';
import { formatReflectionDate, type CommentItem, type FeedbackItem } from '@merror/shared';

interface FeedCardProps { item: FeedbackItem; locale: string; index?: number }

const TYPE_DEFAULT_IMAGE: Record<FeedbackItem['type'], string> = {
  COMPLIMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85',
  HELPFUL_ACT: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=85',
  MEMORY: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=85',
  ENCOURAGEMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85',
  COMMUNITY_SERVICE: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&auto=format&fit=crop&q=85',
  ENVIRONMENTAL_ACT: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=85',
};

export function FeedCard({ item, locale, index = 0 }: FeedCardProps) {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [deleted, setDeleted] = useState(false);
  const [liked, setLiked] = useState(!!item.likedByMe);
  const [likeCount, setLikeCount] = useState(item.likeCount ?? 0);
  const [likeBusy, setLikeBusy] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentItem[] | null>(null);
  const [commentCount, setCommentCount] = useState(item.commentCount ?? 0);
  const [commentDraft, setCommentDraft] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const giver = item.giver;
  const receiver = item.receiver;
  const isJournalEntry = !item.receiverId;
  const imageUrl = item.imageUrl || TYPE_DEFAULT_IMAGE[item.type];
  const detailUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/reflection/${item.id}`;

  const requireAuth = () => {
    const ref = giver?.username;
    router.push(ref ? `/${locale}/signup?ref=${encodeURIComponent(ref)}` : `/${locale}/signup`);
  };

  const toggleLike = async () => {
    if (!user) return requireAuth();
    if (likeBusy) return;
    setLikeBusy(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((count) => count + (nextLiked ? 1 : -1));
    try {
      const result = await feedbackApi.toggleLike(item.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      setLiked(!nextLiked);
      setLikeCount((count) => count + (nextLiked ? -1 : 1));
    } finally {
      setLikeBusy(false);
    }
  };

  const toggleComments = async () => {
    if (!user) return requireAuth();
    const opening = !commentsOpen;
    setCommentsOpen(opening);
    if (opening && comments === null) {
      try {
        setComments(await feedbackApi.getComments(item.id));
      } catch {
        setComments([]);
      }
    }
  };

  const submitComment = async () => {
    if (!user) return requireAuth();
    const message = commentDraft.trim();
    if (!message) return;
    setPostingComment(true);
    try {
      const created = await feedbackApi.addComment(item.id, message);
      setComments((prev) => [...(prev ?? []), created]);
      setCommentCount((count) => count + 1);
      setCommentDraft('');
    } catch { /* noop */ } finally {
      setPostingComment(false);
    }
  };

  const shareReflection = async () => {
    const text = `${giver?.displayName || giver?.username || 'Someone'} shared a reflection on Merror: "${item.message}"`;
    if (navigator.share) await navigator.share({ title: 'A reflection on Merror', text, url: detailUrl }).catch(() => {});
    else await navigator.clipboard.writeText(`${text} ${detailUrl}`).catch(() => {});
  };

  const nameFor = (person: NonNullable<typeof giver>) => (user?.id === person.id ? 'You' : person.displayName || person.username);

  if (deleted) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04, ease: 'easeOut' }}>
      <Card className="mb-5 overflow-hidden rounded-xl transition-colors duration-200 hover:border-border-strong">
        <div className="flex min-h-14 flex-wrap items-center gap-2 px-4 py-3">
          {giver && (
            <Link href={`/${locale}/profile/${giver.username}`} className="flex min-w-0 items-center gap-2.5 no-underline group">
              <Avatar displayName={giver.displayName} username={giver.username} avatarUrl={giver.avatarUrl} size={34} />
              <span className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-accent">{nameFor(giver)}</span>
            </Link>
          )}
          {(receiver || isJournalEntry) && <span className="shrink-0 text-xs font-medium text-text-muted">→</span>}
          {receiver ? (
            <Link href={`/${locale}/profile/${receiver.username}`} className="min-w-0 truncate text-sm font-semibold text-text-primary no-underline transition-colors hover:text-accent">
              {nameFor(receiver)}
            </Link>
          ) : isJournalEntry ? (
            <span className="min-w-0 truncate text-sm font-semibold text-text-muted">{item.recipientName || 'someone'}</span>
          ) : null}
          <span className="ml-auto flex shrink-0 items-center gap-1">
            <span className="text-[11px] font-medium tabular-nums text-text-muted">{formatReflectionDate(item.createdAt)}</span>
            <SafetyMenu feedbackId={item.id} userId={giver?.id} canDelete={user?.id === item.giverId || user?.id === item.receiverId} onDeleted={() => { setDeleted(true); if (user?.id === item.receiverId) void refreshUser(); }} />
          </span>
        </div>

        <div className="relative w-full overflow-hidden bg-background ring-1 ring-inset ring-border/70" style={{ aspectRatio: '1/1' }}>
            <img src={imageUrl} alt="Reflection" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />
        </div>

        {/* Instagram-style action bubbles */}
        <div className="flex items-center gap-1 px-2 pt-2">
          <button
            onClick={toggleLike}
            aria-label={liked ? 'Unlike' : 'Like'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background"
          >
            <Heart className={liked ? 'h-[22px] w-[22px] fill-danger text-danger' : 'h-[22px] w-[22px]'} />
          </button>
          <button
            onClick={toggleComments}
            aria-label="Comments"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background"
          >
            <MessageCircle className="h-[22px] w-[22px]" />
          </button>
          <button
            onClick={shareReflection}
            aria-label="Share reflection"
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-background"
          >
            <Send className="h-[20px] w-[20px]" />
          </button>
          {isJournalEntry && (
            <span className="ml-auto mr-1 flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
              <NotebookPen className="h-3 w-3" /> Journal{!item.isPublic && ' · private'}
            </span>
          )}
        </div>

        <div className="px-4 pb-5 pt-1">
          {likeCount > 0 && <p className="m-0 mb-1.5 text-[13px] font-semibold text-text-primary">{likeCount} {likeCount === 1 ? 'like' : 'likes'}</p>}
          <div className="mb-2 flex items-center gap-2"><Badge type={item.type} /></div>
          <p className="m-0 text-[15px] leading-6 text-text-primary">{item.message}</p>

          <AnimatePresence initial={false}>
            {commentsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="mt-4 border-t border-border pt-3">
                  {comments === null ? (
                    <p className="m-0 text-xs text-text-muted">Loading comments…</p>
                  ) : comments.length === 0 ? (
                    <p className="m-0 text-xs text-text-muted">No comments yet — be the first.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2.5">
                          <Avatar displayName={comment.user?.displayName ?? null} username={comment.user?.username ?? '?'} avatarUrl={comment.user?.avatarUrl} size={28} />
                          <div className="min-w-0 flex-1">
                            <span className="mr-1.5 text-[13px] font-semibold text-text-primary">
                              {comment.user && user?.id === comment.user.id ? 'You' : comment.user?.displayName || comment.user?.username}
                            </span>
                            <span className="text-[13px] leading-5 text-text-secondary">{comment.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      value={commentDraft}
                      onChange={(e) => setCommentDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !postingComment) submitComment(); }}
                      maxLength={280}
                      placeholder="Add a comment…"
                      className="min-w-0 flex-1 rounded-full border border-border bg-background px-3.5 py-2 text-[13px] text-text-primary outline-none focus:border-accent"
                    />
                    <button
                      onClick={submitComment}
                      disabled={!commentDraft.trim() || postingComment}
                      className="shrink-0 text-[13px] font-semibold text-accent disabled:opacity-40"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!commentsOpen && commentCount > 0 && (
            <button onClick={toggleComments} className="mt-2 block text-[13px] font-medium text-text-muted hover:text-accent">
              View all {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
