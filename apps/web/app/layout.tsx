import './tokens.css';
import 'leaflet/dist/leaflet.css';

import type { Metadata, Viewport } from 'next';
import SwRegister from './sw-register';

export const metadata: Metadata = {
  title: 'CITYAGENT — Find accommodation without the guesswork',
  description: 'Verified accommodation marketplace. Know who you are dealing with.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'CITYAGENT' },
};

export const viewport: Viewport = { themeColor: '#16a34a' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Segoe UI, Arial, sans-serif', background: '#f8fafc' }}>
        <SwRegister />
        {children}
      </body>
    </html>
  );
}
