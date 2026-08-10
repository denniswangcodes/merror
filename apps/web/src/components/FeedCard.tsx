'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Card } from './ui/Card';
import { formatReflectionDate, type FeedbackItem } from '@merror/shared';

interface FeedCardProps { item: FeedbackItem; locale: string; index?: number }

const TYPE_DEFAULT_IMAGE: Record<FeedbackItem['type'], string> = {
  COMPLIMENT: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&auto=format&fit=crop&q=85',
  HELPFUL_ACT: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=85',
  MEMORY: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=85',
};

export function FeedCard({ item, locale, index = 0 }: FeedCardProps) {
  const giver = item.giver;
  const receiver = item.receiver;
  const imageUrl = item.imageUrl || TYPE_DEFAULT_IMAGE[item.type];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04, ease: 'easeOut' }}>
      <Card className="mb-4 overflow-hidden transition-colors duration-200 hover:border-border-strong">
        <div className="relative mx-3 mt-3 overflow-hidden rounded-xl bg-background ring-1 ring-inset ring-border/70" style={{ aspectRatio: '16/9' }}>
            <img src={imageUrl} alt={`${item.type === 'COMPLIMENT' ? 'Kind Word' : item.type === 'HELPFUL_ACT' ? 'Helping Hand' : 'Shared Moment'} reflection`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />
            <div className="absolute left-3 top-3"><Badge type={item.type} /></div>
        </div>

        <div className="flex min-h-[164px] flex-col px-6 pb-7 pt-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {giver && (
              <Link href={`/${locale}/profile/${giver.username}`} className="flex items-center gap-2 no-underline group">
                <Avatar displayName={giver.displayName} username={giver.username} avatarUrl={giver.avatarUrl} size={30} />
                <span className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{giver.displayName || giver.username}</span>
              </Link>
            )}
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            {receiver && (
              <Link href={`/${locale}/profile/${receiver.username}`} className="flex items-center gap-2 no-underline group">
                <Avatar displayName={receiver.displayName} username={receiver.username} avatarUrl={receiver.avatarUrl} size={30} />
                <span className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{receiver.displayName || receiver.username}</span>
              </Link>
            )}
            <span className="ml-auto text-[11px] font-medium tabular-nums text-text-muted">{formatReflectionDate(item.createdAt)}</span>
          </div>

          <p className="m-0 flex-1 border-t border-border/70 pt-4 font-display text-base font-medium leading-7 text-text-primary">{item.message}</p>
        </div>
      </Card>
    </motion.div>
  );
}
