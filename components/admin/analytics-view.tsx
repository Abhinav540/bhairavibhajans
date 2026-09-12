"use client";

import { useCallback, useState } from "react";
import { BarChart } from "@/components/admin/charts";
import type { SeriesPoint } from "@/lib/types";

type Range = "today" | "7d" | "30d" | "90d" | "year";

const RANGE_OPTIONS: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "year", label: "This Year" },
];

interface ApiShape {
  popularPages: { path: string; views: number }[];
  devices: { device: string; views: number }[];
  sources: { source: string; views: number }[];
  whatsapp: { byPage: { page: string; clicks: number }[]; byProgram: { program_id: string | null; clicks: number }[] };
}

interface AnalyticsViewProps {
  initial: ApiShape;
}

async function loadFromServer(range: Range): Promise<ApiShape> {
  const res = await fetch(`/api/admin/analytics?range=${range}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load analytics");
  const json = await res.json();
  return {
    popularPages: json.popularPages ?? [],
    devices: json.devices ?? [],
    sources: json.sources ?? [],
    whatsapp: json.whatsapp ?? { byPage: [], byProgram: [] },
  };
}

function flatten(list: { [key: string]: string | number | null }[], labelKey: string, valueKey: string): SeriesPoint[] {
  return list.map((item) => ({
    label: String(item[labelKey] ?? "—"),
    value: Number(item[valueKey] ?? 0),
  }));
}

function BreakdownList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  if (items.length === 0) {
    return <p className="chart-empty">No data for this period</p>;
  }
  return (
    <>
      {items.map((item) => (
        <div key={item.label} className="breakdown-row">
          <div className="breakdown-meta">
            <span className="breakdown-label">{item.label}</span>
            <span className="breakdown-value">{item.value.toLocaleString()}</span>
          </div>
          <div className="breakdown-track">
            <div className="breakdown-fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </>
  );
}

export function AnalyticsView({ initial }: AnalyticsViewProps) {
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<ApiShape>(initial);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (r: Range) => {
    setLoading(true);
    try {
      const json = await loadFromServer(r);
      setData(json);
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  const whatsappBars: SeriesPoint[] = flatten(
    data.whatsapp.byProgram as { program_id: string | null; clicks: number }[],
    "program_id",
    "clicks"
  ).map((p) => (p.label === "null" || !p.label ? { ...p, label: "Unknown program" } : p));

  const selectRange = (r: Range) => {
    setRange(r);
    void load(r);
  };

  return (
    <div className="admin-content">
      <div className="admin-page-head admin-page-head-row">
        <div>
          <h1>Website Analytics</h1>
          <p>Breakdown of visitor behaviour, sources and WhatsApp activity.</p>
        </div>
        <div className="range-picker">
          {RANGE_OPTIONS.map((o) => (
            <button key={o.key} className={range === o.key ? "active" : ""} onClick={() => selectRange(o.key)}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="chart-loading">Loading…</div>}
      <div className={`analytics-grid ${loading ? "dim" : ""}`}>
        <div className="analytics-card glass-card">
          <h3>Popular Pages</h3>
          <BreakdownList items={flatten(data.popularPages, "path", "views")} />
        </div>
        <div className="analytics-card glass-card">
          <h3>Devices</h3>
          <BreakdownList items={flatten(data.devices, "device", "views")} />
        </div>
        <div className="analytics-card glass-card">
          <h3>Traffic Sources</h3>
          <BreakdownList items={flatten(data.sources, "source", "views")} />
        </div>
        <div className="analytics-card glass-card">
          <h3>WhatsApp Clicks by Page</h3>
          <BreakdownList items={flatten(data.whatsapp.byPage, "page", "clicks")} />
        </div>
      </div>

      <div className="admin-section glass-card">
        <div className="admin-section-header">
          <h2>WhatsApp Clicks by Program</h2>
        </div>
        {whatsappBars.length === 0 ? (
          <p className="chart-empty">No WhatsApp clicks recorded in this period.</p>
        ) : (
          <BarChart data={whatsappBars} color="#25d366" />
        )}
      </div>
    </div>
  );
}