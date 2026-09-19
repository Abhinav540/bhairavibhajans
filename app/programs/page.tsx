import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getPublicPrograms } from "@/lib/programs";
import { todayISO } from "@/lib/format";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs & Live Dates | Bhairavi Bhajans",
  description: "Browse the Bhairavi Bhajans upcoming programs and book the band for your event.",
};

export default async function ProgramsPage() {
  const programs = await getPublicPrograms();
  const today = todayISO();
  const upcoming = programs
    .filter((p) => p.status === "booked" || p.status === "confirmed")
    .filter((p) => p.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <Navbar active="Programs" />
      <main className="programs-page">
        <section className="programs-hero">
          <h1>Programs &amp; Live Dates</h1>
          <div className="gold-rule"><span /></div>
          <p>
            See where Bhairavi Bhajans is performing next, and book us for your own event.
          </p>
          <Link className="button" href="/booking">
            Book a Program
          </Link>
        </section>
        <section className="programs-upcoming">
          <h2>Upcoming Programs</h2>
          <div className="programs-upcoming-list">
            {upcoming
              .slice(0, 6)
              .map((p) => (
                <article key={p.id} className="program-upcoming-card">
                  <div className="program-upcoming-date">
                    <span className="pud-day">{Number(p.date.slice(8, 10))}</span>
                    <span className="pud-month">{new Date(p.date).toLocaleString("en-GB", { month: "short" })}</span>
                  </div>
                  <div className="program-upcoming-info">
                    <h3>{p.title}</h3>
                    <p>{p.location || "Kerala"} • {p.program_type?.replaceAll("_", " ") || "Program"}</p>
                  </div>
                </article>
              ))}
            {upcoming.length === 0 && (
              <p className="empty-state">No upcoming programs right now — book us for your event.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
