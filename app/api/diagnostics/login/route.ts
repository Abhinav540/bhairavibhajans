export const dynamic = "force-dynamic";

interface LoginDiagnostics {
  configured: {
    url: boolean;
    anonKey: boolean;
    serviceRoleKey: boolean;
    adminAllowedEmail: boolean;
  };
  supabaseReachable: boolean | null;
  hint: string | null;
}

/**
 * Controlled diagnostic endpoint for the admin login flow.
 *
 * Returns ONLY booleans and a human-readable hint behind a known failure.
 * Never returns env var values, keys, tokens, cookies, or passwords.
 * No secrets are exposed to the caller.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";
  const adminAllowedEmail = process.env.ADMIN_ALLOWED_EMAIL?.trim() || "";

  const result: LoginDiagnostics = {
    configured: {
      url: Boolean(url),
      anonKey: Boolean(anonKey),
      serviceRoleKey: Boolean(serviceRoleKey),
      adminAllowedEmail: Boolean(adminAllowedEmail),
    },
    supabaseReachable: null,
    hint: null,
  };

  if (!url || !anonKey) {
    result.hint = "NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set on the server.";
    console.warn("[auth-diag] Supabase env vars missing on server", {
      url: Boolean(url),
      anonKey: Boolean(anonKey),
    });
    return Response.json(result);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: anonKey },
        signal: controller.signal,
      });
      result.supabaseReachable = res.ok;
      if (!res.ok) {
        result.hint = `Supabase auth endpoint responded with HTTP ${res.status}.`;
        console.warn("[auth-diag] Supabase health check non-2xx", { status: res.status });
      }
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    result.supabaseReachable = false;
    result.hint =
      err instanceof Error && err.name === "AbortError"
        ? "Supabase auth endpoint timed out."
        : "Supabase auth endpoint could not be reached.";
    console.warn("[auth-diag] Supabase health check failed", result.hint);
  }

  return Response.json(result);
}