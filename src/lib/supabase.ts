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

function rawMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error ?? "");
}

export function publicErrorMessage(error: unknown, fallback: string): string {
  const message = rawMessage(error);
  const lower = message.toLowerCase();
  if (
    lower.includes("load failed") ||
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("fetch failed") ||
    lower.includes("typeerror") ||
    lower.includes("enotfound") ||
    lower.includes("name or service not known")
  ) {
    return "We could not load this just now. Please wait a moment and try again.";
  }
  if (!message || message === "undefined" || message === "[object Object]") {
    return fallback;
  }
  return message;
}

export function authErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = String((error as { message: unknown }).message);
    const lower = message.toLowerCase();
    if (
      lower.includes("load failed") ||
      lower.includes("failed to fetch") ||
      lower.includes("networkerror") ||
      lower.includes("network request failed") ||
      lower.includes("fetch failed") ||
      lower.includes("typeerror")
    ) {
      return "We could not reach the sign-in service. Check your connection and try again. If you just created an account, wait a moment, then sign in on gracefieldliveincare.com.";
    }
    if (lower.includes("email not confirmed")) {
      return "Check your email and tap the confirmation link, then try again.";
    }
    if (lower.includes("invalid login")) {
      return "That email or password did not work. If you just created an account, check your email for a confirmation link first.";
    }
    if (lower.includes("already registered")) {
      return "That email already has an account. Sign in instead.";
    }
    if (lower.includes("provider is not enabled") || lower.includes("unsupported provider")) {
      return "Google sign-in is not switched on yet. Please use email and password, or try again shortly.";
    }
    if (lower.includes("redirect")) {
      return "Google could not send you back to Gracefield. Please try again, or sign in with email.";
    }
    return message;
  }
  return fallback;
}
