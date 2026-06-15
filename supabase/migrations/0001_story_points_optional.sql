-- Make story points optional (nullable) so tasks can opt out of tracking.
-- Run this once in the Supabase SQL editor against an existing database.

alter table tasks alter column story_points drop default;
alter table tasks alter column story_points drop not null;
