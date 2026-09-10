"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, ChevronRight, MapPin, Play } from "lucide-react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { WHATSAPP_BOOKING_URL } from "@/data/home";

const heroImage = "/images/three-girls.jpg";
const templeImage = "/images/temple.jpg";
const stageImage = "/images/stage-performance.jpg";
const latestVideoThumbnail = "/images/oru-chiri-iru-chiri-thumbnail.jpeg";
const latestVideoUrl = "https://youtu.be/KQTKGEnUSTI?si=Yf0HRUpg_ROLLo2V";
const instagramReelsUrl = "https://www.instagram.com/_bhairavi_music_band_/reels/";

function GoldRule() {
  return (
    <div className="gold-rule">
      <span>✦</span>
    </div>
  );
}

function Button({ children, kind = "primary" }: { children: React.ReactNode; kind?: "primary" | "outline" }) {
  return (
    <button className={`button ${kind}`} type="button">
      {children}
    </button>
  );
}

function Hero() {
  return (
    <section id="home" className="hero">
      <div className="singer-photo" aria-hidden="true">
        <Image src={heroImage} alt="Bhairavi Bhajans Singers" fill priority sizes="(max-width: 760px) 100vw, 65vw" />
      </div>
      <div className="hero-shade" />
      <motion.div className="hero-copy" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <p className="eyebrow">Divine Melodies</p>
        <h1>
          <span>
            Soulful <em>Bhajans</em>
          </span>
          Timeless Devotion
        </h1>
        <GoldRule />
        <p className="hero-description">Bhairavi Bhajans is a devotional music group dedicated to spreading love, peace and devotion through soulful bhajans.</p>
        <div className="hero-actions">
          <a href={WHATSAPP_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="button">
            <CalendarDays size={17} /> Book a Program
          </a>
          <a href={instagramReelsUrl} target="_blank" rel="noopener noreferrer" className="button outline">
            <Play size={17} /> Watch Videos
          </a>
        </div>
      </motion.div>
    </section>
  );
}

function ContentCards() {
  return (
    <section className="content-grid">
      <article className="panel about" id="about-card">
        <h2>About Bhairavi</h2>
        <GoldRule />
        <div className="about-content">
          <div className="lamp">
            🪔<span>❀ ❀ ❀</span>
          </div>
          <div>
            <p>
              Bhairavi began in 2023 as a music band formed by friends at Chembai Memorial Government Music College. Today, Bhairavi has found its distinctive identity in Bhajan and devotional music.
            </p>
            <Link className="button" href="/about-us">
              Read More
            </Link>
          </div>
        </div>
      </article>

      <article className="panel program" id="programs">
        <div className="panel-heading">
          <h2>Upcoming Program</h2>
          <a href="#programs">
            View All <ChevronRight size={14} />
          </a>
        </div>
        <GoldRule />
        <div className="program-info">
          <div className="program-image">
            <Image src={templeImage} alt="Devi Temple Utsavam" fill sizes="250px" />
          </div>
          <time>
            <small>JUN</small>
            <strong>22</strong>
          </time>
          <div>
            <h3>Devi Temple Utsavam</h3>
            <p>
              <MapPin size={13} /> Kollam, Kerala
            </p>
            <p>◷ &nbsp;7:00 PM Onwards</p>
            <Button>View Details</Button>
          </div>
        </div>
      </article>

      <article className="panel video" id="videos">
        <div className="panel-heading">
          <h2>Latest Video</h2>
          <a href={latestVideoUrl} target="_blank" rel="noopener noreferrer">
            View All <ChevronRight size={14} />
          </a>
        </div>
        <a
          className="video-thumb"
          href={latestVideoUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Watch Bhairavi Bhajans at Oru Chiri Iru Chiri Bumber Chiri on YouTube"
        >
          <img src={latestVideoThumbnail} alt="Bhairavi Bhajans at Oru Chiri Iru Chiri Bumber Chiri" />
          <span className="video-play" aria-hidden="true">
            <Play fill="currentColor" size={14} />
          </span>
        </a>
        <h3>Bhairavi Bhajans at Oru Chiri Iru Chiri Bumber Chiri</h3>
      </article>
    </section>
  );
}

function StageSection() {
  return (
    <section className="stage-section" id="stage">
      <div className="stage-bg">
        <Image src={stageImage} alt="Bhairavi Bhajans Grand Stage Performance" fill sizes="(max-width: 760px) 100vw, 1425px" />
      </div>
      <div className="stage-overlay" />
      <div className="stage-content">
        <p className="stage-eyebrow">Live Stage Concerts</p>
        <h2>Experience Divine Devotion Live</h2>
        <GoldRule />
        <p className="stage-description">
          Captivating audiences with soulful devotional music, traditional instruments, and grand stage performances across temples and cultural events.
        </p>
        <div className="stage-actions">
          <a href={WHATSAPP_BOOKING_URL} target="_blank" rel="noopener noreferrer" className="button">
            <CalendarDays size={17} /> Book Live Concert
          </a>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar active="Home" />
      <main>
        <Hero />
        <ContentCards />
        <StageSection />
      </main>
      <Footer />
    </>
  );
}
