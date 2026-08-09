'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Sparkles, Users, Search, Sun, Moon, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/auth.context';
import { useTheme } from '@/context/theme.context';
import { usersApi } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import type { PublicUser } from '@merror/shared';

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
}

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

  const tabs: Tab[] = [
    { href: `/${locale}/feed`, label: 'Feed', icon: Home },
    { href: `/${locale}/scan`, label: 'Reflect', icon: Sparkles },
    { href: `/${locale}/friends`, label: 'Friends', icon: Users },
  ];

  return (
    <>
      {/* ── Top bar ── */}
      <nav className="fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 z-50">
        {/* Left: Logo */}
        <div className="flex items-center h-14">
          <Link href={`/${locale}/feed`} className="no-underline shrink-0 inline-flex items-center h-9">
            <Logo size={26} />
          </Link>
        </div>

        {/* Center: Search */}
        <div ref={wrapperRef} className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[300px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search people…"
              className="w-full bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
            />
          </div>
          <AnimatePresence>
            {open && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-1.5 left-0 right-0 bg-surface-raised border border-border rounded-xl shadow-card-hover dark:shadow-card-hover-dark overflow-hidden z-[200]"
              >
                {results.slice(0, 5).map((u) => (
                  <button
                    key={u.id}
                    onMouseDown={() => handleSelect(u)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-background transition text-left"
                  >
                    <Avatar displayName={u.displayName} username={u.username} avatarUrl={u.avatarUrl} size={30} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate m-0">{u.displayName || u.username}</p>
                      <p className="text-xs text-text-muted m-0">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Nav tabs + dark toggle + Avatar */}
        <div className="hidden sm:flex items-center justify-end gap-1 w-[300px]">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'relative h-9 px-3 rounded-lg no-underline text-sm font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors',
                  active ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-tab"
                    className="absolute inset-0 rounded-lg bg-accent/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className="h-4 w-4 relative z-10 shrink-0" />
                <span className="relative z-10 leading-none">{tab.label}</span>
              </Link>
            );
          })}
          <button
            onClick={toggle}
            className="ml-2 h-9 w-9 shrink-0 flex items-center justify-center rounded-lg text-text-secondary hover:bg-background hover:text-text-primary transition-colors overflow-hidden"
            aria-label="Toggle dark mode"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </button>
          {user && (
            <Link href={`/${locale}/profile`} className="ml-3 no-underline shrink-0 flex items-center">
              <Avatar displayName={user.displayName} username={user.username} avatarUrl={user.avatarUrl} size={34} />
            </Link>
          )}
        </div>
      </nav>

      {/* ── Mobile bottom nav (<sm) ── */}
      <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-border flex z-50">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          const isReflect = tab.label === 'Reflect';
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 no-underline border-t-2',
                active ? 'border-accent' : 'border-transparent'
              )}
            >
              {isReflect ? (
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center -mt-1.5">
                  <Icon className="h-4 w-4 text-white" />
                </div>
              ) : (
                <Icon className={cn('h-[18px] w-[18px]', active ? 'text-accent' : 'text-text-muted')} />
              )}
              <span className={cn('text-[10px] font-semibold', active ? 'text-accent' : 'text-text-muted')}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
