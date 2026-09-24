import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { provisionAcceptedCarer, retryCarerMailbox } from "@/lib/carer-account";
import { deleteCarerMailbox } from "@/lib/zoho-mail";
import { sendBookingStatusEmail } from "@/lib/booking-emails";
import { getServiceSupabase, publicServerError, requireAdminPasscode } from "@/lib/supabase.server";
import type {
  AdminBooking,
  AdminClient,
  Application,
  ApplicationDocument,
  BookingStatus,
  Carer,
  Enquiry,
} from "@/lib/database.types";

const passcodeSchema = z.object({
  passcode: z.string().min(1),
});

/** Unlock check only — does not touch Supabase. */
export const verifyAdminPasscode = createServerFn({ method: "POST" })
  .validator(passcodeSchema)
  .handler(async ({ data }): Promise<{ ok: true }> => {
    requireAdminPasscode(data.passcode);
    return { ok: true };
  });

export const listAdminBookings = createServerFn({ method: "POST" })
  .validator(passcodeSchema)
  .handler(async ({ data }): Promise<AdminBooking[]> => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: rows, error } = await supabase
      .from("bookings")
      .select(
        "id, client_id, care_type, location, start_date, hours, status, assigned_carer_id, created_at, clients ( id, full_name, phone ), carers ( id, name )",
      )
      .order("created_at", { ascending: false });
    if (error) throw publicServerError(error, "Could not load that.");
    return (rows ?? []).map((row) => {
      const clientRel = Array.isArray(row.clients) ? row.clients[0] : row.clients;
      const carerRel = Array.isArray(row.carers) ? row.carers[0] : row.carers;
      return {
        id: row.id,
        client_id: row.client_id,
        care_type: row.care_type,
        location: row.location,
        start_date: row.start_date,
        hours: row.hours,
        status: row.status,
        assigned_carer_id: row.assigned_carer_id,
        created_at: row.created_at,
        client: clientRel ?? null,
        carer: carerRel ?? null,
      };
    });
  });

export const updateAdminBooking = createServerFn({ method: "POST" })
  .validator(
    z.object({
      passcode: z.string().min(1),
      id: z.string().uuid(),
      status: z.enum(["pending", "assigned", "active", "completed"]),
      assigned_carer_id: z.string().uuid().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: current, error: loadError } = await supabase
      .from("bookings")
      .select("id, client_id, status")
      .eq("id", data.id)
      .single();
    if (loadError) throw publicServerError(loadError, "Could not load that.");

    const { error } = await supabase
      .from("bookings")
      .update({
        status: data.status,
        assigned_carer_id: data.assigned_carer_id,
      })
      .eq("id", data.id);
    if (error) throw publicServerError(error, "Could not load that.");

    const previousStatus = current.status as BookingStatus;
    if (previousStatus !== data.status) {
      try {
        await sendBookingStatusEmail({
          clientId: current.client_id,
          status: data.status,
          previousStatus,
        });
      } catch (emailError) {
        console.error("Booking status email failed:", emailError);
      }
    }

    return { ok: true as const };
  });

export const deleteAdminBooking = createServerFn({ method: "POST" })
  .validator(z.object({ passcode: z.string().min(1), id: z.string().uuid() }))
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { error } = await supabase.from("bookings").delete().eq("id", data.id);
    if (error) throw publicServerError(error, "Could not load that.");
    return { ok: true as const };
  });

export const listAdminCarers = createServerFn({ method: "POST" })
  .validator(passcodeSchema)
  .handler(async ({ data }): Promise<Carer[]> => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: rows, error } = await supabase
      .from("carers")
      .select("id, user_id, application_id, name, bio, photo_url, specialty, work_email, mailbox_status, created_at")
      .order("created_at", { ascending: false });
    if (error) throw publicServerError(error, "Could not load that.");
    return (rows ?? []).map((row) => ({
      id: row.id,
      user_id: row.user_id ?? null,
      application_id: row.application_id ?? null,
      name: row.name,
      bio: row.bio,
      photo_url: row.photo_url,
      specialty: row.specialty,
      work_email: row.work_email ?? null,
      mailbox_status: (row.mailbox_status ?? "none") as Carer["mailbox_status"],
      created_at: row.created_at,
    }));
  });

