"use client";

import { useMemo, useState } from "react";
import { Search, Trash2, Phone } from "lucide-react";
import type { Enquiry, EnquiryStatus } from "@/lib/types";
import { formatDate, formatDateShort } from "@/lib/format";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Toast, type ToastState } from "@/components/admin/toast";

const STAGES: EnquiryStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Negotiating",
  "Confirmed",
  "Completed",
  "Cancelled",
  "Lost",
];

interface CrmManagerProps {
  initialEnquiries: Enquiry[];
}

export function CrmManager({ initialEnquiries }: CrmManagerProps) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<"all" | EnquiryStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Enquiry | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const stageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of enquiries) counts.set(e.status, (counts.get(e.status) ?? 0) + 1);
    return counts;
  }, [enquiries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enquiries
      .filter((e) => {
        const matchesStage = stage === "all" || e.status === stage;
        const matchesQuery =
          !q ||
          e.name.toLowerCase().includes(q) ||
          e.phone.includes(q) ||
          (e.event_location ?? "").toLowerCase().includes(q) ||
          (e.event_type ?? "").toLowerCase().includes(q);
        return matchesStage && matchesQuery;
      })
      .sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
  }, [enquiries, query, stage]);

  const selected = selectedId
    ? enquiries.find((e) => e.id === selectedId) ?? null
    : filtered[0] ?? null;

  const selectEnquiry = (id: string) => setSelectedId(id);

  const changeStatus = async (id: string, status: EnquiryStatus) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: json.error ?? "Could not update status." });
        return;
      }
      setEnquiries((prev) => prev.map((e) => (e.id === id ? json.enquiry : e)));
      setToast({ type: "success", message: `Moved to ${status}.` });
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    }
  };

  const saveNotes = async (id: string, notes: string) => {
    try {
      const res = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const json = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: json.error ?? "Could not save notes." });
        return;
      }
      setEnquiries((prev) => prev.map((e) => (e.id === id ? json.enquiry : e)));
      setToast({ type: "success", message: "Notes saved." });
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) {
        setToast({ type: "error", message: "Could not delete the enquiry." });
        return;
      }
      setEnquiries((prev) => prev.filter((e) => e.id !== deleting.id));
      if (selectedId === deleting.id) setSelectedId(null);
      setDeleting(null);
      setToast({ type: "success", message: "Enquiry deleted." });
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setDeletingBusy(false);
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-head">
        <h1>Enquiries / CRM</h1>
        <p>Track booking enquiries from the website and move them through your booking pipeline.</p>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input
            placeholder="Search by name, phone, event…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="crm-summary-chips">
          {(["New", "Contacted", "Negotiating", "Confirmed"] as EnquiryStatus[]).map((s) => (
            <span key={s} className="crm-chip">
              {s} <strong>{stageCounts.get(s) ?? 0}</strong>
            </span>
          ))}
        </div>
      </div>

      <div className="crm-stage-tabs">
        <button
          className={`crm-stage-tab ${stage === "all" ? "active" : ""}`}
          onClick={() => setStage("all")}
        >
          All <span className="crm-count">{enquiries.length}</span>
        </button>
        {STAGES.map((s) => (
          <button
            key={s}
            className={`crm-stage-tab ${stage === s ? "active" : ""}`}
            onClick={() => setStage(s)}
          >
            {s} <span className="crm-count">{stageCounts.get(s) ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="crm-layout">
        <div className="glass-card">
          {filtered.length === 0 ? (
            <p className="admin-empty-cell">No enquiries found for this stage.</p>
          ) : (
            <div className="crm-enquiry-list">
              {filtered.map((e) => (
                <button
                  key={e.id}
                  className={`crm-enquiry-row ${selected?.id === e.id ? "selected" : ""}`}
                  onClick={() => selectEnquiry(e.id)}
                >
                  <div className="crm-enquiry-main">
                    <div className="crm-enquiry-name">{e.name}</div>
                    <div className="crm-enquiry-meta">
                      {[e.event_type, e.event_location, e.event_date ? formatDateShort(e.event_date) : null]
                        .filter(Boolean)
                        .join(" • ") || "—"}
                    </div>
                  </div>
                  <span className={`status-chip status-${e.status.toLowerCase()}`}>{e.status}</span>
                  <span className="crm-enquiry-date">{formatDate(e.created_at.slice(0, 10))}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selected ? (
          <div className="crm-detail glass-card">
            <div className="crm-detail-head">
              <h3>{selected.name}</h3>
              <div className="admin-row-actions">
                <a
                  className="admin-icon-btn"
                  href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open WhatsApp chat"
                  aria-label={`WhatsApp ${selected.name}`}
                >
                  <Phone size={15} />
                </a>
                <button
                  className="admin-icon-btn danger"
                  onClick={() => setDeleting(selected)}
                  aria-label="Delete enquiry"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="crm-detail-row">
              <span>Status</span>
              <select
                className="admin-select"
                value={selected.status}
                onChange={(e) => changeStatus(selected.id, e.target.value as EnquiryStatus)}
                aria-label="Change status"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="crm-detail-row">
              <span>Phone</span>
              <span>{selected.phone}</span>
            </div>
            {selected.email && (
              <div className="crm-detail-row">
                <span>Email</span>
                <span>{selected.email}</span>
              </div>
            )}
            <div className="crm-detail-row">
              <span>Event Type</span>
              <span>{selected.event_type ?? "—"}</span>
            </div>
            <div className="crm-detail-row">
              <span>Event Date</span>
              <span>{selected.event_date ? formatDate(selected.event_date) : "—"}</span>
            </div>
            <div className="crm-detail-row">
              <span>Location</span>
              <span>{selected.event_location ?? "—"}</span>
            </div>
            <div className="crm-detail-row">
              <span>Source</span>
              <span>{selected.source ?? "Website"}</span>
            </div>
            <div className="crm-detail-row">
              <span>Received</span>
              <span>{formatDate(selected.created_at.slice(0, 10))}</span>
            </div>
            {selected.message && (
              <div className="crm-notes">
                <h4>Message</h4>
                <p style={{ color: "#bdb09e", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  {selected.message}
                </p>
              </div>
            )}
            <NotesEditor enquiry={selected} onSaved={saveNotes} />
          </div>
        ) : null}
      </div>

      {deleting && (
        <ConfirmDialog
          title="Delete Enquiry"
          message={`Delete the enquiry from "${deleting.name}"? This cannot be undone.`}
          busy={deletingBusy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

function NotesEditor({ enquiry, onSaved }: { enquiry: Enquiry; onSaved: (id: string, notes: string) => void }) {
  const [value, setValue] = useState(enquiry.notes ?? "");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  return (
    <div className="crm-notes">
      <h4>Internal Notes</h4>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setDirty(true);
        }}
        placeholder="e.g. spoke with customer, waiting for confirmation…"
      />
      <div className="crm-note-save">
        <button
          className="admin-accent-btn"
          disabled={busy || !dirty}
          onClick={async () => {
            setBusy(true);
            onSaved(enquiry.id, value);
            setDirty(false);
            setBusy(false);
          }}
        >
          {busy ? "Saving…" : "Save Notes"}
        </button>
      </div>
    </div>
  );
}