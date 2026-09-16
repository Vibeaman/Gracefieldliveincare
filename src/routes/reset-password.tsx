import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageIntro } from "@/components/gracefield";
import { getSession, updatePassword } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";
import { authErrorMessage, getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.resetPassword.title, PAGE_SEO.resetPassword.description, {
      path: "/reset-password",
      noIndex: true,
    }),
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setExpired(true);
      return;
    }

    const supabase = getSupabase();
    let cancelled = false;

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
        setExpired(false);
      }
    });

    void getSession().then((session) => {
      if (cancelled) return;
      if (session) {
        setReady(true);
        return;
      }
      window.setTimeout(() => {
        if (!cancelled) {
          void getSession().then((later) => {
            if (cancelled) return;
            if (later) setReady(true);
            else setExpired(true);
          });
        }
      }, 2500);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("new-password") ?? "");
    const confirm = String(form.get("confirm-password") ?? "");
    if (password !== confirm) {
      setError("Those passwords did not match. Please try again.");
      return;
    }
    if (password.length < 6) {
      setError("Please choose a password with at least 6 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: updateError } = await updatePassword(password);
    if (updateError) {
      setError(authErrorMessage(updateError, "We could not save that password. Please try again."));
      setBusy(false);
      return;
    }
    await navigate({ to: "/account" });
  };

  return (
    <>
      <PageIntro eyebrow="New password" title="Choose a new password.">
        <p>Pick something you will remember. You will be signed in afterwards.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-xl">
          <div className="surface-card rounded-2xl p-6 sm:p-9">
            {expired ? (
              <div role="status">
                <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">
                  This link has expired.
                </h2>
                <p className="mt-3 text-base text-muted-foreground">
                  Ask for a new reset email and tap the latest link. Older links stop working once they have been used.
                </p>
                <Button asChild size="lg" className="mt-7 w-full">
                  <Link to="/forgot-password">Send a new link</Link>
                </Button>
              </div>
            ) : !ready ? (
              <p className="text-base text-muted-foreground">Opening your reset link…</p>
            ) : (
              <>
                <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">New password</h2>
                <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="new-password" className="text-base font-bold">New password</Label>
                    <Input
                      id="new-password"
                      name="new-password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password" className="text-base font-bold">Confirm password</Label>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
                    />
                  </div>
                  {error ? (
                    <p role="alert" className="text-base font-bold text-destructive">{error}</p>
                  ) : null}
                  <Button type="submit" size="lg" className="w-full" disabled={busy}>
                    {busy ? "Saving…" : "Save password"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
