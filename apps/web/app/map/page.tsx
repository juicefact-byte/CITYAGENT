'use client';
import { useEffect, useRef, useState } from 'react';
import { searchProperties } from '../../lib/search';

// Free OSM map: Leaflet + OpenStreetMap tiles, no API key.
// Approx coords only (locations.approx_geom served as lon/lat by PostGIS? here via GeoJSON parse).
export default function MapPage() {
  const divRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState('Loading published pins…');

  useEffect(() => {
    let map: any;
    (async () => {
      const L = (await import('leaflet')).default;
      map = L.map(divRef.current!).setView([9.08, 7.48], 12); // Wuse, Abuja
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);
      try {
        const rows = await searchProperties({ city: 'Abuja', limit: 50 });
        let n = 0;
        rows.forEach((r: any) => {
          const g = r.locations?.approx_geom;
          // PostGIS geography comes back as GeoJSON string or object depending on client.
          let lon: number | null = null, lat: number | null = null;
          try {
            const j = typeof g === 'string' ? JSON.parse(g) : g;
            if (j?.coordinates) { lon = j.coordinates[0]; lat = j.coordinates[1]; }
          } catch { /* skip pins without coords */ }
          if (lon == null || lat == null) return;
          n++;
          L.marker([lat, lon]).addTo(map).bindPopup(
            `<b>${r.title}</b><br/>₦${Number(r.price).toLocaleString()} · ${r.verification_level}<br/><a href="/listings/${r.id}">Open</a>`
          );
        });
        setMsg(`${n} pin(s) with coords. Listings without coords still appear in /search.`);
      } catch (e: any) {
        setMsg(e.message);
      }
    })();
    return () => { try { map?.remove(); } catch { /* noop */ } };
  }, []);

  return (
    <main style={{ maxWidth: 860, margin: '20px auto', padding: 20 }}>
      <h1>Map — Abuja</h1>
      <div ref={divRef} style={{ height: 420, borderRadius: 14, border: '1px solid #e2e8f0' }} />
      <p>{msg}</p>
    </main>
  );
}
