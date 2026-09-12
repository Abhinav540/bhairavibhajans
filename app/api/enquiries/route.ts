import { createAdminClient, hasAdminEnv } from "@/lib/supabase/admin";
import { isISODate } from "@/lib/format";

function normalizeEventType(type: string): string | null {
  const t = type.trim().toLowerCase().replace(/[\s-_]+/g, "_");
  if (!t) return null;
  return t;
}

export async function POST(request: Request) {
  if (!hasAdminEnv()) {
    return Response.json(
      { error: "Enquiries are not available yet. Please reach us on WhatsApp." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid form data." }, { status: 400 });
  }

  const { name, phone, email, event_type, event_date, event_location, message, source } = body;

  if (typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (typeof phone !== "string" || !/^[+\d][\d\s-]{6,15}$/.test(phone.trim())) {
    return Response.json({ error: "Please enter a valid phone number." }, { status: 400 });
  }
  if (email && typeof email === "string" && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (event_date && typeof event_date === "string" && !isISODate(event_date)) {
    return Response.json({ error: "Please choose a valid event date." }, { status: 400 });
  }

  const eventDate =
    typeof event_date === "string" && isISODate(event_date) ? event_date : null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      name: name.trim(),
      phone: phone.trim(),
      email: typeof email === "string" && email.trim() ? email.trim() : null,
      event_type: normalizeEventType(typeof event_type === "string" ? event_type : ""),
      event_date: eventDate,
      event_location: typeof event_location === "string" && event_location.trim() ? event_location.trim() : null,
      message: typeof message === "string" && message.trim() ? message.trim() : null,
      source: typeof source === "string" && source.trim() ? source.trim() : null,
      status: "New",
    })
    .select()
    .single();

  if (error) {
    console.error("create enquiry:", error.message);
    return Response.json(
      { error: "We couldn't save your enquiry right now. Please try again or reach us on WhatsApp." },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, enquiry: data }, { status: 201 });
}