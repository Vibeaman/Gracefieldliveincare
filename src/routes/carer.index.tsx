import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { AdminCard, DetailRow, SavedNote, StatusLabel } from "@/components/admin";
import { PageIntro } from "@/components/gracefield";
import { isCarerUser, signOut, waitForUser } from "@/lib/auth";
import { completeCarerBooking, signCarerDocument } from "@/lib/carer.functions";
import { documentLabel, DOCUMENT_STATUS_LABELS } from "@/lib/carer-docs";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";
import {
  BOOKING_STATUS_LABELS,
  formatDate,
  type ApplicationDocument,
  type CarerBooking,
} from "@/lib/database.types";
import { authErrorMessage, getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/carer/")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.carerHome.title, PAGE_SEO.carerHome.description, {
      path: "/carer",
      noIndex: true,
    }),
  }),
  component: CarerHomePage,
});

function CarerHomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bookings, setBookings] = useState<CarerBooking[]>([]);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    let redirected = false;
    try {
      const user = await waitForUser();
      if (!user) {
        redirected = true;
        await navigate({ to: "/carer/login" });
        return;
      }
      if (!isCarerUser(user)) {
        redirected = true;
        await navigate({ to: "/account" });
        return;
      }

      const supabase = getSupabase();
      setEmail(user.email ?? "");

      const { data: carer, error: carerError } = await supabase
        .from("carers")
        .select("id, name, application_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (carerError) throw carerError;
      if (!carer) {
        setError("We could not find your carer profile. Please contact Gracefield.");
        return;
      }
      setName(carer.name);

      const { data: bookingRows, error: bookingError } = await supabase
        .from("bookings")
        .select("id, care_type, location, start_date, hours, status, clients ( full_name )")
        .eq("assigned_carer_id", carer.id)
        .order("start_date", { ascending: true });
      if (bookingError) throw bookingError;
      setBookings(
        (bookingRows ?? []).map((row) => {
          const clientRel = Array.isArray(row.clients) ? row.clients[0] : row.clients;
          return {
            id: row.id,
            care_type: row.care_type,
            location: row.location,
            start_date: row.start_date,
            hours: row.hours,
            status: row.status,
            client_name: clientRel?.full_name?.trim() || "Family",
          };
        }),
      );

      let documentQuery = supabase
        .from("application_documents")
        .select("id, application_id, carer_id, doc_type, file_name, storage_path, content_type, status, created_at")
        .order("created_at", { ascending: true });
      documentQuery = carer.application_id
        ? documentQuery.or(`carer_id.eq.${carer.id},application_id.eq.${carer.application_id}`)
        : documentQuery.eq("carer_id", carer.id);
      const { data: documentRows, error: documentError } = await documentQuery;
      if (documentError) throw documentError;
      setDocuments((documentRows ?? []) as ApplicationDocument[]);
      setError(null);
    } catch (caught) {
      setError(authErrorMessage(caught, "We could not load your work. Please try again."));
    } finally {
      if (!redirected) setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const completeBooking = async (id: string) => {
    const user = await waitForUser();
    if (!user) return;
    setBusyId(id);
    setError(null);
    setNote(null);
    try {
      await completeCarerBooking({ data: { userId: user.id, bookingId: id } });
      setNote("Marked as complete.");
      await load();
    } catch (caught) {
      setError(authErrorMessage(caught, "We could not mark that as complete."));
    } finally {
      setBusyId(null);
    }
  };

  const openDocument = async (documentId: string) => {
    const user = await waitForUser();
    if (!user) return;
    setBusyId(documentId);
    try {
      const signed = await signCarerDocument({ data: { userId: user.id, documentId } });
      window.open(signed.url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open that document.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <PageIntro eyebrow="Your work" title="Loading…">
        <p>Please wait.</p>
      </PageIntro>
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="Your work"
        title={name ? `Hello ${name.split(" ")[0]}.` : "Your work"}
        actions={
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={async () => {
              await signOut();
              await navigate({ to: "/carer/login" });
            }}
          >
            Sign out
          </Button>
        }
      >
        <p>
          Signed in as {email}. Here are the families assigned to you, and the documents you sent with your
          application.
        </p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-4xl gap-6">
          {error ? (
            <p role="alert" className="text-lg font-bold text-destructive">
              {error}
            </p>
          ) : null}
          {note ? <SavedNote>{note}</SavedNote> : null}

          <AdminCard>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Your families</h2>
            {bookings.length === 0 ? (
              <p className="mt-4 text-lg text-muted-foreground">No families assigned yet.</p>
            ) : (
              <ul className="mt-6 grid gap-4">
                {bookings.map((booking) => (
                  <li key={booking.id} className="rounded-2xl border border-border p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-heading text-xl font-extrabold text-primary">{booking.client_name}</p>
                        <p className="mt-1 text-base text-muted-foreground">
                          {formatDate(booking.start_date)} · {booking.care_type}
                        </p>
                      </div>
                      <StatusLabel
                        status={booking.status}
                        label={BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                      />
                    </div>
                    <div className="mt-4">
                      <DetailRow label="Where" value={booking.location} />
                      <DetailRow label="Hours" value={booking.hours} />
                    </div>
                    {booking.status === "assigned" || booking.status === "active" ? (
                      <Button
                        type="button"
                        size="lg"
                        className="mt-5 h-14 w-full text-base"
                        disabled={busyId === booking.id}
                        onClick={() => void completeBooking(booking.id)}
                      >
                        {busyId === booking.id ? "Saving…" : "Mark as complete"}
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <AdminCard>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Your documents</h2>
            {documents.length === 0 ? (
              <p className="mt-4 text-lg text-muted-foreground">No documents on file yet.</p>
            ) : (
              <ul className="mt-6 grid gap-3">
                {documents.map((document) => (
                  <li
                    key={document.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                  >
                    <div>
                      <p className="font-bold text-primary">{documentLabel(document.doc_type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {document.file_name} · {DOCUMENT_STATUS_LABELS[document.status]}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busyId === document.id}
                      onClick={() => void openDocument(document.id)}
                    >
                      {busyId === document.id ? "Opening…" : "Open"}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </AdminCard>

          <p className="text-base text-muted-foreground">
            Families looking for care should{" "}
            <Link to="/sign-in" className="font-bold text-primary underline decoration-brand-gold underline-offset-4">
              sign in here
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
