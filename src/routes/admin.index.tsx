import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, FileText, Home, Mail, Search, Users } from "lucide-react";

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
          to="/admin/applications"
          title="Applications"
          description="People waiting to work with you. Accepting creates their login."
          icon={FileText}
        />
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
          to="/admin/families"
          title="Families"
          description="See who has signed up to ask for care."
          icon={Home}
        />
        <BigActionCard
          to="/admin/search"
          title="Find someone"
          description="Search carers and bookings by name."
          icon={Search}
        />
        <BigActionCard
          to="/admin/enquiries"
          title="Enquiries"
          description="Read messages from the contact form."
          icon={Mail}
        />
      </div>
    </AdminScreen>
  );
}
