'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Card } from './ui/Card';
import { timeAgo } from '@merror/shared';
import type { FeedbackItem } from '@merror/shared';

interface FeedCardProps {
  item: FeedbackItem;
  locale: string;
  index?: number;
}

// Default stock photos (Unsplash) shown when user hasn't uploaded an image — like LinkedIn's contextual defaults
const TYPE_DEFAULT_IMAGE: Record<string, string> = {
  COMPLIMENT:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700&auto=format&fit=crop&q=80',
  HELPFUL_ACT:
    'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=700&auto=format&fit=crop&q=80',
  MEMORY:
    'https://images.unsplash.com/photo-1521543298894-ba7edd6b7cf2?w=700&auto=format&fit=crop&q=80',
};

export function FeedCard({ item, locale, index = 0 }: FeedCardProps) {
  const giver = item.giver;
  const receiver = item.receiver;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 6) * 0.05, ease: 'easeOut' }}
    >
      <Card className="mb-5 overflow-hidden hover:shadow-card-hover dark:hover:shadow-card-hover-dark transition-shadow">
        {/* Photo header — Polaroid-style top portion */}
        <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
          <img
            src={item.imageUrl || TYPE_DEFAULT_IMAGE[item.type] || TYPE_DEFAULT_IMAGE.COMPLIMENT}
            alt="reflection"
            className="w-full h-full object-cover"
          />
          {/* Badge overlay top-right */}
          <div className="absolute top-3 right-3">
            <Badge type={item.type} />
          </div>
        </div>

        {/* Caption area — like the white Polaroid bottom strip */}
        <div className="px-4 pt-3.5 pb-4">
          {/* Giver → Receiver row */}
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            {giver && (
              <Link
                href={`/${locale}/profile/${giver.username}`}
                className="flex items-center gap-1.5 no-underline"
              >
                <Avatar
                  displayName={giver.displayName}
                  username={giver.username}
                  avatarUrl={giver.avatarUrl}
                  size={28}
                />
                <span className="font-semibold text-sm text-text-primary">{giver.displayName || giver.username}</span>
              </Link>
            )}
            <ArrowRight className="h-3.5 w-3.5 text-text-muted shrink-0" />
            {receiver && (
              <Link
                href={`/${locale}/profile/${receiver.username}`}
                className="flex items-center gap-1.5 no-underline"
              >
                <Avatar
                  displayName={receiver.displayName}
                  username={receiver.username}
                  avatarUrl={receiver.avatarUrl}
                  size={28}
                />
                <span className="font-semibold text-sm text-text-primary">{receiver.displayName || receiver.username}</span>
              </Link>
            )}
            <span className="ml-auto text-xs text-text-muted">{timeAgo(item.createdAt)}</span>
          </div>

          {/* Message */}
          <p className="text-sm text-text-secondary m-0 leading-relaxed line-clamp-5">
            &ldquo;{item.message}&rdquo;
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
