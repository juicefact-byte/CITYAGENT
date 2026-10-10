import type { MetadataRoute } from 'next';

// Served at /manifest.webmanifest — makes CITYAGENT installable (HTTPS + icons).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CITYAGENT — Find accommodation without the guesswork',
    short_name: 'CITYAGENT',
    description: 'Verified accommodation marketplace. Know who you are dealing with.',
    id: '/',
    lang: 'en',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f8fafc',
    theme_color: '#16a34a',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
