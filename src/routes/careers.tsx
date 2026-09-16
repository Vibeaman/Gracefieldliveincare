import { createFileRoute } from "@tanstack/react-router";
import { BadgePoundSterling, Check, HeartHandshake, MapPin, MessageCircle, Upload } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eyebrow, PageIntro } from "@/components/gracefield";
import careKitchen from "@/assets/gracefield-care-kitchen.jpg";
import { uploadPublicPhoto } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";
import { authErrorMessage, getSupabase } from "@/lib/supabase";

const CAREERS_WHATSAPP_DISPLAY = "+44 7584 920625";
const CAREERS_WHATSAPP_LINK = "https://wa.me/447584920625";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.careers.title, PAGE_SEO.careers.description, { path: "/careers" }),
  }),
  component: CareersPage,
});

function CareersPage() {
  const benefits = [
    { icon: BadgePoundSterling, title: "Fair pay", text: "Clear rates that value your skills and time." },
    { icon: HeartHandshake, title: "Ongoing support", text: "A team you can turn to whenever you need help." },
    { icon: MapPin, title: "Work close to home", text: "Placements chosen with location and fit in mind." },
  ];

  const [submitted, setSubmitted] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoName(file ? file.name : null);
    setPhotoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!photoFile) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const photoUrl = await uploadPublicPhoto("applications", photoFile);
      const { error: insertError } = await getSupabase().from("applications").insert({
        full_name: String(form.get("applicant-name") ?? ""),
        email: String(form.get("applicant-email") ?? ""),
        phone: String(form.get("applicant-phone") ?? ""),
        years_experience: String(form.get("applicant-experience") ?? ""),
        availability: String(form.get("applicant-availability") ?? ""),
        about: String(form.get("applicant-about") ?? ""),
        photo_url: photoUrl,
        status: "pending",
      });
      if (insertError) throw insertError;
      setSubmitted(true);
    } catch (caught) {
      setError(authErrorMessage(caught, "We could not send that application. Please try again."));
      setBusy(false);
    }
  };

  return (
    <>
      <PageIntro eyebrow="For carers" title="Build a career giving live-in care.">
        <p>Join Gracefield and make a lasting difference by helping someone live safely and confidently in their own home.</p>
      </PageIntro>
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <img src={careKitchen} alt="A carer making tea and sharing a happy moment with an older woman" width={1600} height={1104} className="image-frame aspect-[16/7] w-full rounded-[2rem] object-cover" />
      </div>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <Eyebrow>Working with us</Eyebrow>
          <h2 className="font-heading text-3xl font-extrabold text-primary sm:text-4xl">Why carers choose Gracefield</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, text }) => (
              <article key={title} className="surface-card rounded-2xl p-7 sm:p-8">
                <Icon className="h-8 w-8 text-brand-gold" aria-hidden="true" />
                <h3 className="mt-6 font-heading text-2xl font-extrabold text-primary">{title}</h3>
                <p className="mt-2 text-base text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-14 max-w-3xl">
            <div className="surface-card rounded-2xl p-6 sm:p-9">
              {submitted ? (
                <div className="flex min-h-[24rem] flex-col items-center justify-center text-center" role="status">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-8 w-8" aria-hidden="true" /></span>
                  <h3 className="mt-6 font-heading text-3xl font-extrabold text-primary">Thanks, your application has been received.</h3>
                  <p className="mt-3 max-w-md text-lg text-muted-foreground">We'll look over your application. If you're a good fit, here's how to reach us for an interview:</p>
                  <a
                    href={CAREERS_WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-lg font-bold text-primary underline decoration-brand-gold underline-offset-4 hover:text-brand-gold"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                    Message us on WhatsApp: {CAREERS_WHATSAPP_DISPLAY}
                  </a>
                </div>
              ) : (
                <>
                  <h3 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Apply to be a live-in carer</h3>
                  <p className="mt-3 text-base text-muted-foreground">Every field is needed so we can get a clear picture of you.</p>
                  <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                    <div>
                      <Label htmlFor="applicant-name" className="text-base font-bold">Full name</Label>
                      <Input id="applicant-name" name="applicant-name" required autoComplete="name" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="applicant-email" className="text-base font-bold">Email address</Label>
                        <Input id="applicant-email" name="applicant-email" type="email" required autoComplete="email" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
                      </div>
                      <div>
                        <Label htmlFor="applicant-phone" className="text-base font-bold">Phone number</Label>
                        <Input id="applicant-phone" name="applicant-phone" type="tel" required autoComplete="tel" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
                      </div>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="applicant-experience" className="text-base font-bold">Years of care experience</Label>
                        <select id="applicant-experience" name="applicant-experience" required defaultValue="" className="mt-2 h-13 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <option value="" disabled>Please choose</option>
                          <option value="none">No experience yet</option>
                          <option value="under-1">Less than 1 year</option>
                          <option value="1-3">1 to 3 years</option>
                          <option value="3-5">3 to 5 years</option>
                          <option value="5-plus">More than 5 years</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="applicant-availability" className="text-base font-bold">Availability</Label>
                        <select id="applicant-availability" name="applicant-availability" required defaultValue="" className="mt-2 h-13 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <option value="" disabled>Please choose</option>
                          <option value="full-time">Full-time live-in</option>
                          <option value="part-time">Part-time</option>
                          <option value="unsure">Not sure yet</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="applicant-about" className="text-base font-bold">Tell us about yourself</Label>
                      <Textarea id="applicant-about" name="applicant-about" required rows={5} className="mt-2 min-h-36 rounded-xl bg-background px-4 py-3 text-base" />
                    </div>
                    <div>
                      <Label htmlFor="applicant-photo" className="text-base font-bold">Photo of yourself</Label>
                      <p className="mt-1 text-sm text-muted-foreground">A clear photo is required with every application.</p>
                      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
                        <label htmlFor="applicant-photo" className="inline-flex min-h-13 cursor-pointer items-center gap-2 rounded-xl border border-input bg-background px-4 text-base font-bold text-primary hover:bg-secondary">
                          <Upload className="h-5 w-5" aria-hidden="true" />
                          {photoName ? "Choose a different photo" : "Choose a photo"}
                        </label>
                        <Input id="applicant-photo" name="applicant-photo" type="file" accept="image/*" required className="sr-only" onChange={handlePhotoChange} />
                        {photoPreview ? (
                          <span className="flex items-center gap-3">
                            <img src={photoPreview} alt="Preview of the photo you selected" className="h-16 w-16 rounded-xl border border-border object-cover" />
                            <span className="max-w-[12rem] truncate text-sm text-muted-foreground">{photoName}</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {error ? <p role="alert" className="text-base font-bold text-destructive">{error}</p> : null}
                    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={!photoName || busy}>
                      {busy ? "Sending…" : "Submit application"}
                    </Button>
                    {!photoName ? <p className="text-sm text-muted-foreground">Add your photo to finish your application.</p> : null}
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
