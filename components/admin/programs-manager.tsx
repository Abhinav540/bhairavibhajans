"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import type { Program, ProgramStatus } from "@/lib/types";
import { formatDate, formatTimeRange } from "@/lib/format";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Toast, type ToastState } from "@/components/admin/toast";
import { ProgramFormModal } from "@/components/admin/program-form-modal";

const STATUSES: ProgramStatus[] = ["booked", "confirmed", "completed", "cancelled"];

interface ProgramsManagerProps {
  initialPrograms: Program[];
}

export function ProgramsManager({ initialPrograms }: ProgramsManagerProps) {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formModal, setFormModal] = useState<{ open: boolean; editing: Program | null }>({
    open: false,
    editing: null,
  });
  const [deleting, setDeleting] = useState<Program | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return programs.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.location ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [programs, query, statusFilter]);

  const handleSaved = (program: Program, mode: "created" | "updated") => {
    if (mode === "created") {
      setPrograms((prev) => [...prev, program]);
      setToast({ type: "success", message: "Program created." });
    } else {
      setPrograms((prev) => prev.map((x) => (x.id === program.id ? program : x)));
      setToast({ type: "success", message: "Program updated." });
    }
    router.refresh();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      const res = await fetch("/api/admin/programs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleting.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: json.error ?? "Could not delete the program." });
        return;
      }
      setPrograms((prev) => prev.filter((p) => p.id !== deleting.id));
      setDeleting(null);
      setToast({ type: "success", message: "Program deleted." });
      router.refresh();
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setDeletingBusy(false);
    }
  };

  const changeStatus = async (p: Program, nextStatus: ProgramStatus) => {
    try {
      const res = await fetch("/api/admin/programs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: p.id,
          title: p.title,
          description: p.description ?? null,
          program_type: p.program_type ?? null,
          date: p.date,
          start_time: p.start_time ?? null,
          end_time: p.end_time ?? null,
          location: p.location ?? null,
          status: nextStatus,
          image: p.image ?? null,
        }),
      });
      if (!res.ok) {
        setToast({ type: "error", message: "Could not update status." });
        return;
      }
      setPrograms((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: nextStatus } : x)));
      setToast({ type: "success", message: `Status changed to ${nextStatus}.` });
      router.refresh();
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-head admin-page-head-row">
        <div>
          <h1>Programs</h1>
          <p>Add, edit and manage programs. The public calendar updates automatically.</p>
        </div>
        <button
          className="admin-accent-btn"
          onClick={() => setFormModal({ open: true, editing: null })}
        >
          <Plus size={17} /> Add Program
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <Search size={16} />
          <input
            placeholder="Search by title or location…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="admin-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="admin-table-wrap glass-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="admin-table-title">{p.title}</div>
                  <div className="admin-table-sub">{p.program_type?.replaceAll("_", " ") ?? "—"}</div>
                </td>
                <td>{formatDate(p.date)}</td>
                <td>{formatTimeRange(p.start_time, p.end_time) || "—"}</td>
                <td>{p.location ?? "—"}</td>
                <td>
                  <div className="status-picker">
                    <span className={`status-chip status-${p.status}`}>{p.status}</span>
                    <select
                      className="status-select"
                      value={p.status}
                      onChange={(e) => changeStatus(p, e.target.value as ProgramStatus)}
                      aria-label={`Change status for ${p.title}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button className="admin-icon-btn" onClick={() => setFormModal({ open: true, editing: p })} aria-label={`Edit ${p.title}`} title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button
                      className="admin-icon-btn danger"
                      onClick={() => setDeleting(p)}
                      aria-label={`Delete ${p.title}`}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty-cell">
                  No programs found{query ? " for your search" : " yet"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProgramFormModal
        open={formModal.open}
        editing={formModal.editing}
        onClose={() => setFormModal({ open: false, editing: null })}
        onSaved={handleSaved}
      />

      {deleting && (
        <ConfirmDialog
          title="Delete Program"
          message={`Are you sure you want to delete "${deleting.title}"? This cannot be undone and will free the date on the public calendar.`}
          busy={deletingBusy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}