import { NavBar } from '@/components/NavBar';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-gray-50 relative">
      <div className="pb-16">{children}</div>
      <NavBar locale={params.locale} />
    </div>
  );
}
