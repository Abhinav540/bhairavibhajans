"use client";

import { useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/data/home";
import { formatDate, isISODate } from "@/lib/format";

interface BookingFormProps {
  defaultDate?: string;
  defaultProgram?: string;
  programsSummary?: string[];
}

export function BookingForm({ defaultDate, defaultProgram, programsSummary }: BookingFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(defaultDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentDate, setSentDate] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please enter your name.");
    if (!phone.trim()) return setError("Please enter your mobile number.");
    if (!location.trim()) return setError("Please enter the event location.");
    if (!date || !isISODate(date)) return setError("Please select a date.");

    setBusy(true);
    try {
      const res = await fetch(`/api/availability/check?date=${date}`);
      const check = await res.json();
      if (!res.ok) {
        setError(check.error ?? "Could not check availability. Please try again.");
        return;
      }
      if (!check.available) {
        setError(`${formatDate(date)} is unavailable. Please choose another date.`);
        return;
      }

      // Best-effort lead log for the admin CRM — never blocks WhatsApp below.
      fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          event_date: date,
          event_location: location.trim(),
          source: defaultProgram ? `program:${defaultProgram}` : "booking",
        }),
      }).catch(() => {});

      import("@/lib/analytics/track").then((m) =>
        m.trackWhatsAppClick({ page: "/booking", programId: defaultProgram ?? null })
      );

      const message = [
        "Hello Bhairavi Bhajans, I would like to book a program.",
        `Name: ${name.trim()}`,
        `Location: ${location.trim()}`,
        `Date: ${formatDate(date)}`,
      ].join("\n");
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank", "noopener,noreferrer");
      setSentDate(date);
    } catch {
      setError("Network error. Please try again or reach us on WhatsApp.");
    } finally {
      setBusy(false);
    }
  };

  if (sentDate) {
    return (
      <div className="booking-success">
        <div className="success-icon">
          <MessageCircle size={30} />
        </div>
        <h2>Almost there!</h2>
        <p>
          We opened WhatsApp with your booking details for{" "}
          <span className="selected-date">{formatDate(sentDate)}</span>. Just hit send there
          and we&apos;ll confirm your program shortly.
        </p>
        <button type="button" className="button outline" onClick={() => setSentDate(null)}>
          Book another date
        </button>
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
          <label htmlFor="bk-phone">Mobile Number *</label>
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
          <label htmlFor="bk-loc">Event Location *</label>
          <input
            id="bk-loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Thrissur"
          />
        </div>
        <div className="form-field">
          <label htmlFor="bk-date">Event Date *</label>
          <input
            id="bk-date"
            type="date"
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <button className="button" type="submit" disabled={busy}>
        {busy ? <Loader2 size={16} className="spin" /> : null} {busy ? "Checking…" : "Book Now"}
      </button>

      {programsSummary && programsSummary.length > 0 && (
        <p className="form-note">You referenced the program: {programsSummary.join(", ")}.</p>
      )}
    </form>
  );
}
