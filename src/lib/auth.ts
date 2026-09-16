import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";
import type { Client } from "@/lib/database.types";

export async function getSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await getSupabase().auth.getSession();
  if (error) return null;
  return data.session;
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function signUpWithEmail(email: string, password: string) {
  return getSupabase().auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/account`,
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return getSupabase().auth.signInWithPassword({ email, password });
}

export async function signInWithGoogle() {
  return getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/account`,
    },
  });
}

export async function signOut() {
  return getSupabase().auth.signOut();
}

export async function requestPasswordReset(email: string) {
  return getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export async function updatePassword(password: string) {
  return getSupabase().auth.updateUser({ password });
}

function nameFromUser(user: User): string {
  const metadata = user.user_metadata ?? {};
  if (typeof metadata["full_name"] === "string" && metadata["full_name"].trim()) {
    return metadata["full_name"].trim();
  }
  if (typeof metadata["name"] === "string" && metadata["name"].trim()) {
    return metadata["name"].trim();
  }
  return "";
}

export async function ensureClientProfile(fullName?: string) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("clients")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    if (fullName && !existing.full_name) {
      await supabase.from("clients").update({ full_name: fullName }).eq("id", user.id);
    }
    return;
  }

  await supabase.from("clients").insert({
    id: user.id,
    full_name: fullName || nameFromUser(user),
  });
}

export async function getClientProfile(): Promise<Client | null> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  await ensureClientProfile();

  const { data } = await supabase
    .from("clients")
    .select("id, full_name, phone, address, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return data ?? null;
}

export function isProfileComplete(client: Pick<Client, "full_name" | "phone"> | null): boolean {
  return Boolean(client?.full_name?.trim() && client?.phone?.trim());
}

export async function saveClientDetails(details: {
  full_name: string;
  phone: string;
  address?: string;
}) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in again.");

  await ensureClientProfile(details.full_name);
  const { error } = await supabase
    .from("clients")
    .update({
      full_name: details.full_name.trim(),
      phone: details.phone.trim(),
      address: details.address?.trim() || null,
    })
    .eq("id", user.id);
  if (error) throw error;
}

export async function uploadPublicPhoto(folder: "applications" | "carers", file: File) {
  const supabase = getSupabase();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  return data.publicUrl;
}
