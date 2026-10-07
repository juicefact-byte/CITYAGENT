const LIVING_ROOMS = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=60',
];

export default function Home() {
  return (
    <main style={{ margin: 0, fontFamily: 'Segoe UI, Arial, sans-serif' }}>
      {/* Hero: light purple + faded living rooms */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', opacity: 0.28 }} aria-hidden>
          {LIVING_ROOMS.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" style={{ width: '34%', objectFit: 'cover', minHeight: 320 }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(245,243,255,.55),rgba(237,233,254,.92))' }} />
        </div>
        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', padding: '56px 20px 40px' }}>
          <h1 style={{ fontSize: 34, margin: '0 0 6px', color: '#0f172a' }}>What are you looking for?</h1>
          <p style={{ color: '#4c1d95', fontWeight: 600 }}>Rent a house · Hotel / short stay — Abuja pilot (Wuse).</p>
          <form style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 6px 24px rgba(15,23,42,.08)' }}>
            <input placeholder="Enter city, area or landmark" style={{ width: '100%', padding: 12, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input placeholder="₦ Minimum" style={{ flex: 1, padding: 12 }} />
              <input placeholder="₦ Maximum" style={{ flex: 1, padding: 12 }} />
            </div>
            <button className="ca-btn ca-btn--primary" style={{ marginTop: 12 }} type="submit">Search</button>
          </form>
          <p>
            <span className="ca-badge ca-badge--owner">🟢 OWNER — VERIFIED</span>{' '}
            <span className="ca-badge ca-badge--agent">🔵 AGENT — VERIFIED</span>{' '}
            <span className="ca-badge ca-badge--hotel">🏨 HOTEL — VERIFIED</span>
          </p>
          <p style={{ color: '#64748b' }}>Listings show who you deal with before contact.</p>
        </div>
      </section>
    </main>
  );
}
