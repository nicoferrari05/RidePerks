-- Additive merchant permissions and moderated benefit revisions.
begin;
create table if not exists public.rp_business_members (
 business_id uuid not null references public.rp_businesses(id),
 user_id uuid not null references public.rp_profiles(id),
 role text not null check(role in ('owner','staff')),
 is_active boolean not null default true,
 created_at timestamptz not null default now(), primary key(business_id,user_id)
);
create unique index if not exists rp_business_one_owner on public.rp_business_members(business_id) where role='owner' and is_active;
create index if not exists rp_business_member_user on public.rp_business_members(user_id) where is_active;
create or replace function public.rp_sync_business_owner() returns trigger language plpgsql security definer set search_path='' as $$
begin
 update public.rp_business_members set is_active=false where business_id=new.id and role='owner' and user_id is distinct from new.owner_user_id;
 if new.owner_user_id is not null then
 insert into public.rp_business_members(business_id,user_id,role,is_active) values(new.id,new.owner_user_id,'owner',true)
 on conflict(business_id,user_id) do update set role='owner',is_active=true;
 end if;
 return new;
end; $$;
drop trigger if exists rp_business_owner_sync on public.rp_businesses;
create trigger rp_business_owner_sync after insert or update of owner_user_id on public.rp_businesses for each row execute function public.rp_sync_business_owner();
insert into public.rp_business_members(business_id,user_id,role) select id,owner_user_id,'owner' from public.rp_businesses where owner_user_id is not null on conflict do nothing;
create or replace function public.rp_business_role(p_user uuid,p_business uuid) returns text language sql stable security definer set search_path='' as $$
 select case when b.owner_user_id=p_user then 'owner' else m.role end from public.rp_businesses b
 join public.rp_profiles p on p.id=p_user and p.role='business' and p.status<>'suspended'
 left join public.rp_business_members m on m.business_id=b.id and m.user_id=p_user and m.is_active and m.role='staff'
 where b.id=p_business and b.is_active and (b.owner_user_id=p_user or m.user_id is not null);
$$;
create table if not exists public.rp_business_invites (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.rp_businesses(id),
 token_hash text not null unique, created_by uuid not null references public.rp_profiles(id),
 expires_at timestamptz not null default now()+interval '48 hours', accepted_by uuid references public.rp_profiles(id),
 accepted_at timestamptz, revoked_at timestamptz, created_at timestamptz not null default now()
);
create or replace function public.rp_accept_business_invite(p_user uuid,p_hash text) returns uuid language plpgsql security definer set search_path='' as $$
declare i public.rp_business_invites;
begin
 perform 1 from public.rp_profiles where id=p_user and role='business' and status<>'suspended' for update;
 if not found then raise exception 'Inicia sesión con una cuenta de comercio.'; end if;
 select * into i from public.rp_business_invites where token_hash=p_hash for update;
 if i.id is null or i.expires_at<=now() or i.revoked_at is not null or i.accepted_at is not null then raise exception 'La invitación venció o ya fue utilizada.'; end if;
 if public.rp_business_role(i.created_by,i.business_id) is distinct from 'owner' then raise exception 'La invitación ya no está autorizada.'; end if;
 if exists(select 1 from public.rp_businesses where id=i.business_id and owner_user_id=p_user) then raise exception 'Ya eres administrador de este comercio.'; end if;
 insert into public.rp_business_members(business_id,user_id,role,is_active) values(i.business_id,p_user,'staff',true)
 on conflict(business_id,user_id) do update set role='staff',is_active=true;
 update public.rp_business_invites set accepted_at=now(),accepted_by=p_user where id=i.id;
 return i.business_id;
