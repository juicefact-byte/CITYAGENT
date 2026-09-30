import { supabaseBrowser } from './supabaseClient';

// Chat is property-attached; viewing slots gated on published listings.
export async function startConversation(propertyId: string) {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Login first at /login.');
  const { data: prop, error: pErr } = await supa.from('properties').select('id, owner_id').eq('id', propertyId).single();
  if (pErr) throw pErr;
  const { data, error } = await supa.from('conversations').insert({
    property_id: propertyId, seeker_id: user.id, owner_id: prop.owner_id,
  }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function listMessages(conversationId: string) {
  const supa = supabaseBrowser();
  const { data, error } = await supa.from('messages').select('*').eq('conversation_id', conversationId).order('created_at');
  if (error) throw error;
  return data;
}

export async function sendMessage(conversationId: string, body: string) {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Login first at /login.');
  const { error } = await supa.from('messages').insert({ conversation_id: conversationId, sender_id: user.id, body });
  if (error) throw error;
}

export async function requestViewing(propertyId: string, slotIso: string) {
  const supa = supabaseBrowser();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('Login first at /login.');
  const { data: prop, error: pErr } = await supa.from('properties').select('id, owner_id').eq('id', propertyId).single();
  if (pErr) throw pErr;
  const { data, error } = await supa.from('viewing_requests')
    .insert({ property_id: propertyId, seeker_id: user.id, owner_id: prop.owner_id, slot: slotIso })
    .select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function decideViewing(id: string, decision: 'accepted' | 'rejected' | 'countered', counterSlot?: string) {
  const supa = supabaseBrowser();
  const { error } = await supa.from('viewing_requests').update({
    status: decision, counter_slot: counterSlot ?? null,
  }).eq('id', id);
  if (error) throw error;
}
