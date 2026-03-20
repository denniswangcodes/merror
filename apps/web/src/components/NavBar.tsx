'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth.context';

export function NavBar({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const tabs = [
    { href: `/${locale}/feed`, label: 'Home', icon: '⌂' },
    { href: `/${locale}/scan`, label: 'Give', icon: '+', special: true },
    { href: `/${locale}/friends`, label: 'Friends', icon: '♡' },
    { href: `/${locale}/profile`, label: 'Me', icon: '◉' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-200 flex z-50">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 no-underline"
            style={{ borderTop: `2px solid ${active ? '#4F46E5' : 'transparent'}` }}
          >
            {tab.special ? (
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center -mt-1.5">
                <span className="text-white text-xl leading-none">+</span>
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
  );
}
