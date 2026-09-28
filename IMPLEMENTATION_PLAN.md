# CITYAGENT — Implementation Plan

> Source: `CITYAGENT/CITYAGENT.md` (PRD v1.0, 60 sections) + `README.md` MVP scope.
> Principle: **Verification + Transparency + Direct Communication + Location + Convenience**
> Workflow: `Submit → Review → Verify → Approve → Publish`
> Promise: **"Find accommodation without the guesswork. Know who you are dealing with."**
> Constraint: **FREE TOOLS ONLY** — every pick below is $0 tier / open-source. No paid maps, SMS, or hosting required for MVP.

Repo state at planning time: docs-only + OpenCode bot workflow. `indicator/` (MT5 PRD) is out of scope — relocate/delete.

---

## Phase 0 — Hygiene, Decisions, MVP Freeze (0.5 week)

**Goals:** clean repo, lock scope, pick vendors/pilot city.

**Tasks:**
- Relocate `indicator/New folder/Absolutelystrategy .md` out of repo. Flatten `CITYAGENT/CITYAGENT.md` → `docs/PRD.md`.
- Create `docs/DECISIONS.md` (ADR-001..007, free-only): Flutter, Next.js, Supabase (Postgres+Auth+Storage), OpenStreetMap+Leaflet/flutter_map, FCM push, email-OTP auth, GitHub Actions CI, Cloudflare Pages/Vercel Hobby hosting.
- Freeze MVP to PRD §45/§59 MUST: search, listings, photos, price, location, verification badges, call/chat, viewing request, favorites, report, admin verify.
- Pick pilot city (1 city, strong rental + student/worker demand).

**Accept:** `docs/MVP-SCOPE.md` signed, no Phase-2 items in sprint (payments, AI, comparison, virtual tours).

---

## Phase 1 — Design System + UX (1–2 weeks)

**Tokens:** color (🟢 owner, 🔵 agent, 🏨 hotel, 🟣 manager; trust green), type scale, 4pt spacing, radius, elevation, dark/light, AA contrast.

**Components (mobile-first, shared web):**
Badges (verification L1-L4), price-breakdown card (rent+deposit+service+agency/agreement), photo gallery (5–10 min), map pin + bottom-sheet card, viewing date/time picker, report sheet (§25 taxonomy), safety banner (“Never transfer money before inspection”).

**Screens:** Home (Rent / Hotel + Where + Budget), Search + Filters, Map + Near-me (“12 within 2km”), Property Details, Chat (property-attached), Owner Submit wizard, Owner Dashboard, Admin Review queue, My Dashboard (saved/views/messages/viewings).

**Accept:** Penpot (free, open-source) or Figma Free clickable for §54/§55 journeys; badge visible before contact; `packages/ui` storybook builds.

---

## Phase 2 — Architecture, FREE-ONLY (1 week)

**Monorepo (all OSS, $0):**
```text
apps/mobile (Flutter — free SDK, builds on GitHub Actions free minutes)
apps/web (Next.js + React — OSS, hosted on Cloudflare Pages or Vercel Hobby free)
apps/api (NestJS + Node — OSS; OR thin layer over Supabase to stay free)
packages/shared (types, validation)
packages/ui (design system)
docs/ (PRD, ADRs, OpenAPI)
infra/ (Docker Compose for local Postgres/PostGIS/Redis — all OSS)
```

**Free-only stack table:**
| Need | Free pick | Why / limit |
|---|---|---|
| App | Flutter | OSS, one codebase Android+iOS, no license |
| Web | Next.js + Cloudflare Pages / Vercel Hobby | OSS + free static hosting |
| DB + Auth + Storage | Supabase Free (Postgres + PostGIS + Auth + 1GB storage) | 500MB DB, 50k monthly active users, email OTP free |
| Alt DB | Neon Free (3GB Postgres) | use if Supabase limits hit |
| Maps + geocode | OpenStreetMap + Leaflet (web) / flutter_map (mobile) + Nominatim/Photon | fully free, no key; respect usage policy, self-host Photon later |
| Push | Firebase Cloud Messaging (FCM) | free unlimited push |
| Auth OTP | Supabase email magic-link/OTP (free); phone OTP deferred (SMS costs) | MVP uses email + optional Firebase phone free quota |
| Chat realtime | Supabase Realtime (free quota) | no paid socket server |
| CI/CD | GitHub Actions free (2,000 min/mo) | lint/type/test/build |
| Design | Penpot (OSS) or Figma Free | $0 handoff |
| Analytics | PostHog Cloud free tier / Firebase Analytics free | product metrics §50 |
| Errors/logs | Sentry free tier (5k events/mo) | crash reporting |
| Uptime | UptimeRobot free / GitHub Actions schedule | basic monitoring |

**Backend modules:** auth, users, properties, media, locations/geo, verification, search, chat, viewings, favorites, reports, reviews, notifications, admin/analytics.

