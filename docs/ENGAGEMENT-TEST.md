# Engagement self-test (10 min)

## 1. Favorites
Login → open a published listing → “Save” → `/favorites` shows it → “Unsave” removes it.
```sql
select * from public.favorites where user_id = auth.uid();
```

## 2. Reports (§25)
Submit report with reason + details → admin sees it:
```sql
select id, reason, status from public.reports order by created_at desc limit 5;
```

## 3. Notifications
Trigger manually (until event hooks land):
```sql
insert into public.notifications (user_id, kind, title, body)
values (auth.uid(), 'test', 'Welcome', 'Favorites + reports working.');
```
Open `/me` → unread count → “Mark all read”.

Pass = shortlist works, fraud reports land in queue, user sees own notifications only.
