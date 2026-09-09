-- Additive: adds a short, human-typeable fallback code alongside the QR
-- token. A merchant can type six characters in a few seconds instead of a
-- 36-character UUID if the camera scan fails. The QR itself keeps encoding
-- the full token (unchanged for the camera path); rp_redeem_token's
-- security-audited transaction is untouched — resolution from short code
-- to token happens as a plain lookup in the Next.js API route before it.
begin;

alter table public.rp_qr_tokens add column if not exists short_code text;

-- Unique only while pending: once a code expires or is used, its short
-- code is free to be reused by a later token (same pattern as the existing
-- rp_one_pending_verification partial index).
create unique index if not exists rp_qr_tokens_short_code_pending
 on public.rp_qr_tokens(short_code) where status='pending';

create or replace function public.rp_issue_token(p_driver uuid,p_benefit uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.rp_profiles; b public.rp_benefits; q public.rp_qr_tokens; usages integer; today date := (now() at time zone 'America/Panama')::date; new_code text;
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
revoke all on function public.rp_issue_token(uuid,uuid) from public,anon,authenticated;
grant execute on function public.rp_issue_token(uuid,uuid) to service_role;

commit;
