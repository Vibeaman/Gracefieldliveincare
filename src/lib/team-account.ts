import { randomPassword } from "@/lib/carer-account";
import { sendResendEmail } from "@/lib/mail";
import { getServiceSupabase } from "@/lib/supabase.server";
import { createCarerMailbox, deleteCarerMailbox } from "@/lib/zoho-mail";
import type { MailboxStatus } from "@/lib/database.types";

const COMPANY_LOCAL_PARTS = ["gracefield.liveincare", "gracefieldliveincare"];

function mailboxHowTo(workEmail: string, password: string): string[] {
  return [
    "This is your Gracefield work mailbox. It is not a login for the admin page.",
    "",
    "How to open it:",
    "1. Go to https://mail.zoho.com",
    "2. Sign in with this work email and password:",
    `   ${workEmail}`,
    `   ${password}`,
    "3. If Zoho asks you to change the password, skip that and keep this one. It does not change.",
    "4. Your inbox is then ready. Use it for Gracefield work mail only.",
    "",
    "On a phone, you can also download the Zoho Mail app and sign in with the same details.",
  ];
}

export type TeamProvisionResult = {
  workEmail: string | null;
  mailboxStatus: MailboxStatus;
  mailboxNote: string | null;
};

async function takenLocalParts(exceptId: string): Promise<string[]> {
  const supabase = getServiceSupabase();
  const [{ data: teamRows }, { data: carerRows }] = await Promise.all([
    supabase.from("team_applications").select("work_email").not("work_email", "is", null).neq("id", exceptId),
    supabase.from("carers").select("work_email").not("work_email", "is", null),
  ]);
  const fromRows = [...(teamRows ?? []), ...(carerRows ?? [])]
    .map((row) => String(row.work_email ?? "").split("@")[0] ?? "")
    .filter(Boolean);
  return [...COMPANY_LOCAL_PARTS, ...fromRows];
}

export async function declineTeamApplication(application: {
  id: string;
  full_name: string;
  email: string;
}): Promise<void> {
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("team_applications")
    .update({ status: "declined" })
    .eq("id", application.id);
  if (error) throw new Error(error.message);

  const firstName = application.full_name.split(" ")[0] || application.full_name;
  await sendResendEmail({
    to: application.email,
    subject: "Your Gracefield office application",
    text: [
      `Hello ${firstName},`,
      "",
      "Thank you for applying to join the Gracefield office team.",
      "",
      "We are not taking this further right now. No mailbox has been created.",
      "You are welcome to apply again later.",
      "",
      "With thanks,",
      "Gracefield Living in Care",
    ].join("\n"),
  });
}

export async function provisionAcceptedTeamMember(application: {
  id: string;
  full_name: string;
  email: string;
}): Promise<TeamProvisionResult> {
  const supabase = getServiceSupabase();
  const { data: current, error: loadError } = await supabase
    .from("team_applications")
    .select("id, work_email, mailbox_status, status")
    .eq("id", application.id)
    .single();
  if (loadError) throw new Error(loadError.message);

  if (current.mailbox_status === "created" && current.work_email) {
    if (current.status !== "accepted") {
      await supabase.from("team_applications").update({ status: "accepted" }).eq("id", application.id);
    }
    return { workEmail: current.work_email, mailboxStatus: "created", mailboxNote: null };
  }

  const password = randomPassword();
  const mailbox = await createCarerMailbox({
    fullName: application.full_name,
    password,
    takenLocalParts: await takenLocalParts(application.id),
  });

  if (mailbox.status === "created") {
    const { error } = await supabase
      .from("team_applications")
      .update({
        status: "accepted",
        work_email: mailbox.email,
        mailbox_status: "created",
      })
      .eq("id", application.id);
    if (error) {
      const removed = await deleteCarerMailbox(mailbox.email);
      throw new Error(
        removed.status === "deleted"
          ? "The work mailbox was created, then removed, because the record could not be saved. Try again."
          : `The work mailbox ${mailbox.email} was created, but the record could not be saved. Remove that mailbox in Zoho before trying again.`,
      );
    }

    const firstName = application.full_name.split(" ")[0] || application.full_name;
    const emailed = await sendResendEmail({
      to: application.email,
      subject: "Your Gracefield work email",
      text: [
        `Hello ${firstName},`,
        "",
        "Welcome to the Gracefield office team. Your application has been accepted.",
        "",
        "Your work mailbox is ready. This is a real email address. It is not a login for the admin page.",
        "",
        `Work email: ${mailbox.email}`,
        `Password: ${password}`,
        "",
        "Keep these details safe. This password does not change.",
        "",
        ...mailboxHowTo(mailbox.email, password),
        "",
        "With thanks,",
        "Gracefield Living in Care",
      ].join("\n"),
    });

    return {
      workEmail: mailbox.email,
      mailboxStatus: "created",
      mailboxNote: emailed ? null : "The mailbox was created, but the welcome email did not send.",
    };
  }

  const mailboxStatus: MailboxStatus = mailbox.status === "skipped" ? "skipped" : "failed";
  const { error } = await supabase
    .from("team_applications")
    .update({ status: "accepted", mailbox_status: mailboxStatus })
    .eq("id", application.id);
  if (error) throw new Error(error.message);

  return {
    workEmail: null,
    mailboxStatus,
    mailboxNote:
      mailbox.reason ||
      "They are recorded, but the work mailbox was not created. You can try again.",
  };
}
