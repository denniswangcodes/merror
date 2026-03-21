import Link from 'next/link';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { timeAgo } from '@merror/shared';
import type { FeedbackItem } from '@merror/shared';

interface FeedCardProps {
  item: FeedbackItem;
  locale: string;
}

export function FeedCard({ item, locale }: FeedCardProps) {
  const giver = item.giver;
  const receiver = item.receiver;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
        {giver && (
          <Link
            href={`/${locale}/profile/${giver.username}`}
            className="flex items-center gap-1.5 no-underline"
          >
            <Avatar
              displayName={giver.displayName}
              username={giver.username}
              avatarUrl={giver.avatarUrl}
              size={32}
            />
            <span className="font-semibold text-[13px] text-gray-800">{giver.displayName || giver.username}</span>
          </Link>
        )}
        <span className="text-xs text-gray-400">→</span>
        {receiver && (
          <Link
            href={`/${locale}/profile/${receiver.username}`}
            className="flex items-center gap-1.5 no-underline"
          >
            <Avatar
              displayName={receiver.displayName}
              username={receiver.username}
              avatarUrl={receiver.avatarUrl}
              size={32}
            />
            <span className="font-semibold text-[13px] text-gray-800">{receiver.displayName || receiver.username}</span>
          </Link>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Badge type={item.type} />
          <span className="text-[11px] text-gray-400">{timeAgo(item.createdAt)}</span>
        </div>
      </div>
      <p
        className="text-sm text-gray-700 m-0 leading-relaxed"
        style={{ fontFamily: 'inherit' }}
      >
        &ldquo;{item.message}&rdquo;
      </p>
    </div>
  );
}
