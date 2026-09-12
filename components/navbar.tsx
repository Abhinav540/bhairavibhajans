"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Menu, X } from "lucide-react";
import { navLinks, WHATSAPP_BOOKING_URL } from "@/data/home";

export function getNavHref(link: string) {
  const normalized = link.trim().toLowerCase();
  if (normalized === "home") return "/";
  if (normalized === "about us" || normalized === "about" || normalized === "about-us") return "/about-us";
  if (normalized === "programs") return "/programs";
  if (normalized === "contact" || normalized === "book now" || normalized === "booking") return "/booking";
  return `/#${normalized.replaceAll(" ", "-")}`;
}

export function Navbar({ active }: { active?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <Link className="brand" href="/" aria-label="Bhairavi Bhajans home">
        <Image src="/images/bhairavi-logo.webp" alt="Bhairavi Bhajans" width={128} height={62} priority />
      </Link>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navLinks.map((link) => {
          const href = getNavHref(link);
          const isActive = active === link;
          return (
            <Link key={link} className={isActive ? "active" : ""} href={href}>
              {link}
            </Link>
          );
        })}
      </nav>
      <a
        href={WHATSAPP_BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="button"
        onClick={() => {
          import("@/lib/analytics/track").then((m) =>
            m.trackWhatsAppClick({ page: "navbar" })
          );
        }}
      >
        <CalendarDays size={17} /> Book a Program
      </a>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <nav className="mobile-nav">
          {navLinks.map((link) => (
            <Link onClick={() => setOpen(false)} key={link} href={getNavHref(link)}>
              {link}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}