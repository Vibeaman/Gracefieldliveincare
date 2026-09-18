import { createFileRoute, Link } from "@tanstack/react-router";

import { PageIntro } from "@/components/gracefield";
import { pageMeta } from "@/lib/page-meta";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: pageMeta(
      "Privacy Policy | Gracefield Living in Care",
      "How Gracefield Living in Care collects, uses, shares and protects personal information.",
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
          This policy explains what personal information we collect, why we use it, who may process
          it for us, and the rights you have. Last updated 18 September 2026.
        </p>
      </PageIntro>

      <section className="px-5 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl space-y-10 text-lg leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Who we are</h2>
            <p className="mt-3">
              Gracefield Living in Care is responsible for the personal information described in
              this policy. Our address is 11 Blue Close, Workington, CA14 3FJ. Email{" "}
              <a
                className="font-bold text-primary underline decoration-brand-gold underline-offset-4"
                href="mailto:gracefield.liveincare@gracefieldliveincare.com"
              >
                gracefield.liveincare@gracefieldliveincare.com
              </a>
              ,{" "}
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
            <h2 className="font-heading text-2xl font-extrabold text-primary">Information we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>
                Contact and account details, including your name, email address, phone number,
                address, sign-in details and account identifier.
              </li>
              <li>
                Enquiries sent through our contact form, including the subject and message you send
                us.
              </li>
              <li>
                Care requests and bookings, including care type, location, preferred start date,
                hours, booking status, assigned carer and any review you choose to leave.
              </li>
              <li>
                Carer applications, including name, contact details, experience, availability,
                personal statement and photograph.
              </li>
              <li>
                Application and employment-related documents you upload, such as photo ID, proof of
                address, references, training certificates and DBS documents.
              </li>
              <li>
                Carer work-account information, including a Gracefield work email address, account
                status, assigned bookings and documents connected to the carer profile.
              </li>
              <li>
                Administrative records, such as application decisions, document-review status,
                booking updates and records of communications sent through the service.
              </li>
              <li>
                Technical information needed to keep the website secure and working, such as session
                data, cookie choices, browser information and basic error or security logs.
              </li>
            </ul>
            <p className="mt-4">
              Please only give us information that is relevant. Care enquiries may sometimes include
              health or other sensitive information. We use this only where necessary to discuss,
              arrange or provide suitable care and where data-protection law allows us to do so.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">How we collect it</h2>
            <p className="mt-3">
              We collect information directly from you when you create an account, sign in, contact
              us, request care, apply to work with us, upload documents or use your family or carer
              account. We may also receive information from someone acting for a person who needs
              care, from a referee, or from a sign-in provider if you choose that option.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">How and why we use it</h2>
            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>To respond to enquiries about care, referrals, cleaning, training or careers.</li>
              <li>To create and manage family, carer and work accounts.</li>
              <li>To review applications, references and supporting documents.</li>
              <li>To arrange care, manage bookings, assign carers and record booking progress.</li>
              <li>To send account, application, mailbox and booking-status messages.</li>
              <li>To protect the website, prevent misuse, diagnose errors and maintain records.</li>
              <li>To meet legal, safeguarding, regulatory and record-keeping duties.</li>
            </ul>
            <p className="mt-4">
              Our lawful reasons for using personal information may include taking steps before or
              performing a contract, complying with a legal obligation, protecting vital interests,
              and our legitimate interests in running a safe and effective care service. Where the
              law requires consent, you can withdraw it by contacting us. We do not sell personal
              information or use it for advertising.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Who may process it</h2>
            <p className="mt-3">
              We only share information where it is needed to provide the service, meet a legal duty
              or protect someone. This may include authorised Gracefield staff and carers, professional
              advisers, regulators, safeguarding bodies or emergency services when appropriate.
            </p>
            <p className="mt-3">
              Trusted service providers also process limited information for us. These include our
              website infrastructure, database and account provider, email-delivery provider, work
              email provider, and, if you choose to sign in with a third-party account, that sign-in
              provider. They may only use the information needed to perform their service for us.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">International processing</h2>
            <p className="mt-3">
              Some service providers may process information outside the United Kingdom. Where this
              happens, we require appropriate safeguards recognised by UK data-protection law, such as
              an adequacy decision or approved contractual protections.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Cookies and device storage</h2>
            <p className="mt-3">
              We use cookies and similar device storage to remember your cookie choice, keep you signed
              in and make the website work. We do not use advertising cookies. Choosing “Only what's
              needed” keeps only the storage required for essential features. You can clear cookies in
              your browser, although this may sign you out.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">How long we keep information</h2>
            <p className="mt-3">
              We keep information only for as long as it is needed for the purpose it was collected,
              to provide care, manage accounts and applications, resolve concerns, meet safeguarding
              or legal duties, and keep appropriate business records. Retention periods vary by record.
              When information is no longer needed, we delete it or make it anonymous. You may ask us
              to delete your information, although we may need to keep some records where the law or a
              safeguarding obligation requires it.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Security</h2>
            <p className="mt-3">
              We use access controls, private document storage, secure connections and restricted admin
              tools to protect personal information. Work accounts and mailboxes are removed when they
              are no longer required. No system can be guaranteed completely secure, so please keep
              passwords private and contact us promptly if you believe an account has been misused.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-extrabold text-primary">Your rights</h2>
            <p className="mt-3">
              Depending on the circumstances, you may ask us for a copy of your information, to correct
              it, delete it, restrict or object to its use, or transfer information you gave us. You may
              also withdraw consent where consent is the lawful basis. Contact us using the details
              above. We may need to confirm your identity before acting on a request.
            </p>
            <p className="mt-3">
              If you are unhappy with how we use your information, please contact us first so we can
              help. You can also complain to the Information Commissioner’s Office at{" "}
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
            <h2 className="font-heading text-2xl font-extrabold text-primary">Changes to this policy</h2>
            <p className="mt-3">
              We may update this policy when our services or legal duties change. The latest version
              will always appear on this page with its updated date.
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
