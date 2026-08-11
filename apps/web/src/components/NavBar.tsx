'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Sparkles, Users, Search, ShieldCheck, Sun, Moon, type LucideIcon } from 'lucide-react';
import { useAuth } from '@/context/auth.context';
import { useTheme } from '@/context/theme.context';
import { usersApi } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { NotificationMenu } from '@/components/NotificationMenu';
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
    ...(user?.role === 'ADMIN' ? [{ href: `/${locale}/admin`, label: 'Admin', icon: ShieldCheck }] : []),
  ];

  return (
    <>
      {/* ── Top bar ── */}
      <nav className="fixed top-0 left-0 right-0 h-14 bg-surface/90 backdrop-blur-xl border-b border-border/80 flex items-center justify-between px-4 sm:px-6 lg:px-4 xl:px-5 z-50 shadow-[0_1px_0_rgba(16,24,40,.02)]">
        {/* Left: brand mark + search */}
        <div className="flex items-center gap-3 h-14">
          <Link href={`/${locale}/feed`} className="no-underline shrink-0 inline-flex items-center h-9 transition-opacity hover:opacity-80" aria-label="Merror home">
            <Logo size={30} showWordmark={false} />
          </Link>

        <div ref={wrapperRef} className="relative hidden w-[278px] lg:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search people…"
              className="w-full h-9 bg-background/80 border border-border rounded-xl pl-9 pr-4 text-[13px] text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/60 focus:bg-surface transition-all"
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
        </div>

        {/* Right: Nav tabs + dark toggle + Avatar */}
        <div className="hidden sm:flex items-center justify-end gap-1">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'group relative h-10 w-10 rounded-xl no-underline flex items-center justify-center transition-colors',
                  active ? 'text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-background'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active-tab"
                    className="absolute inset-0 rounded-xl bg-accent/10 ring-1 ring-inset ring-accent/10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon className="h-[18px] w-[18px] relative z-10 shrink-0" strokeWidth={active ? 2.5 : 2} />
                <span className="sr-only">{tab.label}</span>
                <span aria-hidden="true" className="pointer-events-none absolute top-full mt-2 rounded-lg bg-text-primary px-2 py-1 text-[11px] font-semibold text-surface opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  {tab.label}
                </span>
              </Link>
            );
          })}
          {user && <NotificationMenu locale={locale} />}
          <button
            onClick={toggle}
            className="ml-2 h-9 w-9 shrink-0 flex items-center justify-center rounded-xl text-text-secondary hover:bg-background hover:text-text-primary transition-colors overflow-hidden"
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
      <nav className="sm:hidden fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-xl border-t border-border/80 flex z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(16,24,40,.06)]">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          const isReflect = tab.label === 'Reflect';
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 no-underline',
                active ? 'text-accent' : 'text-text-muted'
              )}
            >
              {isReflect ? (
                <div className="w-10 h-10 rounded-2xl bg-accent flex items-center justify-center -mt-3 shadow-[0_5px_16px_rgb(var(--color-accent)/.32)] ring-4 ring-surface">
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
