import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AdminCard,
  AdminScreen,
  DetailRow,
  PersonAvatar,
  SavedNote,
  TapRow,
} from "@/components/admin";
import { applicationToCarerDraft, applications, type Application } from "@/lib/admin-data";

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
  const [openId, setOpenId] = useState<string | null>(null);
  const open = applications.find((application) => application.id === openId) ?? null;

  if (open) {
    return <ApplicationDetail application={open} onBack={() => setOpenId(null)} />;
  }

  return (
    <AdminScreen
      title="Applications"
      instruction="Tap a name to read their application."
      back={{ label: "Back to home", to: "/admin" }}
    >
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
              </span>
            </TapRow>
          </li>
        ))}
      </ul>
    </AdminScreen>
  );
}

function ApplicationDetail({
  application,
  onBack,
}: {
  application: Application;
  onBack: () => void;
}) {
  const [decision, setDecision] = useState<"accepted" | "not_now" | null>(null);

  // Same field names as the carer form, so an accepted applicant can be saved
  // straight into the carers table. See applicationToCarerDraft in admin-data.
  const carerDraft = applicationToCarerDraft(application);

  return (
    <AdminScreen
      title={application.full_name}
      instruction="Read their application, then choose below."
      back={{ label: "Back to applications", to: "/admin/applications" }}
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
              <p className="mt-1 text-lg text-muted-foreground">Applied {application.applied_on}</p>
            </div>
          </div>

          <div className="mt-6">
            <DetailRow label="Name" value={carerDraft.full_name} />
            <DetailRow label="Experience" value={application.years_experience} />
            <DetailRow label="Availability" value={application.availability} />
            <DetailRow label="Specialty" value={carerDraft.specialty} />
            <DetailRow label="Short bio" value={carerDraft.short_bio} />
            <DetailRow label="Their message" value={application.message} />
          </div>
        </AdminCard>

        {decision === null ? (
          <AdminCard className="grid gap-4">
            <Button
              type="button"
              size="lg"
              className="h-16 w-full text-lg"
              onClick={() => setDecision("accepted")}
            >
              Accept
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-16 w-full text-lg"
              onClick={() => setDecision("not_now")}
            >
              Not right now
            </Button>
          </AdminCard>
        ) : (
          <AdminCard className="grid gap-4">
            <SavedNote>
              {decision === "accepted"
                ? `You accepted ${application.full_name}. Once the database is connected, this will add them to your carers.`
                : `You chose not right now for ${application.full_name}. Nothing has been sent to them yet.`}
            </SavedNote>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-16 w-full text-lg"
              onClick={() => setDecision(null)}
            >
              Change my answer
            </Button>
          </AdminCard>
        )}

        <Button variant="outline" size="lg" className="h-16 w-full text-lg" onClick={onBack}>
          Back to applications
        </Button>
      </div>
    </AdminScreen>
  );
}
