# CITYAGENT — Pilot Checklist (Abuja Wuse, MVP exit)

Docs-only items must be DONE before onboarding the first 100 listings.

## Build (this repo)
- [x] Phase 0: docs, decisions, scope freeze
- [x] Phase 1: tokens + components + UX flows
- [x] Phase 2: monorepo scaffold (web/mobile/shared/supabase/infra)
- [x] Phase 3: 14-table model + RLS + API + seed
- [x] Phase 4: email-OTP auth + RLS self-test
- [x] Listings: submit + media + detail + costs + badge
- [x] Verification: queue + publish gating
- [x] Search + OSM map (published-only)
- [x] Contact: chat + viewing + call/sms/whatsapp
- [x] Engagement: favorites + reports + notifications
- [x] Dashboards: owner signals + admin triage

## Before pilot
- [ ] `npm install && npm run build` green in `apps/web`
- [ ] Supabase project created, `0001_core.sql` + seed applied, buckets `public-listings`/`private-docs` live
- [ ] All `docs/*-TEST.md` pass against staging (auth→publish→search→chat→viewing→report→dashboards)
- [ ] Safety copy live (details + chat banners), approx-location only
- [ ] 100–300 real verified Abuja listings seeded by field team
- [ ] Metrics baseline: searches, views, chats, viewings, reports (§50)

## Exit (expand to City 2)
>70% verified, search→chat >8%, report rate <2%, median verify <24h.
