import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClipboardList, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PersonAvatar } from "@/components/admin";
import { Eyebrow, PageIntro } from "@/components/gracefield";
import { ensureClientProfile, isProfileComplete, saveClientDetails, signOut, waitForUser } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";
import {
  BOOKING_STATUS_LABELS,
  formatDate,
  type BookingWithCarer,
  type Client,
} from "@/lib/database.types";
import { authErrorMessage, getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.account.title, PAGE_SEO.account.description, {
      path: "/account",
      noIndex: true,
    }),
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  const [bookings, setBookings] = useState<BookingWithCarer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const user = await waitForUser();
    if (!user) {
      await navigate({ to: "/sign-in" });
      return;
    }
    await ensureClientProfile();
    const supabase = getSupabase();
    setEmail(user.email ?? "");

    const { data: clientRow, error: clientError } = await supabase
      .from("clients")
      .select("id, full_name, phone, address, created_at")
      .eq("id", user.id)
      .maybeSingle();
    if (clientError) {
      setError(clientError.message);
      setLoading(false);
      return;
    }
    setClient(clientRow);

    const { data: bookingRows, error: bookingError } = await supabase
      .from("bookings")
      .select(
        "id, client_id, care_type, location, start_date, hours, status, assigned_carer_id, created_at, carers ( id, name, photo_url, bio ), reviews ( id, rating, comment )",
      )
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });
    if (bookingError) {
      setError(bookingError.message);
      setLoading(false);
      return;
    }

    setBookings(
      (bookingRows ?? []).map((row) => {
        const carerRel = Array.isArray(row.carers) ? row.carers[0] : row.carers;
        const reviewRel = Array.isArray(row.reviews) ? row.reviews[0] : row.reviews;
        return {
          id: row.id,
          client_id: row.client_id,
          care_type: row.care_type,
          location: row.location,
          start_date: row.start_date,
          hours: row.hours,
          status: row.status,
          assigned_carer_id: row.assigned_carer_id,
          created_at: row.created_at,
          carer: carerRel ?? null,
          review: reviewRel ?? null,
        };
      }),
    );
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return <div className="min-h-[40vh] bg-background" />;
  }

  if (!isProfileComplete(client)) {
    return (
      <DetailsSetup
        email={email}
        client={client}
        onSaved={() => {
          setLoading(true);
          void load();
        }}
      />
    );
  }

  return (
    <>
      <PageIntro eyebrow="Your account" title="Your Gracefield account.">
        <p>This is where your care request and details live.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <article className="surface-card rounded-2xl p-7 sm:p-8">
            <ClipboardList className="h-8 w-8 text-brand-gold" aria-hidden="true" />
            <h2 className="mt-6 font-heading text-2xl font-extrabold text-primary">Care request status</h2>
            {bookings.length === 0 ? (
              <>
                <p className="mt-2 text-base text-muted-foreground">You have not started a care request yet.</p>
                <span className="mt-5 inline-flex rounded-full border border-primary/25 bg-secondary px-4 py-1.5 text-sm font-bold text-primary">No request yet</span>
                <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
                  <Link to="/request-care">Request care</Link>
                </Button>
              </>
            ) : (
              <ul className="mt-5 space-y-5">
                {bookings.map((booking) => (
                  <li key={booking.id} className="border-t border-border pt-5 first:border-t-0 first:pt-0">
                    <p className="font-bold text-primary">{booking.care_type}</p>
                    <p className="mt-1 text-base text-muted-foreground">
                      {booking.location} · from {formatDate(booking.start_date)}
                    </p>
                    <p className="mt-1 text-base text-muted-foreground">{booking.hours}</p>
                    <span className="mt-3 inline-flex rounded-full border border-primary/25 bg-secondary px-4 py-1.5 text-sm font-bold text-primary">
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </span>
                    {booking.status !== "pending" && booking.carer ? (
                      <div className="mt-4 flex gap-4 rounded-2xl border border-border bg-secondary/40 p-4">
                        <PersonAvatar
                          fullName={booking.carer.name}
                          photoUrl={booking.carer.photo_url}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-muted-foreground">Your carer</p>
                          <p className="font-heading text-lg font-extrabold text-primary">
                            {booking.carer.name}
                          </p>
                          {booking.carer.bio ? (
                            <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                              {booking.carer.bio}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                    {booking.status === "completed" ? (
                      booking.review ? (
                        <p className="mt-3 text-base text-muted-foreground">
                          Your review: {booking.review.rating} out of 5
                        </p>
                      ) : (
                        <LeaveReview booking={booking} onSaved={() => void load()} />
                      )
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </article>
          <DetailsCard
            email={email}
            client={client}
            onSaved={() => {
              setLoading(true);
              void load();
            }}
            onSignOut={async () => {
              await signOut();
              await navigate({ to: "/" });
            }}
          />
        </div>
        {error ? (
          <p role="alert" className="mx-auto mt-8 max-w-5xl text-base font-bold text-destructive">{error}</p>
        ) : null}
        <div className="mx-auto mt-12 max-w-5xl">
          <Eyebrow>Next step</Eyebrow>
          <p className="max-w-2xl text-lg text-muted-foreground">Have a question in the meantime? Our team is happy to talk things through.</p>
          <Button asChild size="lg" className="mt-6 w-full sm:w-auto"><Link to="/contact" search={{ about: undefined }}>Talk to our team</Link></Button>
        </div>
      </section>
    </>
  );
}

function DetailsSetup({
  email,
  client,
  onSaved,
}: {
  email: string;
  client: Client | null;
  onSaved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await saveClientDetails({
        full_name: String(form.get("full-name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        address: String(form.get("address") ?? ""),
      });
      onSaved();
    } catch (caught) {
      setError(authErrorMessage(caught, "We could not save those details. Please try again."));
      setBusy(false);
    }
  };

  return (
    <>
      <PageIntro eyebrow="Your account" title="A few details about you.">
        <p>We only need your name and phone number. You can change these later.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-xl">
          <div className="surface-card rounded-2xl p-6 sm:p-9">
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Your details</h2>
            <p className="mt-2 text-base text-muted-foreground">
              Signed in as {email || "your email"}.
            </p>
            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="full-name" className="text-base font-bold">Your name</Label>
                <Input
                  id="full-name"
                  name="full-name"
                  required
                  autoComplete="name"
                  defaultValue={client?.full_name ?? ""}
                  className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-base font-bold">Phone number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  defaultValue={client?.phone ?? ""}
                  className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
                />
              </div>
              <div>
                <Label htmlFor="address" className="text-base font-bold">Address <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  defaultValue={client?.address ?? ""}
                  className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
                />
              </div>
              {error ? <p role="alert" className="text-base font-bold text-destructive">{error}</p> : null}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Saving…" : "Save and continue"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function DetailsCard({
  email,
  client,
  onSaved,
  onSignOut,
}: {
  email: string;
  client: Client | null;
  onSaved: () => void;
  onSignOut: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await saveClientDetails({
        full_name: String(form.get("full-name") ?? ""),
        phone: String(form.get("phone") ?? ""),
        address: String(form.get("address") ?? ""),
      });
      setEditing(false);
      onSaved();
    } catch (caught) {
      setError(authErrorMessage(caught, "We could not save those details."));
      setBusy(false);
    }
  };

  return (
    <article className="surface-card rounded-2xl p-7 sm:p-8">
      <UserRound className="h-8 w-8 text-brand-gold" aria-hidden="true" />
      <h2 className="mt-6 font-heading text-2xl font-extrabold text-primary">Your details</h2>
      {editing ? (
        <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="edit-name" className="text-base font-bold">Your name</Label>
            <Input
              id="edit-name"
              name="full-name"
              required
              autoComplete="name"
              defaultValue={client?.full_name ?? ""}
              className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
            />
          </div>
          <div>
            <Label htmlFor="edit-phone" className="text-base font-bold">Phone number</Label>
            <Input
              id="edit-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              defaultValue={client?.phone ?? ""}
              className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
            />
          </div>
          <div>
            <Label htmlFor="edit-address" className="text-base font-bold">Address <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Input
              id="edit-address"
              name="address"
              autoComplete="street-address"
              defaultValue={client?.address ?? ""}
              className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
            />
          </div>
          <p className="text-base text-muted-foreground">Email: {email}</p>
          {error ? <p role="alert" className="text-base font-bold text-destructive">{error}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={busy}>
              {busy ? "Saving…" : "Save details"}
            </Button>
            <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <dl className="mt-5 space-y-4 text-base">
            {[
              ["Name", client?.full_name || "Not added yet"],
              ["Email address", email || "Not added yet"],
              ["Phone number", client?.phone || "Not added yet"],
              ["Address", client?.address || "Not added yet"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-bold text-primary">{label}</dt>
                <dd className="text-muted-foreground">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button type="button" size="lg" className="w-full sm:w-auto" onClick={() => setEditing(true)}>
              Edit details
            </Button>
            <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => void onSignOut()}>
              Sign out
            </Button>
          </div>
        </>
      )}
    </article>
  );
}

function LeaveReview({
  booking,
  onSaved,
}: {
  booking: BookingWithCarer;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!booking.assigned_carer_id) return;
    const form = new FormData(event.currentTarget);
    const rating = Number(form.get("rating"));
    const comment = String(form.get("comment") ?? "");
    setBusy(true);
    setError(null);
    const { error: insertError } = await getSupabase().from("reviews").insert({
      booking_id: booking.id,
      carer_id: booking.assigned_carer_id,
      rating,
      comment,
    });
    if (insertError) {
      setError(authErrorMessage(insertError, "We could not save that review."));
      setBusy(false);
      return;
    }
    onSaved();
  };

  if (!open) {
    return (
      <Button type="button" size="lg" className="mt-4 w-full sm:w-auto" onClick={() => setOpen(true)}>
        Leave a review
      </Button>
    );
  }

  return (
    <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor={`rating-${booking.id}`} className="text-base font-bold">Rating</Label>
        <select
          id={`rating-${booking.id}`}
          name="rating"
          required
          defaultValue="5"
          className="mt-2 h-13 w-full rounded-xl border border-input bg-background px-4 text-base"
        >
          <option value="5">5 — Excellent</option>
          <option value="4">4 — Good</option>
          <option value="3">3 — Okay</option>
          <option value="2">2 — Not great</option>
          <option value="1">1 — Poor</option>
        </select>
      </div>
      <div>
        <Label htmlFor={`comment-${booking.id}`} className="text-base font-bold">Your comments</Label>
        <Textarea id={`comment-${booking.id}`} name="comment" rows={4} className="mt-2 min-h-28 rounded-xl bg-background px-4 py-3 text-base" />
      </div>
      {error ? <p role="alert" className="text-base font-bold text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Saving…" : "Save review"}
      </Button>
    </form>
  );
}
