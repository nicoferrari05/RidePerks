-- Yappy membership: additive; leaves existing free access unchanged until activation.
begin;
create table if not exists public.rp_memberships (
 driver_id uuid primary key references public.rp_profiles(id),
 valid_until timestamptz not null,
 updated_at timestamptz not null default now()
);
create table if not exists public.rp_payment_orders (
 id text primary key check(id ~ '^[a-zA-Z0-9]{1,15}$'),
 driver_id uuid not null references public.rp_profiles(id),
 amount_cents integer not null default 1500 check(amount_cents=1500),
 currency text not null default 'USD' check(currency='USD'),
 domain text not null check(domain in ('https://rideperks.app','https://www.rideperks.app')),
 status text not null default 'pending' check(status in ('pending','paid','rejected','cancelled','expired')),
 transaction_id text unique,
 created_at timestamptz not null default now(),
 paid_at timestamptz,
 period_start timestamptz,
 period_end timestamptz
);
alter table public.rp_memberships enable row level security;
alter table public.rp_payment_orders enable row level security;
revoke all on public.rp_memberships, public.rp_payment_orders from public,anon,authenticated;
grant all on public.rp_memberships, public.rp_payment_orders to service_role;
create index if not exists rp_payment_driver_date on public.rp_payment_orders(driver_id,created_at desc);
create or replace function public.rp_has_access(p_driver uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.rp_settings where key='free_access' and value='true'::jsonb)
 or exists(select 1 from public.rp_memberships where driver_id=p_driver and valid_until>now());
$$;
create or replace function public.rp_create_payment(p_driver uuid,p_order text,p_domain text)
returns void language plpgsql security definer set search_path='' as $$
declare p public.rp_profiles;
begin
 select * into p from public.rp_profiles where id=p_driver for update;
 if p.id is null or p.role<>'driver' or p.status<>'verified' then raise exception 'Verifica tu perfil antes de pagar.'; end if;
 if exists(select 1 from public.rp_settings where key='free_access' and value='true'::jsonb) then raise exception 'El acceso gratuito sigue activo. No necesitas pagar todavía.'; end if;
 if exists(select 1 from public.rp_payment_orders where driver_id=p_driver and status='pending' and created_at>now()-interval '10 minutes') then raise exception 'Tienes un pago en proceso. Revisa tu membresía o espera 10 minutos.'; end if;
 if exists(select 1 from public.rp_memberships where driver_id=p_driver and valid_until>now()+interval '7 days') then raise exception 'Tu membresía está activa. Podrás renovarla durante sus últimos 7 días.'; end if;
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
  select greatest(now(),valid_until) into starts from public.rp_memberships where driver_id=d;
  starts:=coalesce(starts,now());
  ends:=((starts at time zone 'America/Panama')+interval '1 month') at time zone 'America/Panama';
  insert into public.rp_memberships(driver_id,valid_until) values(d,ends)
  on conflict(driver_id) do update set valid_until=excluded.valid_until,updated_at=now();
  update public.rp_payment_orders set status='paid',paid_at=now(),period_start=starts,period_end=ends where id=p_order;
 else
  update public.rp_payment_orders set status=case p_status when 'R' then 'rejected' when 'C' then 'cancelled' else 'expired' end where id=p_order;
 end if;
end; $$;
revoke all on function public.rp_has_access(uuid),public.rp_create_payment(uuid,text,text),public.rp_apply_payment(text,text,text) from public,anon,authenticated;
grant execute on function public.rp_has_access(uuid),public.rp_create_payment(uuid,text,text),public.rp_apply_payment(text,text,text) to service_role;

create or replace function public.rp_issue_token(p_driver uuid,p_benefit uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.rp_profiles; b public.rp_benefits; q public.rp_qr_tokens; usages integer; today date := (now() at time zone 'America/Panama')::date; new_code text;
begin
 select * into p from public.rp_profiles where id=p_driver for update;
 if p.id is null or p.role <> 'driver' or p.status <> 'verified' then raise exception 'Verifica tu cuenta antes de usar beneficios.'; end if;
 if not public.rp_has_access(p_driver) then raise exception 'Activa tu membresía para usar beneficios.'; end if;
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
  loop
   new_code := upper(substr(md5(random()::text||clock_timestamp()::text),1,6));
   begin
    insert into public.rp_qr_tokens(driver_id,benefit_id,short_code) values(p_driver,p_benefit,new_code) returning * into q;
    exit;
   exception when unique_violation then
    -- short_code collided with another currently-pending token; retry with a new one.
   end;
  end loop;
 end if;
 return jsonb_build_object('token',q.token,'short_code',q.short_code,'expires_at',q.expires_at,'status',q.status);
end; $$;

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
 if not public.rp_has_access(p.id) then raise exception 'La membresía del conductor no está activa.'; end if;
 if not b.is_active or (b.valid_from is not null and b.valid_from>today) or (b.valid_until is not null and b.valid_until<today) then raise exception 'El beneficio no está vigente.'; end if;
 select count(*) into usages from public.rp_redemptions where driver_id=p.id and benefit_id=b.id
 and redeemed_at >= (date_trunc('month',now() at time zone 'America/Panama') at time zone 'America/Panama');
 if b.monthly_limit is not null and usages>=b.monthly_limit then raise exception 'El conductor alcanzó el límite de usos del mes.'; end if;
 update public.rp_qr_tokens set status='used',used_at=now() where id=q.id;
 insert into public.rp_redemptions(driver_id,benefit_id,business_id,qr_token_id,benefit_title,business_name,savings_amount)
 values(p.id,b.id,shop.id,q.id,b.title,shop.name,b.savings_amount);
 return jsonb_build_object('driver_name',p.full_name,'benefit_title',b.title,'discount_label',b.discount_label,'savings_amount',b.savings_amount);
end; $$;


commit;
