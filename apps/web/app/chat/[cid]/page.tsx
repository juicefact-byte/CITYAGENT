'use client';
import { useEffect, useState } from 'react';
import { listMessages, sendMessage } from '../../../lib/contact';

// Property-attached chat + viewing request. Safety banner on every thread.
export default function Chat({ params }: { params: { cid: string } }) {
  const [msgs, setMsgs] = useState<any[]>([]);
  const [body, setBody] = useState('');
  const [slot, setSlot] = useState('');
  const [msg, setMsg] = useState('Loading…');

  const load = async () => {
    try {
      setMsgs(await listMessages(params.cid));
      setMsg('');
    } catch (e: any) {
      setMsg(e.message);
    }
  };
  useEffect(() => { load(); }, [params.cid]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(params.cid, body);
      setBody('');
      await load();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', padding: 20 }}>
      <h1>Chat</h1>
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: 12 }}>
        ⚠️ Never transfer money before inspection. You are chatting about a specific listing — verify badge + location first.
      </div>
      {msgs.map((m) => (
        <div key={m.id} style={{ background: '#f1f5f9', borderRadius: 12, padding: '10px 12px', margin: '6px 0', maxWidth: 420 }}>
          {m.body}
        </div>
      ))}
      <form onSubmit={send} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message" required style={{ flex: 1, padding: 12 }} />
        <button className="ca-btn ca-btn--primary" type="submit">Send</button>
      </form>
      <p>{msg}</p>
    </main>
  );
}
