import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BookingForm } from "@/components/booking/booking-form";
import { WHATSAPP_BOOKING_URL } from "@/data/home";
import { getPublicPrograms } from "@/lib/programs";
import { isISODate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Book a Program | Bhairavi Bhajans",
  description: "Invite Bhairavi Bhajans to your temple festival, wedding, concert or private event. Send a booking enquiry today.",
};

interface BookingPageProps {
  searchParams: Promise<{ date?: string; program?: string }>;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const defaultDate = params.date && isISODate(params.date) ? params.date : undefined;
  const defaultProgram = typeof params.program === "string" ? params.program : undefined;

  const programs = await getPublicPrograms();
  const referenced = defaultProgram
    ? programs.filter((p) => p.id === defaultProgram).map((p) => p.title)
    : [];

  return (
    <>
      <Navbar active="Contact" />
      <main className="booking-page">
        <div className="booking-inner">
          <section className="booking-hero">
            <h1>Book Bhairavi Bhajans</h1>
            <div className="gold-rule"><span /></div>
            <p>
              Send us the details of your event and we will get back to you with
              availability and pricing.
            </p>
          </section>

          <div className="booking-layout">
            <div className="booking-form-panel">
              <BookingForm
                defaultDate={defaultDate}
                defaultProgram={defaultProgram}
                programsSummary={referenced}
              />
            </div>
            <aside className="booking-side">
              <div className="booking-side-card">
                <h4>Prefer WhatsApp?</h4>
                <p>
                  Skip the form and message us directly on WhatsApp for the fastest response.
                </p>
                <a className="button outline" href={WHATSAPP_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </div>
              <div className="booking-side-card">
                <h4>What happens next?</h4>
                <p>
                  We review your enquiry, check the calendar for your requested date, and contact
                  you to confirm the program details.
                </p>
              </div>
              <div className="booking-side-card">
                <h4>Check availability first</h4>
                <p>
                  Browse the public calendar to see upcoming programs and open dates.
                </p>
                <Link className="button outline" href="/programs">
                  View Calendar
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}