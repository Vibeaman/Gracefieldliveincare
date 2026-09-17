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

create or replace function public.current_carer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.carers where user_id = auth.uid() limit 1;
$$;

create or replace function public.client_is_assigned_carer(p_carer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.bookings
    where assigned_carer_id = p_carer_id
      and client_id = auth.uid()
  );
$$;

revoke all on function public.current_carer_id() from public;
revoke all on function public.client_is_assigned_carer(uuid) from public;
grant execute on function public.current_carer_id() to authenticated;
grant execute on function public.client_is_assigned_carer(uuid) to authenticated;

drop policy if exists "application_documents_carer_select" on public.application_documents;
create policy "application_documents_carer_select"
  on public.application_documents for select
  to authenticated
  using (
    carer_id = public.current_carer_id()
    or application_id in (
      select application_id from public.carers
      where id = public.current_carer_id()
        and application_id is not null
    )
  );

drop policy if exists "bookings_select_assigned_carer" on public.bookings;
create policy "bookings_select_assigned_carer"
  on public.bookings for select
  to authenticated
  using (assigned_carer_id = public.current_carer_id());

drop policy if exists "bookings_complete_assigned_carer" on public.bookings;
create policy "bookings_complete_assigned_carer"
  on public.bookings for update
  to authenticated
  using (
    assigned_carer_id = public.current_carer_id()
    and status in ('assigned', 'active')
  )
  with check (
    assigned_carer_id = public.current_carer_id()
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
      where b.client_id = clients.id
        and b.assigned_carer_id = public.current_carer_id()
    )
  );

drop policy if exists "carers_public_read" on public.carers;
drop policy if exists "carers_select_own_row" on public.carers;
create policy "carers_public_read"
  on public.carers for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.client_is_assigned_carer(id)
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
      where d.storage_path = name
        and (
          d.carer_id = public.current_carer_id()
          or d.application_id in (
            select application_id from public.carers
            where id = public.current_carer_id()
              and application_id is not null
          )
        )
    )
  );
