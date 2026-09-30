# Verification self-test (10 min)

## 1. Create a queue row (after listings slice submit)
```sql
insert into public.verification_records (property_id, user_id, level)
select p.id, p.owner_id, 'L3' from public.properties p where p.status = 'submitted' limit 1
returning id;
```

## 2. UI attempt
Open `/admin/verifications` as admin. If RLS blocks the anon session (expected until service-role route), use SQL fallback below — the page shows the exact error.

## 3. SQL fallback (service role bypasses RLS)
```sql
-- approve → publish
update public.verification_records set status='approved', decided_at=now() where id='<rec>';
update public.properties set status='published', verification_level='L3' where id=(select property_id from public.verification_records where id='<rec>');
-- guest check: details page now visible logged-out
```

Pass = approve flips property to `published` (guest-visible with badge); reject/hold keeps it invisible + audit trail in `verification_records`.
