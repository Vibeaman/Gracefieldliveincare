import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminCard, AdminScreen, DetailRow, TapRow } from "@/components/admin";
import { getAdminPasscode } from "@/lib/admin-session";
import { listAdminClients } from "@/lib/admin.functions";
import { formatDate, type AdminClient } from "@/lib/database.types";

export const Route = createFileRoute("/admin/families")({
  head: () => ({
    meta: [{ title: "Families | Gracefield admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminFamiliesPage,
});

function AdminFamiliesPage() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await listAdminClients({ data: { passcode: getAdminPasscode() } });
        setClients(rows);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not load families.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const open = clients.find((client) => client.id === openId) ?? null;

  if (open) {
    return (
      <AdminScreen
        title={open.full_name || "Family"}
        instruction="This is a family account. You can look, but you cannot change it here."
        back={{ label: "Back to families", onClick: () => setOpenId(null) }}
      >
        <AdminCard>
          <DetailRow label="Name" value={open.full_name || "Not given yet"} />
          <DetailRow label="Email" value={open.email || "Not given"} />
          <DetailRow label="Phone" value={open.phone || "Not given"} />
          <DetailRow label="Signed up" value={formatDate(open.created_at.slice(0, 10))} />
          <DetailRow label="Asked for care" value={open.has_booking ? "Yes" : "Not yet"} />
        </AdminCard>
      </AdminScreen>
    );
  }

  return (
    <AdminScreen
      title="Families"
      instruction="Everyone who has signed up to ask for care. You can look, but you cannot change details here."
      back={{ label: "Back to home", to: "/admin" }}
    >
      {error ? <p role="alert" className="mb-6 text-lg font-bold text-destructive">{error}</p> : null}
      {loading ? (
        <p className="text-lg text-muted-foreground">Loading…</p>
      ) : clients.length === 0 ? (
        <p className="text-lg text-muted-foreground">No family accounts yet.</p>
      ) : (
        <ul className="grid gap-4">
          {clients.map((client) => (
            <li key={client.id}>
              <TapRow
                onClick={() => setOpenId(client.id)}
                ariaLabel={`See ${client.full_name || client.email}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-heading text-xl font-extrabold text-primary sm:text-2xl">
                    {client.full_name || "Name not given yet"}
                  </span>
                  <span className="mt-1 block text-base text-muted-foreground sm:text-lg">
                    {client.email || "No email"} · {client.has_booking ? "Has asked for care" : "No booking yet"}
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
