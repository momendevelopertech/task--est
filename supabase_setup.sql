create table if not exists public.team_members (
  slug text primary key,
  display_name text not null,
  role text not null default 'member' check (role in ('admin', 'lead', 'member')),
  manager_slug text,
  accent_key text not null default 'accent',
  sort_order integer not null default 0,
  active boolean not null default true
);

alter table public.team_members
  add column if not exists display_name text,
  add column if not exists role text,
  add column if not exists manager_slug text,
  add column if not exists accent_key text,
  add column if not exists sort_order integer,
  add column if not exists active boolean;

update public.team_members
set
  display_name = coalesce(nullif(display_name, ''), slug),
  role = coalesce(role, 'member'),
  accent_key = coalesce(nullif(accent_key, ''), 'accent'),
  sort_order = coalesce(sort_order, 0),
  active = coalesce(active, true);

alter table public.team_members
  alter column display_name set not null,
  alter column role set default 'member',
  alter column role set not null,
  alter column accent_key set default 'accent',
  alter column accent_key set not null,
  alter column sort_order set default 0,
  alter column sort_order set not null,
  alter column active set default true,
  alter column active set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'team_members_role_check'
      and conrelid = 'public.team_members'::regclass
  ) then
    execute 'alter table public.team_members add constraint team_members_role_check check (role in (''admin'', ''lead'', ''member''))';
  end if;
end $$;

create table if not exists public.task_statuses (
  id bigint primary key,
  task_key text,
  est smallint,
  building text,
  floor_name text,
  owner text,
  status text not null default 'todo' check (status in ('todo', 'wip', 'done')),
  note text not null default '',
  missing boolean not null default false
);

alter table public.task_statuses
  add column if not exists task_key text,
  add column if not exists est smallint,
  add column if not exists building text,
  add column if not exists floor_name text,
  add column if not exists owner text,
  add column if not exists note text,
  add column if not exists missing boolean;

alter table public.task_statuses
  drop constraint if exists task_statuses_owner_check;

update public.task_statuses
set
  note = coalesce(note, ''),
  missing = coalesce(missing, false);

alter table public.task_statuses
  alter column note set default '',
  alter column note set not null,
  alter column missing set default false,
  alter column missing set not null;

insert into public.team_members (
  slug,
  display_name,
  role,
  manager_slug,
  accent_key,
  sort_order,
  active
)
values
  ('admin', 'Admin', 'admin', null, 'accent', 0, true),
  ('momen', 'Momen', 'lead', 'admin', 'momen', 10, true),
  ('sarah', 'Sarah Hadad', 'member', 'momen', 'sarah', 20, true),
  ('hossam', 'Hossam', 'member', 'momen', 'hossam', 30, true),
  ('ayman', 'Ayman', 'lead', 'admin', 'ayman', 40, true),
  ('amany', 'Amany', 'member', 'ayman', 'amany', 50, true),
  ('asmaa', 'Asmaa', 'member', 'ayman', 'asmaa', 60, true),
  ('omar', 'Omar', 'member', 'ayman', 'omar', 70, true),
  ('hosary', 'Hosary', 'lead', 'admin', 'hosary', 80, true),
  ('mahmoud-feid', 'Mahmoud Feid', 'member', 'hosary', 'mahmoud', 90, true),
  ('momen-abdelshafy', 'Momen Abdelshafy', 'member', 'hosary', 'momen-abdelshafy', 100, true)
on conflict (slug) do update
set
  display_name = excluded.display_name,
  role = excluded.role,
  manager_slug = excluded.manager_slug,
  accent_key = excluded.accent_key,
  sort_order = excluded.sort_order,
  active = excluded.active;

