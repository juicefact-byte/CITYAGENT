'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ownerListings, listingSignals, markListing } from '../../lib/dashboards';

// Owner dashboard: listings by status + demand signals + availability actions.
export default function Owner() {
  const [rows, setRows] = useState<any[]>([]);
  const [signals, setSignals] = useState<Record<string, any>>({});
  const [msg, setMsg] = useState('Loading…');

  const load = async () => {
    try {
      const data = await ownerListings();
      setRows(data ?? []);
      setMsg(data?.length ? '' : 'No listings yet — create one at /listings/new.');
      const sig: Record<string, any> = {};
      await Promise.all((data ?? []).map(async (p: any) => {
        try { sig[p.id] = await listingSignals(p.id); } catch { sig[p.id] = { saves: 0, chats: 0, viewings: 0 }; }
      }));
      setSignals(sig);
    } catch (e: any) {
      setMsg(e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const mark = async (id: string, status: 'rented' | 'published' | 'draft') => {
    try {
      await markListing(id, status);
      await load();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const groups = ['published', 'submitted', 'in_review', 'draft', 'rented', 'rejected', 'expired'];
  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: 20 }}>
      <h1>My Properties</h1>
      <p>{msg} <Link href="/listings/new">+ New listing</Link></p>
      {groups.map((g) => {
        const items = rows.filter((r) => r.status === g);
        if (!items.length) return null;
        return (
          <section key={g}>
            <h3>{g} ({items.length})</h3>
            {items.map((p) => (
              <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 12, marginBottom: 8 }}>
                <Link href={`/listings/${p.id}`}><b>{p.title}</b></Link>
                <div>₦{Number(p.price).toLocaleString()} · {p.verification_level}</div>
                <div>Saves {signals[p.id]?.saves ?? 0} · Chats {signals[p.id]?.chats ?? 0} · Viewings {signals[p.id]?.viewings ?? 0}</div>
                <div style={{ marginTop: 6 }}>
                  <button className="ca-btn" onClick={() => mark(p.id, 'rented')}>Mark rented</button>{' '}
                  <button className="ca-btn" onClick={() => mark(p.id, 'published')}>Mark available</button>{' '}
                  <button className="ca-btn" onClick={() => mark(p.id, 'draft')}>Unlist</button>
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </main>
  );
}
