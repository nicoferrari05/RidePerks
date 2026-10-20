-- App features (October 2026), additive: onboarding flag, in-app
-- notifications and announcements, favorites, business hours and media,
-- feedback after a use, account closure cleanup and admin metrics.
begin;

-- Onboarding: new drivers see the welcome screens once. Accounts that exist
-- when this column is first added count as already onboarded.
do $$ begin
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='rp_profiles' and column_name='onboarded_at') then
  alter table public.rp_profiles add column onboarded_at timestamptz;
  update public.rp_profiles set onboarded_at=now();
 end if;
end $$;

-- Opening hours: an array of 7 days (0 = domingo), each null (closed) or
-- ["HH:MM","HH:MM"]. A closing time earlier than the opening one runs past
-- midnight; ["00:00","24:00"] is open all day. Validated in the app.
alter table public.rp_businesses add column if not exists hours jsonb;
alter table public.rp_businesses add column if not exists logo_path text;
alter table public.rp_businesses add column if not exists photo_paths text[] not null default '{}';
do $$ begin
 if not exists(select 1 from pg_constraint where conname='rp_businesses_hours_shape') then
  alter table public.rp_businesses add constraint rp_businesses_hours_shape check(hours is null or (jsonb_typeof(hours)='array' and jsonb_array_length(hours)=7));
 end if;
 if not exists(select 1 from pg_constraint where conname='rp_businesses_photo_count') then
  alter table public.rp_businesses add constraint rp_businesses_photo_count check(coalesce(array_length(photo_paths,1),0)<=6);
 end if;
