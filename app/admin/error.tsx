"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Route-level error boundary for everything under /admin (login + dashboard).
 *
 * This is a safety net, not the primary error handling: /admin/login already
 * catches and displays Supabase auth errors inline. This boundary only kicks
 * in for something unexpected (a render crash, a bug, a stale/mismatched
 * deployment) so the user always sees a message instead of a blank page.
 */
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // No secret values here — just the error message, for debugging.
    console.error("[admin] Unhandled error:", error.message);
  }, [error]);

  return (
    <div className="admin-login-page">
      <div className="admin-login-panel">
        <h1>Admin Panel</h1>
        <p className="admin-login-sub">Something went wrong loading this page.</p>

        <div className="admin-alert" role="alert">
          <AlertCircle size={16} />
          <span>
            {error.message || "An unexpected error occurred. Please try again."}
          </span>
        </div>

        <button type="button" className="admin-primary-btn" onClick={() => retry()}>
          Try again
        </button>
      </div>
    </div>
  );
}
