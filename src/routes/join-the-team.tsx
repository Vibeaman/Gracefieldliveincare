import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HoneypotFields } from "@/components/honeypot-fields";
import { Eyebrow, PageIntro } from "@/components/gracefield";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";
import { isLikelySpam } from "@/lib/spam-guard";
import { authErrorMessage, getSupabase } from "@/lib/supabase";
import { notifyNewTeamApplication } from "@/lib/team.functions";

export const Route = createFileRoute("/join-the-team")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.joinTheTeam.title, PAGE_SEO.joinTheTeam.description, {
      path: "/join-the-team",
    }),
  }),
  component: JoinTheTeamPage,
});

function JoinTheTeamPage() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (isLikelySpam(form)) {
      setSubmitted(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const fullName = String(form.get("applicant-name") ?? "").trim();
      const email = String(form.get("applicant-email") ?? "").trim();
      const phone = String(form.get("applicant-phone") ?? "").trim();
      const job = String(form.get("applicant-job") ?? "").trim();
      const about = String(form.get("applicant-about") ?? "").trim();
      const { error: insertError } = await getSupabase().from("team_applications").insert({
        full_name: fullName,
        email,
        phone,
        job,
        about,
        status: "pending",
      });
      if (insertError) throw insertError;
      await notifyNewTeamApplication({ data: { fullName, email, phone, job } }).catch(() => undefined);
      setSubmitted(true);
    } catch (caught) {
      setError(authErrorMessage(caught, "Could not send that. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageIntro eyebrow="Office team" title="Join the office.">
        This is for people who want to work in the office, not as a live-in carer. Tell us a little about yourself. Nothing is created until we read it.
      </PageIntro>
      <section className="bg-background px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div>
            <Eyebrow>Not a carer role</Eyebrow>
            <h2 className="mt-3 font-heading text-3xl font-extrabold text-primary sm:text-4xl">
              A short note is enough.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              We read every application in the office. If we say yes, we set up a Gracefield work email and send the steps to your personal address.
            </p>
            <p className="mt-4 text-base text-muted-foreground">
              Looking for live-in care work instead?{" "}
              <Link to="/careers" className="font-bold text-primary underline">
                Become a carer
              </Link>
              .
            </p>
          </div>
          <div className="surface-card rounded-2xl border border-border p-6 sm:p-8">
            {submitted ? (
              <div className="grid gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary">
                  <Check className="h-7 w-7" aria-hidden="true" />
                </span>
                <h2 className="font-heading text-2xl font-extrabold text-primary">We have your application.</h2>
                <p className="text-lg text-muted-foreground">
                  Thank you. We will read it and write to your personal email. Nothing has been created yet.
                </p>
              </div>
            ) : (
              <form className="grid gap-5" onSubmit={handleSubmit}>
                <HoneypotFields />
                <div className="grid gap-2">
                  <Label htmlFor="applicant-name">Your name</Label>
                  <Input id="applicant-name" name="applicant-name" required autoComplete="name" maxLength={200} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="applicant-email">Personal email</Label>
                  <Input
                    id="applicant-email"
                    name="applicant-email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={320}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="applicant-phone">Phone</Label>
                  <Input id="applicant-phone" name="applicant-phone" type="tel" required autoComplete="tel" maxLength={50} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="applicant-job">The job you want</Label>
                  <Input id="applicant-job" name="applicant-job" required maxLength={200} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="applicant-about">A short note about yourself</Label>
                  <Textarea id="applicant-about" name="applicant-about" required rows={6} maxLength={2000} />
                </div>
                {error ? (
                  <p role="alert" className="text-base font-bold text-destructive">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={busy}>
                  {busy ? "Sending\u2026" : "Send application"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
