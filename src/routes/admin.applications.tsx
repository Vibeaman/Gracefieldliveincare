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
} from "@/lib/admin.functions";
import { APPLICATION_STATUS_LABELS, formatDate, type Application } from "@/lib/database.types";

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
      instruction="Tap a name to read their application."
      back={{ label: "Back to home", to: "/admin" }}
    >
      {error ? <p role="alert" className="mb-6 text-lg font-bold text-destructive">{error}</p> : null}
      {loading ? (
        <p className="text-lg text-muted-foreground">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="text-lg text-muted-foreground">No applications yet.</p>
      ) : (
        <ul className="grid gap-4">
          {applications.map((application) => (
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
                    Can work: {application.availability}
                  </span>
                  <span className="mt-1 block text-sm font-bold text-primary">
                    {APPLICATION_STATUS_LABELS[application.status]}
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

  const choose = async (next: "accepted" | "declined") => {
    setBusy(true);
    setError(null);
    try {
      await decideAdminApplication({
        data: { passcode: getAdminPasscode(), id: application.id, decision: next },
      });
      setDecision(next);
      await onChanged();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save that choice.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminScreen
      title={application.full_name}
      instruction="Read their application, then choose below."
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
            <DetailRow label="Experience" value={application.years_experience} />
            <DetailRow label="Availability" value={application.availability} />
            <DetailRow label="Their message" value={application.about} />
          </div>
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
              Accept
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
                ? `You accepted ${application.full_name}. They have been added to your carers.`
                : `You chose not right now for ${application.full_name}. Nothing has been sent to them.`}
            </SavedNote>
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
