import Link from 'next/link';
import type { ReactNode } from 'react';

export function LegalPage({ title, intro, locale, children }: { title: string; intro: string; locale: string; children: ReactNode }): JSX.Element {
  return (
    <article className="pb-16 pt-6">
      <h1 className="m-0 font-display text-3xl font-extrabold text-text-primary">{title}</h1>
      <p className="mb-8 mt-2 text-sm leading-6 text-text-muted">{intro}</p>
      <div className="space-y-7 text-sm leading-7 text-text-secondary [&_h2]:mb-2 [&_h2]:mt-0 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-text-primary [&_p]:m-0 [&_ul]:m-0 [&_ul]:pl-5">
        {children}
      </div>
      <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-5 text-xs font-semibold">
        <Link href={`/${locale}/community-guidelines`} className="text-text-muted no-underline hover:text-accent">Guidelines</Link>
        <Link href={`/${locale}/privacy`} className="text-text-muted no-underline hover:text-accent">Privacy</Link>
        <Link href={`/${locale}/terms`} className="text-text-muted no-underline hover:text-accent">Terms</Link>
        <Link href={`/${locale}/support`} className="text-text-muted no-underline hover:text-accent">Support</Link>
      </div>
    </article>
  );
}
