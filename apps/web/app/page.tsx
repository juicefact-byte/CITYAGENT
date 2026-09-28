export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 20 }}>
      <h1>What are you looking for?</h1>
      <p>Rent a house · Hotel / short stay — Abuja pilot (Wuse).</p>
      <form>
        <input placeholder="Enter city, area or landmark" style={{ width: '100%', padding: 12 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="₦ Minimum" style={{ flex: 1, padding: 12 }} />
          <input placeholder="₦ Maximum" style={{ flex: 1, padding: 12 }} />
        </div>
        <button className="ca-btn ca-btn--primary" style={{ marginTop: 12 }} type="submit">Search</button>
      </form>
      <p><span className="ca-badge ca-badge--owner">🟢 OWNER — VERIFIED</span> listings show who you deal with before contact.</p>
    </main>
  );
}
