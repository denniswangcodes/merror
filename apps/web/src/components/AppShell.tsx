import { NavBar } from '@/components/NavBar';
import { LeftSidebar } from '@/components/LeftSidebar';
import { RightSidebar } from '@/components/RightSidebar';

export function AppShell({ locale, children }: { locale: string; children: React.ReactNode }) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
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
