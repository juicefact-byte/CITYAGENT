# CITYAGENT — API Contracts (MVP, Supabase-first)

No custom server Day 1. Clients use Supabase JS (free) against `0001_core.sql` tables + Storage + Auth.
Add NestJS only when logic outgrows RLS/edge functions (ADR-003).

## Reads (public)
- `GET published properties` → `properties` select `status=published`, order `created_at desc`, filters: `city`, `area`, `property_type`, `bedrooms gte`, `rent_amount lte/gte`, `verification_level`, `features contains`.
- `GET nearby` → PostGIS `ST_DWithin(geom, point, radius_m)` + `approx_geom` returned (exact `geom` never selected publicly).
- `GET property + images` → `properties` by id + `property_images` order `sort`.
- `GET reviews` → `reviews` by `property_id`.

## Writes (authed, RLS)
- `POST properties` (status `draft`) → owner creates; `PATCH` own row (edit/reprice/unavailable).
- `POST submit` → set own property `draft→submitted`. (Admin moves `submitted→in_review→verified→published` via dashboard/service role.)
- `POST property_images` → upload to `public-listings/` then insert row.
- `POST ownership_documents` → upload to `private-docs/` then insert metadata row (never public).
- `POST favorites` / DELETE → own rows.
- `POST conversations` + `POST messages` (Realtime subscribe on `messages`).
- `POST viewing_requests` (slot) → owner PATCH `requested→accepted|rejected|countered`.
- `POST reports` (reason taxonomy §25) → admin triage.
- `POST verification_records` → admin/service role only.

## Guards
- State transitions enforced in app + checked in Phase 4 RPC (`submit_property`, `decide_viewing`) — added when edge functions land.
- Exact `geom` selected only by owner/admin roles; clients request `approx_geom`.
