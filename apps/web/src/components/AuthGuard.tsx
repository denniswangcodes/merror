'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth.context';
import { AppShell } from '@/components/AppShell';

const PUBLIC_PATHS = ['/login', '/signup'];
// Content-first pages: viewable while logged out (no redirect to /login), but still get the
// full app shell once signed in. Each page owns its own signed-out experience/CTA.
const SEMI_PUBLIC_PREFIXES = ['/profile/', '/reflection/'];

export function AuthGuard({ children, locale }: { children: ReactNode; locale: string }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.endsWith(p));
  const isSemiPublic = SEMI_PUBLIC_PREFIXES.some((p) => pathname.includes(p));

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic && !isSemiPublic) {
      router.replace(`/${locale}/login`);
    }
    if (user && isPublic) {
      router.replace(`/${locale}/feed`);
    }
  }, [loading, user, isPublic, isSemiPublic, locale, router]);

  // Public pages own their full layout (e.g. split-screen auth panels)
  if (isPublic) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  // Still checking auth — full screen spinner, no nav
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    // Semi-public content pages render standalone (no nav shell) instead of redirecting away.
    if (isSemiPublic) return <div className="min-h-screen bg-background px-4">{children}</div>;
    return null;
  }

  return <AppShell locale={locale}>{children}</AppShell>;
}
