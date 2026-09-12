import type { Metadata } from "next";
import { AnalyticsView } from "@/components/admin/analytics-view";
import { getDeviceBreakdown, getPopularPages, getTrafficSources, getWhatsAppBreakdown } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Website Analytics | Bhairavi Bhajans Admin",
};

export default async function AdminAnalyticsPage() {
  const [popularPages, devices, sources, whatsapp] = await Promise.all([
    getPopularPages("30d"),
    getDeviceBreakdown("30d"),
    getTrafficSources("30d"),
    getWhatsAppBreakdown("30d"),
  ]);

  return (
    <AnalyticsView
      initial={{ popularPages, devices, sources, whatsapp }}
    />
  );
}