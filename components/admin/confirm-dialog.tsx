"use client";

import { useRef } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === backdropRef.current && !busy) onCancel();
      }}
      role="presentation"
    >
      <div className="admin-confirm" role="dialog" aria-modal="true" aria-label={title}>
        <div className="admin-confirm-icon">
          <AlertTriangle size={26} />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="admin-confirm-actions">
          <button className="admin-ghost-btn" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="admin-danger-btn" onClick={onConfirm} disabled={busy}>
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}