**Data/infra ($0):** Supabase Postgres + PostGIS + pg_trgm (or local Docker Postgres for dev), Supabase Storage split: `public/` photos/video (CDN) vs `private/` encrypted ID/ownership docs, presigned uploads. No Redis server needed Day 1 — use Supabase queues/cron + GitHub Actions schedule for expiry reminders; add Upstash Redis free later if needed. Secrets in GitHub Secrets. Envs dev/staging/prod on free tiers.

**Key rules:** approx map public, exact hidden until viewing accepted (§13); docs never public (§43); every listing needs review (§58).

---

## Phase 3 — Data Model + API Contracts (1 week)

**Core tables:** users, user_profiles, properties, property_units, property_images, property_videos, locations (State/City/LGA/district/landmark + geom), verification_records (L1 phone, L2 identity, L3 property, L4 owner), ownership_documents (private), favorites, conversations, messages, viewing_requests, reports, reviews, notifications, audit_logs. Hotels/rooms/bookings stubbed for Phase 2.

**State machines:**
- Property: `draft → submitted → in_review → verified → published → viewing → rented | expired | rejected`
- Viewing: `requested → accepted | rejected | countered → completed | cancelled`
- Listing expiry auto-nudge (“still available?” §41); duplicate detection (address/photo/phone/coords §42).

**API:** OpenAPI + DTO validation, cursor pagination, idempotency keys for submit/viewing, RBAC (guest/seeker/owner/hotel/agent/admin), audit on approve/reject/suspend.

---

## Phase 4 — Auth, Users, Profiles (1 week)

Guest browse; OTP + email/password/social; 6 roles (§5); KYC upload → private bucket; NDPR consent + retention policy; suspend/ban + audit.

---

## Phase 5 — Listings + Media (1–2 weeks)

Wizard: Basic (§10) + Financial (full transparency §10-§11) + Features (§12) + Location (§13) + Media (exterior/living/bed/kitchen/bath/compound/parking/area, 5–10 photos + video). Draft autosave, edit price, mark unavailable/rented.

---

## Phase 6 — Verification (differentiator, 1–2 weeks)

Admin queue: L1 phone → L2 identity (NIN/passport/license, minimal collection) → L3 property docs/photos/video → L4 owner. Public badges only. SLA target <24h. Metrics: % verified, time-to-verify, reject reasons.

---

## Phase 7 — Search, Filters, Map, Near-me (1–2 weeks)

Filters §14 (location/type/price/bedrooms/verification/features), full-text + PostGIS KNN, map clustering, pin → sheet (photo/price/type/verification/distance). Empty-state + saved-search alerts (post-MVP notify).

---

## Phase 8 — Details, Contact, Chat, Viewing (1–2 weeks)

Details page §17 (costs, features, verification, approx map). Call/SMS/WhatsApp deep-links (masked numbers Phase 2), in-app chat with property attach + block/report, viewing accept/reject/counter, inspection-share to trusted contact (§38).

---

## Phase 9 — Favorites, Reports, Notifications (1 week)

My Dashboard (§31), favorites + recently viewed, Report Listing (§25) → admin triage, notifications §35 (match, price drop, message, viewing, verification, expiry).

---

## Phase 10 — Owner + Admin Dashboards (1–2 weeks)

Owner §32: listings by status, views/saves/calls/messages/viewings analytics, edit/reprice/availability. Admin §34: users, approvals, verification, fraud reports, analytics §50 (marketplace/engagement/conversion/trust).

---

## Phase 11 — NFR, Privacy, Security, Anti-fraud (parallel + 1 week hardening)

NDPR/NIN minimization, encrypted private docs, RBAC, OTP rate-limit, secure upload, fraud signals (duplicate, price outlier, report velocity), “never pay before inspection” interstitial, perf budgets (p95 search <800ms, image <200KB thumb, map <1000 pins clustered), Sentry/logging, backups/PITR.

---

## Phase 12 — Pilot Launch (2–4 weeks)

Supply first (§52): onboard 100–300 real verified listings in 1 city via field team. Concierge upload tool. Track §50 metrics weekly. City1 → City2 → national.

**Exit:** >70% verified listings, search→chat >8%, report rate <2%, median verify <24h.

---

## Phase 13 — Phase 2/3 (post-MVP)

Hotel/short-stay booking → payments (Phase 2 first), comparison, AI “Find My Ideal Home”/City Assistant (assist only), featured/agent subscriptions, virtual tours, CITYAGENT Pay/Move/Services/Inspect.

---

## Build Order (PRD)

Phase1 accounts+listings → Phase2 verification → Phase3 search/map → Phase4 details/profiles → Phase5 call/chat/viewing → Phase6 favorites/notifs/report → Phase7 admin → Phase8 pilot → feedback → expand + booking/payments.

## Immediate Next Actions

1. Remove `indicator/` from scope, create `docs/` + ADRs.
2. Approve design tokens + stack choices.
3. Generate `schema.sql` + `openapi.yaml` from Phase 3, then scaffold `apps/*`.
