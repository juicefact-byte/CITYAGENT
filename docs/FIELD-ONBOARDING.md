# Field Onboarding — Abuja Pilot (100–300 verified listings)

For the onboarding team. One owner takes ~15 min per listing.

## 1. Create the owner account (2 min)
- Open `/login` → owner’s email → code → verify → `/me` confirms login.
- Flip role in SQL editor:
```sql
insert into public.user_profiles (id, role, display_name, phone)
values ('<USER-UUID from Authentication → Users>', 'owner', '<Name>', '<phone>')
on conflict (id) do update set role='owner', phone=excluded.phone;
```

## 2. Submit the listing (8 min)
- `/listings/new` → title, description, type, beds/baths/toilets, furnished.
- Full costs: rent + deposit + service + agency + agreement (no hidden fees — enter 0, never blank).
- Location: pick the Abuja/Wuse location UUID (seed) or create area row first.
- Photos (min 5): exterior, living, bedroom, kitchen, bathroom, compound, parking, area. Short video if possible.
- Submit → status `submitted`.

## 3. Verify (admin, 5 min)
- `/admin/verifications` (or SQL fallback) → check photos match description, price sane, phone real.
- L3 approve → `published` → confirm in `/search` with badge.

## 4. Quality bar (reject otherwise)
Blurry photos, missing costs, wrong area, stock/internet photos, unreachable phone → Hold with notes, tell owner what to fix.

## 5. Daily target
10–15 verified listings per onboarder per day → 100 in ~2 weeks with 1–2 onboarders.
Track: submitted → verified → published counts in `/admin`.
