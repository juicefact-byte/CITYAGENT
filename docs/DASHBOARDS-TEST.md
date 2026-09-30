# Dashboards self-test (10 min)

## 1. Owner (`/owner`)
Login as owner → listings grouped by status with saves/chats/viewings → Mark rented → status flips → Mark available → back to published.

## 2. Admin (`/admin`)
Login as admin. If RLS blocks anon reads (expected until service-role route), use SQL fallback:
```sql
select status, count(*) from public.properties group by status;
select count(*) from public.verification_records where status='pending';
select * from public.reports where status='open' order by created_at desc limit 10;
update public.reports set status='actioned' where id='<id>';
```

Pass = owner manages availability without support; admin sees marketplace health + triages fraud.
