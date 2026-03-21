'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth.context';

export function NavBar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = [
    { href: `/${locale}/feed`, label: 'Feed', icon: '⌂' },
    { href: `/${locale}/scan`, label: 'Reflect', icon: '✦' },
    { href: `/${locale}/friends`, label: 'Friends', icon: '♡' },
  ];

  return (
    <>
      {/* ── Top bar ── */}
      <nav className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50 shadow-sm">
        {/* Left: Logo */}
        <Link href={`/${locale}/feed`} className="no-underline">
          <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 20, color: '#111827', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Merror
          </span>
        </Link>

        {/* Right: Nav links + avatar (sm+) */}
        <div className="hidden sm:flex items-center gap-1">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="px-4 py-2 rounded-lg no-underline text-sm font-medium transition-colors"
                style={{
                  background: active ? '#EEF2FF' : 'transparent',
                  color: active ? '#4F46E5' : '#4B5563',
                }}
              >
                {tab.label}
              </Link>
            );
          })}
          {user && (
            <Link
              href={`/${locale}/profile`}
              className="ml-3 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0 no-underline"
            >
              {(user.displayName || user.username || '?')[0].toUpperCase()}
            </Link>
          )}
        </div>
      </nav>

      {/* ── Mobile bottom nav (<sm) ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex z-50">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 no-underline"
              style={{ borderTop: `2px solid ${active ? '#4F46E5' : 'transparent'}` }}
            >
              {tab.label === 'Reflect' ? (
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center -mt-1.5">
                  <span className="text-white text-xl leading-none">✦</span>
                </div>
              ) : (
                <span style={{ fontSize: 18, color: active ? '#4F46E5' : '#9CA3AF' }}>
                  {tab.icon}
                </span>
              )}
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? '#4F46E5' : '#9CA3AF' }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
