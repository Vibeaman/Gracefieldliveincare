import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { AdminCard, AdminScreen, ConfirmRemoveButton, DetailRow, SavedNote, TapRow } from "@/components/admin";
import { getAdminPasscode } from "@/lib/admin-session";
import {
  APPLICATION_STATUS_LABELS,
  formatDate,
  type MailboxStatus,
  type TeamApplication,
} from "@/lib/database.types";
import { publicErrorMessage } from "@/lib/supabase";
import { decideAdminTeamApplication, deleteAdminTeamApplication, listAdminTeamApplications } from "@/lib/team.functions";

export const Route = createFileRoute("/admin/team")({
  head: () => ({
    meta: [
      { title: "Team | Gracefield admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminTeamPage,
});

function mailboxLabel(status: MailboxStatus, workEmail: string | null): string {
  if (status === "created" && workEmail) return workEmail;
  if (status === "skipped" || status === "failed") return "Mailbox was not created";
  return "No mailbox yet";
}

function AdminTeamPage() {
  const [applications, setApplications] = useState<TeamApplication[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const rows = await listAdminTeamApplications({ data: { passcode: getAdminPasscode() } });
      setApplications(rows);
      setError(null);
    } catch (caught) {
      setError(publicErrorMessage(caught, "Could not load team applications."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const waiting = applications.filter((row) => row.status === "pending");
  const decided = applications.filter((row) => row.status !== "pending");
  const open = applications.find((row) => row.id === openId) ?? null;

  if (open) {
    return <TeamDetail application={open} onBack={() => setOpenId(null)} onChanged={load} />;
  }

  return (
    <AdminScreen
      title="Team"
      instruction="People waiting to join the office are at the top. Tap a name to read, then accept or say not right now."
      back={{ label: "Back to home", to: "/admin" }}
    >
      {error ? <p role="alert" className="mb-6 text-lg font-bold text-destructive">{error}</p> : null}
      {loading ? (
        <p className="text-lg text-muted-foreground">Loading\u2026</p>
      ) : applications.length === 0 ? (
        <p className="text-lg text-muted-foreground">No office applications yet.</p>
      ) : (
        <div className="grid gap-8">
          <ApplicationList title="Waiting" rows={waiting} empty="No one is waiting." onOpen={setOpenId} />
          <ApplicationList title="Already decided" rows={decided} empty="None yet." onOpen={setOpenId} />
        </div>
      )}
    </AdminScreen>
  );
}

function ApplicationList({ title, rows, empty, onOpen }: { title: string; rows: TeamApplication[]; empty: string; onOpen: (id: string) => void }) {
  return (
    <section>
      <h2 className="font-heading text-2xl font-extrabold text-primary">{title}</h2>
      {rows.length === 0 ? <p className="mt-3 text-lg text-muted-foreground">{empty}</p> : (
        <ul className="mt-4 grid gap-4">
          {rows.map((application) => (
            <li key={application.id}>
              <TapRow onClick={() => onOpen(application.id)} ariaLabel={`Read the application from ${application.full_name}`}>
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-xl font-extrabold text-primary sm:text-2xl">{application.full_name}</span>
                  <span className="mt-1 block text-base text-muted-foreground sm:text-lg">{application.job}</span>
                  <span className="mt-1 block text-sm font-bold text-primary">
                    {APPLICATION_STATUS_LABELS[application.status]} · {formatDate(application.created_at.slice(0, 10))}
                  </span>
                </span>
              </TapRow>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TeamDetail({ application, onBack, onChanged }: { application: TeamApplication; onBack: () => void; onChanged: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [status, setStatus] = useState(application.status);
  const [mailboxStatus, setMailboxStatus] = useState(application.mailbox_status);
  const [workEmail, setWorkEmail] = useState(application.work_email);

  const choose = async (next: "accepted" | "declined") => {
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const result = await decideAdminTeamApplication({
        data: { passcode: getAdminPasscode(), id: application.id, decision: next },
      });
      setStatus(next);
      setMailboxStatus(result.mailboxStatus);
      setWorkEmail(result.workEmail);
      if (result.mailboxNote) setNote(result.mailboxNote);
      await onChanged();
    } catch (caught) {
      setError(publicErrorMessage(caught, "Could not save that choice."));
    } finally {
      setBusy(false);
    }
  };

  const mailboxMissing = status === "accepted" && mailboxStatus !== "created";

  return (
    <AdminScreen
      title={application.full_name}
      instruction="Read this, then accept or say not right now. Accepting does not give them a key to this page."
      back={{ label: "Back to team", onClick: onBack }}
    >
      <div className="grid gap-6">
        <AdminCard>
          <DetailRow label="Name" value={application.full_name} />
          <DetailRow label="Personal email" value={application.email} />
          <DetailRow label="Phone" value={application.phone || "Not given"} />
          <DetailRow label="Job" value={application.job} />
          <DetailRow label="About" value={application.about} />
          <DetailRow label="Sent" value={formatDate(application.created_at.slice(0, 10))} />
          <DetailRow label="Decision" value={APPLICATION_STATUS_LABELS[status]} />
          <DetailRow label="Work mailbox" value={mailboxLabel(mailboxStatus, workEmail)} />
        </AdminCard>
        {status === "pending" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Button size="lg" className="h-16 text-lg" disabled={busy} onClick={() => void choose("accepted")}>{busy ? "Saving\u2026" : "Accept"}</Button>
            <Button variant="outline" size="lg" className="h-16 text-lg" disabled={busy} onClick={() => void choose("declined")}>Not right now</Button>
          </div>
        ) : null}
        {mailboxMissing ? (
          <AdminCard>
            <p className="text-lg text-foreground">{application.full_name} is recorded, but the work mailbox was not created.</p>
            {note ? <p className="mt-2 text-base text-muted-foreground">{note}</p> : null}
            <Button size="lg" className="mt-5 h-16 w-full text-lg" disabled={busy} onClick={() => void choose("accepted")}>{busy ? "Trying\u2026" : "Try the mailbox again"}</Button>
          </AdminCard>
        ) : null}
        {status === "declined" ? <SavedNote>You chose not right now. A short email was sent. No mailbox was created. They can apply again later.</SavedNote> : null}
        {mailboxStatus === "created" && workEmail ? <SavedNote>Accepted. Their work mailbox is {workEmail}. The steps were sent to their personal email.</SavedNote> : null}
        {error ? <p role="alert" className="text-lg font-bold text-destructive">{error}</p> : null}
        <ConfirmRemoveButton
          label="Remove this person"
          title="Remove this person?"
          description={`This takes ${application.full_name} off the team list. If they have a work mailbox, that is deleted too. You cannot undo this.`}
          confirmLabel="Yes, remove them"
          onConfirm={async () => {
            await deleteAdminTeamApplication({
              data: { passcode: getAdminPasscode(), id: application.id },
            });
            onBack();
            await onChanged();
          }}
        />
        <Button variant="outline" size="lg" className="h-16 w-full text-lg" onClick={onBack}>Back to team</Button>
      </div>
    </AdminScreen>
  );
}
