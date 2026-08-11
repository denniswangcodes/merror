'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Sparkles, UserPlus, X } from 'lucide-react';
import { FeedCard } from '@/components/FeedCard';
import { Toast } from '@/components/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/auth.context';
import { feedbackApi, usersApi } from '@/lib/api';
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
  const [showFirstSteps, setShowFirstSteps] = useState(false);

  useEffect(() => {
    if (!user || window.localStorage.getItem('merror_onboarding_dismissed') === '1') return;
    usersApi.getMyStats().then((stats) => setShowFirstSteps(stats.given === 0 && stats.received === 0)).catch(() => {});
  }, [user]);

  // Check for success toast from URL
  useEffect(() => {
    if (searchParams.get('success') === '1') {
      setToast('Reflection sent for review');
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
    <div className="pt-6 pb-8">
      <header className="mb-5 px-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[22px] font-bold text-text-primary m-0 mb-0.5">The World</h1>
            <p className="m-0 text-sm text-text-muted">Recent reflections from around you.</p>
          </div>
          <Link
            href={`/${locale}/scan`}
            className="brand-gradient-bg flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white no-underline shadow-[0_3px_10px_rgb(var(--color-accent)/.22)] transition-opacity hover:opacity-90"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Reflect
          </Link>
        </div>
      </header>
      {showFirstSteps && (
        <Card className="relative mb-5 border-accent/20 bg-gradient-to-br from-accent/[0.08] via-surface to-surface px-5 py-4">
          <button onClick={() => { setShowFirstSteps(false); window.localStorage.setItem('merror_onboarding_dismissed', '1'); }} aria-label="Dismiss first steps" className="absolute right-3 top-3 text-text-muted hover:text-text-primary"><X className="h-4 w-4" /></button>
          <p className="m-0 font-display text-base font-bold text-text-primary">Start your first ripple</p>
          <p className="mb-4 mt-1 text-xs leading-5 text-text-muted">Merror becomes meaningful after one genuine reflection. Recognition earns a lumen only when its recipient approves it.</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/${locale}/friends`} className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs font-semibold text-text-primary no-underline hover:border-border-strong"><UserPlus className="h-3.5 w-3.5 text-accent" /> Find your people</Link>
            <Link href={`/${locale}/scan`} className="brand-gradient-bg flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white no-underline"><Sparkles className="h-3.5 w-3.5" /> Give a reflection</Link>
          </div>
        </Card>
      )}
      <div>
        {loading ? (
          <div className="flex flex-col gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="flex h-14 items-center gap-3 px-4"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-3 w-32" /></div>
                <Skeleton className="w-full aspect-square rounded-none" />
                <div className="px-4 pb-5 pt-4 min-h-[120px] flex flex-col gap-3">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 border-dashed px-6 py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 ring-1 ring-inset ring-accent/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-accent" />
            </div>
            <p className="text-sm text-text-muted">No moments yet — be the first to share one!</p>
            <Button size="sm" onClick={() => router.push(`/${locale}/scan`)}>Create a reflection</Button>
          </Card>
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
