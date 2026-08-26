-- Run this ONLY if you already created the waitlist table from an earlier
-- version of schema.sql (the one without email/referrals) and want to
-- upgrade it in place without losing existing signups.
--
-- If you're setting up Supabase for the first time, ignore this file and
-- just run supabase/schema.sql instead.

alter table waitlist
  add column if not exists email text,
  add column if not exists referral_code text,
  add column if not exists referred_by text;

-- Backfill: existing rows need a placeholder email (edit these manually
-- afterwards if you want real addresses) and a generated referral code.
update waitlist
set email = coalesce(email, 'sin-correo-' || id || '@rideperks.local')
where email is null;

update waitlist
set referral_code = coalesce(referral_code, upper(substr(md5(id::text), 1, 6)))
where referral_code is null;

alter table waitlist
  alter column email set not null,
  alter column referral_code set not null;

alter table waitlist
  alter column whatsapp drop not null;

-- Widen the platform check constraint to include pedidosya/multiple.
alter table waitlist drop constraint if exists waitlist_platform_check;
alter table waitlist
  add constraint waitlist_platform_check
  check (platform in ('uber', 'indrive', 'pedidosya', 'multiple'));

alter table waitlist
  add constraint waitlist_referred_by_fkey
  foreign key (referred_by) references waitlist (referral_code) on delete set null;

create unique index if not exists waitlist_email_key on waitlist (lower(email));
create unique index if not exists waitlist_referral_code_key on waitlist (referral_code);
create index if not exists waitlist_referred_by_idx on waitlist (referred_by);

drop index if exists waitlist_whatsapp_key;

create or replace view waitlist_ranked as
select
  w.*,
  coalesce(r.referral_count, 0) as referral_count,
  row_number() over (
    order by coalesce(r.referral_count, 0) desc, w.created_at asc
  ) as position
from waitlist w
left join (
  select referred_by, count(*) as referral_count
  from waitlist
  where referred_by is not null
  group by referred_by
) r on r.referred_by = w.referral_code;
