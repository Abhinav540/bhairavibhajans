import type { Metadata } from "next";
import { AdminCalendar } from "@/components/admin/admin-calendar";
import { getAvailability, getPrograms } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Calendar | Bhairavi Bhajans Admin",
};

export default async function AdminCalendarPage() {
  const [programs, availability] = await Promise.all([
    getPrograms(),
    getAvailability(),
  ]);

  return <AdminCalendar initialPrograms={programs} initialAvailability={availability} />;
}