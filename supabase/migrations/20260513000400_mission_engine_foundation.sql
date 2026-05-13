create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  description text check (description is null or char_length(description) <= 800),
  start_date date,
  end_date date,
  mission_type text not null default 'one_time' check (mission_type in ('one_time', 'recurring')),
  completion_mode text not null default 'all_tasks_once' check (completion_mode in ('total_completions', 'all_tasks_once')),
  required_completions integer check (required_completions is null or required_completions > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint missions_date_order_check check (start_date is null or end_date is null or start_date <= end_date),
  constraint missions_total_completions_target_check check (
    completion_mode <> 'total_completions'
    or required_completions is not null
  )
);

create table if not exists public.mission_tasks (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete restrict,
  required_quantity numeric check (required_quantity is null or required_quantity > 0),
  created_at timestamptz not null default now(),
  constraint mission_tasks_mission_id_task_id_key unique (mission_id, task_id)
);

create index if not exists missions_group_id_is_active_idx on public.missions(group_id, is_active);
create index if not exists missions_created_by_user_id_idx on public.missions(created_by_user_id);
create index if not exists mission_tasks_mission_id_idx on public.mission_tasks(mission_id);
create index if not exists mission_tasks_task_id_idx on public.mission_tasks(task_id);

create or replace function public.can_manage_group_missions(target_group_id uuid, target_user_id uuid)
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

create or replace function public.mission_task_matches_group(target_mission_id uuid, target_task_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.missions m
    join public.tasks t on t.id = target_task_id
    where m.id = target_mission_id
      and t.group_id = m.group_id
      and t.is_active = true
  );
$$;

create or replace function public.enforce_mission_task_group_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.mission_task_matches_group(new.mission_id, new.task_id) then
    raise exception 'Mission tasks must reference active tasks from the same group.';
  end if;

  return new;
end;
$$;

drop trigger if exists missions_set_updated_at on public.missions;
create trigger missions_set_updated_at
before update on public.missions
for each row
execute function public.set_updated_at();

drop trigger if exists mission_tasks_enforce_group_match on public.mission_tasks;
create trigger mission_tasks_enforce_group_match
before insert or update on public.mission_tasks
for each row
execute function public.enforce_mission_task_group_match();

alter table public.missions enable row level security;
alter table public.mission_tasks enable row level security;

drop policy if exists "Active group members can view active missions" on public.missions;
create policy "Active group members can view active missions"
on public.missions
for select
to authenticated
using (
  is_active = true
  and public.is_group_member(group_id, auth.uid())
);

drop policy if exists "Group mission managers can create missions" on public.missions;
create policy "Group mission managers can create missions"
on public.missions
for insert
to authenticated
with check (
  created_by_user_id = auth.uid()
  and is_active = true
  and public.can_manage_group_missions(group_id, auth.uid())
);

drop policy if exists "Active group members can view mission tasks" on public.mission_tasks;
create policy "Active group members can view mission tasks"
on public.mission_tasks
for select
to authenticated
using (
  exists (
    select 1
    from public.missions m
    where m.id = mission_id
      and m.is_active = true
      and public.is_group_member(m.group_id, auth.uid())
  )
);

drop policy if exists "Group mission managers can create mission tasks" on public.mission_tasks;
create policy "Group mission managers can create mission tasks"
on public.mission_tasks
for insert
to authenticated
with check (
  public.mission_task_matches_group(mission_id, task_id)
  and exists (
    select 1
    from public.missions m
    where m.id = mission_id
      and m.is_active = true
      and public.can_manage_group_missions(m.group_id, auth.uid())
  )
);

grant usage on schema public to authenticated;
grant select, insert on table public.missions to authenticated;
grant select, insert on table public.mission_tasks to authenticated;
grant execute on function public.can_manage_group_missions(uuid, uuid) to authenticated;
grant execute on function public.mission_task_matches_group(uuid, uuid) to authenticated;
