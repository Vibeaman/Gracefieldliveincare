import { randomBytes } from "node:crypto";

import { sendResendEmail } from "@/lib/mail";
import { getServiceSupabase } from "@/lib/supabase.server";
import { createCarerMailbox } from "@/lib/zoho-mail";
import type { MailboxStatus } from "@/lib/database.types";

const SITE_URL = process.env["SITE_URL"] ?? "https://www.gracefieldliveincare.com";

export function randomPassword(): string {
  return `Gracefield-${randomBytes(8).toString("hex")}A1`;
}

type ProvisionResult = {
  carerId: string;
  workEmail: string | null;
  mailboxStatus: MailboxStatus;
  mailboxNote: string | null;
};

export async function provisionAcceptedCarer(application: {
  id: string;
  full_name: string;
  email: string;
  about: string;
  photo_url: string;
  years_experience: string;
}): Promise<ProvisionResult> {
  const supabase = getServiceSupabase();
  const password = randomPassword();

  const { data: existingCarer } = await supabase
    .from("carers")
    .select("id, user_id, work_email, mailbox_status")
    .eq("application_id", application.id)
    .maybeSingle();

  let carerId = existingCarer?.id as string | undefined;
  if (!carerId) {
    const { data: inserted, error: insertError } = await supabase
      .from("carers")
      .insert({
        name: application.full_name,
        bio: application.about,
        photo_url: application.photo_url,
        specialty: application.years_experience,
        application_id: application.id,
        mailbox_status: "none",
      })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);
    carerId = inserted.id as string;
  }

  await supabase
    .from("application_documents")
    .update({ carer_id: carerId })
    .eq("application_id", application.id);

  let userId = existingCarer?.user_id as string | null | undefined;
  let createdLogin = false;
  if (!userId) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: application.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: application.full_name },
      app_metadata: { role: "carer" },
    });

    if (createError) {
      const already =
        createError.message.toLowerCase().includes("already") ||
        createError.message.toLowerCase().includes("registered") ||
        createError.message.toLowerCase().includes("exists");
      if (!already) throw new Error(createError.message);

      const { data: listed } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
      const match = listed.users.find(
        (user) => user.email?.toLowerCase() === application.email.toLowerCase(),
      );
      if (!match) {
        throw new Error(
          "That email already has an account, but we could not attach it to this carer.",
        );
      }
      await supabase.auth.admin.updateUserById(match.id, {
        app_metadata: { ...(match.app_metadata ?? {}), role: "carer" },
        password,
      });
      userId = match.id;
      createdLogin = true;
    } else {
      userId = created.user.id;
      createdLogin = true;
    }

    const { error: linkError } = await supabase
      .from("carers")
      .update({ user_id: userId })
      .eq("id", carerId);
    if (linkError) throw new Error(linkError.message);
  }

  let workEmail: string | null = existingCarer?.work_email ?? null;
  let mailboxStatus: MailboxStatus = (existingCarer?.mailbox_status as MailboxStatus) ?? "none";
  let mailboxNote: string | null = null;

  if (mailboxStatus === "created" && workEmail) {
    mailboxNote = null;
  } else {
    const { data: takenRows } = await supabase
      .from("carers")
      .select("work_email")
      .not("work_email", "is", null);

    const takenLocalParts = (takenRows ?? [])
      .map((row) => String(row.work_email ?? "").split("@")[0] ?? "")
      .filter(Boolean);

    const mailbox = await createCarerMailbox({
      fullName: application.full_name,
      password,
      takenLocalParts,
    });

    if (mailbox.status === "created") {
      workEmail = mailbox.email;
      mailboxStatus = "created";
    } else if (mailbox.status === "skipped") {
      mailboxStatus = "skipped";
      mailboxNote = mailbox.reason;
    } else {
      mailboxStatus = "failed";
      mailboxNote = mailbox.reason;
    }

    await supabase
      .from("carers")
      .update({ work_email: workEmail, mailbox_status: mailboxStatus })
      .eq("id", carerId);
  }

  const firstName = application.full_name.split(" ")[0] || application.full_name;
  const lines = [
    `Hello ${firstName},`,
    "",
    "Welcome to Gracefield Living in Care. Your application has been accepted.",
    "",
    "Sign in here to see the families you are looking after:",
    `${SITE_URL}/carer/login`,
    "",
    `Email: ${application.email}`,
  ];

  if (createdLogin) {
    lines.push(`Password: ${password}`, "", "Please change this password after you first sign in.");
  } else {
    lines.push("", "Use the password you already have. If you need a new one, tap Forgot password on the sign-in page.");
  }

  if (mailboxStatus === "created" && workEmail) {
    lines.push(
      "",
      "Your Gracefield work email is also ready:",
      workEmail,
      `Password: ${password}`,
      "Open it at https://mail.zoho.com",
    );
  } else {
    lines.push(
      "",
      "Your work email is being set up. We will send it separately if it is not in this message.",
    );
  }

  lines.push("", "With thanks,", "Gracefield Living in Care");

  const emailed = await sendResendEmail({
    to: application.email,
    subject: "Your Gracefield carer account",
    text: lines.join("\n"),
  });
  if (!emailed) {
    const extra = createdLogin
      ? "The login was created, but the welcome email did not send. Ask them to use Forgot password."
      : "The welcome email did not send.";
    mailboxNote = [mailboxNote, extra].filter(Boolean).join(" ");
  }

  return { carerId, workEmail, mailboxStatus, mailboxNote };
}

