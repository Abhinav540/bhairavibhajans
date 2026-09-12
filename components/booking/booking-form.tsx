"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { WHATSAPP_BOOKING_URL } from "@/data/home";
import { formatDate } from "@/lib/format";

const EVENT_TYPES = [
  "temple_festival",
  "wedding",
  "concert",
  "religious",
  "corporate",
  "private",
  "other",
];

interface BookingFormProps {
  defaultDate?: string;
  defaultProgram?: string;
  programsSummary?: string[];
}

export function BookingForm({ defaultDate, defaultProgram, programsSummary }: BookingFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState(defaultDate ?? "");
  const [location, setLocation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please enter your name.");
    if (!phone.trim()) return setError("Please enter your phone number.");

    setBusy(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          event_type: eventType || null,
          event_date: eventDate || null,
          event_location: location.trim() || null,
          message: message.trim() || null,
          source: defaultProgram ? `program:${defaultProgram}` : "booking",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again or reach us on WhatsApp.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="booking-success">
        <div className="success-icon">
          <CheckCircle2 size={30} />
        </div>
        <h2>Enquiry Sent</h2>
        <p>
          Thank you {name.split(" ")[0]}! We received your enquiry and will get back to you
          shortly. For a faster response, send us a message on WhatsApp.
        </p>
        <a className="button" href={WHATSAPP_BOOKING_URL} target="_blank" rel="noopener noreferrer">
          Message us on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={submit}>
      <h3>Tell us about your event</h3>

      {error && (
        <div className="form-alert" role="alert">
          <Send size={15} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="bk-name">Your Name *</label>
          <input
            id="bk-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
            autoComplete="name"
          />
        </div>
        <div className="form-field">
          <label htmlFor="bk-phone">Phone / WhatsApp *</label>
          <input
            id="bk-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98xxxxxx00"
            autoComplete="tel"
          />
        </div>
        <div className="form-field">
          <label htmlFor="bk-type">Event Type</label>
          <select id="bk-type" value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="">— Select —</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="bk-date">Preferred Date</label>
          <input
            id="bk-date"
            type="date"
            value={eventDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setEventDate(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="bk-email">Email (optional)</label>
          <input
            id="bk-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="form-field">
          <label htmlFor="bk-loc">Event Location</label>
          <input
            id="bk-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Thrissur"
          />
        </div>
        <div className="form-field full">
          <label htmlFor="bk-msg">Message</label>
          <textarea
            id="bk-msg"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your occasion, expected audience, duration…"
          />
        </div>
      </div>

      <button className="button" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send Enquiry"}
      </button>

      {programsSummary && programsSummary.length > 0 && (
        <p className="form-note">You referenced the program: {programsSummary.join(", ")}.</p>
      )}
      {defaultDate && (
        <p className="form-note">
          Your selected date is <span className="selected-date">{formatDate(defaultDate)}</span>. If this
          date is taken, we will suggest the next available one.
        </p>
      )}
    </form>
  );
}