import { supabaseBrowser } from './supabaseClient';

// Admin review queue. NOTE: reads/writes hit RLS; run with an admin session
// (service-role route lands next) or use the SQL fallback in docs/VERIFICATION-TEST.md.
export async function listQueue() {
  const supa = supabaseBrowser();
  const { data, error } = await supa
    .from('verification_records')
    .select('id, level, status, notes, created_at, property_id, user_id, properties(id, title, status, price)')
    .eq('status', 'pending')
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function decideRecord(id: string, decision: 'approved' | 'rejected' | 'hold', notes = '') {
  const supa = supabaseBrowser();
  const { data: rec, error: getErr } = await supa.from('verification_records').select('*').eq('id', id).single();
  if (getErr) throw getErr;
  const { error: upErr } = await supa.from('verification_records').update({
    status: decision, notes, decided_at: new Date().toISOString(),
  }).eq('id', id);
  if (upErr) throw upErr;
  // Publish gating: the money step. L3 approve → published; reject → rejected; hold → in_review.
  const next = decision === 'approved' ? 'published' : decision === 'rejected' ? 'rejected' : 'in_review';
  const { error: propErr } = await supa.from('properties').update({
    status: next, verification_level: rec.level,
  }).eq('id', rec.property_id);
  if (propErr) throw propErr;
}
