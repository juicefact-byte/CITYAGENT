# CITYAGENT mobile (Flutter, free SDK)

> Scaffolded in Phase 3+. This stub locks the free-only choice (ADR-001).

- Framework: Flutter + Dart (one codebase Android/iOS, no license).
- Maps: `flutter_map` + OpenStreetMap tiles (no paid key).
- Theme: mirror `packages/ui/tokens.json` into `ThemeData`:
  - trustGreen `0xFF16A34A`, agentBlue `0xFF2563EB`, radius 14, touch 44.
- Backend: Supabase Flutter SDK (Auth + Postgres + Storage + Realtime) — same free project as web.

Next: `flutter create .` here, add `supabase_flutter`, `flutter_map`, `image_picker`, wire tokens.
