grant usage on schema public to authenticated;

grant select, insert, update on public.groups to authenticated;
grant select, insert, update on public.group_memberships to authenticated;

grant usage, select on all sequences in schema public to authenticated;
