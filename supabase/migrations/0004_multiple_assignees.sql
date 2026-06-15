-- Migrate assignee (text) to assignees (text[])
alter table tasks rename column assignee to assignees;
alter table tasks alter column assignees drop default;
alter table tasks alter column assignees type text[] using array[assignees]::text[];
alter table tasks alter column assignees set default '{}';
-- Remove empty-string entries carried over from unassigned tasks
update tasks set assignees = '{}' where assignees = array['']::text[];
