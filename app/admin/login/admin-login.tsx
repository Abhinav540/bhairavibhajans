"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    } catch {
      setError("Something went wrong. Please try again.");
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
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={busy}
              />
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