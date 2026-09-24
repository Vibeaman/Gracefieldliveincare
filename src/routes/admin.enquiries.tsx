import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { AdminCard, AdminScreen, ConfirmRemoveButton, DetailRow, TapRow } from "@/components/admin";
import { getAdminPasscode } from "@/lib/admin-session";
import { deleteAdminEnquiry, listAdminEnquiries } from "@/lib/admin.functions";
import { ENQUIRY_SUBJECT_LABELS, formatDate, type Enquiry } from "@/lib/database.types";
import { publicErrorMessage } from "@/lib/supabase";

export const Route = createFileRoute("/admin/enquiries")({
  head: () => ({
    meta: [
      { title: "Enquiries | Gracefield admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEnquiriesPage,
});

function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const rows = await listAdminEnquiries({ data: { passcode: getAdminPasscode() } });
      setEnquiries(rows);
      setError(null);
    } catch (caught) {
      setError(publicErrorMessage(caught, "Could not load enquiries."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const open = enquiries.find((enquiry) => enquiry.id === openId) ?? null;

  if (open) {
    return (
      <EnquiryDetail
        enquiry={open}
        onBack={() => setOpenId(null)}
        onDeleted={async () => {
          setOpenId(null);
          await load();
        }}
      />
    );
  }

  return (
    <AdminScreen
      title="Enquiries"
      instruction="Tap a name to read their message."
      back={{ label: "Back to home", to: "/admin" }}
    >
      {error ? <p role="alert" className="mb-6 text-lg font-bold text-destructive">{error}</p> : null}
      {loading ? (
        <p className="text-lg text-muted-foreground">Loading…</p>
      ) : enquiries.length === 0 ? (
        <p className="text-lg text-muted-foreground">No enquiries yet.</p>
      ) : (
        <ul className="grid gap-4">
          {enquiries.map((enquiry) => (
            <li key={enquiry.id}>
              <TapRow
                onClick={() => setOpenId(enquiry.id)}
                ariaLabel={`Read the enquiry from ${enquiry.full_name}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-xl font-extrabold text-primary sm:text-2xl">
                    {enquiry.full_name}
                  </span>
                  <span className="mt-1 block text-base text-muted-foreground sm:text-lg">
                    {ENQUIRY_SUBJECT_LABELS[enquiry.subject]}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-primary">
                    {formatDate(enquiry.created_at.slice(0, 10))}
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

function EnquiryDetail({
  enquiry,
  onBack,
  onDeleted,
}: {
  enquiry: Enquiry;
  onBack: () => void;
  onDeleted: () => Promise<void>;
}) {
  return (
    <AdminScreen
      title={enquiry.full_name}
      instruction="This message came from the website contact form."
      back={{ label: "Back to enquiries", onClick: onBack }}
    >
      <div className="grid gap-6">
        <AdminCard>
          <DetailRow label="Name" value={enquiry.full_name} />
          <DetailRow label="Email" value={enquiry.email} />
          <DetailRow label="Phone" value={enquiry.phone || "Not given"} />
          <DetailRow label="About" value={ENQUIRY_SUBJECT_LABELS[enquiry.subject]} />
          <DetailRow label="Sent" value={formatDate(enquiry.created_at.slice(0, 10))} />
          <DetailRow label="Message" value={enquiry.message} />
        </AdminCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <Button asChild size="lg" className="h-16 w-full text-lg">
            <a href={`mailto:${enquiry.email}`}>Reply by email</a>
          </Button>
          {enquiry.phone ? (
            <Button asChild variant="outline" size="lg" className="h-16 w-full text-lg">
              <a href={`tel:${enquiry.phone}`}>Call</a>
            </Button>
          ) : null}
        </div>
        <ConfirmRemoveButton
          label="Delete this enquiry"
          title="Delete this enquiry?"
          description="This will take the message off your list. You cannot undo this."
          confirmLabel="Yes, delete it"
          onConfirm={async () => {
            await deleteAdminEnquiry({
              data: { passcode: getAdminPasscode(), id: enquiry.id },
            });
            await onDeleted();
          }}
        />
        <Button variant="outline" size="lg" className="h-16 w-full text-lg" onClick={onBack}>
          Back to enquiries
        </Button>
      </div>
    </AdminScreen>
  );
}
