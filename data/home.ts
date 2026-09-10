import { Album, CalendarDays, Images, Music2, Phone, PlaySquare } from "lucide-react";

export const navLinks = ["Home", "About Us"];

export const WHATSAPP_BOOKING_URL = "https://wa.me/918877001139?text=Hello%20Bhairavi%20Bhajans,%20I%20would%20like%20to%20book%20a%20program.";

export const discoveryLinks = [
  { title: "Upcoming Programs", text: "Check our schedule and join us live.", action: "View Programs", icon: CalendarDays },
  { title: "Bhajans & Albums", text: "Listen to our devotional albums.", action: "Explore Albums", icon: Music2 },
  { title: "Gallery", text: "Moments of devotion captured in pictures.", action: "View Gallery", icon: Images },
  { title: "Videos", text: "Watch our bhajan performances.", action: "Watch Now", icon: PlaySquare },
  { title: "Contact & Booking", text: "Invite Bhairavi Bhajans to your event.", action: "Contact Us", icon: Phone },
];

export const footerLinks = ["Home", "About Us", "Programs", "Gallery", "Videos", "Albums", "Contact"];
