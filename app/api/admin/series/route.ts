import { NextRequest } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { getDashboardSeries, type DateRange } from "@/lib/admin-data";

const RANGES: DateRange[] = ["today", "7d", "30d", "90d", "year"];

export async function GET(request: NextRequest) {
  await requireAdminUser();

  const rangeParam = request.nextUrl.searchParams.get("range");
  const range: DateRange = RANGES.includes(rangeParam as DateRange)
    ? (rangeParam as DateRange)
    : "30d";

  const series = await getDashboardSeries(range);
  return Response.json({ range, ...series });
}