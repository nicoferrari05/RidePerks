-- Additive: a per-business PIN so on-site staff (a pump attendant, a mechanic,
-- a waiter) can scan driver QR codes without a RidePerks account. RidePerks
-- admins choose each PIN; only its keyed hash is stored (the key lives in the
-- server environment, never in the database). pin_version changes on every
-- set/remove, which signs out every device that entered the previous PIN.
begin;

alter table public.rp_businesses add column if not exists pin_hash text;
alter table public.rp_businesses add column if not exists pin_version integer not null default 0;
alter table public.rp_businesses add column if not exists pin_set_at timestamptz;
-- The PIN alone identifies the business, so no two businesses may share one.
create unique index if not exists rp_businesses_pin_hash on public.rp_businesses(pin_hash) where pin_hash is not null;

-- 'pin' redemptions have no personal account behind them (redeemed_by is null).
alter table public.rp_redemptions add column if not exists redeemed_via text not null default 'account' check(redeemed_via in ('account','pin'));

create or replace function public.rp_set_business_pin(p_business uuid,p_hash text)
returns void language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 if p_hash is not null and p_hash !~ '^[0-9a-f]{64}$' then raise exception 'PIN inválido.'; end if;
 if p_hash is not null and exists(select 1 from public.rp_businesses where pin_hash=p_hash and id<>p_business) then raise exception 'Ese PIN ya lo usa otro comercio. Elige otro.'; end if;
 begin
  update public.rp_businesses set pin_hash=p_hash,pin_version=pin_version+1,pin_set_at=case when p_hash is null then null else now() end where id=p_business;
  get diagnostics n = row_count;
 exception when unique_violation then
  raise exception 'Ese PIN ya lo usa otro comercio. Elige otro.';
 end;
 if n = 0 then raise exception 'El comercio ya no existe.'; end if;
 insert into public.rp_admin_audit(action,subject_id) values(case when p_hash is null then 'business.pin_remove' else 'business.pin_set' end,p_business);
end; $$;

-- Same checks and lock order as rp_redeem_token, but the actor is a PIN
-- session for one business instead of a member account. p_version must match
-- the business's current pin_version, so a changed or removed PIN stops
-- working immediately on every device.
create or replace function public.rp_redeem_token_pin(p_business uuid,p_version integer,p_token uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.rp_qr_tokens; p public.rp_profiles; b public.rp_benefits; shop public.rp_businesses; usages integer; today date := (now() at time zone 'America/Panama')::date;
begin
 select * into shop from public.rp_businesses where id=p_business for share;
 if shop.id is null or not shop.is_active or shop.pin_hash is null or shop.pin_version<>p_version then raise exception 'El PIN ya no es válido. Ingrésalo de nuevo.'; end if;
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
 insert into public.rp_redemptions(driver_id,benefit_id,business_id,qr_token_id,benefit_title,business_name,savings_amount,redeemed_via)
 values(p.id,b.id,shop.id,q.id,b.title,shop.name,b.savings_amount,'pin');
 return jsonb_build_object('driver_name',p.full_name,'benefit_title',b.title,'discount_label',b.discount_label,'terms',b.terms,'savings_amount',b.savings_amount);
end; $$;

revoke all on function public.rp_set_business_pin(uuid,text),public.rp_redeem_token_pin(uuid,integer,uuid) from public,anon,authenticated;
grant execute on function public.rp_set_business_pin(uuid,text),public.rp_redeem_token_pin(uuid,integer,uuid) to service_role;

commit;
