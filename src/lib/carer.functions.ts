import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { sendBookingStatusEmail } from "@/lib/booking-emails";
import { getServiceSupabase } from "@/lib/supabase.server";

export const signCarerDocument = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string().uuid(), documentId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const supabase = getServiceSupabase();
    const { data: carer, error: carerError } = await supabase
      .from("carers")
      .select("id, application_id")
      .eq("user_id", data.userId)
      .maybeSingle();
    if (carerError) throw new Error(carerError.message);
    if (!carer) throw new Error("We could not find your carer account.");

    const { data: document, error: documentError } = await supabase
      .from("application_documents")
      .select("id, storage_path, file_name, application_id, carer_id")
      .eq("id", data.documentId)
      .single();
    if (documentError) throw new Error(documentError.message);

    const owns =
      document.carer_id === carer.id ||
      (carer.application_id && document.application_id === carer.application_id);
    if (!owns) throw new Error("That document is not yours.");

    const { data: signed, error: signedError } = await supabase.storage
      .from("carer-documents")
      .createSignedUrl(document.storage_path, 120);
    if (signedError) throw new Error(signedError.message);
    return { url: signed.signedUrl, fileName: document.file_name };
  });

export const completeCarerBooking = createServerFn({ method: "POST" })
  .validator(z.object({ userId: z.string().uuid(), bookingId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const supabase = getServiceSupabase();
    const { data: carer, error: carerError } = await supabase
      .from("carers")
      .select("id")
      .eq("user_id", data.userId)
      .maybeSingle();
    if (carerError) throw new Error(carerError.message);
    if (!carer) throw new Error("We could not find your carer account.");

    const { data: booking, error: loadError } = await supabase
      .from("bookings")
      .select("id, client_id, status, assigned_carer_id")
      .eq("id", data.bookingId)
      .single();
    if (loadError) throw new Error(loadError.message);
    if (booking.assigned_carer_id !== carer.id) {
      throw new Error("That booking is not yours.");
    }
    if (booking.status === "completed") return { ok: true as const };
    if (booking.status !== "assigned" && booking.status !== "active") {
      throw new Error("That booking cannot be marked complete yet.");
    }

    const previousStatus = booking.status;
    const { error } = await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("id", data.bookingId);
    if (error) throw new Error(error.message);

    try {
      await sendBookingStatusEmail({
        clientId: booking.client_id,
        status: "completed",
        previousStatus,
      });
    } catch (emailError) {
      console.error("Booking status email failed:", emailError);
    }

    return { ok: true as const };
  });
