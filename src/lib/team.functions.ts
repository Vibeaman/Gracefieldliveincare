import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { contactToEmail, sendResendEmail } from "@/lib/mail";
import { getServiceSupabase, publicServerError, requireAdminPasscode } from "@/lib/supabase.server";
import { declineTeamApplication, provisionAcceptedTeamMember } from "@/lib/team-account";
import type { MailboxStatus, TeamApplication, TeamApplicationStatus } from "@/lib/database.types";

const SITE_URL = (process.env["SITE_URL"] ?? "https://www.gracefieldliveincare.com").replace(
  /\/+$/,
  "",
);

export const notifyNewTeamApplication = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fullName: z.string().trim().min(1).max(200),
      email: z.string().trim().email().max(320),
      phone: z.string().trim().max(50),
      job: z.string().trim().min(1).max(200),
    }),
  )
  .handler(async ({ data }) => {
    await sendResendEmail({
      to: contactToEmail(),
      replyTo: data.email,
      subject: `New office application: ${data.fullName}`,
      text: [
        "Someone wants to join the office team.",
        "",
        `Name: ${data.fullName}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone || "Not given"}`,
        `Job: ${data.job}`,
        "",
        `Open Team: ${SITE_URL}/admin/team`,
      ].join("\n"),
    });
    return { ok: true as const };
  });

export const listAdminTeamApplications = createServerFn({ method: "POST" })
  .validator(z.object({ passcode: z.string().min(1) }))
  .handler(async ({ data }): Promise<TeamApplication[]> => {
    requireAdminPasscode(data.passcode);
    const supabase = getServiceSupabase();
    const { data: rows, error } = await supabase
      .from("team_applications")
      .select(
        "id, full_name, email, phone, job, about, status, work_email, mailbox_status, created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw publicServerError(error, "Could not load that.");
    return (rows ?? []).map((row) => ({
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      job: row.job,
      about: row.about,
      status: row.status as TeamApplicationStatus,
      work_email: row.work_email,
      mailbox_status: (row.mailbox_status ?? "none") as MailboxStatus,
      created_at: row.created_at,
    }));
  });

export const decideAdminTeamApplication = createServerFn({ method: "POST" })
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
    const { data: application, error } = await supabase
      .from("team_applications")
      .select("id, full_name, email, status, work_email, mailbox_status")
      .eq("id", data.id)
      .single();
    if (error) throw publicServerError(error, "Could not load that.");

    if (data.decision === "declined") {
      if (application.status === "accepted" || application.mailbox_status === "created") {
        throw new Error("This person already has a work mailbox. Decline is only for people still waiting.");
      }
      await declineTeamApplication(application);
      return { ok: true as const, mailboxStatus: "none" as const, mailboxNote: null, workEmail: null };
    }

    const provisioned = await provisionAcceptedTeamMember(application);
    return {
      ok: true as const,
      mailboxStatus: provisioned.mailboxStatus,
      mailboxNote: provisioned.mailboxNote,
      workEmail: provisioned.workEmail,
    };
  });
