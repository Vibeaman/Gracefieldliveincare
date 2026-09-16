import { createFileRoute } from "@tanstack/react-router";
import { Plus, Upload } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

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
import { getAdminPasscode } from "@/lib/admin-session";
import {
  deleteAdminCarer,
  listAdminCarers,
  saveAdminCarer,
  uploadAdminPhoto,
} from "@/lib/admin.functions";
import type { Carer } from "@/lib/database.types";

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
  const [carers, setCarers] = useState<Carer[]>([]);
  const [removed, setRemoved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const rows = await listAdminCarers({ data: { passcode: getAdminPasscode() } });
      setCarers(rows);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load carers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (view.name === "add") {
    return (
      <CarerForm
        mode="add"
        onBack={() => setView({ name: "list" })}
        onSaved={async () => {
          await load();
          setView({ name: "list" });
        }}
      />
    );
  }

  if (view.name === "edit") {
    return (
      <CarerForm
        mode="edit"
        carer={view.carer}
        onBack={() => setView({ name: "list" })}
        onSaved={async () => {
          await load();
          setView({ name: "list" });
        }}
      />
    );
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
          <SavedNote>{removed} was removed.</SavedNote>
        </div>
      ) : null}

      {error ? <p role="alert" className="mt-6 text-lg font-bold text-destructive">{error}</p> : null}

      {loading ? (
        <p className="mt-6 text-lg text-muted-foreground">Loading…</p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {carers.map((carer) => (
            <li key={carer.id}>
              <AdminCard className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <PersonAvatar fullName={carer.name} photoUrl={carer.photo_url} />
                  <div className="min-w-0">
                    <p className="font-heading text-xl font-extrabold text-primary sm:text-2xl">
                      {carer.name}
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
                    carerName={carer.name}
                    onConfirm={async () => {
                      await deleteAdminCarer({
                        data: { passcode: getAdminPasscode(), id: carer.id },
                      });
                      setRemoved(carer.name);
                      await load();
                    }}
                  />
                </div>
              </AdminCard>
            </li>
          ))}
        </ul>
      )}
    </AdminScreen>
  );
}

function RemoveCarerButton({
  carerName,
  onConfirm,
}: {
  carerName: string;
  onConfirm: () => Promise<void>;
}) {
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
                void onConfirm();
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
  onSaved,
}: {
  mode: "add" | "edit";
  carer?: Carer;
  onBack: () => void;
  onSaved: () => Promise<void>;
}) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(carer?.photo_url || null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoName(file.name);
    setPhotoPreview(URL.createObjectURL(file));
    setSaved(false);
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? "");
        resolve(result.split(",")[1] ?? "");
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const passcode = getAdminPasscode();
      let photoUrl = carer?.photo_url ?? "";
      if (photoFile) {
        const uploaded = await uploadAdminPhoto({
          data: {
            passcode,
            fileName: photoFile.name,
            contentType: photoFile.type || "image/jpeg",
            base64: await fileToBase64(photoFile),
          },
        });
        photoUrl = uploaded.photo_url;
      }
      await saveAdminCarer({
        data: {
          passcode,
          id: carer?.id,
          name: String(form.get("full_name") ?? ""),
          bio: String(form.get("short_bio") ?? ""),
          specialty: String(form.get("specialty") ?? ""),
          photo_url: photoUrl,
        },
      });
      setSaved(true);
      await onSaved();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
      setBusy(false);
    }
  };

  return (
    <AdminScreen
      title={mode === "add" ? "Add a new carer" : `Edit ${carer?.name ?? "carer"}`}
      instruction="Fill in the carer's details below, then save."
      back={{ label: "Back to carers", onClick: onBack }}
    >
      <AdminCard>
        <form className="grid gap-6" onSubmit={(event) => void handleSubmit(event)}>
          <div>
            <FieldLabel htmlFor="carer-name">Name</FieldLabel>
            <input
              id="carer-name"
              name="full_name"
              type="text"
              required
              autoComplete="name"
              defaultValue={carer?.name ?? ""}
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
              defaultValue={carer?.bio ?? ""}
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

          {error ? <p role="alert" className="text-lg font-bold text-destructive">{error}</p> : null}

          <Button type="submit" size="lg" className="h-16 w-full text-lg" disabled={busy}>
            {busy ? "Saving…" : "Save carer"}
          </Button>

          {saved ? <SavedNote>Saved.</SavedNote> : null}
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
