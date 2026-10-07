'use client';
import { useEffect } from 'react';

// Registers /sw.js once (production only — skipped on localhost dev).
export default function SwRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
