'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FeedCard } from '@/components/FeedCard';
import { Toast } from '@/components/Toast';
import { useAuth } from '@/context/auth.context';
import { feedbackApi } from '@/lib/api';
import type { FeedbackItem, PaginatedResponse } from '@merror/shared';

export default function FeedPage() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale || 'en';
  const router = useRouter();
  const { user } = useAuth();
  const [feed, setFeed] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Check for success toast from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === '1') {
      setToast('Your kind words were sent ✨');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

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

  return (
    <div className="pb-20">
      <div className="px-4 py-5 bg-white border-b border-gray-100 mb-4">
        <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, margin: 0, color: '#111827' }}>
          Merror
        </h1>
        <p className="text-[13px] text-gray-500 mt-0.5 mb-0">A reflection of the good in people</p>
      </div>

      <div className="px-3">
        <div className="flex justify-between items-center mb-3.5">
          <span className="text-[13px] font-semibold text-gray-500 tracking-wider uppercase">
            Recent moments
          </span>
          <span className="text-[12px] text-gray-400">{feed.length} posts</span>
        </div>

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
            className="w-full py-3 text-sm font-semibold text-indigo-600 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 mt-2"
          >
            Load more
          </button>
        )}
      </div>

      {user && (
        <button
          onClick={() => router.push(`/${locale}/scan`)}
          className="fixed bottom-20 right-5 bg-indigo-600 text-white border-none rounded-[28px] px-5 py-3.5 font-semibold text-sm cursor-pointer flex items-center gap-2 z-10"
          style={{ boxShadow: '0 4px 20px rgba(79,70,229,0.4)' }}
        >
          <span className="text-lg">+</span> Give Feedback
        </button>
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
