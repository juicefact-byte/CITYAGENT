'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminStats, openReports, resolveReport } from '../../lib/dashboards';

// Admin home: counts + report triage. Verification queue lives at /admin/verifications.
export default function Admin() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [reports, setReports] = useState<any[]>([]);
  const [msg, setMsg] = useState('Loading…');

  const load = async () => {
    try {
      setStats(await adminStats());
      setReports(await openReports());
      setMsg('');
    } catch (e: any) {
      setMsg('Admin reads blocked by RLS for this session — use SQL fallback in docs/DASHBOARDS-TEST.md. (' + e.message + ')');
    }
  };
  useEffect(() => { load(); }, []);

  const resolve = async (id: string, s: 'actioned' | 'dismissed') => {
    try {
      await resolveReport(id, s);
      await load();
    } catch (e: any) {
      setMsg('Blocked: ' + (e as Error).message);
    }
  };

  return (
    <main style={{ maxWidth: 860, margin: '40px auto', padding: 20 }}>
      <h1>Admin</h1>
      <p><Link href="/admin/verifications">→ Verification queue</Link></p>
      <p>{msg}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 14px' }}>
            <b>{v}</b> {k}
          </div>
        ))}
      </div>
      <h3>Open reports ({reports.length})</h3>
      {reports.map((r) => (
        <div key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 12, marginBottom: 8 }}>
          <b>{r.properties?.title ?? r.property_id}</b>
          <div>{r.reason} · {new Date(r.created_at).toLocaleString()}</div>
          <div>{r.details}</div>
          <div style={{ marginTop: 6 }}>
            <button className="ca-btn" onClick={() => resolve(r.id, 'actioned')}>Actioned</button>{' '}
            <button className="ca-btn" onClick={() => resolve(r.id, 'dismissed')}>Dismiss</button>
          </div>
        </div>
      ))}
    </main>
  );
}
