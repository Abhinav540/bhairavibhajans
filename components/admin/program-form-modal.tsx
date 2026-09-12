"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Loader2 } from "lucide-react";
import type { Program, ProgramStatus } from "@/lib/types";
import { Toast, type ToastState } from "@/components/admin/toast";
import { ImageUploader } from "@/components/admin/image-uploader";

const PROGRAM_TYPES = [
  { value: "", label: "— Select type —" },
  { value: "temple_festival", label: "Temple Festival" },
  { value: "wedding", label: "Wedding" },
  { value: "concert", label: "Concert" },
  { value: "religious", label: "Religious" },
  { value: "corporate", label: "Corporate" },
  { value: "private", label: "Private" },
  { value: "other", label: "Other" },
];

const STATUSES: ProgramStatus[] = ["booked", "confirmed", "completed", "cancelled"];

interface FormState {
  title: string;
  description: string;
  program_type: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  status: ProgramStatus;
  image: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  program_type: "",
  date: "",
  start_time: "",
  end_time: "",
  location: "",
  status: "booked",
  image: "",
};

interface ProgramFormModalProps {
  open: boolean;
  editing: Program | null;
  defaultDate?: string;
  onClose: () => void;
  onSaved: (program: Program, mode: "created" | "updated") => void;
}

export function ProgramFormModal({ open, editing, defaultDate, onClose, onSaved }: ProgramFormModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [lastFormKey, setLastFormKey] = useState<string | null>(null);

  const formKey = editing?.id ?? null;
  const openKey = open ? (formKey ?? `new:${defaultDate ?? ""}`) : null;

  if (openKey !== lastFormKey) {
    setLastFormKey(openKey);
    if (open) {
      if (editing) {
        setForm({
          title: editing.title,
          description: editing.description ?? "",
          program_type: editing.program_type ?? "",
          date: editing.date,
          start_time: editing.start_time ?? "",
          end_time: editing.end_time ?? "",
          location: editing.location ?? "",
          status: editing.status,
          image: editing.image ?? "",
        });
      } else {
        setForm({ ...EMPTY_FORM, date: defaultDate ?? "" });
      }
    }
  }

  if (!open) return null;

  const setField = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setToast({ type: "error", message: "Title is required." });
      return;
    }
    if (!form.date) {
      setToast({ type: "error", message: "Program date is required." });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...(editing ? { id: editing.id } : {}),
        title: form.title,
        description: form.description,
        program_type: form.program_type || null,
        date: form.date,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
        location: form.location || null,
        status: form.status,
        image: form.image || null,
      };
      const res = await fetch("/api/admin/programs", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setToast({ type: "error", message: json.error ?? "Could not save the program." });
        return;
      }
      setToast({ type: "success", message: editing ? "Program updated." : "Program created." });
      onSaved(json.program, editing ? "updated" : "created");
      onClose();
    } catch {
      setToast({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={() => !saving && onClose()} role="presentation">
        <form className="admin-form-modal" onSubmit={save} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{editing ? "Edit Program" : "Add New Program"}</h2>
            <button type="button" className="close-btn" onClick={onClose} aria-label="Close" disabled={saving}>
              <X size={18} />
            </button>
          </div>
          <div className="admin-form-grid">
            <label className="admin-form-field span-2">
              <span>Program Title *</span>
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. Temple Festival" />
            </label>
            <label className="admin-form-field">
              <span>Date *</span>
              <input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
            </label>
            <label className="admin-form-field">
              <span>Program Type</span>
              <select value={form.program_type} onChange={(e) => setField("program_type", e.target.value)}>
                {PROGRAM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </label>
            <label className="admin-form-field">
              <span>Start Time</span>
              <input type="time" value={form.start_time} onChange={(e) => setField("start_time", e.target.value)} />
            </label>
            <label className="admin-form-field">
              <span>End Time <em className="optional-hint">(optional)</em></span>
              <input type="time" value={form.end_time} onChange={(e) => setField("end_time", e.target.value)} />
            </label>
            <label className="admin-form-field">
              <span>Location</span>
              <input value={form.location} onChange={(e) => setField("location", e.target.value)} placeholder="e.g. Kochi" />
            </label>
            <label className="admin-form-field">
              <span>Status</span>
              <select value={form.status} onChange={(e) => setField("status", e.target.value)}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="admin-form-field span-2">
              <span>Image <em className="optional-hint">(optional)</em></span>
              <div className="admin-image-field">
                <input value={form.image} onChange={(e) => setField("image", e.target.value)} placeholder="https://… or pick from gallery" />
                <button type="button" className="admin-ghost-btn" onClick={() => setGalleryOpen(true)}>
                  Add Image
                </button>
              </div>
              {form.image && (
                <div className="admin-image-preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image} alt="" />
                  <button type="button" className="close-btn" onClick={() => setField("image", "")} aria-label="Remove image">
                    <X size={16} />
                  </button>
                </div>
              )}
            </label>
            <label className="admin-form-field span-2">
              <span>Description</span>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Short description of the program (optional)"
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="button" className="admin-ghost-btn" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="admin-accent-btn" disabled={saving}>
              {saving ? <Loader2 size={16} className="spin" /> : null} {saving ? "Saving…" : "Save Program"}
            </button>
          </div>
        </form>
      </div>
      {galleryOpen && (
        <ImageUploader onSelect={(url) => setField("image", url)} onClose={() => setGalleryOpen(false)} />
      )}
      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </>
  );
}