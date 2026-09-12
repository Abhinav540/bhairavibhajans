import { ProgramsManager } from "@/components/admin/programs-manager";
import { getPrograms } from "@/lib/admin-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs | Bhairavi Bhajans Admin",
};

export default async function AdminProgramsPage() {
  const programs = await getPrograms();
  return <ProgramsManager initialPrograms={programs} />;
}