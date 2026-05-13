create extension if not exists pgcrypto;

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (description is null or char_length(description) <= 280),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  visibility text not null default 'private' check (visibility in ('private', 'invite_only', 'public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'moderator', 'member')),
  status text not null default 'active' check (status in ('active', 'invited', 'suspended', 'left')),
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint group_memberships_group_id_user_id_key unique (group_id, user_id)
);

create index if not exists groups_owner_user_id_idx on public.groups(owner_user_id);
create index if not exists groups_slug_idx on public.groups(slug);
create index if not exists group_memberships_user_id_idx on public.group_memberships(user_id);
create index if not exists group_memberships_group_id_idx on public.group_memberships(group_id);
create index if not exists group_memberships_group_id_role_idx on public.group_memberships(group_id, role);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists groups_set_updated_at on public.groups;
create trigger groups_set_updated_at
before update on public.groups
for each row
execute function public.set_updated_at();

create or replace function public.is_group_member(target_group_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_memberships
    where group_id = target_group_id
      and user_id = target_user_id
      and status = 'active'
  );
$$;

create or replace function public.user_owns_group(target_group_id uuid, target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.groups
    where id = target_group_id
      and owner_user_id = target_user_id
  );
$$;

alter table public.groups enable row level security;
alter table public.group_memberships enable row level security;

drop policy if exists "Group members can view their groups" on public.groups;
create policy "Group members can view their groups"
on public.groups
for select
to authenticated
using (public.is_group_member(id, auth.uid()));

drop policy if exists "Authenticated users can create owned groups" on public.groups;
create policy "Authenticated users can create owned groups"
on public.groups
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "Group members can view group memberships" on public.group_memberships;
create policy "Group members can view group memberships"
on public.group_memberships
for select
to authenticated
using (public.is_group_member(group_id, auth.uid()));

drop policy if exists "Group creators can create owner membership" on public.group_memberships;
create policy "Group creators can create owner membership"
on public.group_memberships
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'owner'
  and status = 'active'
  and public.user_owns_group(group_id, auth.uid())
);
