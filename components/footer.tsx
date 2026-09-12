"use client";

import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer id="contact">
      <div className="footer-grid">
        <div className="footer-about">
          <Image src="/images/bhairavi-logo.webp" alt="Bhairavi Bhajans" width={100} height={48} />
          <p className="footer-tagline">
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
        <div className="footer-contact">
          <h3>Contact Us</h3>
          <ul className="contact-list">
            <li>
              <Phone size={15} /> <a href="tel:+918877001139">+91 88770 01139</a>
            </li>
            <li>
              <Phone size={15} /> <a href="tel:+917511110077">+91 75111 10077</a>
            </li>
            <li>
              <Mail size={15} /> <a href="mailto:bhairavimusicband@gmail.com">bhairavimusicband@gmail.com</a>
            </li>
            <li>
              <MapPin size={15} /> Kerala, India
            </li>
          </ul>
        </div>
        <div className="footer-newsletter">
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
