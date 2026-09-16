-- Run this once if leaving a review from the account page fails.
-- It restates the insert policy using the new row's carer_id.

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
        and b.assigned_carer_id is not null
        and b.assigned_carer_id = carer_id
    )
  );
