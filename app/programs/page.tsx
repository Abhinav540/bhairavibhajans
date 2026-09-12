import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProgramCalendar } from "@/components/programs/program-calendar";
import { getPublicAvailability, getPublicPrograms } from "@/lib/programs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programs & Live Dates | Bhairavi Bhajans",
  description: "Browse the Bhairavi Bhajans gig calendar, check availability and book the band for your event.",
};

export default async function ProgramsPage() {
  const [programs, availability] = await Promise.all([
    getPublicPrograms(),
    getPublicAvailability(),
  ]);

  return (
    <>
      <Navbar active="Programs" />
      <main className="programs-page">
        <section className="programs-hero">
          <h1>Programs &amp; Availability</h1>
          <div className="gold-rule"><span /></div>
          <p>
            See when Bhairavi Bhajans is performing, and find open dates to
            invite us to your event.
          </p>
        </section>
        <section className="programs-calendar-wrap">
          <ProgramCalendar programs={programs} availability={availability} />
        </section>
        <section className="programs-upcoming">
          <h2>Upcoming Programs</h2>
          <div className="programs-upcoming-list">
            {programs
              .filter((p) => p.status === "booked" || p.status === "confirmed")
              .filter((p) => p.date >= new Date().toISOString().slice(0, 10))
              .sort((a, b) => a.date.localeCompare(b.date))
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
            {programs.filter((p) => p.status !== "cancelled").filter((p) => p.date >= new Date().toISOString().slice(0, 10)).length === 0 && (
              <p className="empty-state">No upcoming programs right now — check the calendar for open dates.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}