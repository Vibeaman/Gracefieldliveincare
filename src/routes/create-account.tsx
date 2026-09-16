import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthOrDivider, GoogleContinueButton } from "@/components/google-continue";
import { HoneypotFields } from "@/components/honeypot-fields";
import { PageIntro } from "@/components/gracefield";
import { ensureClientProfile, signUpWithEmail } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";
import { isLikelySpam } from "@/lib/spam-guard";
import { authErrorMessage } from "@/lib/supabase";

export const Route = createFileRoute("/create-account")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.createAccount.title, PAGE_SEO.createAccount.description, {
      path: "/create-account",
    }),
  }),
  component: CreateAccountPage,
});

function CreateAccountPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (isLikelySpam(form)) {
      setNeedsConfirm(true);
      return;
    }
    const email = String(form.get("signup-email") ?? "");
    const password = String(form.get("signup-password") ?? "");
    setBusy(true);
    setError(null);
    const { data, error: authError } = await signUpWithEmail(email, password);
    if (authError) {
      setError(authErrorMessage(authError, "We could not create that account. Please try again."));
      setBusy(false);
      return;
    }
    if (!data.session) {
      setNeedsConfirm(true);
      setBusy(false);
      return;
    }
    await ensureClientProfile();
    await navigate({ to: "/account" });
  };

  return (
    <>
      <PageIntro eyebrow="Create account" title="Let's set up your account.">
        <p>Two details are all we need to get your care request started.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-xl">
          <div className="surface-card rounded-2xl p-6 sm:p-9">
            {needsConfirm ? (
              <div role="status">
                <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">
                  Check your email.
                </h2>
                <p className="mt-3 text-base text-muted-foreground">
                  We sent a confirmation link. Tap it, then come back here to sign in.
                </p>
                <Button asChild size="lg" className="mt-7 w-full">
                  <Link to="/sign-in">Go to sign in</Link>
                </Button>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Create account</h2>
                <div className="mt-7">
                  <GoogleContinueButton />
                </div>
                <div className="my-6">
                  <AuthOrDivider />
                </div>
                <form className="relative space-y-5" onSubmit={handleSubmit}>
                  <HoneypotFields />
                  <div>
                    <Label htmlFor="signup-email" className="text-base font-bold">Email address</Label>
                    <Input id="signup-email" name="signup-email" type="email" required autoComplete="email" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-base font-bold">Password</Label>
                    <Input id="signup-password" name="signup-password" type="password" required minLength={6} autoComplete="new-password" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
                  </div>
                  {error ? (
                    <p role="alert" className="text-base font-bold text-destructive">{error}</p>
                  ) : null}
                  <Button type="submit" size="lg" className="w-full" disabled={busy}>
                    {busy ? "Creating account…" : "Create account"}
                  </Button>
                </form>
                <p className="mt-6 text-base text-muted-foreground">
                  Already have an account? <Link to="/sign-in" className="font-bold text-primary underline decoration-brand-gold underline-offset-4">Sign in</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
