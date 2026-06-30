-- Add a freeform notes field to tasks and an optional checklist per task.

alter table tasks
  add column if not exists notes text not null default '';

create table if not exists task_checklist_items (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references tasks(id) on delete cascade,
  content     text not null,
  checked     boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists task_checklist_items_task_id_idx
  on task_checklist_items (task_id);
