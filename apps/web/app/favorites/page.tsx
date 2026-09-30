'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { listFavorites } from '../../lib/engagement';

// My Favorites — compare shortlist before inspecting.
export default function Favorites() {
  const [rows, setRows] = useState<any[]>([]);
  const [msg, setMsg] = useState('Loading…');

  useEffect(() => {
    (async () => {
      try {
        setRows(await listFavorites());
        setMsg('');
      } catch (e: any) {
        setMsg(e.message);
      }
    })();
  }, []);

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 20 }}>
      <h1>My Favorites</h1>
      <p>{msg}</p>
      {rows.map((r) => (
        <div key={r.property_id} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 12, marginBottom: 8 }}>
          <Link href={`/listings/${r.properties?.id}`}><b>{r.properties?.title}</b></Link>
          <div>₦{Number(r.properties?.price).toLocaleString()} / {r.properties?.payment_frequency} · {r.properties?.lister_kind} · {r.properties?.verification_level}</div>
        </div>
      ))}
    </main>
  );
}
