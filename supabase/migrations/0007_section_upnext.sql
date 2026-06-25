-- Add 'upnext' to the section check constraint on task_lists.
-- Postgres requires dropping and re-adding the constraint to change it.

alter table task_lists
  drop constraint if exists task_lists_section_check;

alter table task_lists
  add constraint task_lists_section_check
    check (section in ('focus', 'upnext', 'concurrent', 'backlog'));
