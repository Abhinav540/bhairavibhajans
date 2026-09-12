import { requireAdminUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database";

type EnquiryUpdate = Database["public"]["Tables"]["enquiries"]["Update"];

const ENQUIRY_STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Negotiating",
  "Confirmed",
  "Completed",
  "Cancelled",
  "Lost",
];

interface EnquiriesRouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, ctx: EnquiriesRouteContext) {
  await requireAdminUser();
  const { id } = await ctx.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const updates: EnquiryUpdate = {};
  if (typeof body.status === "string") {
    if (!ENQUIRY_STATUSES.includes(body.status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (typeof body.notes === "string") {
    updates.notes = body.notes.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("enquiries")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("update enquiry:", error.message);
    return Response.json({ error: "Could not update the enquiry." }, { status: 500 });
  }

  return Response.json({ enquiry: data });
}

export async function DELETE(request: Request, ctx: EnquiriesRouteContext) {
  await requireAdminUser();
  const { id } = await ctx.params;

  const supabase = createAdminClient();
  const { error } = await supabase.from("enquiries").delete().eq("id", id);

  if (error) {
    console.error("delete enquiry:", error.message);
    return Response.json({ error: "Could not delete the enquiry." }, { status: 500 });
  }

  return Response.json({ ok: true });
}