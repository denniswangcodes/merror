import { AuthGuard } from '@/components/AuthGuard';
import type { ReactNode } from 'react';

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { locale: string };
}): JSX.Element {
  return (
    <AuthGuard locale={params.locale}>{children}</AuthGuard>
  );
}
