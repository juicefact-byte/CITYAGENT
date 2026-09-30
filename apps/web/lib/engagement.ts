import { supabaseBrowser } from './supabaseClient';

// Favorites / reports / notifications — all free-tier Supabase rows.
export async function toggleFavorite(propertyId: string) {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Login first at /login.');
  const { data: existing } = await supa.from('favorites')
    .select('property_id').eq('user_id', user.id).eq('property_id', propertyId).maybeSingle();
  if (existing) {
    const { error } = await supa.from('favorites').delete().eq('user_id', user.id).eq('property_id', propertyId);
    if (error) throw error;
    return false;
  }
  const { error } = await supa.from('favorites').insert({ user_id: user.id, property_id: propertyId });
  if (error) throw error;
  return true;
}

export async function listFavorites() {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Login first at /login.');
  const { data, error } = await supa.from('favorites')
    .select('property_id, properties(id, title, price, payment_frequency, lister_kind, verification_level)')
    .eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function submitReport(propertyId: string, reason: string, details = '') {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  const { error } = await supa.from('reports').insert({
    property_id: propertyId, reporter_id: user?.id ?? null, reason, details,
  });
  if (error) throw error;
}

export async function listNotifications() {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Login first at /login.');
  const { data, error } = await supa.from('notifications')
    .select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
  if (error) throw error;
  return data;
}

export async function markNotificationsRead() {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Login first at /login.');
  const { error } = await supa.from('notifications')
    .update({ read_at: new Date().toISOString() }).eq('user_id', user.id).is('read_at', null);
  if (error) throw error;
}
