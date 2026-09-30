'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '../../lib/supabaseClient';
import { listNotifications, markNotificationsRead } from '../../lib/engagement';

export default function Me() {
  const [profile, setProfile] = useState<any>(null);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [msg, setMsg] = useState('Loading…');

  useEffect(() => {
    (async () => {
      const supa = supabaseBrowser();
      const { data: { user } } = await supa.auth.getUser();
      if (!user) { setMsg('Not logged in. Go to /login.'); return; }
      const { data, error } = await supa.from('user_profiles').select('*').eq('id', user.id).single();
      if (error) { setMsg('No profile yet — create one on first login. ' + error.message); return; }
      setProfile(data);
      try {
        setNotifs(await listNotifications());
      } catch { /* notifications optional until triggered */ }
      setMsg('');
    })();
  }, []);

  const markRead = async () => {
    await markNotificationsRead();
    setNotifs((n) => n.map((x) => ({ ...x, read_at: x.read_at ?? new Date().toISOString() })));
  };

  return (
    <main style={{ maxWidth: 560, margin: '40px auto', padding: 20 }}>
      <h1>My profile</h1>
      <p>{msg}</p>
      {profile && (
        <ul>
          <li>Role: {profile.role}</li>
          <li>Name: {profile.display_name ?? '—'}</li>
          <li>Phone: {profile.phone ?? '—'}</li>
        </ul>
      )}
      <p><Link href="/favorites">⭐ My Favorites</Link></p>
      <h3>Notifications ({notifs.filter((n) => !n.read_at).length} unread)</h3>
      <button className="ca-btn" onClick={markRead}>Mark all read</button>
      {notifs.map((n) => (
        <div key={n.id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 10, marginTop: 8, opacity: n.read_at ? 0.65 : 1 }}>
          <b>{n.title}</b>
          <div>{n.body}</div>
        </div>
      ))}
    </main>
  );
}
