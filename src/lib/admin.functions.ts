import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getServiceSupabase, requireAdminPasscode } from "@/lib/supabase.server";
import type { AdminBooking, Application, Carer } from "@/lib/database.types";

const passcodeSchema = z.object({
  passcode: z.string().min(1),
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
    if (error) throw new Error(error.message);
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
    const { error } = await supabase
      .from("bookings")
      .update({
        status: data.status,
        assigned_carer_id: data.assigned_carer_id,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listAdminCarers = createServerFn({ method: "POST" })
  .validator(passcodeSchema)
  .handler(async ({ data }): Promise<Carer[]> => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: rows, error } = await supabase
      .from("carers")
      .select("id, name, bio, photo_url, specialty, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
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
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("carers").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteAdminCarer = createServerFn({ method: "POST" })
  .validator(z.object({ passcode: z.string().min(1), id: z.string().uuid() }))
  .handler(async ({ data }) => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { error } = await supabase.from("carers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
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
        "id, full_name, email, phone, years_experience, availability, about, photo_url, status, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
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
      .select("id, full_name, about, photo_url, years_experience")
      .eq("id", data.id)
      .single();
    if (loadError) throw new Error(loadError.message);

    const { error: updateError } = await supabase
      .from("applications")
      .update({ status: data.decision })
      .eq("id", data.id);
    if (updateError) throw new Error(updateError.message);

    if (data.decision === "accepted") {
      const { error: insertError } = await supabase.from("carers").insert({
        name: application.full_name,
        bio: application.about,
        photo_url: application.photo_url,
        specialty: application.years_experience,
      });
      if (insertError) throw new Error(insertError.message);
    }

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
    if (error) throw new Error(error.message);
    const { data: publicUrl } = supabase.storage.from("photos").getPublicUrl(path);
    return { photo_url: publicUrl.publicUrl };
  });
