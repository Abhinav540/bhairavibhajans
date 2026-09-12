"use client";

let visitorId: string | null = null;

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  if (visitorId) return visitorId;
  try {
    const stored = window.localStorage.getItem("bb_visitor_id");
    if (stored) {
      visitorId = stored;
      return stored;
    }
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    window.localStorage.setItem("bb_visitor_id", id);
    visitorId = id;
    return id;
  } catch {
    return "";
  }
}

interface TrackWhatsAppOptions {
  page?: string;
  programId?: string | null;
}

export async function trackWhatsAppClick(opts: TrackWhatsAppOptions = {}) {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("whatsapp_clicks").insert({
      page: opts.page ?? (typeof window !== "undefined" ? window.location.pathname : null),
      program_id: opts.programId ?? null,
      visitor_id: getVisitorId(),
    });
  } catch {
    // Tracking must never block the user's navigation.
  }
}

export async function trackPageView(path: string, referrer: string | null, deviceType: string | null) {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("visitor_events").insert({
      path,
      referrer,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      device_type: deviceType,
      visitor_id: getVisitorId(),
    });
  } catch {
    // Tracking must never break the page.
  }
}