-- Add 'backlog' (lowest) and 'asap' (highest) priority levels.
-- Run this in the Supabase SQL editor against an existing database.

alter table tasks
  drop constraint if exists tasks_priority_check;

alter table tasks
  add constraint tasks_priority_check
  check (priority in ('backlog', 'low', 'medium', 'high', 'asap'));
