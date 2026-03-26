'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth.context';
import { NavBar } from '@/components/NavBar';
import { LeftSidebar } from '@/components/LeftSidebar';
import { RightSidebar } from '@/components/RightSidebar';

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

  // Public pages: full-screen centered layout, no sidebar
  if (isPublic) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        {children}
      </div>
    );
  }

  // Still checking auth — full screen spinner, no nav
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — blank while redirect fires
  if (!user) return null;

  // Authenticated layout: top bar + 3-column on lg+, single column below
  return (
      <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col overflow-hidden">
      <NavBar locale={locale} />
      <div className="flex-1 flex flex-col pt-14 pb-16 sm:pb-0 overflow-hidden">
        <div className="flex-1 w-full px-4 sm:px-6 lg:flex lg:gap-8 overflow-hidden pb-4 lg:pb-6">

          <aside className="hidden lg:flex lg:flex-col w-72 shrink-0 overflow-y-auto pt-5">
            <LeftSidebar locale={locale} />
          </aside>
          <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar max-w-2xl mx-auto w-full">
            {children}
          </main>
          <aside className="hidden lg:flex lg:flex-col w-72 shrink-0 overflow-y-auto pt-5">
            <RightSidebar locale={locale} />
          </aside>
        </div>
      </div>
    </div>
  );
}
