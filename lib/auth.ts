import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Makes sure a logged-in admin is calling. Redirects to the login page
 * otherwise. Falls back to the `ADMIN_ALLOWED_EMAIL` env var when set;
 * otherwise an entry in the `admin_users` table is required.
 */
export async function requireAdminUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const email = user.email?.trim().toLowerCase();
  const allowed = process.env.ADMIN_ALLOWED_EMAIL?.trim().toLowerCase();

  if (allowed) {
    if (email && email === allowed) return user;
    redirect("/admin/login");
  }

  if (!email) redirect("/admin/login");
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_users")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (!data) redirect("/admin/login");

  return user;
}