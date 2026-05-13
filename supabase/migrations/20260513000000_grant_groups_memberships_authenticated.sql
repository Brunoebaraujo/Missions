-- Grant table privileges required for Supabase API access.
-- RLS remains the tenant boundary: authenticated users can only read groups
-- where the existing policies confirm they are active members, and can only
-- create groups plus their own owner membership.

grant usage on schema public to authenticated;

grant select, insert on table public.groups to authenticated;
grant select, insert on table public.group_memberships to authenticated;

grant execute on function public.is_group_member(uuid, uuid) to authenticated;
grant execute on function public.user_owns_group(uuid, uuid) to authenticated;
