import { createServerClient } from "@supabase/ssr";
import type { CookieMethodsServer } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database";

const ADMIN_LOGIN = "/admin/login";

export async function proxy(request: NextRequest) {
  // No Supabase configured yet — let the site run without auth so public
  // pages and the login screen still work until env vars are provided.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("[proxy] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing; admin auth disabled");
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const cookiesMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet, headersToSet) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
      supabaseResponse = NextResponse.next({ request });
      cookiesToSet.forEach(({ name, value, options }) =>
        supabaseResponse.cookies.set(name, value, options)
      );
      Object.entries(headersToSet).forEach(([key, value]) =>
        supabaseResponse.headers.set(key, value)
      );
    },
  };

  // Client construction can throw synchronously (e.g. a malformed
  // NEXT_PUBLIC_SUPABASE_URL value) — same as `getUser()` failing, treat
  // that as "not authenticated" instead of crashing the whole middleware
  // invocation, which would otherwise take down every /admin/* request.
  let user: User | null = null;
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookiesMethods,
      }
    );
    const {
      data: { user: resolvedUser },
    } = await supabase.auth.getUser();
    user = resolvedUser;
  } catch (err) {
    console.warn("[proxy] Supabase client init or getUser failed:", err instanceof Error ? err.message : err);
  }

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === ADMIN_LOGIN;

  // Logged-in users visiting /admin/login are sent to the dashboard.
  if (isLoginPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Not logged in → send to login page.
  if (!isLoginPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Proxy runs on every matched request, including Next.js's own background
// route prefetches (see: node_modules/next/dist/docs/.../guides/authentication.md
// "Optimistic checks with Proxy" — prefetches fire in parallel with real
// navigations). Each run here calls Supabase's `getUser()`, a real network
// round-trip that can rotate the session's refresh token; concurrent calls
// from a real navigation plus its prefetches can race that rotation and
// flip the auth result request-to-request, which showed up as a redirect
// loop between /admin/login and /admin. `missing` excludes prefetch-only
// requests from ever reaching this file, so only real navigations run the
// check — the dashboard layout's own `requireAdminUser()` still verifies
// the session independently, so this doesn't weaken protection.
//
// This has to be written as a plain inline literal (no shared constant/
// spread) because Next.js statically parses the `matcher` export at build
// time rather than executing it.
export const config = {
  matcher: [
    {
      source: "/admin/:path*",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
    {
      source: "/admin",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};