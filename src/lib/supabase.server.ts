import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Add it in Vercel environment variables.`);
  }
  return value;
}

let serviceClient: SupabaseClient | undefined;

/**
 * Service-role client for admin writes. Bypasses RLS.
 * Never import this file from a route or component, only from *.functions.ts.
 */
export function getServiceSupabase(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(
      required("SUPABASE_URL"),
      required("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: async (input, init) => {
            try {
              return await fetch(input, init);
            } catch (error) {
              throw publicServerError(
                error,
                "We could not load this just now. Please wait a moment and try again.",
              );
            }
          },
        },
      },
    );
  }
  return serviceClient;
}

export function publicServerError(error: unknown, fallback: string): Error {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const lower = message.toLowerCase();
  if (
    lower.includes("fetch failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("enotfound") ||
    lower.includes("name or service not known") ||
    lower.includes("typeerror")
  ) {
    return new Error("We could not load this just now. Please wait a moment and try again.");
  }
  return new Error(message || fallback);
}

export function requireAdminPasscode(passcode: string): void {
  const expected = process.env["ADMIN_PASSCODE"];
  if (!expected) {
    throw new Error("Admin passcode is not configured on the server.");
  }
  if (passcode !== expected) {
    throw new Error("That password did not work. Please try again.");
  }
}
