import type { BookingStatus } from "@/lib/database.types";
import { contactToEmail, sendResendEmail } from "@/lib/mail";
import { getServiceSupabase } from "@/lib/supabase.server";

const SITE_URL =
  process.env["SITE_URL"] ?? "https://www.gracefieldliveincare.com";

type StatusEmail = {
  subject: string;
  text: string;
};

function emailForStatus(status: BookingStatus, firstName: string): StatusEmail | null {
  const name = firstName || "there";
  const accountLink = `${SITE_URL}/account`;

  if (status === "assigned") {
    return {
      subject: "A carer has been assigned to your care request",
      text: `Hello ${name},\n\nGood news — a carer has been assigned to your care request. Log in to see their details.\n\n${accountLink}\n\nWith care,\nGracefield Living in Care`,
    };
  }

  if (status === "active") {
    return {
      subject: "Your live-in care has started",
      text: `Hello ${name},\n\nYour live-in care has started.\n\nYou can see how things stand any time in your account:\n${accountLink}\n\nWith care,\nGracefield Living in Care`,
    };
  }

  if (status === "completed") {
    return {
      subject: "Your care period has ended",
      text: `Hello ${name},\n\nYour care period has ended. You can now leave a review for your carer.\n\n${accountLink}\n\nWith care,\nGracefield Living in Care`,
    };
  }

  return null;
}

async function clientEmailAndName(clientId: string): Promise<{ email: string; name: string } | null> {
  const supabase = getServiceSupabase();
  const [{ data: userData, error: userError }, { data: client }] = await Promise.all([
    supabase.auth.admin.getUserById(clientId),
    supabase.from("clients").select("full_name").eq("id", clientId).maybeSingle(),
  ]);

  if (userError || !userData.user?.email) return null;

  const fullName = client?.full_name?.trim() ?? "";
  return {
    email: userData.user.email,
    name: fullName.split(" ")[0] || fullName,
  };
}

export async function sendBookingStatusEmail(options: {
  clientId: string;
  status: BookingStatus;
  previousStatus: BookingStatus;
}): Promise<void> {
  if (options.status === options.previousStatus) return;

  const content = emailForStatus(options.status, "");
  if (!content) return;

  const recipient = await clientEmailAndName(options.clientId);
  if (!recipient) {
    console.warn("Could not find a client email for booking status update.");
    return;
  }

  const email = emailForStatus(options.status, recipient.name);
  if (!email) return;

  await sendResendEmail({
    to: recipient.email,
    replyTo: contactToEmail(),
    subject: email.subject,
    text: email.text,
  });
}
