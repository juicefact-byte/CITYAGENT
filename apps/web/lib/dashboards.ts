import { supabaseBrowser } from './supabaseClient';

// Owner: listings by status + per-listing demand signals (free-tier counts).
export async function ownerListings() {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Login first at /login.');
  const { data, error } = await supa.from('properties')
    .select('id, title, status, price, verification_level, created_at')
    .eq('owner_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function listingSignals(propertyId: string) {
  const supa = supabaseBrowser();
  const [fav, msg, view] = await Promise.all([
    supa.from('favorites').select('property_id', { count: 'exact', head: true }).eq('property_id', propertyId),
    supa.from('conversations').select('id', { count: 'exact', head: true }).eq('property_id', propertyId),
    supa.from('viewing_requests').select('id', { count: 'exact', head: true }).eq('property_id', propertyId),
  ]);
  return { saves: fav.count ?? 0, chats: msg.count ?? 0, viewings: view.count ?? 0 };
}

export async function markListing(id: string, status: 'rented' | 'published' | 'draft') {
  const supa = supabaseBrowser();
  const { error } = await supa.from('properties').update({ status }).eq('id', id);
  if (error) throw error;
}

// Admin: counts + open reports (service-role SQL fallback if RLS blocks).
export async function adminStats() {
  const supa = supabaseBrowser();
  const tables: Array<[string, any]> = [
    ['users', supa.from('user_profiles').select('id', { count: 'exact', head: true })],
    ['published', supa.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'published')],
    ['pending_review', supa.from('properties').select('id', { count: 'exact', head: true }).in('status', ['submitted', 'in_review'])],
    ['pending_verif', supa.from('verification_records').select('id', { count: 'exact', head: true }).eq('status', 'pending')],
    ['open_reports', supa.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'open')],
  ];
  const out: Record<string, number> = {};
  for (const [k, q] of tables) {
    const { count } = await q;
    out[k] = count ?? 0;
  }
  return out;
}

export async function openReports() {
  const supa = supabaseBrowser();
  const { data, error } = await supa.from('reports')
    .select('id, reason, details, status, created_at, property_id, properties(id, title)')
    .eq('status', 'open').order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return data;
}

export async function resolveReport(id: string, status: 'actioned' | 'dismissed') {
  const supa = supabaseBrowser();
  const { error } = await supa.from('reports').update({ status }).eq('id', id);
  if (error) throw error;
}
