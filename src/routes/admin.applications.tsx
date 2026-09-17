import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AdminCard,
  AdminScreen,
  ConfirmRemoveButton,
  DetailRow,
  PersonAvatar,
  SavedNote,
  TapRow,
} from "@/components/admin";
import { getAdminPasscode } from "@/lib/admin-session";
import {
  decideAdminApplication,
  deleteAdminApplication,
  listAdminApplications,
  signAdminDocument,
  updateAdminDocumentStatus,
} from "@/lib/admin.functions";
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_ORDER,
  availabilityLabel,
  documentLabel,
  experienceLabel,
} from "@/lib/carer-docs";
import { APPLICATION_STATUS_LABELS, formatDate, type Application, type DocumentStatus } from "@/lib/database.types";

export const Route = createFileRoute("/admin/applications")({
  head: () => ({
    meta: [
      { title: "Applications | Gracefield admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminApplicationsPage,
});

function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"waiting" | "all">("waiting");

  const load = async () => {
    try {
      const rows = await listAdminApplications({ data: { passcode: getAdminPasscode() } });
      setApplications(rows);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const waiting = applications.filter((application) => application.status === "pending");
  const shown = filter === "waiting" ? waiting : applications;
  const open = applications.find((application) => application.id === openId) ?? null;

  if (open) {
    return (
      <ApplicationDetail
        application={open}
        onBack={() => setOpenId(null)}
        onChanged={async () => {
          await load();
        }}
      />
    );
  }

  return (
    <AdminScreen
      title="Applications"
      instruction="People waiting to work with you are at the top. Tap a name to read, check papers, then accept or say not right now."
      back={{ label: "Back to home", to: "/admin" }}
    >
      {error ? <p role="alert" className="mb-6 text-lg font-bold text-destructive">{error}</p> : null}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          type="button"
          size="lg"
          variant={filter === "waiting" ? "default" : "outline"}
          onClick={() => setFilter("waiting")}
        >
          Waiting ({waiting.length})
        </Button>
        <Button
          type="button"
          size="lg"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Everyone ({applications.length})
        </Button>
      </div>
      {loading ? (
        <p className="text-lg text-muted-foreground">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="text-lg text-muted-foreground">
          {filter === "waiting" ? "No one is waiting." : "No applications yet."}
        </p>
      ) : (
        <ul className="grid gap-4">
          {shown.map((application) => (
            <li key={application.id}>
              <TapRow
                onClick={() => setOpenId(application.id)}
                ariaLabel={`Read the application from ${application.full_name}`}
              >
                <PersonAvatar fullName={application.full_name} photoUrl={application.photo_url} />
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-xl font-extrabold text-primary sm:text-2xl">
                    {application.full_name}
                  </span>
                  <span className="mt-1 block text-base text-muted-foreground sm:text-lg">
                    Can work: {availabilityLabel(application.availability)}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-primary">
                    {APPLICATION_STATUS_LABELS[application.status]}
                    {application.documents.length
                      ? ` · ${application.documents.length} document${application.documents.length === 1 ? "" : "s"}`
                      : ""}
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

function ApplicationDetail({
  application,
  onBack,
  onChanged,
}: {
  application: Application;
  onBack: () => void;
  onChanged: () => Promise<void>;
}) {
  const [decision, setDecision] = useState<"accepted" | "declined" | null>(
    application.status === "pending" ? null : application.status,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mailboxNote, setMailboxNote] = useState<string | null>(null);
  const [documents, setDocuments] = useState(application.documents);

  const choose = async (next: "accepted" | "declined") => {
    setBusy(true);
    setError(null);
    try {
      const result = await decideAdminApplication({
        data: { passcode: getAdminPasscode(), id: application.id, decision: next },
      });
      setDecision(next);
      if (next === "accepted" && result.mailboxNote) {
        setMailboxNote(result.mailboxNote);
      }
      await onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that choice.");
    } finally {
      setBusy(false);
    }
  };

  const openDocument = async (documentId: string) => {
    try {
      const signed = await signAdminDocument({
        data: { passcode: getAdminPasscode(), documentId },
      });
      window.open(signed.url, "_blank", "noopener,noreferrer");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open that document.");
    }
  };

  const setDocumentStatus = async (documentId: string, status: DocumentStatus) => {
    try {
      await updateAdminDocumentStatus({
        data: { passcode: getAdminPasscode(), documentId, status },
      });
      setDocuments((current) =>
        current.map((document) => (document.id === documentId ? { ...document, status } : document)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update that document.");
    }
  };

  return (
    <AdminScreen
      title={application.full_name}
      instruction="Read their application and papers, then choose below. Accepting also creates their login."
      back={{ label: "Back to applications", onClick: onBack }}
    >
      <div className="grid gap-6">
        <AdminCard>
          <div className="flex items-center gap-5">
            <PersonAvatar
              fullName={application.full_name}
              photoUrl={application.photo_url}
              size="lg"
            />
            <div className="min-w-0">
              <p className="font-heading text-2xl font-extrabold text-primary">
                {application.full_name}
              </p>
              <p className="mt-1 text-lg text-muted-foreground">
                Applied {formatDate(application.created_at.slice(0, 10))}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <DetailRow label="Name" value={application.full_name} />
            <DetailRow label="Email" value={application.email} />
            <DetailRow label="Phone" value={application.phone} />
            <DetailRow label="Experience" value={experienceLabel(application.years_experience)} />
            <DetailRow label="Availability" value={availabilityLabel(application.availability)} />
            <DetailRow label="Their message" value={application.about} />
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="font-heading text-2xl font-extrabold text-primary">Documents</h2>
          {documents.length === 0 ? (
            <p className="mt-4 text-lg text-muted-foreground">No documents uploaded.</p>
          ) : (
            <ul className="mt-5 grid gap-4">
              {documents.map((document) => (
                <li key={document.id} className="rounded-xl border border-border p-4">
                  <p className="font-heading text-lg font-extrabold text-primary">
                    {documentLabel(document.doc_type)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{document.file_name}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {DOCUMENT_STATUS_ORDER.map((status) => (
                      <Button
                        key={status}
                        type="button"
                        size="sm"
                        variant={document.status === status ? "default" : "outline"}
                        onClick={() => void setDocumentStatus(document.id, status)}
                      >
                        {DOCUMENT_STATUS_LABELS[status]}
                      </Button>
                    ))}
                    <Button type="button" size="sm" variant="outline" onClick={() => void openDocument(document.id)}>
                      Open
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        {decision === null ? (
          <AdminCard className="grid gap-4">
            {error ? <p role="alert" className="text-lg font-bold text-destructive">{error}</p> : null}
            <Button
              type="button"
              size="lg"
              className="h-16 w-full text-lg"
              disabled={busy}
              onClick={() => void choose("accepted")}
            >
              {busy ? "Saving…" : "Accept and create their login"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-16 w-full text-lg"
              disabled={busy}
              onClick={() => void choose("declined")}
            >
              Not right now
            </Button>
          </AdminCard>
        ) : (
          <AdminCard className="grid gap-4">
            <SavedNote>
              {decision === "accepted"
                ? `You accepted ${application.full_name}. Their login has been emailed to them.`
                : `You chose not right now for ${application.full_name}. Nothing has been sent to them.`}
            </SavedNote>
            {mailboxNote ? (
              <p className="text-base text-muted-foreground">
                Work email was not created automatically: {mailboxNote} You can try again from Carers, or make the mailbox by hand.
              </p>
            ) : null}
            {error ? <p role="alert" className="text-lg font-bold text-destructive">{error}</p> : null}
          </AdminCard>
        )}

        <ConfirmRemoveButton
          label="Delete this application"
          title="Delete this application?"
          description={`This will take ${application.full_name} off your applications list. You cannot undo this.`}
          confirmLabel="Yes, delete it"
          onConfirm={async () => {
            await deleteAdminApplication({
              data: { passcode: getAdminPasscode(), id: application.id },
            });
            onBack();
            await onChanged();
          }}
        />

        <Button variant="outline" size="lg" className="h-16 w-full text-lg" onClick={onBack}>
          Back to applications
        </Button>
      </div>
    </AdminScreen>
  );
}
