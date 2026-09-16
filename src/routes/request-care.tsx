import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageIntro } from "@/components/gracefield";

export const Route = createFileRoute("/request-care")({
  head: () => ({ meta: [
    { title: "Request Live-in Care | Gracefield" },
    { name: "description", content: "Sign in or create a Gracefield account to start a live-in care request for your family." },
    { property: "og:title", content: "Request Live-in Care | Gracefield" },
    { property: "og:description", content: "Sign in or create a Gracefield account to start a live-in care request for your family." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: RequestCarePage,
});

function RequestCarePage() {
  return (
    <>
      <PageIntro eyebrow="Request care" title="Create an account or sign in to request care.">
        <p>Your account keeps your care request and details in one safe place, so we can pick up the conversation whenever you are ready.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="surface-card rounded-2xl p-6 text-center sm:p-9">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary"><ShieldCheck className="h-7 w-7" aria-hidden="true" /></span>
            <h2 className="mt-6 font-heading text-2xl font-extrabold text-primary sm:text-3xl">One step before your care request</h2>
            <p className="mt-3 text-base text-muted-foreground">Sign in if you have been here before, or create an account to get started.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg"><Link to="/sign-in">Sign in</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/create-account">Create account</Link></Button>
            </div>
          </div>
          <p className="mt-8 text-center text-base text-muted-foreground">
            Just have a question? <Link to="/contact" search={{ about: undefined }} className="font-bold text-primary underline decoration-brand-gold underline-offset-4">Send us a message instead</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
