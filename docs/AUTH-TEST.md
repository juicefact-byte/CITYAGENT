# Phase 4 — Auth self-test (free, 10 min)

Requires: Supabase free project URL + anon key in `apps/web/.env.local` (see root `.env.example`).

## 1. Run web
```powershell
Set-Location "C:\Users\USER\Documents\CITYAGENT\apps\web"
npm install
npm run dev
```
Open `http://localhost:3000/login`: enter email → receive code → verify → open `/me`.

## 2. RLS checks (Supabase SQL editor)
```sql
-- guest sees only published (expect 0+ rows, no drafts)
select id, status from public.properties where status = 'published' limit 5;
-- private docs blocked for anon (expect permission error or 0 rows)
select id from public.ownership_documents limit 1;
-- as owner (after login, via app): drafts visible only to owner
select id, status from public.properties where owner_id = auth.uid();
```

## 3. Create profile row (first login trigger or manual)
```sql
insert into public.user_profiles (id, role, display_name)
values (auth.uid(), 'owner', 'Test Owner')
on conflict (id) do nothing;
```

Pass = login works, `/me` shows role, guest cannot read drafts or `ownership_documents`.
