'use client';
import { useEffect, useState } from 'react';
import { listQueue, decideRecord } from '../../../lib/verification';

// Admin queue: Submit → Review → Verify → Approve → Publish.
export default function Verifications() {
  const [rows, setRows] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('Loading queue…');

  const load = async () => {
    try {
      setRows(await listQueue());
      setMsg('');
    } catch (e: any) {
      setMsg('Queue blocked by RLS for this session — use SQL fallback in docs/VERIFICATION-TEST.md. (' + e.message + ')');
    }
  };
  useEffect(() => { load(); }, []);

  const decide = async (id: string, d: 'approved' | 'rejected' | 'hold') => {
    setMsg('Deciding…');
    try {
      await decideRecord(id, d, notes[id] ?? '');
      setMsg(`Done: ${d}.`);
      await load();
    } catch (e: any) {
      setMsg('Blocked: ' + e.message);
    }
  };

  return (
    <main style={{ maxWidth: 860, margin: '40px auto', padding: 20 }}>
      <h1>Verification queue</h1>
      <p>Approve publishes the listing. Reject/hold keeps it invisible.</p>
      <p>{msg}</p>
      {rows.map((r) => (
        <div key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 14, marginBottom: 10 }}>
          <b>{r.properties?.title ?? r.property_id}</b>
          <div>Level {r.level} · {r.status} · {new Date(r.created_at).toLocaleString()}</div>
          <input placeholder="Reviewer notes" value={notes[r.id] ?? ''} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} style={{ width: '100%', padding: 10, marginTop: 8 }} />
          <div style={{ marginTop: 8 }}>
            <button className="ca-btn ca-btn--primary" onClick={() => decide(r.id, 'approved')}>Approve → publish</button>
            <button className="ca-btn" onClick={() => decide(r.id, 'hold')}>Hold</button>
            <button className="ca-btn" onClick={() => decide(r.id, 'rejected')}>Reject</button>
          </div>
        </div>
      ))}
    </main>
  );
}
