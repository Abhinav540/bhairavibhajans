import {
  CalendarCheck2,
  CalendarClock,
  Eye,
  MessageCircle,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { StatsCard } from "@/components/admin/stats-card";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { ConversionFunnel } from "@/components/admin/conversion-funnel";
import { getDashboardSeries, getDashboardSummary } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Dashboard | Bhairavi Bhajans Admin",
};

export default async function AdminDashboardPage() {
  const [summary, series] = await Promise.all([
    getDashboardSummary(),
    getDashboardSeries("30d"),
  ]);

  return (
    <div className="admin-content">
      <div className="admin-page-head">
        <h1>Dashboard</h1>
        <p>Welcome back. Here is what is happening with Bhairavi Bhajans.</p>
      </div>

      <div className="admin-stats-grid">
        <StatsCard label="Total Website Visitors" value={summary.totalVisitors.toLocaleString()} icon={<Eye size={20} />} tone="red" />
        <StatsCard label="Today's Visitors" value={summary.todayVisitors.toLocaleString()} icon={<TrendingUp size={20} />} tone="gold" />
        <StatsCard label="Total Programs" value={summary.totalPrograms.toLocaleString()} icon={<CalendarCheck2 size={20} />} tone="blue" />
        <StatsCard label="Upcoming Programs" value={summary.upcomingPrograms.toLocaleString()} icon={<CalendarClock size={20} />} tone="green" />
        <StatsCard label="Total Enquiries" value={summary.totalEnquiries.toLocaleString()} icon={<Users size={20} />} tone="gold" />
        <StatsCard label="New Enquiries" value={summary.newEnquiries.toLocaleString()} icon={<UserPlus size={20} />} tone="red" />
        <StatsCard label="WhatsApp Clicks" value={summary.whatsappClicks.toLocaleString()} icon={<MessageCircle size={20} />} tone="green" />
        <StatsCard label="Confirmed Bookings" value={summary.confirmedBookings.toLocaleString()} icon={<CalendarCheck2 size={20} />} tone="red" />
      </div>

      <DashboardCharts initial={series} />

      <ConversionFunnel
        visitors={summary.totalVisitors}
        whatsapp={summary.whatsappClicks}
        enquiries={summary.totalEnquiries}
        confirmed={summary.confirmedBookings}
      />
    </div>
  );
}