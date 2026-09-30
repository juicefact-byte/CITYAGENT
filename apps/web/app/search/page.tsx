'use client';
import { useState } from 'react';
import Link from 'next/link';
import { searchProperties } from '../../lib/search';

// Published-only filters: city, price, beds, type, verification.
export default function Search() {
  const [rows, setRows] = useState<any[]>([]);
  const [msg, setMsg] = useState('Set filters, hit Search.');

  const onSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMsg('Searching published listings…');
    try {
      const fd = new FormData(e.currentTarget);
      const num = (v: FormDataEntryValue | null) => (v && String(v) ? Number(v) : undefined);
      const str = (v: FormDataEntryValue | null) => (v && String(v) ? String(v) : undefined);
      const data = await searchProperties({
        q: str(fd.get('q')), city: str(fd.get('city')) ?? 'Abuja',
        min: num(fd.get('min')), max: num(fd.get('max')),
        beds: num(fd.get('beds')), type: str(fd.get('type')), level: str(fd.get('level')),
      });
      setRows(data ?? []);
      setMsg(`${data?.length ?? 0} verified result(s).`);
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  return (
    <main style={{ maxWidth: 760, margin: '40px auto', padding: 20 }}>
      <h1>Search Abuja pilot</h1>
      <form onSubmit={onSearch} style={{ display: 'grid', gap: 8 }}>
        <input name="q" placeholder="Keywords e.g. wuse parking" style={{ padding: 12 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <input name="city" defaultValue="Abuja" style={{ flex: 1, padding: 12 }} />
          <input name="beds" type="number" placeholder="Min beds" style={{ flex: 1, padding: 12 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input name="min" type="number" placeholder="₦ Min" style={{ flex: 1, padding: 12 }} />
          <input name="max" type="number" placeholder="₦ Max" style={{ flex: 1, padding: 12 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <select name="type" defaultValue="" style={{ flex: 1, padding: 12 }}>
            <option value="">Any type</option>
            <option value="apartment">Apartment</option>
            <option value="self_contained">Self-contained</option>
            <option value="duplex">Duplex</option>
            <option value="house">House</option>
            <option value="short_let">Short-let</option>
          </select>
          <select name="level" defaultValue="" style={{ flex: 1, padding: 12 }}>
            <option value="">Any verification</option>
            <option value="L3">Property verified</option>
            <option value="L4">Verified owner</option>
          </select>
        </div>
        <button className="ca-btn ca-btn--primary" type="submit">Search</button>
      </form>
      <p>{msg} <Link href="/map">Open map</Link></p>
      {rows.map((r) => (
        <div key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 12, marginBottom: 8 }}>
          <Link href={`/listings/${r.id}`}><b>{r.title}</b></Link>
          <div>₦{Number(r.price).toLocaleString()} / {r.payment_frequency} · {r.bedrooms} beds · {r.lister_kind} · {r.verification_level}</div>
          <div style={{ color: '#64748b' }}>{r.locations?.district}, {r.locations?.city}</div>
        </div>
      ))}
    </main>
  );
}
