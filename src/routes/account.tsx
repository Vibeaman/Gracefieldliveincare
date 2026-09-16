import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Eyebrow, PageIntro } from "@/components/gracefield";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [
    { title: "Your Account | Gracefield Living in Care" },
    { name: "description", content: "Your Gracefield account area for your care request status and personal details." },
    { property: "og:title", content: "Your Account | Gracefield Living in Care" },
    { property: "og:description", content: "Your Gracefield account area for your care request status and personal details." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <>
      <PageIntro eyebrow="Your account" title="Your Gracefield account.">
        <p>This is where your care request and details will live. It is ready and waiting for your information.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <article className="surface-card rounded-2xl p-7 sm:p-8">
            <ClipboardList className="h-8 w-8 text-brand-gold" aria-hidden="true" />
            <h2 className="mt-6 font-heading text-2xl font-extrabold text-primary">Care request status</h2>
            <p className="mt-2 text-base text-muted-foreground">You have not started a care request yet. Once you do, its progress will show here.</p>
            <span className="mt-5 inline-flex rounded-full border border-primary/25 bg-secondary px-4 py-1.5 text-sm font-bold text-primary">No request yet</span>
          </article>
          <article className="surface-card rounded-2xl p-7 sm:p-8">
            <UserRound className="h-8 w-8 text-brand-gold" aria-hidden="true" />
            <h2 className="mt-6 font-heading text-2xl font-extrabold text-primary">Your details</h2>
            <dl className="mt-5 space-y-4 text-base">
              {[["Name", "Not added yet"], ["Email address", "Not added yet"], ["Phone number", "Not added yet"]].map(([label, value]) => (
                <div key={label}>
                  <dt className="font-bold text-primary">{label}</dt>
                  <dd className="text-muted-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>
        <div className="mx-auto mt-12 max-w-5xl">
          <Eyebrow>Next step</Eyebrow>
          <p className="max-w-2xl text-lg text-muted-foreground">Have a question in the meantime? Our team is happy to talk things through.</p>
          <Button asChild size="lg" className="mt-6 w-full sm:w-auto"><Link to="/contact" search={{ about: undefined }}>Talk to our team</Link></Button>
        </div>
      </section>
    </>
  );
}
