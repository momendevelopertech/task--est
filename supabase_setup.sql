create table if not exists public.task_statuses (
  id bigint primary key,
  status text not null default 'todo' check (status in ('todo', 'wip', 'done'))
);

alter table public.task_statuses
  add column if not exists task_key text,
  add column if not exists est smallint,
  add column if not exists building text,
  add column if not exists floor_name text,
  add column if not exists owner text check (owner in ('sarah', 'hossam')),
  add column if not exists note text;

update public.task_statuses
set note = ''
where note is null;

alter table public.task_statuses
  alter column note set default '',
  alter column note set not null;

alter table public.task_statuses enable row level security;
alter table public.task_statuses replica identity full;

grant usage on schema public to anon;
grant usage on schema public to authenticated;
grant select, update on table public.task_statuses to anon;
grant select, update on table public.task_statuses to authenticated;

drop policy if exists "task_statuses_select_anon" on public.task_statuses;
create policy "task_statuses_select_anon"
on public.task_statuses
for select
to anon
using (true);

drop policy if exists "task_statuses_update_anon" on public.task_statuses;
create policy "task_statuses_update_anon"
on public.task_statuses
for update
to anon
using (true)
with check (true);

drop policy if exists "task_statuses_select_authenticated" on public.task_statuses;
create policy "task_statuses_select_authenticated"
on public.task_statuses
for select
to authenticated
using (true);

drop policy if exists "task_statuses_update_authenticated" on public.task_statuses;
create policy "task_statuses_update_authenticated"
on public.task_statuses
for update
to authenticated
using (true)
with check (true);