end; $$;
alter table public.rp_redemptions add column if not exists redeemed_by uuid references public.rp_profiles(id);
create table if not exists public.rp_benefit_revisions (
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.rp_businesses(id),
 benefit_id uuid references public.rp_benefits(id), payload jsonb not null,
 status text not null default 'draft' check(status in ('draft','pending','approved','returned')),
 created_by uuid not null references public.rp_profiles(id), reviewed_by uuid references public.rp_profiles(id),
 review_notes text, reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists rp_benefit_open_revision on public.rp_benefit_revisions(benefit_id) where status in ('draft','pending','returned');
create index if not exists rp_revision_business_date on public.rp_benefit_revisions(business_id,created_at desc);
-- Published rows remain the approved version; draft changes live only in revisions.
create or replace function public.rp_preview_token(p_actor uuid,p_token uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.rp_qr_tokens; p public.rp_profiles; b public.rp_benefits; today date := (now() at time zone 'America/Panama')::date;
begin
 select * into q from public.rp_qr_tokens where token=p_token;
 select * into b from public.rp_benefits where id=q.benefit_id;
 if q.id is null or public.rp_business_role(p_actor,b.business_id) is null then raise exception 'Código inválido para este comercio.'; end if;
 if q.status<>'pending' or q.expires_at<=now() then raise exception 'El código venció o ya fue utilizado.'; end if;
 select * into p from public.rp_profiles where id=q.driver_id;
 if p.role<>'driver' or p.status<>'verified' or not public.rp_has_access(p.id) then raise exception 'El conductor no tiene acceso vigente.'; end if;
 if not b.is_active or b.valid_from>today or b.valid_until<today then raise exception 'El beneficio no está vigente.'; end if;
 if b.monthly_limit is not null and (select count(*) from public.rp_redemptions where driver_id=p.id and benefit_id=b.id and redeemed_at >= (date_trunc('month',now() at time zone 'America/Panama') at time zone 'America/Panama')) >= b.monthly_limit then raise exception 'El conductor alcanzó el límite de usos del mes.'; end if;
 return jsonb_build_object('driver_name',p.full_name,'benefit_title',b.title,'discount_label',b.discount_label,'terms',b.terms,'expires_at',q.expires_at);
end; $$;
create or replace function public.rp_business_stats(p_actor uuid,p_business uuid,p_from timestamptz,p_until timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if public.rp_business_role(p_actor,p_business) is distinct from 'owner' then raise exception 'No autorizado.'; end if;
 if p_from is null or p_until is null or p_until<=p_from or p_until-p_from>interval '366 days' then raise exception 'Período inválido.'; end if;
 with uses as (select * from public.rp_redemptions where business_id=p_business and redeemed_at>=p_from and redeemed_at<p_until)
 select jsonb_build_object('uses',count(*),'drivers',count(distinct driver_id),'savings',coalesce(sum(savings_amount),0),'valued_uses',count(savings_amount),
 'top_benefit',(select benefit_title from uses group by benefit_id,benefit_title order by count(*) desc,benefit_title limit 1),
 'daily',coalesce((select jsonb_agg(d order by day) from (select (redeemed_at at time zone 'America/Panama')::date as day,count(*) as uses from uses group by 1) d),'[]'::jsonb)) into result from uses;
 return result;
end; $$;
create or replace function public.rp_redeem_token(p_owner uuid,p_token uuid)
returns jsonb language plpgsql security definer set search_path='' as $$
declare q public.rp_qr_tokens; p public.rp_profiles; b public.rp_benefits; shop public.rp_businesses; usages integer; today date := (now() at time zone 'America/Panama')::date;
begin
 select * into q from public.rp_qr_tokens where token=p_token;
 if q.id is null then raise exception 'Código inválido.'; end if;
 select b1.* into shop from public.rp_businesses b1 join public.rp_benefits b2 on b2.business_id=b1.id where b2.id=q.benefit_id for share of b1;
 perform 1 from public.rp_profiles where id=p_owner for share;
 perform 1 from public.rp_business_members where business_id=shop.id and user_id=p_owner for share;
 if public.rp_business_role(p_owner,shop.id) is null then raise exception 'No tienes acceso a este comercio.'; end if;
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
 insert into public.rp_redemptions(driver_id,benefit_id,business_id,qr_token_id,benefit_title,business_name,savings_amount,redeemed_by)
 values(p.id,b.id,shop.id,q.id,b.title,shop.name,b.savings_amount,p_owner);
 return jsonb_build_object('driver_name',p.full_name,'benefit_title',b.title,'discount_label',b.discount_label,'savings_amount',b.savings_amount);
end; $$;



do $$ declare t text; begin foreach t in array array['rp_business_members','rp_business_invites','rp_benefit_revisions'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 execute format('grant all on public.%I to service_role',t);
end loop; end $$;
revoke all on function public.rp_sync_business_owner(),public.rp_business_role(uuid,uuid),public.rp_accept_business_invite(uuid,text),public.rp_preview_token(uuid,uuid),public.rp_business_stats(uuid,uuid,timestamptz,timestamptz) from public,anon,authenticated;
grant execute on function public.rp_business_role(uuid,uuid),public.rp_accept_business_invite(uuid,text),public.rp_preview_token(uuid,uuid),public.rp_business_stats(uuid,uuid,timestamptz,timestamptz) to service_role;
commit;
