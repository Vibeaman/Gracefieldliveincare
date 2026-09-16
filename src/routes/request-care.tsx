import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageIntro } from "@/components/gracefield";
import { ensureClientProfile, getClientProfile, getUser, isProfileComplete, saveClientDetails } from "@/lib/auth";
import { pageMeta } from "@/lib/page-meta";
import { PAGE_SEO } from "@/lib/seo";
import { authErrorMessage, getSupabase } from "@/lib/supabase";
import type { Client } from "@/lib/database.types";

export const Route = createFileRoute("/request-care")({
  head: () => ({
    meta: pageMeta(PAGE_SEO.requestCare.title, PAGE_SEO.requestCare.description, {
      path: "/request-care",
    }),
  }),
  component: RequestCarePage,
});

function RequestCarePage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    void (async () => {
      const user = await getUser();
      setSignedIn(Boolean(user));
      if (user) {
        setClient(await getClientProfile());
      }
    })();
  }, []);

  if (signedIn === null) {
    return <div className="min-h-[40vh] bg-background" />;
  }

  if (!signedIn) {
    return <Gate />;
  }

  return <CareRequestForm client={client} />;
}

function Gate() {
  return (
    <>
      <PageIntro eyebrow="Request care" title="Create an account or sign in to request care.">
        <p>Your account keeps your care request and details in one safe place, so we can pick up the conversation whenever you are ready.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-2xl">
          <div className="surface-card rounded-2xl p-6 text-center sm:p-9">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-secondary text-primary"><ShieldCheck className="h-7 w-7" aria-hidden="true" /></span>
            <h2 className="mt-6 font-heading text-2xl font-extrabold text-primary sm:text-3xl">One step before your care request</h2>
            <p className="mt-3 text-base text-muted-foreground">Sign in if you have been here before, or create an account to get started.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg"><Link to="/sign-in">Sign in</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/create-account">Create account</Link></Button>
            </div>
          </div>
          <p className="mt-8 text-center text-base text-muted-foreground">
            Just have a question? <Link to="/contact" search={{ about: undefined }} className="font-bold text-primary underline decoration-brand-gold underline-offset-4">Send us a message instead</Link>.
          </p>
        </div>
      </section>
    </>
  );
}

function CareRequestForm({ client }: { client: Client | null }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDetails = isProfileComplete(client);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("full-name") ?? client?.full_name ?? "").trim();
    const phone = String(form.get("phone") ?? client?.phone ?? "").trim();
    const careType = String(form.get("care-type") ?? "");
    const location = String(form.get("location") ?? "").trim();
    const startDate = String(form.get("start-date") ?? "");
    const hours = String(form.get("hours") ?? "");

    setBusy(true);
    setError(null);
    try {
      await ensureClientProfile(fullName);
      await saveClientDetails({ full_name: fullName, phone, address: client?.address ?? "" });
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");

      const { error: insertError } = await supabase.from("bookings").insert({
        client_id: user.id,
        care_type: careType,
        location,
        start_date: startDate,
        hours,
        status: "pending",
        assigned_carer_id: null,
      });
      if (insertError) throw insertError;
      await navigate({ to: "/account" });
    } catch (caught) {
      setError(authErrorMessage(caught, "We could not send that request. Please try again."));
      setBusy(false);
    }
  };

  return (
    <>
      <PageIntro eyebrow="Request care" title="Tell us what would help at home.">
        <p>A few simple details are enough. We will be in touch after we read this.</p>
      </PageIntro>
      <section className="section-band px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-xl">
          <div className="surface-card rounded-2xl p-6 sm:p-9">
            <h2 className="font-heading text-2xl font-extrabold text-primary sm:text-3xl">Care request</h2>
            {hasDetails ? (
              <p className="mt-3 text-base text-muted-foreground">
                Requesting as {client?.full_name}. Change this in{" "}
                <Link to="/account" className="font-bold text-primary underline decoration-brand-gold underline-offset-4">
                  your account
                </Link>
                .
              </p>
            ) : null}
            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              {hasDetails ? (
                <>
                  <input type="hidden" name="full-name" value={client?.full_name ?? ""} />
                  <input type="hidden" name="phone" value={client?.phone ?? ""} />
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="full-name" className="text-base font-bold">Your name</Label>
                    <Input id="full-name" name="full-name" required autoComplete="name" defaultValue={client?.full_name ?? ""} className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-base font-bold">Phone number</Label>
                    <Input id="phone" name="phone" type="tel" required autoComplete="tel" defaultValue={client?.phone ?? ""} className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="care-type" className="text-base font-bold">What kind of care</Label>
                <select id="care-type" name="care-type" required defaultValue="" className="mt-2 h-13 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="" disabled>Please choose</option>
                  <option value="Live-in care, full time">Live-in care, full time</option>
                  <option value="Live-in care, weekdays">Live-in care, weekdays</option>
                  <option value="Respite care">Respite care</option>
                </select>
              </div>
              <div>
                <Label htmlFor="location" className="text-base font-bold">Where</Label>
                <Input id="location" name="location" required autoComplete="address-level2" className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
              </div>
              <div>
                <Label htmlFor="start-date" className="text-base font-bold">When would care start</Label>
                <Input id="start-date" name="start-date" type="date" required className="mt-2 h-13 rounded-xl bg-background px-4 text-base" />
              </div>
              <div>
                <Label htmlFor="hours" className="text-base font-bold">Hours of support</Label>
                <select id="hours" name="hours" required defaultValue="" className="mt-2 h-13 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="" disabled>Please choose</option>
                  <option value="Around the clock">Around the clock</option>
                  <option value="Daytime">Daytime</option>
                  <option value="Nights">Nights</option>
                  <option value="Not sure yet">Not sure yet</option>
                </select>
              </div>
              {error ? (
                <p role="alert" className="text-base font-bold text-destructive">{error}</p>
              ) : null}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? "Sending…" : "Send care request"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
