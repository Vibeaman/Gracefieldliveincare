import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const CONTACT_TO =
  process.env["CONTACT_TO_EMAIL"] ?? "gracefieldliveincare@gmail.com";
const FROM_EMAIL =
  process.env["RESEND_FROM_EMAIL"] ?? "Gracefield Living in Care <onboarding@resend.dev>";

const SUBJECT_LABELS = {
  care: "Live-in care for a family member",
  referral: "Referral",
  careers: "Careers / becoming a carer",
} as const;

const MIN_MS = 2500;

export const sendContactMessage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fullName: z.string().trim().min(1).max(200),
      email: z.string().trim().email().max(320),
      phone: z.string().trim().max(50),
      subject: z.enum(["care", "referral", "careers"]),
      message: z.string().trim().min(1).max(5000),
      company: z.string(),
      formStarted: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const started = Number(data.formStarted);
    const tooFast = !Number.isFinite(started) || started <= 0 || Date.now() - started < MIN_MS;
    if (data.company.trim() || tooFast) {
      return { ok: true as const };
    }

    const apiKey = process.env["RESEND_API_KEY"];
    if (!apiKey) {
      throw new Error("Message sending is not set up yet. Please email gracefieldliveincare@gmail.com.");
    }

    const topic = SUBJECT_LABELS[data.subject];
    const phoneLine = data.phone ? data.phone : "Not given";
    const text = [
      `New enquiry from the Gracefield website.`,
      "",
      `Name: ${data.fullName}`,
      `Email: ${data.email}`,
      `Phone: ${phoneLine}`,
      `About: ${topic}`,
      "",
      data.message,
    ].join("\n");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [CONTACT_TO],
        reply_to: data.email,
        subject: `Website enquiry: ${topic}`,
        text,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Contact email failed:", response.status, body);
      throw new Error("We could not send that message. Please email gracefieldliveincare@gmail.com or call us.");
    }

    return { ok: true as const };
  });
