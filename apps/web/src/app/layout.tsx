import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth.context';
import { ThemeProvider } from '@/context/theme.context';

export const metadata: Metadata = {
  title: 'Merror — A reflection of the good in people',
  description: 'Send and receive positive feedback, compliments, and kind memories.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
