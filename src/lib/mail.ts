const CONTACT_TO =
  process.env["CONTACT_TO_EMAIL"] ?? "gracefieldliveincare@gmail.com";
const FROM_EMAIL =
  process.env["RESEND_FROM_EMAIL"] ??
  "Gracefield Living in Care <hello@gracefieldliveincare.com>";

export function contactToEmail(): string {
  return CONTACT_TO;
}

export function fromEmail(): string {
  return FROM_EMAIL;
}

export async function sendResendEmail(options: {
  to: string | string[];
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set. Skipping email.");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      reply_to: options.replyTo,
      subject: options.subject,
      text: options.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Resend email failed:", response.status, body);
    return false;
  }

  return true;
}