with task_seed(seed_order, task_key, est, building, floor_name, owner) as (
  values
    (1, '1__future-business__basement__sarah', 1, 'Future - Business', 'Basement', 'sarah'),
    (2, '1__future-business__1st-floor__sarah', 1, 'Future - Business', '1st floor', 'sarah'),
    (3, '1__future-business__2nd-floor__hossam', 1, 'Future - Business', '2nd floor', 'hossam'),
    (4, '1__future-business__3rd-floor__hossam', 1, 'Future - Business', '3rd floor', 'hossam'),
    (5, '1__future-dentistry__ground__sarah', 1, 'Future - Dentistry', 'Ground', 'sarah'),
    (6, '1__future-dentistry__1st-floor__sarah', 1, 'Future - Dentistry', '1st floor', 'sarah'),
    (7, '1__future-dentistry__2nd-floor__hossam', 1, 'Future - Dentistry', '2nd floor', 'hossam'),
    (8, '1__future-engineering__ground__sarah', 1, 'Future - Engineering', 'Ground', 'sarah'),
    (9, '1__future-engineering__1st-floor__sarah', 1, 'Future - Engineering', '1st floor', 'sarah'),
    (10, '1__future-engineering__2nd-floor__hossam', 1, 'Future - Engineering', '2nd floor', 'hossam'),
    (11, '1__future-engineering__3rd-floor__hossam', 1, 'Future - Engineering', '3rd floor', 'hossam'),
    (12, '1__future-pharmacy__basement__sarah', 1, 'Future - Pharmacy', 'Basement', 'sarah'),
    (13, '1__future-pharmacy__ground__sarah', 1, 'Future - Pharmacy', 'Ground', 'sarah'),
    (14, '1__future-pharmacy__1st-floor__sarah', 1, 'Future - Pharmacy', '1st floor', 'sarah'),
    (15, '1__future-pharmacy__2nd-floor__hossam', 1, 'Future - Pharmacy', '2nd floor', 'hossam'),
    (16, '1__future-pharmacy__3rd-floor__hossam', 1, 'Future - Pharmacy', '3rd floor', 'hossam'),
    (17, '1__future-political-science__basement__sarah', 1, 'Future - Political Science', 'Basement', 'sarah'),
    (18, '1__future-political-science__ground__sarah', 1, 'Future - Political Science', 'Ground', 'sarah'),
    (19, '1__future-political-science__1st-floor__hossam', 1, 'Future - Political Science', '1st floor', 'hossam'),
    (20, '1__future-political-science__2nd-floor__hossam', 1, 'Future - Political Science', '2nd floor', 'hossam'),
    (21, '1__alex-engineering-b__1st-floor__sarah', 1, 'Alex - Engineering B', '1st floor', 'sarah'),
    (22, '1__alex-engineering-b__2nd-floor__sarah', 1, 'Alex - Engineering B', '2nd floor', 'sarah'),
    (23, '1__alex-engineering-b__3rd-floor__hossam', 1, 'Alex - Engineering B', '3rd floor', 'hossam'),
    (24, '1__alex-engineering-b__4th-floor__hossam', 1, 'Alex - Engineering B', '4th floor', 'hossam'),
    (25, '1__alex-pharmacy__2nd-floor__sarah', 1, 'Alex - Pharmacy', '2nd floor', 'sarah'),
    (26, '1__alex-pharmacy__3rd-floor__sarah', 1, 'Alex - Pharmacy', '3rd floor', 'sarah'),
    (27, '1__alex-pharmacy__4th-floor__hossam', 1, 'Alex - Pharmacy', '4th floor', 'hossam'),
    (28, '1__alex-pharmacy__5th-floor__hossam', 1, 'Alex - Pharmacy', '5th floor', 'hossam'),
    (29, '1__damietta-engineering__2nd-floor__sarah', 1, 'Damietta - Engineering', '2nd floor', 'sarah'),
    (30, '1__damietta-engineering__3rd-floor__hossam', 1, 'Damietta - Engineering', '3rd floor', 'hossam'),
    (31, '1__damietta-engineering__4th-floor__hossam', 1, 'Damietta - Engineering', '4th floor', 'hossam'),
    (32, '1__minya-business__ground__ayman', 1, 'Minya - Business', 'Ground', 'ayman'),
    (33, '1__minya-business__1st-floor__ayman', 1, 'Minya - Business', '1st floor', 'ayman'),
    (34, '1__minya-business__2nd-floor__ayman', 1, 'Minya - Business', '2nd floor', 'ayman'),
    (35, '1__minya-dentistry__ground__ayman', 1, 'Minya - Dentistry', 'Ground', 'ayman'),
    (36, '1__minya-dentistry__1st-floor__ayman', 1, 'Minya - Dentistry', '1st floor', 'ayman'),
    (37, '1__minya-dentistry__2nd-floor__ayman', 1, 'Minya - Dentistry', '2nd floor', 'ayman'),
    (38, '1__minya-physical-therapy__ground__ayman', 1, 'Minya - Physical Therapy', 'Ground', 'ayman'),
    (39, '1__minya-physical-therapy__1st-floor__ayman', 1, 'Minya - Physical Therapy', '1st floor', 'ayman'),
    (40, '1__minya-physical-therapy__2nd-floor__ayman', 1, 'Minya - Physical Therapy', '2nd floor', 'ayman'),
    (41, '1__sadat-dentistry__1st-floor__ayman', 1, 'Sadat - Dentistry', '1st floor', 'ayman'),
    (42, '1__sadat-physical-therapy__1st-floor__ayman', 1, 'Sadat - Physical Therapy', '1st floor', 'ayman'),
    (43, '1__smart-eng-a__1st-floor__omar', 1, 'Smart - Eng A', '1st floor', 'omar'),
    (44, '1__smart-eng-a__3rd-floor__omar', 1, 'Smart - Eng A', '3rd floor', 'omar'),
    (45, '1__smart-eng-a__4th-floor__omar', 1, 'Smart - Eng A', '4th floor', 'omar'),
    (46, '1__smart-eng-a__5th-floor__omar', 1, 'Smart - Eng A', '5th floor', 'omar'),
    (47, '1__smart-eng-b__1st-floor__amany', 1, 'Smart - Eng B', '1st floor', 'amany'),
    (48, '1__smart-eng-b__2nd-floor__amany', 1, 'Smart - Eng B', '2nd floor', 'amany'),
    (49, '1__schools__al-andalus-international-school__momen-abdelshafy', 1, 'Schools', 'Al-Andalus International School', 'momen-abdelshafy'),
    (50, '1__schools__el-zahraa-international-school__mahmoud-feid', 1, 'Schools', 'El Zahraa International School', 'mahmoud-feid'),
    (51, '1__schools__future-international-school__mahmoud-feid', 1, 'Schools', 'Future International School', 'mahmoud-feid'),
    (52, '1__schools__integrated-thebes-american-college__momen-abdelshafy', 1, 'Schools', 'Integrated Thebes American College', 'momen-abdelshafy'),
    (53, '1__schools__new-vision-international-school__mahmoud-feid', 1, 'Schools', 'New Vision International School', 'mahmoud-feid'),
    (54, '1__schools__rawasy-misr-international-school__momen-abdelshafy', 1, 'Schools', 'Rawasy Misr International School', 'momen-abdelshafy'),
    (55, '1__sheraton-engineering-a__1st-floor__mahmoud-feid', 1, 'Sheraton - Engineering A', '1st floor', 'mahmoud-feid'),
    (56, '1__sheraton-engineering-a__3rd-floor__mahmoud-feid', 1, 'Sheraton - Engineering A', '3rd floor', 'mahmoud-feid'),
    (57, '1__sheraton-engineering-a__4th-floor__mahmoud-feid', 1, 'Sheraton - Engineering A', '4th floor', 'mahmoud-feid'),
    (58, '1__sheraton-engineering-b__1st-floor__mahmoud-feid', 1, 'Sheraton - Engineering B', '1st floor', 'mahmoud-feid'),
    (59, '1__sheraton-engineering-b__2nd-floor__mahmoud-feid', 1, 'Sheraton - Engineering B', '2nd floor', 'mahmoud-feid'),
    (60, '1__sheraton-engineering-b__3rd-floor__mahmoud-feid', 1, 'Sheraton - Engineering B', '3rd floor', 'mahmoud-feid'),
    (61, '1__sheraton-engineering-b__4th-floor__mahmoud-feid', 1, 'Sheraton - Engineering B', '4th floor', 'mahmoud-feid'),
    (62, '1__sheraton-language-and-media__1st-floor__momen-abdelshafy', 1, 'Sheraton - Language and Media', '1st floor', 'momen-abdelshafy'),
    (63, '1__sheraton-language-and-media__2nd-floor__momen-abdelshafy', 1, 'Sheraton - Language and Media', '2nd floor', 'momen-abdelshafy'),
    (64, '1__sheraton-language-and-media__3rd-floor__momen-abdelshafy', 1, 'Sheraton - Language and Media', '3rd floor', 'momen-abdelshafy'),
    (65, '1__sheraton-language-and-media__4th-floor__momen-abdelshafy', 1, 'Sheraton - Language and Media', '4th floor', 'momen-abdelshafy'),
    (66, '1__sheraton-language-and-media__5th-floor__momen-abdelshafy', 1, 'Sheraton - Language and Media', '5th floor', 'momen-abdelshafy'),
    (67, '1__sheraton-transport__2nd-floor__momen-abdelshafy', 1, 'Sheraton - Transport', '2nd floor', 'momen-abdelshafy'),
    (68, '1__sheraton-transport__3rd-floor__momen-abdelshafy', 1, 'Sheraton - Transport', '3rd floor', 'momen-abdelshafy'),
    (69, '1__sheraton-transport__4th-floor__momen-abdelshafy', 1, 'Sheraton - Transport', '4th floor', 'momen-abdelshafy'),
    (70, '2__alex-pharmacy__2nd-floor__sarah', 2, 'Alex - Pharmacy', '2nd floor', 'sarah'),
    (71, '2__alex-pharmacy__3rd-floor__sarah', 2, 'Alex - Pharmacy', '3rd floor', 'sarah'),
    (72, '2__alex-pharmacy__4th-floor__hossam', 2, 'Alex - Pharmacy', '4th floor', 'hossam'),
    (73, '2__alex-pharmacy__5th-floor__hossam', 2, 'Alex - Pharmacy', '5th floor', 'hossam'),
    (74, '2__damietta-medicine__1st-floor__hossam', 2, 'Damietta - Medicine', '1st floor', 'hossam'),
    (75, '2__future-business__basement__hossam', 2, 'Future - Business', 'Basement', 'hossam'),
    (76, '2__future-business__1st-floor__sarah', 2, 'Future - Business', '1st floor', 'sarah'),
    (77, '2__future-business__2nd-floor__sarah', 2, 'Future - Business', '2nd floor', 'sarah'),
    (78, '2__future-business__3rd-floor__hossam', 2, 'Future - Business', '3rd floor', 'hossam'),
    (79, '2__future-political-sc__basement__hossam', 2, 'Future - Political Sc', 'Basement', 'hossam'),
    (80, '2__future-political-sc__ground__sarah', 2, 'Future - Political Sc', 'Ground', 'sarah'),
    (81, '2__future-political-sc__1st-floor__sarah', 2, 'Future - Political Sc', '1st floor', 'sarah'),
    (82, '2__future-political-sc__2nd-floor__hossam', 2, 'Future - Political Sc', '2nd floor', 'hossam'),
    (83, '2__minya-business__1st-floor__ayman', 2, 'Minya - Business', '1st floor', 'ayman'),
    (84, '2__minya-business__2nd-floor__ayman', 2, 'Minya - Business', '2nd floor', 'ayman'),
    (85, '2__minya-dentistry__ground__asmaa', 2, 'Minya - Dentistry', 'Ground', 'asmaa'),
    (86, '2__minya-dentistry__1st-floor__asmaa', 2, 'Minya - Dentistry', '1st floor', 'asmaa'),
    (87, '2__minya-dentistry__2nd-floor__asmaa', 2, 'Minya - Dentistry', '2nd floor', 'asmaa'),
    (88, '2__sadat-dentistry__1st-floor__ayman', 2, 'Sadat - Dentistry', '1st floor', 'ayman'),
    (89, '2__sadat-physical-therapy__1st-floor__ayman', 2, 'Sadat - Physical Therapy', '1st floor', 'ayman'),
    (90, '2__schools__al-andalus-international-school__momen-abdelshafy', 2, 'Schools', 'Al-Andalus International School', 'momen-abdelshafy'),
    (91, '2__schools__el-zahraa-international-school__mahmoud-feid', 2, 'Schools', 'El Zahraa International School', 'mahmoud-feid'),
    (92, '2__schools__future-international-school__mahmoud-feid', 2, 'Schools', 'Future International School', 'mahmoud-feid'),
    (93, '2__schools__integrated-thebes-american-college__momen-abdelshafy', 2, 'Schools', 'Integrated Thebes American College', 'momen-abdelshafy'),
    (94, '2__schools__new-vision-international-school__mahmoud-feid', 2, 'Schools', 'New Vision International School', 'mahmoud-feid'),
    (95, '2__schools__rawasy-misr-international-school__momen-abdelshafy', 2, 'Schools', 'Rawasy Misr International School', 'momen-abdelshafy'),
    (96, '2__sheraton-language-and-media__1st-floor__momen-abdelshafy', 2, 'Sheraton - Language and Media', '1st floor', 'momen-abdelshafy'),
    (97, '2__sheraton-language-and-media__2nd-floor__momen-abdelshafy', 2, 'Sheraton - Language and Media', '2nd floor', 'momen-abdelshafy'),
    (98, '2__sheraton-language-and-media__3rd-floor__momen-abdelshafy', 2, 'Sheraton - Language and Media', '3rd floor', 'momen-abdelshafy'),
    (99, '2__sheraton-language-and-media__4th-floor__momen-abdelshafy', 2, 'Sheraton - Language and Media', '4th floor', 'momen-abdelshafy'),
    (100, '2__sheraton-language-and-media__5th-floor__momen-abdelshafy', 2, 'Sheraton - Language and Media', '5th floor', 'momen-abdelshafy'),
    (101, '2__sheraton-transport__2nd-floor__mahmoud-feid', 2, 'Sheraton - Transport', '2nd floor', 'mahmoud-feid'),
    (102, '2__sheraton-transport__3rd-floor__mahmoud-feid', 2, 'Sheraton - Transport', '3rd floor', 'mahmoud-feid'),
    (103, '2__sheraton-transport__4th-floor__mahmoud-feid', 2, 'Sheraton - Transport', '4th floor', 'mahmoud-feid'),
    (104, '2__sheraton-transport__5th-floor__mahmoud-feid', 2, 'Sheraton - Transport', '5th floor', 'mahmoud-feid'),
    (105, '2__smart-eng-a__1st-floor__omar', 2, 'Smart - Eng A', '1st floor', 'omar'),
    (106, '2__smart-eng-a__3rd-floor__asmaa', 2, 'Smart - Eng A', '3rd floor', 'asmaa'),
    (107, '2__smart-eng-a__4th-floor__amany', 2, 'Smart - Eng A', '4th floor', 'amany'),
    (108, '2__smart-eng-a__5th-floor__asmaa', 2, 'Smart - Eng A', '5th floor', 'asmaa')
),
existing_seed as (
  select
    task_seed.seed_order,
    task_seed.task_key,
    task_seed.est,
    task_seed.building,
    task_seed.floor_name,
    task_seed.owner,
    public.task_statuses.id as existing_id
  from task_seed
  left join public.task_statuses
    on public.task_statuses.task_key = task_seed.task_key
),
max_existing as (
  select coalesce(max(id), 0) as max_id
  from public.task_statuses
),
new_seed_rows as (
  select
    seed_order,
    row_number() over (order by seed_order) as new_row_number
  from existing_seed
  where existing_id is null
),
normalized_seed as (
  select
    coalesce(existing_seed.existing_id, max_existing.max_id + new_seed_rows.new_row_number) as id,
    existing_seed.task_key,
    existing_seed.est,
    existing_seed.building,
    existing_seed.floor_name,
    existing_seed.owner
  from existing_seed
  cross join max_existing
  left join new_seed_rows
    on new_seed_rows.seed_order = existing_seed.seed_order
)
insert into public.task_statuses (
  id,
  task_key,
  est,
  building,
  floor_name,
  owner,
  status,
  note,
  missing
)
select
  id,
  task_key,
  est,
  building,
  floor_name,
  owner,
  'todo',
  '',
  false
