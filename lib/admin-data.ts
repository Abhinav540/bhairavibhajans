import { createAdminClient, hasAdminEnv } from "@/lib/supabase/admin";
import type {
  Availability,
  CrmSummary,
  Enquiry,
  Program,
  SeriesPoint,
  StatSummary,
  VisitorEvent,
  WhatsAppClick,
} from "@/lib/types";
import { fromISODate, todayISO } from "@/lib/format";

export type DateRange = "today" | "7d" | "30d" | "90d" | "year";

export function rangeStartISO(range: DateRange): string {
  const now = new Date();
  let start: Date;
  switch (range) {
    case "today":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case "7d":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
      break;
    case "30d":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
      break;
    case "90d":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
  }
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

function startOfToday(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

function startOfWeek(): string {
  const now = new Date();
  const diff = now.getDate() - now.getDay();
  const start = new Date(now.getFullYear(), now.getMonth(), diff);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

async function countRows(
  table: string,
  opts: { gte?: string } = {}
): Promise<number> {
  if (!hasAdminEnv()) return 0;
  const supabase = createAdminClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  if (opts.gte) query = query.gte("created_at", opts.gte);
  const { count, error } = await query;
  if (error) {
    console.error(`countRows(${table}):`, error.message);
    return 0;
  }
  return count ?? 0;
}

async function fetchAll<T>(table: string, select: string, gte?: string): Promise<T[]> {
  if (!hasAdminEnv()) return [];
  const supabase = createAdminClient();
  let query = supabase.from(table).select(select);
  if (gte) query = query.gte("created_at", gte);
  const { data, error } = await query;
  if (error) {
    console.error(`fetchAll(${table}):`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

interface Timestamped {
  created_at: string;
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function bucketSeries<T extends Timestamped>(items: T[], startISO: string): SeriesPoint[] {
  const start = fromISODate(startISO.slice(0, 10));
  const end = fromISODate(todayISO());
  const endTs = fromISODate(todayISO());
  if (!start || !end || !endTs) return [];

  const totalDays = Math.round((endTs.getTime() - start.getTime()) / 86400000);
  const bucketDays = totalDays > 31 ? 7 : 1;

  const map = new Map<string, number>();
  const cursor = new Date(start);
  while (cursor.getTime() <= endTs.getTime()) {
    map.set(localDateKey(cursor), 0);
    cursor.setDate(cursor.getDate() + bucketDays);
  }

  const bucketMs = bucketDays * 86400000;
  for (const item of items) {
    const d = new Date(item.created_at);
    const idx = Math.floor((d.getTime() - start.getTime()) / bucketMs);
    if (idx < 0) continue;
    const bucket = new Date(start.getTime() + idx * bucketMs);
    if (bucket.getTime() > endTs.getTime()) continue;
    const label = localDateKey(bucket);
    if (map.has(label)) map.set(label, map.get(label)! + 1);
  }

  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}

export async function getPrograms(): Promise<Program[]> {
  return fetchAll<Program>("programs", "*");
}

export async function getAvailability(): Promise<Availability[]> {
  return fetchAll<Availability>("availability", "*");
}

export async function getEnquiries(): Promise<Enquiry[]> {
  return fetchAll<Enquiry>("enquiries", "*");
}

export async function getCrmSummary(enquiries: Enquiry[]): Promise<CrmSummary> {
  const summary: CrmSummary = {
    New: 0,
    Contacted: 0,
    Interested: 0,
    Negotiating: 0,
    Confirmed: 0,
    Completed: 0,
    Cancelled: 0,
    Lost: 0,
  };
  for (const e of enquiries) {
    const key = e.status as keyof CrmSummary;
    if (key in summary) summary[key] += 1;
  }
  return summary;
}

export async function getDashboardSummary(): Promise<StatSummary> {
  const today = todayISO();
  const programs = await getPrograms();
  const enquiries = await getEnquiries();

  const [totalVisitors, todayVisitors, weekVisitors, monthVisitors, whatsappClicks, whatsappToday, whatsappWeek, whatsappMonth] =
    await Promise.all([
      countRows("visitor_events"),
      countRows("visitor_events", { gte: startOfToday() }),
      countRows("visitor_events", { gte: startOfWeek() }),
      countRows("visitor_events", { gte: rangeStartISO("30d") }),
      countRows("whatsapp_clicks"),
      countRows("whatsapp_clicks", { gte: startOfToday() }),
      countRows("whatsapp_clicks", { gte: startOfWeek() }),
      countRows("whatsapp_clicks", { gte: rangeStartISO("30d") }),
    ]);

  return {
    totalVisitors,
    todayVisitors,
    weekVisitors,
    monthVisitors,
    totalPrograms: programs.length,
    upcomingPrograms: programs.filter((p) => p.status !== "cancelled" && p.date >= today).length,
    completedPrograms: programs.filter((p) => p.status === "completed").length,
    totalEnquiries: enquiries.length,
    newEnquiries: enquiries.filter((e) => e.status === "New").length,
    whatsappClicks,
    whatsappToday,
    whatsappWeek,
    whatsappMonth,
    confirmedBookings: enquiries.filter((e) => e.status === "Confirmed").length,
  };
}

export async function getDashboardSeries(
  range: DateRange
): Promise<{ visitors: SeriesPoint[]; whatsapp: SeriesPoint[]; enquiries: SeriesPoint[]; bookings: SeriesPoint[] }> {
  const start = rangeStartISO(range);

  const [visitorEvents, clicks, enquiries, allEnquiries] = await Promise.all([
    fetchAll<VisitorEvent>("visitor_events", "created_at", start),
    fetchAll<WhatsAppClick>("whatsapp_clicks", "created_at", start),
    fetchAll<Pick<Enquiry, "created_at" | "status">>("enquiries", "created_at,status", start),
    getEnquiries(),
  ]);

  const bookings = allEnquiries.filter((e) => e.status === "Confirmed");

  return {
    visitors: bucketSeries(visitorEvents, start),
    whatsapp: bucketSeries(clicks, start),
    enquiries: bucketSeries(enquiries, start),
    bookings: bucketSeries(bookings, start),
  };
}

export async function getPopularPages(range: DateRange): Promise<{ path: string; views: number }[]> {
  const events = await fetchAll<VisitorEvent>("visitor_events", "path", rangeStartISO(range));
  const counts = new Map<string, number>();
  for (const e of events) counts.set(e.path, (counts.get(e.path) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

export async function getDeviceBreakdown(range: DateRange): Promise<{ device: string; views: number }[]> {
  const events = await fetchAll<VisitorEvent>("visitor_events", "device_type", rangeStartISO(range));
  const counts = new Map<string, number>();
  for (const e of events) {
    const key = e.device_type ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([device, views]) => ({ device, views }))
    .sort((a, b) => b.views - a.views);
}

export async function getTrafficSources(range: DateRange): Promise<{ source: string; views: number }[]> {
  const events = await fetchAll<VisitorEvent>("visitor_events", "referrer", rangeStartISO(range));
  const counts = new Map<string, number>();
  for (const e of events) {
    const ref = e.referrer;
    let source = "Direct";
    if (ref) {
      try {
        const host = new URL(ref).hostname.replace(/^www\./, "");
        if (host) source = host;
      } catch {
        source = "Direct";
      }
    }
    counts.set(source, (counts.get(source) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([source, views]) => ({ source, views }))
    .sort((a, b) => b.views - a.views);
}

export interface WhatsAppLead {
  id: string;
  page: string | null;
  program_id: string | null;
  program_title: string | null;
  visitor_id: string | null;
  created_at: string;
}

export async function getRecentWhatsAppClicks(limit = 100): Promise<WhatsAppLead[]> {
  if (!hasAdminEnv()) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("whatsapp_clicks")
    .select("id, page, program_id, visitor_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentWhatsAppClicks:", error.message);
    return [];
  }

  const clicks = (data ?? []) as WhatsAppLead[];

  const programIds = Array.from(new Set(clicks.map((c) => c.program_id).filter(Boolean))) as string[];
  const titles = new Map<string, string>();
  if (programIds.length > 0) {
    const { data: programs, error: progError } = await supabase
      .from("programs")
      .select("id, title")
      .in("id", programIds);
    if (!progError) {
      for (const p of programs ?? []) titles.set(p.id as string, p.title as string);
    }
  }

  return clicks.map((c) => ({
    ...c,
    program_title: c.program_id ? (titles.get(c.program_id) ?? null) : null,
  }));
}

export async function getWhatsAppLeads(range: DateRange): Promise<{
  total: number;
  today: number;
  uniqueVisitors: number;
} & { leads: WhatsAppLead[] }> {
  const start = rangeStartISO(range);
  const [total, today, leads] = await Promise.all([
    countRows("whatsapp_clicks", { gte: start }),
    countRows("whatsapp_clicks", { gte: startOfToday() }),
    getRecentWhatsAppClicks(100),
  ]);

  const uniqueVisitors = new Set(leads.map((l) => l.visitor_id).filter(Boolean)).size;

  return { total, today, uniqueVisitors, leads };
}

export async function getWhatsAppBreakdown(
  range: DateRange
): Promise<{ byPage: { page: string; clicks: number }[]; byProgram: { program_id: string | null; clicks: number }[] }> {
  const clicks = await fetchAll<WhatsAppClick>("whatsapp_clicks", "page,program_id", rangeStartISO(range));
  const byPageMap = new Map<string, number>();
  const byProgramMap = new Map<string | null, number>();
  for (const c of clicks) {
    const page = c.page ?? "unknown";
    byPageMap.set(page, (byPageMap.get(page) ?? 0) + 1);
    const prog = c.program_id ?? null;
    byProgramMap.set(prog, (byProgramMap.get(prog) ?? 0) + 1);
  }
  return {
    byPage: Array.from(byPageMap.entries())
      .map(([page, clicks]) => ({ page, clicks }))
      .sort((a, b) => b.clicks - a.clicks),
    byProgram: Array.from(byProgramMap.entries())
      .map(([program_id, clicks]) => ({ program_id, clicks }))
      .sort((a, b) => b.clicks - a.clicks),
  };
}