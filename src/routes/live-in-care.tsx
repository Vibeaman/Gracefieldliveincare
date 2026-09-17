import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Eyebrow, PageIntro } from "@/components/gracefield";
import careGarden from "@/assets/gracefield-care-garden.jpg";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";

export const Route = createFileRoute("/live-in-care")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.liveInCare.title, PAGE_SEO.liveInCare.description, { path: "/live-in-care" }),
  }),
  component: LiveInCarePage,
});

function LiveInCarePage() {
  return (
    <>
      <PageIntro
        eyebrow="For families & referrers"
        title="One carer, living in, supporting every part of daily life."
        actions={<><Button asChild size="lg"><Link to="/request-care">Make an enquiry</Link></Button><Button asChild size="lg" variant="outline"><Link to="/careers">I'm looking for care work</Link></Button></>}
      >
        <p>A dedicated carer provides practical help, companionship and reassurance, while your loved one stays at home.</p>
      </PageIntro>
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <img src={careGarden} alt="A carer gently supporting an older man during a garden walk" width={1600} height={1104} className="image-frame aspect-[16/7] w-full rounded-[2rem] object-cover" />
      </div>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div>
            <Eyebrow>What's included</Eyebrow>
            <h2 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">What live-in care with Gracefield provides</h2>
            <ul className="mt-8 space-y-5">
              {[
                "A dedicated carer living in the home, day and night",
                "Personal care: washing, dressing, getting ready for bed",
                "Meals cooked at home, drinks and help at the table if needed",
                "Medication prompts, safe storage and a simple daily record",
                "Light housework, laundry, shopping and a comfortable home",
                "Company, hobbies and help staying in touch with family",
                "Support getting to appointments and keeping simple paperwork tidy",
                "Overnight presence: waking nights or sleeping nearby",
              ].map((item) => (
                <li key={item} className="flex items-start gap-4 text-lg text-foreground/85">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-4 w-4" aria-hidden="true" /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="surface-card rounded-2xl p-7 sm:p-9">
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">How care starts</h2>
            <p className="mt-3 text-base text-muted-foreground">We welcome enquiries from families and local authority or NHS teams.</p>
            <ol className="mt-8 space-y-7">
              {[
                ["1", "Initial enquiry", "Tell us about the person, their routines and the support they need."],
                ["2", "Home visit & assessment", "We meet, listen and shape a care plan around life at home."],
              ].map(([number, title, text]) => (
                <li key={number} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gold font-heading font-extrabold text-accent-foreground">{number}</span>
                  <div><h3 className="font-heading text-lg font-extrabold text-primary">{title}</h3><p className="mt-1 text-base text-muted-foreground">{text}</p></div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>
    </>
  );
}