-- Gracefield Living in Care — Supabase schema
-- Paste this into the Supabase SQL editor and run it once.
-- Dashboard: Project Settings → API for the URL and keys.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.clients (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.carers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text not null default '',
  photo_url text not null default '',
  specialty text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  years_experience text not null,
  availability text not null,
  about text not null,
  photo_url text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  care_type text not null,
  location text not null,
  start_date date not null,
  hours text not null,
  status text not null default 'pending'
    check (status in ('pending', 'assigned', 'active', 'completed')),
  assigned_carer_id uuid references public.carers (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  carer_id uuid not null references public.carers (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (booking_id)
);

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

-- ---------------------------------------------------------------------------
-- New-user trigger: every auth user gets a clients row
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.clients (id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.clients enable row level security;
alter table public.carers enable row level security;
alter table public.applications enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.enquiries enable row level security;

-- clients: a person can only see and update their own row
drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own"
  on public.clients for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "clients_update_own" on public.clients;
create policy "clients_update_own"
  on public.clients for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "clients_insert_own" on public.clients;
create policy "clients_insert_own"
  on public.clients for insert
  to authenticated
  with check (auth.uid() = id);

-- bookings: a client can read and create their own requests.
-- They cannot change status or assigned_carer_id (no update policy for clients).
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings for select
  to authenticated
  using (client_id = auth.uid());

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
  on public.bookings for insert
  to authenticated
  with check (
    client_id = auth.uid()
    and status = 'pending'
    and assigned_carer_id is null
  );

-- reviews: a client can leave one review on their own completed booking
drop policy if exists "reviews_select_own" on public.reviews;
create policy "reviews_select_own"
  on public.reviews for select
  to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = reviews.booking_id
        and b.client_id = auth.uid()
    )
  );

drop policy if exists "reviews_insert_own_completed" on public.reviews;
create policy "reviews_insert_own_completed"
  on public.reviews for insert
  to authenticated
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.client_id = auth.uid()
        and b.status = 'completed'
        and b.assigned_carer_id = reviews.carer_id
    )
  );

-- carers: anyone can read (clients need the assigned carer's name). Writes are
-- admin-only via the service role, which bypasses RLS.
drop policy if exists "carers_public_read" on public.carers;
create policy "carers_public_read"
  on public.carers for select
  to anon, authenticated
  using (true);

-- applications: anyone can apply. Reads and updates are admin-only (service role).
drop policy if exists "applications_public_insert" on public.applications;
create policy "applications_public_insert"
  on public.applications for insert
  to anon, authenticated
  with check (status = 'pending');

-- enquiries: writes go through the service role. No public policies.

-- ---------------------------------------------------------------------------
-- Storage: public-read photos. Applications can upload; carer photos go
-- through the admin service role.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos_public_read" on storage.objects;
create policy "photos_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'photos');

drop policy if exists "photos_public_insert_applications" on storage.objects;
create policy "photos_public_insert_applications"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = 'applications'
  );
