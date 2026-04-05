import { AuthGuard } from '@/components/AuthGuard';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}): JSX.Element {
  return (
    <AuthGuard locale={params.locale}>{children}</AuthGuard>
  );
}
