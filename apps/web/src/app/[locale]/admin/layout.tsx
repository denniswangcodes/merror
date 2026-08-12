'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/auth.context';

const TABS = [
  { path: '', label: 'Dashboard' },
  { path: '/moderation', label: 'Moderation' },
];

export default function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}): JSX.Element {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const { locale } = params;

  if (loading) {
    return <p className="pt-8 text-center text-sm text-text-muted">Loading…</p>;
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="pt-8">
        <h1 className="m-0 font-display text-2xl font-bold text-text-primary">Not available</h1>
        <p className="mt-1 text-sm text-text-muted">Administrator access is required.</p>
      </div>
    );
  }

  return (
    <div className="pb-12 pt-6">
      <header className="mb-1 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-accent" />
        <h1 className="m-0 font-display text-2xl font-bold text-text-primary">Admin</h1>
      </header>
      <p className="mb-5 text-sm text-text-muted">Tools for keeping Merror healthy and safe.</p>

      <div className="mb-6 flex border-b border-border">
        {TABS.map((tab) => {
          const href = `/${locale}/admin${tab.path}`;
          const active = pathname === href;
          return (
            <Link
              key={tab.path}
              href={href}
              className={`relative px-4 py-2.5 text-[13px] no-underline transition-colors ${active ? 'font-bold brand-gradient-text' : 'font-normal text-text-muted hover:text-text-primary'}`}
            >
              {tab.label}
              {active && (
                <motion.span
                  layoutId="admin-tab-indicator"
                  className="brand-gradient-bg absolute left-0 right-0 -bottom-px h-0.5"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
