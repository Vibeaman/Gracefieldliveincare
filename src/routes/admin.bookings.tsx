import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AdminCard,
  AdminScreen,
  DetailRow,
  FieldLabel,
  SavedNote,
  StatusLabel,
  TapRow,
  fieldClasses,
} from "@/components/admin";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_ORDER,
  bookings,
  carerName,
  carers,
  type Booking,
  type BookingStatus,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings | Gracefield admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const [openBookingId, setOpenBookingId] = useState<string | null>(null);
  const openBooking = bookings.find((booking) => booking.id === openBookingId) ?? null;

  if (openBooking) {
    return <BookingDetail booking={openBooking} onBack={() => setOpenBookingId(null)} />;
  }

  return (
    <AdminScreen
      title="Bookings"
      instruction="Tap a name to see what they need and choose a carer."
      back={{ label: "Back to home", to: "/admin" }}
    >
      <ul className="grid gap-4">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <TapRow
              onClick={() => setOpenBookingId(booking.id)}
              ariaLabel={`Open the booking for ${booking.client_name}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-xl font-extrabold text-primary sm:text-2xl">
                  {booking.client_name}
                </span>
                <span className="mt-1 block text-base text-muted-foreground sm:text-lg">
                  {booking.care_needed}
                </span>
                <span className="mt-3 block">
                  <StatusLabel
                    status={booking.status}
                    label={BOOKING_STATUS_LABELS[booking.status]}
                  />
                </span>
              </span>
            </TapRow>
          </li>
        ))}
      </ul>
    </AdminScreen>
  );
}

function BookingDetail({ booking, onBack }: { booking: Booking; onBack: () => void }) {
  const [carerId, setCarerId] = useState<string>(booking.assigned_carer_id ?? "");
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [saved, setSaved] = useState(false);

  return (
    <AdminScreen
      title={booking.client_name}
      instruction="Choose a carer for this request, then update the status."
      back={{ label: "Back to bookings", to: "/admin/bookings" }}
    >
      <div className="grid gap-6">
        <AdminCard>
          <DetailRow label="What they need" value={booking.care_needed} />
          <DetailRow label="Where" value={booking.location} />
          <DetailRow label="When" value={booking.start_date} />
          <DetailRow label="Phone number" value={booking.contact_phone} />
          <DetailRow label="Notes" value={booking.notes} />
          <DetailRow label="Carer right now" value={carerName(booking.assigned_carer_id)} />
        </AdminCard>

        <AdminCard>
          <div>
            <FieldLabel htmlFor="booking-carer">Carer for this request</FieldLabel>
            <select
              id="booking-carer"
              name="booking-carer"
              className={fieldClasses}
              value={carerId}
              onChange={(event) => {
                setCarerId(event.target.value);
                setSaved(false);
              }}
            >
              <option value="">Nobody yet</option>
              {carers.map((carer) => (
                <option key={carer.id} value={carer.id}>
                  {carer.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <FieldLabel htmlFor="booking-status">Status</FieldLabel>
            <select
              id="booking-status"
              name="booking-status"
              className={fieldClasses}
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as BookingStatus);
                setSaved(false);
              }}
            >
              {BOOKING_STATUS_ORDER.map((value) => (
                <option key={value} value={value}>
                  {BOOKING_STATUS_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-8 h-16 w-full text-lg"
            onClick={() => setSaved(true)}
          >
            Save
          </Button>

          {saved ? (
            <div className="mt-5">
              <SavedNote>
                Saved on screen only. This will save for real once the database is connected.
              </SavedNote>
            </div>
          ) : null}
        </AdminCard>

        <Button variant="outline" size="lg" className="h-16 w-full text-lg" onClick={onBack}>
          Back to bookings
        </Button>
      </div>
    </AdminScreen>
  );
}
