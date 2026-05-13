create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text check (description is null or char_length(description) <= 500),
  category text check (category is null or char_length(category) <= 80),
  default_unit text not null check (char_length(default_unit) between 1 and 40),
  default_quantity numeric check (default_quantity is null or default_quantity > 0),
  verification_type text not null default 'self_report' check (verification_type in ('none', 'self_report', 'photo', 'review_required')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_group_id_is_active_idx on public.tasks(group_id, is_active);
create index if not exists tasks_created_by_user_id_idx on public.tasks(created_by_user_id);

create or replace function public.can_manage_group_tasks(target_group_id uuid, target_user_id uuid)
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
      and role in ('owner', 'admin', 'moderator')
  );
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

alter table public.tasks enable row level security;

drop policy if exists "Active group members can view active tasks" on public.tasks;
create policy "Active group members can view active tasks"
on public.tasks
for select
to authenticated
using (
  is_active = true
  and public.is_group_member(group_id, auth.uid())
);

drop policy if exists "Group task managers can create tasks" on public.tasks;
create policy "Group task managers can create tasks"
on public.tasks
for insert
to authenticated
with check (
  created_by_user_id = auth.uid()
  and is_active = true
  and public.can_manage_group_tasks(group_id, auth.uid())
);

drop policy if exists "Task creators and group task managers can update tasks" on public.tasks;
create policy "Task creators and group task managers can update tasks"
on public.tasks
for update
to authenticated
using (
  public.is_group_member(group_id, auth.uid())
  and (
    created_by_user_id = auth.uid()
    or public.can_manage_group_tasks(group_id, auth.uid())
  )
)
with check (
  public.is_group_member(group_id, auth.uid())
  and (
    created_by_user_id = auth.uid()
    or public.can_manage_group_tasks(group_id, auth.uid())
  )
);

grant usage on schema public to authenticated;
grant select, insert, update on table public.tasks to authenticated;
grant execute on function public.can_manage_group_tasks(uuid, uuid) to authenticated;
