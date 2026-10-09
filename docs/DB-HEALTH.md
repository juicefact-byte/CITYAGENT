# Bit 1 — Database health check (run once, 5 min)

Run each in Supabase **SQL editor**. All must be green before Bit 2/3.

## 1. Tables exist (expect 14 names)
```sql
select tablename from pg_tables where schemaname='public' order by 1;
```

## 2. Seed location (expect 1 row: Abuja / Wuse / Wuse 2)
```sql
select city, district, neighborhood from public.locations;
```

## 3. Buckets (expect 2 rows)
```sql
select id, public from storage.buckets where id in ('public-listings','private-docs');
```
Want: `public-listings | true`, `private-docs | false`.

## 4. Apply 0003 (photo uploads currently DENIED without it)
Paste `supabase/migrations/0003_storage_rls.sql` → Run → `Success`.

## 5. End-to-end (in the app, logged in as owner)
`/listings/new` → 2+ photos → submit → photo thumbnails appear on details page.
If thumbnails load, storage + DB are properly connected.

Reply with the 5 results (or first red line).
