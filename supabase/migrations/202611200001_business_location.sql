-- Business map: each business can have a point on the map (Beneficios ->
-- Comercios, web and app). Set by the admin by clicking the map in the
-- business editor; businesses without a point are simply not on the map.
-- Additive and idempotent. Apply before deploying the code that reads it.
begin;

alter table public.rp_businesses
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- Both or neither, and inside Panama (generous box around the country).
alter table public.rp_businesses
  drop constraint if exists rp_businesses_location_check;
alter table public.rp_businesses
  add constraint rp_businesses_location_check check (
    (latitude is null and longitude is null)
    or (
      latitude between 7.0 and 9.8
      and longitude between -83.2 and -77.1
    )
  );

commit;
