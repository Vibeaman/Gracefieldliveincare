import { createFileRoute } from "@tanstack/react-router";
import { Check, ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
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

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>) => ({ about: search["about"] === "careers" ? "careers" : undefined }),
  head: () => ({
    meta: pageMeta(PAGE_SEO.contact.title, PAGE_SEO.contact.description, { path: "/contact" }),
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const { about } = Route.useSearch();
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    // Bots still see a thank-you. People are not told if they were blocked.
    if (isLikelySpam(form)) {
      setSent(true);
      return;
    }
    setSent(true);
  };

  return (
    <>
      <PageIntro eyebrow="Get in touch" title="Let's talk about care at home.">
        <p>We welcome families, referrers and people interested in becoming a live-in carer.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <div className="surface-card rounded-2xl p-6 sm:p-9">
            {sent ? (
              <div className="flex min-h-[26rem] flex-col items-center justify-center text-center" role="status">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-8 w-8" aria-hidden="true" /></span>
                <h2 className="mt-6 font-heading text-3xl font-extrabold text-primary">Thank you for getting in touch.</h2>
                <p className="mt-3 max-w-md text-lg text-muted-foreground">Your message has been noted. The Gracefield team will be ready to help once message sending is connected.</p>
                <Button type="button" variant="outline" className="mt-7" onClick={() => setSent(false)}>Send another message</Button>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Send us a message</h2>
                <form className="relative mt-7 space-y-5" onSubmit={handleSubmit}>
                  <HoneypotFields />
                  <div><Label htmlFor="full-name" className="text-base font-bold">Full name</Label><Input id="full-name" name="full-name" required autoComplete="name" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" /></div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div><Label htmlFor="email" className="text-base font-bold">Email address</Label><Input id="email" name="email" type="email" required autoComplete="email" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" /></div>
                    <div><Label htmlFor="phone" className="text-base font-bold">Phone number</Label><Input id="phone" name="phone" type="tel" autoComplete="tel" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" /></div>
                  </div>
                  <div><Label htmlFor="subject" className="text-base font-bold">I'm getting in touch about</Label><select id="subject" name="subject" defaultValue={about ?? "care"} className="mt-2 h-13 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="care">Live-in care for a family member</option><option value="referral">Referral</option><option value="careers">Careers / becoming a carer</option></select></div>
                  <div><Label htmlFor="message" className="text-base font-bold">Message</Label><Textarea id="message" name="message" required rows={5} className="mt-2 min-h-36 rounded-xl bg-background px-4 py-3 text-base" /></div>
                  <Button type="submit" size="lg" className="w-full sm:w-auto">Send message</Button>
                </form>
              </>
            )}
          </div>
          <aside className="pt-1 lg:pt-5">
            <Eyebrow>Contact details</Eyebrow>
            <h2 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">Prefer to call or email?</h2>
            <div className="mt-8 space-y-7">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4"><Phone className="mt-1 h-6 w-6 text-brand-gold" aria-hidden="true" /><div><h3 className="font-heading text-lg font-extrabold text-primary">Phone & WhatsApp</h3><a className="mt-1 block break-words text-base text-muted-foreground underline decoration-brand-gold underline-offset-4" href="tel:+447584920625">+44 7584 920625</a><a className="mt-1 inline-flex items-center gap-2 text-base text-muted-foreground underline decoration-brand-gold underline-offset-4 hover:text-primary" href="https://wa.me/447584920625" target="_blank" rel="noopener noreferrer"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Message us on WhatsApp</a></div></div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4"><Mail className="mt-1 h-6 w-6 text-brand-gold" aria-hidden="true" /><div><h3 className="font-heading text-lg font-extrabold text-primary">Email</h3><a className="mt-1 block break-all text-base text-muted-foreground underline decoration-brand-gold underline-offset-4" href="mailto:gracefieldliveincare@gmail.com">gracefieldliveincare@gmail.com</a></div></div>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-4"><MapPin className="mt-1 h-6 w-6 text-brand-gold" aria-hidden="true" /><div><h3 className="font-heading text-lg font-extrabold text-primary">Address</h3><address className="mt-1 not-italic text-base text-muted-foreground">11 Blue Close<br />Workington<br />CA14 3FJ</address><div className="mt-3 flex flex-wrap gap-x-5 gap-y-2"><a className="inline-flex items-center gap-1.5 text-base font-semibold text-primary underline decoration-brand-gold underline-offset-4 hover:text-brand-gold" href="https://www.google.com/maps/search/?api=1&query=11+Blue+Close%2C+Workington%2C+CA14+3FJ" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Google Maps</a><a className="inline-flex items-center gap-1.5 text-base font-semibold text-primary underline decoration-brand-gold underline-offset-4 hover:text-brand-gold" href="https://maps.apple.com/?q=11+Blue+Close%2C+Workington%2C+CA14+3FJ" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" aria-hidden="true" /> Apple Maps</a></div></div></div>
            </div>
            <div className="mt-12 border-t border-border pt-8">
              <h2 className="font-heading text-2xl font-extrabold text-primary">Areas we cover</h2>
              <span className="mt-4 inline-flex rounded-full border border-primary/25 bg-secondary px-5 py-2 text-base font-bold text-primary">UK-wide coverage</span>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}