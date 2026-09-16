import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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
import { getAdminPasscode } from "@/lib/admin-session";
import { listAdminBookings, listAdminCarers, updateAdminBooking } from "@/lib/admin.functions";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_ORDER,
  formatDate,
  type AdminBooking,
  type BookingStatus,
  type Carer,
} from "@/lib/database.types";

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
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [carers, setCarers] = useState<Carer[]>([]);
  const [openBookingId, setOpenBookingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const passcode = getAdminPasscode();
    try {
      const [bookingRows, carerRows] = await Promise.all([
        listAdminBookings({ data: { passcode } }),
        listAdminCarers({ data: { passcode } }),
      ]);
      setBookings(bookingRows);
      setCarers(carerRows);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openBooking = bookings.find((booking) => booking.id === openBookingId) ?? null;

  if (loading) {
    return (
      <AdminScreen title="Bookings" instruction="Loading…" back={{ label: "Back to home", to: "/admin" }}>
        <p className="text-lg text-muted-foreground">Please wait.</p>
      </AdminScreen>
    );
  }

  if (openBooking) {
    return (
      <BookingDetail
        booking={openBooking}
        carers={carers}
        onBack={() => setOpenBookingId(null)}
        onSaved={async () => {
          await load();
        }}
      />
    );
  }

  return (
    <AdminScreen
      title="Bookings"
      instruction="Tap a name to see what they need and choose a carer."
      back={{ label: "Back to home", to: "/admin" }}
    >
      {error ? <p role="alert" className="mb-6 text-lg font-bold text-destructive">{error}</p> : null}
      {bookings.length === 0 ? (
        <p className="text-lg text-muted-foreground">No care requests yet.</p>
      ) : (
        <ul className="grid gap-4">
          {bookings.map((booking) => (
            <li key={booking.id}>
              <TapRow
                onClick={() => setOpenBookingId(booking.id)}
                ariaLabel={`Open the booking for ${booking.client?.full_name ?? "this client"}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-xl font-extrabold text-primary sm:text-2xl">
                    {booking.client?.full_name || "No name yet"}
                  </span>
                  <span className="mt-1 block text-base text-muted-foreground sm:text-lg">
                    {booking.care_type}
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
      )}
    </AdminScreen>
  );
}

function BookingDetail({
  booking,
  carers,
  onBack,
  onSaved,
}: {
  booking: AdminBooking;
  carers: Carer[];
  onBack: () => void;
  onSaved: () => Promise<void>;
}) {
  const [carerId, setCarerId] = useState<string>(booking.assigned_carer_id ?? "");
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    try {
      await updateAdminBooking({
        data: {
          passcode: getAdminPasscode(),
          id: booking.id,
          status,
          assigned_carer_id: carerId || null,
        },
      });
      setSaved(true);
      await onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminScreen
      title={booking.client?.full_name || "Care request"}
      instruction="Choose a carer for this request, then update the status."
      back={{ label: "Back to bookings", onClick: onBack }}
    >
      <div className="grid gap-6">
        <AdminCard>
          <DetailRow label="What they need" value={booking.care_type} />
          <DetailRow label="Where" value={booking.location} />
          <DetailRow label="When" value={formatDate(booking.start_date)} />
          <DetailRow label="Hours" value={booking.hours} />
          <DetailRow label="Phone number" value={booking.client?.phone || "Not added yet"} />
          <DetailRow label="Carer right now" value={booking.carer?.name || "Nobody yet"} />
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
                  {carer.name}
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

          {error ? (
            <p role="alert" className="mt-5 text-lg font-bold text-destructive">{error}</p>
          ) : null}

          <Button
            type="button"
            size="lg"
            className="mt-8 h-16 w-full text-lg"
            onClick={() => void handleSave()}
            disabled={busy}
          >
            {busy ? "Saving…" : "Save"}
          </Button>

          {saved ? (
            <div className="mt-5">
              <SavedNote>Saved.</SavedNote>
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
