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
 * Never import this file from a route or component — only from *.functions.ts.
 */
export function getServiceSupabase(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(
      required("SUPABASE_URL"),
      required("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
  }
  return serviceClient;
}

export function requireAdminPasscode(passcode: string): void {
  const expected = process.env["ADMIN_PASSCODE"] ?? process.env["VITE_ADMIN_PASSCODE"];
  if (!expected) {
    throw new Error("Admin passcode is not configured on the server.");
  }
  if (passcode !== expected) {
    throw new Error("That password did not work. Please try again.");
  }
}
