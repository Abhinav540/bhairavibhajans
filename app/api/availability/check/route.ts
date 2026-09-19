import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { isISODate } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Public, read-only endpoint used by the booking form to check whether a
 * single date is open before sending the visitor on to WhatsApp. Mirrors
 * the same rule the admin/public calendar used: a date is unavailable if
 * it's explicitly blocked, or if a non-cancelled program already exists
 * on it. Uses the anon-key client (same data the old public calendar
 * already showed to everyone) — never the service-role client.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !isISODate(date)) {
    return Response.json({ error: "A valid date (YYYY-MM-DD) is required." }, { status: 400 });
  }

  if (!hasSupabaseEnv()) {
    // Can't verify — don't block a genuine booking attempt over a config gap.
    return Response.json({ available: true });
  }

  const supabase = await createClient();
  const [{ data: programs, error: programsError }, { data: blocked, error: blockedError }] = await Promise.all([
    supabase.from("programs").select("id").eq("date", date).neq("status", "cancelled").limit(1),
    supabase.from("availability").select("id").eq("date", date).eq("status", "blocked").limit(1),
  ]);

  if (programsError || blockedError) {
    console.error("availability check:", programsError?.message || blockedError?.message);
    return Response.json({ error: "Could not check availability. Please try again." }, { status: 500 });
  }

  const available = (programs?.length ?? 0) === 0 && (blocked?.length ?? 0) === 0;
  return Response.json({ available });
}
