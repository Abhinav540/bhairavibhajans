"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

interface LoginDiagnostics {
  configured: {
    url: boolean;
    anonKey: boolean;
    serviceRoleKey: boolean;
    adminAllowedEmail: boolean;
  };
  supabaseReachable: boolean | null;
  hint: string | null;
}

async function fetchLoginDiagnostics(): Promise<LoginDiagnostics | null> {
  try {
    const res = await fetch("/api/diagnostics/login", { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function describeLoginFailure(err: unknown, diag: LoginDiagnostics | null, isDev: boolean): string {
  const message = err instanceof Error ? err.message : "";
  const lower = message.toLowerCase();

  if (isDev) {
    return message || "Something went wrong. Please try again.";
  }

  const clientBlockedOnMissingUrl = lower.includes("supabaseurl is required");
  const clientBlockedOnMissingKey = lower.includes("supabasekey is required");

  // The deployed client bundle was built without the Supabase config baked in.
  if (clientBlockedOnMissingUrl || clientBlockedOnMissingKey) {
    if (diag && (diag.configured.url || diag.configured.anonKey)) {
      return "This deployment was built before the Supabase environment variables were set. The site owner must add the variables in Vercel and redeploy.";
    }
    return "Sign-in is not configured yet. The site owner must add the Supabase environment variables in Vercel and redeploy.";
  }

  if (diag) {
    if (!diag.configured.url || !diag.configured.anonKey) {
      return "Sign-in is not configured yet. The site owner must add the Supabase environment variables in Vercel and redeploy.";
    }
    if (diag.supabaseReachable === false) {
      return "The authentication service could not be reached. Please try again later or contact the site owner.";
    }
  }

  return "Something went wrong. Please try again.";
}

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      console.error("Admin login failed:", err instanceof Error ? err.message : err);
      const diag = await fetchLoginDiagnostics().catch(() => null);
      setError(describeLoginFailure(err, diag, process.env.NODE_ENV !== "production"));
      setBusy(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-panel">
        <div className="admin-login-brand">
          <Image src="/images/bhairavi-logo.webp" alt="Bhairavi Bhajans" width={150} height={70} priority />
        </div>
        <h1>Admin Panel</h1>
        <p className="admin-login-sub">
          Sign in to manage programs, bookings and analytics.
        </p>

        {error && (
          <div className="admin-alert" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} className="admin-login-form">
          <label>
            <span>Email</span>
            <div className="admin-field">
              <Mail size={16} />
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
              />
            </div>
          </label>
          <label>
            <span>Password</span>
            <div className="admin-field">
              <Lock size={16} />
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="admin-pswd-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                disabled={busy}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <button type="submit" className="admin-primary-btn" disabled={busy}>
            {busy ? <Loader2 size={17} className="spin" /> : null}
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}