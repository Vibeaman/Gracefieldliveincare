import { createFileRoute, Link } from "@tanstack/react-router";

import { PageIntro } from "@/components/gracefield";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: pageMeta(
      "Terms and Conditions | Gracefield Living in Care",
      "The terms for using the Gracefield Living in Care website, accounts and care requests.",
      { path: "/terms" },
    ),
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <>
      <PageIntro eyebrow="Terms" title="Terms and conditions">
        <p>
          These terms cover use of this website. Last updated 16 September 2026. Sending a care
          request through the site is not itself a care contract.
        </p>
      </PageIntro>
      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl space-y-10 text-lg leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Using this website</h2>
            <p className="mt-3">
              This site is for families looking for live-in care and for people who want to apply as
              carers. Please use it honestly and do not try to break or misuse it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Accounts</h2>
            <p className="mt-3">
              You are responsible for the email and password you use to sign in. Tell us if you think
              someone else has used your account. We may close an account if it is misused.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Care requests</h2>
            <p className="mt-3">
              A care request on this site is an enquiry. It does not start care on its own. Care only
              begins when Gracefield and the family have agreed the arrangement. Status on your
              account (Pending, Assigned, Active, Completed) is updated by our team as things happen
              in real life.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Carer applications</h2>
            <p className="mt-3">
              Sending an application does not mean you have a job. We review applications and may
              accept or say not right now. Information you send should be true and your own.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Reviews</h2>
            <p className="mt-3">
              If you leave a review after a care period, keep it fair and based on your experience.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Our content</h2>
            <p className="mt-3">
              The words, photos and design on this site belong to Gracefield Living in Care unless
              we say otherwise. Please do not copy them for your own site or business.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Liability</h2>
            <p className="mt-3">
              We take care to keep the site working, but we cannot promise it will always be
              available or free of mistakes. Nothing on this page limits any rights you have that
              cannot be limited by law.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Law</h2>
            <p className="mt-3">These terms are governed by the laws of England and Wales.</p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Contact</h2>
            <p className="mt-3">
              Questions about these terms:{" "}
              <a
                className="font-bold text-primary underline decoration-brand-gold underline-offset-4"
                href="mailto:gracefieldliveincare@gmail.com"
              >
                gracefieldliveincare@gmail.com
              </a>
              . See also our{" "}
              <Link
                to="/privacy"
                className="font-bold text-primary underline decoration-brand-gold underline-offset-4"
              >
                privacy policy
              </Link>
              .
            </p>
          </section>
        </div>
      </section>
    </>
  );
}
