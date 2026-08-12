import type { ReactNode } from 'react';
import { NavBar } from '@/components/NavBar';
import { LeftSidebar } from '@/components/LeftSidebar';
import { RightSidebar } from '@/components/RightSidebar';

export function AppShell({ locale, children }: { locale: string; children: ReactNode }) {
  return (
    <div className="h-screen h-[100dvh] min-h-0 bg-transparent flex flex-col overflow-hidden">
      <NavBar locale={locale} />
      <div className="min-h-0 flex-1 flex flex-col pt-14 pb-16 sm:pb-0 overflow-hidden">
        <div className="min-h-0 flex-1 w-full px-4 sm:px-6 lg:px-4 xl:px-5 lg:grid lg:grid-cols-[minmax(180px,1fr)_minmax(520px,620px)_minmax(180px,1fr)] lg:gap-6 xl:gap-8 overflow-hidden pb-4 lg:pb-6">
          <aside className="hidden min-h-0 lg:flex lg:flex-col w-full max-w-[320px] justify-self-start overflow-y-auto overscroll-contain pt-7">
            <LeftSidebar locale={locale} />
          </aside>
          <main className="min-h-0 min-w-0 overflow-y-auto overscroll-contain no-scrollbar w-full max-w-[620px] mx-auto">
            {children}
          </main>
          <aside className="hidden min-h-0 lg:flex lg:flex-col w-full max-w-[320px] justify-self-end overflow-y-auto overscroll-contain pt-7">
            <RightSidebar locale={locale} />
          </aside>
        </div>
      </div>
    </div>
  );
}
