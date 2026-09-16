import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageIntro } from "@/components/gracefield";

export const Route = createFileRoute("/sign-in")({
  head: () => ({ meta: [
    { title: "Sign In | Gracefield Living in Care" },
    { name: "description", content: "Sign in to your Gracefield account to continue your live-in care request." },
    { property: "og:title", content: "Sign In | Gracefield Living in Care" },
    { property: "og:description", content: "Sign in to your Gracefield account to continue your live-in care request." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({ to: "/account" });
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
            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="signin-email" className="text-base font-bold">Email address</Label>
                <Input id="signin-email" name="signin-email" type="email" required autoComplete="email" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
              </div>
              <div>
                <Label htmlFor="signin-password" className="text-base font-bold">Password</Label>
                <Input id="signin-password" name="signin-password" type="password" required autoComplete="current-password" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
              </div>
              <Button type="submit" size="lg" className="w-full">Sign in</Button>
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
