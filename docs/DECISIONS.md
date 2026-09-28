# CITYAGENT — Architecture Decisions (free-only, $0)

All choices constrained to free tiers / open-source for MVP. Revisit only on scale pain.

## ADR-001 — Mobile: Flutter
- **Decision:** Flutter (Dart) single codebase for Android + iOS.
- **Why:** OSS, no license, one team, good maps/camera plugins (`flutter_map`, `image_picker`), builds on GitHub Actions free minutes.
- **Rejected:** React Native (also free, but team leans Dart/Flutter), native Kotlin+Swift (2 codebases, slower).

## ADR-002 — Web: Next.js on Cloudflare Pages (fallback Vercel Hobby)
- **Decision:** Next.js (OSS) static + SSR where needed, hosted free.
- **Why:** Shares design tokens with mobile, free hosting, preview deploys per PR.

## ADR-003 — Backend: Supabase-first, thin NestJS later only if needed
- **Decision:** Supabase Free as primary backend: Postgres + PostGIS + Auth + Storage + Realtime.
- **Why:** $0 for 500MB DB / 50k MAU / 1GB storage / email OTP. Avoids hosting a server Day 1.
- **Rule:** Business rules live in Postgres RLS policies + edge functions first. Add NestJS service only when logic outgrows Supabase (e.g., complex moderation pipelines).
- **Alt DB:** Neon Free (3GB) if Supabase DB limit hits.

## ADR-004 — Maps: OpenStreetMap, no paid key
- **Decision:** Leaflet (web) + flutter_map (mobile), tiles OSM standard, geocode Nominatim/Photon within usage policy.
- **Why:** Fully free, no API key/billing. Google Maps/Mapbox deferred until revenue.
- **Privacy:** store exact `geom` private; serve rounded approx location until viewing accepted.

## ADR-005 — Auth: email OTP first, phone OTP deferred
- **Decision:** Supabase Auth email magic-link/OTP for MVP. Phone OTP deferred (SMS costs money).
- **Why:** Free and sufficient for pilot. Optional Firebase phone free quota later.
- **Roles:** guest/seeker/owner/hotel/agent/admin via RLS + app claims.

## ADR-006 — Storage: Supabase Storage split buckets
- **Decision:** `public/` (listing photos/video, CDN) vs `private/` (ID/ownership docs, encrypted, presigned access, never public).
- **Why:** Free 1GB covers pilot; matches PRD §43 privacy.

## ADR-007 — DevOps: GitHub Actions + Docker Compose local
- **Decision:** GitHub Actions free (2,000 min/mo) for lint/type/test/build; local dev via Docker Compose (Postgres+PostGIS).
- **Observability:** Sentry free (5k events), PostHog free / Firebase Analytics, UptimeRobot free.
- **Secrets:** GitHub Secrets only; `.env` never committed (see `.gitignore`).
