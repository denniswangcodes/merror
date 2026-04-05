'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FeedCard } from '@/components/FeedCard';
import { Toast } from '@/components/Toast';
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
          <div className="text-center py-12 text-gray-400 text-sm">Loading moments...</div>
        ) : feed.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No moments yet — be the first to share one!
          </div>
        ) : (
          feed.map((item) => <FeedCard key={item.id} item={item} locale={locale} />)
        )}

        {hasMore && (
          <button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              loadFeed(next);
            }}
            className="w-full py-3 text-sm font-semibold text-indigo-600 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 mt-2"
          >
            Load more
          </button>
        )}
      </div>



      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
