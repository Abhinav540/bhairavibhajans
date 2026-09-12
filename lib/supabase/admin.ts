import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database";

let cached: ReturnType<typeof createSupabaseClient<Database>> | null = null;

/**
 * Server-only Supabase client using the service-role key.
 * Bypasses RLS — use ONLY inside server route handlers / server actions.
 * Never import this from a client component.
 */
export function hasAdminEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function createAdminClient() {
  if (cached) return cached;
  cached = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  return cached;
}