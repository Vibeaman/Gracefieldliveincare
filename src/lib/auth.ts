import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

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

export async function ensureClientProfile(fullName?: string) {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    if (fullName) {
      await supabase.from("clients").update({ full_name: fullName }).eq("id", user.id);
    }
    return;
  }

  await supabase.from("clients").insert({
    id: user.id,
    full_name:
      fullName ||
      (typeof user.user_metadata["full_name"] === "string"
        ? user.user_metadata["full_name"]
        : "") ||
      (typeof user.user_metadata["name"] === "string" ? user.user_metadata["name"] : "") ||
      "",
  });
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
