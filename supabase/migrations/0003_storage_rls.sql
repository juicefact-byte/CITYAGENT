-- CITYAGENT 0003 — storage RLS (Supabase Storage). Re-runnable.
-- Run in Supabase SQL editor AFTER creating buckets:
--   public-listings (Public ON) + private-docs (Public OFF).
-- Without these, photo uploads are denied even when buckets exist.

drop policy if exists "public read listings" on storage.objects;
create policy "public read listings" on storage.objects
  for select using (bucket_id = 'public-listings');

drop policy if exists "auth insert listings" on storage.objects;
create policy "auth insert listings" on storage.objects
  for insert with check (
    bucket_id = 'public-listings' and auth.role() = 'authenticated');

drop policy if exists "owner update listings" on storage.objects;
create policy "owner update listings" on storage.objects
  for update using (
    bucket_id = 'public-listings' and owner = auth.uid());

drop policy if exists "owner delete listings" on storage.objects;
create policy "owner delete listings" on storage.objects
  for delete using (
    bucket_id = 'public-listings' and owner = auth.uid());

drop policy if exists "owner private docs" on storage.objects;
create policy "owner private docs" on storage.objects
  for all using (
    bucket_id = 'private-docs' and owner = auth.uid())
  with check (
    bucket_id = 'private-docs' and owner = auth.uid());
