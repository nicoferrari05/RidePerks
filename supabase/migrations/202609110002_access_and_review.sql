begin;
create table if not exists public.rp_admin_users(user_id uuid primary key references public.rp_profiles(id),is_active boolean not null default true,created_at timestamptz not null default now());
create table if not exists public.rp_access_grants(
 id uuid primary key default gen_random_uuid(),driver_id uuid not null references public.rp_profiles(id),
 kind text not null check(kind in ('trial','courtesy','extension','lifetime')),
 starts_at timestamptz not null default now(),ends_at timestamptz,
 lifetime boolean not null default false,status text not null default 'active' check(status in ('active','cancelled')),
 reason text not null check(length(reason) between 3 and 1000),created_by uuid not null references public.rp_admin_users(user_id),
 created_at timestamptz not null default now(),check((lifetime and ends_at is null and kind='lifetime') or (not lifetime and ends_at>starts_at and kind<>'lifetime'))
);
create index if not exists rp_access_driver on public.rp_access_grants(driver_id,ends_at) where status='active';
create table if not exists public.rp_access_controls(driver_id uuid primary key references public.rp_profiles(id),status text not null check(status in ('enabled','suspended','cancelled')),reason text not null,changed_by uuid not null references public.rp_admin_users(user_id),changed_at timestamptz not null default now());
alter table public.rp_admin_audit add column if not exists actor_id uuid references public.rp_profiles(id);
create or replace function public.rp_access_state(p_driver uuid) returns jsonb language sql stable security definer set search_path='' as $$
 with grants as(select * from public.rp_access_grants where driver_id=p_driver and status='active' and starts_at<=now() and (lifetime or ends_at>now())),
 facts as(select coalesce((select status from public.rp_access_controls where driver_id=p_driver),'enabled') as status,
 exists(select 1 from public.rp_settings where key='free_access' and value='true'::jsonb) as free,
 exists(select 1 from grants where lifetime) as lifetime,
 greatest((select valid_until from public.rp_memberships where driver_id=p_driver),(select max(ends_at) from grants)) as ends_at)
 select jsonb_build_object('status',status,'free',free,'lifetime',lifetime,'valid_until',ends_at,'has_access',status='enabled' and (free or lifetime or coalesce(ends_at>now(),false))) from facts;
$$;
create or replace function public.rp_has_access(p_driver uuid) returns boolean language sql stable security definer set search_path='' as $$
 select (public.rp_access_state(p_driver)->>'has_access')::boolean;
