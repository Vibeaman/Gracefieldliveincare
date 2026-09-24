import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Eyebrow, PageIntro } from "@/components/gracefield";
import careKitchen from "@/assets/gracefield-care-kitchen.jpg";
import careMemories from "@/assets/gracefield-care-memories.jpg";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.training.title, PAGE_SEO.training.description, { path: "/training" }),
  }),
  component: TrainingPage,
});

const cleaningServices = [
  "Carpets, including cleaning and removal",
  "Kitchens and bathrooms",
  "Windows, floors, surfaces and walls",
  "Vacuuming",
  "Upholstery",
  "Cobwebs",
  "Decluttering",
  "Skirting boards and doors",
];

function TrainingPage() {
  return (
    <>
      <PageIntro
        eyebrow="Training"
        title="The skills behind good care, and extra help with the home."
        actions={
          <>
            <Button asChild size="lg">
              <Link to="/contact" search={{ about: undefined }}>
                Contact us
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/careers">Join our carers</Link>
            </Button>
          </>
        }
      >
        <p>
          Families come first at Gracefield. That is why every carer is trained to a high standard.
        </p>
      </PageIntro>

      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <img
          src={careMemories}
          alt="A Gracefield carer spending time with an older woman at home"
          width={1600}
          height={1104}
          className="image-frame aspect-[16/7] w-full rounded-[2rem] object-cover"
        />
      </div>

      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div>
            <Eyebrow>Training</Eyebrow>
            <h2 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
              Equipped to give high-quality care
            </h2>
            <div className="mt-6 max-w-2xl space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                We want every person we support to be looked after by someone with the right skills,
                knowledge and patience. That starts before a carer ever moves into a home.
              </p>
              <p>
                Our induction covers mandatory health and social care training to the national
                minimum standard. Every new joiner completes the Care Certificate, made up of 15
                minimum standards.
              </p>
              <p>
                We also run specialist sessions so carers can keep building their skills and stay
                confident in the role. Our aim is simple: Gracefield carers meet or go beyond the
                national minimum standard, with the tools they need to do the job well.
              </p>
            </div>
          </div>
          <aside className="surface-card rounded-2xl p-7 sm:p-9">
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">
              What induction covers
            </h2>
            <ul className="mt-7 space-y-5">
              {[
                ["Care Certificate", "Fifteen national minimum standards, completed by every new carer."],
                ["Mandatory training", "Health and social care essentials before a placement begins."],
                ["Specialist sessions", "Extra training to deepen skill and support continued development."],
              ].map(([title, text]) => (
                <li key={title}>
                  <h3 className="font-heading text-lg font-extrabold text-primary">{title}</h3>
                  <p className="mt-1 text-base text-muted-foreground">{text}</p>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 w-full">
              <Link to="/contact" search={{ about: "careers" }}>
                Ask about training
              </Link>
            </Button>
          </aside>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <img
          src={careKitchen}
          alt="A carer and an older woman sharing a moment in the kitchen at home"
          width={1600}
          height={1104}
          className="image-frame aspect-[16/7] w-full rounded-[2rem] object-cover"
        />
      </div>

      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>Cleaning</Eyebrow>
          <h2 className="max-w-3xl font-heading text-3xl font-extrabold text-primary sm:text-4xl">
            Extra help when the house needs a proper clean
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            If you need more than day-to-day tidying, Gracefield can arrange a deep clean or a
            declutter. Our cleaners are trained for thorough work, and they know how to move gently
            around older people, people with mental health needs, and people with learning
            difficulties, for whom a big clean can feel overwhelming.
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            We can come once, or on a regular timetable you choose, for a home or another space that
            needs to be kept in good order. The work is reliable, discreet and fairly priced.
          </p>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="surface-card rounded-2xl p-7 sm:p-9">
              <h3 className="font-heading text-2xl font-extrabold text-primary">What we can do</h3>
              <ul className="mt-5 space-y-3 text-base text-foreground/85">
                {cleaningServices.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="surface-card rounded-2xl p-7 sm:p-9">
              <h3 className="font-heading text-2xl font-extrabold text-primary">How it is arranged</h3>
              <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                Tell us what the home needs and how often. We will shape the visit around the person
                who lives there, not a rushed checklist.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                If you already have a Gracefield carer, cleaning can sit alongside live-in support.
                If you only need a clean, that is fine too.
              </p>
              <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
                <Link to="/contact" search={{ about: undefined }}>
                  Ask about cleaning
                </Link>
              </Button>
            </article>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
            Want to know more?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get in touch about training for carers, or about a one-off or regular clean.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/contact" search={{ about: undefined }}>
                Contact us
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/request-care">Request live-in care</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
