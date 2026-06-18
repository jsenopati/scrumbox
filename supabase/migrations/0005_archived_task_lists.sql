-- Add archived_at column to task_lists.
-- NULL means active; a timestamp means the list has been archived.

alter table task_lists
  add column if not exists archived_at timestamptz;
