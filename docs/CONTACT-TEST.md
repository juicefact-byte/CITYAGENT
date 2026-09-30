# Contact self-test (10 min)

Requires: published listing + 2 logins (seeker + owner) — use 2 browsers or incognito.

## 1. Direct contact
Open details → Call/SMS/WhatsApp buttons appear only if owner set `phone` in profile; otherwise “use in-app chat”.

## 2. Chat
Seeker clicks “Chat about this listing” → `/chat/<cid>` → send message → owner opens same URL → replies. Check `messages` rows carry `conversation_id` + property attached via `conversations.property_id`.

## 3. Viewing
Seeker picks date/time → “Request viewing” → owner decides:
```sql
select id, status, slot from public.viewing_requests order by created_at desc limit 5;
update public.viewing_requests set status='accepted' where id='<id>';
```

Pass = badge visible before contact, thread property-attached, viewing requested→accepted, safety banner on details + chat.
