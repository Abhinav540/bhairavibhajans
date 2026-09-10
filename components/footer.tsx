"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { footerLinks } from "@/data/home";
import { getNavHref } from "./navbar";

export function Footer() {
  return (
    <footer id="contact">
      <div className="footer-grid">
        <div>
          <Image src="/images/bhairavi-logo.png" alt="Bhairavi Bhajans" width={100} height={48} />
          <p>
            Spreading devotion,<br />
            one bhajan at a time.
          </p>
          <div className="social" aria-label="Social Media Links">
            <a
              href="https://www.facebook.com/share/19iWo3DzjF/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              title="Facebook"
            >
              <Facebook size={16} />
            </a>
            <a
              href="https://www.instagram.com/_bhairavi_music_band_?igsi=eDc1cnk4eXNwODA0"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://youtube.com/@bhairavimusicband?si=bu1Vv6NjM6A99DvC"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              title="YouTube"
            >
              <Youtube size={16} />
            </a>
          </div>
        </div>
        <div>
          <h3>Quick Links</h3>
          <div className="quick-links">
            {footerLinks.map((link) => (
              <Link href={getNavHref(link)} key={link}>
                {link}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3>Contact Us</h3>
          <p>
            <Phone size={14} /> <a href="tel:+918877001139">+91 88770 01139</a>
          </p>
          <p>
            <Phone size={14} /> <a href="tel:+917511110077">+91 75111 10077</a>
          </p>
          <p>
            <Mail size={14} /> <a href="mailto:bhairavimusicband@gmail.com">bhairavimusicband@gmail.com</a>
          </p>
          <p>
            <MapPin size={14} /> Kerala, India
          </p>
        </div>
        <div>
          <h3>Newsletter</h3>
          <p>Subscribe to get updates about our programs and new bhajans.</p>
          <form onSubmit={(e) => e.preventDefault()}>
            <input aria-label="Your email" type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="copyright">© 2024 Bhairavi Bhajans. All Rights Reserved.</div>
    </footer>
  );
}
