'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth.context';
import { useTheme } from '@/context/theme.context';
import { usersApi } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import type { PublicUser } from '@merror/shared';

export function NavBar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);
  const [open, setOpen] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await usersApi.search(q.trim());
        setResults(res);
        setOpen(true);
      } catch { setResults([]); }
    }, 250);
  };

  const handleSelect = (u: PublicUser) => {
    setQuery('');
    setResults([]);
    setOpen(false);
    router.push(`/${locale}/profile/${u.username}`);
  };

  const tabs = [
    { href: `/${locale}/feed`, label: 'Feed', icon: '⌂' },
    { href: `/${locale}/scan`, label: 'Reflect', icon: '✦' },
    { href: `/${locale}/friends`, label: 'Friends', icon: '♡' },
  ];

  return (
    <>
      {/* ── Top bar ── */}
      <nav className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 sm:px-6 z-50 shadow-sm">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href={`/${locale}/feed`} className="no-underline shrink-0">
            <span className="text-gray-900 dark:text-white" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Merror
            </span>
          </Link>
        </div>

        {/* Center: Search */}
        <div ref={wrapperRef} className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10" style={{ width: 280 }}>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search people…"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-400 transition"
          />
          {open && results.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-[200]">
              {results.slice(0, 5).map((u) => (
                <button
                  key={u.id}
                  onMouseDown={() => handleSelect(u)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
                >
                  <Avatar displayName={u.displayName} username={u.username} avatarUrl={u.avatarUrl} size={30} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate m-0">{u.displayName || u.username}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 m-0">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Nav tabs + dark toggle + Avatar */}
        <div className="hidden sm:flex items-center gap-0.5">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-2 rounded-lg no-underline text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
          <button
            onClick={toggle}
            className="ml-1 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {user && (
            <Link
              href={`/${locale}/profile`}
              className="ml-2 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-base shrink-0 no-underline"
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
