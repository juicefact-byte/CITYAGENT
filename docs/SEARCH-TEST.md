# Search + Map self-test (10 min)

Requires: ≥1 `published` property in Abuja (verification slice).

## 1. Search
Open `/search` → defaults city=Abuja → Search. Expect only published rows with badge + district + price. Drafts/submitted must not appear.

## 2. Filters
Try `max` below the listing price → 0 results. `level=L4` → only L4 rows. Keywords `q=wuse` → trgm/tsvector match.

## 3. Map
Open `/map` → OSM tiles load (no key) → pins for rows with `approx_geom` → popup links to details.

## 4. SQL sanity
```sql
select p.id, p.status, l.city from public.properties p join public.locations l on l.id=p.location_id where p.status='published' limit 5;
```

Pass = published-only, badges visible pre-contact, free tiles, no Google/Mapbox key anywhere.
