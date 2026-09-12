import type { Metadata } from "next";
import { CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Settings | Bhairavi Bhajans Admin",
};

function StatusBadge({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return (
    <span className={`settings-badge`} style={ok ? undefined : { color: "#ff8b9a", background: "rgba(227,57,78,0.1)", borderColor: "rgba(227,57,78,0.35)" }}>
      {ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
      {ok ? okText : badText}
    </span>
  );
}

export default function AdminSettingsPage() {
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const adminEmail = process.env.ADMIN_ALLOWED_EMAIL?.trim() || "";
  const vercelAnalyticsConfigured = Boolean(process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  return (
    <div className="admin-content">
      <div className="admin-page-head">
        <h1>Settings</h1>
        <p>Configuration and connection status for the Bhairavi Bhajans admin panel.</p>
      </div>

      <div className="admin-section glass-card">
        <div className="admin-section-header">
          <h2>Supabase Connection</h2>
        </div>
        <div className="settings-rows">
          <div className="settings-row">
            <div className="settings-row-info">
              <strong>Project URL</strong>
              <p>Public key and project URL used for the browser client.</p>
              {supabaseUrl && <span className="settings-value-mono">{supabaseUrl}</span>}
            </div>
            <StatusBadge
              ok={supabaseConfigured}
              okText="Configured"
              badText="Missing .env"
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <strong>Service role key</strong>
              <p>Server-only key used for admin CRUD. Never exposed to the browser.</p>
            </div>
            <StatusBadge
              ok={serviceRoleConfigured}
              okText="Configured"
              badText="Missing"
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <strong>Admin email restriction</strong>
              <p>
                {adminEmail
                  ? `Only ${adminEmail} can access the admin panel.`
                  : "No restriction set — any authenticated user who is listed in the admin_users table can log in."}
              </p>
            </div>
            <StatusBadge
              ok={Boolean(adminEmail)}
              okText="Restricted"
              badText="Open (admin_users table)"
            />
          </div>
        </div>
      </div>

      <div className="admin-section glass-card">
        <div className="admin-section-header">
          <h2>Website</h2>
        </div>
        <div className="settings-rows">
          <div className="settings-row">
            <div className="settings-row-info">
              <strong>WhatsApp booking number</strong>
              <p>Leads sent to the Bhairavi Bhajans WhatsApp.</p>
              <span className="settings-value-mono">918877001139</span>
            </div>
            <StatusBadge ok okText="Active" badText="" />
          </div>
          <div className="settings-row">
            <div className="settings-row-info">
              <strong>Vercel Web Analytics</strong>
              <p>Optional dashboard token, injected automatically by Vercel when enabled.</p>
            </div>
            <StatusBadge
              ok={vercelAnalyticsConfigured}
              okText="Token injected"
              badText="Not enabled"
            />
          </div>
        </div>
      </div>

      <div className="admin-section glass-card">
        <div className="admin-section-header">
          <h2>Need help?</h2>
        </div>
        <div className="settings-row">
          <div className="settings-row-info">
            <strong>Database schema &amp; RLS</strong>
            <p>
              Run supabase/schema.sql in the Supabase SQL editor to create all tables and row-level
              security policies, then add your admin user:
            </p>
            <span className="settings-value-mono">
              insert into public.admin_users (email) values (&apos;you@example.com&apos;);
            </span>
          </div>
          <a
            className="admin-ghost-btn"
            href={supabaseUrl ? `${supabaseUrl.replace("https://", "https://").split(".")[0]}.supabase.co/dashboard` : "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Supabase Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}