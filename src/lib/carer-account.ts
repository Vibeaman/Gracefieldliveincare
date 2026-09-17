import { randomBytes } from "node:crypto";

import { sendResendEmail } from "@/lib/mail";
import { getServiceSupabase } from "@/lib/supabase.server";
import { createCarerMailbox } from "@/lib/zoho-mail";
import type { MailboxStatus } from "@/lib/database.types";

const SITE_URL = (process.env["SITE_URL"] ?? "https://www.gracefieldliveincare.com").replace(
  /\/+$/,
  "",
);

export function randomPassword(): string {
  return `Gracefield-${randomBytes(8).toString("hex")}A1`;
}

type ProvisionResult = {
  carerId: string;
  workEmail: string | null;
  mailboxStatus: MailboxStatus;
  mailboxNote: string | null;
};

async function linkLoginToWorkEmail(options: {
  userId: string;
  workEmail: string;
  password: string;
  fullName: string;
}): Promise<void> {
  const supabase = getServiceSupabase();
  const { error } = await supabase.auth.admin.updateUserById(options.userId, {
    email: options.workEmail,
    password: options.password,
    email_confirm: true,
    user_metadata: { full_name: options.fullName },
    app_metadata: { role: "carer" },
  });
  if (error) throw new Error(error.message);
}

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

  let workEmail: string | null = existingCarer?.work_email ?? null;
  let mailboxStatus: MailboxStatus = (existingCarer?.mailbox_status as MailboxStatus) ?? "none";
  let mailboxNote: string | null = null;

  if (!(mailboxStatus === "created" && workEmail)) {
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

  const loginEmail = workEmail ?? application.email;
  let userId = existingCarer?.user_id as string | null | undefined;

  if (!userId) {
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: loginEmail,
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
      const match = listed.users.find((user) => {
        const email = user.email?.toLowerCase() ?? "";
        return email === loginEmail.toLowerCase() || email === application.email.toLowerCase();
      });
      if (!match) {
        throw new Error(
          "That email already has an account, but we could not attach it to this carer.",
        );
      }
      await linkLoginToWorkEmail({
        userId: match.id,
        workEmail: loginEmail,
        password,
        fullName: application.full_name,
      });
      userId = match.id;
    } else {
      userId = created.user.id;
    }

    const { error: linkError } = await supabase
      .from("carers")
      .update({ user_id: userId })
      .eq("id", carerId);
    if (linkError) throw new Error(linkError.message);
  } else if (workEmail) {
    await linkLoginToWorkEmail({
      userId,
      workEmail,
      password,
      fullName: application.full_name,
    });
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
  ];

  if (workEmail && mailboxStatus === "created") {
    lines.push(
      "Use your Gracefield work email to sign in. The same details open your work mailbox.",
      "",
      `Work email: ${workEmail}`,
      `Password: ${password}`,
      "",
      "Keep these details safe. This password does not change, and it is the only way to sign in.",
      "Open your work mailbox at https://mail.zoho.com",
    );
  } else {
    lines.push(
      `Email: ${loginEmail}`,
      `Password: ${password}`,
      "",
      "Keep these details safe. This password does not change.",
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
    mailboxNote = [mailboxNote, "The welcome email did not send."].filter(Boolean).join(" ");
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
    .select("id, name, work_email, mailbox_status, user_id, application_id")
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

    await linkLoginToWorkEmail({
      userId: carer.user_id,
      workEmail: mailbox.email,
      password,
      fullName: carer.name,
    });

    let notifyEmail = mailbox.email;
    if (carer.application_id) {
      const { data: application } = await supabase
        .from("applications")
        .select("email")
        .eq("id", carer.application_id)
        .maybeSingle();
      if (application?.email) notifyEmail = application.email;
    }
    await sendResendEmail({
      to: notifyEmail,
      subject: "Your Gracefield work email",
      text: [
        `Hello ${carer.name.split(" ")[0] || carer.name},`,
        "",
        "Your Gracefield work email is ready. Use it to sign in and to open your mailbox.",
        "",
        `Work email: ${mailbox.email}`,
        `Password: ${password}`,
        "",
        "Keep these details safe. This password does not change.",
        "Sign in at:",
        `${SITE_URL}/carer/login`,
        "Open your mailbox at https://mail.zoho.com",
        "",
        "With thanks,",
        "Gracefield Living in Care",
      ].join("\n"),
    });

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
