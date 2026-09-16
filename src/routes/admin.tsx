import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Lock, LogOut } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/gracefield";
import { FieldLabel, fieldClasses } from "@/components/admin";
import { getAdminPasscode, isAdminUnlocked, lockAdmin, unlockAdmin } from "@/lib/admin-session";
import { listAdminBookings } from "@/lib/admin.functions";

/**
 * TEMPORARY GATE — NOT REAL SECURITY.
 *
 * The passcode is checked again on the server for every admin write. The screen
 * itself is still only a keep-out sign. Swap for Supabase role-based auth later.
 */
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Gracefield admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setUnlocked(isAdminUnlocked());
    setChecked(true);
  }, []);

  const handleUnlock = (passcode: string) => {
    unlockAdmin(passcode);
    setUnlocked(true);
  };

  const handleLock = () => {
    lockAdmin();
    setUnlocked(false);
  };

  if (!checked) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!unlocked) {
    return <PasscodeScreen onUnlock={handleUnlock} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AdminHeader onLock={handleLock} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border px-5 py-6 sm:px-8">
        <p className="mx-auto max-w-4xl text-base text-muted-foreground">
          Gracefield admin. Only you use this page.
        </p>
      </footer>
    </div>
  );
}

function AdminHeader({ onLock }: { onLock: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const onHome = pathname === "/admin" || pathname === "/admin/";

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex min-h-20 max-w-4xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
        {onHome ? (
          <div>
            <Wordmark />
          </div>
        ) : (
          <Link to="/admin" aria-label="Back to the admin home screen">
            <Wordmark />
          </Link>
        )}
        <Button variant="outline" size="lg" onClick={onLock}>
          <LogOut aria-hidden="true" />
          Lock this page
        </Button>
      </div>
    </header>
  );
}

function PasscodeScreen({ onUnlock }: { onUnlock: (passcode: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(false);
    try {
      await listAdminBookings({ data: { passcode: value.trim() } });
      onUnlock(value.trim());
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="surface-card w-full max-w-md rounded-2xl border border-border p-7 sm:p-9">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary">
          <Lock className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-heading text-3xl font-extrabold text-primary">
          This page is private.
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Type your password below, then tap Continue.
        </p>
        <form className="mt-7" onSubmit={handleSubmit}>
          <FieldLabel htmlFor="admin-passcode">Password</FieldLabel>
          <input
            id="admin-passcode"
            name="admin-passcode"
            type="password"
            autoComplete="current-password"
            required
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className={fieldClasses}
          />
          {error ? (
            <p role="alert" className="mt-3 text-lg font-bold text-destructive">
              That password did not work. Please try again.
            </p>
          ) : null}
          <Button type="submit" size="lg" className="mt-6 h-16 w-full text-lg" disabled={busy}>
            {busy ? "Checking…" : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}