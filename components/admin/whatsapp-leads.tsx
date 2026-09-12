"use client";

import { useCallback, useState } from "react";
import { MessageCircle, RefreshCw, Clock, Users } from "lucide-react";
import type { WhatsAppLead } from "@/lib/admin-data";
import { formatDate } from "@/lib/format";
import { StatsCard } from "@/components/admin/stats-card";

type Range = "today" | "7d" | "30d" | "90d" | "year";

const RANGE_OPTIONS: { key: Range; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "90d", label: "90 Days" },
  { key: "year", label: "This Year" },
];

interface WhatsAppLeadsViewProps {
  initial: {
    total: number;
    today: number;
    uniqueVisitors: number;
    leads: WhatsAppLead[];
  };
}

async function load(range: Range) {
  const res = await fetch(`/api/admin/whatsapp?range=${range}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed");
  const json = await res.json();
  return { total: json.total ?? 0, today: json.today ?? 0, uniqueVisitors: json.uniqueVisitors ?? 0, leads: json.leads ?? [] };
}

export function WhatsAppLeadsView({ initial }: WhatsAppLeadsViewProps) {
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async (r: Range) => {
    setLoading(true);
    try {
      setData(await load(r));
    } catch {
      // keep previous data
    } finally {
      setLoading(false);
    }
  }, []);

  const selectRange = (r: Range) => {
    setRange(r);
    void refresh(r);
  };

  return (
    <div className="admin-content">
      <div className="admin-page-head admin-page-head-row">
        <div>
          <h1>WhatsApp Leads</h1>
          <p>Every “Book a Program” / WhatsApp button click, most recent first.</p>
        </div>
        <div className="admin-row-actions">
          <div className="range-picker">
            {RANGE_OPTIONS.map((o) => (
              <button key={o.key} className={range === o.key ? "active" : ""} onClick={() => selectRange(o.key)}>
                {o.label}
              </button>
            ))}
          </div>
          <button className="admin-ghost-btn" onClick={() => refresh(range)} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} /> {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatsCard label="Clicks (period)" value={data.total.toLocaleString()} icon={<MessageCircle size={20} />} tone="green" />
        <StatsCard label="Today" value={data.today.toLocaleString()} icon={<Clock size={20} />} tone="gold" />
        <StatsCard label="Unique Visitors" value={data.uniqueVisitors.toLocaleString()} icon={<Users size={20} />} tone="red" />
      </div>

      <div className="admin-table-wrap glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Program</th>
              <th>Visitor</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div className="admin-table-title">{lead.page ?? "—"}</div>
                  <div className="admin-table-sub">{lead.page === "navbar" ? "Navbar button" : "Site page"}</div>
                </td>
                <td>{lead.program_title ?? (lead.program_id ? "Program" : "—")}</td>
                <td className="admin-table-title" style={{ textTransform: "none" }}>
                  {lead.visitor_id ? lead.visitor_id.slice(0, 8) + "…" : "—"}
                </td>
                <td>{formatDate(lead.created_at.slice(0, 10))}</td>
              </tr>
            ))}
            {data.leads.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-empty-cell">
                  No WhatsApp clicks recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}