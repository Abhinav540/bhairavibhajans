"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, CalendarOff, CalendarCheck2, Trash2, Pencil } from "lucide-react";
import type { Program, Availability } from "@/lib/types";
import {
  buildMonthGrid,
  formatDate,
  formatTimeRange,
  fromISODate,
  monthName,
  toISODate,
} from "@/lib/format";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Toast, type ToastState } from "@/components/admin/toast";
import { ProgramFormModal } from "@/components/admin/program-form-modal";

interface AdminCalendarProps {
  initialPrograms: Program[];
  initialAvailability: Availability[];
}

type DayKind = "empty" | "available" | "blocked" | "booked" | "confirmed" | "completed" | "cancelled" | "past";

export function AdminCalendar({ initialPrograms, initialAvailability }: AdminCalendarProps) {
  const [cursor, setCursor] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [availability, setAvailability] = useState<Availability[]>(initialAvailability);
  const [selected, setSelected] = useState<string | null>(null);
  const [formModal, setFormModal] = useState<{ open: boolean; editing: Program | null; date?: string }>({
    open: false,
    editing: null,
  });
  const [deleting, setDeleting] = useState<Program | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [busyDate, setBusyDate] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const programsByDate = useMemo(() => {
    const map = new Map<string, Program[]>();
    for (const p of programs) {
      const list = map.get(p.date) ?? [];
      list.push(p);
      map.set(p.date, list);
    }
    return map;
  }, [programs]);

  const availabilityByDate = useMemo(() => {
    const map = new Map<string, Availability>();
    for (const a of availability) map.set(a.date, a);
    return map;
  }, [availability]);

  const month = useMemo(() => buildMonthGrid(cursor.year, cursor.month), [cursor.year, cursor.month]);
  const todayISO = toISODate(new Date());

  const dayKind = (iso: string | null): DayKind => {
    if (!iso) return "empty";
    if (iso < todayISO && iso !== todayISO) return "past";
    const list = programsByDate.get(iso) ?? [];
    if (list.some((p) => p.status === "booked")) return "booked";
    if (list.some((p) => p.status === "confirmed")) return "confirmed";
    if (list.some((p) => p.status === "completed")) return "completed";
    if (list.some((p) => p.status === "cancelled")) return "cancelled";
    const av = availabilityByDate.get(iso)?.status;
    return av === "available" ? "available" : av === "blocked" ? "blocked" : "available";
  };

  const selectedPrograms = selected ? (programsByDate.get(selected) ?? []) : [];
  const selectedAvailability = selected ? availabilityByDate.get(selected) : null;

  const nav = (dir: number) => {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + dir, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const upsertAvailability = async (date: string, status: "available" | "blocked") => {
    setBusyDate(date);
    // guard: don't allow blocking/unflagging a date that holds active programs
    const active = (programsByDate.get(date) ?? []).some((p) => p.status === "booked" || p.status === "confirmed");
    if (status === "blocked" && active) {
      setToast({ type: "error", message: "This date already has active programs." });
      setBusyDate(null);
      return;
    }
    try {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, status }),
      });
      const json = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: json.error ?? "Could not update availability." });
        return;
      }
      setAvailability((prev) => {
        const next = prev.filter((a) => a.date !== date);
        if (status === "available") return next; // default state, no explicit row needed
        return [...next, json.availability as Availability];
      });
      setToast({ type: "success", message: status === "blocked" ? "Marked as unavailable." : "Marked as available." });
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setBusyDate(null);
    }
  };

  const handleSaved = (program: Program, mode: "created" | "updated") => {
    if (mode === "created") setPrograms((prev) => [...prev, program]);
    else setPrograms((prev) => prev.map((x) => (x.id === program.id ? program : x)));
    setToast({ type: "success", message: mode === "created" ? "Program created." : "Program updated." });
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
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setDeletingBusy(false);
    }
  };

  const cancelProgram = async (p: Program) => {
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
          status: "cancelled",
          image: p.image ?? null,
        }),
      });
      if (!res.ok) {
        setToast({ type: "error", message: "Could not cancel program." });
        return;
      }
      setPrograms((prev) => prev.map((x) => (x.id === p.id ? { ...x, status: "cancelled" } : x)));
      setToast({ type: "success", message: "Program cancelled." });
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    }
  };

  return (
    <div className="admin-content">
      <div className="admin-page-head">
        <h1>Program Calendar</h1>
        <p>Click a date to add a program or change its availability.</p>
      </div>

      <div className="admin-calendar-layout">
        <div className="admin-calendar glass-card">
          <div className="admin-cal-head">
            <h2>{monthName(cursor.month)} {cursor.year}</h2>
            <div className="admin-cal-nav">
              <button onClick={() => nav(-1)} aria-label="Previous month">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => nav(0)} aria-label="Go to current month" data-today>
                Today
              </button>
              <button onClick={() => nav(1)} aria-label="Next month">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="admin-cal-grid">
            {month.map((row, r) =>
              row.map((iso, c) => {
                const kind = dayKind(iso);
                const dayNum = iso ? (fromISODate(iso)?.getDate() ?? null) : null;
                const isSelected = iso === selected;
                const isToday = iso === todayISO;
                return (
                  <button
                    key={iso ?? `${r}-${c}`}
                    className={`admin-cal-day kind-${kind}${isSelected ? " selected" : ""}${isToday ? " today" : ""}`}
                    disabled={kind === "empty"}
                    onClick={() => iso && setSelected(iso)}
                    aria-label={iso ? formatDate(iso) : undefined}
                  >
                    <span className="admin-cal-daynum">{dayNum ?? ""}</span>
                    {iso && (programsByDate.get(iso)?.length ?? 0) > 0 && (
                      <span className="admin-cal-count">{programsByDate.get(iso)!.length}</span>
                    )}
                  </button>
                );
              }),
            )}
          </div>
          <div className="admin-cal-legend">
            <span className="legend-item legend-available">Available</span>
            <span className="legend-item legend-booked">Booked</span>
            <span className="legend-item legend-confirmed">Confirmed</span>
            <span className="legend-item legend-blocked">Unavailable</span>
            <span className="legend-item legend-cancelled">Cancelled</span>
            <span className="legend-item legend-past">Past</span>
          </div>
        </div>

        <div className="admin-day-panel glass-card">
          {selected ? (
            <>
              <div className="admin-panel-head">
                <div>
                  <h3>{formatDate(selected)}</h3>
                  <p>
{selectedAvailability?.status === "blocked"
                      ? "Marked unavailable"
                      : "Available for booking"}
                  </p>
                </div>
                <button
                  className="admin-icon-btn"
                  onClick={() => {
                    setSelected(null);
                    if (toast) setToast(null);
                  }}
                  aria-label="Close panel"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="admin-day-actions">
                <button className="admin-accent-btn" onClick={() => setFormModal({ open: true, editing: null, date: selected })}>
                  <Plus size={15} /> Add Program
                </button>
                {selectedAvailability?.status === "blocked" ? (
                  <button className="admin-ghost-btn" onClick={() => upsertAvailability(selected, "available")} disabled={busyDate === selected}>
                    <CalendarCheck2 size={15} /> Mark Available
                  </button>
                ) : (
                  <button
                    className="admin-ghost-btn"
                    onClick={() => upsertAvailability(selected, "blocked")}
                    disabled={busyDate === selected || selectedPrograms.some((p) => p.status === "booked" || p.status === "confirmed")}
                    title={
                      selectedPrograms.some((p) => p.status === "booked" || p.status === "confirmed")
                        ? "Cancel active programs before blocking this date"
                        : undefined
                    }
                  >
                    <CalendarOff size={15} /> Mark Unavailable
                  </button>
                )}
              </div>

              {selectedPrograms.length === 0 ? (
                <p className="admin-panel-empty">
                  No programs on this date. Add one to mark it as booked.
                </p>
              ) : (
                <ul className="admin-day-list">
                  {selectedPrograms.map((p) => (
                    <li key={p.id}>
                      <div className="admin-day-info">
                        <div className="admin-day-title">{p.title}</div>
                        <div className="admin-day-sub">
                          {formatTimeRange(p.start_time, p.end_time) || "All day"} · {p.location ?? "—"}
                        </div>
                      </div>
                      <div className={`status-chip status-${p.status}`}>{p.status}</div>
                      <div className="admin-row-actions">
                        {p.status !== "cancelled" && p.status !== "completed" && (
                          <button
                            className="admin-icon-btn"
                            onClick={() => cancelProgram(p)}
                            title="Send to cancelled"
                            aria-label={`Cancel ${p.title}`}
                          >
                            <X size={15} />
                          </button>
                        )}
                        <button
                          className="admin-icon-btn"
                          onClick={() => setFormModal({ open: true, editing: p, date: p.date })}
                          aria-label={`Edit ${p.title}`}
                          title="Edit"
                        >
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
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <div className="admin-panel-empty-state">
              <p>Select a date to manage programs and availability.</p>
            </div>
          )}
        </div>
      </div>

      <ProgramFormModal
        open={formModal.open}
        editing={formModal.editing}
        defaultDate={formModal.date}
        onClose={() => setFormModal({ open: false, editing: null })}
        onSaved={handleSaved}
      />

      {deleting && (
        <ConfirmDialog
          title="Delete Program"
          message={`Delete "${deleting.title}" on ${formatDate(deleting.date)}? This cannot be undone.`}
          busy={deletingBusy}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}