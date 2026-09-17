import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Eyebrow, PageIntro } from "@/components/gracefield";
import careKitchen from "@/assets/gracefield-care-kitchen.jpg";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";

export const Route = createFileRoute("/what-we-do")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.whatWeDo.title, PAGE_SEO.whatWeDo.description, { path: "/what-we-do" }),
  }),
  component: WhatWeDoPage,
});

const services = [
  {
    title: "Personal care",
    lead: "Help with the private parts of the day, always at the person’s pace.",
    points: [
      "Getting up, washing, showering or bathing",
      "Dressing and getting ready for bed",
      "Hair, skin and everyday grooming",
      "Support with continence, if that is needed",
      "Help with eating and drinking when meals are hard work on their own",
    ],
  },
  {
    title: "Meals at home",
    lead: "Familiar food, cooked in their own kitchen — not a tray from elsewhere.",
    points: [
      "Breakfast, lunch, tea and a light supper if that is the routine",
      "Meals shaped around likes, dislikes and any special diet",
      "Drinks and snacks through the day",
      "Help at the table when it is needed, without fuss",
    ],
  },
  {
    title: "Medication",
    lead: "Gentle prompts and a clear record, working with the GP and family.",
    points: [
      "Reminders to take tablets at the right time",
      "Help with creams and other simple treatments, as agreed",
      "Safe storage in the home",
      "A simple note of what was taken, and anything that did not seem right",
    ],
  },
  {
    title: "Home and daily life",
    lead: "Keeping the house comfortable, so life can carry on as usual.",
    points: [
      "Light housework, washing up and keeping rooms tidy",
      "Laundry, ironing and changing the bed",
      "Shopping and putting food away",
      "Making sure heating is used safely",
      "Taking out the rubbish and the small jobs that keep a home running",
    ],
  },
  {
    title: "Company",
    lead: "Someone in the house who has time to talk, listen and share the day.",
    points: [
      "Conversation, favourite programmes and reading together",
      "Hobbies at home — puzzles, crafts, music, a walk in the garden",
      "Help staying in touch with neighbours, friends and family",
      "Company on a trip out when that feels right",
    ],
  },
  {
    title: "Appointments and family",
    lead: "Practical help so the week does not get on top of anyone.",
    points: [
      "Getting to GP, hospital and other appointments",
      "Keeping simple letters and paperwork in one place",
      "Help using the phone or making a call",
      "Support staying in touch with family, including visits when wanted",
    ],
  },
  {
    title: "Nights",
    lead: "Someone in the house after dark, so the rest of the family can sleep.",
    points: [
      "A waking night, if more help is needed through the small hours",
      "Or a sleep-in: the carer rests nearby and is ready if called",
      "Help with turning, drinks, the bathroom or unsettled nights",
    ],
  },
  {
    title: "After illness",
    lead: "Steady support after a hospital stay or a difficult patch.",
    points: [
      "Help rebuilding confidence with washing, meals and moving around the house",
      "Following the plan from hospital or the GP, at the person’s own pace",
      "A familiar face at home while strength comes back",
    ],
  },
];

function WhatWeDoPage() {
  return (
    <>
      <PageIntro
        eyebrow="What we do"
        title="Live-in help for the whole day, not a flying visit."
        actions={
          <>
            <Button asChild size="lg">
              <Link to="/request-care">Request live-in care</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/live-in-care">How live-in care works</Link>
            </Button>
          </>
        }
      >
        <p>
          A Gracefield carer lives in the home. Support is there for getting up, meals, company and a
          settled night — shaped around the person, not a clock-in slot.
        </p>
      </PageIntro>
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <img
          src={careKitchen}
          alt="A Gracefield carer sharing tea with an older woman at home"
          width={1600}
          height={1104}
          className="image-frame aspect-[16/7] w-full rounded-[2rem] object-cover"
        />
      </div>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>How we help</Eyebrow>
          <h2 className="max-w-3xl font-heading text-3xl font-extrabold text-primary sm:text-4xl">
            The support a live-in carer can offer.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Not every household needs all of this. We listen first, then agree what would actually help
            at home.
          </p>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {services.map((service) => (
              <article key={service.title} className="surface-card rounded-2xl p-7 sm:p-9">
                <h3 className="font-heading text-2xl font-extrabold text-primary">{service.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{service.lead}</p>
                <ul className="mt-5 space-y-2.5 text-base text-foreground/85">
                  {service.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-gold" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">
            Ready to talk it through?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tell us a little about your loved one. There is no pressure and no long form to get started.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/request-care">Request care</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/contact" search={{ about: undefined }}>
                Contact us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
