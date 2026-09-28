# CITYAGENT

> **Find accommodation without the guesswork. Know who you are dealing with.**

CITYAGENT is a trusted property & accommodation marketplace for Nigeria (starting with one pilot city), connecting property seekers directly with verified owners, hotels, short-let operators, and transparently identified agents/property managers.

Platforms: Android, iOS, Web.

## Problem

People arriving in a new city must walk street-to-street, rely on opaque agents, face unclear/hidden fees (agency, inspection, agreement, service charges), and risk fraud from fake listings and impersonated owners.

## Solution

A verification-first marketplace built on:

**VERIFICATION + TRANSPARENCY + DIRECT COMMUNICATION + LOCATION + CONVENIENCE**

Every listing clearly shows, before contact:

- 🟢 OWNER — VERIFIED, or
- 🔵 AGENT — VERIFIED, or
- 🏨 HOTEL — VERIFIED, or
- 🟣 PROPERTY MANAGER — VERIFIED

Workflow: `Submit → Review → Verify → Approve → Publish`. No listing becomes searchable by upload alone.

## Key Features

- Search by city / area / neighborhood / landmark, price, bedrooms, type, verification, features
- Search-on-map + Near-me
- Rich property pages: 5–10 photos, video, full cost breakdown, features, approximate map location
- Direct contact: call, SMS, in-app chat, WhatsApp, viewing/inspection booking (accept/reject/reschedule)
- Favorites, property comparison, reviews, fraud reporting (`Report Listing`)
- Owner dashboard: listings, verification status, views/saves/calls/messages analytics
- Hotel/short-stay section: rooms, nightly rates, availability, amenities
- Admin dashboard: users, property approval, verification review, fraud reports, analytics
- Safety: never-transfer-money warnings, inspection sharing with trusted contact
- Future: AI matching / City Assistant, payments (CITYAGENT Pay), moving & services

Full spec: see `docs/PRD.md` (PRD v1.0, 60 sections). Decisions: `docs/DECISIONS.md`. Frozen scope: `docs/MVP-SCOPE.md`. Build order: `IMPLEMENTATION_PLAN.md`. Visual tokens/components: `design-system-preview.html` (open in browser).

## MVP Scope (v1)

**User:** register/login, browse/search/filter, location + map, details + photos + price + badges, call/chat, favorites, report, viewing request, notifications.
**Owner:** register, identity verification, submit property, verification, photos/price/features, manage listings, chat, handle viewings, mark rented.
**Admin:** user management, property approval, verification review, fraud reports, listing/complaint management, analytics.

Phase 2: hotel booking, online payments, comparison, AI search, subscriptions/featured listings.
Phase 3: Pay, Move, Services, Inspect ecosystem.

## Tech Stack (recommended)

- Mobile: Flutter or React Native (single codebase)
- Web: React / Next.js
- Backend: Node.js / NestJS
- DB: PostgreSQL
- Maps: Google Maps or Mapbox
- Storage: cloud object storage (photos, videos, verification docs — private, encrypted)
- Auth: phone OTP + email/password/social
- Notifications: push + SMS/email

## Repo Structure

```text
docs/PRD.md                # Full Product Requirements Document
docs/DECISIONS.md          # Free-only architecture decisions
docs/MVP-SCOPE.md          # Frozen v1 scope + pilot city
IMPLEMENTATION_PLAN.md     # Phased build plan
design-system-preview.html # Visual design system (open offline)
README.md                  # This file
```

App code (`apps/mobile`, `apps/web`, `apps/api`) to be scaffolded next.

## Getting Started

Currently docs-only. To start building:

1. Freeze MVP scope above.
2. Define DB schema + API contracts from PRD §57.
3. Scaffold mobile/web/api and implement Phase 1–7 build order in PRD §Recommended MVP Build Order.

## Trust & Legal Note

CITYAGENT provides verification information, reporting, and safety guidance — it does not guarantee every transaction. Collect sensitive ID/ownership docs only where legally necessary (NDPR/NIN compliance), store securely, never expose publicly.

## License

TBD.
