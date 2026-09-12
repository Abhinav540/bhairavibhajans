import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  if (!hasSupabaseEnv()) {
    console.warn("[admin-auth] Supabase env vars missing on server; auth disabled");
    return null;
  }
  const supabase = await createClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.warn("[admin-auth] getUser failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

/**
 * Makes sure a logged-in admin is calling. Redirects to the login page
 * otherwise. Falls back to the `ADMIN_ALLOWED_EMAIL` env var when set;
 * otherwise an entry in the `admin_users` table is required.
 */
export async function requireAdminUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    console.warn("[admin-auth] access denied: no session");
    redirect("/admin/login");
  }

  const email = user.email?.trim().toLowerCase();
  const allowed = process.env.ADMIN_ALLOWED_EMAIL?.trim().toLowerCase();

  if (allowed) {
    if (email && email === allowed) return user;
    console.warn("[admin-auth] access denied: email does not match ADMIN_ALLOWED_EMAIL");
    redirect("/admin/login");
  }

  if (!email) {
    console.warn("[admin-auth] access denied: session has no email");
    redirect("/admin/login");
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_users")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (!data) {
    console.warn("[admin-auth] access denied: email not in admin_users table");
    redirect("/admin/login");
  }

  return user;
}