# @cityagent/ui — Components (MVP)

Source of truth for visuals: `tokens.json` + `tokens.css`. Live demo: `../../design-system-preview.html`.

## Badge (required pre-contact)
Props: `kind: owner|agent|hotel|manager`, `level: L1..L4`. Green/blue/amber/purple per tokens. Min 13px bold, pill.

## Buttons
`Call Owner` (primary green) · `Chat` · `WhatsApp` · `Request Viewing` (neutral) · `Report` (danger). Min touch 44px.

## PropertyCard
Photo strip (5–10) + badge + title + area + distance + price/year + feature chips + cost table (rent/service/agreement). Map sheet variant for pins.

## PriceBreakdown
Rows: rent, deposit, service charge, agency/agreement fees. Dashed dividers. No hidden fees — every mandatory charge listed or marked TBD.

## MapPin + Sheet (OSM, free)
Clustered pins via Leaflet/flutter_map. Public = approx location. Sheet shows photo/price/type/verification/distance.

## Gallery
Min 5 photos: exterior, living, bed, kitchen, bath, compound, parking, area. Video optional.

## ViewingPicker + Chat
Date/time request → accept/reject/counter. Chat bubbles with property attachment + block/report.

## ReportSheet (§25)
Reasons: fake, wrong price, rented, fake owner, misleading photos, fraud, duplicate, wrong location, harassment, other → admin queue.

## SafetyBanner
“Never transfer money before inspection.” + share viewing with trusted contact (listing + approx location + profile + time).

## Flutter mapping
`trustGreen → Color(0xFF16A34A)`, radius 14, `ThemeData` + widget per component above. No paid UI kits.
