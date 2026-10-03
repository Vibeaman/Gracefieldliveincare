-- Office applications. Separate from carer applications.
-- Paste into the Supabase SQL editor and run once.
-- Applying creates a row only. Accepting creates the work mailbox later.

create table if not exists public.team_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  job text not null,
  about text not null,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  work_email text,
  mailbox_status text not null default 'none'
    check (mailbox_status in ('none', 'skipped', 'created', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.team_applications enable row level security;

drop policy if exists "team_applications_public_insert" on public.team_applications;
create policy "team_applications_public_insert"
  on public.team_applications for insert
  to anon, authenticated
  with check (status = 'pending' and mailbox_status = 'none' and work_email is null);
