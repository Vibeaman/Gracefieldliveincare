-- Run this once in the Supabase SQL editor if the rest of the schema is already live.
-- It stores contact-form messages so they are not lost while Resend is still verifying.

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  subject text not null
    check (subject in ('care', 'referral', 'careers')),
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.enquiries enable row level security;
