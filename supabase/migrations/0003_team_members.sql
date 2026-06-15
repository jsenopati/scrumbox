-- Explicit team member roster for the assignee dropdown.
-- Run this in the Supabase SQL editor against an existing database.

create table if not exists team_members (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);
