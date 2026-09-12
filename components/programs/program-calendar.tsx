"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Availability, Program } from "@/lib/types";
import {
  buildMonthGrid,
  formatDate,
  formatTimeRange,
  monthName,
  todayISO,
} from "@/lib/format";

export interface DayInfo {
  iso: string;
  kind: "available" | "blocked" | "booked" | "confirmed" | "cancelled" | "completed" | "past";
  programs: Program[];
}

interface ProgramCalendarProps {
  programs: Program[];
  availability: Availability[];
}

function getDayInfo(iso: string, programs: Program[], availability: Availability[]): DayInfo {
  const dayPrograms = programs.filter((p) => p.date === iso);
  const blocked = availability.find((a) => a.date === iso && a.status === "blocked");

  if (blocked) {
    return { iso, kind: "blocked", programs: dayPrograms };
  }
  if (dayPrograms.length === 0) {
    const isPast = iso < todayISO();
    return { iso, kind: isPast ? "past" : "available", programs: [] };
  }

  const first = dayPrograms[0];
  if (first.status === "confirmed") return { iso, kind: "confirmed", programs: dayPrograms };
  if (first.status === "cancelled") return { iso, kind: "cancelled", programs: dayPrograms };
  if (first.status === "completed") return { iso, kind: "completed", programs: dayPrograms };
  return { iso, kind: "booked", programs: dayPrograms };
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ProgramCalendar({ programs, availability }: ProgramCalendarProps) {
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState<DayInfo | null>(null);

  const grid = useMemo(
    () => buildMonthGrid(cursor.year, cursor.month, 0),
    [cursor.year, cursor.month]
  );

  const programMap = useMemo(() => {
    const map = new Map<string, DayInfo>();
    for (const row of grid) {
      for (const iso of row) {
        if (iso) map.set(iso, getDayInfo(iso, programs, availability));
      }
    }
    return map;
  }, [grid, programs, availability]);

  const moveMonth = (delta: number) => {
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const isCurrentMonth =
    cursor.year === new Date().getFullYear() && cursor.month === new Date().getMonth();

  const selectedProgram = selected?.programs[0] ?? null;
  const canBook = selected?.kind === "available";

  return (
    <div className="calendar-shell">
      <div className="calendar-toolbar">
        <div className="calendar-title">
          <h2>
            {monthName(cursor.month)} {cursor.year}
          </h2>
        </div>
        <div className="calendar-nav">
          <button aria-label="Previous month" onClick={() => moveMonth(-1)}>
            <ChevronLeft size={18} />
          </button>
          <button aria-label="Next month" onClick={() => moveMonth(1)}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays" role="row">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid" role="grid">
        {grid.flat().map((iso, i) => {
          if (!iso) return <div key={`empty-${i}`} role="gridcell" aria-disabled />;
          const info = programMap.get(iso)!;
          const isToday = iso === today;
          const classNames = [
            "calendar-day",
            `day-${info.kind}`,
            isToday ? "is-today" : "",
            isCurrentMonth ? "" : "is-outside",
          ].join(" ");

          return (
            <button
              key={iso}
              role="gridcell"
              className={classNames}
              onClick={() => setSelected(info)}
              aria-label={`${formatDate(iso)} — ${info.kind}`}
              disabled={info.kind === "past" || info.kind === "completed"}
            >
              <span className="day-number">{Number(iso.slice(8, 10))}</span>
              {info.kind === "available" && <span className="day-badge badge-available">Available</span>}
              {(info.kind === "booked" || info.kind === "confirmed") && (
                <span className="day-badge badge-booked">Program</span>
              )}
              {info.kind === "blocked" && <span className="day-badge badge-blocked">Unavailable</span>}
              {info.kind === "cancelled" && <span className="day-badge badge-cancelled">Cancelled</span>}
              {info.kind === "completed" && <span className="day-badge badge-completed">Past</span>}
              {info.kind === "past" && <span className="day-badge badge-completed">Past</span>}
            </button>
          );
        })}
      </div>

      <div className="calendar-legend">
        <span className="legend-item"><i className="legend-dot dot-available" /> Available</span>
        <span className="legend-item"><i className="legend-dot dot-booked" /> Program / Booked</span>
        <span className="legend-item"><i className="legend-dot dot-blocked" /> Unavailable</span>
        <span className="legend-item"><i className="legend-dot dot-completed" /> Past</span>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)} role="presentation">
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Day details">
            <div className="modal-header">
              <h2>{formatDate(selected.iso)}</h2>
              <button className="close-btn" onClick={() => setSelected(null)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {selectedProgram ? (
                <>
                  <span className={`program-status status-${selectedProgram.status}`}>
                    {selectedProgram.status.toUpperCase()}
                  </span>
                  <h3 className="calendar-program-title">{selectedProgram.title}</h3>
                  <p>
                    <strong>Program type:</strong>{" "}
                    {selectedProgram.program_type?.replaceAll("_", " ").toUpperCase() || "—"}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDate(selectedProgram.date)}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {formatTimeRange(selectedProgram.start_time, selectedProgram.end_time) || "—"}
                  </p>
                  <p>
                    <strong>Location:</strong> {selectedProgram.location || "—"}
                  </p>
                  {selectedProgram.description && <p>{selectedProgram.description}</p>}
                  <Link className="button outline" href={`/programs/${selectedProgram.id}`}>
                    View Program Details
                  </Link>
                </>
              ) : (
                <div className="calendar-empty-state">
                  {canBook ? (
                    <>
                      <p className="available-copy">Available for booking</p>
                      <p className="available-sub">This date is open. Book Bhairavi Bhajans for your event.</p>
                      <Link className="button" href={`/booking?date=${selected.iso}`}>
                        Book Now
                      </Link>
                    </>
                  ) : selected.kind === "blocked" ? (
                    <p className="available-sub">This date is not available for booking.</p>
                  ) : (
                    <p className="available-sub">This date has passed.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}