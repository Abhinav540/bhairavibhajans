"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export interface ToastState {
  type: "success" | "error";
  message: string;
}

export function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4200);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  const Icon = toast.type === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className={`admin-toast ${toast.type}`} role="status">
      <Icon size={18} />
      <span>{toast.message}</span>
      <button onClick={onClose} aria-label="Dismiss">
        <X size={15} />
      </button>
    </div>
  );
}