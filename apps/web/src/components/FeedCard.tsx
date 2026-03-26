import Link from 'next/link';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { timeAgo } from '@merror/shared';
import type { FeedbackItem } from '@merror/shared';

interface FeedCardProps {
  item: FeedbackItem;
  locale: string;
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

export function FeedCard({ item, locale }: FeedCardProps) {
  const giver = item.giver;
  const receiver = item.receiver;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 mb-5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{giver.displayName || giver.username}</span>
            </Link>
          )}
          <span className="text-xs text-gray-400 font-medium">→</span>
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
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{receiver.displayName || receiver.username}</span>
            </Link>
          )}
          <span className="ml-auto text-xs text-gray-400">{timeAgo(item.createdAt)}</span>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-700 dark:text-gray-300 m-0 leading-relaxed line-clamp-5">
          &ldquo;{item.message}&rdquo;
        </p>
      </div>
    </div>
  );
}
