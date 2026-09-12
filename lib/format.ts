const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function monthName(monthIndex: number): string {
  return MONTHS[monthIndex] ?? "";
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso: string | null): Date | null {
  if (!iso) return null;
  const parts = iso.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function formatDate(iso: string): string {
  const date = fromISODate(iso);
  if (!date) return iso;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDateShort(iso: string): string {
  const date = fromISODate(iso);
  if (!date) return iso;
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

export function formatTime(hhmm: string | null): string {
  if (!hhmm || !/^\d{2}:\d{2}$/.test(hhmm)) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function formatTimeRange(start: string | null, end: string | null): string {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s} – ${e}`;
  return s || e || "—";
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Build a grid of dates for a given month. Returns a 2D array keyed
 * by week rows. Leading cells are null. The grid starts on the
 * configured `weekStartsOn` day (0 = Sunday default).
 */
export function buildMonthGrid(year: number, monthIndex: number, weekStartsOn: 0 | 1 = 0): (string | null)[][] {
  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = (firstDay.getDay() - weekStartsOn + 7) % 7;

  const cells: (string | null)[] = [];
  for (let i = 0; i < leading; i++) {
    cells.push(toISODate(new Date(year, monthIndex, 1 - leading + i)));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(toISODate(new Date(year, monthIndex, d)));
  }
  let trailingDay = daysInMonth;
  while (cells.length % 7 !== 0) {
    trailingDay += 1;
    cells.push(toISODate(new Date(year, monthIndex, trailingDay)));
  }

  const rows: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

export function daysBetween(startISO: string, endISO: string): number {
  const s = fromISODate(startISO)?.getTime() ?? 0;
  const e = fromISODate(endISO)?.getTime() ?? 0;
  return Math.round((e - s) / 86400000);
}

export function addDaysISO(iso: string, days: number): string {
  const d = fromISODate(iso);
  if (!d) return iso;
  d.setDate(d.getDate() + days);
  return toISODate(d);
}