export const saveAdminCarer = createServerFn({ method: "POST" })
  .validator(
    z.object({
      passcode: z.string().min(1),
      id: z.string().uuid().optional(),
      name: z.string().min(1),
      bio: z.string(),
      specialty: z.string(),
      photo_url: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const payload = {
      name: data.name,
      bio: data.bio,
      specialty: data.specialty,
      photo_url: data.photo_url,
    };
    if (data.id) {
      const { error } = await supabase.from("carers").update(payload).eq("id", data.id);
      if (error) throw publicServerError(error, "Could not load that.");
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("carers").insert(payload).select("id").single();
    if (error) throw publicServerError(error, "Could not load that.");
    return { id: row.id as string };
  });

export const deleteAdminCarer = createServerFn({ method: "POST" })
  .validator(z.object({ passcode: z.string().min(1), id: z.string().uuid() }))
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: carer, error: loadError } = await supabase
      .from("carers")
      .select("id, user_id, work_email")
      .eq("id", data.id)
      .single();
    if (loadError) throw publicServerError(loadError, "Could not load that.");

    let mailboxNote: string | null = null;
    if (carer.work_email) {
      const mailbox = await deleteCarerMailbox(carer.work_email);
      if (mailbox.status === "failed") {
        throw new Error(
          `Could not delete the work email, so this carer was not removed. ${mailbox.reason}`,
        );
      }
      if (mailbox.status === "skipped") {
        throw new Error(
          `Could not delete the work email, so this carer was not removed. ${mailbox.reason}`,
        );
      }
    }

    if (carer.user_id) {
      const { error: userError } = await supabase.auth.admin.deleteUser(carer.user_id);
      if (userError) {
        const gone =
          userError.message.toLowerCase().includes("not found") ||
          userError.message.toLowerCase().includes("does not exist");
        if (!gone) {
          throw new Error(
            `The work email was deleted, but the login could not be removed. ${userError.message}`,
          );
        }
      }
    }

    const { error } = await supabase.from("carers").delete().eq("id", data.id);
    if (error) throw publicServerError(error, "Could not load that.");
    return { ok: true as const, mailboxNote };
  });

export const listAdminEnquiries = createServerFn({ method: "POST" })
  .validator(passcodeSchema)
  .handler(async ({ data }): Promise<Enquiry[]> => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: rows, error } = await supabase
      .from("enquiries")
      .select("id, full_name, email, phone, subject, message, created_at")
      .order("created_at", { ascending: false });
    if (error) throw publicServerError(error, "Could not load that.");
    return rows ?? [];
  });

export const deleteAdminEnquiry = createServerFn({ method: "POST" })
  .validator(z.object({ passcode: z.string().min(1), id: z.string().uuid() }))
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { error } = await supabase.from("enquiries").delete().eq("id", data.id);
    if (error) throw publicServerError(error, "Could not load that.");
    return { ok: true as const };
  });

export const listAdminApplications = createServerFn({ method: "POST" })
  .validator(passcodeSchema)
  .handler(async ({ data }): Promise<Application[]> => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: rows, error } = await supabase
      .from("applications")
      .select(
        "id, full_name, email, phone, years_experience, availability, about, photo_url, status, created_at, application_documents ( id, application_id, carer_id, doc_type, file_name, storage_path, content_type, status, created_at )",
      )
      .order("created_at", { ascending: false });
    if (error) throw publicServerError(error, "Could not load that.");
    return (rows ?? []).map((row) => {
      const documents = Array.isArray(row.application_documents)
        ? row.application_documents
        : row.application_documents
          ? [row.application_documents]
          : [];
      return {
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        years_experience: row.years_experience,
        availability: row.availability,
        about: row.about,
        photo_url: row.photo_url,
        status: row.status,
        created_at: row.created_at,
        documents: documents as ApplicationDocument[],
      };
    });
  });

