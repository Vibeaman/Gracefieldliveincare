import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Lock, LogOut } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/gracefield";
import { FieldLabel, fieldClasses } from "@/components/admin";

/**
 * TEMPORARY GATE — NOT REAL SECURITY.
 *
 * This only hides the screens behind a shared passcode held in the browser. The
 * page and this passcode are both shipped to the visitor, so treat it as a
 * "keep out" sign, not a lock. Replace it with Supabase role-based auth before
 * any real client information goes through these screens.
 *
 * Set VITE_ADMIN_PASSCODE in the environment (Vercel project settings) to change
 * the passcode without touching the code.
 */
const ADMIN_PASSCODE = import.meta.env["VITE_ADMIN_PASSCODE"] ?? "gracefield";
const UNLOCK_KEY = "gracefield-admin-unlocked";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Gracefield admin" },
      // Keep the admin screens out of search results.
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  // Starts locked on the server and on first paint, then checks the browser.
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setUnlocked(window.sessionStorage.getItem(UNLOCK_KEY) === "yes");
    setChecked(true);
  }, []);

  const handleUnlock = () => {
    window.sessionStorage.setItem(UNLOCK_KEY, "yes");
    setUnlocked(true);
  };

  const handleLock = () => {
    window.sessionStorage.removeItem(UNLOCK_KEY);
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

function PasscodeScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value.trim() === ADMIN_PASSCODE) {
      setError(false);
      onUnlock();
      return;
    }
    setError(true);
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
          <Button type="submit" size="lg" className="mt-6 h-16 w-full text-lg">
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
