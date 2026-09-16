import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { contactToEmail, sendResendEmail } from "@/lib/mail";

const SITE_URL =
  process.env["SITE_URL"] ?? "https://www.gracefieldliveincare.com";

export const notifyNewApplication = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fullName: z.string().trim().min(1).max(200),
      email: z.string().trim().email().max(320),
      phone: z.string().trim().max(50),
      yearsExperience: z.string().trim().max(200),
      availability: z.string().trim().max(200),
    }),
  )
  .handler(async ({ data }) => {
    const text = [
      "A new live-in carer application has arrived.",
      "",
      `Name: ${data.fullName}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone || "Not given"}`,
      `Experience: ${data.yearsExperience || "Not given"}`,
      `Availability: ${data.availability || "Not given"}`,
      "",
      `Open applications: ${SITE_URL}/admin/applications`,
    ].join("\n");

    await sendResendEmail({
      to: contactToEmail(),
      replyTo: data.email,
      subject: `New carer application: ${data.fullName}`,
      text,
    });

    return { ok: true as const };
  });
