-- Account closure for privacy/deletion requests. Additive: scrubs personal
-- data and blocks further use of the platform side, but never touches
-- rp_redemptions/rp_payment_orders/rp_memberships/rp_access_grants — a
-- business's stats and RidePerks' own audit trail must survive a closed
-- account. Banning the auth.users login itself happens in the Next.js
-- action (lib/platform/admin-actions.ts), via the Auth Admin API — outside
-- what a plain SQL migration can reach.
begin;
alter table public.rp_profiles add column if not exists closed_at timestamptz;
create or replace function public.rp_close_profile(p_id uuid, p_reason text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if length(trim(coalesce(p_reason,''))) not between 3 and 1000 then raise exception 'Escribe el motivo del cierre.'; end if;
 perform 1 from public.rp_profiles where id=p_id for update;
 if not found then raise exception 'Cuenta inexistente.'; end if;
 update public.rp_profiles set full_name='',phone=null,platform=null,status='suspended',closed_at=now(),updated_at=now() where id=p_id;
 update public.rp_business_members set is_active=false where user_id=p_id and is_active;
 insert into public.rp_admin_audit(action,subject_id,detail) values('profile.close',p_id,jsonb_build_object('reason',p_reason));
end; $$;
revoke all on function public.rp_close_profile(uuid,text) from public,anon,authenticated;
grant execute on function public.rp_close_profile(uuid,text) to service_role;
commit;
