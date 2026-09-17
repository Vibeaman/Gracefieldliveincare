import { Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState, type ComponentType, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { initials, type BookingStatus } from "@/lib/database.types";

/** Page heading plus the one-line instruction that sits under it. */
const backLinkClass =
  "inline-flex min-h-12 items-center gap-2 text-lg font-bold text-primary underline decoration-brand-gold underline-offset-4 hover:text-brand-gold";

export function AdminScreen({
  title,
  instruction,
  back,
  children,
}: {
  title: string;
  instruction: string;
  back?: {
    label: string;
    to?:
      | "/admin"
      | "/admin/bookings"
      | "/admin/carers"
      | "/admin/applications"
      | "/admin/enquiries"
      | "/admin/search"
      | "/admin/families";
    onClick?: () => void;
  };
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      {back?.onClick ? (
        <button type="button" onClick={back.onClick} className={backLinkClass}>
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          {back.label}
        </button>
      ) : back?.to ? (
        <Link to={back.to} className={backLinkClass}>
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          {back.label}
        </Link>
      ) : null}
      <h1
        className={cn(
          "font-heading text-3xl font-extrabold text-primary sm:text-4xl",
          back ? "mt-6" : "",
        )}
      >
        {title}
      </h1>
      <p className="mt-3 text-lg leading-relaxed text-muted-foreground sm:text-xl">{instruction}</p>
      <div className="mt-8 sm:mt-10">{children}</div>
    </div>
  );
}

/** Big tappable card used on the admin home screen. */
export function BigActionCard({
  to,
  title,
  description,
  icon: Icon,
}: {
  to:
    | "/admin/bookings"
    | "/admin/carers"
    | "/admin/applications"
    | "/admin/enquiries"
    | "/admin/search"
    | "/admin/families";
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <Link
      to={to}
      className="surface-card flex min-h-[8.5rem] items-center gap-5 rounded-2xl border border-border p-6 transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[10rem] sm:p-8"
    >
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground sm:h-20 sm:w-20">
        <Icon className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden={true} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-heading text-2xl font-extrabold text-primary sm:text-3xl">
          {title}
        </span>
        <span className="mt-1 block text-base text-muted-foreground sm:text-lg">{description}</span>
      </span>
      <ChevronRight className="h-7 w-7 shrink-0 text-brand-gold" aria-hidden="true" />
    </Link>
  );
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-brand-gold/20 text-accent-foreground border-brand-gold/50",
  assigned: "bg-secondary text-primary border-border",
  active: "bg-primary text-primary-foreground border-primary",
  completed: "bg-muted text-muted-foreground border-border",
};

/** Plain colored label for a booking status. */
export function StatusLabel({ status, label }: { status: BookingStatus; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-4 py-1.5 text-base font-bold",
        STATUS_STYLES[status],
      )}
    >
      {label}
    </span>
  );
}

/** Photo if we have one, initials if we don't. */
export function PersonAvatar({
  fullName,
  photoUrl,
  size = "md",
}: {
  fullName: string;
  photoUrl: string;
  size?: "md" | "lg";
}) {
  const sizeClasses = size === "lg" ? "h-24 w-24 text-2xl" : "h-16 w-16 text-xl";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`Photo of ${fullName}`}
        className={cn("shrink-0 rounded-full border border-border object-cover", sizeClasses)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-secondary font-heading font-extrabold text-primary",
        sizeClasses,
      )}
    >
      {initials(fullName)}
    </span>
  );
}

/** White card used for list rows and detail panels. */
export function AdminCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("surface-card rounded-2xl border border-border p-6 sm:p-8", className)}>
      {children}
    </div>
  );
}

/** A full-width row that opens a detail view when tapped. */
export function TapRow({
  onClick,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  children: ReactNode;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="surface-card flex w-full min-h-[6rem] items-center gap-4 rounded-2xl border border-border p-5 text-left transition-colors hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-5 sm:p-6"
    >
      {children}
      <ChevronRight className="h-6 w-6 shrink-0 text-brand-gold" aria-hidden="true" />
    </button>
  );
}

/** Label above a form field, sized for easy reading. */
export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-lg font-bold text-primary">
      {children}
    </label>
  );
}

export const fieldClasses =
  "mt-2 h-14 w-full rounded-xl border border-input bg-background px-4 text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const textareaClasses =
  "mt-2 min-h-32 w-full rounded-xl border border-input bg-background px-4 py-3 text-lg text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Short confirmation banner shown after a save. Placeholder until Supabase is wired. */
export function SavedNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="rounded-xl border border-primary/30 bg-secondary px-5 py-4 text-lg font-bold text-primary"
    >
      {children}
    </p>
  );
}

/** Read-only pair of label and value used in detail views. */
export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <p className="text-base font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg text-foreground">{value}</p>
    </div>
  );
}

/** Confirm before deleting a booking, application or enquiry. */
export function ConfirmRemoveButton({
  label,
  title,
  description,
  confirmLabel,
  cancelLabel = "No, keep it",
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-16 w-full text-lg"
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md rounded-2xl p-7">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl font-extrabold text-primary">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-muted-foreground">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex-col gap-3 sm:flex-col">
            <AlertDialogAction
              className="h-16 w-full text-lg"
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                setBusy(true);
                void onConfirm().finally(() => {
                  setBusy(false);
                  setOpen(false);
                });
              }}
            >
              {busy ? "Removing…" : confirmLabel}
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 h-16 w-full text-lg" disabled={busy}>
              {cancelLabel}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
