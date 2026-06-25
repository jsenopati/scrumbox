-- Add sort_order to task_lists and tasks for manual ordering
-- Add section to task_lists for dashboard grouping

alter table task_lists
  add column if not exists sort_order int not null default 0,
  add column if not exists section text not null default 'focus'
    check (section in ('focus', 'concurrent', 'backlog'));

alter table tasks
  add column if not exists sort_order int not null default 0;

-- Seed sort_order for existing task_lists based on created_at
update task_lists
set sort_order = sub.rn
from (
  select id, (row_number() over (order by created_at)) * 10 as rn
  from task_lists
) sub
where task_lists.id = sub.id;

-- Seed sort_order for existing tasks based on created_at within each list
update tasks
set sort_order = sub.rn
from (
  select id, (row_number() over (partition by task_list_id order by created_at)) * 10 as rn
  from tasks
) sub
where tasks.id = sub.id;
