import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth.context';
import { ThemeProvider } from '@/context/theme.context';
import { inter, dmSans } from '@/lib/fonts';

export const metadata: Metadata = {
  title: 'Merror — A reflection of the good in people',
  description: 'Send and receive positive feedback, compliments, and kind memories.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${dmSans.variable}`}>
      <head>
        {/* Set dark class before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('merror-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
      </head>
      <body>
        <ThemeProvider><AuthProvider>{children}</AuthProvider></ThemeProvider>
      </body>
    </html>
  );
}