export async function retryCarerMailbox(carerId: string): Promise<{
  workEmail: string | null;
  mailboxStatus: MailboxStatus;
  mailboxNote: string | null;
}> {
  const supabase = getServiceSupabase();
  const { data: carer, error } = await supabase
    .from("carers")
    .select("id, name, work_email, mailbox_status, user_id")
    .eq("id", carerId)
    .single();
  if (error) throw new Error(error.message);
  if (!carer.user_id) {
    throw new Error("This carer does not have a login yet. Accept their application first.");
  }
  if (carer.mailbox_status === "created" && carer.work_email) {
    return {
      workEmail: carer.work_email,
      mailboxStatus: "created",
      mailboxNote: null,
    };
  }

  const password = randomPassword();
  const { data: takenRows } = await supabase
    .from("carers")
    .select("work_email")
    .not("work_email", "is", null)
    .neq("id", carerId);

  const mailbox = await createCarerMailbox({
    fullName: carer.name,
    password,
    takenLocalParts: (takenRows ?? [])
      .map((row) => String(row.work_email ?? "").split("@")[0] ?? "")
      .filter(Boolean),
  });

  if (mailbox.status === "created") {
    await supabase
      .from("carers")
      .update({ work_email: mailbox.email, mailbox_status: "created" })
      .eq("id", carerId);

    const { data: user } = await supabase.auth.admin.getUserById(carer.user_id);
    const to = user.user?.email;
    if (to) {
      await sendResendEmail({
        to,
        subject: "Your Gracefield work email",
        text: [
          `Hello ${carer.name.split(" ")[0] || carer.name},`,
          "",
          "Your Gracefield work email is ready:",
          mailbox.email,
          `Password: ${password}`,
          "Open it at https://mail.zoho.com",
          "",
          "Your carer login password has not changed.",
          "",
          "With thanks,",
          "Gracefield Living in Care",
        ].join("\n"),
      });
    }

    return { workEmail: mailbox.email, mailboxStatus: "created", mailboxNote: null };
  }

  const mailboxStatus: MailboxStatus = mailbox.status === "skipped" ? "skipped" : "failed";
  await supabase.from("carers").update({ mailbox_status: mailboxStatus }).eq("id", carerId);
  return {
    workEmail: carer.work_email,
    mailboxStatus,
    mailboxNote: mailbox.reason,
  };
}
