import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsProvider } from "@/components/analytics/provider";
import { VisitorTracker } from "@/components/analytics/visitor-tracker";

export const metadata: Metadata = {
  title: "Bhairavi Bhajans | Divine Melodies",
  description: "Soulful bhajans and timeless devotion.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        {children}
        <VisitorTracker />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
