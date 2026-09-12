"use client";

import { useCallback, useState } from "react";
import type { SeriesPoint } from "@/lib/types";
import { BarChart, LineChart } from "@/components/admin/charts";

type Range = "today" | "7d" | "30d" | "90d" | "year";

const RANGE_OPTIONS: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "year", label: "This Year" },
];

interface DashboardChartsProps {
  initial: {
    visitors: SeriesPoint[];
    whatsapp: SeriesPoint[];
    enquiries: SeriesPoint[];
    bookings: SeriesPoint[];
  };
}

export function DashboardCharts({ initial }: DashboardChartsProps) {
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (r: Range) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/series?range=${r}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData({
          visitors: json.visitors ?? [],
          whatsapp: json.whatsapp ?? [],
          enquiries: json.enquiries ?? [],
          bookings: json.bookings ?? [],
        });
      }
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  const selectRange = (r: Range) => {
    setRange(r);
    void load(r);
  };

  return (
    <section className="admin-section glass-card">
      <div className="admin-section-header">
        <h2>Analytics Overview</h2>
        <div className="range-picker">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.key}
              className={range === o.key ? "active" : ""}
              onClick={() => selectRange(o.key)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      {loading && <div className="chart-loading">Loading…</div>}
      <div className={`admin-chart-grid ${loading ? "dim" : ""}`}>
        <div className="chart-card">
          <h3>Visitors</h3>
          <LineChart data={data.visitors} color="#e3394e" />
        </div>
        <div className="chart-card">
          <h3>WhatsApp Clicks</h3>
          <LineChart data={data.whatsapp} color="#25d366" />
        </div>
        <div className="chart-card">
          <h3>Enquiries</h3>
          <BarChart data={data.enquiries} color="#c89539" />
        </div>
        <div className="chart-card">
          <h3>Confirmed Bookings</h3>
          <BarChart data={data.bookings} color="#e3394e" />
        </div>
      </div>
    </section>
  );
}