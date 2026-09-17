import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Bath,
  BatteryFull,
  CalendarDays,
  Check,
  ChevronRight,
  HeartHandshake,
  House,
  Moon,
  Phone,
  Pill,
  ShoppingBag,
  Signal,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/gracefield";
import careKitchen from "@/assets/gracefield-care-kitchen.jpg";
import careGarden from "@/assets/gracefield-care-garden.jpg";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.home.title, PAGE_SEO.home.description, { path: "/" }),
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-16 lg:px-12 lg:pb-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <div className="max-w-3xl">
            <Eyebrow>Care that feels like home</Eyebrow>
            <h1 className="font-heading text-4xl font-extrabold leading-[1.06] text-primary sm:text-5xl lg:text-6xl xl:text-7xl">
              Live-in care, in the home they already love.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              A carefully chosen carer lives with your loved one, offering kind, steady support while familiar life carries on.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to="/request-care">Find live-in care</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/careers">Become a live-in carer</Link></Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={careKitchen}
              alt="A Gracefield carer sharing tea and a laugh with an older woman at home"
              width={1600}
              height={1104}
              className="image-frame aspect-[4/3] w-full rounded-[2rem] object-cover"
            />
            <div className="surface-card absolute -bottom-6 left-5 right-5 rounded-2xl p-5 sm:left-8 sm:right-auto sm:max-w-xs">
              <p className="font-heading text-lg font-bold text-primary">Care built around the person</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Their routines, their home, their choices.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="what-we-do" className="section-band px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>What we do</Eyebrow>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <h2 className="max-w-3xl font-heading text-3xl font-extrabold leading-tight text-primary sm:text-4xl lg:text-5xl">
              Live-in help for the whole day, not a flying visit.
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              A Gracefield carer lives in the home, so support is there for getting up, meals, company and a settled night — shaped around the person, not a clock-in slot.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Bath,
                title: "Personal care",
                text: "Help with washing, dressing, getting ready for bed and the private parts of the day, always with dignity.",
              },
              {
                icon: UtensilsCrossed,
                title: "Meals at home",
                text: "Familiar food cooked in their own kitchen, with drinks and snacks through the day.",
              },
              {
                icon: Pill,
                title: "Medication",
                text: "Gentle prompts, safe storage and a clear note of what was taken, working with the GP and family.",
              },
              {
                icon: ShoppingBag,
                title: "Home and daily life",
                text: "Light housework, laundry, shopping and keeping the house comfortable and safe.",
              },
              {
                icon: HeartHandshake,
                title: "Company",
                text: "Conversation, favourite programmes, hobbies and time outdoors, so the days do not feel empty.",
              },
              {
                icon: CalendarDays,
                title: "Appointments and family",
                text: "Help getting to appointments, staying in touch, and keeping simple paperwork in order.",
              },
              {
                icon: Moon,
                title: "Nights",
                text: "Someone in the house overnight — awake if that is needed, or sleeping nearby and ready if called.",
              },
              {
                icon: House,
                title: "After illness",
                text: "Steady support after a hospital stay or a difficult patch, at the person’s own pace.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="surface-card rounded-2xl p-6 sm:p-7">
                <span className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-xl font-extrabold text-primary">{title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/live-in-care">See how live-in care works</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <img src={careGarden} alt="An older man enjoying a garden walk with his carer" loading="lazy" width={1600} height={1104} className="image-frame aspect-[4/3] w-full rounded-[2rem] object-cover" />
          <div>
            <Eyebrow>Why care at home</Eyebrow>
            <h2 className="font-heading text-3xl font-extrabold leading-tight text-primary sm:text-4xl lg:text-5xl">Life stays familiar, with the right help close by.</h2>
            <ul className="mt-7 space-y-4">
              {["One-to-one support shaped around individual needs", "More independence, comfort and familiar routines", "A consistent carer who gets to know the whole family"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg text-foreground/85"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-primary"><Check className="h-4 w-4" aria-hidden="true" /></span>{item}</li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 w-full sm:w-auto"><Link to="/contact" search={{ about: undefined }}>Talk to us about care</Link></Button>
          </div>
        </div>
      </section>

      <section className="section-band overflow-hidden px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="mx-auto w-full max-w-[310px] lg:max-w-[350px]">
            <div className="relative">
              {/* Side buttons */}
              <div className="absolute -left-[3px] top-24 h-8 w-[3px] rounded-l-md bg-gradient-to-b from-zinc-400 via-zinc-600 to-zinc-500" aria-hidden="true" />
              <div className="absolute -left-[3px] top-36 h-14 w-[3px] rounded-l-md bg-gradient-to-b from-zinc-400 via-zinc-600 to-zinc-500" aria-hidden="true" />
              <div className="absolute -left-[3px] top-52 h-14 w-[3px] rounded-l-md bg-gradient-to-b from-zinc-400 via-zinc-600 to-zinc-500" aria-hidden="true" />
              <div className="absolute -right-[3px] top-44 h-20 w-[3px] rounded-r-md bg-gradient-to-b from-zinc-400 via-zinc-600 to-zinc-500" aria-hidden="true" />

              {/* Titanium frame */}
              <div className="relative aspect-[9/19] rounded-[3.4rem] bg-gradient-to-b from-zinc-300 via-zinc-500 to-zinc-400 p-[3px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)]">
                {/* Black bezel */}
                <div className="h-full w-full rounded-[3.25rem] bg-zinc-950 p-[10px]">
                  {/* Screen */}
                  <div className="relative flex h-full flex-col overflow-hidden rounded-[2.6rem] bg-background">
                    {/* Dynamic Island */}
                    <div className="absolute left-1/2 top-3 z-20 flex h-7 w-28 -translate-x-1/2 items-center justify-end rounded-full bg-zinc-950 pr-3" aria-hidden="true">
                      <span className="h-2.5 w-2.5 rounded-full bg-zinc-800 ring-1 ring-zinc-700" />
                    </div>

                    {/* iOS status bar */}
                    <div className="relative z-10 flex items-center justify-between px-7 pt-3.5 text-foreground" aria-hidden="true">
                      <span className="text-[13px] font-semibold tracking-wide">9:41</span>
                      <span className="flex items-center gap-1.5">
                        <Signal className="h-3.5 w-3.5" />
                        <Wifi className="h-3.5 w-3.5" />
                        <BatteryFull className="h-4 w-4" />
                      </span>
                    </div>

                    {/* Screen content */}
                    <div className="flex min-h-0 flex-1 flex-col">
                      <div className="relative">
                        <img
                          src={careKitchen}
                          alt="A carer and an older woman enjoying time together at home"
                          loading="lazy"
                          width={1600}
                          height={1104}
                          className="h-44 w-full object-cover sm:h-48"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" aria-hidden="true" />
                      </div>
                      <div className="flex flex-1 flex-col px-5 pb-4 pt-1">
                        <p className="text-[11px] font-bold uppercase text-brand-gold">Gracefield care</p>
                        <h3 className="mt-1.5 font-heading text-xl font-extrabold leading-tight text-primary">
                          Let’s find the right care together.
                        </h3>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                          A few simple details help us understand what your family needs.
                        </p>
                        <div className="mt-4 space-y-2.5">
                          {["Tell us who needs support", "Choose a time to talk", "Meet your care adviser"].map((step, index) => (
                            <div key={step} className="flex min-h-12 items-center gap-3 rounded-2xl bg-card px-3 py-2 shadow-sm ring-1 ring-foreground/5">
                              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[13px] font-extrabold text-primary">
                                {index + 1}
                              </span>
                              <span className="flex-1 text-[13px] font-bold leading-snug text-foreground">{step}</span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                            </div>
                          ))}
                        </div>
                        <div className="mt-auto pt-4">
                          <div className="grid h-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                            Start arranging care
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Home indicator */}
                    <div className="relative z-10 flex justify-center pb-2 pt-1" aria-hidden="true">
                      <span className="h-1 w-28 rounded-full bg-foreground/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl">
            <Eyebrow>Simple from the start</Eyebrow>
            <h2 className="font-heading text-3xl font-extrabold leading-tight text-primary sm:text-4xl lg:text-5xl">
              Arranging care should feel clear and reassuring.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Tell us a little about your loved one and we’ll guide you through the next steps, without pressure or confusing forms.
            </p>
            <div className="mt-8 flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Phone className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-heading text-lg font-extrabold text-primary">Start with a friendly conversation</p>
                <p className="mt-1 text-base text-muted-foreground">We listen first, then explain the care options that may suit your family.</p>
              </div>
            </div>
            <Button asChild size="lg" className="mt-9 w-full sm:w-auto">
              <Link to="/request-care">Start arranging care</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary px-5 py-16 text-primary-foreground sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-brand-gold">A simple first step</p>
          <h2 className="mt-4 font-heading text-3xl font-extrabold sm:text-4xl lg:text-5xl">Tell us what would make life at home easier.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-foreground/80">We will listen, answer your questions and help you understand what care could look like. There is no pressure.</p>
          <Button asChild size="lg" variant="secondary" className="mt-8 w-full sm:w-auto"><Link to="/contact" search={{ about: undefined }}>Arrange a care conversation</Link></Button>
        </div>
      </section>
    </>
  );
}
