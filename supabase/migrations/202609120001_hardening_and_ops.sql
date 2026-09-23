-- Additive hardening and operations: admin-only pause on benefits, review of
-- sensitive business edits, business-owner role check, payment reconciliation
-- and the catalog visibility switch.
begin;

-- A benefit paused by RidePerks cannot be reactivated by the merchant.
alter table public.rp_benefits add column if not exists admin_paused boolean not null default false;

-- Driver-side catalog stays hidden until an admin turns it on.
insert into public.rp_settings values ('catalog_live','false'::jsonb) on conflict do nothing;

-- Only accounts registered as a business can be linked as owner.
create or replace function public.rp_save_business(p_id uuid,p_values jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare owner_id uuid := nullif(p_values->>'owner_user_id','')::uuid; saved uuid;
begin
 if owner_id is not null and not exists(select 1 from public.rp_profiles where id=owner_id) then raise exception 'No existe esa cuenta. El responsable debe registrarse primero.'; end if;
 if owner_id is not null and not exists(select 1 from public.rp_profiles where id=owner_id and role='business') then raise exception 'La cuenta responsable debe ser una cuenta de comercio.'; end if;
 if owner_id is not null and exists(select 1 from public.rp_businesses where owner_user_id=owner_id and (p_id is null or id<>p_id)) then raise exception 'Esta cuenta ya administra otro comercio.'; end if;
 if p_id is null then
 insert into public.rp_businesses(name,description,address,phone,category,owner_user_id)
 values(p_values->>'name',p_values->>'description',p_values->>'address',p_values->>'phone',p_values->>'category',owner_id) returning id into saved;
 else
 update public.rp_businesses set name=p_values->>'name',description=p_values->>'description',address=p_values->>'address',phone=p_values->>'phone',category=p_values->>'category',owner_user_id=owner_id where id=p_id returning id into saved;
 if saved is null then raise exception 'El comercio ya no existe.'; end if;
 end if;
 insert into public.rp_admin_audit(action,subject_id) values('business.save',saved);
 return saved;
end; $$;

-- Name, address and category changes made by a merchant wait for review.
create table if not exists public.rp_business_changes(
 id uuid primary key default gen_random_uuid(),
 business_id uuid not null references public.rp_businesses(id),
 payload jsonb not null,
 status text not null default 'pending' check(status in ('pending','approved','returned')),
 created_by uuid not null references public.rp_profiles(id),
 reviewed_by uuid references public.rp_profiles(id),
 review_notes text, reviewed_at timestamptz,
 created_at timestamptz not null default now()
);
create unique index if not exists rp_business_one_pending_change on public.rp_business_changes(business_id) where status='pending';
alter table public.rp_business_changes enable row level security;
revoke all on public.rp_business_changes from public,anon,authenticated;
grant all on public.rp_business_changes to service_role;
create or replace function public.rp_review_business_change(p_admin uuid,p_change uuid,p_approve boolean,p_notes text) returns void language plpgsql security definer set search_path='' as $$
declare c public.rp_business_changes;
begin
 if not exists(select 1 from public.rp_admin_users where user_id=p_admin and is_active) then raise exception 'Identifica tu cuenta de administrador.'; end if;
 select * into c from public.rp_business_changes where id=p_change for update;
 if c.id is null or c.status<>'pending' then raise exception 'Este cambio ya no está pendiente.'; end if;
 if not p_approve and length(trim(coalesce(p_notes,'')))<3 then raise exception 'Explica qué debe corregir el comercio.'; end if;
 if p_approve then
 update public.rp_businesses set name=c.payload->>'name',address=c.payload->>'address',category=c.payload->>'category' where id=c.business_id;
 end if;
 update public.rp_business_changes set status=case when p_approve then 'approved' else 'returned' end,reviewed_by=p_admin,reviewed_at=now(),review_notes=left(p_notes,1000) where id=c.id;
 insert into public.rp_admin_audit(action,subject_id,actor_id,detail) values('business.change',c.business_id,p_admin,jsonb_build_object('approved',p_approve,'notes',left(p_notes,1000),'payload',c.payload));
end; $$;
revoke all on function public.rp_review_business_change(uuid,uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.rp_review_business_change(uuid,uuid,boolean,text) to service_role;

-- Payment reconciliation: stale pending orders expire (a late confirmed
-- notification is still honored by rp_apply_payment), and a named admin can
-- credit an order manually when the notification never arrived.
create or replace function public.rp_expire_stale_orders() returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 update public.rp_payment_orders set status='expired' where status='pending' and created_at<now()-interval '24 hours';
 get diagnostics n = row_count;
 return n;
end; $$;
create or replace function public.rp_credit_payment(p_admin uuid,p_order text,p_reason text) returns void language plpgsql security definer set search_path='' as $$
declare o public.rp_payment_orders;
begin
 if not exists(select 1 from public.rp_admin_users where user_id=p_admin and is_active) then raise exception 'Identifica tu cuenta de administrador.'; end if;
 if length(trim(coalesce(p_reason,''))) not between 3 and 1000 then raise exception 'Escribe el motivo del cambio.'; end if;
 select * into o from public.rp_payment_orders where id=p_order;
 if o.id is null then raise exception 'Orden inexistente.'; end if;
 if o.status='paid' then raise exception 'Esta orden ya está pagada.'; end if;
 perform public.rp_apply_payment(p_order,'E',o.domain);
 insert into public.rp_admin_audit(action,subject_id,actor_id,detail) values('payment.credit',o.driver_id,p_admin,jsonb_build_object('order',p_order,'reason',left(p_reason,1000)));
end; $$;
revoke all on function public.rp_expire_stale_orders(),public.rp_credit_payment(uuid,text,text) from public,anon,authenticated;
grant execute on function public.rp_expire_stale_orders(),public.rp_credit_payment(uuid,text,text) to service_role;

commit;