with id_mode as (
  select case
    when exists (select 1 from public.task_statuses where id = 44)
      and not exists (select 1 from public.task_statuses where id = 0)
      then 1
    else 0
  end as legacy_offset
),
task_seed as (
  select
    seed.base_id + id_mode.legacy_offset as id,
    seed.task_key,
    seed.est,
    seed.building,
    seed.floor_name,
    seed.owner
  from id_mode
  cross join (
    values
      (0, '1__future-engineering__ground__sarah', 1, 'Future - Engineering', 'Ground', 'sarah'),
      (1, '1__future-engineering__1st-floor__sarah', 1, 'Future - Engineering', '1st floor', 'sarah'),
      (2, '1__future-engineering__2nd-floor__hossam', 1, 'Future - Engineering', '2nd floor', 'hossam'),
      (3, '1__future-engineering__3rd-floor__hossam', 1, 'Future - Engineering', '3rd floor', 'hossam'),
      (4, '1__future-pharmacy__basement__sarah', 1, 'Future - Pharmacy', 'Basement', 'sarah'),
      (5, '1__future-pharmacy__ground__sarah', 1, 'Future - Pharmacy', 'Ground', 'sarah'),
      (6, '1__future-pharmacy__1st-floor__sarah', 1, 'Future - Pharmacy', '1st floor', 'sarah'),
      (7, '1__future-pharmacy__2nd-floor__hossam', 1, 'Future - Pharmacy', '2nd floor', 'hossam'),
      (8, '1__future-pharmacy__3rd-floor__hossam', 1, 'Future - Pharmacy', '3rd floor', 'hossam'),
      (9, '1__future-political-science__basement__sarah', 1, 'Future - Political Science', 'Basement', 'sarah'),
      (10, '1__future-political-science__ground__sarah', 1, 'Future - Political Science', 'Ground', 'sarah'),
      (11, '1__future-political-science__1st-floor__hossam', 1, 'Future - Political Science', '1st floor', 'hossam'),
      (12, '1__future-political-science__2nd-floor__hossam', 1, 'Future - Political Science', '2nd floor', 'hossam'),
      (13, '1__future-business__basement__sarah', 1, 'Future - Business', 'Basement', 'sarah'),
      (14, '1__future-business__1st-floor__sarah', 1, 'Future - Business', '1st floor', 'sarah'),
      (15, '1__future-business__2nd-floor__hossam', 1, 'Future - Business', '2nd floor', 'hossam'),
      (16, '1__future-business__3rd-floor__hossam', 1, 'Future - Business', '3rd floor', 'hossam'),
      (17, '1__future-dentistry__ground__sarah', 1, 'Future - Dentistry', 'Ground', 'sarah'),
      (18, '1__future-dentistry__1st-floor__sarah', 1, 'Future - Dentistry', '1st floor', 'sarah'),
      (19, '1__future-dentistry__2nd-floor__hossam', 1, 'Future - Dentistry', '2nd floor', 'hossam'),
      (20, '1__alex-engineering-b__1st-floor__sarah', 1, 'Alex - Engineering B', '1st floor', 'sarah'),
      (21, '1__alex-engineering-b__2nd-floor__sarah', 1, 'Alex - Engineering B', '2nd floor', 'sarah'),
      (22, '1__alex-engineering-b__3rd-floor__hossam', 1, 'Alex - Engineering B', '3rd floor', 'hossam'),
      (23, '1__alex-engineering-b__4th-floor__hossam', 1, 'Alex - Engineering B', '4th floor', 'hossam'),
      (24, '1__alex-pharmacy__2nd-floor__sarah', 1, 'Alex - Pharmacy', '2nd floor', 'sarah'),
      (25, '1__alex-pharmacy__3rd-floor__sarah', 1, 'Alex - Pharmacy', '3rd floor', 'sarah'),
      (26, '1__alex-pharmacy__4th-floor__hossam', 1, 'Alex - Pharmacy', '4th floor', 'hossam'),
      (27, '1__alex-pharmacy__5th-floor__hossam', 1, 'Alex - Pharmacy', '5th floor', 'hossam'),
      (28, '1__damietta-engineering__2nd-floor__sarah', 1, 'Damietta - Engineering', '2nd floor', 'sarah'),
      (29, '1__damietta-engineering__3rd-floor__hossam', 1, 'Damietta - Engineering', '3rd floor', 'hossam'),
      (30, '1__damietta-engineering__4th-floor__hossam', 1, 'Damietta - Engineering', '4th floor', 'hossam'),
      (31, '2__alex-pharmacy__2nd-floor__sarah', 2, 'Alex - Pharmacy', '2nd floor', 'sarah'),
      (32, '2__alex-pharmacy__3rd-floor__sarah', 2, 'Alex - Pharmacy', '3rd floor', 'sarah'),
      (33, '2__alex-pharmacy__4th-floor__hossam', 2, 'Alex - Pharmacy', '4th floor', 'hossam'),
      (34, '2__alex-pharmacy__5th-floor__hossam', 2, 'Alex - Pharmacy', '5th floor', 'hossam'),
      (35, '2__damietta-medicine__1st-floor__hossam', 2, 'Damietta - Medicine', '1st floor', 'hossam'),
      (36, '2__future-political-sc__ground__sarah', 2, 'Future - Political Sc', 'Ground', 'sarah'),
      (37, '2__future-political-sc__1st-floor__sarah', 2, 'Future - Political Sc', '1st floor', 'sarah'),
      (38, '2__future-political-sc__2nd-floor__hossam', 2, 'Future - Political Sc', '2nd floor', 'hossam'),
      (39, '2__future-political-sc__basement__hossam', 2, 'Future - Political Sc', 'Basement', 'hossam'),
      (40, '2__future-business__1st-floor__sarah', 2, 'Future - Business', '1st floor', 'sarah'),
      (41, '2__future-business__2nd-floor__sarah', 2, 'Future - Business', '2nd floor', 'sarah'),
      (42, '2__future-business__3rd-floor__hossam', 2, 'Future - Business', '3rd floor', 'hossam'),
      (43, '2__future-business__basement__hossam', 2, 'Future - Business', 'Basement', 'hossam')
  ) as seed(base_id, task_key, est, building, floor_name, owner)
)
insert into public.task_statuses (id, task_key, est, building, floor_name, owner, status)
select id, task_key, est, building, floor_name, owner, 'todo'
from task_seed
on conflict (id) do update
set
  task_key = excluded.task_key,
  est = excluded.est,
  building = excluded.building,
  floor_name = excluded.floor_name,
  owner = excluded.owner;

create unique index if not exists task_statuses_task_key_idx
on public.task_statuses (task_key)
where task_key is not null;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'task_statuses'
  ) then
    execute 'alter publication supabase_realtime add table public.task_statuses';
  end if;
end $$;