export const decideAdminApplication = createServerFn({ method: "POST" })
  .validator(
    z.object({
      passcode: z.string().min(1),
      id: z.string().uuid(),
      decision: z.enum(["accepted", "declined"]),
    }),
  )
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: application, error: loadError } = await supabase
      .from("applications")
      .select("id, full_name, email, about, photo_url, years_experience, status")
      .eq("id", data.id)
      .single();
    if (loadError) throw publicServerError(loadError, "Could not load that.");

    if (data.decision === "declined") {
      const { error: updateError } = await supabase
        .from("applications")
        .update({ status: "declined" })
        .eq("id", data.id);
      if (updateError) throw publicServerError(updateError, "Could not save that.");
      return { ok: true as const, mailboxStatus: "none" as const, mailboxNote: null };
    }

    if (application.status === "accepted") {
      return { ok: true as const, mailboxStatus: "none" as const, mailboxNote: null };
    }

    const provisioned = await provisionAcceptedCarer(application);

    const { error: updateError } = await supabase
      .from("applications")
      .update({ status: "accepted" })
      .eq("id", data.id);
    if (updateError) throw publicServerError(updateError, "Could not save that.");

    return {
      ok: true as const,
      mailboxStatus: provisioned.mailboxStatus,
      mailboxNote: provisioned.mailboxNote,
    };
  });

export const deleteAdminApplication = createServerFn({ method: "POST" })
  .validator(z.object({ passcode: z.string().min(1), id: z.string().uuid() }))
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { error } = await supabase.from("applications").delete().eq("id", data.id);
    if (error) throw publicServerError(error, "Could not load that.");
    return { ok: true as const };
  });

export const uploadAdminPhoto = createServerFn({ method: "POST" })
  .validator(
    z.object({
      passcode: z.string().min(1),
      fileName: z.string().min(1),
      contentType: z.string().min(1),
      base64: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const extension = data.fileName.split(".").pop()?.toLowerCase() || "jpg";
    const path = `carers/${crypto.randomUUID()}.${extension}`;
    const bytes = Uint8Array.from(atob(data.base64), (char) => char.charCodeAt(0));
    const { error } = await supabase.storage.from("photos").upload(path, bytes, {
      contentType: data.contentType,
      upsert: false,
    });
    if (error) throw publicServerError(error, "Could not load that.");
    const { data: publicUrl } = supabase.storage.from("photos").getPublicUrl(path);
    return { photo_url: publicUrl.publicUrl };
  });

export const signAdminDocument = createServerFn({ method: "POST" })
  .validator(z.object({ passcode: z.string().min(1), documentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: document, error } = await supabase
      .from("application_documents")
      .select("storage_path, file_name")
      .eq("id", data.documentId)
      .single();
    if (error) throw publicServerError(error, "Could not load that.");
    const { data: signed, error: signedError } = await supabase.storage
      .from("carer-documents")
      .createSignedUrl(document.storage_path, 120);
    if (signedError) throw publicServerError(signedError, "Could not open that document.");
    return { url: signed.signedUrl, fileName: document.file_name };
  });

export const updateAdminDocumentStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      passcode: z.string().min(1),
      documentId: z.string().uuid(),
      status: z.enum(["uploaded", "reviewed", "verified"]),
    }),
  )
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { error } = await supabase
      .from("application_documents")
      .update({ status: data.status })
      .eq("id", data.documentId);
    if (error) throw publicServerError(error, "Could not load that.");
    return { ok: true as const };
  });

export const retryAdminMailbox = createServerFn({ method: "POST" })
  .validator(z.object({ passcode: z.string().min(1), carerId: z.string().uuid() }))
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    return retryCarerMailbox(data.carerId);
  });