end $$;
-- Logos and photos are public catalog content; uploads stay server-only.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('rp-business-media','rp-business-media',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=true,file_size_limit=2097152,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

-- Favorites.
create table if not exists public.rp_favorite_benefits(
 driver_id uuid not null references public.rp_profiles(id) on delete cascade,
 benefit_id uuid not null references public.rp_benefits(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(driver_id,benefit_id)
);
create table if not exists public.rp_favorite_businesses(
 driver_id uuid not null references public.rp_profiles(id) on delete cascade,
 business_id uuid not null references public.rp_businesses(id) on delete cascade,
 created_at timestamptz not null default now(),
 primary key(driver_id,business_id)
);

-- Announcements from RidePerks, fanned out as one notification per person.
create table if not exists public.rp_announcements(
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(title) between 3 and 140),
 body text not null check(length(body) between 3 and 1000),
 href text check(href is null or href ~ '^/[A-Za-z0-9/_?=&.%-]*$'),
 audience text not null check(audience in ('drivers','businesses','all')),
 recipients integer not null default 0,
 created_by uuid not null references public.rp_admin_users(user_id),
 created_at timestamptz not null default now()
);
create table if not exists public.rp_notifications(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.rp_profiles(id) on delete cascade,
 kind text not null check(kind in ('verification','payment','redemption','benefit_review','business_review','announcement')),
 title text not null check(length(title) between 1 and 160),
 body text not null default '' check(length(body)<=1000),
 href text check(href is null or href ~ '^/[A-Za-z0-9/_?=&.%-]*$'),
 announcement_id uuid references public.rp_announcements(id) on delete cascade,
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists rp_notifications_user on public.rp_notifications(user_id,created_at desc);
create index if not exists rp_notifications_unread on public.rp_notifications(user_id) where read_at is null;

-- What a driver says after a use: did the business apply the benefit, and
-- how was it. One per redemption, within 30 days.
create table if not exists public.rp_redemption_feedback(
 redemption_id uuid primary key references public.rp_redemptions(id) on delete cascade,
 driver_id uuid not null references public.rp_profiles(id) on delete cascade,
 business_id uuid not null references public.rp_businesses(id),
 rating smallint not null check(rating between 1 and 5),
 applied boolean not null,
 comment text not null default '' check(length(comment)<=500),
 created_at timestamptz not null default now()
);
create index if not exists rp_feedback_business on public.rp_redemption_feedback(business_id,created_at desc);

do $$ declare t text; begin foreach t in array array['rp_favorite_benefits','rp_favorite_businesses','rp_announcements','rp_notifications','rp_redemption_feedback'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
end loop; end $$;

create or replace function public.rp_notify(p_user uuid,p_kind text,p_title text,p_body text,p_href text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if p_user is null then return; end if;
 insert into public.rp_notifications(user_id,kind,title,body,href)
 select p_user,p_kind,left(p_title,160),left(coalesce(p_body,''),1000),p_href
 where exists(select 1 from public.rp_profiles where id=p_user and closed_at is null);
end; $$;

-- Events become notifications in the database, whichever path caused them
-- (account scan, PIN scan, Yappy notice, manual credit, admin review).
create or replace function public.rp_notify_redemption() returns trigger language plpgsql security definer set search_path='' as $$
begin
 perform public.rp_notify(new.driver_id,'redemption','Usaste '||new.benefit_title,
  new.business_name||case when new.savings_amount is not null then ' · Ahorraste $'||to_char(new.savings_amount,'FM999990.00') else '' end||'. Cuéntanos cómo te fue.',
  '/driver/history');
 return new;
end; $$;
drop trigger if exists rp_redemption_notify on public.rp_redemptions;
create trigger rp_redemption_notify after insert on public.rp_redemptions for each row execute function public.rp_notify_redemption();

create or replace function public.rp_notify_payment() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='paid' and old.status is distinct from 'paid' then
  perform public.rp_notify(new.driver_id,'payment','Recibimos tu pago',
   'Tu membresía está activa hasta el '||to_char(new.period_end at time zone 'America/Panama','DD/MM/YYYY')||'.','/driver/membership');
 end if;
 return new;
end; $$;
drop trigger if exists rp_payment_notify on public.rp_payment_orders;
create trigger rp_payment_notify after update of status on public.rp_payment_orders for each row execute function public.rp_notify_payment();

create or replace function public.rp_notify_verification() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='pending' and new.status='approved' then
  perform public.rp_notify(new.driver_id,'verification','Tu cuenta está verificada','Ya puedes usar los beneficios de RidePerks.','/driver/membership');
 elsif old.status='pending' and new.status='rejected' then
  perform public.rp_notify(new.driver_id,'verification','Necesitamos una nueva imagen',coalesce(new.admin_notes,'Sube otra captura de tu perfil de conductor.'),'/driver/verify');
 end if;
 return new;
end; $$;
drop trigger if exists rp_verification_notify on public.rp_verifications;
create trigger rp_verification_notify after update of status on public.rp_verifications for each row execute function public.rp_notify_verification();

create or replace function public.rp_notify_benefit_review() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='pending' and new.status in ('approved','returned') then
  perform public.rp_notify(new.created_by,'benefit_review',
   case when new.status='approved' then 'Beneficio aprobado: ' else 'Revisa tu propuesta: ' end||coalesce(new.payload->>'title',''),
   case when new.status='approved' then 'RidePerks publicó tu beneficio.' else coalesce(new.review_notes,'RidePerks pidió cambios.') end,
   '/business/benefits');
 end if;
 return new;
end; $$;
drop trigger if exists rp_benefit_review_notify on public.rp_benefit_revisions;
create trigger rp_benefit_review_notify after update of status on public.rp_benefit_revisions for each row execute function public.rp_notify_benefit_review();

create or replace function public.rp_notify_business_review() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if old.status='pending' and new.status in ('approved','returned') then
  perform public.rp_notify(new.created_by,'business_review',
   case when new.status='approved' then 'Cambio de datos aprobado' else 'Tu cambio de datos necesita revisión' end,
   case when new.status='approved' then 'Ya se ve la nueva información de tu comercio.' else coalesce(new.review_notes,'RidePerks pidió cambios.') end,
   '/business/account');
 end if;
 return new;
end; $$;
drop trigger if exists rp_business_review_notify on public.rp_business_changes;
create trigger rp_business_review_notify after update of status on public.rp_business_changes for each row execute function public.rp_notify_business_review();

create or replace function public.rp_send_announcement(p_admin uuid,p_title text,p_body text,p_href text,p_audience text)
returns integer language plpgsql security definer set search_path='' as $$
declare a uuid; n integer;
begin
 if not exists(select 1 from public.rp_admin_users where user_id=p_admin and is_active) then raise exception 'Identifica tu cuenta de administrador.'; end if;
 if length(trim(coalesce(p_title,''))) not between 3 and 140 then raise exception 'Escribe un título de 3 a 140 caracteres.'; end if;
 if length(trim(coalesce(p_body,''))) not between 3 and 1000 then raise exception 'Escribe un mensaje de 3 a 1000 caracteres.'; end if;
 if p_audience not in ('drivers','businesses','all') or p_audience is null then raise exception 'Elige a quién enviarlo.'; end if;
 if p_href is not null and p_href !~ '^/[A-Za-z0-9/_?=&.%-]*$' then raise exception 'El enlace debe ser una ruta de RidePerks, por ejemplo /driver/benefits.'; end if;
 insert into public.rp_announcements(title,body,href,audience,created_by) values(trim(p_title),trim(p_body),p_href,p_audience,p_admin) returning id into a;
 insert into public.rp_notifications(user_id,kind,title,body,href,announcement_id)
 select id,'announcement',trim(p_title),trim(p_body),p_href,a from public.rp_profiles
 where closed_at is null and (p_audience='all' or (p_audience='drivers' and role='driver') or (p_audience='businesses' and role='business'));
 get diagnostics n = row_count;
 update public.rp_announcements set recipients=n where id=a;
 insert into public.rp_admin_audit(action,subject_id,actor_id,detail) values('announcement.send',a,p_admin,jsonb_build_object('audience',p_audience,'recipients',n));
 return n;
end; $$;

create or replace function public.rp_leave_feedback(p_driver uuid,p_redemption uuid,p_rating integer,p_applied boolean,p_comment text)
returns void language plpgsql security definer set search_path='' as $$
declare r public.rp_redemptions;
begin
 select * into r from public.rp_redemptions where id=p_redemption and driver_id=p_driver;
 if r.id is null then raise exception 'Uso inexistente.'; end if;
 if r.redeemed_at < now()-interval '30 days' then raise exception 'Ya pasó el plazo para calificar este uso.'; end if;
 if p_rating is null or p_rating not between 1 and 5 or p_applied is null then raise exception 'Elige de 1 a 5 estrellas.'; end if;
 insert into public.rp_redemption_feedback(redemption_id,driver_id,business_id,rating,applied,comment)
 values(r.id,p_driver,r.business_id,p_rating,p_applied,left(trim(coalesce(p_comment,'')),500))
 on conflict(redemption_id) do nothing;
 if not found then raise exception 'Ya calificaste este uso.'; end if;
end; $$;

-- Closing an account also removes favorites and notifications and blanks
-- feedback comments (ratings stay, anonymous, for the business's record).
create or replace function public.rp_close_profile(p_id uuid, p_reason text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if length(trim(coalesce(p_reason,''))) not between 3 and 1000 then raise exception 'Escribe el motivo del cierre.'; end if;
 perform 1 from public.rp_profiles where id=p_id for update;
 if not found then raise exception 'Cuenta inexistente.'; end if;
 update public.rp_profiles set full_name='',phone=null,platform=null,status='suspended',closed_at=now(),updated_at=now() where id=p_id;
 update public.rp_business_members set is_active=false where user_id=p_id and is_active;
 delete from public.rp_favorite_benefits where driver_id=p_id;
 delete from public.rp_favorite_businesses where driver_id=p_id;
 delete from public.rp_notifications where user_id=p_id;
 update public.rp_redemption_feedback set comment='' where driver_id=p_id;
 insert into public.rp_admin_audit(action,subject_id,detail) values('profile.close',p_id,jsonb_build_object('reason',p_reason));
end; $$;

-- One round trip for the admin dashboard. Months and days in Panama time.
create or replace function public.rp_admin_metrics() returns jsonb language sql stable security definer set search_path='' as $$
 with bounds as (
  select (date_trunc('month',now() at time zone 'America/Panama') at time zone 'America/Panama') as month_start,
  (date_trunc('month',(now() at time zone 'America/Panama')-interval '1 month') at time zone 'America/Panama') as prev_start,
  ((now() at time zone 'America/Panama')::date-29) as since_day
 ), drivers as (select * from public.rp_profiles where role='driver' and closed_at is null)
 select jsonb_build_object(
  'drivers',(select count(*) from drivers),
  'verified',(select count(*) from drivers where status='verified'),
  'with_access',(select count(*) from drivers where status='verified' and public.rp_has_access(id)),
  'pending_verifications',(select count(*) from public.rp_verifications where status='pending'),
  'businesses',(select count(*) from public.rp_businesses where is_active),
  'benefits',(select count(*) from public.rp_benefits b join public.rp_businesses s on s.id=b.business_id where b.is_active and s.is_active),
  'open_support',(select count(*) from public.rp_support_requests where status='open'),
  'pending_reviews',(select count(*) from public.rp_benefit_revisions where status='pending')+(select count(*) from public.rp_business_changes where status='pending'),
  'revenue_month',(select coalesce(sum(amount_cents),0) from public.rp_payment_orders,bounds where status='paid' and paid_at>=month_start),
  'revenue_prev',(select coalesce(sum(amount_cents),0) from public.rp_payment_orders,bounds where status='paid' and paid_at>=prev_start and paid_at<month_start),
  'uses_month',(select count(*) from public.rp_redemptions,bounds where redeemed_at>=month_start),
  'uses_prev',(select count(*) from public.rp_redemptions,bounds where redeemed_at>=prev_start and redeemed_at<month_start),
  'savings_month',(select coalesce(sum(savings_amount),0) from public.rp_redemptions,bounds where redeemed_at>=month_start),
  'signups_month',(select count(*) from drivers,bounds where created_at>=month_start),
  'rating_avg',(select round(avg(rating)::numeric,2) from public.rp_redemption_feedback where created_at>now()-interval '90 days'),
  'ratings',(select count(*) from public.rp_redemption_feedback where created_at>now()-interval '90 days'),
  'not_applied',(select count(*) from public.rp_redemption_feedback where not applied and created_at>now()-interval '90 days'),
  'signups_daily',(select coalesce(jsonb_agg(jsonb_build_object('day',d,'value',(select count(*) from drivers where (created_at at time zone 'America/Panama')::date=d)) order by d),'[]'::jsonb)
   from bounds,generate_series(since_day,(now() at time zone 'America/Panama')::date,interval '1 day') as g(x),lateral (select x::date as d) dd),
  'uses_daily',(select coalesce(jsonb_agg(jsonb_build_object('day',d,'value',(select count(*) from public.rp_redemptions where (redeemed_at at time zone 'America/Panama')::date=d)) order by d),'[]'::jsonb)
   from bounds,generate_series(since_day,(now() at time zone 'America/Panama')::date,interval '1 day') as g(x),lateral (select x::date as d) dd)
 );
$$;

revoke all on function public.rp_notify(uuid,text,text,text,text),public.rp_notify_redemption(),public.rp_notify_payment(),public.rp_notify_verification(),public.rp_notify_benefit_review(),public.rp_notify_business_review(),public.rp_send_announcement(uuid,text,text,text,text),public.rp_leave_feedback(uuid,uuid,integer,boolean,text),public.rp_admin_metrics() from public,anon,authenticated;
grant execute on function public.rp_send_announcement(uuid,text,text,text,text),public.rp_leave_feedback(uuid,uuid,integer,boolean,text),public.rp_admin_metrics() to service_role;

commit;
