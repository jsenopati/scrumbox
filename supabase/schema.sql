-- ScrumBox schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).

-- task_lists: a sprint / project grouping
create table if not exists task_lists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null default '',
  sprint      text,
  start_date  date,
  end_date    date,
  created_at  timestamptz not null default now()
);

-- tasks: belongs to a task_list
create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  task_list_id  uuid not null references task_lists(id) on delete cascade,
  title         text not null,
  description   text not null default '',
  assignee      text not null default '',
  story_points  int,
  status        text not null default 'not-started'
                check (status in ('not-started','in-progress','completed')),
  priority      text not null default 'medium'
                check (priority in ('backlog','low','medium','high','asap')),
  due_date      date,
  tags          text[] not null default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists tasks_task_list_id_idx on tasks (task_list_id);

-- team_members: explicit roster used for the assignee dropdown
create table if not exists team_members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);
