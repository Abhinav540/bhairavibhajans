"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

interface Member {
  name: string;
  role?: string;
  bio: string;
  image: string;
  imagePos: "left" | "right";
}

const vocalists: Member[] = [
  {
    name: "APARNA SURENDRAN",
    bio: "APARNA IS A NATIVE OF PARAPPANANGADI IN MALAPPURAM DISTRICT. SHE IS CURRENTLY A FINAL-YEAR MA MUSIC STUDENT AT CHEMBAI MUSIC COLLEGE.",
    image: "/images/singers/aparna.png",
    imagePos: "left",
  },
  {
    name: "DEVIKA SURESH",
    bio: "DEVIKA IS A NATIVE OF KOTTAKKAL, MALAPPURAM. SHE HAS BEEN LEARNING MUSIC FROM A VERY YOUNG AGE AND COMPLETED HER STUDIES AT VICTORIA COLLEGE, PALAKKAD.",
    image: "/images/singers/devika.png",
    imagePos: "right",
  },
  {
    name: "ANAGHA",
    bio: "ANAGHA IS A NATIVE OF CHERPULASSERY IN PALAKKAD DISTRICT. SHE COMPLETED HER MA MUSIC FROM CHEMBAI MUSIC COLLEGE, PALAKKAD.",
    image: "/images/singers/anagha.png",
    imagePos: "left",
  },
  {
    name: "SUDHISHMA",
    bio: "SUDHISHMA IS A NATIVE OF KANNUR. SHE IS CURRENTLY A FINAL-YEAR MA MUSIC STUDENT AT CHEMBAI MUSIC COLLEGE, PALAKKAD.",
    image: "/images/singers/sudhishma.png",
    imagePos: "right",
  },
  {
    name: "ANUGAMA",
    bio: "ANUGAMA IS A NATIVE OF KANNUR. SHE IS CURRENTLY A FINAL-YEAR MA MUSIC STUDENT AT CHEMBAI MUSIC COLLEGE, PALAKKAD.",
    image: "/images/singers/anugama.png",
    imagePos: "left",
  },
  {
    name: "AATHMAJA",
    bio: "AATHMAJA IS A NATIVE OF KANNUR. SHE IS CURRENTLY A FINAL-YEAR MA MUSIC STUDENT AT CHEMBAI MUSIC COLLEGE, PALAKKAD.",
    image: "/images/singers/aathmaja.png",
    imagePos: "right",
  },
  {
    name: "KRISHNA",
    bio: "KRISHNA IS A NATIVE OF CHERPULASSERY IN PALAKKAD DISTRICT. SHE COMPLETED HER MA MUSIC FROM CHEMBAI MUSIC COLLEGE, PALAKKAD.",
    image: "/images/singers/krishna.png",
    imagePos: "left",
  },
  {
    name: "AARATHI",
    bio: "AARATHI IS A NATIVE OF WAYANAD. SHE COMPLETED HER BA MUSIC AT CHEMBAI MUSIC COLLEGE, PALAKKAD, AND IS CURRENTLY A FINAL-YEAR MA MUSIC STUDENT AT KANNUR MUSIC COLLEGE.",
    image: "/images/singers/aarathi.png",
    imagePos: "right",
  },
];

const instrumentalists: Member[] = [
  {
    name: "ANIRUDH",
    role: "MRIDANGAM",
    bio: "ANIRUDH IS A NATIVE OF TIRUR, MALAPPURAM. HE COMPLETED HIS BA MRIDANGAM AT CHEMBAI MUSIC COLLEGE AND IS CURRENTLY A FINAL-YEAR MA MRIDANGAM STUDENT AT KERALA KALAMANDALAM. IN ADDITION TO MRIDANGAM, ANIRUDH IS HIGHLY SKILLED IN JAZZ DRUMS, RHYTHM PAD, TABLA, AND VARIOUS OTHER PERCUSSION INSTRUMENTS.",
    image: "/images/singers/anirudh.png",
    imagePos: "right",
  },
  {
    name: "ABHINAV",
    role: "RHYTHM PAD",
    bio: "ABHINAV IS A NATIVE OF TIRUR, MALAPPURAM. AFTER COMPLETING HIS B.TECH, HE IS CURRENTLY WORKING AS A SOFTWARE ENGINEER. ALONG WITH RHYTHM PAD, HE ALSO PLAYS TABLA AND JAZZ DRUMS.",
    image: "/images/singers/abhinav.png",
    imagePos: "left",
  },
  {
    name: "ADARSH",
    role: "HARMONIUM & KEYBOARD",
    bio: "ADARSH IS A NATIVE OF TIRUR, MALAPPURAM. HE IS CURRENTLY PURSUING HIS B.TECH IN ERNAKULAM. ADARSH IS ALSO A TALENTED SINGER AND ACTOR. HE NOTABLY PORTRAYED MOHANLAL'S YOUNGER CHARACTER IN THE FILM LUCIFER.",
    image: "/images/singers/adarsh.png",
    imagePos: "right",
  },
  {
    name: "SHIJITH",
    role: "FLUTE",
    bio: "SHIJITH IS A NATIVE OF EDAPPAL IN MALAPPURAM DISTRICT. ALONG WITH BEING A TALENTED SINGER, HE IS ALSO A STUDIO RECORDING ARTIST.",
    image: "/images/singers/shijith.png",
    imagePos: "left",
  },
  {
    name: "MRIDULRAG",
    role: "VIOLIN",
    bio: "MRIDULRAG IS A NATIVE OF KANNUR. AFTER COMPLETING HIS STUDIES, HE BECAME A FULL-TIME VIOLIN ARTIST AND IS ALSO A MEMBER OF SEVERAL MUSIC BANDS.",
    image: "/images/singers/mridulrag.png",
    imagePos: "right",
  },
];

