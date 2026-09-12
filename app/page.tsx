import HomePage from "@/components/home-page";
import { todayISO } from "@/lib/format";
import { getPublicPrograms } from "@/lib/programs";
import type { Program } from "@/lib/types";

export default async function Page() {
  const programs = await getPublicPrograms();
  const upcomingProgram: Program | null =
    programs
      .filter((p) => (p.status === "booked" || p.status === "confirmed") && p.date >= todayISO())
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;

  return <HomePage upcomingProgram={upcomingProgram} />;
}
