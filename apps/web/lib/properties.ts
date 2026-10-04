import { supabaseBrowser } from './supabaseClient';
type PropertyStatus = 'draft' | 'submitted' | 'in_review' | 'verified' | 'published' | 'viewing' | 'rented' | 'expired' | 'rejected';

// Owner listing helpers — drafts stay invisible until admin publishes.
export async function createDraft(input: {
  title: string; description: string; property_type: string;
  bedrooms: number; bathrooms: number; toilets: number; furnished: boolean;
  price: number; payment_frequency: string;
  deposit?: number; service_charge?: number; agency_fee?: number; agreement_fee?: number;
  location_id: string; lister_kind?: string;
}) {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Login first at /login.');
  const { data, error } = await supa.from('properties').insert({
    owner_id: user.id, status: 'draft' as PropertyStatus, ...input,
  }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function submitListing(id: string) {
  const supa = supabaseBrowser();
  const { error } = await supa.from('properties').update({ status: 'submitted' }).eq('id', id);
  if (error) throw error;
  // Verification queue row (L3) is created by DB trigger / admin job in later slice.
}

export async function uploadPhoto(propertyId: string, file: File, sort = 0) {
  const supa = supabaseBrowser();
  const path = `${propertyId}/${Date.now()}-${file.name}`;
  const { error: upErr } = await supa.storage.from('public-listings').upload(path, file);
  if (upErr) throw upErr;
  const { data: { publicUrl } } = supa.storage.from('public-listings').getPublicUrl(path);
  const { error: rowErr } = await supa.from('property_images').insert({ property_id: propertyId, url: publicUrl, sort });
  if (rowErr) throw rowErr;
}
