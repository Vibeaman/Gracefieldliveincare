import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { AdminCard, AdminScreen, ConfirmRemoveButton, DetailRow, FieldLabel, TapRow, fieldClasses } from "@/components/admin";
import { getAdminPasscode } from "@/lib/admin-session";
import { deleteAdminClient, listAdminClients } from "@/lib/admin.functions";
import { formatDate, type AdminClient } from "@/lib/database.types";
import { publicErrorMessage } from "@/lib/supabase";

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
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [removeEmail, setRemoveEmail] = useState("");
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const rows = await listAdminClients({ data: { passcode: getAdminPasscode() } });
        setClients(rows);
      } catch (caught) {
        setError(publicErrorMessage(caught, "Could not load families."));
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
        <ConfirmRemoveButton
          label="Remove this family account"
          title="Remove this family account?"
          description="They will need to create a new account to sign in again. This cannot be undone."
          confirmLabel="Yes, remove it"
          onConfirm={async () => {
            await deleteAdminClient({
              data: { passcode: getAdminPasscode(), id: open.id, email: open.email || undefined },
            });
            setClients((current) => current.filter((client) => client.id !== open.id));
            setOpenId(null);
          }}
        />
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
      {note ? <p className="mb-6 text-lg font-bold text-primary">{note}</p> : null}
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
      <form
        className="mt-10 space-y-4"
        onSubmit={async (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const email = removeEmail.trim().toLowerCase();
          if (!email) return;
          setRemoving(true);
          setError(null);
          setNote(null);
          try {
            await deleteAdminClient({
              data: { passcode: getAdminPasscode(), email },
            });
            setClients((current) =>
              current.filter((client) => (client.email ?? "").trim().toLowerCase() !== email),
            );
            setRemoveEmail("");
            setNote(`${email} has been removed. They can create a new account.`);
          } catch (caught) {
            setError(publicErrorMessage(caught, "Could not remove that account."));
          } finally {
            setRemoving(false);
          }
        }}
      >
        <FieldLabel htmlFor="remove-family-email">Remove an account by email</FieldLabel>
        <input
          id="remove-family-email"
          type="email"
          required
          value={removeEmail}
          onChange={(event) => setRemoveEmail(event.target.value)}
          className={fieldClasses}
          placeholder="name@email.com"
        />
        <Button type="submit" size="lg" className="h-16 w-full text-lg" disabled={removing}>
          {removing ? "Removing…" : "Remove account"}
        </Button>
      </form>
    </AdminScreen>
  );
}
