-- CITYAGENT 0002 — engagement RLS (authenticated users, own-rows only).
-- Run AFTER 0001_core.sql in Supabase SQL editor. Re-runnable (drops first).
-- Admin queue/analytics still use service-role SQL fallbacks in docs/*-TEST.md.

-- ---------- helpers ----------
-- profiles: first-login self-create + public display (phone shown; mask in Phase 2)
drop policy if exists "users insert own" on public.user_profiles;
create policy "users insert own" on public.user_profiles
  for insert with check (auth.uid() = id);
drop policy if exists "users update own" on public.user_profiles;
create policy "users update own" on public.user_profiles
  for update using (auth.uid() = id);
drop policy if exists "profiles readable" on public.user_profiles;
create policy "profiles readable" on public.user_profiles
  for select using (true);

-- locations: approx data is public
drop policy if exists "locations readable" on public.locations;
create policy "locations readable" on public.locations
  for select using (true);

-- properties: widen owner update (mark rented/available from any own status)
drop policy if exists "owner update own draft" on public.properties;
drop policy if exists "owner update own" on public.properties;
create policy "owner update own" on public.properties
  for update using (auth.uid() = owner_id);

-- media: owners attach to own properties
drop policy if exists "owner insert images" on public.property_images;
create policy "owner insert images" on public.property_images
  for insert with check (exists (
    select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()));
drop policy if exists "owner insert videos" on public.property_videos;
create policy "owner insert videos" on public.property_videos
  for insert with check (exists (
    select 1 from public.properties p where p.id = property_id and p.owner_id = auth.uid()));

-- verification: owners open L3 for own submitted properties; read own
drop policy if exists "owner insert verif" on public.verification_records;
create policy "owner insert verif" on public.verification_records
  for insert with check (auth.uid() = user_id);
drop policy if exists "owner read verif" on public.verification_records;
create policy "owner read verif" on public.verification_records
  for select using (auth.uid() = user_id);

-- ownership docs: owners manage own (private bucket; never public)
drop policy if exists "owner docs own" on public.ownership_documents;
create policy "owner docs own" on public.ownership_documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- favorites: own rows fully
drop policy if exists "favorites own" on public.favorites;
create policy "favorites own" on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- chat: participants only; seeker opens
drop policy if exists "conversations participant" on public.conversations;
create policy "conversations participant" on public.conversations
  for all using (auth.uid() = seeker_id or auth.uid() = owner_id)
  with check (auth.uid() = seeker_id);
drop policy if exists "messages participant" on public.messages;
create policy "messages participant" on public.messages
  for all using (exists (
    select 1 from public.conversations c
    where c.id = conversation_id and (c.seeker_id = auth.uid() or c.owner_id = auth.uid())))
  with check (auth.uid() = sender_id);

-- viewings: seeker requests; both read; owner decides
drop policy if exists "viewings insert seeker" on public.viewing_requests;
create policy "viewings insert seeker" on public.viewing_requests
  for insert with check (auth.uid() = seeker_id);
drop policy if exists "viewings read parties" on public.viewing_requests;
create policy "viewings read parties" on public.viewing_requests
  for select using (auth.uid() = seeker_id or auth.uid() = owner_id);
drop policy if exists "viewings owner decides" on public.viewing_requests;
create policy "viewings owner decides" on public.viewing_requests
  for update using (auth.uid() = owner_id or auth.uid() = seeker_id);

-- reports: any login can file; reporter reads own (admin triage via service role)
drop policy if exists "reports file" on public.reports;
create policy "reports file" on public.reports
  for insert with check (true);
drop policy if exists "reports reporter reads" on public.reports;
create policy "reports reporter reads" on public.reports
  for select using (auth.uid() = reporter_id);

-- reviews: login can write; public reads approved
drop policy if exists "reviews approved readable" on public.reviews;
create policy "reviews approved readable" on public.reviews
  for select using (status = 'approved');
drop policy if exists "reviews write own" on public.reviews;
create policy "reviews write own" on public.reviews
  for insert with check (auth.uid() = reviewer_id);

-- notifications: own read/update
drop policy if exists "notifications own" on public.notifications;
create policy "notifications own" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- audit_logs: service role only (no policies = locked for app keys)