const technicalTeam: Member[] = [
  {
    name: "SANDEEP KS",
    bio: "SANDEEP KS IS THE MANAGER AND SOUND ENGINEER OF BHAIRAVI MUSIC BAND",
    image: "/images/singers/sandeep.png",
    imagePos: "left",
  },
  {
    name: "ARUN JAYAPRAKASH",
    bio: "ARUN JAYAPRAKASH IS THE TECHNICAL CORDINATOR AND PHOTOGRAPHER OF BHAIRAVI MUSIC BAND",
    image: "/images/singers/arun.png",
    imagePos: "right",
  },
  {
    name: "RANJITH",
    bio: "RANJITH VJ IS THE VISUAL JOCKY OF BHAIRAVI MUSIC BAND",
    image: "/images/singers/ranjith.png",
    imagePos: "left",
  },
];

function MemberCard({ member }: { member: Member }) {
  const isLeft = member.imagePos === "left";

  return (
    <motion.article
      className={`singers-card ${isLeft ? "img-left" : "img-right"}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5 }}
    >
      <div className="member-photo-container">
        <Image
          src={member.image}
          alt={member.name}
          width={220}
          height={260}
          className="member-photo"
          priority
        />
      </div>
      <div className="member-info">
        <h3 className="member-name">
          {member.name} {member.role && <span className="member-role">— {member.role}</span>}
        </h3>
        <p className="member-bio">{member.bio}</p>
      </div>
    </motion.article>
  );
}

export default function SingersPage() {
  return (
    <>
      <Navbar active="Our Team" />
      <main className="singers-page-wrap">
        {/* Fixed Background Image with Temple Arch */}
        <div className="singers-bg-layer">
          <Image
            src="/images/singers-bg.jpg"
            alt="Temple Arch Background"
            fill
            priority
            sizes="100vw"
            quality={90}
          />
          <div className="singers-bg-overlay" />
        </div>

        <div className="singers-container">
          {/* Top Logo & Band Bio Header */}
          <header className="singers-header">
            <div className="singers-logo-wrap">
              <Image
                src="/images/bhairavi-logo.png"
                alt="Bhairavi Bhajans Emblem"
                width={180}
                height={85}
                priority
              />
            </div>
            <p className="singers-intro-text">
              BHAIRAVI MUSIC BAND WAS STARTED FIVE YEARS AGO BY THE UNDERGRADUATE STUDENTS OF CHEMBAI MEMORIAL GOVERNMENT MUSIC COLLEGE. IT HAS BEEN ONE YEAR SINCE BHAIRAVI BEGAN FOCUSING EXCLUSIVELY ON BHAJANS. AT PRESENT, THE BAND PERFORMS ONLY BHAJANS.
            </p>
          </header>

          {/* VOCALISTS SECTION */}
          <section className="singers-section">
            <h2 className="singers-section-title">VOCALISTS</h2>
            <div className="singers-grid">
              {vocalists.map((m) => (
                <MemberCard key={m.name} member={m} />
              ))}
            </div>
          </section>

          {/* INSTRUMENTALISTS SECTION */}
          <section className="singers-section">
            <div className="singers-logo-divider">
              <Image
                src="/images/bhairavi-logo.png"
                alt="Bhairavi Logo"
                width={120}
                height={55}
              />
            </div>
            <h2 className="singers-section-title">INSTRUMENTALISTS</h2>
            <div className="singers-grid">
              {instrumentalists.map((m) => (
                <MemberCard key={m.name} member={m} />
              ))}
            </div>
          </section>

          {/* TECHNICAL TEAM SECTION */}
          <section className="singers-section">
            <div className="singers-logo-divider">
              <Image
                src="/images/bhairavi-logo.png"
                alt="Bhairavi Logo"
                width={120}
                height={55}
              />
            </div>
            <h2 className="singers-section-title">OUR TECHNICAL TEAM</h2>
            <div className="singers-grid">
              {technicalTeam.map((m) => (
                <MemberCard key={m.name} member={m} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
