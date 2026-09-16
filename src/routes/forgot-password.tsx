import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoneypotFields } from "@/components/honeypot-fields";
import { PageIntro } from "@/components/gracefield";
import { requestPasswordReset } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";
import { isLikelySpam } from "@/lib/spam-guard";
import { authErrorMessage } from "@/lib/supabase";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.forgotPassword.title, PAGE_SEO.forgotPassword.description, {
      path: "/forgot-password",
      noIndex: true,
    }),
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (isLikelySpam(form)) {
      setSent(true);
      return;
    }
    const email = String(form.get("reset-email") ?? "");
    setBusy(true);
    setError(null);
    const { error: resetError } = await requestPasswordReset(email);
    if (resetError) {
      setError(authErrorMessage(resetError, "We could not send that email. Please try again."));
      setBusy(false);
      return;
    }
    setSent(true);
  };

  return (
    <>
      <PageIntro eyebrow="Forgot password" title="We'll send you a reset link.">
        <p>Enter the email you use to sign in. If we have an account for it, you will get a message with a link to choose a new password.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-xl">
          <div className="surface-card rounded-2xl p-6 sm:p-9">
            {sent ? (
              <div role="status">
                <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">
                  Check your email.
                </h2>
                <p className="mt-3 text-base text-muted-foreground">
                  If that email has a Gracefield account, a reset link is on its way. It can take a minute, and it is worth checking spam.
                </p>
                <Button asChild size="lg" className="mt-7 w-full">
                  <Link to="/sign-in">Back to sign in</Link>
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Reset password</h2>
                <form className="relative mt-7 space-y-5" onSubmit={handleSubmit}>
                  <HoneypotFields />
                  <div>
                    <Label htmlFor="reset-email" className="text-base font-bold">Email address</Label>
                    <Input
                      id="reset-email"
                      name="reset-email"
                      type="email"
                      required
                      autoComplete="email"
                      className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
                    />
                  </div>
                  {error ? (
                    <p role="alert" className="text-base font-bold text-destructive">{error}</p>
                  ) : null}
                  <Button type="submit" size="lg" className="w-full" disabled={busy}>
                    {busy ? "Sending…" : "Send reset link"}
                  </Button>
                </form>
                <p className="mt-6 text-base text-muted-foreground">
                  Remembered it?{" "}
                  <Link to="/sign-in" className="font-bold text-primary underline decoration-brand-gold underline-offset-4">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
