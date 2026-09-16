import { createFileRoute } from "@tanstack/react-router";

import { Eyebrow, PageIntro } from "@/components/gracefield";
import careMemories from "@/assets/gracefield-care-memories.jpg";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.about.title, PAGE_SEO.about.description, { path: "/about" }),
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About Gracefield" title="Built by people who've spent two decades in care.">
        <p>We believe most people would rather grow older at home, surrounded by familiar things and the life they know.</p>
      </PageIntro>
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <img src={careMemories} alt="An older woman sharing family memories with her carer at home" width={1600} height={1104} className="image-frame aspect-[16/7] w-full rounded-[2rem] object-cover" />
      </div>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div>
            <Eyebrow>Our story</Eyebrow>
            <h2 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">Why we started Gracefield</h2>
            <div className="mt-6 max-w-2xl space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>Founder Francess Dugbo has spent more than two decades working in domiciliary care, alongside older people and their families.</p>
              <p>Gracefield exists to offer a warm, dependable alternative to residential care, one that protects independence, routines and connection.</p>
            </div>
          </div>
          <aside className="surface-card rounded-2xl p-7 sm:p-9">
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">What guides how we work</h2>
            <div className="mt-7 divide-y divide-border">
              {[
                ["Home comes first", "We help people remain where they feel most comfortable."],
                ["Continuity of carer", "A familiar face builds trust and makes each day easier."],
                ["Dignity is non-negotiable", "Every person is listened to, respected and treated as an individual."],
              ].map(([title, text]) => (
                <div key={title} className="py-5 first:pt-0 last:pb-0">
                  <h3 className="font-heading text-lg font-extrabold text-primary">{title}</h3>
                  <p className="mt-1 text-base text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}