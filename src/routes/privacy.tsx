import { createFileRoute, Link } from "@tanstack/react-router";

import { PageIntro } from "@/components/gracefield";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: pageMeta(
      "Privacy Policy | Gracefield Living in Care",
      "How Gracefield Living in Care collects, uses and looks after your personal information.",
      { path: "/privacy" },
    ),
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <>
      <PageIntro eyebrow="Privacy" title="Privacy policy">
        <p>
          This page explains what personal information we collect, why we use it, and the rights you
          have. Last updated 16 September 2026.
        </p>
      </PageIntro>
      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl space-y-10 text-lg leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Who we are</h2>
            <p className="mt-3">
              Gracefield Living in Care, 11 Blue Close, Workington, CA14 3FJ. Email{" "}
              <a
                className="font-bold text-primary underline decoration-brand-gold underline-offset-4"
                href="mailto:gracefieldliveincare@gmail.com"
              >
                gracefieldliveincare@gmail.com
              </a>{" "}
              or call{" "}
              <a
                className="font-bold text-primary underline decoration-brand-gold underline-offset-4"
                href="tel:+447584920625"
              >
                +44 7584 920625
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">What we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Account details: name, email, phone number and optional address.</li>
              <li>Care requests: the type of care, location, start date and hours of support.</li>
              <li>Carer applications: name, email, phone, experience, availability, a short message and a photo.</li>
              <li>Reviews you choose to leave after a care period ends.</li>
              <li>Technical details needed to run the site, such as a signed-in session.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">How we use it</h2>
            <p className="mt-3">
              We use this information to create your account, handle care requests, review carer
              applications, assign a carer, and keep you updated about your request. We do not sell
              your information.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Who we share it with</h2>
            <p className="mt-3">
              We use trusted services to run the website: hosting (Vercel), database and sign-in
              (Supabase), and email (Resend, when status emails are turned on). Google is used only
              if you choose “Continue with Google”. They only receive what they need to provide that
              service.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Cookies</h2>
            <p className="mt-3">
              We use cookies and similar storage so you can stay signed in and so the site works. We
              do not use advertising cookies. You can accept this or choose “Only what's needed” on
              the cookie banner. Signing in still needs a small amount of storage on your device.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">How long we keep it</h2>
            <p className="mt-3">
              We keep account and care-request information while you have an account and for as long
              as we need it to provide care or keep proper records. You can ask us to delete it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Your rights</h2>
            <p className="mt-3">
              You can ask to see the information we hold about you, have it corrected, or have it
              deleted (sometimes called the right to be forgotten). You can also ask us to stop using
              it in certain ways. Email us and we will help. If you are not happy with how we handle
              your information, you can contact the Information Commissioner’s Office at{" "}
              <a
                className="font-bold text-primary underline decoration-brand-gold underline-offset-4"
                href="https://ico.org.uk"
                target="_blank"
                rel="noopener noreferrer"
              >
                ico.org.uk
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Security</h2>
            <p className="mt-3">
              This site is served over HTTPS. Passwords and private keys are not stored in the public
              website code. Please keep your own password private.
            </p>
          </section>

          <p>
            See also our{" "}
            <Link
              to="/terms"
              className="font-bold text-primary underline decoration-brand-gold underline-offset-4"
            >
              terms and conditions
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
