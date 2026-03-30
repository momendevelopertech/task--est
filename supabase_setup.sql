create table if not exists public.task_statuses (
  id bigint primary key,
  status text not null default 'todo' check (status in ('todo', 'wip', 'done'))
);

alter table public.task_statuses enable row level security;

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

insert into public.task_statuses (id, status)
values
  (0, 'todo'),
  (1, 'todo'),
  (2, 'todo'),
  (3, 'todo'),
  (4, 'todo'),
  (5, 'todo'),
  (6, 'todo'),
  (7, 'todo'),
  (8, 'todo'),
  (9, 'todo'),
  (10, 'todo'),
  (11, 'todo'),
  (12, 'todo'),
  (13, 'todo'),
  (14, 'todo'),
  (15, 'todo'),
  (16, 'todo'),
  (17, 'todo'),
  (18, 'todo'),
  (19, 'todo'),
  (20, 'todo'),
  (21, 'todo'),
  (22, 'todo'),
  (23, 'todo'),
  (24, 'todo'),
  (25, 'todo'),
  (26, 'todo'),
  (27, 'todo'),
  (28, 'todo'),
  (29, 'todo'),
  (30, 'todo'),
  (31, 'todo'),
  (32, 'todo'),
  (33, 'todo'),
  (34, 'todo'),
  (35, 'todo'),
  (36, 'todo'),
  (37, 'todo'),
  (38, 'todo'),
  (39, 'todo'),
  (40, 'todo'),
  (41, 'todo'),
  (42, 'todo'),
  (43, 'todo')
on conflict (id) do nothing;

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
