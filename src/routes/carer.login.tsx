import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HoneypotFields } from "@/components/honeypot-fields";
import { PageIntro } from "@/components/gracefield";
import { isCarerUser, signInWithEmail } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";
import { isLikelySpam } from "@/lib/spam-guard";
import { authErrorMessage, getSupabase } from "@/lib/supabase";

export const Route = createFileRoute("/carer/login")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.carerLogin.title, PAGE_SEO.carerLogin.description, {
      path: "/carer/login",
      noIndex: true,
    }),
  }),
  component: CarerLoginPage,
});

function CarerLoginPage() {
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
    const email = String(form.get("carer-email") ?? "");
    const password = String(form.get("carer-password") ?? "");
    setBusy(true);
    setError(null);
    const { error: authError } = await signInWithEmail(email, password);
    if (authError) {
      setError(authErrorMessage(authError, "That email or password did not work. Please try again."));
      setBusy(false);
      return;
    }
    const {
      data: { user },
    } = await getSupabase().auth.getUser();
    if (!isCarerUser(user)) {
      await getSupabase().auth.signOut();
      setError("This page is for carers. Families sign in from the main Sign in page.");
      setBusy(false);
      return;
    }
    await navigate({ to: "/carer" });
  };

  return (
    <>
      <PageIntro eyebrow="For carers" title="Sign in to your work.">
        <p>Use your Gracefield work email and the password we sent when we accepted you.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-xl">
          <div className="surface-card rounded-2xl p-6 sm:p-9">
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Carer sign in</h2>
            <form className="relative mt-7 space-y-5" onSubmit={handleSubmit}>
              <HoneypotFields />
              <div>
                <Label htmlFor="carer-email" className="text-base font-bold">
                  Work email
                </Label>
                <Input
                  id="carer-email"
                  name="carer-email"
                  type="email"
                  required
                  autoComplete="username"
                  className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
                />
              </div>
              <div>
                <Label htmlFor="carer-password" className="text-base font-bold">
                  Password
                </Label>
                <Input
                  id="carer-password"
                  name="carer-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="mt-2 h-13 rounded-xl bg-background px-4 text-base"
                />
              </div>
              {error ? (
                <p role="alert" className="text-base font-bold text-destructive">
                  {error}
                </p>
              ) : null}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Signing in…" : "Sign in"}
              </Button>
            </form>
            <p className="mt-6 text-base text-muted-foreground">
              Want to work with us?{" "}
              <Link
                to="/careers"
                className="font-bold text-primary underline decoration-brand-gold underline-offset-4"
              >
                Apply first
              </Link>
              . We send a login only after we accept you.
            </p>
            <p className="mt-3 text-base text-muted-foreground">
              Looking for care for a loved one?{" "}
              <Link
                to="/sign-in"
                className="font-bold text-primary underline decoration-brand-gold underline-offset-4"
              >
                Family sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
