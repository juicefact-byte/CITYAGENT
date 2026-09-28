# CITYAGENT API (MVP, Supabase-first)

Base: Supabase project URL + anon key. Admin endpoints use service-role key server-side only.

## Conventions
- Auth: `Authorization: Bearer <supabase JWT>`. Guest read allowed for published only.
- Errors: `{ error: { code, message } }`. Pagination: `?limit&cursor`.
- Money: numbers in Naira, 2dp. No hidden fees — all mandatory charges in payload.

## Endpoints

### Auth / Users
- `POST /auth/otp` → request email OTP {email}
- `POST /auth/verify` → {email, token} → session
- `GET /me` → profile + role + verification summary
- `PATCH /me` → display_name, phone, avatar

### Locations (OSM-backed, free)
- `GET /locations/search?q=wuse` → id, city, district, approx_lat/lon (trgm + Nominatim fallback)
- `GET /locations/:id` → approx only (exact geom never public)

### Properties
- `GET /properties?city=Abuja&min=0&max=3500000&beds=3&type=apartment&verified=L4&features=parking,security&near=9.08,7.48&radiusKm=2` → published only, cursor pages
- `GET /properties/:id` → details + images + costs + badge + approx map
- `POST /properties` (owner) → draft; required: title, description, type, beds/baths/toilets, price, frequency, location_id, features
- `PATCH /properties/:id` (owner, draft/rejected/expired) → edit/reprice
- `POST /properties/:id/submit` → draft → submitted (+ verification_records L3 pending)
- `POST /properties/:id/media` → presigned upload → property_images/videos rows (public bucket)
- `POST /properties/:id/mark` → {status: rented|unavailable} (owner)

### Verification (admin; submit→review→verify→approve→publish)
- `GET /admin/verifications?status=pending` → queue with docs links (private bucket, signed URLs)
- `POST /admin/verifications/:id/decide` → {approved|rejected|hold, notes, level} → on L3 approve: property verified→published + audit_logs row

### Chat / Viewing
- `POST /conversations` → {property_id} → id (property auto-attached)
- `GET /conversations/:id/messages` · `POST /conversations/:id/messages` → {body, image_url?} + block/report flags
- `POST /properties/:id/viewings` → {slot} → requested
- `POST /viewings/:id/decision` (owner) → {accepted|rejected|countered, counter_slot?}

### Favorites / Reports / Reviews / Notifications
- `POST /favorites/:property_id` · `DELETE` · `GET /favorites`
- `POST /reports` → {property_id, reason (§25 enum), details}
- `POST /reviews` (post-stay, moderated) · `GET /properties/:id/reviews?status=approved`
- `GET /notifications` · `POST /notifications/read`

### Admin
- `GET /admin/users` · `POST /admin/users/:id/suspend|ban`
- `GET /admin/reports?status=open` · `POST /admin/reports/:id/resolve`
- `GET /admin/analytics` → users, verified props, searches, views, chats, viewings, reports (§50)

## DTO — Property (create)
```json
{
  "title": "3 Bedroom Apartment",
  "description": "...",
  "property_type": "apartment",
  "bedrooms": 3, "bathrooms": 3, "toilets": 3, "furnished": false,
  "price": 3500000, "payment_frequency": "yearly",
  "deposit": 0, "service_charge": 300000, "agency_fee": 0, "agreement_fee": 150000,
  "location_id": "uuid", "lister_kind": "owner"
}
```

## State machines
Property: draft→submitted→in_review→verified→published→viewing→rented|expired|rejected.
Viewing: requested→accepted|rejected|countered→completed|cancelled.
