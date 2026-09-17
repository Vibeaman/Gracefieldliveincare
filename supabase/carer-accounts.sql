-- Run this once in the Supabase SQL editor if the rest of the schema is already live.
-- Adds carer logins, private document uploads, and the extra admin views.

-- ---------------------------------------------------------------------------
-- Extra columns on carers
-- ---------------------------------------------------------------------------

alter table public.carers
  add column if not exists user_id uuid unique references auth.users (id) on delete set null;

alter table public.carers
  add column if not exists application_id uuid unique references public.applications (id) on delete set null;

alter table public.carers
  add column if not exists work_email text;

alter table public.carers
  add column if not exists mailbox_status text not null default 'none';

alter table public.carers
  drop constraint if exists carers_mailbox_status_check;

alter table public.carers
  add constraint carers_mailbox_status_check
  check (mailbox_status in ('none', 'skipped', 'created', 'failed'));

-- ---------------------------------------------------------------------------
-- Application documents
-- ---------------------------------------------------------------------------

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  carer_id uuid references public.carers (id) on delete set null,
  doc_type text not null
    check (doc_type in ('id', 'proof_of_address', 'reference', 'certificate', 'dbs')),
  file_name text not null,
  storage_path text not null,
  content_type text not null default '',
  status text not null default 'uploaded'
    check (status in ('uploaded', 'reviewed', 'verified')),
  created_at timestamptz not null default now(),
  unique (application_id, doc_type)
);

alter table public.application_documents enable row level security;

drop policy if exists "application_documents_public_insert" on public.application_documents;
create policy "application_documents_public_insert"
  on public.application_documents for insert
  to anon, authenticated
  with check (status = 'uploaded');

drop policy if exists "application_documents_carer_select" on public.application_documents;
create policy "application_documents_carer_select"
  on public.application_documents for select
  to authenticated
  using (
    carer_id in (select id from public.carers where user_id = auth.uid())
    or application_id in (
      select application_id from public.carers
      where user_id = auth.uid() and application_id is not null
    )
  );

-- ---------------------------------------------------------------------------
-- New-user trigger: carer accounts must not get a family (clients) row
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_app_meta_data ->> 'role', '') = 'carer' then
    return new;
  end if;

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

-- ---------------------------------------------------------------------------
-- Bookings / clients: a signed-in carer can see their own assigned work
-- ---------------------------------------------------------------------------

drop policy if exists "bookings_select_assigned_carer" on public.bookings;
create policy "bookings_select_assigned_carer"
  on public.bookings for select
  to authenticated
  using (
    assigned_carer_id in (select id from public.carers where user_id = auth.uid())
  );

drop policy if exists "bookings_complete_assigned_carer" on public.bookings;
create policy "bookings_complete_assigned_carer"
  on public.bookings for update
  to authenticated
  using (
    assigned_carer_id in (select id from public.carers where user_id = auth.uid())
    and status in ('assigned', 'active')
  )
  with check (
    assigned_carer_id in (select id from public.carers where user_id = auth.uid())
    and status = 'completed'
  );

drop policy if exists "clients_select_for_assigned_booking" on public.clients;
create policy "clients_select_for_assigned_booking"
  on public.clients for select
  to authenticated
  using (
    exists (
      select 1
      from public.bookings b
      join public.carers c on c.id = b.assigned_carer_id
      where b.client_id = clients.id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "carers_public_read" on public.carers;
create policy "carers_public_read"
  on public.carers for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.bookings b
      where b.assigned_carer_id = carers.id
        and b.client_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- Private storage bucket for application / carer documents
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('carer-documents', 'carer-documents', false)
on conflict (id) do nothing;

drop policy if exists "carer_docs_insert_applications" on storage.objects;
create policy "carer_docs_insert_applications"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'carer-documents'
    and (storage.foldername(name))[1] = 'applications'
  );

drop policy if exists "carer_docs_select_own" on storage.objects;
create policy "carer_docs_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'carer-documents'
    and exists (
      select 1
      from public.application_documents d
      join public.carers c
        on c.id = d.carer_id
        or c.application_id = d.application_id
      where c.user_id = auth.uid()
        and d.storage_path = name
    )
  );
