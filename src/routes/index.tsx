import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Check, ChevronRight, HeartHandshake, House, Phone, Sun } from "lucide-react";

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

      <section className="section-band px-5 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>What we do</Eyebrow>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <h2 className="max-w-3xl font-heading text-3xl font-extrabold leading-tight text-primary sm:text-4xl lg:text-5xl">
              One carer, living alongside them, around the clock.
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Familiar routines can continue, with kind, practical help always close by.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { icon: Sun, title: "24-hour live-in support", text: "A reassuring presence at home, day and night." },
                { icon: HeartHandshake, title: "Help with daily living", text: "Personal care, meals, medication and everyday routines." },
                { icon: House, title: "Staying connected", text: "Support to enjoy family, friends and the local community." },
              ].map(({ icon: Icon, title, text }) => (
              <article key={title} className="surface-card rounded-2xl p-7 sm:p-8">
                <span className="mb-7 grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="font-heading text-xl font-extrabold text-primary sm:text-2xl">{title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
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
          <div className="mx-auto w-full max-w-[280px] sm:max-w-[300px]">
            <PhonePreview />
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

function PhonePreview() {
  return (
    <div className="relative mx-auto w-full" aria-hidden="true">
      <div className="iphone-silent absolute -left-[2px] top-[92px] h-[22px] w-[3px] rounded-l-[2px]" />
      <div className="iphone-volume absolute -left-[2px] top-[128px] h-[38px] w-[3px] rounded-l-[2px]" />
      <div className="iphone-volume absolute -left-[2px] top-[174px] h-[38px] w-[3px] rounded-l-[2px]" />
      <div className="iphone-power absolute -right-[2px] top-[156px] h-[64px] w-[3px] rounded-r-[2px]" />

      <div className="iphone-shell relative aspect-[390/844] overflow-hidden rounded-[46px] p-[10px] shadow-[0_28px_70px_-24px_rgba(15,23,15,0.55)]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] bg-background">
          <div className="relative h-[210px] shrink-0 overflow-hidden sm:h-[228px]">
            <img
              src={careKitchen}
              alt=""
              loading="lazy"
              width={1600}
              height={1104}
              className="h-full w-full object-cover object-[center_30%]"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />

            <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-[22px] pt-[14px] text-white">
              <span className="pt-[2px] text-[12px] font-semibold tracking-[0.02em] [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]">
                9:41
              </span>
              <div className="flex items-center gap-[5px] pt-[3px] [filter:drop-shadow(0_1px_6px_rgba(0,0,0,0.4))]">
                <IosSignal />
                <IosWifi />
                <IosBattery />
              </div>
            </div>

            <div className="absolute left-1/2 top-[10px] z-30 flex h-[30px] w-[102px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-[10px]">
              <span className="relative h-[9px] w-[9px] rounded-full bg-[#1a1a1a] ring-[1.5px] ring-[#2a2a2a]">
                <span className="absolute inset-[2px] rounded-full bg-[#0d1b2a]" />
                <span className="absolute left-[2px] top-[1px] h-[2px] w-[2px] rounded-full bg-white/25" />
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-[18px] pb-1 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-gold">Gracefield care</p>
            <h3 className="mt-1 font-heading text-[19px] font-extrabold leading-[1.15] text-primary">
              Let’s find the right care together.
            </h3>
            <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
              A few simple details help us understand what your family needs.
            </p>
            <div className="mt-3 space-y-2">
              {["Tell us who needs support", "Choose a time to talk", "Meet your care adviser"].map((step, index) => (
                <div key={step} className="flex min-h-[44px] items-center gap-2.5 rounded-[16px] bg-card px-3 py-2 shadow-[0_6px_16px_-10px_rgba(47,74,56,0.35)] ring-1 ring-black/[0.04]">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-extrabold text-primary">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-[12px] font-bold leading-snug text-foreground">{step}</span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                </div>
              ))}
            </div>
            <div className="mt-auto pb-1 pt-3">
              <div className="grid h-10 place-items-center rounded-full bg-primary text-[13px] font-bold text-primary-foreground">
                Start arranging care
              </div>
            </div>
          </div>

          <div className="flex justify-center pb-[8px] pt-[4px]">
            <span className="h-[4px] w-[108px] rounded-full bg-foreground/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

function IosSignal() {
  return (
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
      <rect x="0" y="7.5" width="3" height="4.5" rx="0.7" />
      <rect x="4.6" y="5.5" width="3" height="6.5" rx="0.7" />
      <rect x="9.2" y="3" width="3" height="9" rx="0.7" />
      <rect x="13.8" y="0" width="3" height="12" rx="0.7" />
    </svg>
  );
}

function IosWifi() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M1.2 4.1C4.6 1.2 11.4 1.2 14.8 4.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 6.5C5.8 4.6 10.2 4.6 12.5 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6.1 8.8C7.2 7.8 8.8 7.8 9.9 8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="11" r="1.15" fill="currentColor" />
    </svg>
  );
}

function IosBattery() {
  return (
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
      <rect x="0.6" y="0.6" width="22.2" height="11.8" rx="2.4" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <rect x="2.1" y="2.15" width="19.2" height="8.7" rx="1.4" fill="currentColor" />
      <path d="M24.4 4.2C25.5 4.55 26.2 5.4 26.2 6.5C26.2 7.6 25.5 8.45 24.4 8.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}
