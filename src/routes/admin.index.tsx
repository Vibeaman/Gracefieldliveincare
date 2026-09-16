import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, FileText, Users } from "lucide-react";

import { AdminScreen, BigActionCard } from "@/components/admin";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Gracefield admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminHomePage,
});

function AdminHomePage() {
  return (
    <AdminScreen title="Welcome back." instruction="Tap one of the boxes below to get started.">
      <div className="grid gap-5 sm:gap-6">
        <BigActionCard
          to="/admin/bookings"
          title="Bookings"
          description="See who has asked for care and choose a carer."
          icon={CalendarCheck}
        />
        <BigActionCard
          to="/admin/carers"
          title="Carers"
          description="Add a new carer or change someone's details."
          icon={Users}
        />
        <BigActionCard
          to="/admin/applications"
          title="Applications"
          description="Read people who want to work with you."
          icon={FileText}
        />
      </div>
    </AdminScreen>
  );
}
