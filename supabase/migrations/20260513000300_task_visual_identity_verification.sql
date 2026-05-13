alter table public.tasks
  add column if not exists icon_key text,
  add column if not exists image_url text;

alter table public.tasks
  alter column verification_type set default 'photo_and_admin_approval';

alter table public.tasks
  drop constraint if exists tasks_verification_type_check;

update public.tasks
set verification_type = case verification_type
  when 'none' then 'self_report'
  when 'photo' then 'photo_required'
  when 'review_required' then 'admin_approval'
  else verification_type
end
where verification_type in ('none', 'photo', 'review_required');

alter table public.tasks
  add constraint tasks_verification_type_check
  check (
    verification_type in (
      'self_report',
      'photo_required',
      'admin_approval',
      'photo_and_admin_approval'
    )
  );
