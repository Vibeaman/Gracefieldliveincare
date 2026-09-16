import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", to: "/" as const },
  { label: "About", to: "/about" as const },
  { label: "Live-in Care", to: "/live-in-care" as const },
  { label: "Careers", to: "/careers" as const },
];

export function Wordmark() {
  return (
    <span className="inline-flex flex-col leading-none" aria-label="Gracefield Living in Care">
      <span className="font-heading text-[1.55rem] font-extrabold text-primary sm:text-[1.7rem]">
        Gracefield
      </span>
      <span className="mt-1 text-[0.62rem] font-bold tracking-[0.24em] text-brand-gold">
        LIVING IN CARE
      </span>
    </span>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto grid min-h-20 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:px-8 lg:px-12">
        <Link to="/" aria-label="Gracefield home" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="text-base font-semibold text-foreground/75 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/sign-in"
            className="text-base font-semibold text-foreground/75 transition-colors hover:text-primary"
            activeProps={{ className: "text-primary" }}
          >
            Sign in
          </Link>
          <Button asChild variant="outline" size="default" className="h-11 px-5">
            <Link to="/create-account">Create account</Link>
          </Button>
          <Button asChild size="lg">
            <Link to="/contact" search={{ about: undefined }}>Contact us</Link>
          </Button>
        </nav>

        <Button
          type="button"
          size="icon-lg"
          variant="ghost"
          className="lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>
      </div>

      {open ? (
        <nav
          id="mobile-navigation"
          className="border-t border-border bg-background px-5 py-5 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-lg px-3 py-3 text-lg font-semibold text-foreground/80 hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary" }}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/sign-in"
              className="rounded-lg px-3 py-3 text-lg font-semibold text-foreground/80 hover:bg-secondary"
              activeProps={{ className: "bg-secondary text-primary" }}
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              to="/create-account"
              className="rounded-lg px-3 py-3 text-lg font-semibold text-foreground/80 hover:bg-secondary"
              activeProps={{ className: "bg-secondary text-primary" }}
              onClick={() => setOpen(false)}
            >
              Create account
            </Link>
            <Button asChild size="lg" className="mt-3 w-full">
              <Link to="/contact" search={{ about: undefined }} onClick={() => setOpen(false)}>
                Contact us
              </Link>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/45">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-sm text-base text-muted-foreground">
              Thoughtful live-in care, helping people stay safely in the home they love.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="font-heading text-base font-extrabold text-primary">Contact us</h2>
            <div className="space-y-3 text-base text-muted-foreground">
              <a href="tel:+447584920625" className="flex items-center gap-3 hover:text-primary"><Phone className="h-5 w-5 shrink-0 text-brand-gold" aria-hidden="true" /><span>+44 7584 920625</span></a>
              <a href="mailto:gracefieldliveincare@gmail.com" className="flex items-center gap-3 hover:text-primary"><Mail className="h-5 w-5 shrink-0 text-brand-gold" aria-hidden="true" /><span>gracefieldliveincare@gmail.com</span></a>
              <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-gold" aria-hidden="true" /><div className="not-italic"><p className="not-italic">11 Blue Close, Workington, CA14 3FJ</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1"><a className="inline-flex items-center gap-1.5 hover:text-primary" href="https://www.google.com/maps/search/?api=1&query=11+Blue+Close%2C+Workington%2C+CA14+3FJ" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Google Maps</a><a className="inline-flex items-center gap-1.5 hover:text-primary" href="https://maps.apple.com/?q=11+Blue+Close%2C+Workington%2C+CA14+3FJ" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Apple Maps</a></div></div></div>
            </div>
          </div>
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <h2 className="font-heading text-base font-extrabold text-primary">Quick links</h2>
            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-base font-semibold" aria-label="Footer navigation">
              {navItems.slice(1).map((item) => (
                <Link key={item.to} to={item.to} className="text-foreground/75 hover:text-primary">
                  {item.label}
                </Link>
              ))}
              <Link to="/contact" search={{ about: undefined }} className="text-foreground/75 hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
        </div>
        <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">© {new Date().getFullYear()} Gracefield Living in Care. All rights reserved.</p>
      </div>
    </footer>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-sm font-extrabold uppercase tracking-[0.16em] text-brand-gold sm:text-base">
      {children}
    </p>
  );
}

export function PageIntro({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-12 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.08] text-primary sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            {children}
          </div>
          {actions ? <div className="mt-9 flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function CareIllustration() {
  return (
    <div
      className="care-illustration relative min-h-[330px] overflow-hidden rounded-[2rem] bg-primary sm:min-h-[420px]"
      role="img"
      aria-label="A warm sun rising over gently curved grass"
    >
      <div className="absolute left-1/2 top-[17%] h-36 w-36 -translate-x-1/2 rounded-full bg-brand-gold sm:h-44 sm:w-44" />
      <div className="absolute inset-x-0 bottom-0 h-[44%] rounded-t-[50%] bg-illustration-hill" />
      <div className="grass-blade grass-blade-one" />
      <div className="grass-blade grass-blade-two" />
      <div className="grass-blade grass-blade-three" />
      <div className="grass-blade grass-blade-four" />
      <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-primary-foreground/85">
        <span className="text-sm font-bold uppercase tracking-[0.14em]">Care at home</span>
        <ArrowRight className="h-6 w-6" aria-hidden="true" />
      </div>
    </div>
  );
}