from normalized_seed
on conflict (id) do update
set
  task_key = excluded.task_key,
  est = excluded.est,
  building = excluded.building,
  floor_name = excluded.floor_name,
  owner = excluded.owner;

insert into public.task_statuses (
  id,
  task_key,
  est,
  building,
  floor_name,
  owner,
  status,
  note,
  missing
)
values (
  -1,
  '__system__group-review-v1',
  0,
  '__system__',
  'group-review-state',
  'admin',
  'done',
  '{}',
  false
)
on conflict (id) do nothing;

create unique index if not exists task_statuses_task_key_idx
on public.task_statuses (task_key)
where task_key is not null;

create index if not exists task_statuses_owner_idx
on public.task_statuses (owner);

create index if not exists team_members_manager_slug_idx
on public.team_members (manager_slug)
where manager_slug is not null;

create index if not exists team_members_sort_order_idx
on public.team_members (sort_order, display_name);

alter table public.team_members enable row level security;
alter table public.team_members replica identity full;

alter table public.task_statuses enable row level security;
alter table public.task_statuses replica identity full;

grant usage on schema public to anon;
grant usage on schema public to authenticated;

grant select, insert, update, delete on table public.team_members to anon;
grant select, insert, update, delete on table public.team_members to authenticated;
grant select, insert, update, delete on table public.task_statuses to anon;
grant select, insert, update, delete on table public.task_statuses to authenticated;

drop policy if exists "team_members_all_anon" on public.team_members;
create policy "team_members_all_anon"
on public.team_members
for all
to anon
using (true)
with check (true);

drop policy if exists "team_members_all_authenticated" on public.team_members;
create policy "team_members_all_authenticated"
on public.team_members
for all
to authenticated
using (true)
with check (true);

drop policy if exists "task_statuses_select_anon" on public.task_statuses;
drop policy if exists "task_statuses_update_anon" on public.task_statuses;
drop policy if exists "task_statuses_select_authenticated" on public.task_statuses;
drop policy if exists "task_statuses_update_authenticated" on public.task_statuses;
drop policy if exists "task_statuses_all_anon" on public.task_statuses;
create policy "task_statuses_all_anon"
on public.task_statuses
for all
to anon
using (true)
with check (true);

drop policy if exists "task_statuses_all_authenticated" on public.task_statuses;
create policy "task_statuses_all_authenticated"
on public.task_statuses
for all
to authenticated
using (true)
with check (true);

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

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'team_members'
  ) then
    execute 'alter publication supabase_realtime add table public.team_members';
  end if;
end $$;
