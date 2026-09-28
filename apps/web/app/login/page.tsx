'use client';
import { useState } from 'react';
import { supabaseBrowser } from '../../lib/supabaseClient';

// MVP auth: email OTP (free). Phone OTP deferred (SMS costs).
export default function Login() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [msg, setMsg] = useState('');

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('Sending code…');
    const { error } = await supabaseBrowser().auth.signInWithOtp({ email });
    setMsg(error ? error.message : 'Code sent — check your email.');
    if (!error) setStep('verify');
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('Verifying…');
    const { error } = await supabaseBrowser().auth.verifyOtp({ email, token, type: 'email' });
    setMsg(error ? error.message : 'Logged in. Visit /me.');
  };

  return (
    <main style={{ maxWidth: 440, margin: '40px auto', padding: 20 }}>
      <h1>Log in</h1>
      <p>Email code — free tier, no SMS needed for pilot.</p>
      {step === 'request' ? (
        <form onSubmit={request}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" required style={{ width: '100%', padding: 12 }} />
          <button className="ca-btn ca-btn--primary" style={{ marginTop: 12 }} type="submit">Send code</button>
        </form>
      ) : (
        <form onSubmit={verify}>
          <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="6-digit code" required style={{ width: '100%', padding: 12 }} />
          <button className="ca-btn ca-btn--primary" style={{ marginTop: 12 }} type="submit">Verify</button>
        </form>
      )}
      <p>{msg}</p>
    </main>
  );
}
