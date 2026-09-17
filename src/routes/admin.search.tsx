import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { AdminCard, AdminScreen, StatusLabel } from "@/components/admin";
import { getAdminPasscode } from "@/lib/admin-session";
import { searchAdminRecords } from "@/lib/admin.functions";
import { BOOKING_STATUS_LABELS, formatDate, type BookingStatus } from "@/lib/database.types";

export const Route = createFileRoute("/admin/search")({
  head: () => ({
    meta: [{ title: "Search | Gracefield admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminSearchPage,
});

type SearchResult = Awaited<ReturnType<typeof searchAdminRecords>>;

function AdminSearchPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    setBusy(true);
    setError(null);
    try {
      const rows = await searchAdminRecords({ data: { passcode: getAdminPasscode(), query: value } });
      setResult(rows);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not search.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminScreen
      title="Find someone"
      instruction="Type a name, place or type of care."
      back={{ label: "Back to home", to: "/admin" }}
    >
      <form className="grid gap-4" onSubmit={search}>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Name or place"
          className="h-16 w-full rounded-xl border border-input bg-background px-4 text-lg"
          aria-label="Search"
        />
        <Button type="submit" size="lg" className="h-16 w-full text-lg" disabled={busy || !query.trim()}>
          {busy ? "Searching…" : "Search"}
        </Button>
      </form>
      {error ? <p role="alert" className="mt-6 text-lg font-bold text-destructive">{error}</p> : null}

      {result ? (
        <div className="mt-8 grid gap-6">
          <AdminCard>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Carers</h2>
            {result.carers.length === 0 ? (
              <p className="mt-3 text-lg text-muted-foreground">No carers matched.</p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {result.carers.map((carer) => (
                  <li key={carer.id}>
                    <Link to="/admin/carers" className="block rounded-xl border border-border p-4 hover:bg-secondary/50">
                      <p className="font-heading text-xl font-extrabold text-primary">{carer.name}</p>
                      {carer.work_email ? (
                        <p className="mt-1 text-base text-muted-foreground">{carer.work_email}</p>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
          <AdminCard>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Bookings</h2>
            {result.bookings.length === 0 ? (
              <p className="mt-3 text-lg text-muted-foreground">No bookings matched.</p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {result.bookings.map((booking) => (
                  <li key={booking.id}>
                    <Link to="/admin/bookings" className="block rounded-xl border border-border p-4 hover:bg-secondary/50">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-heading text-xl font-extrabold text-primary">{booking.client_name}</p>
                        <StatusLabel
                          status={booking.status as BookingStatus}
                          label={BOOKING_STATUS_LABELS[booking.status as BookingStatus]}
                        />
                      </div>
                      <p className="mt-1 text-base text-muted-foreground">
                        {formatDate(booking.start_date)} · {booking.location}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>
        </div>
      ) : null}
    </AdminScreen>
  );
}
