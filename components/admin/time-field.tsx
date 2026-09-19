"use client";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

type Meridiem = "AM" | "PM";

interface TimeParts {
  hour: string;
  minute: string;
  meridiem: Meridiem;
}

/** "19:30" -> { hour: "7", minute: "30", meridiem: "PM" }. Blank when unset. */
function parseTime(value: string): TimeParts {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!match) return { hour: "", minute: "00", meridiem: "AM" };
  const hour24 = Number(match[1]);
  if (hour24 > 23) return { hour: "", minute: "00", meridiem: "AM" };
  return {
    hour: String(hour24 % 12 === 0 ? 12 : hour24 % 12),
    minute: match[2],
    meridiem: hour24 >= 12 ? "PM" : "AM",
  };
}

/** { hour: "7", minute: "30", meridiem: "PM" } -> "19:30". Blank hour clears it. */
function buildTime({ hour, minute, meridiem }: TimeParts): string {
  if (!hour) return "";
  const hour12 = Number(hour) % 12;
  const hour24 = meridiem === "PM" ? hour12 + 12 : hour12;
  return `${String(hour24).padStart(2, "0")}:${(minute || "00").padStart(2, "0")}`;
}

interface TimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

/**
 * Hour / minute / AM-PM dropdowns. Native `<input type="time">` only shows
 * AM/PM when the browser's locale happens to be 12-hour, so programs were
 * being entered against a 24-hour clock on some machines. The value stays
 * the "HH:mm" 24-hour string the API and database expect.
 */
export function TimeField({ value, onChange, label }: TimeFieldProps) {
  const parts = parseTime(value);
  // Keep an odd minute from older records selectable instead of dropping it.
  const minutes = MINUTES.includes(parts.minute) ? MINUTES : [...MINUTES, parts.minute].sort();

  const update = (patch: Partial<TimeParts>) => onChange(buildTime({ ...parts, ...patch }));

  return (
    <div className="admin-time-field">
      <select
        value={parts.hour}
        onChange={(e) => update({ hour: e.target.value })}
        aria-label={`${label} hour`}
      >
        <option value="">--</option>
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="admin-time-colon" aria-hidden="true">
        :
      </span>
      <select
        value={parts.minute}
        onChange={(e) => update({ minute: e.target.value })}
        disabled={!parts.hour}
        aria-label={`${label} minutes`}
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={parts.meridiem}
        onChange={(e) => update({ meridiem: e.target.value as Meridiem })}
        disabled={!parts.hour}
        aria-label={`${label} AM or PM`}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
