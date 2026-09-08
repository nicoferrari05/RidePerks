-- The existing waitlist_ranked view runs with its owner's privileges.
-- Remove direct anonymous access; Next.js keeps using the service role.
-- This changes grants only. No waitlist rows are edited or deleted.
begin;
do $$ begin
 if to_regclass('public.waitlist_ranked') is not null then
  revoke all on public.waitlist_ranked from anon,authenticated;
  grant select on public.waitlist_ranked to service_role;
 end if;
end $$;
commit;
