import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthOrDivider, GoogleContinueButton } from "@/components/google-continue";
import { PageIntro } from "@/components/gracefield";

export const Route = createFileRoute("/create-account")({
  head: () => ({ meta: [
    { title: "Create an Account | Gracefield Living in Care" },
    { name: "description", content: "Create a Gracefield account to start a live-in care request for your loved one." },
    { property: "og:title", content: "Create an Account | Gracefield Living in Care" },
    { property: "og:description", content: "Create a Gracefield account to start a live-in care request for your loved one." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: CreateAccountPage,
});

function CreateAccountPage() {
  const navigate = useNavigate();
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({ to: "/account" });
  };

  return (
    <>
      <PageIntro eyebrow="Create account" title="Let's set up your account.">
        <p>Two details are all we need to get your care request started.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-xl">
          <div className="surface-card rounded-2xl p-6 sm:p-9">
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Create account</h2>
            <div className="mt-7">
              <GoogleContinueButton />
            </div>
            <div className="my-6">
              <AuthOrDivider />
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="signup-email" className="text-base font-bold">Email address</Label>
                <Input id="signup-email" name="signup-email" type="email" required autoComplete="email" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
              </div>
              <div>
                <Label htmlFor="signup-password" className="text-base font-bold">Password</Label>
                <Input id="signup-password" name="signup-password" type="password" required autoComplete="new-password" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
              </div>
              <Button type="submit" size="lg" className="w-full">Create account</Button>
            </form>
            <p className="mt-6 text-base text-muted-foreground">
              Already have an account? <Link to="/sign-in" className="font-bold text-primary underline decoration-brand-gold underline-offset-4">Sign in</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
