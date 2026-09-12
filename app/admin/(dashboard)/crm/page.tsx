import type { Metadata } from "next";
import { CrmManager } from "@/components/admin/crm-manager";
import { getEnquiries } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Enquiries / CRM | Bhairavi Bhajans Admin",
};

export default async function AdminCrmPage() {
  const enquiries = await getEnquiries();
  return <CrmManager initialEnquiries={enquiries} />;
}