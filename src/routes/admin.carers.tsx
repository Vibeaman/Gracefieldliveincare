import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload } from "lucide-react";
import { useState, type ChangeEvent, type FormEvent } from "react";

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
import {
  AdminCard,
  AdminScreen,
  FieldLabel,
  PersonAvatar,
  SavedNote,
  fieldClasses,
  textareaClasses,
} from "@/components/admin";
import { carers, type Carer } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/carers")({
  head: () => ({
    meta: [
      { title: "Carers | Gracefield admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCarersPage,
});

type View = { name: "list" } | { name: "add" } | { name: "edit"; carer: Carer };

function AdminCarersPage() {
  const [view, setView] = useState<View>({ name: "list" });
  const [removed, setRemoved] = useState<string | null>(null);

  if (view.name === "add") {
    return <CarerForm mode="add" onBack={() => setView({ name: "list" })} />;
  }

  if (view.name === "edit") {
    return <CarerForm mode="edit" carer={view.carer} onBack={() => setView({ name: "list" })} />;
  }

  return (
    <AdminScreen
      title="Carers"
      instruction="Add a new carer, or change someone who already works with you."
      back={{ label: "Back to home", to: "/admin" }}
    >
      <Button
        type="button"
        size="lg"
        className="h-16 w-full text-lg"
        onClick={() => setView({ name: "add" })}
      >
        <Plus aria-hidden="true" />
        Add a new carer
      </Button>

      {removed ? (
        <div className="mt-6">
          <SavedNote>
            {removed} was removed on screen only. This will be removed for real once the database is
            connected.
          </SavedNote>
        </div>
      ) : null}

      <ul className="mt-6 grid gap-4">
        {carers.map((carer) => (
          <li key={carer.id}>
            <AdminCard className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <PersonAvatar fullName={carer.full_name} photoUrl={carer.photo_url} />
                <div className="min-w-0">
                  <p className="font-heading text-xl font-extrabold text-primary sm:text-2xl">
                    {carer.full_name}
                  </p>
                  <p className="mt-1 text-base text-muted-foreground sm:text-lg">
                    {carer.specialty}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-14 w-full text-lg sm:w-auto"
                  onClick={() => setView({ name: "edit", carer })}
                >
                  Edit
                </Button>
                <RemoveCarerButton
                  carerName={carer.full_name}
                  onConfirm={() => setRemoved(carer.full_name)}
                />
              </div>
            </AdminCard>
          </li>
        ))}
      </ul>
    </AdminScreen>
  );
}

function RemoveCarerButton({ carerName, onConfirm }: { carerName: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-14 w-full text-lg sm:w-auto"
        onClick={() => setOpen(true)}
      >
        Remove
      </Button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md rounded-2xl p-7">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl font-extrabold text-primary">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-muted-foreground">
              This will take {carerName} off your list of carers. You can add them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex-col gap-3 sm:flex-col">
            <AlertDialogAction
              className="h-16 w-full text-lg"
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
            >
              Yes, remove {carerName}
            </AlertDialogAction>
            <AlertDialogCancel className="mt-0 h-16 w-full text-lg">
              No, keep them
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CarerForm({
  mode,
  carer,
  onBack,
}: {
  mode: "add" | "edit";
  carer?: Carer;
  onBack: () => void;
}) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(carer?.photo_url || null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    setPhotoPreview(URL.createObjectURL(file));
    setSaved(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <AdminScreen
      title={mode === "add" ? "Add a new carer" : `Edit ${carer?.full_name ?? "carer"}`}
      instruction="Fill in the carer's details below, then save."
      back={{ label: "Back to carers", to: "/admin/carers" }}
    >
      <AdminCard>
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div>
            <FieldLabel htmlFor="carer-name">Name</FieldLabel>
            <input
              id="carer-name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              defaultValue={carer?.full_name ?? ""}
              className={fieldClasses}
            />
          </div>

          <div>
            <FieldLabel htmlFor="carer-photo">Photo</FieldLabel>
            <p className="mt-1 text-base text-muted-foreground">
              A clear photo of their face is best.
            </p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild variant="outline" size="lg" className="h-14 w-full text-lg sm:w-auto">
                <label htmlFor="carer-photo" className="cursor-pointer">
                  <Upload aria-hidden="true" />
                  Choose a photo
                </label>
              </Button>
              <input
                id="carer-photo"
                name="photo"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
              />
              {photoPreview ? (
                <span className="flex items-center gap-3">
                  <img
                    src={photoPreview}
                    alt="The photo you chose"
                    className="h-16 w-16 rounded-full border border-border object-cover"
                  />
                  <span className="max-w-[12rem] truncate text-base text-muted-foreground">
                    {photoName ?? "Current photo"}
                  </span>
                </span>
              ) : (
                <span className="text-base text-muted-foreground">No photo chosen yet.</span>
              )}
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="carer-bio">Short bio</FieldLabel>
            <textarea
              id="carer-bio"
              name="short_bio"
              rows={4}
              required
              defaultValue={carer?.short_bio ?? ""}
              className={textareaClasses}
            />
          </div>

          <div>
            <FieldLabel htmlFor="carer-specialty">Specialty</FieldLabel>
            <input
              id="carer-specialty"
              name="specialty"
              type="text"
              required
              defaultValue={carer?.specialty ?? ""}
              className={fieldClasses}
            />
          </div>

          <Button type="submit" size="lg" className="h-16 w-full text-lg">
            Save carer
          </Button>

          {saved ? (
            <SavedNote>
              Saved on screen only. This will save for real once the database is connected.
            </SavedNote>
          ) : null}
        </form>
      </AdminCard>

      <Button
        variant="outline"
        size="lg"
        className="mt-6 h-16 w-full text-lg"
        onClick={onBack}
        type="button"
      >
        Back to carers
      </Button>
    </AdminScreen>
  );
}
