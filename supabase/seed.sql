-- CITYAGENT seed — 1 location (Wuse 2, Abuja) for local dev only.
-- Run after 0001_core.sql. Uses a placeholder owner id; replace with a real auth user.
insert into public.locations (id, state, city, district, neighborhood, landmark, approx_geom)
values (
  '11111111-1111-1111-1111-111111111111',
  'FCT', 'Abuja', 'Wuse', 'Wuse 2', 'Near Banex Plaza',
  ST_GeographyFromText('POINT(7.48 9.08)')
)
on conflict (id) do nothing;
