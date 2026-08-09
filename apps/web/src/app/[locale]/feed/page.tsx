'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Heart } from 'lucide-react';
import { FeedCard } from '@/components/FeedCard';
import { Toast } from '@/components/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/auth.context';
import { feedbackApi } from '@/lib/api';
import type { FeedbackItem, PaginatedResponse } from '@merror/shared';

export default function FeedPage(): JSX.Element {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [feed, setFeed] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Check for success toast from URL
  useEffect(() => {
    if (searchParams.get('success') === '1') {
      setToast('Your kind words were sent ✨');
      router.replace(`/${locale}/feed`);
    }
  }, [searchParams, locale, router]);

  const loadFeed = useCallback(async (p: number) => {
    try {
      const res = await feedbackApi.getFeed(p) as PaginatedResponse<FeedbackItem>;
      if (p === 1) {
        setFeed(res.data);
      } else {
        setFeed((prev) => [...prev, ...res.data]);
      }
      setHasMore(res.hasMore);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(1);
  }, [loadFeed]);

  // Silently refresh when browser tab regains focus
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') loadFeed(1); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [loadFeed]);

  return (
    <div className="pt-5 pb-6">
      <div>
        {loading ? (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-surface overflow-hidden">
                <Skeleton className="w-full aspect-[4/3] rounded-none" />
                <div className="p-4 flex flex-col gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div className="flex flex-col items-center gap-3 text-center py-16">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-accent" />
            </div>
            <p className="text-sm text-text-muted">No moments yet — be the first to share one!</p>
          </div>
        ) : (
          feed.map((item, i) => <FeedCard key={item.id} item={item} locale={locale} index={i} />)
        )}

        {hasMore && (
          <Button
            variant="secondary"
            onClick={() => {
              const next = page + 1;
              setPage(next);
              loadFeed(next);
            }}
            className="w-full mt-2"
          >
            Load more
          </Button>
        )}
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
