"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, Phone } from "lucide-react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { WHATSAPP_BOOKING_URL } from "@/data/home";

function GoldRule() {
  return (
    <div className="gold-rule" style={{ margin: "14px auto", width: "180px" }}>
      <span>✦</span>
    </div>
  );
}

function AboutHero() {
  return (
    <section className="about-hero">
      <div className="about-hero-bg">
        <Image
          src="/images/stage-performance.jpg"
          alt="Bhairavi Bhajans Ensemble On Stage"
          fill
          priority
          sizes="(max-width: 760px) 100vw, 1425px"
        />
      </div>
      <div className="about-hero-overlay" />
      <motion.div
        className="about-hero-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <p className="eyebrow" style={{ fontSize: "18px", letterSpacing: "1px" }}>
          Divine Harmony & Timeless Devotion
        </p>
        <h1>Spreading Love & Devotion Through Soulful Bhajans</h1>
        <GoldRule />
        <p className="about-hero-description">
          Discover the journey, musicians, and devotional philosophy behind Bhairavi Bhajans.
        </p>
      </motion.div>
    </section>
  );
}

export default function AboutPage() {
  const storyParagraphs = [
    {
      badge: "2023 • College Genesis",
      title: "The Beginning at Chembai Music College",
      text: "Bhairavi began in 2023 as a small music band formed by a group of close friends while pursuing their music degrees at Chembai Memorial Government Music College in Palakkad, Kerala. What started as informal jam sessions and a shared passion for Indian classical ragas gradually grew into a dedicated journey of performing, creating, and connecting with audiences through the power of soulful music.",
    },
    {
      badge: "Breakthrough • Stage & Sound",
      title: "MPAM Festival & Band Management",
      text: "Our first major opportunity to perform on a prominent stage came at the prestigious MPAM Music Festival. It was here that we met Sandeep, who worked as the lead sound engineer for the festival. Impressed by our vocal harmony and spiritual energy, his support and guidance later led him to become our official manager, playing an instrumental role in shaping Bhairavi's professional path, stage sound engineering, and concert production.",
    },
    {
      badge: "Television & Media Highlights",
      title: "Broadcasting Across Leading Networks",
      text: "As we continued performing across temples and cultural festivals, we explored diverse musical spaces including live stage concerts and broadcasts. Our renditions gained widespread appreciation through social media and opened opportunities to collaborate with leading media platforms such as Flowers TV, Mazhavil Manorama, Club FM, and Millennium, bringing devotional music to millions of viewers.",
    },
    {
      badge: "Divine Mission & Future",
      title: "Devotional Identity & Musical Philosophy",
      text: "Today, Bhairavi has found its distinctive identity in Bhajan and devotional music. We aim to present traditional devotional compositions with a fresh, soulful musical approach, creating an atmosphere where music becomes a vehicle for devotion, peace, and spiritual connection. From a group of college friends to a dedicated devotional music ensemble, Bhairavi continues its journey with the same timeless passion that brought us together in the beginning.",
    },
  ];

  return (
    <>
      <Navbar active="About Us" />
      <main style={{ paddingTop: "20px" }}>
        {/* Static Hero Banner without Scroll Animation */}
        <AboutHero />

        {/* Detailed Story Section with Scroll-Triggered Paragraph Animations */}
        <section className="about-story-container">
          <div className="about-story-header">
            <p className="eyebrow" style={{ fontSize: "15px" }}>
              Our Full Journey
            </p>
            <h2>The Story of Bhairavi Bhajans</h2>
            <GoldRule />
            <p style={{ fontSize: "15px", color: "#c9bfb1", maxWidth: "600px", margin: "0 auto" }}>
              A complete look into how a group of college friends built one of Kerala's most soulful devotional music ensembles.
            </p>
          </div>

          <div className="about-story-paragraphs">
            {storyParagraphs.map((item, index) => (
              <motion.article
                key={item.title}
                className="story-paragraph-card"
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <h3>
                  {item.title} <span>{item.badge}</span>
                </h3>
                <p>{item.text}</p>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Key Highlights Grid */}
        <section className="content-grid" style={{ marginTop: "30px", marginBottom: "30px" }}>
          <article className="panel" style={{ textAlign: "center", padding: "20px 14px" }}>
            <h3 style={{ color: "var(--gold)", fontSize: "32px", margin: "0 0 2px", fontFamily: "'Cormorant Garamond', serif" }}>
              2023
            </h3>
            <p style={{ color: "#c9bfb1", fontSize: "12.5px", margin: 0 }}>Year Founded</p>
          </article>
          <article className="panel" style={{ textAlign: "center", padding: "20px 14px" }}>
            <h3 style={{ color: "var(--gold)", fontSize: "32px", margin: "0 0 2px", fontFamily: "'Cormorant Garamond', serif" }}>
              15+
            </h3>
            <p style={{ color: "#c9bfb1", fontSize: "12.5px", margin: 0 }}>Ensemble Artists</p>
          </article>
          <article className="panel" style={{ textAlign: "center", padding: "20px 14px" }}>
            <h3 style={{ color: "var(--gold)", fontSize: "32px", margin: "0 0 2px", fontFamily: "'Cormorant Garamond', serif" }}>
              50+
            </h3>
            <p style={{ color: "#c9bfb1", fontSize: "12.5px", margin: 0 }}>Stage Concerts</p>
          </article>
        </section>

        {/* Call to Action Section */}
        <section className="stage-section" style={{ minHeight: "400px", marginTop: "30px", marginBottom: "50px" }}>
          <div className="stage-bg">
            <Image
              src="/images/stage-performance.jpg"
              alt="Bhairavi Bhajans Concert"
              fill
              sizes="(max-width: 760px) 100vw, 1425px"
            />
          </div>
          <div className="stage-overlay" />
          <div className="stage-content" style={{ maxWidth: "750px", textAlign: "center" }}>
            <p className="stage-eyebrow">Book Bhairavi Live</p>
            <h2>Experience Divine Harmony at Your Event</h2>
            <GoldRule />
            <p className="stage-description">
              Invite Bhairavi Bhajans to perform live for temple festivals, cultural programs, or spiritual gatherings across Kerala.
            </p>
            <div className="stage-actions" style={{ justifyContent: "center", marginTop: "20px" }}>
              <a href={WHATSAPP_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="button">
                <CalendarDays size={17} /> Book Live Concert
              </a>
              <a href="tel:+918877001139" className="button outline">
                <Phone size={17} /> Call (+91 88770 01139)
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