$$;
create or replace function public.rp_manage_access(p_admin uuid,p_driver uuid,p_action text,p_kind text,p_end timestamptz,p_days integer,p_months integer,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare start_time timestamptz; end_time timestamptz; state jsonb;
begin
 if not exists(select 1 from public.rp_admin_users where user_id=p_admin and is_active) then raise exception 'Identifica tu cuenta de administrador.'; end if;
 if length(trim(coalesce(p_reason,''))) not between 3 and 1000 then raise exception 'Escribe el motivo del cambio.'; end if;
 perform 1 from public.rp_profiles where id=p_driver and role='driver' for update;
 if not found then raise exception 'Conductor inexistente.'; end if;
 state:=public.rp_access_state(p_driver);
 if p_action in ('suspend','cancel','resume') then
 insert into public.rp_access_controls(driver_id,status,reason,changed_by) values(p_driver,case p_action when 'suspend' then 'suspended' when 'cancel' then 'cancelled' else 'enabled' end,p_reason,p_admin)
 on conflict(driver_id) do update set status=excluded.status,reason=excluded.reason,changed_by=excluded.changed_by,changed_at=now();
 elsif p_action='grant' then
 if p_kind not in ('trial','courtesy','extension','lifetime') or p_kind is null then raise exception 'Tipo inválido.'; end if;
 start_time:=now(); end_time:=p_end;
 if p_kind='extension' then
 if (state->>'lifetime')::boolean then raise exception 'El conductor ya tiene acceso permanente.'; end if;
 if coalesce(p_days,0)<0 or coalesce(p_days,0)>3660 or coalesce(p_months,0)<0 or coalesce(p_months,0)>120 or coalesce(p_days,0)+coalesce(p_months,0)=0 then raise exception 'Indica días o meses válidos.'; end if;
 start_time:=greatest(now(),(state->>'valid_until')::timestamptz);
 end_time:=((start_time at time zone 'America/Panama')+make_interval(days=>coalesce(p_days,0),months=>coalesce(p_months,0))) at time zone 'America/Panama';
 elsif p_kind='lifetime' then end_time:=null;
 elsif end_time is null or end_time<=now() then raise exception 'Indica una fecha de vencimiento futura.';
 end if;
 insert into public.rp_access_grants(driver_id,kind,starts_at,ends_at,lifetime,reason,created_by) values(p_driver,p_kind,case when p_kind='extension' then now() else start_time end,end_time,p_kind='lifetime',p_reason,p_admin);
 else raise exception 'Acción inválida.';
 end if;
 insert into public.rp_admin_audit(action,subject_id,actor_id,detail) values('access.'||p_action,p_driver,p_admin,jsonb_build_object('kind',p_kind,'reason',p_reason,'before',state,'after',public.rp_access_state(p_driver)));
end; $$;
-- Signature verification and the paid order ledger remain unchanged.
-- Payments extend paid time; manual grants never rewrite payment history or remove a suspension.
create or replace function public.rp_review_benefit(p_admin uuid,p_revision uuid,p_approve boolean,p_notes text) returns void language plpgsql security definer set search_path='' as $$
declare r public.rp_benefit_revisions; v jsonb; saved uuid;
begin
 if not exists(select 1 from public.rp_admin_users where user_id=p_admin and is_active) then raise exception 'Identifica tu cuenta de administrador.'; end if;
 select * into r from public.rp_benefit_revisions where id=p_revision for update;
 if r.id is null or r.status<>'pending' then raise exception 'Esta propuesta ya no está pendiente.'; end if;
 if not p_approve and length(trim(coalesce(p_notes,'')))<3 then raise exception 'Explica qué debe corregir el comercio.'; end if;
 if p_approve then
 v:=r.payload;
 if r.benefit_id is null then
 insert into public.rp_benefits(business_id,title,description,discount_label,terms,category,savings_amount,monthly_limit,valid_from,valid_until,is_active)
 values(r.business_id,v->>'title',v->>'description',v->>'discount_label',v->>'terms',v->>'category',nullif(v->>'savings_amount','')::numeric,nullif(v->>'monthly_limit','')::integer,nullif(v->>'valid_from','')::date,nullif(v->>'valid_until','')::date,true) returning id into saved;
 else
 update public.rp_benefits set title=v->>'title',description=v->>'description',discount_label=v->>'discount_label',terms=v->>'terms',category=v->>'category',savings_amount=nullif(v->>'savings_amount','')::numeric,monthly_limit=nullif(v->>'monthly_limit','')::integer,valid_from=nullif(v->>'valid_from','')::date,valid_until=nullif(v->>'valid_until','')::date where id=r.benefit_id and business_id=r.business_id returning id into saved;
 if saved is null then raise exception 'Beneficio inexistente.'; end if;
 end if;
 update public.rp_benefit_revisions set status='approved',benefit_id=saved,reviewed_by=p_admin,reviewed_at=now(),review_notes=left(p_notes,1000) where id=r.id;
 else update public.rp_benefit_revisions set status='returned',reviewed_by=p_admin,reviewed_at=now(),review_notes=left(p_notes,1000) where id=r.id;
 end if;
 insert into public.rp_admin_audit(action,subject_id,actor_id,detail) values('benefit.review',r.id,p_admin,jsonb_build_object('approved',p_approve,'notes',left(p_notes,1000)));
end; $$;
do $$ declare t text; begin foreach t in array array['rp_admin_users','rp_access_grants','rp_access_controls'] loop
 execute format('alter table public.%I enable row level security',t);execute format('revoke all on public.%I from public,anon,authenticated',t);execute format('grant all on public.%I to service_role',t);
end loop;end $$;
revoke all on function public.rp_access_state(uuid),public.rp_manage_access(uuid,uuid,text,text,timestamptz,integer,integer,text),public.rp_review_benefit(uuid,uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.rp_access_state(uuid),public.rp_manage_access(uuid,uuid,text,text,timestamptz,integer,integer,text),public.rp_review_benefit(uuid,uuid,boolean,text) to service_role;
create or replace function public.rp_create_payment(p_driver uuid,p_order text,p_domain text)
returns void language plpgsql security definer set search_path='' as $$
declare p public.rp_profiles;
begin
 select * into p from public.rp_profiles where id=p_driver for update;
 if p.id is null or p.role<>'driver' or p.status<>'verified' then raise exception 'Verifica tu perfil antes de pagar.'; end if;
 if exists(select 1 from public.rp_settings where key='free_access' and value='true'::jsonb) then raise exception 'El acceso gratuito sigue activo. No necesitas pagar todavía.'; end if;
 if exists(select 1 from public.rp_payment_orders where driver_id=p_driver and status='pending' and created_at>now()-interval '10 minutes') then raise exception 'Tienes un pago en proceso. Revisa tu membresía o espera 10 minutos.'; end if;
 if (public.rp_access_state(p_driver)->>'status')<>'enabled' then raise exception 'Tu acceso está suspendido o cancelado. Contacta a RidePerks.'; end if;
 if (public.rp_access_state(p_driver)->>'lifetime')::boolean then raise exception 'Tienes acceso permanente. No necesitas pagar.'; end if;
 if (public.rp_access_state(p_driver)->>'valid_until')::timestamptz>now()+interval '7 days' then raise exception 'Tu membresía está activa. Podrás renovarla durante sus últimos 7 días.'; end if;
 insert into public.rp_payment_orders(id,driver_id,domain) values(p_order,p_driver,p_domain);
end; $$;
create or replace function public.rp_apply_payment(p_order text,p_status text,p_domain text)
returns void language plpgsql security definer set search_path='' as $$
declare o public.rp_payment_orders; d uuid; starts timestamptz; ends timestamptz;
begin
 if p_status not in ('E','R','C','X') or p_status is null then raise exception 'Estado inválido.'; end if;
 select driver_id into d from public.rp_payment_orders where id=p_order;
 if d is null then raise exception 'Orden inexistente.'; end if;
 perform 1 from public.rp_profiles where id=d for update;
 select * into o from public.rp_payment_orders where id=p_order for update;
 if o.domain<>p_domain or p_domain is null then raise exception 'Dominio inválido.'; end if;
 if o.status='paid' then return; end if;
 if p_status='E' then
  select greatest(now(),(public.rp_access_state(d)->>'valid_until')::timestamptz) into starts;
  starts:=coalesce(starts,now());
  ends:=((starts at time zone 'America/Panama')+interval '1 month') at time zone 'America/Panama';
  insert into public.rp_memberships(driver_id,valid_until) values(d,ends)
  on conflict(driver_id) do update set valid_until=excluded.valid_until,updated_at=now();
  update public.rp_payment_orders set status='paid',paid_at=now(),period_start=starts,period_end=ends where id=p_order;
 else
  update public.rp_payment_orders set status=case p_status when 'R' then 'rejected' when 'C' then 'cancelled' else 'expired' end where id=p_order;
 end if;
end; $$;

commit;
