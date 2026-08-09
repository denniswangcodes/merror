'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth.context';
import { AppShell } from '@/components/AppShell';

const PUBLIC_PATHS = ['/login', '/signup'];

export function AuthGuard({ children, locale }: { children: React.ReactNode; locale: string }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.some((p) => pathname.endsWith(p));

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) {
      router.replace(`/${locale}/login`);
    }
    if (user && isPublic) {
      router.replace(`/${locale}/feed`);
    }
  }, [loading, user, isPublic, locale, router]);

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

  // Not authenticated — blank while redirect fires
  if (!user) return null;

  return <AppShell locale={locale}>{children}</AppShell>;
}
