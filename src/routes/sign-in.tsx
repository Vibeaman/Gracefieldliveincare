import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthOrDivider, GoogleContinueButton } from "@/components/google-continue";
import { HoneypotFields } from "@/components/honeypot-fields";
import { PageIntro } from "@/components/gracefield";
import { ensureClientProfile, signInWithEmail } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";
import { isLikelySpam } from "@/lib/spam-guard";
import { authErrorMessage } from "@/lib/supabase";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.signIn.title, PAGE_SEO.signIn.description, { path: "/sign-in" }),
  }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (isLikelySpam(form)) {
      setError("That email or password did not work. Please try again.");
      return;
    }
    const email = String(form.get("signin-email") ?? "");
    const password = String(form.get("signin-password") ?? "");
    setBusy(true);
    setError(null);
    const { error: authError } = await signInWithEmail(email, password);
    if (authError) {
      setError(authErrorMessage(authError, "That email or password did not work. Please try again."));
      setBusy(false);
      return;
    }
    await ensureClientProfile();
    await navigate({ to: "/account" });
  };

  return (
    <>
      <PageIntro eyebrow="Sign in" title="Welcome back.">
        <p>Sign in to pick up where you left off with your care request.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-xl">
          <div className="surface-card rounded-2xl p-6 sm:p-9">
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Sign in</h2>
            <div className="mt-7">
              <GoogleContinueButton />
            </div>
            <div className="my-6">
              <AuthOrDivider />
            </div>
            <form className="relative space-y-5" onSubmit={handleSubmit}>
              <HoneypotFields />
              <div>
                <Label htmlFor="signin-email" className="text-base font-bold">Email address</Label>
                <Input id="signin-email" name="signin-email" type="email" required autoComplete="email" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
              </div>
              <div>
                <Label htmlFor="signin-password" className="text-base font-bold">Password</Label>
                <Input id="signin-password" name="signin-password" type="password" required autoComplete="current-password" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
              </div>
              {error ? (
                <p role="alert" className="text-base font-bold text-destructive">{error}</p>
              ) : null}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="mt-6 text-base text-muted-foreground">
              New to Gracefield? <Link to="/create-account" className="font-bold text-primary underline decoration-brand-gold underline-offset-4">Create an account</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
