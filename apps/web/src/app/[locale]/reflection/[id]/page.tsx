'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { FeedCard } from '@/components/FeedCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth.context';
import { feedbackApi } from '@/lib/api';
import type { FeedbackItem } from '@merror/shared';

export default function ReflectionDetailPage(): JSX.Element {
  const params = useParams<{ locale: string; id: string }>();
  const { locale, id } = params;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [item, setItem] = useState<FeedbackItem | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    feedbackApi
      .getPublic(id)
      .then((data) => setItem(data))
      .catch(() => setNotFound(true));
  }, [id]);

  useEffect(() => {
    if (!item || authLoading || !user) return;
    feedbackApi.getLikeStatus(id).then(({ liked }) => setItem((prev) => (prev ? { ...prev, likedByMe: liked } : prev))).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.id, authLoading, user]);

  return (
    <div className="pt-6 pb-8 max-w-lg">
      <header className="mb-5 px-1">
        <h1 className="font-display text-[22px] font-bold text-text-primary m-0 mb-0.5">A Reflection</h1>
        <p className="m-0 text-sm text-text-muted">Someone's good deed, shared on Merror.</p>
      </header>

      {notFound && (
        <div className="px-1 py-10 text-center">
          <p className="text-sm text-text-muted">This reflection isn't available — it may be private or no longer exist.</p>
          <Link href={`/${locale}/feed`} className="mt-3 inline-block text-sm font-semibold text-accent no-underline hover:underline">Go to the feed</Link>
        </div>
      )}

      {!notFound && !item && <div className="px-4 py-8 text-center text-text-muted text-sm">Loading…</div>}

      {item && <FeedCard item={item} locale={locale} />}

      {!authLoading && !user && item && (
        <div className="mt-2 flex flex-col items-center gap-3 rounded-2xl border border-border bg-background px-5 py-6 text-center">
          <p className="m-0 text-sm font-semibold text-text-primary">Join Merror to like, comment, and give your own reflections.</p>
          <Button
            size="md"
            onClick={() => router.push(`/${locale}/signup${item.giver ? `?ref=${encodeURIComponent(item.giver.username)}` : ''}`)}
          >
            <Sparkles className="h-4 w-4" /> Join Merror
          </Button>
        </div>
      )}
    </div>
  );
}
