import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function requireBrowserEnv(): { url: string; anonKey: string } {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

let browserClient: SupabaseClient | undefined;

/** Shared browser client. Session is stored in localStorage by default. */
export function getSupabase(): SupabaseClient {
  if (!browserClient) {
    const { url, anonKey } = requireBrowserEnv();
    browserClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}

export function authErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    if (message.toLowerCase().includes("email not confirmed")) {
      return "Check your email and tap the confirmation link, then try again.";
    }
    if (message.toLowerCase().includes("invalid login")) {
      return "That email or password did not work. Please try again.";
    }
    if (message.toLowerCase().includes("already registered")) {
      return "That email already has an account. Sign in instead.";
    }
    return message;
  }
  return fallback;
}
