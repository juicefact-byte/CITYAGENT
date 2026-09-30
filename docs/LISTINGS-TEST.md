# Listings self-test (10 min)

Requires: `docs/AUTH-TEST.md` passing + seed location id (`supabase/seed.sql`).

## 1. Submit
1. Login → open `/listings/new`.
2. Fill form, location = `11111111-1111-1111-1111-111111111111`, attach 2+ photos.
3. Submit → redirected to `/listings/<id>` with `Status: submitted`.

## 2. Verify invisibility
Guest (logged out) opening `/listings/<id>` must NOT see it (RLS: published only).
Owner sees draft/submitted preview + status note.

## 3. SQL checks
```sql
select id, status from public.properties where id = '<id>';
select count(*) from public.property_images where property_id = '<id>';
```

## 4. Publish (admin, next slice does UI)
```sql
update public.properties set status = 'published' where id = '<id>';
```
Guest can now see details + photos + badge + full costs.

Pass = draft→submitted works, media rows created, public gated on `published`.
