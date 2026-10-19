import type { Metadata, Viewport } from 'next';
import { Noto_Naskh_Arabic } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

const arabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#065f46',
};

export const metadata: Metadata = {
  title: 'Quran',
  description: 'Lecture du Coran, traductions française et anglaise, tafsirs',
  applicationName: 'Quran',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Quran',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={arabic.variable}>
      <body>
        <div className="mx-auto h-dvh max-h-dvh w-full max-w-[430px] overflow-hidden bg-slate-50 shadow-2xl">
          <AuthProvider>{children}</AuthProvider>
        </div>
      </body>
    </html>
  );
}
