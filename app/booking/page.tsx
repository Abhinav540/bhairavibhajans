import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BookingForm } from "@/components/booking/booking-form";
import { EnquiryForm } from "@/components/booking/enquiry-form";
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
                <h4>What happens next?</h4>
                <p>
                  We instantly check your selected date, then open WhatsApp with your details
                  pre-filled — just hit send and we&apos;ll confirm your program.
                </p>
              </div>
            </aside>
          </div>

          {/* Separate from booking: questions go straight to the CRM, no date or WhatsApp step. */}
          <section className="enquiry-section" id="enquiry">
            <div className="enquiry-divider">
              <span>Or send us an enquiry</span>
            </div>
            <div className="booking-form-panel enquiry-panel">
              <EnquiryForm />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}