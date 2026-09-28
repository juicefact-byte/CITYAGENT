# Supabase (free tier) — primary backend (ADR-003)

1. Create free project at supabase.com → copy URL + anon key into `.env.local` (see root `.env.example`).
2. Enable extensions: `postgis`, `pg_trgm` (Phase 3 migration does this).
3. Buckets: `public-listings` (public) + `private-docs` (private, RLS only).
4. Auth: email magic-link/OTP on. Phone OTP stays OFF (costs money).

Migrations live in `supabase/migrations/` (Phase 3 writes `0001_core.sql`).
