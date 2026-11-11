-- Annual plan: one Yappy payment of $150.00 for 12 months (two months free
-- against $15.00 x 12). Additive and idempotent. Existing orders become
-- 'monthly'. Apply before deploying the code that sends p_plan.
begin;

alter table public.rp_payment_orders
  add column if not exists plan text not null default 'monthly';
alter table public.rp_payment_orders
  drop constraint if exists rp_payment_orders_plan_check;
alter table public.rp_payment_orders
  add constraint rp_payment_orders_plan_check check (plan in ('monthly','annual'));
-- The amount is still fixed by the database, now per plan.
alter table public.rp_payment_orders
  drop constraint if exists rp_payment_orders_amount_cents_check;
alter table public.rp_payment_orders
  drop constraint if exists rp_payment_orders_amount_plan_check;
alter table public.rp_payment_orders
  add constraint rp_payment_orders_amount_plan_check check (
    (plan='monthly' and amount_cents=1500) or (plan='annual' and amount_cents=15000)
  );

-- Replaces the three-argument version. A call with three arguments (the code
-- deployed before this change) still resolves here and creates a monthly order.
drop function if exists public.rp_create_payment(uuid,text,text);
create or replace function public.rp_create_payment(p_driver uuid,p_order text,p_domain text,p_plan text default 'monthly')
returns void language plpgsql security definer set search_path='' as $$
declare p public.rp_profiles;
begin
 if p_plan is null or p_plan not in ('monthly','annual') then raise exception 'Plan inválido.'; end if;
 select * into p from public.rp_profiles where id=p_driver for update;
 if p.id is null or p.role<>'driver' or p.status<>'verified' then raise exception 'Verifica tu perfil antes de pagar.'; end if;
 if exists(select 1 from public.rp_settings where key='free_access' and value='true'::jsonb) then raise exception 'El acceso gratuito sigue activo. No necesitas pagar todavía.'; end if;
 if exists(select 1 from public.rp_payment_orders where driver_id=p_driver and status='pending' and created_at>now()-interval '10 minutes') then raise exception 'Tienes un pago en proceso. Revisa tu membresía o espera 10 minutos.'; end if;
 if (public.rp_access_state(p_driver)->>'status')<>'enabled' then raise exception 'Tu acceso está suspendido o cancelado. Contacta a RidePerks.'; end if;
 if (public.rp_access_state(p_driver)->>'lifetime')::boolean then raise exception 'Tienes acceso permanente. No necesitas pagar.'; end if;
 if (public.rp_access_state(p_driver)->>'valid_until')::timestamptz>now()+interval '7 days' then raise exception 'Tu membresía está activa. Podrás renovarla durante sus últimos 7 días.'; end if;
 insert into public.rp_payment_orders(id,driver_id,domain,plan,amount_cents)
 values(p_order,p_driver,p_domain,p_plan,case p_plan when 'annual' then 15000 else 1500 end);
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
  ends:=((starts at time zone 'America/Panama')
    + case o.plan when 'annual' then interval '12 months' else interval '1 month' end)
    at time zone 'America/Panama';
  insert into public.rp_memberships(driver_id,valid_until) values(d,ends)
  on conflict(driver_id) do update set valid_until=excluded.valid_until,updated_at=now();
  update public.rp_payment_orders set status='paid',paid_at=now(),period_start=starts,period_end=ends where id=p_order;
 else
  update public.rp_payment_orders set status=case p_status when 'R' then 'rejected' when 'C' then 'cancelled' else 'expired' end where id=p_order;
 end if;
end; $$;

revoke all on function public.rp_create_payment(uuid,text,text,text),public.rp_apply_payment(text,text,text) from public,anon,authenticated;
grant execute on function public.rp_create_payment(uuid,text,text,text),public.rp_apply_payment(text,text,text) to service_role;

commit;
