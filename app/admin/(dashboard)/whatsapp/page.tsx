import type { Metadata } from "next";
import { WhatsAppLeadsView } from "@/components/admin/whatsapp-leads";
import { getWhatsAppLeads } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "WhatsApp Leads | Bhairavi Bhajans Admin",
};

export default async function AdminWhatsAppPage() {
  const data = await getWhatsAppLeads("30d");
  return <WhatsAppLeadsView initial={data} />;
}