const ACCOUNTS_URL = process.env["ZOHO_ACCOUNTS_URL"] ?? "https://accounts.zoho.com";
const MAIL_API_URL = process.env["ZOHO_MAIL_API_URL"] ?? "https://mail.zoho.com";

function zohoEnv(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function isZohoConfigured(): boolean {
  return Boolean(
    zohoEnv("ZOHO_CLIENT_ID") &&
      zohoEnv("ZOHO_CLIENT_SECRET") &&
      zohoEnv("ZOHO_REFRESH_TOKEN") &&
      zohoEnv("ZOHO_ZOID"),
  );
}

async function getAccessToken(): Promise<string> {
  const clientId = zohoEnv("ZOHO_CLIENT_ID");
  const clientSecret = zohoEnv("ZOHO_CLIENT_SECRET");
  const refreshToken = zohoEnv("ZOHO_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Zoho is not connected yet.");
  }

  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
  });

  const response = await fetch(`${ACCOUNTS_URL}/oauth/v2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = (await response.json()) as { access_token?: string; error?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error || "Could not get a Zoho access token.");
  }
  return payload.access_token;
}

export function mailboxLocalPart(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? "carer";
  const cleaned = first.toLowerCase().replace(/[^a-z0-9]/g, "");
  return cleaned || "carer";
}

export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Carer", lastName: "Gracefield" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "Gracefield" };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

export type MailboxResult =
  | { status: "created"; email: string }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

export async function createCarerMailbox(options: {
  fullName: string;
  password: string;
  takenLocalParts: string[];
}): Promise<MailboxResult> {
  if (!isZohoConfigured()) {
    return {
      status: "skipped",
      reason: "Zoho is not connected yet. The app account was still created.",
    };
  }

  const zoid = zohoEnv("ZOHO_ZOID");
  if (!zoid) {
    return { status: "skipped", reason: "Zoho organisation id is missing." };
  }

  let token: string;
  try {
    token = await getAccessToken();
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Could not sign in to Zoho.",
    };
  }

  const { firstName, lastName } = splitName(options.fullName);
  const base = mailboxLocalPart(options.fullName);
  const taken = new Set(options.takenLocalParts.map((part) => part.toLowerCase()));

  const candidates: string[] = [base];
  for (let index = 2; index <= 20; index += 1) {
    candidates.push(`${base}${index}`);
  }

  let lastError = "Could not create that mailbox.";
  for (const localPart of candidates) {
    if (taken.has(localPart)) continue;
    const email = `${localPart}@gracefieldliveincare.com`;
    const response = await fetch(`${MAIL_API_URL}/api/organization/${zoid}/accounts`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Zoho-oauthtoken ${token}`,
      },
      body: JSON.stringify({
        primaryEmailAddress: email,
        password: options.password,
        firstName,
        lastName,
        displayName: options.fullName,
        oneTimePassword: true,
        role: "member",
      }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      status?: { description?: string; code?: number };
      data?: unknown;
    };
    if (response.ok) {
      return { status: "created", email };
    }
    lastError = payload.status?.description || `Zoho said no (${response.status}).`;
    const lower = lastError.toLowerCase();
    if (lower.includes("exist") || lower.includes("already")) {
      taken.add(localPart);
      continue;
    }
    return { status: "failed", reason: lastError };
  }

  return { status: "failed", reason: lastError };
}

const COMPANY_MAILBOX = "gracefield.liveincare@gracefieldliveincare.com";

export type DeleteMailboxResult =
  | { status: "deleted" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; reason: string };

type ZohoAccount = {
  primaryEmailAddress?: string;
  zuid?: number | string;
};

async function listOrganisationAccounts(
  token: string,
  zoid: string,
): Promise<ZohoAccount[]> {
  const response = await fetch(`${MAIL_API_URL}/api/organization/${zoid}/accounts`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Zoho-oauthtoken ${token}`,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    data?: ZohoAccount[] | ZohoAccount;
    status?: { description?: string };
  };
  if (!response.ok) {
    throw new Error(payload.status?.description || "Could not read Zoho mailboxes.");
  }
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data) return [payload.data];
  return [];
}

function findAccount(accounts: ZohoAccount[], email: string): ZohoAccount | undefined {
  return accounts.find(
    (account) => (account.primaryEmailAddress ?? "").trim().toLowerCase() === email,
  );
}

async function requestMailboxDelete(
  token: string,
  zoid: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; reason: string }> {
  const response = await fetch(`${MAIL_API_URL}/api/organization/${zoid}/accounts`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Zoho-oauthtoken ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    status?: { description?: string; code?: number };
  };
  const reason = payload.status?.description || `Zoho said no (${response.status}).`;
  return { ok: response.ok, reason };
}

export async function deleteCarerMailbox(email: string): Promise<DeleteMailboxResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { status: "skipped", reason: "No work email on this carer." };
  }
  if (trimmed === COMPANY_MAILBOX) {
    return { status: "skipped", reason: "The company mailbox is never deleted." };
  }
  if (!isZohoConfigured()) {
    return { status: "skipped", reason: "Zoho is not connected yet." };
  }

  const zoid = zohoEnv("ZOHO_ZOID");
  if (!zoid) {
    return { status: "skipped", reason: "Zoho organisation id is missing." };
  }

  let token: string;
  try {
    token = await getAccessToken();
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Could not sign in to Zoho.",
    };
  }

  let accounts: ZohoAccount[];
  try {
    accounts = await listOrganisationAccounts(token, zoid);
  } catch (error) {
    return {
      status: "failed",
      reason: error instanceof Error ? error.message : "Could not read Zoho mailboxes.",
    };
  }

  const existing = findAccount(accounts, trimmed);
  if (!existing) {
    return { status: "deleted" };
  }

  const first = await requestMailboxDelete(token, zoid, { emailList: [trimmed] });
  accounts = await listOrganisationAccounts(token, zoid);
  if (!findAccount(accounts, trimmed)) {
    return { status: "deleted" };
  }

  if (existing.zuid) {
    const second = await requestMailboxDelete(token, zoid, {
      accountList: [String(existing.zuid)],
    });
    accounts = await listOrganisationAccounts(token, zoid);
    if (!findAccount(accounts, trimmed)) {
      return { status: "deleted" };
    }
    return {
      status: "failed",
      reason: second.reason || first.reason || "Zoho still has that mailbox.",
    };
  }

  return {
    status: "failed",
    reason: first.reason || "Zoho still has that mailbox.",
  };
}
