import Image from "next/image";
import type { Metadata } from "next";
import { Anton, Open_Sans } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Our Team | Bhairavi Bhajans",
  description: "Meet the vocalists, instrumentalists and technical team of Bhairavi Bhajans.",
};

// The brochure's two faces: a heavy condensed display for headings and
// names, and wide-tracked caps for the bios.
const display = Anton({ weight: "400", subsets: ["latin"], variable: "--team-display" });
const body = Open_Sans({ subsets: ["latin"], variable: "--team-body" });

interface Member {
  name: string;
  role?: string;
  bio: string;
  photo: string;
  width: number;
  height: number;
}

interface Section {
  title: string;
  members: Member[];
}

const photo = (file: string, width: number, height: number) => ({ photo: `/images/singers/${file}.png`, width, height });

// Photo sides alternate left, right, left… within each section, as in the
// brochure (pages 2–5).
const SECTIONS: Section[] = [
  {
    title: "Vocalists",
    members: [
      { name: "Aparna Surendran", bio: "Aparna is a native of Parappanangadi in Malappuram district. She is currently a final-year MA Music student at Chembai Music College.", ...photo("aparna", 432, 524) },
      { name: "Devika Suresh", bio: "Devika is a native of Kottakkal, Malappuram. She has been learning music from a very young age and completed her studies at Victoria College, Palakkad.", ...photo("devika", 457, 543) },
      { name: "Anagha", bio: "Anagha is a native of Cherpulassery in Palakkad district. She completed her MA Music from Chembai Music College, Palakkad.", ...photo("anagha", 503, 575) },
      { name: "Sudhishma", bio: "Sudhishma is a native of Kannur. She is currently a final-year MA Music student at Chembai Music College, Palakkad.", ...photo("sudhishma", 475, 602) },
      { name: "Anugama", bio: "Anugama is a native of Kannur. She is currently a final-year MA Music student at Chembai Music College, Palakkad.", ...photo("anugama", 483, 524) },
      { name: "Athmaja", bio: "Athmaja is a native of Kannur. She is currently a final-year MA Music student at Chembai Music College, Palakkad.", ...photo("aathmaja", 434, 532) },
      { name: "Krishna", bio: "Krishna is a native of Cherpulassery in Palakkad district. She completed her MA Music from Chembai Music College, Palakkad.", ...photo("krishna", 517, 567) },
      { name: "Arathy", bio: "Arathy is a native of Wayanad. She completed her BA Music at Chembai Music College, Palakkad, and is currently a final-year MA Music student at Kannur Music College.", ...photo("aarathi", 464, 605) },
    ],
  },
  {
    title: "Instrumentalists",
    members: [
      { name: "Anirudh", role: "Mridangam", bio: "Anirudh is a native of Tirur, Malappuram. He completed his BA Mridangam at Chembai Music College and is currently a final-year MA Mridangam student at Kerala Kalamandalam. In addition to mridangam, Anirudh is highly skilled in jazz drums, rhythm pad, tabla, and various other percussion instruments.", ...photo("anirudh", 475, 559) },
      { name: "Abhinav", role: "Rhythm Pad", bio: "Abhinav is a native of Tirur, Malappuram. After completing his B.Tech, he is currently working as a software engineer. Along with rhythm pad, he also plays tabla and jazz drums.", ...photo("abhinav", 525, 550) },
      { name: "Aadharsh", role: "Harmonium & Keyboard", bio: "Aadharsh is a native of Tirur, Malappuram. He is currently pursuing his B.Tech in Ernakulam. Aadharsh is also a talented singer and actor. He notably portrayed Mohanlal's younger character in the film Lucifer.", ...photo("adarsh", 625, 533) },
      { name: "Shijith", role: "Flute", bio: "Shijith is a native of Edappal in Malappuram district. Along with being a talented singer, he is also a studio recording artist.", ...photo("shijith", 449, 567) },
      { name: "Mridulrag", role: "Violin", bio: "Mridulrag is a native of Kannur. After completing his studies, he became a full-time violin artist and is also a member of several music bands.", ...photo("mridulrag", 498, 631) },
    ],
  },
  {
    title: "Our Technical Team",
    members: [
      { name: "Sandeep KS", bio: "Sandeep KS is the manager and sound engineer of Bhairavi Music Band.", ...photo("sandeep-ks", 733, 542) },
      { name: "Arun Jayaprakash", bio: "Arun Jayaprakash is the technical coordinator and photographer of Bhairavi Music Band.", ...photo("arun", 392, 575) },
      { name: "Ranjith", bio: "Ranjith VJ is the visual jockey of Bhairavi Music Band.", ...photo("ranjith-vj", 790, 680) },
    ],
  },
];

function MemberCard({ member, side }: { member: Member; side: "left" | "right" }) {
  return (
    // Photos with equipment beside the person are wider than tall; give them a
    // wider slot so they render at the same height as the portraits.
    <article className={`team-card photo-${side}${member.width > member.height * 1.1 ? " photo-wide" : ""}`}>
      <div className="team-card-photo">
        <Image
          src={member.photo}
          alt={member.name}
          width={member.width}
          height={member.height}
          sizes="(max-width: 700px) 40vw, 320px"
        />
      </div>
      <div className="team-card-text">
        <h3>
          {member.name}
          {member.role && (
            <span className="team-card-role">
              <span className="team-card-dash"> — </span>
              {member.role}
            </span>
          )}
        </h3>
        <p>{member.bio}</p>
      </div>
    </article>
  );
}

export default function OurTeamPage() {
  return (
    <>
      <Navbar active="Our Team" />
      <main className={`team-page ${display.variable} ${body.variable}`}>
        <div className="team-bg" aria-hidden="true" />
        <header className="team-header">
          <Image
            src="/images/bhairavi-logo.webp"
            alt="Bhairavi"
            width={512}
            height={256}
            priority
            className="team-logo"
          />
          <h1 className="sr-only">Our Team</h1>
          <p className="team-intro">
            Bhairavi Music Band was started five years ago by the undergraduate students of Chembai Memorial Government
            Music College. It has been one year since Bhairavi began focusing exclusively on bhajans. At present, the
            band performs only bhajans.
          </p>
        </header>

        {SECTIONS.map((section, s) => (
          <section key={section.title} className="team-section">
            {s > 0 && (
              <Image
                src="/images/bhairavi-logo.webp"
                alt=""
                width={256}
                height={128}
                className="team-logo team-logo-small"
              />
            )}
            <h2 className="team-section-title">{section.title}</h2>
            <div className="team-cards">
              {section.members.map((m, i) => (
                <MemberCard key={m.name} member={m} side={i % 2 === 0 ? "left" : "right"} />
              ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