export const listAdminClients = createServerFn({ method: "POST" })
  .validator(passcodeSchema)
  .handler(async ({ data }): Promise<AdminClient[]> => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: rows, error } = await supabase
      .from("clients")
      .select("id, full_name, phone, created_at")
      .order("created_at", { ascending: false });
    if (error) throw publicServerError(error, "Could not load that.");

    const { data: bookingRows, error: bookingError } = await supabase
      .from("bookings")
      .select("client_id");
    if (bookingError) throw publicServerError(bookingError, "Could not search.");
    const booked = new Set((bookingRows ?? []).map((row) => row.client_id));

    const clients: AdminClient[] = [];
    for (const row of rows ?? []) {
      const { data: user } = await supabase.auth.admin.getUserById(row.id);
      clients.push({
        id: row.id,
        full_name: row.full_name,
        email: user.user?.email ?? "",
        phone: row.phone,
        created_at: row.created_at,
        has_booking: booked.has(row.id),
      });
    }
    return clients;
  });

export const deleteAdminClient = createServerFn({ method: "POST" })
  .validator(
    z.object({
      passcode: z.string().min(1),
      id: z.string().uuid().optional(),
      email: z.string().email().optional(),
    }),
  )
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const targetEmail = data.email?.trim().toLowerCase();
    let userId = data.id;

    if (!userId && targetEmail) {
      let page = 1;
      while (!userId && page <= 20) {
        const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
          page,
          perPage: 200,
        });
        if (listError) throw publicServerError(listError, "Could not find that account.");
        const users = listed.users ?? [];
        const match = users.find(
          (user) => (user.email ?? "").trim().toLowerCase() === targetEmail,
        );
        userId = match?.id;
        if (users.length < 200) break;
        page += 1;
      }
    }

    if (!userId) {
      throw new Error("No family account was found for that email.");
    }

    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw publicServerError(error, "Could not remove that account.");
    return { ok: true as const };
  });

export const searchAdminRecords = createServerFn({ method: "POST" })
  .validator(z.object({ passcode: z.string().min(1), query: z.string().trim().min(1).max(80) }))
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const safe = data.query.replace(/[,.()%]/g, " ").replace(/\s+/g, " ").trim();
    if (!safe) return { carers: [], bookings: [] };
    const needle = `%${safe}%`;

    const [{ data: carers, error: carerError }, { data: bookings, error: bookingError }] =
      await Promise.all([
        supabase
          .from("carers")
          .select("id, name, work_email, mailbox_status")
          .or(`name.ilike.${needle},work_email.ilike.${needle}`)
          .limit(20),
        supabase
          .from("bookings")
          .select("id, care_type, location, start_date, status, clients ( full_name )")
          .or(`care_type.ilike.${needle},location.ilike.${needle}`)
          .limit(20),
      ]);
    if (carerError) throw publicServerError(carerError, "Could not search.");
    if (bookingError) throw publicServerError(bookingError, "Could not search.");

    const { data: namedClients } = await supabase
      .from("clients")
      .select("id, full_name")
      .ilike("full_name", needle)
      .limit(20);
    const clientIds = (namedClients ?? []).map((row) => row.id);
    let extraBookings: typeof bookings = [];
    if (clientIds.length) {
      const { data: byClient, error: byClientError } = await supabase
        .from("bookings")
        .select("id, care_type, location, start_date, status, clients ( full_name )")
        .in("client_id", clientIds)
        .limit(20);
      if (byClientError) throw publicServerError(byClientError, "Could not search.");
      extraBookings = byClient ?? [];
    }

    const seen = new Set<string>();
    const bookingHits = [...(bookings ?? []), ...extraBookings].filter((row) => {
      if (seen.has(row.id)) return false;
      seen.add(row.id);
      return true;
    });

    return {
      carers: carers ?? [],
      bookings: bookingHits.map((row) => {
        const clientRel = Array.isArray(row.clients) ? row.clients[0] : row.clients;
        return {
          id: row.id,
          care_type: row.care_type,
          location: row.location,
          start_date: row.start_date,
          status: row.status as BookingStatus,
          client_name: clientRel?.full_name ?? "Family",
        };
      }),
    };
  });
