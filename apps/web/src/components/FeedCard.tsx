'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Share2 } from 'lucide-react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Card } from './ui/Card';
import { SafetyMenu } from './SafetyMenu';
import { useAuth } from '@/context/auth.context';
import { formatReflectionDate, type FeedbackItem } from '@merror/shared';

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
  const [deleted, setDeleted] = useState(false);
  const giver = item.giver;
  const receiver = item.receiver;
  const imageUrl = item.imageUrl || TYPE_DEFAULT_IMAGE[item.type];
  const shareReflection = async () => {
    const url = receiver ? `${window.location.origin}/${locale}/profile/${receiver.username}` : window.location.href;
    const text = `${giver?.displayName || giver?.username || 'Someone'} recognized ${receiver?.displayName || receiver?.username || 'someone'} on Merror: “${item.message}”`;
    if (navigator.share) await navigator.share({ title: 'A reflection on Merror', text, url }).catch(() => {});
    else await navigator.clipboard.writeText(`${text} ${url}`).catch(() => {});
  };

  if (deleted) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04, ease: 'easeOut' }}>
      <Card className="mb-5 overflow-hidden rounded-xl transition-colors duration-200 hover:border-border-strong">
        <div className="flex min-h-14 flex-wrap items-center gap-2 px-4 py-3">
          {giver && (
            <Link href={`/${locale}/profile/${giver.username}`} className="flex min-w-0 items-center gap-2.5 no-underline group">
              <Avatar displayName={giver.displayName} username={giver.username} avatarUrl={giver.avatarUrl} size={34} />
              <span className="truncate text-sm font-semibold text-text-primary transition-colors group-hover:text-accent">{giver.displayName || giver.username}</span>
            </Link>
          )}
          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-muted" />
          {receiver && (
            <Link href={`/${locale}/profile/${receiver.username}`} className="min-w-0 truncate text-sm font-semibold text-text-primary no-underline transition-colors hover:text-accent">
              {receiver.displayName || receiver.username}
            </Link>
          )}
          <span className="ml-auto shrink-0 text-[11px] font-medium tabular-nums text-text-muted">{formatReflectionDate(item.createdAt)}</span>
        </div>

        <div className="relative w-full overflow-hidden bg-background ring-1 ring-inset ring-border/70" style={{ aspectRatio: '1/1' }}>
            <img src={imageUrl} alt="Reflection" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />
        </div>

        <div className="px-4 pb-5 pt-4">
          <div className="mb-3 flex items-center"><Badge type={item.type} /><button onClick={shareReflection} className="ml-auto flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold text-text-muted hover:bg-background hover:text-accent" aria-label="Share reflection"><Share2 className="h-3.5 w-3.5" /> Share</button><SafetyMenu feedbackId={item.id} userId={giver?.id} canDelete={user?.id === item.giverId || user?.id === item.receiverId} onDeleted={() => { setDeleted(true); if (user?.id === item.receiverId) void refreshUser(); }} /></div>
          <p className="m-0 text-[15px] leading-6 text-text-primary">{item.message}</p>
        </div>
      </Card>
    </motion.div>
  );
}
