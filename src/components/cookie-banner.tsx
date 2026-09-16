import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const CONSENT_KEY = "gracefield-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(CONSENT_KEY);
      if (stored !== "accepted" && stored !== "necessary") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (value: "accepted" | "necessary") => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Ignore storage errors; the banner can show again next visit.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-text"
      className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6"
    >
      <div className="surface-card mx-auto max-w-3xl rounded-2xl border border-border p-5 sm:p-7">
        <h2 id="cookie-banner-title" className="font-heading text-xl font-extrabold text-primary sm:text-2xl">
          Cookies on this site
        </h2>
        <p id="cookie-banner-text" className="mt-3 text-base leading-relaxed text-muted-foreground">
          We use cookies and similar storage so you can stay signed in and so the site works. We do
          not use advertising cookies. Read more in our{" "}
          <Link
            to="/privacy"
            className="font-bold text-primary underline decoration-brand-gold underline-offset-4"
          >
            privacy policy
          </Link>
          .
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" size="lg" className="w-full sm:w-auto" onClick={() => choose("accepted")}>
            That's fine
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => choose("necessary")}
          >
            Only what's needed
          </Button>
        </div>
      </div>
    </div>
  );
}
