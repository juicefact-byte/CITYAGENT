'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../../lib/supabaseClient';

export default function Me() {
  const [profile, setProfile] = useState<any>(null);
  const [msg, setMsg] = useState('Loading…');

  useEffect(() => {
    (async () => {
      const supa = supabaseBrowser();
      const { data: { user } } = await supa.auth.getUser();
      if (!user) { setMsg('Not logged in. Go to /login.'); return; }
      const { data, error } = await supa.from('user_profiles').select('*').eq('id', user.id).single();
      if (error) { setMsg('No profile yet — create one on first login. ' + error.message); return; }
      setProfile(data);
      setMsg('');
    })();
  }, []);

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
    </main>
  );
}
