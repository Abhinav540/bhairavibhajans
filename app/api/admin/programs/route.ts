import { requireAdminUser } from "@/lib/auth";
import { isISODate } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";

const PROGRAM_STATUSES = ["booked", "confirmed", "completed", "cancelled"];
const PROGRAM_TYPES = ["temple_festival", "wedding", "concert", "religious", "corporate", "private", "other"];

interface ProgramPayload {
  id?: string;
  title: string;
  description: string | null;
  program_type: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  status: string;
  image: string | null;
}

function parseProgramBody(body: Record<string, unknown>): { ok: false; error: string } | { ok: true; payload: ProgramPayload } {
  const { id, title, description, program_type, date, start_time, end_time, location, status, image } = body;

  if (typeof title !== "string" || !title.trim()) {
    return { ok: false, error: "Title is required." };
  }
  if (typeof date !== "string" || !isISODate(date)) {
    return { ok: false, error: "A valid date (YYYY-MM-DD) is required." };
  }
  if (status && !PROGRAM_STATUSES.includes(status as string)) {
    return { ok: false, error: "Invalid status." };
  }

  return {
    ok: true,
    payload: {
      ...(typeof id === "string" ? { id } : {}),
      title: title.trim(),
      description: typeof description === "string" ? description.trim() || null : null,
      program_type: PROGRAM_TYPES.includes(program_type as string) ? (program_type as string) : null,
      date,
      start_time: typeof start_time === "string" && start_time.trim() ? start_time.trim() : null,
      end_time: typeof end_time === "string" && end_time.trim() ? end_time.trim() : null,
      location: typeof location === "string" && location.trim() ? location.trim() : null,
      status: (status as string) || "booked",
      image: typeof image === "string" && image.trim() ? image.trim() : null,
    },
  };
}

export async function POST(request: Request) {
  await requireAdminUser();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseProgramBody(body);
  if (!parsed.ok) return Response.json({ error: parsed.error }, { status: 400 });
  const payload = parsed.payload;

  const supabase = createAdminClient();
  const { data, error: dbError } = await supabase
    .from("programs")
    .insert(payload)
    .select()
    .single();

  if (dbError) {
    console.error("create program:", dbError.message);
    return Response.json({ error: "Could not create the program." }, { status: 500 });
  }

  return Response.json({ program: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  await requireAdminUser();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.id !== "string" || !body.id) {
    return Response.json({ error: "Program id is required." }, { status: 400 });
  }

  const parsedUpdate = parseProgramBody(body);
  if (!parsedUpdate.ok) return Response.json({ error: parsedUpdate.error }, { status: 400 });
  const { id: _dropId, ...updates } = parsedUpdate.payload;
  void _dropId;

  const supabase = createAdminClient();
  const { data, error: dbError } = await supabase
    .from("programs")
    .update(updates)
    .eq("id", body.id)
    .select()
    .single();

  if (dbError) {
    console.error("update program:", dbError.message);
    return Response.json({ error: "Could not update the program." }, { status: 500 });
  }

  return Response.json({ program: data });
}

export async function DELETE(request: Request) {
  await requireAdminUser();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.id !== "string" || !body.id) {
    return Response.json({ error: "Program id is required." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("programs").delete().eq("id", body.id);

  if (error) {
    console.error("delete program:", error.message);
    return Response.json({ error: "Could not delete the program." }, { status: 500 });
  }

  return Response.json({ ok: true });
}