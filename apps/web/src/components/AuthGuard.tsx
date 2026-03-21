'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth.context';
import { NavBar } from '@/components/NavBar';

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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {children}
      </div>
    );
  }

  // Still checking auth — full screen spinner, no nav
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — blank while redirect fires
  if (!user) return null;

  // Authenticated layout: top bar + bottom nav on mobile
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar locale={locale} />
      <main className="pt-14 pb-16 sm:pb-0 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 lg:px-8 py-0">
          {children}
        </div>
      </main>
    </div>
  );
}
