"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

/**
 * General questions that aren't a booking — pricing, repertoire, a date that
 * isn't fixed yet. Saved straight to the admin CRM; unlike the booking form it
 * doesn't check availability or hand off to WhatsApp.
 */
export function EnquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please enter your name.");
    if (!phone.trim()) return setError("Please enter your mobile number.");
    if (!message.trim()) return setError("Please type your question or message.");

    setBusy(true);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          message: message.trim(),
          source: "General enquiry",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? "We couldn't send your enquiry. Please try again.");
        return;
      }
      setSent(true);
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Network error. Please try again or reach us on WhatsApp.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="booking-success">
        <div className="success-icon">
          <CheckCircle2 size={30} />
        </div>
        <h2>Thank you!</h2>
        <p>We&apos;ve received your enquiry and will get back to you soon.</p>
        <button type="button" className="button outline" onClick={() => setSent(false)}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form className="booking-form" onSubmit={submit} noValidate>
      <h3>Have a question?</h3>
      <p className="enquiry-lead">
        Ask us anything — pricing, songs, or a program you&apos;re still planning. No date needed.
      </p>

      {error && (
        <div className="form-alert" role="alert">
          <Send size={15} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="enq-name">Your Name *</label>
          <input
            id="enq-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
            autoComplete="name"
          />
        </div>
        <div className="form-field">
          <label htmlFor="enq-phone">Mobile Number *</label>
          <input
            id="enq-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98xxxxxx00"
            autoComplete="tel"
          />
        </div>
        <div className="form-field full">
          <label htmlFor="enq-email">
            Email <span className="enquiry-optional">(optional)</span>
          </label>
          <input
            id="enq-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="form-field full">
          <label htmlFor="enq-message">Your Message *</label>
          <textarea
            id="enq-message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you'd like to know…"
          />
        </div>
      </div>

      <button className="button" type="submit" disabled={busy}>
        {busy ? <Loader2 size={16} className="spin" /> : <Send size={16} />} {busy ? "Sending…" : "Send Enquiry"}
      </button>
    </form>
  );
}
