-- Run this once in the Supabase SQL editor.
-- Fixes: "infinite recursion detected in policy for relation carers"
-- by looking up the current carer through a security-definer function
-- that does not re-enter RLS.

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

drop policy if exists "carers_public_read" on public.carers;
drop policy if exists "carers_select_own_row" on public.carers;
create policy "carers_public_read"
  on public.carers for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.client_is_assigned_carer(id)
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
