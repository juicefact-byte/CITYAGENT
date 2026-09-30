'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '../../../lib/supabaseClient';

const badge: Record<string, string> = {
  owner: 'ca-badge ca-badge--owner 🟢 VERIFIED OWNER',
  agent: 'ca-badge ca-badge--agent 🔵 VERIFIED AGENT',
  hotel: 'ca-badge ca-badge--hotel 🏨 VERIFIED HOTEL',
  manager: 'ca-badge ca-badge--manager 🟣 VERIFIED MANAGER',
};

// Owner preview + public details (published only for guests).
export default function ListingDetail({ params }: { params: { id: string } }) {
  const [prop, setProp] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [msg, setMsg] = useState('Loading…');

  useEffect(() => {
    (async () => {
      const supa = supabaseBrowser();
      const { data, error } = await supa.from('properties').select('*').eq('id', params.id).single();
      if (error) { setMsg(error.message); return; }
      setProp(data);
      const { data: imgs } = await supa.from('property_images').select('*').eq('property_id', params.id).order('sort');
      setImages(imgs ?? []);
      setMsg(data.status === 'published' ? '' : `Status: ${data.status} — visible to you as owner; public only after publish.`);
    })();
  }, [params.id]);

  if (!prop) return <main style={{ padding: 20 }}><p>{msg}</p></main>;
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 20 }}>
      <span className={badge[prop.lister_kind] ?? 'ca-badge'}>{prop.lister_kind} · {prop.verification_level}</span>
      <h1>{prop.title}</h1>
      <p>₦{Number(prop.price).toLocaleString()} / {prop.payment_frequency}</p>
      <p>{prop.description}</p>
      <p>Beds {prop.bedrooms} · Baths {prop.bathrooms} · Toilets {prop.toilets} · {prop.furnished ? 'Furnished' : 'Unfurnished'}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <tr><td>Deposit</td><td style={{ textAlign: 'right' }}>₦{Number(prop.deposit).toLocaleString()}</td></tr>
          <tr><td>Service charge</td><td style={{ textAlign: 'right' }}>₦{Number(prop.service_charge).toLocaleString()}</td></tr>
          <tr><td>Agency fee</td><td style={{ textAlign: 'right' }}>₦{Number(prop.agency_fee).toLocaleString()}</td></tr>
          <tr><td>Agreement fee</td><td style={{ textAlign: 'right' }}>₦{Number(prop.agreement_fee).toLocaleString()}</td></tr>
        </tbody>
      </table>
      <h3>Photos ({images.length})</h3>
      {images.map((im) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={im.id} src={im.url} alt="" style={{ width: '100%', marginBottom: 8, borderRadius: 12 }} />
      ))}
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 12, marginTop: 12 }}>
        ⚠️ Never transfer money before inspection. Share this viewing with a trusted contact.
      </div>
      <p>{msg}</p>
    </main>
  );
}
