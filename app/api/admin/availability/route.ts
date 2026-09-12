import { requireAdminUser } from "@/lib/auth";
import { isISODate } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  await requireAdminUser();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { date, status, note } = body;
  if (typeof date !== "string" || !isISODate(date)) {
    return Response.json({ error: "A valid date is required." }, { status: 400 });
  }
  if (status !== "available" && status !== "blocked") {
    return Response.json({ error: "Status must be 'available' or 'blocked'." }, { status: 400 });
  }

  const supabase = createAdminClient();
  // Upsert — a date can only have one availability entry.
  const { data, error } = await supabase
    .from("availability")
    .upsert(
      {
        date,
        status,
        note: typeof note === "string" && note.trim() ? note.trim() : null,
      },
      { onConflict: "date" }
    )
    .select()
    .single();

  if (error) {
    console.error("upsert availability:", error.message);
    return Response.json({ error: "Could not update availability." }, { status: 500 });
  }

  return Response.json({ availability: data });
}

export async function DELETE(request: Request) {
  await requireAdminUser();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { date } = body;
  if (typeof date !== "string" || !isISODate(date)) {
    return Response.json({ error: "A valid date is required." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("availability").delete().eq("date", date);

  if (error) {
    console.error("delete availability:", error.message);
    return Response.json({ error: "Could not update availability." }, { status: 500 });
  }

  return Response.json({ ok: true });
}