import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, CalendarDays, Clock, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getPublicProgramById } from "@/lib/programs";
import { formatDate, formatTimeRange } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = await getPublicProgramById(id);
  if (!program) {
    return { title: "Program Not Found | Bhairavi Bhajans" };
  }
  return {
    title: `${program.title} | Bhairavi Bhajans`,
    description: program.description?.slice(0, 160) ?? `Program on ${formatDate(program.date)} at ${program.location}.`,
  };
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const program = await getPublicProgramById(id);

  if (!program || program.status === "cancelled") notFound();

  const statusLabel = program.status === "confirmed" ? "Confirmed" : program.status === "completed" ? "Completed" : "Program / Booked";

  return (
    <>
      <Navbar active="Programs" />
      <main className="program-detail-page">
        <div className="program-detail-inner">
          <Link href="/programs" className="back-link">
            <ArrowLeft size={15} /> Back to Calendar
          </Link>

          {program.image ? (
            <div className="program-detail-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={program.image}
                alt={program.title}
                width={960}
                height={480}
                style={{ objectFit: "cover", width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <div className="program-detail-image placeholder">
              <div />
            </div>
          )}

          <span className={`program-detail-status status-${program.status}`}>{statusLabel}</span>

          <h1>{program.title}</h1>
          <div className="gold-rule"><span /></div>

          <div className="program-detail-facts">
            <div className="pd-fact">
              <CalendarDays size={16} />
              <div>
                <span>DATE</span>
                <strong>{formatDate(program.date)}</strong>
              </div>
            </div>
            <div className="pd-fact">
              <Clock size={16} />
              <div>
                <span>TIME</span>
                <strong>{formatTimeRange(program.start_time, program.end_time) || "—"}</strong>
              </div>
            </div>
            <div className="pd-fact">
              <MapPin size={16} />
              <div>
                <span>LOCATION</span>
                <strong>{program.location || "—"}</strong>
              </div>
            </div>
          </div>

          <section className="program-detail-description">
            <h2>About this program</h2>
            <p>{program.description || "Soulful devotional bhajans performed live by Bhairavi Bhajans."}</p>
          </section>

          <section className="program-detail-cta">
            <p>
              Want Bhairavi Bhajans at your own event?
            </p>
            <Link className="button" href={`/booking?program=${program.id}&date=${program.date}`}>
              Book a Similar Program
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

export const dynamic = "force-dynamic";