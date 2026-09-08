-- RidePerks driver platform, additive migration.
-- Run on the SAME Supabase project as the landing. Does not change waitlist
-- or reference-platform tables. No sample businesses, discounts or users.
begin;
create table if not exists public.rp_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '' check(length(full_name) <= 100),
 phone text, platform text check(platform in ('uber','indrive','pedidosya','multiple')),
 role text not null default 'driver' check(role in ('driver','business')),
 status text not null default 'pending' check(status in ('pending','verified','rejected','suspended')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.rp_settings (
 key text primary key, value jsonb not null
);
insert into public.rp_settings values ('free_access','true'::jsonb) on conflict do nothing;
create table if not exists public.rp_businesses (
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(name) between 2 and 120),
 description text not null default '', category text not null default 'otros',
 address text not null, phone text,
 owner_user_id uuid unique references public.rp_profiles(id) on delete set null,
 is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.rp_benefits (
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.rp_businesses(id),
 title text not null check(length(title) between 2 and 140),
 description text not null, discount_label text not null,
 category text not null default 'otros',
 savings_amount numeric(10,2) check(savings_amount >= 0),
 terms text not null, monthly_limit integer check(monthly_limit > 0),
 valid_from date, valid_until date, is_active boolean not null default true,
 created_at timestamptz not null default now(),
 check(valid_until is null or valid_from is null or valid_until >= valid_from)
);
create table if not exists public.rp_verifications (
 id uuid primary key default gen_random_uuid(),
 driver_id uuid not null references public.rp_profiles(id) on delete cascade,
 photo_path text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 admin_notes text, reviewed_at timestamptz, created_at timestamptz not null default now()
);
create unique index if not exists rp_one_pending_verification on public.rp_verifications(driver_id) where status='pending';
create index if not exists rp_verifications_driver on public.rp_verifications(driver_id,created_at desc);
create table if not exists public.rp_qr_tokens (
 id uuid primary key default gen_random_uuid(),
 driver_id uuid not null references public.rp_profiles(id) on delete cascade,
 benefit_id uuid not null references public.rp_benefits(id),
 token uuid not null unique default gen_random_uuid(),
 status text not null default 'pending' check(status in ('pending','used','expired')),
 expires_at timestamptz not null default now() + interval '2 minutes',
 used_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists rp_tokens_driver on public.rp_qr_tokens(driver_id,benefit_id);
create table if not exists public.rp_redemptions (
 id uuid primary key default gen_random_uuid(),
 driver_id uuid not null references public.rp_profiles(id) on delete cascade,
 benefit_id uuid not null references public.rp_benefits(id),
 business_id uuid not null references public.rp_businesses(id),
 qr_token_id uuid not null unique references public.rp_qr_tokens(id),
 benefit_title text not null, business_name text not null,
 savings_amount numeric(10,2), redeemed_at timestamptz not null default now()
);
create index if not exists rp_redemptions_driver_date on public.rp_redemptions(driver_id,redeemed_at desc);
create index if not exists rp_redemptions_limit on public.rp_redemptions(driver_id,benefit_id,redeemed_at);
create index if not exists rp_redemptions_business on public.rp_redemptions(business_id,redeemed_at desc);
create table if not exists public.rp_rate_limits (
 key text primary key, hits integer not null, window_start timestamptz not null
);
create index if not exists rp_rate_limits_time on public.rp_rate_limits(window_start);
create table if not exists public.rp_admin_audit (
 id uuid primary key default gen_random_uuid(), action text not null,
 subject_id uuid, detail jsonb not null default '{}', created_at timestamptz not null default now()
);

-- Never trust signup metadata for role, verification or entitlements.
create or replace function public.rp_handle_new_user() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.rp_profiles(id,full_name,phone,platform)
 values(new.id,left(coalesce(new.raw_user_meta_data->>'full_name',''),100),
 left(new.raw_user_meta_data->>'phone',24),
 case when new.raw_user_meta_data->>'platform' in ('uber','indrive','pedidosya','multiple') then new.raw_user_meta_data->>'platform' else null end)
 on conflict(id) do nothing;
 return new;
end; $$;
drop trigger if exists rp_auth_user_created on auth.users;
create trigger rp_auth_user_created after insert on auth.users for each row execute function public.rp_handle_new_user();
insert into public.rp_profiles(id,full_name)
select id,left(coalesce(raw_user_meta_data->>'full_name',''),100) from auth.users on conflict do nothing;

-- All platform data passes through authenticated Next.js server operations.
-- There are deliberately no anon/authenticated policies, including mutations.
do $$ declare t text; begin
 foreach t in array array['rp_profiles','rp_settings','rp_businesses','rp_benefits','rp_verifications','rp_qr_tokens','rp_redemptions','rp_rate_limits','rp_admin_audit'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on table public.%I from anon, authenticated',t);
  execute format('grant all on table public.%I to service_role',t);
 end loop;
end $$;

create or replace function public.rp_rate_limit(p_key text,p_limit integer,p_seconds integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare count_now integer;
begin
 if p_limit < 1 or p_seconds < 1 or p_seconds > 86400 then return false; end if;
 delete from public.rp_rate_limits where window_start < now()-interval '1 day';
 insert into public.rp_rate_limits as r(key,hits,window_start) values(p_key,1,now())
 on conflict(key) do update set
 hits=case when r.window_start + make_interval(secs=>p_seconds) <= now() then 1 else r.hits+1 end,
 window_start=case when r.window_start + make_interval(secs=>p_seconds) <= now() then now() else r.window_start end
 returning hits into count_now;
 return count_now <= p_limit;
end; $$;

create or replace function public.rp_issue_token(p_driver uuid,p_benefit uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.rp_profiles; b public.rp_benefits; q public.rp_qr_tokens; usages integer; today date := (now() at time zone 'America/Panama')::date;
begin
 select * into p from public.rp_profiles where id=p_driver for update;
 if p.id is null or p.role <> 'driver' or p.status <> 'verified' then raise exception 'Verifica tu cuenta antes de usar beneficios.'; end if;
 if not exists(select 1 from public.rp_settings where key='free_access' and value='true'::jsonb) then raise exception 'El acceso a beneficios no está habilitado.'; end if;
 select * into b from public.rp_benefits where id=p_benefit for update;
 if b.id is null or not b.is_active or (b.valid_from is not null and b.valid_from > today) or (b.valid_until is not null and b.valid_until < today)
 or not exists(select 1 from public.rp_businesses where id=b.business_id and is_active)
 then raise exception 'Este beneficio ya no está disponible.'; end if;
 select count(*) into usages from public.rp_redemptions where driver_id=p_driver and benefit_id=p_benefit
 and redeemed_at >= (date_trunc('month',now() at time zone 'America/Panama') at time zone 'America/Panama');
 if b.monthly_limit is not null and usages >= b.monthly_limit then raise exception 'Ya alcanzaste el límite de usos de este mes.'; end if;
 select * into q from public.rp_qr_tokens where driver_id=p_driver and benefit_id=p_benefit and status='pending' and expires_at>now() order by created_at desc limit 1;
 if q.id is null then
  update public.rp_qr_tokens set status='expired' where driver_id=p_driver and benefit_id=p_benefit and status='pending';
  insert into public.rp_qr_tokens(driver_id,benefit_id) values(p_driver,p_benefit) returning * into q;
 end if;
 return jsonb_build_object('token',q.token,'expires_at',q.expires_at,'status',q.status);
end; $$;

-- One transaction locks the driver, benefit, then token; validates ownership,
-- membership and monthly quota again; and snapshots the actual saving.
create or replace function public.rp_redeem_token(p_owner uuid,p_token uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.rp_qr_tokens; p public.rp_profiles; b public.rp_benefits; shop public.rp_businesses; usages integer; today date := (now() at time zone 'America/Panama')::date;
begin
 select * into shop from public.rp_businesses where owner_user_id=p_owner and is_active;
 if shop.id is null or not exists(select 1 from public.rp_profiles where id=p_owner and role='business' and status<>'suspended') then raise exception 'No tienes acceso a este comercio.'; end if;
 select * into q from public.rp_qr_tokens where token=p_token;
 if q.id is null then raise exception 'Código inválido.'; end if;
 select * into p from public.rp_profiles where id=q.driver_id for update;
 select * into b from public.rp_benefits where id=q.benefit_id for update;
 select * into q from public.rp_qr_tokens where token=p_token for update;
 if b.business_id <> shop.id then raise exception 'Este beneficio pertenece a otro comercio.'; end if;
 if q.status <> 'pending' then raise exception 'Este código ya fue usado o reemplazado.'; end if;
 if q.expires_at <= now() then raise exception 'El código venció. Pide al conductor uno nuevo.'; end if;
 if p.status <> 'verified' or p.role <> 'driver' then raise exception 'La cuenta del conductor no está habilitada.'; end if;
 if not exists(select 1 from public.rp_settings where key='free_access' and value='true'::jsonb) then raise exception 'El acceso a beneficios no está habilitado.'; end if;
 if not b.is_active or (b.valid_from is not null and b.valid_from>today) or (b.valid_until is not null and b.valid_until<today) then raise exception 'El beneficio no está vigente.'; end if;
 select count(*) into usages from public.rp_redemptions where driver_id=p.id and benefit_id=b.id
 and redeemed_at >= (date_trunc('month',now() at time zone 'America/Panama') at time zone 'America/Panama');
 if b.monthly_limit is not null and usages>=b.monthly_limit then raise exception 'El conductor alcanzó el límite de usos del mes.'; end if;
 update public.rp_qr_tokens set status='used',used_at=now() where id=q.id;
 insert into public.rp_redemptions(driver_id,benefit_id,business_id,qr_token_id,benefit_title,business_name,savings_amount)
 values(p.id,b.id,shop.id,q.id,b.title,shop.name,b.savings_amount);
 return jsonb_build_object('driver_name',p.full_name,'benefit_title',b.title,'discount_label',b.discount_label,'savings_amount',b.savings_amount);
end; $$;

create or replace function public.rp_review_verification(p_id uuid,p_approved boolean,p_notes text)
returns void language plpgsql security definer set search_path='' as $$
declare v public.rp_verifications; p public.rp_profiles;
begin
 select * into v from public.rp_verifications where id=p_id;
 if v.id is null then raise exception 'Solicitud inexistente.'; end if;
 select * into p from public.rp_profiles where id=v.driver_id for update;
 select * into v from public.rp_verifications where id=p_id for update;
 if v.status<>'pending' then raise exception 'Esta solicitud ya fue revisada.'; end if;
 if p.status='suspended' then raise exception 'Reactiva la cuenta antes de revisar la verificación.'; end if;
 update public.rp_verifications set status=case when p_approved then 'approved' else 'rejected' end,admin_notes=nullif(left(p_notes,1000),''),reviewed_at=now() where id=p_id;
 update public.rp_profiles set status=case when p_approved then 'verified' else 'rejected' end,updated_at=now() where id=v.driver_id;
 insert into public.rp_admin_audit(action,subject_id,detail) values('verification.review',p_id,jsonb_build_object('approved',p_approved,'notes',left(p_notes,1000)));
end; $$;
revoke all on function public.rp_handle_new_user() from public,anon,authenticated;
revoke all on function public.rp_rate_limit(text,integer,integer) from public,anon,authenticated;
revoke all on function public.rp_issue_token(uuid,uuid) from public,anon,authenticated;
revoke all on function public.rp_redeem_token(uuid,uuid) from public,anon,authenticated;
revoke all on function public.rp_review_verification(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.rp_rate_limit(text,integer,integer), public.rp_issue_token(uuid,uuid), public.rp_redeem_token(uuid,uuid), public.rp_review_verification(uuid,boolean,text) to service_role;
-- Private documents; uploads and short-lived signed URLs are server-only.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('rp-verifications','rp-verifications',false,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];
create or replace function public.rp_save_business(p_id uuid,p_values jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare owner_id uuid := nullif(p_values->>'owner_user_id','')::uuid; saved uuid;
begin
 if owner_id is not null and not exists(select 1 from public.rp_profiles where id=owner_id) then raise exception 'No existe esa cuenta. El responsable debe registrarse primero.'; end if;
 if owner_id is not null and exists(select 1 from public.rp_businesses where owner_user_id=owner_id and (p_id is null or id<>p_id)) then raise exception 'Esta cuenta ya administra otro comercio.'; end if;
 if p_id is null then
 insert into public.rp_businesses(name,description,address,phone,category,owner_user_id)
 values(p_values->>'name',p_values->>'description',p_values->>'address',p_values->>'phone',p_values->>'category',owner_id) returning id into saved;
 else
 update public.rp_businesses set name=p_values->>'name',description=p_values->>'description',address=p_values->>'address',phone=p_values->>'phone',category=p_values->>'category',owner_user_id=owner_id where id=p_id returning id into saved;
 if saved is null then raise exception 'El comercio ya no existe.'; end if;
 end if;
 if owner_id is not null then update public.rp_profiles set role='business',updated_at=now() where id=owner_id; end if;
 insert into public.rp_admin_audit(action,subject_id) values('business.save',saved);
 return saved;
end; $$;
revoke all on function public.rp_save_business(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.rp_save_business(uuid,jsonb) to service_role;
create table if not exists public.rp_support_requests (
 id uuid primary key default gen_random_uuid(),
 driver_id uuid not null references public.rp_profiles(id) on delete cascade,
 topic text not null check(topic in ('benefit','account','privacy','delete')),
 message text not null check(length(message) between 10 and 2000),
 status text not null default 'open' check(status in ('open','resolved')),
 created_at timestamptz not null default now(), resolved_at timestamptz
);
alter table public.rp_support_requests enable row level security;
revoke all on table public.rp_support_requests from anon,authenticated;
grant all on table public.rp_support_requests to service_role;
create index if not exists rp_support_status on public.rp_support_requests(status,created_at);

commit;
