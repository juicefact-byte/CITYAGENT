import { supabaseBrowser } from './supabaseClient';

export type SearchFilters = {
  q?: string; city?: string; min?: number; max?: number;
  beds?: number; type?: string; level?: string; limit?: number;
};

// Published-only search. City via locations join; text via search tsvector.
export async function searchProperties(f: SearchFilters) {
  const supa = supabaseBrowser();
  let q = supa.from('properties')
    .select('id, title, price, payment_frequency, bedrooms, property_type, lister_kind, verification_level, location_id, locations!inner(city, district, neighborhood, approx_geom)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(f.limit ?? 24);
  if (f.q) q = q.textSearch('search', f.q);
  if (f.min != null) q = q.gte('price', f.min);
  if (f.max != null) q = q.lte('price', f.max);
  if (f.beds != null) q = q.gte('bedrooms', f.beds);
  if (f.type) q = q.eq('property_type', f.type);
  if (f.level) q = q.eq('verification_level', f.level);
  if (f.city) q = q.ilike('locations.city', `%${f.city}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
