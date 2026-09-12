"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Users,
  X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/programs", label: "Programs", icon: CalendarDays },
  { href: "/admin/calendar", label: "Calendar", icon: CalendarRange },
  { href: "/admin/crm", label: "Enquiries / CRM", icon: Users },
  { href: "/admin/analytics", label: "Website Analytics", icon: BarChart3 },
  { href: "/admin/whatsapp", label: "WhatsApp Leads", icon: MessageCircle },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {NAV.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={isActive ? "admin-nav-link active" : "admin-nav-link"}
            onClick={onNavigate}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // still navigate away
    }
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <button className="admin-nav-link logout" onClick={logout} disabled={busy}>
      <LogOut size={18} />
      <span>{busy ? "Signing out…" : "Logout"}</span>
    </button>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-sidebar-brand">
          <Image src="/images/bhairavi-logo.webp" alt="Bhairavi Bhajans" width={110} height={52} priority />
          <span>Admin</span>
        </div>
        <div className="admin-sidebar-title">Bhairavi Bhajans Admin</div>
        <nav className="admin-nav">
          <NavItems onNavigate={() => setOpen(false)} />
          <LogoutButton />
        </nav>
      </aside>
      {/* Mobile header + toggle */}
      <div className="admin-mobile-bar">
        <button className="admin-menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Image src="/images/bhairavi-logo.webp" alt="Bhairavi Bhajans" width={96} height={46} />
      </div>
      {open && <div className="admin-mobile-backdrop" onClick={() => setOpen(false)} />}
    </>
  );
}